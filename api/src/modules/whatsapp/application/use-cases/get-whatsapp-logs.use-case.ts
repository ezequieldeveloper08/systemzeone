import { Inject, Injectable } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';

@Injectable()
export class GetWhatsappLogsUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string): Promise<WhatsappLog[]> {
    return this.whatsappRepository.findLogsByTenantId(tenantId);
  }
}
