import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMenuItemRepositoryToken } from '../../domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem } from '../../domain/entities/menu-item.entity';

@Injectable()
export class GetMenuItemUseCase {
  constructor(
    @Inject(IMenuItemRepositoryToken)
    private readonly menuItemRepository: IMenuItemRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findById(tenantId, id);
    if (!item) {
      throw new NotFoundException('Item do cardápio não encontrado.');
    }
    return item;
  }
}
