import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendFlowMessageDto {
  @ApiProperty({ description: 'Número de telefone do destinatário (com DDI/DDD)' })
  @IsString()
  @IsNotEmpty({ message: 'O telefone do destinatário é obrigatório.' })
  recipientPhone: string;

  @ApiProperty({ description: 'Nome do destinatário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do destinatário é obrigatório.' })
  recipientName: string;

  @ApiProperty({ description: 'ID interno do fluxo a ser enviado' })
  @IsString()
  @IsNotEmpty({ message: 'O ID do fluxo é obrigatório.' })
  flowId: string;

  @ApiProperty({ description: 'Texto do corpo da mensagem que acompanha o botão' })
  @IsString()
  @IsNotEmpty({ message: 'O texto da mensagem é obrigatório.' })
  bodyText: string;

  @ApiProperty({ description: 'Texto exibido no botão que abre o fluxo' })
  @IsString()
  @IsNotEmpty({ message: 'O rótulo do botão (CTA) é obrigatório.' })
  flowCta: string;

  @ApiProperty({ description: 'Texto do cabeçalho da mensagem (opcional)', required: false })
  @IsString()
  @IsOptional()
  headerText?: string;

  @ApiProperty({ description: 'Texto do rodapé da mensagem (opcional)', required: false })
  @IsString()
  @IsOptional()
  footerText?: string;
}
