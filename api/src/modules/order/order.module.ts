import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderOrmEntity } from './infrastructure/database/order.orm-entity';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { IOrderRepositoryToken } from './domain/repositories/order.repository.interface';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders.use-case';
import { GetOrderHistoryUseCase } from './application/use-cases/get-order-history.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { OrderController } from './presentation/controllers/order.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([OrderOrmEntity]),
  ],
  providers: [
    {
      provide: IOrderRepositoryToken,
      useClass: OrderRepository,
    },
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderHistoryUseCase,
    UpdateOrderStatusUseCase,
  ],
  controllers: [OrderController],
  exports: [IOrderRepositoryToken],
})
export class OrderModule {}
