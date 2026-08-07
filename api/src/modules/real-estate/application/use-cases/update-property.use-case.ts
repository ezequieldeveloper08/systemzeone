import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepositoryToken } from '../../domain/repositories/property.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property, PropertyType, PropertyPurpose, PropertyStatus, FurnishingType } from '../../domain/entities/property.entity';
import { UpdatePropertyDto } from '../../presentation/dtos/update-property.dto';

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    @Inject(IPropertyRepositoryToken)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(tenantId: string, id: string, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.propertyRepository.findById(tenantId, id);
    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (dto.code !== undefined) property.code = dto.code;
    if (dto.title !== undefined) property.title = dto.title;
    if (dto.description !== undefined) property.description = dto.description;
    if (dto.slug !== undefined) property.slug = dto.slug;
    if (dto.type !== undefined) property.type = dto.type as PropertyType;
    if (dto.purpose !== undefined) property.purpose = dto.purpose as PropertyPurpose;
    if (dto.status !== undefined) property.status = dto.status as PropertyStatus;
    if (dto.address !== undefined) property.address = dto.address;
    if (dto.area !== undefined) property.area = dto.area;
    if (dto.rooms !== undefined) property.rooms = dto.rooms;
    if (dto.details !== undefined) {
      property.details = {
        ...dto.details,
        furnishing: dto.details.furnishing as FurnishingType
      };
    }
    if (dto.pricing !== undefined) property.pricing = dto.pricing;
    if (dto.features !== undefined) property.features = dto.features;
    if (dto.condominium !== undefined) property.condominium = dto.condominium;
    if (dto.rules !== undefined) property.rules = dto.rules;
    if (dto.media !== undefined) property.media = dto.media;
    if (dto.commercial !== undefined) property.commercial = dto.commercial;
    if (dto.owner !== undefined) property.owner = dto.owner;
    if (dto.realtor !== undefined) property.realtor = dto.realtor;
    if (dto.agency !== undefined) property.agency = dto.agency;
    if (dto.seo !== undefined) property.seo = dto.seo;
    property.updatedAt = new Date();

    return this.propertyRepository.save(property);
  }
}
