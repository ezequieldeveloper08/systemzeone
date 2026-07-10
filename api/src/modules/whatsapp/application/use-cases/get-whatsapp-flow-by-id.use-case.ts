import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappFlow } from '../../domain/entities/whatsapp-flow.entity';

@Injectable()
export class GetWhatsappFlowByIdUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(id: string): Promise<WhatsappFlow> {
    const flow = await this.whatsappRepository.findFlowById(id);
    if (!flow) {
      throw new NotFoundException(`Flow com ID ${id} não encontrado.`);
    }
    return flow;
  }
}
