import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepositoryToken, ListOrdersFilters } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

export class GetOrderHistoryDto {
  status?: string;
  deliveryType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetOrderHistoryUseCase {
  constructor(
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(tenantId: string, dto: GetOrderHistoryDto): Promise<{ items: Order[]; total: number }> {
    const filters: ListOrdersFilters = {
      status: dto.status,
      deliveryType: dto.deliveryType,
      page: dto.page ? Number(dto.page) : 1,
      limit: dto.limit ? Number(dto.limit) : 20,
    };

    if (dto.startDate) {
      filters.startDate = new Date(dto.startDate);
    }

    if (dto.endDate) {
      filters.endDate = new Date(dto.endDate);
      // Ensure end date includes the entire day if it's just a YYYY-MM-DD
      if (dto.endDate.length === 10) {
        filters.endDate.setHours(23, 59, 59, 999);
      }
    }

    return this.orderRepository.findWithFilters(tenantId, filters);
  }
}
