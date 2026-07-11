import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TableOrmEntity } from './infrastructure/database/table.orm-entity';
import { TableRepository } from './infrastructure/repositories/table.repository';
import { ITableRepositoryToken } from './domain/repositories/table.repository.interface';
import { CreateTableUseCase } from './application/use-cases/create-table.use-case';
import { ListTablesUseCase } from './application/use-cases/list-tables.use-case';
import { UpdateTableUseCase } from './application/use-cases/update-table.use-case';
import { DeleteTableUseCase } from './application/use-cases/delete-table.use-case';
import { TableController } from './presentation/controllers/table.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([TableOrmEntity]),
  ],
  providers: [
    {
      provide: ITableRepositoryToken,
      useClass: TableRepository,
    },
    CreateTableUseCase,
    ListTablesUseCase,
    UpdateTableUseCase,
    DeleteTableUseCase,
  ],
  controllers: [TableController],
  exports: [ITableRepositoryToken],
})
export class TableModule {}
