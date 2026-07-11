import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem } from '../../domain/entities/menu-item.entity';
import { MenuItemOrmEntity } from '../database/menu-item.orm-entity';

@Injectable()
export class MenuItemRepository implements IMenuItemRepository {
  constructor(
    @InjectRepository(MenuItemOrmEntity)
    private readonly ormRepository: Repository<MenuItemOrmEntity>,
  ) {}

  private toDomain(orm: MenuItemOrmEntity): MenuItem {
    return new MenuItem(
      orm.id,
      orm.tenantId,
      orm.name,
      orm.description,
      orm.category,
      orm.price,
      orm.status,
      orm.image,
      orm.choiceGroups || [],
      orm.menuId || null,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(domain: MenuItem): MenuItemOrmEntity {
    const orm = new MenuItemOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.category = domain.category;
    orm.price = domain.price;
    orm.status = domain.status;
    orm.image = domain.image;
    orm.choiceGroups = domain.choiceGroups || [];
    orm.menuId = domain.menuId;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async findAll(tenantId: string, filters?: { category?: string; status?: string; menuId?: string }): Promise<MenuItem[]> {
    const where: any = { tenantId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.menuId) where.menuId = filters.menuId;

    const orms = await this.ormRepository.find({ where, order: { createdAt: 'DESC' } });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(tenantId: string, id: string): Promise<MenuItem | null> {
    const orm = await this.ormRepository.findOneBy({ tenantId, id });
    return orm ? this.toDomain(orm) : null;
  }

  async save(menuItem: MenuItem): Promise<MenuItem> {
    const orm = this.toOrm(menuItem);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ormRepository.delete({ tenantId, id });
  }
}
