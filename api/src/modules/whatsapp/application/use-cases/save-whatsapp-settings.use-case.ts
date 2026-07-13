import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappSettings } from '../../domain/entities/whatsapp-settings.entity';

@Injectable()
export class SaveWhatsappSettingsUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(
    tenantId: string,
    data: {
      accessToken: string;
      phoneNumberId: string;
      businessAccountId: string;
      webhookVerifyToken: string;
      aiEnabled?: boolean;
      aiApiKey?: string;
      aiAgentInstructions?: string;
      aiModel?: string;
      aiActiveTools?: string[];
    },
  ): Promise<WhatsappSettings> {
    let settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    
    const isMock = !data.accessToken || data.accessToken.startsWith('mock');

    if (settings) {
      settings.accessToken = data.accessToken;
      settings.phoneNumberId = data.phoneNumberId;
      settings.businessAccountId = data.businessAccountId;
      settings.webhookVerifyToken = data.webhookVerifyToken;
      settings.status = isMock ? 'disconnected' : 'connected';
      if (data.aiEnabled !== undefined) settings.aiEnabled = data.aiEnabled;
      if (data.aiApiKey !== undefined) settings.aiApiKey = data.aiApiKey;
      if (data.aiAgentInstructions !== undefined) settings.aiAgentInstructions = data.aiAgentInstructions;
      if (data.aiModel !== undefined) settings.aiModel = data.aiModel;
      if (data.aiActiveTools !== undefined) settings.aiActiveTools = data.aiActiveTools;
    } else {
      settings = new WhatsappSettings(
        crypto.randomUUID(),
        tenantId,
        data.accessToken,
        data.phoneNumberId,
        data.businessAccountId,
        data.webhookVerifyToken,
        isMock ? 'disconnected' : 'connected',
        new Date(),
        new Date(),
        data.aiEnabled || false,
        data.aiApiKey || '',
        data.aiAgentInstructions || 'Você é um assistente virtual atencioso para nossa concessionária de veículos. Responda de forma profissional, simpática e prestativa.',
        data.aiModel || 'gemini-2.0-flash',
        [],
        data.aiActiveTools || [],
      );
    }

    if (!isMock) {
      await this.whatsappRepository.deleteLogsByRecipientPhones(tenantId, [
        '5511987654321',
        '5562988882222',
      ]);
    }

    return this.whatsappRepository.saveSettings(settings);
  }
}
