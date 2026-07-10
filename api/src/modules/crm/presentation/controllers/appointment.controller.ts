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
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AppointmentService } from '../../application/services/appointment.service';
import { AppointmentStatus } from '../../infrastructure/database/appointment.orm-entity';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID do contato associado', required: false })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiProperty({ description: 'ID do negócio/oportunidade associado', required: false })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiProperty({ description: 'Título do compromisso/agendamento' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descrição do compromisso', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Local do compromisso', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Data e hora de início (ISO string)' })
  @IsString()
  @IsNotEmpty()
  startAt: string;

  @ApiProperty({ description: 'Data e hora de término (ISO string)' })
  @IsString()
  @IsNotEmpty()
  endAt: string;

  @ApiProperty({ description: 'ID do usuário responsável pelo atendimento', required: false })
  @IsString()
  @IsOptional()
  assignedToUserId?: string;

  @ApiProperty({ description: 'ID do evento do Google Calendar caso integrado', required: false })
  @IsString()
  @IsOptional()
  googleCalendarEventId?: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ description: 'Título do compromisso', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Descrição do compromisso', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Local do compromisso', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Data e hora de início (ISO string)', required: false })
  @IsString()
  @IsOptional()
  startAt?: string;

  @ApiProperty({ description: 'Data e hora de término (ISO string)', required: false })
  @IsString()
  @IsOptional()
  endAt?: string;

  @ApiProperty({ description: 'Status do compromisso', enum: AppointmentStatus, required: false })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ description: 'ID do usuário responsável', required: false })
  @IsString()
  @IsOptional()
  assignedToUserId?: string;

  @ApiProperty({ description: 'ID do evento do Google Calendar', required: false })
  @IsString()
  @IsOptional()
  googleCalendarEventId?: string;
}

@ApiTags('Agendamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
@Controller('crm/appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo agendamento' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('contactId') contactId?: string,
    @Query('dealId') dealId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('assignedToUserId') assignedToUserId?: string,
  ) {
    return this.appointmentService.findAll(tenantId, { contactId, dealId, status, assignedToUserId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um agendamento' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar ou Reagendar um agendamento' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(tenantId, id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar um agendamento' })
  async cancel(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.appointmentService.cancel(tenantId, id, user.id);
  }
}
