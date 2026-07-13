import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class SaveSettingsDto {
  @ApiProperty({ example: 'EAAOa2e...', description: 'Token de acesso permanente do desenvolvedor Meta Cloud', required: false })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({ example: '109283749827349', description: 'ID do Número de Telefone', required: false })
  @IsString()
  @IsOptional()
  phoneNumberId?: string;

  @ApiProperty({ example: '298374982374982', description: 'ID da Conta do WhatsApp Business (WABA)', required: false })
  @IsString()
  @IsOptional()
  businessAccountId?: string;

  @ApiProperty({ example: 'capri_verify_token_2026', description: 'Token de Verificação do Webhook', required: false })
  @IsString()
  @IsOptional()
  webhookVerifyToken?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @ApiProperty({ example: 'AI_API_KEY', required: false })
  @IsString()
  @IsOptional()
  aiApiKey?: string;

  @ApiProperty({ example: 'Instruções...', required: false })
  @IsString()
  @IsOptional()
  aiAgentInstructions?: string;

  @ApiProperty({ example: 'gemini-1.5-flash', required: false })
  @IsString()
  @IsOptional()
  aiModel?: string;

  @ApiProperty({ example: ['buscarVeiculosEstoque'], required: false, type: [String] })
  @IsOptional()
  aiActiveTools?: string[];
}
