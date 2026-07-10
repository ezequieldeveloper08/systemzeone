import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { ActivityService } from '../../application/services/activity.service';
import { ActivityType } from '../../infrastructure/database/activity.orm-entity';

export class CreateActivityDto {
  @ApiProperty({ description: 'ID do contato associado' })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiProperty({ description: 'ID do negócio/oportunidade associado', required: false })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiProperty({ description: 'Tipo da atividade', enum: ActivityType })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

  @ApiProperty({ description: 'Título da atividade' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descrição da atividade', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

@ApiTags('Atividades (Histórico)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
@Controller('crm/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um registro de atividade manual (nota, ligação, etc.)' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activityService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de atividades' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('contactId') contactId?: string,
    @Query('dealId') dealId?: string,
  ) {
    return this.activityService.findAll(tenantId, { contactId, dealId });
  }
}
