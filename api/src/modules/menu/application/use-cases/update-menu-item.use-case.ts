import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { IMenuItemRepositoryToken } from '../../domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem, MenuItemVariation, Choice, ChoiceItem, ChoiceItemVariation } from '../../domain/entities/menu-item.entity';
import { CreateMenuItemDto } from '../../presentation/dtos/create-menu-item.dto';

@Injectable()
export class UpdateMenuItemUseCase {
  constructor(
    @Inject(IMenuItemRepositoryToken)
    private readonly menuItemRepository: IMenuItemRepository,
  ) {}

  async execute(tenantId: string, id: string, dto: Partial<CreateMenuItemDto>): Promise<MenuItem> {
    const item = await this.menuItemRepository.findById(tenantId, id);
    if (!item) {
      throw new NotFoundException('Item do cardápio não encontrado.');
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.category !== undefined) item.category = dto.category || '';
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.image !== undefined) item.image = dto.image;
    if (dto.menuId !== undefined) item.menuId = dto.menuId || null;
    if (dto.categoryItemId !== undefined) item.categoryItemId = dto.categoryItemId || null;

    if (dto.variations !== undefined) {
      item.variations = (dto.variations || []).map((v) => {
        return new MenuItemVariation(
          v.id || crypto.randomUUID(),
          item.id,
          v.name,
          v.price,
          v.order || 0,
          v.enabled !== undefined ? v.enabled : true,
        );
      });
    }

    if (dto.choices !== undefined) {
      item.choices = (dto.choices || []).map((c) => {
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
    }

    return this.menuItemRepository.save(item);
  }
}
