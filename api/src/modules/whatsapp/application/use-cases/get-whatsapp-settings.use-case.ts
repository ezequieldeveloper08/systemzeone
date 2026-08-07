import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappSettings } from '../../domain/entities/whatsapp-settings.entity';

@Injectable()
export class GetWhatsappSettingsUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string): Promise<WhatsappSettings> {
    let settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    
    if (!settings) {
      // Create default settings to avoid UI crash
      settings = new WhatsappSettings(
        crypto.randomUUID(),
        tenantId,
        '', // accessToken
        '', // phoneNumberId
        '', // businessAccountId
        '', // verifyToken
        'disconnected',
        new Date(),
        new Date(),
        false,
        '',
        'Você é um assistente virtual atencioso para nossa concessionária de veículos. Responda de forma profissional, simpática e prestativa.',
        'gemini-2.0-flash',
        [],
        [],
        null,
        null,
        null,
      );
      await this.whatsappRepository.saveSettings(settings);
    }

    return settings;
  }
}
