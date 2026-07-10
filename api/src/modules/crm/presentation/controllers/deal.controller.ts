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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { DealService } from '../../application/services/deal.service';
import { DealStatus } from '../../infrastructure/database/deal.orm-entity';

export class CreateDealDto {
  @ApiProperty({ description: 'ID do contato' })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiProperty({ description: 'ID do pipeline', required: false })
  @IsString()
  @IsOptional()
  pipelineId?: string;

  @ApiProperty({ description: 'ID da etapa do pipeline', required: false })
  @IsString()
  @IsOptional()
  stageId?: string;

  @ApiProperty({ description: 'Título da oportunidade' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descrição da oportunidade', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Valor estimado', required: false })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiProperty({ description: 'Moeda', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'ID do veículo de interesse', required: false })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ description: 'ID do responsável', required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ description: 'Previsão de fechamento', required: false })
  @IsString()
  @IsOptional()
  expectedCloseDate?: string;
}

export class UpdateDealDto {
  @ApiProperty({ description: 'Título da oportunidade', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Descrição', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Valor', required: false })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiProperty({ description: 'Moeda', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'ID da etapa do pipeline', required: false })
  @IsString()
  @IsOptional()
  stageId?: string;

  @ApiProperty({ description: 'Status do negócio', enum: DealStatus, required: false })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @ApiProperty({ description: 'ID do veículo de interesse', required: false })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ description: 'ID do responsável', required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ description: 'Previsão de fechamento', required: false })
  @IsString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiProperty({ description: 'Motivo da perda', required: false })
  @IsString()
  @IsOptional()
  lostReason?: string;
}

@ApiTags('Oportunidades (Deals)')
@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Listar todas as oportunidades comercial' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('pipelineId') pipelineId?: string,
    @Query('status') status?: string,
  ) {
    return this.dealService.findAll(tenantId, { pipelineId, status });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Obter detalhes de um negócio' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dealService.findOne(tenantId, id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Criar um negócio' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateDealDto,
  ) {
    return this.dealService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Atualizar um negócio (incluindo etapa)' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir uma oportunidade' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.dealService.delete(tenantId, id);
  }
}
