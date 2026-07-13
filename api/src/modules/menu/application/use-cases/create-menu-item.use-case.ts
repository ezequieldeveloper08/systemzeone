import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IMenuItemRepositoryToken } from '../../domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem, MenuItemVariation, Choice, ChoiceItem, ChoiceItemVariation } from '../../domain/entities/menu-item.entity';
import { CreateMenuItemDto } from '../../presentation/dtos/create-menu-item.dto';

@Injectable()
export class CreateMenuItemUseCase {
  constructor(
    @Inject(IMenuItemRepositoryToken)
    private readonly menuItemRepository: IMenuItemRepository,
  ) {}

  async execute(tenantId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItemId = crypto.randomUUID();

    const menuItem = new MenuItem(
      menuItemId,
      tenantId,
      dto.name,
      dto.description,
      dto.category || '',
      dto.status || 'published',
      dto.image || null,
      dto.menuId || null,
      dto.categoryItemId || null,
      null,
      [],
      [],
      new Date(),
      new Date(),
    );

    const variations = (dto.variations || []).map((v) => {
      return new MenuItemVariation(
        v.id || crypto.randomUUID(),
        menuItemId,
        v.name,
        v.price,
        v.order || 0,
        v.enabled !== undefined ? v.enabled : true,
      );
    });

    const choices = (dto.choices || []).map((c) => {
      const choiceId = c.id || crypto.randomUUID();
      return new Choice(
        choiceId,
        tenantId,
        c.name,
        c.choiceType || 1,
        c.minChoices || 0,
        c.maxChoices || 1,
        (c.choiceItems || []).map((ci) => {
          const choiceItemId = ci.id || crypto.randomUUID();
          return new ChoiceItem(
            choiceItemId,
            choiceId,
            ci.name,
            ci.order || 0,
            ci.enabled !== undefined ? ci.enabled : true,
            (ci.variations || []).map((civ) => {
              return new ChoiceItemVariation(
                civ.id || crypto.randomUUID(),
                choiceItemId,
                civ.additionalPrice,
                civ.variationId || null,
              );
            }),
          );
        }),
      );
    });

    menuItem.variations = variations;
    menuItem.choices = choices;

    return this.menuItemRepository.save(menuItem);
  }
}
