import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { CreateProductDto } from '../dtos/create-product.dto';

@ApiTags('DigitalShowcase')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID do Tenant ativo do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('digital-showcase')
export class DigitalShowcaseController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos da vitrine do tenant' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.listProductsUseCase.execute(tenantId, { category, status });
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo produto na vitrine' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.createProductUseCase.execute(tenantId, dto);
  }
}
