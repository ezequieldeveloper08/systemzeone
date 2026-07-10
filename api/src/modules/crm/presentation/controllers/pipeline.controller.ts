import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { PipelineService } from '../../application/services/pipeline.service';

@ApiTags('Pipelines e Etapas')
@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Obter pipelines e suas etapas' })
  async getPipelines(@CurrentTenant() tenantId: string) {
    return this.pipelineService.getPipelines(tenantId);
  }

  @Get(':id/stages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID da Concessionária' })
  @ApiOperation({ summary: 'Obter etapas de um pipeline específico' })
  async getStages(
    @CurrentTenant() tenantId: string,
    @Param('id') pipelineId: string,
  ) {
    return this.pipelineService.getStages(tenantId, pipelineId);
  }
}
