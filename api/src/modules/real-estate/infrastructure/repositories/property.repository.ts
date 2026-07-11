import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';
import { PropertyOrmEntity } from '../database/property.orm-entity';

@Injectable()
export class PropertyRepository implements IPropertyRepository {
  constructor(
    @InjectRepository(PropertyOrmEntity)
    private readonly ormRepository: Repository<PropertyOrmEntity>,
  ) {}

  private toDomain(orm: PropertyOrmEntity): Property {
    return new Property(
      orm.id,
      orm.tenantId,
      orm.title,
      orm.description,
      orm.type,
      orm.price,
      orm.bedrooms,
      orm.bathrooms,
      orm.area,
      orm.status,
      orm.images,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Property): PropertyOrmEntity {
    const orm = new PropertyOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.title = domain.title;
    orm.description = domain.description;
    orm.type = domain.type;
    orm.price = domain.price;
    orm.bedrooms = domain.bedrooms;
    orm.bathrooms = domain.bathrooms;
    orm.area = domain.area;
    orm.status = domain.status;
    orm.images = domain.images;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
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
