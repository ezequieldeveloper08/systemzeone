import { Inject, Injectable } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappFlow } from '../../domain/entities/whatsapp-flow.entity';

@Injectable()
export class GetWhatsappFlowsUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string): Promise<WhatsappFlow[]> {
    return this.whatsappRepository.findFlowsByTenantId(tenantId);
  }
}
