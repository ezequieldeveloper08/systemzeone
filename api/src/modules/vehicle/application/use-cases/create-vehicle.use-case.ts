import { Inject, Injectable } from '@nestjs/common';
import { IVehicleRepositoryToken } from '../../domain/repositories/vehicle.repository.interface';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import * as crypto from 'crypto';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject(IVehicleRepositoryToken)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(tenantId: string, data: any): Promise<Vehicle> {
    const vehicle = new Vehicle(
      crypto.randomUUID(),
      tenantId,
      data.title,
      data.brand,
      data.model,
      data.year,
      data.description,
      data.price,
      data.salePrice !== undefined ? data.salePrice : null,
      data.status || 'published',
      data.images || [],
      data.km,
      data.transmission,
      data.fuel,
      data.color,
      data.tags || [],
      data.collections || [],
      data.type || 'car',
      data.plate !== undefined ? data.plate : null,
      data.doors !== undefined ? data.doors : null,
      data.features || [],
      data.engine !== undefined ? data.engine : null,
      data.bodyType !== undefined ? data.bodyType : null,
      new Date(),
      new Date(),
    );

    return this.vehicleRepository.save(vehicle);
  }
}
