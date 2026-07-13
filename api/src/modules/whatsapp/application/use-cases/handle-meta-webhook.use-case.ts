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

import { IVehicleRepositoryToken } from '../../../vehicle/domain/repositories/vehicle.repository.interface';
import type { IVehicleRepository } from '../../../vehicle/domain/repositories/vehicle.repository.interface';
import { IPropertyRepositoryToken } from '../../../real-estate/domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../../real-estate/domain/repositories/property.repository.interface';
import { IMenuItemRepositoryToken } from '../../../menu/domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../../menu/domain/repositories/menu-item.repository.interface';
import { IOrderRepositoryToken } from '../../../order/domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../../order/domain/repositories/order.repository.interface';
import { Order } from '../../../order/domain/entities/order.entity';

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

import { RealTimeService } from '../../../realtime/realtime.service';

@Injectable()
export class HandleMetaWebhookUseCase {
  private readonly logger = new Logger(HandleMetaWebhookUseCase.name);

  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly sendFreeTextMessageUseCase: SendFreeTextMessageUseCase,
    private readonly contactService: ContactService,
    private readonly dealService: DealService,
    private readonly realTimeService: RealTimeService,
    @Inject(IVehicleRepositoryToken)
    private readonly vehicleRepository: IVehicleRepository,
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(IMenuItemRepositoryToken)
    private readonly menuItemRepository: IMenuItemRepository,
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
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

            const savedLog = await this.whatsappRepository.saveLog(inboundLog);
            this.realTimeService.emitToTenant(tenantId, 'whatsapp-message', savedLog);
            this.logger.log(`Mensagem recebida de ${senderName} (${fromPhone}) salva para o tenant ${tenantId}.`);

            const phoneVariants = this.contactService.getPhoneVariants(fromPhone);
            const isPaused = settings.aiPausedPhones && settings.aiPausedPhones.some(
              (p: string) => phoneVariants.includes(p)
            );

            if (settings.aiEnabled && !isPaused && (dbMessageType === 'text' || dbMessageType === 'interactive')) {
              this.processAiResponse(settings, tenantId, fromPhone, senderName, bodyText, contactObj.id)
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
    contactId: string,
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

      const toolsList: any[] = [];
      const activeTools = settings.aiActiveTools || [];
      const businessType = (settings as any).businessType || 'crm_only';

      if (activeTools.includes('buscarVeiculosEstoque') && businessType === 'veiculos') {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'buscarVeiculosEstoque',
              description: 'Busca veículos no estoque da concessionária por marca, modelo, ano ou preço.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  brand: { type: 'STRING', description: 'Marca do veículo (ex: Toyota, Honda)' },
                  model: { type: 'STRING', description: 'Modelo ou palavra-chave (ex: Corolla, Civic)' },
                  priceMax: { type: 'NUMBER', description: 'Preço máximo em reais (ex: 150000)' },
                },
              },
            },
          ],
        });
      }

      if (activeTools.includes('consultarTabelaFipe') && businessType === 'veiculos') {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'consultarTabelaFipe',
              description: 'Busca a estimativa de preço de um carro na tabela FIPE de forma fictícia/referencial.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  model: { type: 'STRING', description: 'Modelo do veículo (ex: Corolla 2.0 2022)' },
                },
                required: ['model'],
              },
            },
          ],
        });
      }

      if (activeTools.includes('buscarImoveisCatalogo') && businessType === 'imoveis') {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'buscarImoveisCatalogo',
              description: 'Busca imóveis para alugar ou vender no catálogo da imobiliária.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  type: { type: 'STRING', description: 'Tipo do imóvel: casa, apartamento' },
                  purpose: { type: 'STRING', description: 'Finalidade: aluguel, venda' },
                  priceMax: { type: 'NUMBER', description: 'Valor máximo em reais' },
                },
              },
            },
          ],
        });
      }

      if (activeTools.includes('consultarCardapio') && businessType === 'menu') {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'consultarCardapio',
              description: 'Busca os pratos e bebidas disponíveis no cardápio do restaurante.',
              parameters: {
                type: 'OBJECT',
                properties: {},
              },
            },
          ],
        });
      }

      if (activeTools.includes('criarPedido') && businessType === 'menu') {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'criarPedido',
              description: 'Registra um pré-pedido para o cliente no sistema do restaurante.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  deliveryType: { type: 'STRING', description: 'Tipo do pedido: delivery, takeaway, table' },
                  tableNumber: { type: 'STRING', description: 'Número da mesa (se for do tipo table)' },
                  itemsDescription: { type: 'STRING', description: 'Descrição dos itens pedidos (ex: 2 pizzas)' },
                  totalPrice: { type: 'NUMBER', description: 'Valor total aproximado em reais' },
                },
                required: ['deliveryType', 'itemsDescription', 'totalPrice'],
              },
            },
          ],
        });
      }

      if (activeTools.includes('agendarCompromisso')) {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'agendarCompromisso',
              description: 'Agenda um test-drive, visita a imóvel, ou compromisso geral para o cliente.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING', description: 'Título do compromisso (ex: Test drive Civic)' },
                  dateStr: { type: 'STRING', description: 'Data e hora do compromisso (ex: 15/07 às 14:00)' },
                },
                required: ['title', 'dateStr'],
              },
            },
          ],
        });
      }

      if (activeTools.includes('atualizarDadosLead')) {
        toolsList.push({
          functionDeclarations: [
            {
              name: 'atualizarDadosLead',
              description: 'Atualiza informações cadastrais do cliente no banco de dados CRM (ex: e-mail ou observações adicionais).',
              parameters: {
                type: 'OBJECT',
                properties: {
                  email: { type: 'STRING', description: 'E-mail do cliente' },
                  notes: { type: 'STRING', description: 'Observações de interesse coletadas' },
                },
              },
            },
          ],
        });
      }

      const requestBody: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      };

      if (toolsList.length > 0) {
        requestBody.tools = toolsList;
      }

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro na API do Gemini: ${res.status} - ${errorText}`);
      }

      const resJson = await res.json();
      let aiReply = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const functionCall = resJson.candidates?.[0]?.content?.parts?.[0]?.functionCall;

      if (functionCall) {
        this.logger.log(`Gemini solicitou chamada de ferramenta: ${functionCall.name} com args: ${JSON.stringify(functionCall.args)}`);
        let functionResult = {};
        
        try {
          if (functionCall.name === 'buscarVeiculosEstoque') {
            const args = functionCall.args || {};
            const list = await this.vehicleRepository.findAll(tenantId);
            const filtered = list.filter(v => {
              if (args.brand && !v.brand.toLowerCase().includes(args.brand.toLowerCase())) return false;
              if (args.model && !v.model.toLowerCase().includes(args.model.toLowerCase())) return false;
              if (args.priceMax && v.price > args.priceMax) return false;
              return true;
            });
            functionResult = { vehicles: filtered.map(v => ({ brand: v.brand, model: v.model, year: v.year, price: v.price, color: v.color })) };
          } else if (functionCall.name === 'consultarTabelaFipe') {
            const args = functionCall.args || {};
            functionResult = { model: args.model, fipePrice: 'R$ 115.000,00' };
          } else if (functionCall.name === 'buscarImoveisCatalogo') {
            const args = functionCall.args || {};
            const list = await this.propertyRepository.findAll(tenantId);
            const filtered = list.filter(p => {
              if (args.type && !p.type.toLowerCase().includes(args.type.toLowerCase())) return false;
              if (args.purpose && !p.status.toLowerCase().includes(args.purpose.toLowerCase())) return false;
              if (args.priceMax && p.price > args.priceMax) return false;
              return true;
            });
            functionResult = { properties: filtered.map(p => ({ title: p.title, type: p.type, price: p.price, status: p.status })) };
          } else if (functionCall.name === 'consultarCardapio') {
            const list = await this.menuItemRepository.findAll(tenantId);
            functionResult = { menu: list.map(item => ({ name: item.name, price: (item.variations?.[0]?.price) || 0, description: item.description })) };
          } else if (functionCall.name === 'criarPedido') {
            const args = functionCall.args || {};
            const order = new Order(
              crypto.randomUUID ? crypto.randomUUID() : `order_${Date.now()}`,
              tenantId,
              senderName,
              fromPhone,
              args.deliveryType,
              args.deliveryType === 'delivery' ? 'Endereço fornecido pelo cliente' : null,
              args.deliveryType === 'table' ? (args.tableNumber || '1') : null,
              args.totalPrice,
              'pending',
              [{ name: args.itemsDescription, quantity: 1, price: args.totalPrice }],
              'WhatsApp Pay / Cartão na entrega',
              new Date(),
              new Date(),
            );
            const savedOrder = await this.orderRepository.save(order);
            this.realTimeService.emitToTenant(tenantId, 'order-created', savedOrder);
            functionResult = { status: 'success', message: 'Pedido pré-registrado no painel do restaurante.', orderId: savedOrder.id };
          } else if (functionCall.name === 'agendarCompromisso') {
            const args = functionCall.args || {};
            const contactDeals = await this.dealService.findAll(tenantId);
            const openDeal = contactDeals.find(
              (d) => d.contactId === contactId && d.status === DealStatus.OPEN,
            );
            if (openDeal) {
              await this.dealService.update(tenantId, openDeal.id, {
                description: `${openDeal.description || ''}\n[Compromisso Agendado]: ${args.title} em ${args.dateStr}`,
              });
            } else {
              await this.dealService.create(tenantId, {
                contactId,
                title: args.title,
                description: `Compromisso Agendado: ${args.title} em ${args.dateStr}`,
              });
            }
            functionResult = { status: 'success', message: `Compromisso "${args.title}" agendado com sucesso para ${args.dateStr}.` };
          } else if (functionCall.name === 'atualizarDadosLead') {
            const args = functionCall.args || {};
            await this.contactService.update(tenantId, contactId, {
              email: args.email,
              notes: args.notes,
            });
            functionResult = { status: 'success', message: 'Dados cadastrais do lead atualizados com sucesso.' };
          }
        } catch (fErr) {
          this.logger.error(`Erro ao rodar ferramenta local ${functionCall.name}: ${fErr.message}`);
          functionResult = { error: fErr.message };
        }

        this.logger.log(`Retornando resposta da ferramenta para o Gemini...`);
        const secondRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              },
              {
                role: 'model',
                parts: [{ functionCall }]
              },
              {
                role: 'user',
                parts: [
                  {
                    functionResponse: {
                      name: functionCall.name,
                      response: functionResult
                    }
                  }
                ]
              }
            ]
          })
        });

        if (!secondRes.ok) {
          const errorText = await secondRes.text();
          throw new Error(`Erro na API do Gemini após chamada de ferramenta: ${secondRes.status} - ${errorText}`);
        }

        const secondResJson = await secondRes.json();
        aiReply = secondResJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      }

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
      
      try {
        const errorLog = new WhatsappLog(
          crypto.randomUUID ? crypto.randomUUID() : `wamid.err_${Date.now()}`,
          tenantId,
          contactId,
          senderName,
          fromPhone,
          'outbound',
          'text',
          null,
          { sentBy: 'ai', error: 'true' },
          'Erro ao processar resposta da IA: ' + err.message,
          'failed',
          err.message,
          new Date(),
          new Date(),
        );
        const savedErrorLog = await this.whatsappRepository.saveLog(errorLog);
        this.realTimeService.emitToTenant(tenantId, 'whatsapp-message', savedErrorLog);
      } catch (saveErr) {
        this.logger.error(`Erro ao salvar log de erro da IA no banco: ${saveErr.message}`);
      }
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
