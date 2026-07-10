import { Inject, Injectable } from '@nestjs/common';
import { IVehicleRepositoryToken } from '../../domain/repositories/vehicle.repository.interface';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class ListVehiclesUseCase {
  constructor(
    @Inject(IVehicleRepositoryToken)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(tenantId: string, filters?: { type?: string; brand?: string; status?: string }): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll(tenantId, filters);
  }
}
