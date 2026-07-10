import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantOrmEntity } from './infrastructure/database/tenant.orm-entity';
import { TenantRepository } from './infrastructure/repositories/tenant.repository';
import { ITenantRepositoryToken } from './domain/repositories/tenant.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TenantOrmEntity])],
  providers: [
    {
      provide: ITenantRepositoryToken,
      useClass: TenantRepository,
    },
  ],
  exports: [ITenantRepositoryToken, TypeOrmModule],
})
export class TenantModule {}
