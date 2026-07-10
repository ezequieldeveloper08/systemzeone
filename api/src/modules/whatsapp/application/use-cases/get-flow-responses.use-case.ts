import { Inject, Injectable } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappFlowResponse } from '../../domain/entities/whatsapp-flow-response.entity';

@Injectable()
export class GetWhatsappFlowResponsesUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string, flowId?: string): Promise<WhatsappFlowResponse[]> {
    return this.whatsappRepository.findFlowResponses(tenantId, flowId);
  }
}
