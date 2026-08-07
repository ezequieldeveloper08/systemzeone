import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '5562999999999', description: 'Número do destinatário com DDI e DDD' })
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @ApiProperty({ example: 'Carlos Silva', description: 'Nome do destinatário' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: 'Olá, obrigado pelo retorno! Em que posso ajudar?', description: 'Corpo da mensagem de texto livre', required: false })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @ApiProperty({ example: 'a2b3c4d5-e6f7-8901-2345-6789abcdef01', required: false, description: 'ID do Contato correspondente' })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiProperty({ example: 'text', required: false, enum: ['text', 'image', 'interactive', 'audio'] })
  @IsString()
  @IsOptional()
  type?: 'text' | 'image' | 'interactive' | 'audio';

  @ApiProperty({ example: 'https://example.com/image.png', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'button', required: false, enum: ['cta_url', 'list', 'button'] })
  @IsString()
  @IsOptional()
  interactiveType?: 'cta_url' | 'list' | 'button';

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  interactiveData?: any;

  @ApiProperty({ example: 'whatsapp', required: false, enum: ['whatsapp', 'instagram', 'facebook'] })
  @IsString()
  @IsOptional()
  channel?: 'whatsapp' | 'instagram' | 'facebook';
}
