import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Camiseta de Algodão Egípcio' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Camiseta premium feita 100% de algodão egípcio...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'roupas' })
  @IsString()
  category: string;

  @ApiProperty({ example: 89.9 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'published', required: false })
  @IsOptional()
  @IsString()
  status?: 'published' | 'hidden';

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}
