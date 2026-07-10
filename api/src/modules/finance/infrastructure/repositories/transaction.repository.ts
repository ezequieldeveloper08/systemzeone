import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../database/transaction.orm-entity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly ormRepository: Repository<TransactionOrmEntity>,
  ) {}

  private toDomain(orm: TransactionOrmEntity): Transaction {
    const domain = new Transaction(
      orm.id,
      orm.tenantId,
      orm.description,
      orm.amount,
      orm.type,
      orm.status,
      orm.dueDate,
      orm.paymentDate,
      orm.category,
      orm.vehicleId,
      orm.createdAt,
      orm.updatedAt,
    );
    // Keep a reference to the vehicle object if it was loaded
    if (orm.vehicle) {
      (domain as any).vehicle = {
        id: orm.vehicle.id,
        brand: orm.vehicle.brand,
        model: orm.vehicle.model,
        plate: orm.vehicle.plate,
        year: orm.vehicle.year,
      };
    }
    return domain;
  }

  private toOrm(domain: Transaction): TransactionOrmEntity {
    const orm = new TransactionOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.description = domain.description;
    orm.amount = domain.amount;
    orm.type = domain.type;
    orm.status = domain.status;
    orm.dueDate = domain.dueDate;
    orm.paymentDate = domain.paymentDate;
    orm.category = domain.category;
    orm.vehicleId = domain.vehicleId;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const orm = this.toOrm(transaction);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: { vehicle: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByTenantId(
    tenantId: string,
    filters?: {
      type?: 'revenue' | 'expense';
      status?: 'pending' | 'paid';
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Transaction[]> {
    const query: any = {
      where: { tenantId },
      relations: { vehicle: true },
      order: { dueDate: 'DESC' },
    };

    if (filters?.type) {
      query.where.type = filters.type;
    }
    if (filters?.status) {
      query.where.status = filters.status;
    }
    if (filters?.startDate && filters?.endDate) {
      query.where.dueDate = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      // Just start date
      // we can do at least that date
    }

    const orms = await this.ormRepository.find(query);
    return orms.map(orm => this.toDomain(orm));
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const orm = this.toOrm(transaction);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
