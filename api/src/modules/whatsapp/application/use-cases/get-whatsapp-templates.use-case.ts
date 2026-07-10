import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappTemplate } from '../../domain/entities/whatsapp-template.entity';

@Injectable()
export class GetWhatsappTemplatesUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string): Promise<WhatsappTemplate[]> {
    let templates = await this.whatsappRepository.findTemplatesByTenantId(tenantId);
    
    if (templates.length === 0) {
      // Seed default marketing & utility templates
      const defaultTemplates = [
        new WhatsappTemplate(
          crypto.randomUUID(),
          tenantId,
          'boas_vindas',
          'MARKETING',
          'pt_BR',
          'APPROVED',
          'NONE',
          null,
          'Olá {{1}}! Seja bem-vindo à {{2}}. Vimos que você tem interesse no {{3}}. Podemos agendar uma visita?',
          null,
          [],
          ['nome_lead', 'concessionaria', 'veiculo'],
          new Date(),
          new Date(),
        ),
        new WhatsappTemplate(
          crypto.randomUUID(),
          tenantId,
          'confirmacao_testdrive',
          'UTILITY',
          'pt_BR',
          'APPROVED',
          'TEXT',
          'Test Drive Agendado 🚗',
          'Olá {{1}}! Confirmamos seu test drive do {{2}} para o dia {{3}} às {{4}} na {{5}}.',
          'Dúvidas? Entre em contato conosco.',
          [],
          ['nome_lead', 'veiculo', 'data', 'hora', 'concessionaria'],
          new Date(),
          new Date(),
        ),
      ];

      for (const t of defaultTemplates) {
        await this.whatsappRepository.saveTemplate(t);
      }
      templates = defaultTemplates;
    }

    return templates;
  }
}
