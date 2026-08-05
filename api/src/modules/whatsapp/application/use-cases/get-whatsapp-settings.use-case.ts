import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappSettings } from '../../domain/entities/whatsapp-settings.entity';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';

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
        'mock-meta-access-token-123456',
        'mock-phone-number-id-789',
        'mock-business-account-id-012',
        'mock-verify-token-xyz',
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

    const isMock = !settings.accessToken ||
      settings.accessToken.startsWith('mock') ||
      settings.phoneNumberId.startsWith('mock') ||
      settings.businessAccountId.startsWith('mock');

    if (isMock) {
      // Seed default chat history logs if database is empty for this tenant
      const logs = await this.whatsappRepository.findLogsByTenantId(tenantId);
      if (logs.length === 0) {
        const defaultLogs = [
          new WhatsappLog(
            crypto.randomUUID(),
            tenantId,
            null,
            'Mariana Costa',
            '5511987654321',
            'inbound',
            'text',
            null,
            {},
            'Bom dia! Vi o anúncio de vocês e fiquei interessada no Corolla.',
            'read',
            null,
            new Date(Date.now() - 3600000 * 2), // 2 hours ago
            new Date(Date.now() - 3600000 * 2),
          ),
          new WhatsappLog(
            crypto.randomUUID(),
            tenantId,
            null,
            'Mariana Costa',
            '5511987654321',
            'outbound',
            'text',
            null,
            {},
            'Bom dia, Mariana! Que ótimo. O Corolla XEI 2023 está disponível para test-drive na nossa loja.',
            'read',
            null,
            new Date(Date.now() - 3600000 * 1.8),
            new Date(Date.now() - 3600000 * 1.8),
          ),
          new WhatsappLog(
            crypto.randomUUID(),
            tenantId,
            null,
            'Mariana Costa',
            '5511987654321',
            'inbound',
            'text',
            null,
            {},
            'Legal! E qual o valor dele à vista?',
            'delivered',
            null,
            new Date(Date.now() - 3600000 * 1.5),
            new Date(Date.now() - 3600000 * 1.5),
          ),
          new WhatsappLog(
            crypto.randomUUID(),
            tenantId,
            null,
            'João Pereira',
            '5562988882222',
            'inbound',
            'text',
            null,
            {},
            'Olá, gostaria de saber se vocês aceitam carro usado na troca do Honda Civic.',
            'read',
            null,
            new Date(Date.now() - 3600000 * 4), // 4 hours ago
            new Date(Date.now() - 3600000 * 4),
          ),
          new WhatsappLog(
            crypto.randomUUID(),
            tenantId,
            null,
            'João Pereira',
            '5562988882222',
            'outbound',
            'text',
            null,
            {},
            'Olá João! Aceitamos sim, com uma das melhores avaliações do mercado. Qual seria o modelo, ano e quilometragem do seu usado?',
            'read',
            null,
            new Date(Date.now() - 3600000 * 3.8),
            new Date(Date.now() - 3600000 * 3.8),
          ),
        ];

        for (const log of defaultLogs) {
          await this.whatsappRepository.saveLog(log);
        }
      }
    }

    return settings;
  }
}
