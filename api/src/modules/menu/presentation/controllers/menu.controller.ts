import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ListMenuItemsUseCase } from '../../application/use-cases/list-menu-items.use-case';
import { CreateMenuItemUseCase } from '../../application/use-cases/create-menu-item.use-case';
import { GetMenuItemUseCase } from '../../application/use-cases/get-menu-item.use-case';
import { UpdateMenuItemUseCase } from '../../application/use-cases/update-menu-item.use-case';
import { DeleteMenuItemUseCase } from '../../application/use-cases/delete-menu-item.use-case';
import { CreateMenuGroupUseCase, CreateMenuGroupDto } from '../../application/use-cases/create-menu-group.use-case';
import { ListMenuGroupsUseCase } from '../../application/use-cases/list-menu-groups.use-case';
import { UpdateMenuGroupUseCase, UpdateMenuGroupDto } from '../../application/use-cases/update-menu-group.use-case';
import { DeleteMenuGroupUseCase } from '../../application/use-cases/delete-menu-group.use-case';
import { CreateMenuItemDto } from '../dtos/create-menu-item.dto';

@ApiTags('Menu')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID do Tenant ativo do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('menu')
export class MenuController {
  constructor(
    private readonly listMenuItemsUseCase: ListMenuItemsUseCase,
    private readonly createMenuItemUseCase: CreateMenuItemUseCase,
    private readonly getMenuItemUseCase: GetMenuItemUseCase,
    private readonly updateMenuItemUseCase: UpdateMenuItemUseCase,
    private readonly deleteMenuItemUseCase: DeleteMenuItemUseCase,
    private readonly createMenuGroupUseCase: CreateMenuGroupUseCase,
    private readonly listMenuGroupsUseCase: ListMenuGroupsUseCase,
    private readonly updateMenuGroupUseCase: UpdateMenuGroupUseCase,
    private readonly deleteMenuGroupUseCase: DeleteMenuGroupUseCase,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = crypto.randomUUID();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Fazer upload de imagem do item do cardápio' })
  async uploadFile(@UploadedFile() file: any, @Req() req: any) {
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
    return { url: fileUrl };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens do cardápio do tenant' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('menuId') menuId?: string,
  ) {
    return this.listMenuItemsUseCase.execute(tenantId, { category, status, menuId });
  }

  @Get('groups')
  @ApiOperation({ summary: 'Listar todos os cardápios (agrupamentos) da unidade' })
  async findAllGroups(@CurrentTenant() tenantId: string) {
    return this.listMenuGroupsUseCase.execute(tenantId);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Criar um novo cardápio (agrupamento) na unidade' })
  async createGroup(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMenuGroupDto,
  ) {
    return this.createMenuGroupUseCase.execute(tenantId, dto);
  }

  @Put('groups/:id')
  @ApiOperation({ summary: 'Atualizar um cardápio (agrupamento)' })
  async updateGroup(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuGroupDto,
  ) {
    return this.updateMenuGroupUseCase.execute(tenantId, id, dto);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Excluir um cardápio (agrupamento)' })
  async deleteGroup(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.deleteMenuGroupUseCase.execute(tenantId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um item do cardápio' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.getMenuItemUseCase.execute(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo item no cardápio' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.createMenuItemUseCase.execute(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um item do cardápio' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMenuItemDto>,
  ) {
    return this.updateMenuItemUseCase.execute(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um item do cardápio' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.deleteMenuItemUseCase.execute(tenantId, id);
  }
}
