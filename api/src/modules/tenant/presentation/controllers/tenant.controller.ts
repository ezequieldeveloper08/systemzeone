import { Controller, Get, Put, Body, Param, UseGuards, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { ITenantRepositoryToken } from '../../domain/repositories/tenant.repository.interface';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { UpdateTenantUseCase } from '../../application/use-cases/update-tenant.use-case';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    @Inject(ITenantRepositoryToken)
    private readonly tenantRepository: ITenantRepository,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas (Tenants)' })
  async getTenants() {
    return this.tenantRepository.findAll();
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Obter detalhes da empresa por slug ou ID' })
  async getTenantBySlug(@Param('slug') slug: string) {
    const tenants = await this.tenantRepository.findAll();
    
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };

    const targetSlug = slugify(slug);
    let tenant = tenants.find((t) => slugify(t.name) === targetSlug || t.id === slug);

    if (!tenant) {
      // Fallback: match by keywords longer than 2 characters, ignoring common noise words
      const noiseWords = new Set(['cia', 'hamburgueria', 'restaurante', 'bar', 'delivery', 'comidas', 'lanches']);
      const slugWords = targetSlug.split('-').filter(w => w.length > 2 && !noiseWords.has(w));
      
      if (slugWords.length > 0) {
        tenant = tenants.find((t) => {
          const tenantSlug = slugify(t.name);
          return slugWords.every(word => tenantSlug.includes(word));
        });
      }
    }

    if (!tenant) {
      throw new NotFoundException(`Empresa com slug ou ID "${slug}" não encontrada.`);
    }
    return tenant;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes da empresa (Tenant)' })
  async getTenant(@Param('id') id: string) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
    }
    return tenant;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar detalhes da empresa (Tenant)' })
  async updateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.updateTenantUseCase.execute(id, dto);
  }
}
