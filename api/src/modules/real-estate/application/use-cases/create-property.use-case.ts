import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IPropertyRepositoryToken } from '../../domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property, PropertyType, PropertyPurpose, PropertyStatus, FurnishingType } from '../../domain/entities/property.entity';
import { CreatePropertyDto } from '../../presentation/dtos/create-property.dto';

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(tenantId: string, dto: CreatePropertyDto): Promise<Property> {
    const property = new Property();
    property.id = crypto.randomUUID();
    property.tenantId = tenantId;
    property.code = dto.code;
    property.title = dto.title;
    property.description = dto.description;
    property.slug = dto.slug;
    property.type = dto.type as PropertyType;
    property.purpose = dto.purpose as PropertyPurpose;
    property.status = (dto.status || 'draft') as PropertyStatus;
    property.address = dto.address;
    property.area = dto.area;
    property.rooms = dto.rooms;
    property.details = dto.details ? {
      ...dto.details,
      furnishing: dto.details.furnishing as FurnishingType
    } : dto.details as any;
    property.pricing = dto.pricing;
    property.features = dto.features;
    property.condominium = dto.condominium;
    property.rules = dto.rules;
    property.media = dto.media;
    property.commercial = dto.commercial;
    property.owner = dto.owner;
    property.realtor = dto.realtor;
    property.agency = dto.agency;
    property.seo = dto.seo;
    property.createdAt = new Date();
    property.updatedAt = new Date();

    return this.propertyRepository.save(property);
  }
}
