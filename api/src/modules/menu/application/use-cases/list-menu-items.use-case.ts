import { Inject, Injectable } from '@nestjs/common';
import { IMenuItemRepositoryToken } from '../../domain/repositories/menu-item.repository.interface';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.interface';
import { MenuItem } from '../../domain/entities/menu-item.entity';

@Injectable()
export class ListMenuItemsUseCase {
  constructor(
    @Inject(IMenuItemRepositoryToken)
    private readonly menuItemRepository: IMenuItemRepository,
  ) {}

  async execute(tenantId: string, filters?: { category?: string; status?: string; menuId?: string }): Promise<MenuItem[]> {
    return this.menuItemRepository.findAll(tenantId, filters);
  }
}
