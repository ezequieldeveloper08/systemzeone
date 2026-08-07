import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepositoryToken } from '../../domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';

@Injectable()
export class DeletePropertyUseCase {
  constructor(
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const property = await this.propertyRepository.findById(tenantId, id);
    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }
    await this.propertyRepository.delete(tenantId, id);
  }
}
