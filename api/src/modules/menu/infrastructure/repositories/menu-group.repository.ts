import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMenuGroupRepositoryToken } from '../../domain/repositories/menu-group.repository.interface';
import type { IMenuGroupRepository } from '../../domain/repositories/menu-group.repository.interface';
import { MenuGroup } from '../../domain/entities/menu-group.entity';
import { MenuGroupOrmEntity } from '../database/menu-group.orm-entity';

@Injectable()
export class MenuGroupRepository implements IMenuGroupRepository {
  constructor(
    @InjectRepository(MenuGroupOrmEntity)
    private readonly ormRepository: Repository<MenuGroupOrmEntity>,
  ) {}

  private toDomain(orm: MenuGroupOrmEntity): MenuGroup {
    return new MenuGroup(
      orm.id,
      orm.tenantId,
      orm.name,
      orm.description || '',
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: MenuGroup): MenuGroupOrmEntity {
    const orm = new MenuGroupOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async save(menuGroup: MenuGroup): Promise<MenuGroup> {
    const orm = this.toOrm(menuGroup);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async findById(tenantId: string, id: string): Promise<MenuGroup | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, tenantId },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(tenantId: string): Promise<MenuGroup[]> {
    const orms = await this.ormRepository.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ id, tenantId });
  }
}
