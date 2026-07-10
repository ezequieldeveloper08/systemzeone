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
import { TaskService } from '../../application/services/task.service';
import { TaskStatus, TaskPriority } from '../../infrastructure/database/task.orm-entity';

export class CreateTaskDto {
  @ApiProperty({ description: 'ID do contato associado', required: false })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiProperty({ description: 'ID do negócio/oportunidade associado', required: false })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiProperty({ description: 'ID da conversa associada', required: false })
  @IsString()
  @IsOptional()
  conversationId?: string;

  @ApiProperty({ description: 'Título da tarefa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descrição da tarefa', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Status inicial', enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ description: 'Prioridade', enum: TaskPriority, required: false })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ description: 'ID do usuário responsável', required: false })
  @IsString()
  @IsOptional()
  assignedToUserId?: string;

  @ApiProperty({ description: 'Data de vencimento', required: false })
  @IsString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ description: 'Título da tarefa', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Descrição da tarefa', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Status', enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ description: 'Prioridade', enum: TaskPriority, required: false })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ description: 'ID do usuário responsável', required: false })
  @IsString()
  @IsOptional()
  assignedToUserId?: string;

  @ApiProperty({ description: 'Data de vencimento', required: false })
  @IsString()
  @IsOptional()
  dueDate?: string;
}

@ApiTags('Tarefas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
@Controller('crm/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('contactId') contactId?: string,
    @Query('dealId') dealId?: string,
    @Query('status') status?: TaskStatus,
    @Query('assignedToUserId') assignedToUserId?: string,
  ) {
    return this.taskService.findAll(tenantId, { contactId, dealId, status, assignedToUserId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma tarefa' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.taskService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(tenantId, id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma tarefa (Soft Delete)' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.taskService.delete(tenantId, id);
  }
}
