import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@capri.com.br', description: 'E-mail cadastrado' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Senha de acesso' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;
}
