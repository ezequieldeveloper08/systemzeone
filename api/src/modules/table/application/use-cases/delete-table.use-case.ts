import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITableRepositoryToken } from '../../domain/repositories/table.repository.interface';
import type { ITableRepository } from '../../domain/repositories/table.repository.interface';

@Injectable()
export class DeleteTableUseCase {
  constructor(
    @Inject(ITableRepositoryToken)
    private readonly tableRepository: ITableRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const table = await this.tableRepository.findById(tenantId, id);
    if (!table) throw new NotFoundException('Mesa não encontrada.');
    await this.tableRepository.delete(tenantId, id);
  }
}
