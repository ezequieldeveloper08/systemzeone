import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepositoryToken } from '../../domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';

@Injectable()
export class GetPropertyUseCase {
  constructor(
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<Property> {
    const property = await this.propertyRepository.findById(tenantId, id);
    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }
    return property;
  }
}
