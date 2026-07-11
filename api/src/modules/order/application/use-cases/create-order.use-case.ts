import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';
import { IOrderRepositoryToken } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['delivery', 'takeaway', 'table'])
  deliveryType: 'delivery' | 'takeaway' | 'table';

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  tableNumber?: string;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsArray()
  @IsNotEmpty()
  items: any[];

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(tenantId: string, dto: CreateOrderDto): Promise<Order> {
    const order = new Order(
      crypto.randomUUID(),
      tenantId,
      dto.customerName,
      dto.customerPhone || '',
      dto.deliveryType,
      dto.address || null,
      dto.tableNumber || null,
      dto.totalPrice,
      'pending', // Initial status
      dto.items || [],
      dto.paymentMethod || null,
      new Date(),
      new Date(),
    );
    return this.orderRepository.save(order);
  }
}
