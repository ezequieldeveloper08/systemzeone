import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ExchangeCodeDto {
  @ApiProperty({ example: 'AQD123...', description: 'Código de autorização retornado pelo Embedded Signup' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
