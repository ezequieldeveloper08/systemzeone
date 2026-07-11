import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Hambúrguer Gourmet' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Blend de costela 180g, queijo cheddar, bacon crocante...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'hamburgueres' })
  @IsString()
  category: string;

  @ApiProperty({ example: 38.9 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'published', required: false })
  @IsOptional()
  @IsString()
  status?: 'published' | 'hidden';

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ type: [Object], required: false })
  @IsOptional()
  choiceGroups?: any[];

  @ApiProperty({ example: '32ebdb3c-f4f0-4fa2-938a-1153de584e03', required: false })
  @IsOptional()
  @IsString()
  menuId?: string;
}
