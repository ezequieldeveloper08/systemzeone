import { Inject, Injectable } from '@nestjs/common';
import { IPropertyRepositoryToken } from '../../domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';

@Injectable()
export class ListPropertiesUseCase {
  constructor(
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(tenantId: string, filters?: { type?: string; status?: string }): Promise<Property[]> {
    return this.propertyRepository.findAll(tenantId, filters);
  }
}
