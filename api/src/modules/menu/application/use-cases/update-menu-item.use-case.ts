import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMenuItemRepositoryToken } from '../../domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem } from '../../domain/entities/menu-item.entity';
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
    if (dto.category !== undefined) item.category = dto.category;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.image !== undefined) item.image = dto.image;
    if (dto.choiceGroups !== undefined) item.choiceGroups = dto.choiceGroups;
    if (dto.menuId !== undefined) item.menuId = dto.menuId || null;

    return this.menuItemRepository.save(item);
  }
}
