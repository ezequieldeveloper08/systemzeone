import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IPropertyRepositoryToken } from '../../domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';
import { CreatePropertyDto } from '../../presentation/dtos/create-property.dto';

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(tenantId: string, dto: CreatePropertyDto): Promise<Property> {
    const property = new Property(
      crypto.randomUUID(),
      tenantId,
      dto.title,
      dto.description,
      dto.type,
      dto.price,
      dto.bedrooms,
      dto.bathrooms,
      dto.area,
      dto.status || 'published',
      dto.images || [],
      new Date(),
      new Date(),
    );

    return this.propertyRepository.save(property);
  }
}
