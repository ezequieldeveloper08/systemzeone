import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IVehicleRepositoryToken } from '../../domain/repositories/vehicle.repository.interface';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(IVehicleRepositoryToken)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(tenantId, id);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    await this.vehicleRepository.delete(tenantId, id);
  }
}
