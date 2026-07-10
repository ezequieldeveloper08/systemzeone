import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IVehicleRepositoryToken } from '../../domain/repositories/vehicle.repository.interface';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(IVehicleRepositoryToken)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(tenantId: string, id: string, data: any): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(tenantId, id);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    if (data.title !== undefined) vehicle.title = data.title;
    if (data.brand !== undefined) vehicle.brand = data.brand;
    if (data.model !== undefined) vehicle.model = data.model;
    if (data.year !== undefined) vehicle.year = data.year;
    if (data.description !== undefined) vehicle.description = data.description;
    if (data.price !== undefined) vehicle.price = data.price;
    if (data.salePrice !== undefined) vehicle.salePrice = data.salePrice;
    if (data.status !== undefined) vehicle.status = data.status;
    if (data.images !== undefined) vehicle.images = data.images;
    if (data.km !== undefined) vehicle.km = data.km;
    if (data.transmission !== undefined) vehicle.transmission = data.transmission;
    if (data.fuel !== undefined) vehicle.fuel = data.fuel;
    if (data.color !== undefined) vehicle.color = data.color;
    if (data.tags !== undefined) vehicle.tags = data.tags;
    if (data.collections !== undefined) vehicle.collections = data.collections;
    
    // Webmotors details
    if (data.type !== undefined) vehicle.type = data.type;
    if (data.plate !== undefined) vehicle.plate = data.plate;
    if (data.doors !== undefined) vehicle.doors = data.doors;
    if (data.features !== undefined) vehicle.features = data.features;
    if (data.engine !== undefined) vehicle.engine = data.engine;
    if (data.bodyType !== undefined) vehicle.bodyType = data.bodyType;

    return this.vehicleRepository.save(vehicle);
  }
}
