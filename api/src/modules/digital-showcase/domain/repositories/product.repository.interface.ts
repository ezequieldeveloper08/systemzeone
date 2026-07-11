import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findAll(tenantId: string, filters?: { category?: string; status?: string }): Promise<Product[]>;
  findById(tenantId: string, id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const IProductRepositoryToken = Symbol('IProductRepository');
