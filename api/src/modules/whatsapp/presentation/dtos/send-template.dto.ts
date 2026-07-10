import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class SendTemplateDto {
  @ApiProperty({ example: '5562999999999', description: 'Número do destinatário com DDI e DDD' })
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @ApiProperty({ example: 'Carlos Silva', description: 'Nome do destinatário' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: 'boas_vindas', description: 'Nome do template cadastrado na Meta' })
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @ApiProperty({
    example: { param_1: 'Carlos', param_2: 'Capri Chevrolet', param_3: 'Chevrolet Tracker' },
    description: 'Chaves e valores para as variáveis {{1}}, {{2}}... do template',
  })
  @IsObject()
  variables: Record<string, string>;

  @ApiProperty({ example: 'a2b3c4d5-e6f7-8901-2345-6789abcdef01', required: false, description: 'ID do Contato correspondente' })
  @IsString()
  @IsOptional()
  contactId?: string;
}
