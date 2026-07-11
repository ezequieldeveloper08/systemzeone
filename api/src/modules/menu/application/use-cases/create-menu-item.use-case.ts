import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IMenuItemRepositoryToken } from '../../domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem } from '../../domain/entities/menu-item.entity';
import { CreateMenuItemDto } from '../../presentation/dtos/create-menu-item.dto';

@Injectable()
export class CreateMenuItemUseCase {
  constructor(
    @Inject(IMenuItemRepositoryToken)
    private readonly menuItemRepository: IMenuItemRepository,
  ) {}

  async execute(tenantId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = new MenuItem(
      crypto.randomUUID(),
      tenantId,
      dto.name,
      dto.description,
      dto.category,
      dto.price,
      dto.status || 'published',
      dto.image || null,
      dto.choiceGroups || [],
      dto.menuId || null,
      new Date(),
      new Date(),
    );

    return this.menuItemRepository.save(menuItem);
  }
}
