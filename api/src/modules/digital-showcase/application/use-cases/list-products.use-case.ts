import { Inject, Injectable } from '@nestjs/common';
import { IProductRepositoryToken } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(IProductRepositoryToken)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(tenantId: string, filters?: { category?: string; status?: string }): Promise<Product[]> {
    return this.productRepository.findAll(tenantId, filters);
  }
}
