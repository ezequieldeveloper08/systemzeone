import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';
import { ContactService } from '../../../crm/application/services/contact.service';

import { RealTimeService } from '../../../realtime/realtime.service';

@Injectable()
export class SendFreeTextMessageUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
    private readonly contactService: ContactService,
    private readonly realTimeService: RealTimeService,
  ) {}

  async execute(
    tenantId: string,
    data: {
      recipientPhone: string;
      recipientName: string;
      bodyText?: string;
      contactId?: string;
      type?: 'text' | 'image' | 'interactive' | 'audio';
      imageUrl?: string;
      interactiveType?: 'cta_url' | 'list' | 'button';
      interactiveData?: any;
      isAi?: boolean;
      channel?: 'whatsapp' | 'instagram' | 'facebook';
    },
  ): Promise<WhatsappLog> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    // Automatically pause AI responses if a human agent manually replies
    if (settings.aiEnabled && !data.isAi) {
      if (!settings.aiPausedPhones) {
        settings.aiPausedPhones = [];
      }
      const normalizedPhone = this.contactService.normalizePhone(data.recipientPhone);
      if (!settings.aiPausedPhones.includes(normalizedPhone)) {
        settings.aiPausedPhones.push(normalizedPhone);
        await this.whatsappRepository.saveSettings(settings);
      }
    }

    // Resolve base API URL (ngrok public url or localhost fallback) for outbound media attachments
    let metaImageUrl = data.imageUrl;
    if (metaImageUrl && (metaImageUrl.includes('localhost') || metaImageUrl.includes('127.0.0.1'))) {
      try {
        const tunnelRes = await fetch('http://127.0.0.1:4040/api/tunnels');
        if (tunnelRes.ok) {
          const tunnelsData = await tunnelRes.json();
          const activeTunnel = tunnelsData.tunnels?.find((t: any) => t.config?.addr?.includes('3001'));
          if (activeTunnel?.public_url) {
            const parsedUrl = new URL(metaImageUrl);
            metaImageUrl = `${activeTunnel.public_url}${parsedUrl.pathname}${parsedUrl.search}`;
          }
        }
      } catch (e) {
        // Silent catch
      }
    }

    let response: { messageId: string };
    const messageType = data.type || 'text';
    let logBodyText = data.bodyText || '';
    const channel = data.channel || 'whatsapp';

    if (channel === 'facebook') {
      response = await this.metaWhatsappService.sendFacebookMessage(
        settings,
        data.recipientPhone,
        data.bodyText || '',
        messageType,
        metaImageUrl,
      );
      if (messageType === 'image') {
        logBodyText = `[Imagem] ${data.bodyText || data.imageUrl || ''}`;
      } else if (messageType === 'audio') {
        logBodyText = `[Áudio]`;
      }
    } else if (channel === 'instagram') {
      response = await this.metaWhatsappService.sendInstagramMessage(
        settings,
        data.recipientPhone,
        data.bodyText || '',
        messageType,
        metaImageUrl,
      );
      if (messageType === 'image') {
        logBodyText = `[Imagem] ${data.bodyText || data.imageUrl || ''}`;
      } else if (messageType === 'audio') {
        logBodyText = `[Áudio]`;
      }
    } else if (messageType === 'image') {
      response = await this.metaWhatsappService.sendImageMessage(
        settings,
        data.recipientPhone,
        metaImageUrl || '',
        data.bodyText || '',
      );
      logBodyText = `[Imagem] ${data.bodyText || data.imageUrl || ''}`;
    } else if (messageType === 'audio') {
      response = await this.metaWhatsappService.sendAudioMessage(
        settings,
        data.recipientPhone,
        metaImageUrl || '',
      );
      logBodyText = `[Áudio]`;
    } else if (messageType === 'interactive') {
      response = await this.metaWhatsappService.sendInteractiveMessage(
        settings,
        data.recipientPhone,
        data.interactiveType || 'button',
        data.interactiveData,
      );
      
      const intType = data.interactiveType;
      const intData = data.interactiveData || {};
      if (intType === 'cta_url') {
        logBodyText = `[Botão Link] ${intData.bodyText}\nBotão: ${intData.buttonLabel}\nLink: ${intData.url}`;
      } else if (intType === 'list') {
        const optionTitles = (intData.sections || []).flatMap((s: any) => (s.rows || []).map((r: any) => r.title)).join(', ');
        logBodyText = `[Lista] ${intData.bodyText}\nBotão: ${intData.buttonLabel}\nOpções: ${optionTitles}`;
      } else {
        const btnTitles = (intData.buttons || []).map((b: any) => b.title).join(' | ');
        logBodyText = `[Botões] ${intData.bodyText}\nOpções: ${btnTitles}`;
      }
    } else {
      response = await this.metaWhatsappService.sendFreeTextMessage(
        settings,
        data.recipientPhone,
        data.bodyText || '',
      );
    }

    const logVariables: Record<string, string> = {};
    if (data.isAi) {
      logVariables.sentBy = 'ai';
    }
    if (messageType === 'image') {
      logVariables.imageUrl = data.imageUrl || '';
      logVariables.caption = data.bodyText || '';
    } else if (messageType === 'audio') {
      logVariables.audioUrl = data.imageUrl || '';
    } else if (messageType === 'interactive') {
      logVariables.interactiveType = data.interactiveType || '';
      logVariables.interactiveData = JSON.stringify(data.interactiveData || {});
    }

    const log = new WhatsappLog(
      response.messageId || crypto.randomUUID(),
      tenantId,
      data.contactId || null,
      data.recipientName,
      data.recipientPhone,
      'outbound',
      messageType,
      null,
      logVariables,
      logBodyText,
      'sent',
      null,
      new Date(),
      new Date(),
      channel,
    );

    // If the contact exists and status is NEW, change it to IN_SERVICE
    try {
      const contact = await this.contactService.findByPhone(tenantId, data.recipientPhone);
      if (contact && contact.status === 'NEW') {
        await this.contactService.update(tenantId, contact.id, { status: 'IN_SERVICE' });
      }
    } catch (err) {
      // Don't fail the message if contact status update fails
    }

    const saved = await this.whatsappRepository.saveLog(log);
    this.realTimeService.emitToTenant(tenantId, 'whatsapp-message', saved);
    return saved;
  }
}
