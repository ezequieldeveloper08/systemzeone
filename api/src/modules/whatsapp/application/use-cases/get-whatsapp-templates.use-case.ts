import { Inject, Injectable } from '@nestjs/common';
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
    return this.whatsappRepository.findTemplatesByTenantId(tenantId);
  }
}
