import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantOrmEntity } from '../database/tenant.orm-entity';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantOrmEntity)
    private readonly ormRepository: Repository<TenantOrmEntity>,
  ) {}

  private toDomain(orm: TenantOrmEntity): Tenant {
    return new Tenant(orm.id, orm.name, orm.createdAt, orm.updatedAt);
  }

  private toOrm(domain: Tenant): TenantOrmEntity {
    const orm = new TenantOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const orm = this.toOrm(tenant);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Tenant | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByName(name: string): Promise<Tenant | null> {
    const orm = await this.ormRepository.findOneBy({ name });
    return orm ? this.toDomain(orm) : null;
  }
}
