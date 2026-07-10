import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { ContactService } from '../../../crm/application/services/contact.service';

@Injectable()
export class PauseAiUseCase {
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
    }

    const normalizedPhone = this.contactService.normalizePhone(phone);

    if (!settings.aiPausedPhones.includes(normalizedPhone)) {
      settings.aiPausedPhones.push(normalizedPhone);
      await this.whatsappRepository.saveSettings(settings);
    }
  }
}
