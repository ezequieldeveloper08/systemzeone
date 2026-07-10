import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';

@Injectable()
export class DeleteWhatsappTemplateUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(tenantId: string, templateId: string): Promise<void> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    const templates = await this.whatsappRepository.findTemplatesByTenantId(tenantId);
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new NotFoundException('Template não encontrado.');
    }

    // Delete template from Meta API
    await this.metaWhatsappService.deleteTemplate(settings, template.name);

    // Delete template from local repository
    await this.whatsappRepository.deleteTemplate(templateId);
  }
}
