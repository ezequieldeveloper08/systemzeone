import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import { WhatsappFlow } from '../../domain/entities/whatsapp-flow.entity';
import * as crypto from 'crypto';

@Injectable()
export class SyncWhatsappFlowsUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(tenantId: string): Promise<WhatsappFlow[]> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    // 1. Fetch flows list from Meta API
    const metaFlows = await this.metaWhatsappService.fetchFlows(settings);

    // 2. Fetch all local flows to compare
    const localFlows = await this.whatsappRepository.findFlowsByTenantId(tenantId);

    // 3. Sync each flow
    for (const metaFlow of metaFlows) {
      const existingFlow = localFlows.find(lf => lf.flowId === metaFlow.id);
      
      // Convert Meta status (DRAFT, PUBLISHED, DEPRECATED) to lowercase
      let status: 'draft' | 'published' | 'deprecated' = 'draft';
      const metaStatus = (metaFlow.status || 'DRAFT').toLowerCase();
      if (metaStatus === 'published' || metaStatus === 'live') {
        status = 'published';
      } else if (metaStatus === 'deprecated') {
        status = 'deprecated';
      }

      // Convert Meta categories (e.g. LEAD_GENERATION) to lowercase
      const categories = (metaFlow.categories || []).map((c: string) => c.toLowerCase());

      if (existingFlow) {
        // Update existing local record
        existingFlow.name = metaFlow.name || existingFlow.name;
        existingFlow.status = status;
        existingFlow.categories = categories.length > 0 ? categories : existingFlow.categories;
        existingFlow.updatedAt = new Date();
        await this.whatsappRepository.saveFlow(existingFlow);
      } else {
        // Create new local record representing the Meta flow
        const newFlow = new WhatsappFlow(
          crypto.randomUUID(),
          tenantId,
          metaFlow.name || 'Fluxo Sincronizado',
          metaFlow.id, // Meta Flow ID
          status,
          categories.length > 0 ? categories : ['lead_generation'],
          {
            first_screen: {
              title: 'Dados Iniciais',
              fields: [
                { id: 'h1', type: 'TextHeading', label: 'Ficha de Cadastro' }
              ]
            }
          },
          new Date(),
          new Date(),
        );
        await this.whatsappRepository.saveFlow(newFlow);
      }
    }

    // 4. Return refreshed local flows list
    return this.whatsappRepository.findFlowsByTenantId(tenantId);
  }
}
