import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Inject, 
  HttpStatus, 
  NotFoundException, 
  ForbiddenException,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ITransactionRepositoryToken } from '../../domain/repositories/transaction.repository.interface';
import type { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';

@ApiTags('Financeiro')
@Controller('finance')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID da Concessionária (Tenant) ativa',
})
export class FinanceController {
  constructor(
    @Inject(ITransactionRepositoryToken)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar transações financeiras' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retorna a lista de transações.' })
  async list(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: 'revenue' | 'expense',
    @Query('status') status?: 'pending' | 'paid',
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    return this.transactionRepository.findByTenantId(tenantId, {
      type,
      status,
      startDate,
      endDate,
    });
  }

  @Get('flow')
  @ApiOperation({ summary: 'Resumo do fluxo de caixa e métricas financeiras' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retorna o resumo do fluxo de caixa.' })
  async getFlowSummary(@CurrentTenant() tenantId: string) {
    const all = await this.transactionRepository.findByTenantId(tenantId);

    let totalRevenue = 0;
    let totalExpense = 0;
    let pendingRevenue = 0;
    let pendingExpense = 0;

    for (const t of all) {
      if (t.status === 'paid') {
        if (t.type === 'revenue') totalRevenue += t.amount;
        else totalExpense += t.amount;
      } else {
        if (t.type === 'revenue') pendingRevenue += t.amount;
        else pendingExpense += t.amount;
      }
    }

    // Calcular histórico dos últimos 6 meses
    const historyMap = new Map<string, { revenue: number; expense: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      historyMap.set(key, { revenue: 0, expense: 0 });
    }

    for (const t of all) {
      if (t.status !== 'paid') continue;
      const date = t.paymentDate ? new Date(t.paymentDate) : new Date(t.dueDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (historyMap.has(key)) {
        const current = historyMap.get(key)!;
        if (t.type === 'revenue') current.revenue += t.amount;
        else current.expense += t.amount;
      }
    }

    const history = Array.from(historyMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expense: data.expense,
      balance: data.revenue - data.expense,
    }));

    return {
      metrics: {
        totalRevenue,
        totalExpense,
        balance: totalRevenue - totalExpense,
        pendingRevenue,
        pendingExpense,
      },
      history,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova transação financeira' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transação criada com sucesso.' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    const id = crypto.randomUUID();
    const transaction = new Transaction(
      id,
      tenantId,
      dto.description,
      dto.amount,
      dto.type,
      dto.status || 'pending',
      new Date(dto.dueDate),
      dto.paymentDate ? new Date(dto.paymentDate) : (dto.status === 'paid' ? new Date() : null),
      dto.category || 'outros',
      dto.vehicleId || null,
      new Date(),
      new Date(),
    );

    return this.transactionRepository.create(transaction);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma transação financeira' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transação atualizada com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transação não encontrada.' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const existing = await this.transactionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Transação não encontrada.');
    }

    if (existing.tenantId !== tenantId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta transação.');
    }

    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.amount !== undefined) existing.amount = dto.amount;
    if (dto.type !== undefined) existing.type = dto.type;
    if (dto.category !== undefined) existing.category = dto.category;
    if (dto.vehicleId !== undefined) existing.vehicleId = dto.vehicleId;
    if (dto.dueDate !== undefined) existing.dueDate = new Date(dto.dueDate);
    
    if (dto.status !== undefined) {
      existing.status = dto.status;
      if (dto.status === 'paid') {
        existing.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
      } else {
        existing.paymentDate = null;
      }
    } else if (dto.paymentDate !== undefined) {
      existing.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : null;
    }

    return this.transactionRepository.update(existing);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma transação financeira' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Transação removida com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transação não encontrada.' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const existing = await this.transactionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Transação não encontrada.');
    }

    if (existing.tenantId !== tenantId) {
      throw new ForbiddenException('Você não tem permissão para remover esta transação.');
    }

    await this.transactionRepository.delete(id);
  }
}
