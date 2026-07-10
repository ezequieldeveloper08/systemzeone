import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamMemberDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome do membro da equipe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'joao@concessionaria.com.br', description: 'Email do membro', required: false })
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '123456', description: 'Senha de acesso do membro', required: false })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'vendedor', description: 'Cargo do membro', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}
