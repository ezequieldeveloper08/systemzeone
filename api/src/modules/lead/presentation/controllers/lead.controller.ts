import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { LeadService } from '../../application/services/lead.service';

export class CreateLeadDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email do cliente' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Mensagem do contato', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Origem do lead (ex: website, whatsapp, webmotors)', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ description: 'ID do veículo de interesse', required: false })
  @IsString()
  @IsOptional()
  vehicleId?: string;
}

export class UpdateLeadDto {
  @ApiProperty({ description: 'Nome do cliente', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Telefone do cliente', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Mensagem do contato', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Status do lead', enum: ['new', 'contacted', 'in_negotiation', 'won', 'lost'], required: false })
  @IsEnum(['new', 'contacted', 'in_negotiation', 'won', 'lost'])
  @IsOptional()
  status?: 'new' | 'contacted' | 'in_negotiation' | 'won' | 'lost';

  @ApiProperty({ description: 'Origem do lead', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ description: 'Observações internas da concessionária', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'ID do veículo de interesse', required: false })
  @IsString()
  @IsOptional()
  vehicleId?: string;
}

@ApiTags('Leads')
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  // 1. PUBLIC ENDPOINT: Create Lead from website contact form
  @Post('public')
  @ApiOperation({ summary: 'Enviar um lead de forma pública (formulário do site)' })
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da concessionária destino' })
  async createPublic(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateLeadDto,
  ) {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('O cabeçalho x-tenant-id é obrigatório.');
    }
    return this.leadService.create(tenantId, dto);
  }

  // 2. ADMIN ENDPOINTS (Protected)
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Listar todos os leads da concessionária' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.leadService.findAll(tenantId, { status, source });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Obter detalhes de um lead' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.leadService.findOne(tenantId, id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Criar um lead manualmente' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Atualizar informações/status de um lead' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um lead' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.leadService.delete(tenantId, id);
  }
}
