import { Inject, Injectable } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';

@Injectable()
export class GetChatMessagesUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string, phone: string): Promise<WhatsappLog[]> {
    const logs = await this.whatsappRepository.findLogsByRecipient(tenantId, phone);

    // Mark unread inbound messages as read
    for (const log of logs) {
      if (log.messageDirection === 'inbound' && log.status !== 'read') {
        log.status = 'read';
        await this.whatsappRepository.saveLog(log);
      }
    }

    return logs;
  }
}
