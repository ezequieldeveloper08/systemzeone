import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductOrmEntity } from '../database/product.orm-entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: Repository<ProductOrmEntity>,
  ) {}

  private toDomain(orm: ProductOrmEntity): Product {
    return new Product(
      orm.id,
      orm.tenantId,
      orm.title,
      orm.description,
      orm.category,
      orm.price,
      orm.stock,
      orm.status,
      orm.images,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.title = domain.title;
    orm.description = domain.description;
    orm.category = domain.category;
    orm.price = domain.price;
    orm.stock = domain.stock;
    orm.status = domain.status;
    orm.images = domain.images;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async findAll(tenantId: string, filters?: { category?: string; status?: string }): Promise<Product[]> {
    const where: any = { tenantId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;

    const orms = await this.ormRepository.find({ where, order: { createdAt: 'DESC' } });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const orm = await this.ormRepository.findOneBy({ tenantId, id });
    return orm ? this.toDomain(orm) : null;
  }

  async save(product: Product): Promise<Product> {
    const orm = this.toOrm(product);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ tenantId, id });
  }
}
