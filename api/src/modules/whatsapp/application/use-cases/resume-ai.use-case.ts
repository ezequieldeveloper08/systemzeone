import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { ContactService } from '../../../crm/application/services/contact.service';

@Injectable()
export class ResumeAiUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly contactService: ContactService,
  ) {}

  async execute(tenantId: string, phone: string): Promise<void> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    if (!settings.aiPausedPhones) {
      settings.aiPausedPhones = [];
      return;
    }

    const variants = this.contactService.getPhoneVariants(phone);

    const initialLength = settings.aiPausedPhones.length;
    settings.aiPausedPhones = settings.aiPausedPhones.filter(p => !variants.includes(p));

    if (settings.aiPausedPhones.length !== initialLength) {
      await this.whatsappRepository.saveSettings(settings);
    }
  }
}
