import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ListPropertiesUseCase } from '../../application/use-cases/list-properties.use-case';
import { CreatePropertyUseCase } from '../../application/use-cases/create-property.use-case';
import { CreatePropertyDto } from '../dtos/create-property.dto';

@ApiTags('RealEstate')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID do Tenant ativo do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('real-estate')
export class RealEstateController {
  constructor(
    private readonly listPropertiesUseCase: ListPropertiesUseCase,
    private readonly createPropertyUseCase: CreatePropertyUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os imóveis do tenant' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.listPropertiesUseCase.execute(tenantId, { type, status });
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo imóvel' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.createPropertyUseCase.execute(tenantId, dto);
  }
}
