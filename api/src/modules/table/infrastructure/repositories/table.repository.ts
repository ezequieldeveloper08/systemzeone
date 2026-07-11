import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITableRepository } from '../../domain/repositories/table.repository.interface';
import { Table } from '../../domain/entities/table.entity';
import { TableOrmEntity } from '../database/table.orm-entity';

@Injectable()
export class TableRepository implements ITableRepository {
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly ormRepository: Repository<TableOrmEntity>,
  ) {}

  private toDomain(orm: TableOrmEntity): Table {
    return new Table(
      orm.id,
      orm.tenantId,
      orm.number,
      orm.capacity,
      orm.status,
      orm.label,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: Table): TableOrmEntity {
    const orm = new TableOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.number = domain.number;
    orm.capacity = domain.capacity;
    orm.status = domain.status;
    orm.label = domain.label;
    return orm;
  }

  async save(table: Table): Promise<Table> {
    const orm = this.toOrm(table);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findById(tenantId: string, id: string): Promise<Table | null> {
    const orm = await this.ormRepository.findOne({ where: { id, tenantId } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(tenantId: string): Promise<Table[]> {
    const orms = await this.ormRepository.find({
      where: { tenantId },
      order: { number: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ id, tenantId });
  }
}
