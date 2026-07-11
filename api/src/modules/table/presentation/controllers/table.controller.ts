import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { CreateTableUseCase, CreateTableDto } from '../../application/use-cases/create-table.use-case';
import { ListTablesUseCase } from '../../application/use-cases/list-tables.use-case';
import { UpdateTableUseCase, UpdateTableDto } from '../../application/use-cases/update-table.use-case';
import { DeleteTableUseCase } from '../../application/use-cases/delete-table.use-case';

@ApiTags('Tables')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID do Tenant ativo do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tables')
export class TableController {
  constructor(
    private readonly createTableUseCase: CreateTableUseCase,
    private readonly listTablesUseCase: ListTablesUseCase,
    private readonly updateTableUseCase: UpdateTableUseCase,
    private readonly deleteTableUseCase: DeleteTableUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as mesas do restaurante' })
  async findAll(@CurrentTenant() tenantId: string) {
    return this.listTablesUseCase.execute(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova mesa' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateTableDto) {
    return this.createTableUseCase.execute(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar mesa (status, capacidade, etiqueta)' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.updateTableUseCase.execute(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover mesa' })
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.deleteTableUseCase.execute(tenantId, id);
  }
}
