import { Table } from '../entities/table.entity';

export const ITableRepositoryToken = 'ITableRepository';

export interface ITableRepository {
  save(table: Table): Promise<Table>;
  findById(tenantId: string, id: string): Promise<Table | null>;
  findAll(tenantId: string): Promise<Table[]>;
  delete(tenantId: string, id: string): Promise<void>;
}
