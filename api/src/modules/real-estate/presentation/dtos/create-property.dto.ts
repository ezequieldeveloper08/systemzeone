import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Apartamento de Luxo nos Jardins' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Excelente apartamento com 3 suítes, varanda gourmet...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'apartamento' })
  @IsString()
  type: string;

  @ApiProperty({ example: 1200000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  bedrooms: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  bathrooms: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  area: number;

  @ApiProperty({ example: 'published', required: false })
  @IsOptional()
  @IsString()
  status?: 'published' | 'hidden';

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}
