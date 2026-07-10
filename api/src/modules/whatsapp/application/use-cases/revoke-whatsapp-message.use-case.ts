import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';

@Injectable()
export class RevokeWhatsappMessageUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(tenantId: string, messageId: string): Promise<void> {
    const log = await this.whatsappRepository.findLogById(messageId);
    if (!log) {
      throw new NotFoundException('Mensagem não encontrada.');
    }

    if (log.tenantId !== tenantId) {
      throw new BadRequestException('Esta mensagem não pertence ao seu tenant.');
    }

    if (log.messageDirection !== 'outbound') {
      throw new BadRequestException('Não é possível revogar mensagens recebidas de clientes.');
    }

    if (log.variables && log.variables.isDeleted === 'true') {
      throw new BadRequestException('Esta mensagem já foi apagada.');
    }

    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (!settings) {
      throw new NotFoundException('Configurações de integração do WhatsApp não encontradas.');
    }

    // Call Meta API to revoke
    await this.metaWhatsappService.revokeMessage(settings, messageId);

    // Update local database log
    log.bodyText = 'Esta mensagem foi apagada.';
    log.variables = {
      ...(log.variables || {}),
      isDeleted: 'true',
    };

    await this.whatsappRepository.saveLog(log);
  }
}
