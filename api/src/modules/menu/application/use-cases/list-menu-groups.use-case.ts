import { Inject, Injectable } from '@nestjs/common';
import { IMenuGroupRepositoryToken } from '../../domain/repositories/menu-group.repository.interface';
import type { IMenuGroupRepository } from '../../domain/repositories/menu-group.repository.interface';
import { MenuGroup } from '../../domain/entities/menu-group.entity';

@Injectable()
export class ListMenuGroupsUseCase {
  constructor(
    @Inject(IMenuGroupRepositoryToken)
    private readonly menuGroupRepository: IMenuGroupRepository,
  ) {}

  async execute(tenantId: string): Promise<MenuGroup[]> {
    return this.menuGroupRepository.findAll(tenantId);
  }
}
