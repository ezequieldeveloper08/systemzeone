import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductOrmEntity } from './infrastructure/database/product.orm-entity';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { IProductRepositoryToken } from './domain/repositories/product.repository.interface';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { DigitalShowcaseController } from './presentation/controllers/digital-showcase.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ProductOrmEntity]),
  ],
  providers: [
    {
      provide: IProductRepositoryToken,
      useClass: ProductRepository,
    },
    ListProductsUseCase,
    CreateProductUseCase,
  ],
  controllers: [DigitalShowcaseController],
  exports: [IProductRepositoryToken],
})
export class DigitalShowcaseModule {}
