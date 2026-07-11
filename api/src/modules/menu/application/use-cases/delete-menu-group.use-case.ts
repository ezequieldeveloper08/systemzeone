import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMenuGroupRepositoryToken } from '../../domain/repositories/menu-group.repository.interface';
import type { IMenuGroupRepository } from '../../domain/repositories/menu-group.repository.interface';

@Injectable()
export class DeleteMenuGroupUseCase {
  constructor(
    @Inject(IMenuGroupRepositoryToken)
    private readonly menuGroupRepository: IMenuGroupRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const menuGroup = await this.menuGroupRepository.findById(tenantId, id);
    if (!menuGroup) {
      throw new NotFoundException('Grupo de cardápio não encontrado.');
    }
    await this.menuGroupRepository.delete(tenantId, id);
  }
}
