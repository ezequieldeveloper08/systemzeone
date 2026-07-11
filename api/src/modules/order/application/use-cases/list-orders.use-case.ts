import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepositoryToken } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(tenantId: string, status?: string): Promise<Order[]> {
    return this.orderRepository.findAll(tenantId, status);
  }
}
