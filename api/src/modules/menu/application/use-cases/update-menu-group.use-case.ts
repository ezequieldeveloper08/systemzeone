import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMenuGroupRepositoryToken } from '../../domain/repositories/menu-group.repository.interface';
import type { IMenuGroupRepository } from '../../domain/repositories/menu-group.repository.interface';
import { MenuGroup } from '../../domain/entities/menu-group.entity';

import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateMenuGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@Injectable()
export class UpdateMenuGroupUseCase {
  constructor(
    @Inject(IMenuGroupRepositoryToken)
    private readonly menuGroupRepository: IMenuGroupRepository,
  ) {}

  async execute(tenantId: string, id: string, dto: UpdateMenuGroupDto): Promise<MenuGroup> {
    const menuGroup = await this.menuGroupRepository.findById(tenantId, id);
    if (!menuGroup) {
      throw new NotFoundException('Grupo de cardápio não encontrado.');
    }

    if (dto.name !== undefined) menuGroup.name = dto.name;
    if (dto.description !== undefined) menuGroup.description = dto.description;
    if (dto.isActive !== undefined) menuGroup.isActive = dto.isActive;

    return this.menuGroupRepository.save(menuGroup);
  }
}
