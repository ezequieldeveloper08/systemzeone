import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuItemVariationDto {
  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Único' })
  @IsString()
  name: string;

  @ApiProperty({ example: 26.0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ChoiceItemVariationDto {
  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 2.0 })
  @IsNumber()
  additionalPrice: number;

  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  variationId?: string;
}

export class ChoiceItemDto {
  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Bacon' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ type: [ChoiceItemVariationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceItemVariationDto)
  variations?: ChoiceItemVariationDto[];
}

export class ChoiceDto {
  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Adicionais' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  choiceType?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  minChoices?: number;

  @ApiProperty({ example: 99, required: false })
  @IsOptional()
  @IsNumber()
  maxChoices?: number;

  @ApiProperty({ type: [ChoiceItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceItemDto)
  choiceItems?: ChoiceItemDto[];
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Hambúrguer Gourmet' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Blend de costela 180g, queijo cheddar, bacon crocante...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'hamburgueres', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 38.9, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 'published', required: false })
  @IsOptional()
  @IsString()
  status?: 'published' | 'hidden';

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  categoryItemId?: string;

  @ApiProperty({ type: [MenuItemVariationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemVariationDto)
  variations?: MenuItemVariationDto[];

  @ApiProperty({ type: [ChoiceDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices?: ChoiceDto[];

  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  menuId?: string;
}
