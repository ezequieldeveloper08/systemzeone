import { MenuGroup } from '../entities/menu-group.entity';

export interface IMenuGroupRepository {
  save(menuGroup: MenuGroup): Promise<MenuGroup>;
  findById(tenantId: string, id: string): Promise<MenuGroup | null>;
  findAll(tenantId: string): Promise<MenuGroup[]>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const IMenuGroupRepositoryToken = Symbol('IMenuGroupRepository');
