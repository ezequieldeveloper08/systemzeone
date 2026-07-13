import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantOrmEntity } from './infrastructure/database/tenant.orm-entity';
import { TenantRepository } from './infrastructure/repositories/tenant.repository';
import { ITenantRepositoryToken } from './domain/repositories/tenant.repository.interface';
import { UpdateTenantUseCase } from './application/use-cases/update-tenant.use-case';
import { TenantController } from './presentation/controllers/tenant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TenantOrmEntity])],
  controllers: [TenantController],
  providers: [
    {
      provide: ITenantRepositoryToken,
      useClass: TenantRepository,
    },
    UpdateTenantUseCase,
  ],
  exports: [ITenantRepositoryToken, TypeOrmModule, UpdateTenantUseCase],
})
export class TenantModule {}
