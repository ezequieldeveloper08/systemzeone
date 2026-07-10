import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Nome do template', example: 'boas_vindas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Categoria', enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'], example: 'UTILITY' })
  @IsEnum(['MARKETING', 'UTILITY', 'AUTHENTICATION'])
  @IsNotEmpty()
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

  @ApiProperty({ description: 'Idioma', example: 'pt_BR', default: 'pt_BR' })
  @IsString()
  @IsOptional()
  language: string;

  @ApiProperty({ description: 'Corpo da mensagem', example: 'Olá {{1}}!' })
  @IsString()
  @IsNotEmpty()
  bodyText: string;

  @ApiProperty({ description: 'Texto do cabeçalho', required: false })
  @IsString()
  @IsOptional()
  headerText?: string;

  @ApiProperty({ description: 'Texto do rodapé', required: false })
  @IsString()
  @IsOptional()
  footerText?: string;
}
