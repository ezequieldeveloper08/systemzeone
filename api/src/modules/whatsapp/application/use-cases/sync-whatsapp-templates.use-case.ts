import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import { WhatsappTemplate } from '../../domain/entities/whatsapp-template.entity';

@Injectable()
export class SyncWhatsappTemplatesUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(tenantId: string): Promise<WhatsappTemplate[]> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    const metaTemplates = await this.metaWhatsappService.fetchTemplates(settings);

    const updatedTemplates: WhatsappTemplate[] = [];

    for (const mt of metaTemplates) {
      // Find body component text
      const bodyComp = mt.components?.find((c: any) => c.type === 'BODY' || c.type === 'body');
      const bodyText = bodyComp?.text || '';

      // Find header component if text type
      const headerComp = mt.components?.find((c: any) => c.type === 'HEADER' || c.type === 'header');
      const headerType = headerComp?.format || 'NONE';
      const headerText = headerComp?.text || null;

      // Find footer
      const footerComp = mt.components?.find((c: any) => c.type === 'FOOTER' || c.type === 'footer');
      const footerText = footerComp?.text || null;

      // Extract variables in braces {{1}}, {{2}}...
      const matches = bodyText.match(/\{\{\d+\}\}/g) || [];
      const variables = matches.map((m: string) => `param_${m.replace(/\D/g, '')}`);

      let template = await this.whatsappRepository.findTemplateByName(tenantId, mt.name);

      if (template) {
        template.category = mt.category;
        template.language = mt.language;
        template.status = mt.status;
        template.headerType = headerType;
        template.headerText = headerText;
        template.bodyText = bodyText;
        template.footerText = footerText;
        template.buttons = mt.components?.filter((c: any) => c.type === 'BUTTONS' || c.type === 'buttons')?.[0]?.buttons || [];
        template.variables = variables;
      } else {
        template = new WhatsappTemplate(
          crypto.randomUUID(),
          tenantId,
          mt.name,
          mt.category,
          mt.language,
          mt.status,
          headerType,
          headerText,
          bodyText,
          footerText,
          mt.components?.filter((c: any) => c.type === 'BUTTONS' || c.type === 'buttons')?.[0]?.buttons || [],
          variables,
          new Date(),
          new Date(),
        );
      }

      const saved = await this.whatsappRepository.saveTemplate(template);
      updatedTemplates.push(saved);
    }

    const namesToKeep = metaTemplates.map((mt: any) => mt.name);
    await this.whatsappRepository.deleteTemplatesExcludingNames(tenantId, namesToKeep);

    return updatedTemplates;
  }
}
