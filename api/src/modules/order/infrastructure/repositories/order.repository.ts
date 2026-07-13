import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepositoryToken, ListOrdersFilters } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderOrmEntity } from '../database/order.orm-entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly ormRepository: Repository<OrderOrmEntity>,
  ) {}

  private toDomain(orm: OrderOrmEntity): Order {
    return new Order(
      orm.id,
      orm.tenantId,
      orm.customerName,
      orm.customerPhone,
      orm.deliveryType,
      orm.address,
      orm.tableNumber,
      orm.totalPrice,
      orm.status,
      orm.items || [],
      orm.paymentMethod,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Order): OrderOrmEntity {
    const orm = new OrderOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.customerName = domain.customerName;
    orm.customerPhone = domain.customerPhone;
    orm.deliveryType = domain.deliveryType;
    orm.address = domain.address;
    orm.tableNumber = domain.tableNumber;
    orm.totalPrice = domain.totalPrice;
    orm.status = domain.status;
    orm.items = domain.items || [];
    orm.paymentMethod = domain.paymentMethod;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async save(order: Order): Promise<Order> {
    const orm = this.toOrm(order);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findById(tenantId: string, id: string): Promise<Order | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, tenantId },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByIdPublic(id: string): Promise<Order | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(tenantId: string, status?: string): Promise<Order[]> {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }
    const orms = await this.ormRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findWithFilters(tenantId: string, filters: ListOrdersFilters): Promise<{ items: Order[]; total: number }> {
    const qb = this.ormRepository.createQueryBuilder('order');
    qb.where('order.tenantId = :tenantId', { tenantId });

    if (filters.status) {
      qb.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters.deliveryType) {
      qb.andWhere('order.deliveryType = :deliveryType', { deliveryType: filters.deliveryType });
    }

    if (filters.startDate) {
      qb.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
    }

    qb.orderBy('order.createdAt', 'DESC');

    const page = Number(filters.page) && Number(filters.page) > 0 ? Number(filters.page) : 1;
    const limit = Number(filters.limit) && Number(filters.limit) > 0 ? Number(filters.limit) : 20;
    
    qb.offset((page - 1) * limit);
    qb.limit(limit);

    const [orms, total] = await qb.getManyAndCount();

    return {
      items: orms.map((orm) => this.toDomain(orm)),
      total,
    };
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ id, tenantId });
  }
}
