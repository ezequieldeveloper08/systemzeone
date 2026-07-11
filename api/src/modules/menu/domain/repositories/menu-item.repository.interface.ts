import { MenuItem } from '../entities/menu-item.entity';

export interface IMenuItemRepository {
  findAll(tenantId: string, filters?: { category?: string; status?: string; menuId?: string }): Promise<MenuItem[]>;
  findById(tenantId: string, id: string): Promise<MenuItem | null>;
  save(menuItem: MenuItem): Promise<MenuItem>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const IMenuItemRepositoryToken = Symbol('IMenuItemRepository');
