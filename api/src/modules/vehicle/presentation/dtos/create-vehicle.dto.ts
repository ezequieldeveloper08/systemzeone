import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Título de anúncio do veículo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Marca' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ description: 'Modelo' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Ano de fabricação/modelo' })
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @ApiProperty({ description: 'Descrição rica HTML ou texto do veículo' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Preço anunciado' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Preço promocional', required: false })
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ description: 'Status de publicação', enum: ['published', 'hidden'], default: 'published' })
  @IsEnum(['published', 'hidden'])
  @IsOptional()
  status?: 'published' | 'hidden';

  @ApiProperty({ description: 'Lista de URLs das imagens do veículo', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'Quilometragem rodada' })
  @IsNumber()
  @IsNotEmpty()
  km: number;

  @ApiProperty({ description: 'Câmbio/Transmissão', enum: ['automatic', 'manual'] })
  @IsEnum(['automatic', 'manual'])
  @IsNotEmpty()
  transmission: 'automatic' | 'manual';

  @ApiProperty({ description: 'Combustível', enum: ['flex', 'gasoline', 'diesel', 'electric', 'hybrid'] })
  @IsEnum(['flex', 'gasoline', 'diesel', 'electric', 'hybrid'])
  @IsNotEmpty()
  fuel: 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';

  @ApiProperty({ description: 'Cor do veículo' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'Tags/Destaques', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Coleções/Listas personalizadas', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  collections?: string[];

  // Webmotors extra details
  @ApiProperty({ description: 'Tipo de veículo', enum: ['car', 'motorcycle', 'truck'], default: 'car' })
  @IsEnum(['car', 'motorcycle', 'truck'])
  @IsOptional()
  type?: 'car' | 'motorcycle' | 'truck';

  @ApiProperty({ description: 'Placa do veículo (final ou inteira)', required: false })
  @IsString()
  @IsOptional()
  plate?: string;

  @ApiProperty({ description: 'Número de portas', required: false })
  @IsNumber()
  @IsOptional()
  doors?: number;

  @ApiProperty({ description: 'Opcionais/Acessórios do veículo', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiProperty({ description: 'Motorização (ex: 2.0 Turbo, 1.6)', required: false })
  @IsString()
  @IsOptional()
  engine?: string;

  @ApiProperty({ description: 'Carroceria (ex: SUV, Sedan)', required: false })
  @IsString()
  @IsOptional()
  bodyType?: string;
}
