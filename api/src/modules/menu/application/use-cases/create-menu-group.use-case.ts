import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IMenuGroupRepositoryToken } from '../../domain/repositories/menu-group.repository.interface';
import type { IMenuGroupRepository } from '../../domain/repositories/menu-group.repository.interface';
import { MenuGroup } from '../../domain/entities/menu-group.entity';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMenuGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

@Injectable()
export class CreateMenuGroupUseCase {
  constructor(
    @Inject(IMenuGroupRepositoryToken)
    private readonly menuGroupRepository: IMenuGroupRepository,
  ) {}

  async execute(tenantId: string, dto: CreateMenuGroupDto): Promise<MenuGroup> {
    const menuGroup = new MenuGroup(
      crypto.randomUUID(),
      tenantId,
      dto.name,
      dto.description || '',
      true,
      new Date(),
      new Date(),
    );
    return this.menuGroupRepository.save(menuGroup);
  }
}
