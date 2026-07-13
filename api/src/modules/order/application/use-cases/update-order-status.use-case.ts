import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepositoryToken } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'preparing', 'ready', 'delivering', 'finished', 'cancelled'])
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'finished' | 'cancelled';

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

import { RealTimeService } from '../../../realtime/realtime.service';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    private readonly realTimeService: RealTimeService,
  ) {}

  async execute(tenantId: string, id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findById(tenantId, id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    order.status = dto.status;
    if (dto.paymentMethod !== undefined) {
      order.paymentMethod = dto.paymentMethod || null;
    }
    const saved = await this.orderRepository.save(order);
    
    // Notify client tracking and admin dashboards
    this.realTimeService.emitToOrder(id, 'order-status-changed', saved);
    this.realTimeService.emitToTenant(tenantId, 'order-updated', saved);

    return saved;
  }
}
