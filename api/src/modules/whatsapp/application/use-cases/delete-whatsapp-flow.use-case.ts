import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';

@Injectable()
export class DeleteWhatsappFlowUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(id: string): Promise<void> {
    const flow = await this.whatsappRepository.findFlowById(id);
    if (!flow) {
      throw new NotFoundException(`Flow com ID ${id} não encontrado.`);
    }

    // Attempt to delete or deprecate the flow from Meta console if settings are set
    const settings = await this.whatsappRepository.findSettingsByTenantId(flow.tenantId);
    if (settings && flow.flowId) {
      try {
        const isPublished = flow.status === 'published';
        await this.metaWhatsappService.deleteFlow(settings, flow.flowId, isPublished);
      } catch (metaError) {
        console.error('Falha ao remover/depreciar o fluxo na Meta API:', metaError);
      }
    }

    await this.whatsappRepository.deleteFlow(id);
  }
}
