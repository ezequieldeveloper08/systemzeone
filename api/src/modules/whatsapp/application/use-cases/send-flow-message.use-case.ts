import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';

interface SendFlowMessageDto {
  recipientPhone: string;
  recipientName: string;
  flowId: string; // Internal flow UUID
  bodyText: string;
  flowCta: string;
  headerText?: string;
  footerText?: string;
}

@Injectable()
export class SendFlowMessageUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(tenantId: string, dto: SendFlowMessageDto): Promise<WhatsappLog> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações do WhatsApp não encontradas.');
    }

    const flow = await this.whatsappRepository.findFlowById(dto.flowId);
    if (!flow) {
      throw new NotFoundException('Fluxo (Flow) não encontrado.');
    }

    // Use the Meta Flow ID if available, otherwise use a mock/internal one
    const metaFlowId = flow.flowId || 'mock_flow_id_123';

    const response = await this.metaWhatsappService.sendFlowMessage(
      settings,
      dto.recipientPhone,
      metaFlowId,
      dto.flowCta || 'Abrir',
      dto.bodyText,
      dto.headerText,
      dto.footerText,
    );

    const log = new WhatsappLog(
      response.messageId || crypto.randomUUID(),
      tenantId,
      null,
      dto.recipientName,
      dto.recipientPhone,
      'outbound',
      'interactive',
      null,
      {
        flowId: dto.flowId,
        metaFlowId,
        flowCta: dto.flowCta,
      },
      `[Flow: ${flow.name}] ${dto.bodyText}`,
      'sent',
      null,
      new Date(),
      new Date(),
    );

    return this.whatsappRepository.saveLog(log);
  }
}
