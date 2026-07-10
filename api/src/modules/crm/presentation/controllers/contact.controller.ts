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
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ContactService } from '../../application/services/contact.service';
import { ContactType, LifecycleStage, ContactStatus, ContactSource, LeadTemperature, DocumentType } from '../../infrastructure/database/contact.orm-entity';

export class CreateContactDto {
  @ApiProperty({ description: 'Nome do contato' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Telefone do contato' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Email do contato', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Tipo do contato', enum: ContactType, required: false })
  @IsEnum(ContactType)
  @IsOptional()
  type?: ContactType;

  @ApiProperty({ description: 'Estágio do ciclo de vida', enum: LifecycleStage, required: false })
  @IsEnum(LifecycleStage)
  @IsOptional()
  lifecycleStage?: LifecycleStage;

  @ApiProperty({ description: 'Status do contato', enum: ContactStatus, required: false })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiProperty({ description: 'Origem do contato', enum: ContactSource, required: false })
  @IsEnum(ContactSource)
  @IsOptional()
  source?: ContactSource;

  @ApiProperty({ description: 'Detalhes da origem', required: false })
  @IsString()
  @IsOptional()
  sourceDetails?: string;

  @ApiProperty({ description: 'Observações internas', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'ID do responsável', required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;
}

export class UpdateContactDto {
  @ApiProperty({ description: 'Nome do contato', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Nome de exibição', required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ description: 'Telefone do contato', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Email do contato', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Tipo do contato', enum: ContactType, required: false })
  @IsEnum(ContactType)
  @IsOptional()
  type?: ContactType;

  @ApiProperty({ description: 'Tipo de documento', enum: DocumentType, required: false })
  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @ApiProperty({ description: 'Número do documento (CPF/CNPJ)', required: false })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiProperty({ description: 'Nome da empresa', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ description: 'Cargo na empresa', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ description: 'Estágio do ciclo de vida', enum: LifecycleStage, required: false })
  @IsEnum(LifecycleStage)
  @IsOptional()
  lifecycleStage?: LifecycleStage;

  @ApiProperty({ description: 'Status do contato', enum: ContactStatus, required: false })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiProperty({ description: 'Origem do contato', enum: ContactSource, required: false })
  @IsEnum(ContactSource)
  @IsOptional()
  source?: ContactSource;

  @ApiProperty({ description: 'Detalhes da origem', required: false })
  @IsString()
  @IsOptional()
  sourceDetails?: string;

  @ApiProperty({ description: 'ID do responsável', required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ description: 'Pontuação do lead', required: false })
  @IsOptional()
  leadScore?: number;

  @ApiProperty({ description: 'Temperatura do lead', enum: LeadTemperature, required: false })
  @IsEnum(LeadTemperature)
  @IsOptional()
  temperature?: LeadTemperature;

  @ApiProperty({ description: 'Motivo de perda', required: false })
  @IsString()
  @IsOptional()
  lostReason?: string;

  @ApiProperty({ description: 'Observações internas', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

@ApiTags('Contatos')
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // 1. PUBLIC ENDPOINT: Create Contact as LEAD from public site form
  @Post('public')
  @ApiOperation({ summary: 'Enviar um contato de forma pública (formulário do site)' })
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da concessionária destino' })
  async createPublic(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateContactDto,
  ) {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('O cabeçalho x-tenant-id é obrigatório.');
    }
    return this.contactService.create(tenantId, {
      ...dto,
      source: ContactSource.WEBSITE,
      lifecycleStage: LifecycleStage.LEAD,
      status: ContactStatus.NEW,
    });
  }

  // 2. ADMIN ENDPOINTS (Protected)
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Listar todos os contatos da concessionária' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('lifecycleStage') lifecycleStage?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('q') q?: string,
  ) {
    return this.contactService.findAll(tenantId, { lifecycleStage, status, source, q });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Obter detalhes de um contato' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.contactService.findOne(tenantId, id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Criar um contato manualmente' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Atualizar informações de um contato' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um contato' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.contactService.delete(tenantId, id);
  }
}
