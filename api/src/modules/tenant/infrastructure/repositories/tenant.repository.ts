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
    return new Tenant(
      orm.id,
      orm.name,
      orm.businessType,
      orm.createdAt,
      orm.updatedAt,
      orm.logo,
      orm.banner,
      orm.bio,
      orm.phone,
      orm.address,
      orm.openingHours,
      orm.instagram,
      orm.facebook,
    );
  }

  private toOrm(domain: Tenant): TenantOrmEntity {
    const orm = new TenantOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.businessType = domain.businessType;
    orm.logo = domain.logo;
    orm.banner = domain.banner;
    orm.bio = domain.bio;
    orm.phone = domain.phone;
    orm.address = domain.address;
    orm.openingHours = domain.openingHours;
    orm.instagram = domain.instagram;
    orm.facebook = domain.facebook;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const orm = this.toOrm(tenant);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async save(tenant: Tenant): Promise<Tenant> {
    return this.create(tenant);
  }

  async findById(id: string): Promise<Tenant | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByName(name: string): Promise<Tenant | null> {
    const orm = await this.ormRepository.findOneBy({ name });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const orms = await this.ormRepository.find();
    return orms.map((orm) => this.toDomain(orm));
  }
}
