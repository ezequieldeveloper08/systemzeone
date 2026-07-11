import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { CreateOrderUseCase, CreateOrderDto } from '../../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../../application/use-cases/list-orders.use-case';
import { GetOrderHistoryUseCase, GetOrderHistoryDto } from '../../application/use-cases/get-order-history.use-case';
import { UpdateOrderStatusUseCase, UpdateOrderStatusDto } from '../../application/use-cases/update-order-status.use-case';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID do Tenant ativo do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderHistoryUseCase: GetOrderHistoryUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos da unidade' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.listOrdersUseCase.execute(tenantId, status);
  }

  @Get('history')
  @ApiOperation({ summary: 'Obter o histórico paginado e filtrado de pedidos da unidade' })
  async getHistory(
    @CurrentTenant() tenantId: string,
    @Query() dto: GetOrderHistoryDto,
  ) {
    return this.getOrderHistoryUseCase.execute(tenantId, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido para a unidade' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.createOrderUseCase.execute(tenantId, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de um pedido' })
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(tenantId, id, dto);
  }
}
