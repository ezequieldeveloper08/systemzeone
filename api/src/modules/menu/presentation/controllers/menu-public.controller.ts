import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ListMenuItemsUseCase } from '../../application/use-cases/list-menu-items.use-case';
import { ListMenuGroupsUseCase } from '../../application/use-cases/list-menu-groups.use-case';

@ApiTags('Menu Public')
@Controller('menu-public')
export class MenuPublicController {
  constructor(
    private readonly listMenuItemsUseCase: ListMenuItemsUseCase,
    private readonly listMenuGroupsUseCase: ListMenuGroupsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens do cardápio do tenant de forma pública' })
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('category') category?: string,
    @Query('menuId') menuId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('O parâmetro tenantId é obrigatório.');
    }
    return this.listMenuItemsUseCase.execute(tenantId, { category, status: 'published', menuId });
  }

  @Get('groups')
  @ApiOperation({ summary: 'Listar todos os cardápios (agrupamentos) da unidade de forma pública' })
  async findAllGroups(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('O parâmetro tenantId é obrigatório.');
    }
    return this.listMenuGroupsUseCase.execute(tenantId);
  }
}
