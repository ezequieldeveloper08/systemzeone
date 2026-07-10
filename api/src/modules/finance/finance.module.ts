import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { TransactionOrmEntity } from './infrastructure/database/transaction.orm-entity';
import { TransactionRepository } from './infrastructure/repositories/transaction.repository';
import { ITransactionRepositoryToken } from './domain/repositories/transaction.repository.interface';
import { FinanceController } from './presentation/controllers/finance.controller';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    TypeOrmModule.forFeature([TransactionOrmEntity]),
  ],
  providers: [
    {
      provide: ITransactionRepositoryToken,
      useClass: TransactionRepository,
    },
  ],
  controllers: [FinanceController],
  exports: [ITransactionRepositoryToken],
})
export class FinanceModule {}
