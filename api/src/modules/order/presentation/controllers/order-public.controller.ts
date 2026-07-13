import { Controller, Get, Post, Put, Body, Param, Inject, NotFoundException, BadRequestException, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateOrderUseCase, CreateOrderDto } from '../../application/use-cases/create-order.use-case';
import { IOrderRepositoryToken } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';

@ApiTags('Orders Public')
@Controller('orders-public')
export class OrderPublicController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido de forma pública' })
  async create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() dto: CreateOrderDto & { tenantId?: string },
  ) {
    const tenantId = tenantIdHeader || dto.tenantId;
    if (!tenantId) {
      throw new BadRequestException('O parâmetro tenantId é obrigatório no cabeçalho ou corpo.');
    }
    return this.createOrderUseCase.execute(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um pedido de forma pública' })
  async findOne(@Param('id') id: string) {
    const order = await this.orderRepository.findByIdPublic(id);
    if (!order) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado.`);
    }
    return order;
  }

  @Put(':id/status-mock')
  @ApiOperation({ summary: 'MOCK: Atualizar o status de um pedido de forma pública para testes' })
  async updateStatusMock(
    @Param('id') id: string,
    @Body() dto: { status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'finished' | 'cancelled' },
  ) {
    const order = await this.orderRepository.findByIdPublic(id);
    if (!order) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado.`);
    }
    return this.updateOrderStatusUseCase.execute(order.tenantId, id, { status: dto.status });
  }
}
