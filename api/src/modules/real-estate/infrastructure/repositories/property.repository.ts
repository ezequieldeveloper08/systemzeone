import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property, PropertyType, PropertyPurpose, PropertyStatus, FurnishingType } from '../../domain/entities/property.entity';
import { PropertyOrmEntity } from '../database/property.orm-entity';

@Injectable()
export class PropertyRepository implements IPropertyRepository {
  constructor(
    @InjectRepository(PropertyOrmEntity)
    private readonly ormRepository: Repository<PropertyOrmEntity>,
  ) {}

  private toDomain(orm: PropertyOrmEntity): Property {
    const domain = new Property();
    domain.id = orm.id;
    domain.tenantId = orm.tenantId;
    domain.code = orm.code || undefined;
    domain.title = orm.title;
    domain.description = orm.description || undefined;
    domain.slug = orm.slug || undefined;
    domain.type = orm.type as PropertyType;
    domain.purpose = orm.purpose as PropertyPurpose;
    domain.status = orm.status as PropertyStatus;
    domain.address = orm.address;
    domain.area = orm.area;
    domain.rooms = orm.rooms;
    domain.details = orm.details ? {
      ...orm.details,
      furnishing: orm.details.furnishing as FurnishingType
    } : orm.details;
    domain.pricing = orm.pricing;
    domain.features = orm.features;
    domain.condominium = orm.condominium || undefined;
    domain.rules = orm.rules || undefined;
    domain.media = orm.media;
    domain.commercial = orm.commercial;
    domain.owner = orm.owner || undefined;
    domain.realtor = orm.realtor || undefined;
    domain.agency = orm.agency || undefined;
    domain.seo = orm.seo || undefined;
    domain.createdAt = orm.createdAt;
    domain.updatedAt = orm.updatedAt;
    return domain;
  }

  private toOrm(domain: Property): PropertyOrmEntity {
    const orm = new PropertyOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.code = domain.code || null;
    orm.title = domain.title;
    orm.description = domain.description || null;
    orm.slug = domain.slug || null;
    orm.type = domain.type;
    orm.purpose = domain.purpose;
    orm.status = domain.status;
    orm.address = domain.address;
    orm.area = domain.area;
    orm.rooms = domain.rooms;
    orm.details = domain.details;
    orm.pricing = domain.pricing;
    orm.features = domain.features;
    orm.condominium = domain.condominium || null;
    orm.rules = domain.rules || null;
    orm.media = domain.media;
    orm.commercial = domain.commercial;
    orm.owner = domain.owner || null;
    orm.realtor = domain.realtor || null;
    orm.agency = domain.agency || null;
    orm.seo = domain.seo || null;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async findAll(tenantId: string, filters?: { type?: string; status?: string }): Promise<Property[]> {
    const where: any = { tenantId };
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    const orms = await this.ormRepository.find({ where, order: { createdAt: 'DESC' } });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(tenantId: string, id: string): Promise<Property | null> {
    const orm = await this.ormRepository.findOneBy({ tenantId, id });
    return orm ? this.toDomain(orm) : null;
  }

  async save(property: Property): Promise<Property> {
    const orm = this.toOrm(property);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ tenantId, id });
  }
}
