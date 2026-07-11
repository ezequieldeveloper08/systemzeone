import { Order } from '../entities/order.entity';

export interface ListOrdersFilters {
  status?: string;
  deliveryType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(tenantId: string, id: string): Promise<Order | null>;
  findAll(tenantId: string, status?: string): Promise<Order[]>;
  findWithFilters(tenantId: string, filters: ListOrdersFilters): Promise<{ items: Order[]; total: number }>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const IOrderRepositoryToken = Symbol('IOrderRepository');
