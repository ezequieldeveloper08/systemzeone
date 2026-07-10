import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByTenantId(
    tenantId: string,
    filters?: {
      type?: 'revenue' | 'expense';
      status?: 'pending' | 'paid';
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

export const ITransactionRepositoryToken = Symbol('ITransactionRepository');
