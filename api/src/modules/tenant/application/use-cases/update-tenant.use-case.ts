import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITenantRepositoryToken } from '../../domain/repositories/tenant.repository.interface';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { Tenant } from '../../domain/entities/tenant.entity';
import { UpdateTenantDto } from '../../presentation/dtos/update-tenant.dto';

@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject(ITenantRepositoryToken)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant com ID ${id} não encontrado.`);
    }

    if (dto.name !== undefined) tenant.name = dto.name;
    if (dto.logo !== undefined) tenant.logo = dto.logo;
    if (dto.banner !== undefined) tenant.banner = dto.banner;
    if (dto.bio !== undefined) tenant.bio = dto.bio;
    if (dto.phone !== undefined) tenant.phone = dto.phone;
    if (dto.address !== undefined) tenant.address = dto.address;
    if (dto.openingHours !== undefined) tenant.openingHours = dto.openingHours;
    if (dto.instagram !== undefined) tenant.instagram = dto.instagram;
    if (dto.facebook !== undefined) tenant.facebook = dto.facebook;

    return this.tenantRepository.save(tenant);
  }
}
