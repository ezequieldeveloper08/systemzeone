import { Vehicle } from '../entities/vehicle.entity';

export interface IVehicleRepository {
  findAll(tenantId: string, filters?: { type?: string; brand?: string; status?: string }): Promise<Vehicle[]>;
  findById(tenantId: string, id: string): Promise<Vehicle | null>;
  save(vehicle: Vehicle): Promise<Vehicle>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const IVehicleRepositoryToken = Symbol('IVehicleRepository');
