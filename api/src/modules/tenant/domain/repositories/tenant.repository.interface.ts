import { Tenant } from '../entities/tenant.entity';

export interface ITenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  save(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findByName(name: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
}

export const ITenantRepositoryToken = Symbol('ITenantRepository');
