import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IVehicleRepositoryToken } from '../../domain/repositories/vehicle.repository.interface';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class GetVehicleUseCase {
  constructor(
    @Inject(IVehicleRepositoryToken)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(tenantId, id);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    return vehicle;
  }
}
