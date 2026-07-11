import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IProductRepositoryToken } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(IProductRepositoryToken)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(tenantId: string, dto: CreateProductDto): Promise<Product> {
    const product = new Product(
      crypto.randomUUID(),
      tenantId,
      dto.title,
      dto.description,
      dto.category,
      dto.price,
      dto.stock || 0,
      dto.status || 'published',
      dto.images || [],
      new Date(),
      new Date(),
    );

    return this.productRepository.save(product);
  }
}
