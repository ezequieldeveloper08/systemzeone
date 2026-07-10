import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';
import { WhatsappFlowResponse } from '../../domain/entities/whatsapp-flow-response.entity';
import { SendFreeTextMessageUseCase } from './send-free-text-message.use-case';

import { ContactService } from '../../../crm/application/services/contact.service';
import { DealService } from '../../../crm/application/services/deal.service';
import { DealStatus } from '../../../crm/infrastructure/database/deal.orm-entity';

// Set path for self-contained ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Transcoding helper to guarantee standard Ogg/Opus container format
async function transcodeOggToOpus(filePath: string): Promise<void> {
  const tempPath = filePath + '.temp.ogg';
  fs.renameSync(filePath, tempPath);

  return new Promise<void>((resolve, reject) => {
    ffmpeg(tempPath)
      .audioCodec('libopus')
      .audioChannels(1)
      .audioFrequency(16000)
      .save(filePath)
      .on('end', () => {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {}
        resolve();
      })
      .on('error', (err) => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          fs.renameSync(tempPath, filePath);
        } catch (e) {}
        reject(err);
      });
  });
}

@Injectable()
export class HandleMetaWebhookUseCase {
  private readonly logger = new Logger(HandleMetaWebhookUseCase.name);

  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly sendFreeTextMessageUseCase: SendFreeTextMessageUseCase,
    private readonly contactService: ContactService,
    private readonly dealService: DealService,
  ) {}

  async execute(body: any): Promise<void> {
    if (!body || body.object !== 'whatsapp_business_account') {
      return;
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value || {};
        const metadata = value.metadata || {};
        const phoneNumberId = metadata.phone_number_id;

        // 1. Process Status Updates
        if (value.statuses && value.statuses.length > 0) {
          for (const statusObj of value.statuses) {
            const messageId = statusObj.id;
            const newStatus = statusObj.status; // sent, delivered, read, failed

            const log = await this.whatsappRepository.findLogById(messageId);
            if (log) {
              log.status = newStatus;
              if (newStatus === 'failed' && statusObj.errors && statusObj.errors.length > 0) {
                log.errorMessage = statusObj.errors[0].message || 'Erro no envio.';
              }
              await this.whatsappRepository.saveLog(log);
              this.logger.log(`Status da mensagem ${messageId} atualizado para ${newStatus}.`);
            }
          }
        }

        // 2. Process Inbound Messages
        if (value.messages && value.messages.length > 0) {
          // Route to correct tenant by phone_number_id
          const settings = await this.whatsappRepository.findSettingsByPhoneNumberId(phoneNumberId);
          if (!settings) {
            this.logger.warn(`Mensagem recebida no phone_number_id ${phoneNumberId} não pôde ser roteada: tenant não encontrado.`);
            continue;
          }

          const tenantId = settings.tenantId;

          for (const message of value.messages) {
            const fromPhone = message.from;
            const messageId = message.id;
            const messageType = message.type; // text, image, etc.
            
            // Find sender name from contacts
            const contact = value.contacts?.find((c: any) => c.wa_id === fromPhone);
            const senderName = contact?.profile?.name || fromPhone;

            // Find or create unified Contact
            const contactObj = await this.contactService.findOrCreateFromWhatsapp({
              tenantId,
              name: senderName,
              phone: fromPhone,
            });

            // Ensure contact has an active open deal in pipeline
            try {
              const contactDeals = await this.dealService.findAll(tenantId);
              const hasActiveDeal = contactDeals.some(
                (d) => d.contactId === contactObj.id && d.status === DealStatus.OPEN,
              );
              if (!hasActiveDeal) {
                await this.dealService.create(tenantId, {
                  contactId: contactObj.id,
                  title: `Oportunidade WhatsApp - ${contactObj.name}`,
                  description: 'Criado automaticamente pelo atendimento WhatsApp',
                  value: 0,
                });
                this.logger.log(`Nova oportunidade criada no pipeline para o contato ${contactObj.name}`);
              }
            } catch (err) {
              this.logger.error(`Erro ao verificar/criar oportunidade para contato ${contactObj.id}: ${err.message}`);
            }

            let bodyText = '';
            let dbMessageType: 'text' | 'template' | 'image' | 'document' | 'interactive' | 'audio' = 'text';
            let variables: Record<string, string> = {};

            if (messageType === 'text') {
              bodyText = message.text?.body || '';
              dbMessageType = 'text';
            } else if (messageType === 'button') {
              bodyText = message.button?.text || '';
              dbMessageType = 'text';
            } else if (messageType === 'interactive') {
              dbMessageType = 'interactive';
              const interactive = message.interactive || {};
              if (interactive.type === 'button_reply') {
                bodyText = interactive.button_reply?.title || '';
              } else if (interactive.type === 'list_reply') {
                bodyText = interactive.list_reply?.title || '';
                if (interactive.list_reply?.description) {
                  bodyText += ` (${interactive.list_reply.description})`;
                }
              } else if (interactive.type === 'nfm_reply') {
                const nfmReply = interactive.nfm_reply || {};
                variables = {
                  flowResponse: nfmReply.response_json || '{}',
                  flowName: nfmReply.name || 'Flow',
                };
                bodyText = `[Formulário Respondido: ${nfmReply.name || 'Flow'}]\n`;
                try {
                  const responseData = JSON.parse(nfmReply.response_json || '{}');
                  const lines: string[] = [];
                  for (const [key, val] of Object.entries(responseData)) {
                    if (key === 'flow_token') continue;
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    lines.push(`• ${label}: ${val}`);
                  }
                  if (lines.length > 0) {
                    bodyText += lines.join('\n');
                  } else {
                    bodyText += `Enviado com sucesso`;
                  }
                } catch (e) {
                  bodyText += `Respostas: ${nfmReply.response_json || 'Sem dados'}`;
                }

                // Save submission to whatsapp_flow_responses table so it appears in Flows dashboard tab
                let flowId = '';
                try {
                  const flows = await this.whatsappRepository.findFlowsByTenantId(tenantId);
                  const matchedFlow = flows.find(
                    f => f.name.toLowerCase() === (nfmReply.name || '').toLowerCase() || f.flowId === nfmReply.name
                  );
                  if (matchedFlow) {
                    flowId = matchedFlow.id;
                  } else if (flows.length > 0) {
                    flowId = flows[0].id;
                  }
                } catch (err) {
                  this.logger.error(`Erro ao buscar flow correspondente: ${err.message}`);
                }

                if (flowId) {
                  try {
                    const responseData = JSON.parse(nfmReply.response_json || '{}');
                    const { flow_token, ...cleanData } = responseData;
                    const flowResponse = new WhatsappFlowResponse(
                      crypto.randomUUID ? crypto.randomUUID() : `flow_resp_${Date.now()}`,
                      tenantId,
                      flowId,
                      fromPhone,
                      senderName,
                      cleanData,
                      new Date(),
                    );
                    await this.whatsappRepository.saveFlowResponse(flowResponse);
                    this.logger.log(`Resposta de nfm_reply salva em WhatsappFlowResponse.`);
                  } catch (e) {
                    this.logger.error(`Erro ao salvar WhatsappFlowResponse para nfm_reply: ${e.message}`);
                  }
                }
              } else {
                bodyText = `[Mensagem interativa: ${interactive.type || 'desconhecida'}]`;
              }
            } else if (messageType === 'image') {
              dbMessageType = 'image';
              bodyText = `[Imagem] ${message.image?.caption || ''}`;

              const mediaId = message.image?.id;
              if (mediaId) {
                const localUrl = await this.downloadAndSaveMetaMedia(
                  settings.accessToken,
                  mediaId,
                  'image',
                  message.image?.mime_type,
                );
                if (localUrl) {
                  variables = { imageUrl: localUrl, caption: message.image?.caption || '' };
                }
              }
            } else if (messageType === 'audio') {
              dbMessageType = 'audio';
              bodyText = `[Áudio]`;

              const mediaId = message.audio?.id;
              if (mediaId) {
                const localUrl = await this.downloadAndSaveMetaMedia(
                  settings.accessToken,
                  mediaId,
                  'audio',
                  message.audio?.mime_type,
                );
                if (localUrl) {
                  variables = { audioUrl: localUrl };
                }
              }
            } else {
              dbMessageType = 'document';
              bodyText = `[Mensagem tipo: ${messageType}]`;
            }

            const inboundLog = new WhatsappLog(
              messageId,
              tenantId,
              contactObj.id,
              senderName,
              fromPhone,
              'inbound',
              dbMessageType,
              null,
              variables,
              bodyText,
              'delivered',
              null,
              new Date(),
              new Date(),
            );

            await this.whatsappRepository.saveLog(inboundLog);
            this.logger.log(`Mensagem recebida de ${senderName} (${fromPhone}) salva para o tenant ${tenantId}.`);

            const phoneVariants = this.contactService.getPhoneVariants(fromPhone);
            const isPaused = settings.aiPausedPhones && settings.aiPausedPhones.some(
              (p: string) => phoneVariants.includes(p)
            );

            if (settings.aiEnabled && !isPaused && (dbMessageType === 'text' || dbMessageType === 'interactive')) {
              this.processAiResponse(settings, tenantId, fromPhone, senderName, bodyText)
                .catch(err => this.logger.error(`Erro assíncrono no agente de IA para ${fromPhone}: ${err.message}`));
            }
          }
        }
      }
    }
  }

  private async processAiResponse(
    settings: any,
    tenantId: string,
    fromPhone: string,
    senderName: string,
    userMessage: string,
  ): Promise<void> {
    try {
      if (!settings.aiApiKey) {
        this.logger.warn(`Agente de IA ativo, mas chave API do Gemini ausente para o tenant ${tenantId}.`);
        return;
      }

      // 1. Fetch recent logs for context (limit to last 15)
      const logs = await this.whatsappRepository.findLogsByRecipient(tenantId, fromPhone);
      const recentLogs = logs.slice(-15);

      // 2. Build system instructions and history
      const systemInstruction = settings.aiAgentInstructions || 
        'Você é um assistente virtual atencioso para nossa concessionária de veículos. Responda de forma profissional e prestativa.';
      
      const historyContext = recentLogs
        .map(log => {
          const speaker = log.messageDirection === 'inbound' ? 'Cliente' : 'Assistente';
          return `[${speaker}]: ${log.bodyText}`;
        })
        .join('\n');

      const prompt = `Instruções do Sistema:
${systemInstruction}

Histórico da Conversa:
${historyContext}

[Cliente]: ${userMessage}
[Assistente]:`;

      // 3. Request generation from Gemini API
      const model = settings.aiModel || 'gemini-2.0-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.aiApiKey}`;

      this.logger.log(`Solicitando resposta da IA (modelo: ${model}) para ${fromPhone}...`);

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro na API do Gemini: ${res.status} - ${errorText}`);
      }

      const resJson = await res.json();
      const aiReply = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiReply) {
        this.logger.warn(`API do Gemini retornou resposta vazia para ${fromPhone}.`);
        return;
      }

      this.logger.log(`Resposta da IA gerada com sucesso para ${fromPhone}: "${aiReply.substring(0, 50)}..."`);

      // 4. Send the message back via SendFreeTextMessageUseCase
      await this.sendFreeTextMessageUseCase.execute(tenantId, {
        recipientPhone: fromPhone,
        recipientName: senderName,
        bodyText: aiReply,
        isAi: true,
      });

    } catch (err) {
      this.logger.error(`Erro ao processar resposta da IA para ${fromPhone}: ${err.message}`);
    }
  }

  private async downloadAndSaveMetaMedia(
    accessToken: string,
    mediaId: string,
    mediaType: 'image' | 'audio',
    mimeType?: string,
  ): Promise<string | null> {
    try {
      // 1. Get media URL metadata from Facebook Graph API
      const graphUrl = `https://graph.facebook.com/v17.0/${mediaId}`;
      const metadataRes = await fetch(graphUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!metadataRes.ok) {
        const errBody = await metadataRes.text();
        this.logger.error(`Erro ao buscar metadados de mídia ${mediaId}: ${errBody}`);
        return null;
      }

      const metadata = await metadataRes.json();
      const downloadUrl = metadata.url;
      const actualMimeType = metadata.mime_type || mimeType || '';

      // 2. Download the binary stream from the URL
      const mediaRes = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!mediaRes.ok) {
        this.logger.error(`Erro ao baixar bytes da mídia ${mediaId}`);
        return null;
      }

      const buffer = await mediaRes.arrayBuffer();

      // 3. Determine file extension
      let ext = '.bin';
      if (actualMimeType.includes('ogg')) {
        ext = '.ogg';
      } else if (actualMimeType.includes('mpeg') || actualMimeType.includes('mp3')) {
        ext = '.mp3';
      } else if (actualMimeType.includes('wav')) {
        ext = '.wav';
      } else if (actualMimeType.includes('jpeg') || actualMimeType.includes('jpg')) {
        ext = '.jpg';
      } else if (actualMimeType.includes('png')) {
        ext = '.png';
      } else if (actualMimeType.includes('webm')) {
        ext = '.webm';
      }

      // 4. Save to uploads directory
      const uploadPath = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filename = `${crypto.randomUUID()}${ext}`;
      const filePath = join(uploadPath, filename);
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // 5. If it's ogg/webm audio, we transcode it to valid OGG/Opus for consistency
      if (mediaType === 'audio' && ext === '.ogg') {
        try {
          await transcodeOggToOpus(filePath);
        } catch (e) {
          this.logger.error(`Falha ao transcodificar áudio recebido: ${e.message}`);
        }
      }

      // 6. Resolve base API URL (ngrok public url or localhost fallback)
      let apiBaseUrl = 'http://localhost:3001';
      try {
        const tunnelRes = await fetch('http://127.0.0.1:4040/api/tunnels');
        if (tunnelRes.ok) {
          const tunnelsData = await tunnelRes.json();
          const activeTunnel = tunnelsData.tunnels?.find((t: any) => t.config?.addr?.includes('3001'));
          if (activeTunnel?.public_url) {
            apiBaseUrl = activeTunnel.public_url;
          }
        }
      } catch (e) {
        this.logger.warn(`Não foi possível detectar túnel ngrok no webhook: ${e.message}`);
      }

      const fileUrl = `${apiBaseUrl}/uploads/${filename}`;
      this.logger.log(`Mídia baixada da Meta e salva localmente: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`Falha ao baixar mídia ${mediaId} da Meta: ${error.message}`);
      return null;
    }
  }
}
