import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem, CategoryItem, MenuItemVariation, Choice, ChoiceItem, ChoiceItemVariation } from '../../domain/entities/menu-item.entity';
import { MenuItemOrmEntity } from '../database/menu-item.orm-entity';
import { CategoryItemOrmEntity } from '../database/category-item.orm-entity';
import { MenuItemVariationOrmEntity } from '../database/item-variation.orm-entity';
import { ChoiceOrmEntity } from '../database/choice.orm-entity';
import { ChoiceItemOrmEntity } from '../database/choice-item.orm-entity';
import { ChoiceItemVariationOrmEntity } from '../database/choice-item-variation.orm-entity';

@Injectable()
export class MenuItemRepository implements IMenuItemRepository {
  constructor(
    @InjectRepository(MenuItemOrmEntity)
    private readonly ormRepository: Repository<MenuItemOrmEntity>,
  ) {}

  private toDomain(orm: MenuItemOrmEntity): MenuItem {
    const categoryItem = orm.categoryItem
      ? new CategoryItem(
          orm.categoryItem.id,
          orm.categoryItem.tenantId,
          orm.categoryItem.name,
          orm.categoryItem.order,
          orm.categoryItem.enabled,
        )
      : null;

    const variations = (orm.variations || []).map(
      (v) => new MenuItemVariation(v.id, v.menuItemId, v.name, v.price, v.order, v.enabled)
    );

    const choices = (orm.choices || []).map(
      (c) =>
        new Choice(
          c.id,
          c.tenantId,
          c.name,
          c.choiceType,
          c.minChoices,
          c.maxChoices,
          (c.choiceItems || []).map(
            (ci) =>
              new ChoiceItem(
                ci.id,
                ci.choiceId,
                ci.name,
                ci.order,
                ci.enabled,
                (ci.variations || []).map(
                  (civ) => new ChoiceItemVariation(civ.id, civ.choiceItemId, civ.additionalPrice, civ.variationId)
                )
              )
          )
        )
    );

    return new MenuItem(
      orm.id,
      orm.tenantId,
      orm.name,
      orm.description,
      orm.category || '',
      orm.status,
      orm.image,
      orm.menuId || null,
      orm.categoryItemId || null,
      categoryItem,
      variations,
      choices,
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
    orm.status = domain.status;
    orm.image = domain.image;
    orm.menuId = domain.menuId;
    orm.categoryItemId = domain.categoryItemId;

    if (domain.categoryItem) {
      const cat = new CategoryItemOrmEntity();
      cat.id = domain.categoryItem.id;
      cat.tenantId = domain.categoryItem.tenantId;
      cat.name = domain.categoryItem.name;
      cat.order = domain.categoryItem.order;
      cat.enabled = domain.categoryItem.enabled;
      orm.categoryItem = cat;
    } else {
      orm.categoryItem = null;
    }

    orm.variations = (domain.variations || []).map((v) => {
      const vo = new MenuItemVariationOrmEntity();
      vo.id = v.id;
      vo.menuItemId = v.menuItemId;
      vo.name = v.name;
      vo.price = v.price;
      vo.order = v.order;
      vo.enabled = v.enabled;
      return vo;
    });

    orm.choices = (domain.choices || []).map((c) => {
      const co = new ChoiceOrmEntity();
      co.id = c.id;
      co.tenantId = c.tenantId;
      co.name = c.name;
      co.choiceType = c.choiceType;
      co.minChoices = c.minChoices;
      co.maxChoices = c.maxChoices;
      co.choiceItems = (c.choiceItems || []).map((ci) => {
        const cio = new ChoiceItemOrmEntity();
        cio.id = ci.id;
        cio.choiceId = ci.choiceId;
        cio.name = ci.name;
        cio.order = ci.order;
        cio.enabled = ci.enabled;
        cio.variations = (ci.variations || []).map((civ) => {
          const civo = new ChoiceItemVariationOrmEntity();
          civo.id = civ.id;
          civo.choiceItemId = civ.choiceItemId;
          civo.additionalPrice = civ.additionalPrice;
          civo.variationId = civ.variationId;
          return civo;
        });
        return cio;
      });
      return co;
    });

    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  async findAll(tenantId: string, filters?: { category?: string; status?: string; menuId?: string }): Promise<MenuItem[]> {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.menuId) where.menuId = filters.menuId;

    const orms = await this.ormRepository.find({
      where,
      relations: {
        categoryItem: true,
        variations: true,
        choices: {
          choiceItems: {
            variations: true
          }
        }
      },
      order: { createdAt: 'DESC' }
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(tenantId: string, id: string): Promise<MenuItem | null> {
    const orm = await this.ormRepository.findOne({
      where: { tenantId, id },
      relations: {
        categoryItem: true,
        variations: true,
        choices: {
          choiceItems: {
            variations: true
          }
        }
      }
    });
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
