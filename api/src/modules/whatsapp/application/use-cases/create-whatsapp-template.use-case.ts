import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import { WhatsappTemplate } from '../../domain/entities/whatsapp-template.entity';

@Injectable()
export class CreateWhatsappTemplateUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(
    tenantId: string,
    data: {
      name: string;
      category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
      language: string;
      bodyText: string;
      headerText?: string;
      footerText?: string;
    },
  ): Promise<WhatsappTemplate> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    // Call Meta API
    const metaResult = await this.metaWhatsappService.createTemplate(settings, data);

    // Parse variables
    const matches = data.bodyText.match(/\{\{\d+\}\}/g) || [];
    const variables = matches.map((m: string) => `param_${m.replace(/\D/g, '')}`);

    const template = new WhatsappTemplate(
      metaResult.id,
      tenantId,
      data.name,
      data.category,
      data.language || 'pt_BR',
      metaResult.status,
      data.headerText ? 'TEXT' : 'NONE',
      data.headerText || null,
      data.bodyText,
      data.footerText || null,
      [],
      variables,
      new Date(),
      new Date(),
    );

    return this.whatsappRepository.saveTemplate(template);
  }
}
