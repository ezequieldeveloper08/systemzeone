import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, PropertyPurpose, PropertyStatus, FurnishingType } from '../../domain/entities/property.entity';

export class PropertyAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty()
  @IsString()
  neighborhood: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hideExactAddress?: boolean;
}

export class PropertyAreaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  usable?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  land?: number;
}

export class PropertyRoomsDto {
  @ApiProperty()
  @IsNumber()
  bedrooms: number;

  @ApiProperty()
  @IsNumber()
  suites: number;

  @ApiProperty()
  @IsNumber()
  bathrooms: number;

  @ApiProperty()
  @IsNumber()
  parkingSpaces: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  livingRooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  kitchens?: number;
}

export class PropertyDetailsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  constructionYear?: number;

  @ApiProperty({ example: 'unfurnished' })
  @IsString()
  furnishing: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  acceptsPets?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  accessible?: boolean;
}

export class PropertyPricingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rentPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  condominiumFee?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  propertyTax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fireInsurance?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  serviceFee?: number;
}

export class PropertyFeaturesDto {
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() balcony?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() airConditioning?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() builtInCabinets?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() serviceArea?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() backyard?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() garden?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() pool?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() privatePool?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() barbecue?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() homeOffice?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() closet?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() bathtub?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() elevator?: boolean;
}

export class PropertyCondominiumFeaturesDto {
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() pool?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() gym?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() playground?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() partyRoom?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() gameRoom?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() sportsCourt?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() barbecue?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() coworking?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() laundry?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() elevator?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() concierge?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() concierge24h?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() gatedCommunity?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() garden?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() sauna?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() petArea?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() bikeRack?: boolean;
}

export class PropertyCondominiumDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyCondominiumFeaturesDto)
  features?: PropertyCondominiumFeaturesDto;
}

export class PropertyRulesDto {
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() petsAllowed?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() childrenAllowed?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() smokingAllowed?: boolean;
}

export class PropertyImageDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsNumber()
  position: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

export class PropertyVideoDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  position?: number;
}

export class PropertyMediaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ type: [PropertyImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyImageDto)
  images: PropertyImageDto[];

  @ApiProperty({ type: [PropertyVideoDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyVideoDto)
  videos?: PropertyVideoDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  virtualTourUrl?: string;
}

export class PropertyCommercialDto {
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() exclusive?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() featured?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() newListing?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() availableForVisits?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() availableFrom?: string;
}

export class PropertyUserReferenceDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}

export class PropertySeoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class CreatePropertyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'apartment' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'sale' })
  @IsString()
  purpose: string;

  @ApiProperty({ example: 'draft' })
  @IsString()
  status: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyAddressDto)
  address: PropertyAddressDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyAreaDto)
  area: PropertyAreaDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyRoomsDto)
  rooms: PropertyRoomsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  details: PropertyDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyPricingDto)
  pricing: PropertyPricingDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyFeaturesDto)
  features: PropertyFeaturesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyCondominiumDto)
  condominium?: PropertyCondominiumDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyRulesDto)
  rules?: PropertyRulesDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyMediaDto)
  media: PropertyMediaDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyCommercialDto)
  commercial: PropertyCommercialDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyUserReferenceDto)
  owner?: PropertyUserReferenceDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyUserReferenceDto)
  realtor?: PropertyUserReferenceDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyUserReferenceDto)
  agency?: PropertyUserReferenceDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertySeoDto)
  seo?: PropertySeoDto;
}
