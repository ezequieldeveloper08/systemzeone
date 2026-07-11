import { Property } from '../entities/property.entity';

export interface IPropertyRepository {
  findAll(tenantId: string, filters?: { type?: string; status?: string }): Promise<Property[]>;
  findById(tenantId: string, id: string): Promise<Property | null>;
  save(property: Property): Promise<Property>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const IPropertyRepositoryToken = Symbol('IPropertyRepository');
