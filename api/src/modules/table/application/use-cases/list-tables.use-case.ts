import { Inject, Injectable } from '@nestjs/common';
import { ITableRepositoryToken } from '../../domain/repositories/table.repository.interface';
import type { ITableRepository } from '../../domain/repositories/table.repository.interface';
import { Table } from '../../domain/entities/table.entity';

@Injectable()
export class ListTablesUseCase {
  constructor(
    @Inject(ITableRepositoryToken)
    private readonly tableRepository: ITableRepository,
  ) {}

  async execute(tenantId: string): Promise<Table[]> {
    return this.tableRepository.findAll(tenantId);
  }
}
