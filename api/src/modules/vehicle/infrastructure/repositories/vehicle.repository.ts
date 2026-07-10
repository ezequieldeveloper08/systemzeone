import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleOrmEntity } from '../database/vehicle.orm-entity';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  constructor(
    @InjectRepository(VehicleOrmEntity)
    private readonly ormRepository: Repository<VehicleOrmEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { type?: string; brand?: string; status?: string }): Promise<Vehicle[]> {
    const where: any = { tenantId };
    if (filters?.type) where.type = filters.type;
    if (filters?.brand) where.brand = filters.brand;
    if (filters?.status) where.status = filters.status;

    const orms = await this.ormRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return orms.map(o => this.toDomain(o));
  }

  async findById(tenantId: string, id: string): Promise<Vehicle | null> {
    const orm = await this.ormRepository.findOneBy({ tenantId, id });
    return orm ? this.toDomain(orm) : null;
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    const orm = this.toOrm(vehicle);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ tenantId, id });
  }

  private toDomain(orm: VehicleOrmEntity): Vehicle {
    return new Vehicle(
      orm.id,
      orm.tenantId,
      orm.title,
      orm.brand,
      orm.model,
      orm.year,
      orm.description,
      orm.price,
      orm.salePrice,
      orm.status,
      orm.images,
      orm.km,
      orm.transmission,
      orm.fuel,
      orm.color,
      orm.tags,
      orm.collections,
      orm.type,
      orm.plate,
      orm.doors,
      orm.features,
      orm.engine,
      orm.bodyType,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Vehicle): VehicleOrmEntity {
    const orm = new VehicleOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.title = domain.title;
    orm.brand = domain.brand;
    orm.model = domain.model;
    orm.year = domain.year;
    orm.description = domain.description;
    orm.price = domain.price;
    orm.salePrice = domain.salePrice;
    orm.status = domain.status;
    orm.images = domain.images;
    orm.km = domain.km;
    orm.transmission = domain.transmission;
    orm.fuel = domain.fuel;
    orm.color = domain.color;
    orm.tags = domain.tags;
    orm.collections = domain.collections;
    orm.type = domain.type;
    orm.plate = domain.plate;
    orm.doors = domain.doors;
    orm.features = domain.features;
    orm.engine = domain.engine;
    orm.bodyType = domain.bodyType;
    return orm;
  }
}
