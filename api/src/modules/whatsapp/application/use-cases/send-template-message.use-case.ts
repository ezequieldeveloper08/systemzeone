import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';
import { ContactService } from '../../../crm/application/services/contact.service';

@Injectable()
export class SendTemplateMessageUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
    private readonly contactService: ContactService,
  ) {}

  async execute(
    tenantId: string,
    data: {
      recipientPhone: string;
      recipientName: string;
      templateName: string;
      variables: Record<string, string>;
      contactId?: string;
    },
  ): Promise<WhatsappLog> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    const template = await this.whatsappRepository.findTemplateByName(tenantId, data.templateName);
    if (!template) {
      throw new NotFoundException(`Template '${data.templateName}' não cadastrado.`);
    }

    // Send using Meta Cloud API
    const response = await this.metaWhatsappService.sendTemplateMessage(
      settings,
      data.recipientPhone,
      data.templateName,
      template.language,
      data.variables,
    );

    // Compile message body for local logs
    let bodyText = template.bodyText;
    for (const key of Object.keys(data.variables)) {
      const paramIndex = key.replace(/\D/g, '');
      bodyText = bodyText.replace(new RegExp(`\\{\\{${paramIndex}\\}\\}`, 'g'), data.variables[key]);
    }

    const log = new WhatsappLog(
      response.messageId || crypto.randomUUID(),
      tenantId,
      data.contactId || null,
      data.recipientName,
      data.recipientPhone,
      'outbound',
      'template',
      data.templateName,
      data.variables,
      bodyText,
      'sent',
      null,
      new Date(),
      new Date(),
    );

    // If the contact exists and status is NEW, change it to IN_SERVICE
    try {
      const contact = await this.contactService.findByPhone(tenantId, data.recipientPhone);
      if (contact && contact.status === 'NEW') {
        await this.contactService.update(tenantId, contact.id, { status: 'IN_SERVICE' });
      }
    } catch (err) {
      // Don't fail the template message if contact status update fails
    }

    return this.whatsappRepository.saveLog(log);
  }
}
