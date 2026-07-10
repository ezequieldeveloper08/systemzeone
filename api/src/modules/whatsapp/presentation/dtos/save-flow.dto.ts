import { IsString, IsOptional, IsArray, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveFlowDto {
  @ApiProperty({ description: 'ID interno do fluxo (opcional para criação)', required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Nome amigável do fluxo' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do fluxo é obrigatório.' })
  name: string;

  @ApiProperty({ description: 'ID oficial do fluxo na Meta (opcional)', required: false })
  @IsString()
  @IsOptional()
  flowId?: string | null;

  @ApiProperty({ description: 'Status do fluxo (draft, published, deprecated)', required: false })
  @IsString()
  @IsOptional()
  status?: 'draft' | 'published' | 'deprecated';

  @ApiProperty({ description: 'Categorias do fluxo', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiProperty({ description: 'Configurações de telas e campos do fluxo' })
  @IsObject()
  @IsNotEmpty({ message: 'As telas (screens) do fluxo são obrigatórias.' })
  screens: Record<string, any>;
}
