import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ezequiel Pires', description: 'Nome completo do usuário' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@capri.com.br', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Senha de acesso', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;

  @ApiProperty({ example: 'Capri Chevrolet', description: 'Nome da Concessionária (Tenant)' })
  @IsString()
  tenantName: string;

  @ApiProperty({ example: 'veiculos', description: 'Tipo de negócio (Ex: veiculos, imoveis, menu, vitrine, crm_only)', required: false })
  @IsString()
  businessType?: string;
}
