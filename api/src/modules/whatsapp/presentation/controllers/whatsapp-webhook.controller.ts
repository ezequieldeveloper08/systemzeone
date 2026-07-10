import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { HandleMetaWebhookUseCase } from '../../application/use-cases/handle-meta-webhook.use-case';
import { HandleWhatsappFlowWebhookUseCase } from '../../application/use-cases/handle-flow-webhook.use-case';

@ApiTags('WhatsApp Webhook Público')
@Controller('whatsapp/webhook')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(
    private readonly handleWebhookUseCase: HandleMetaWebhookUseCase,
    private readonly handleFlowWebhookUseCase: HandleWhatsappFlowWebhookUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificação do Webhook da Meta (Desafio Challenge)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const defaultVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'capri_verify_token_2026';

    this.logger.log(`Recebida solicitação de verificação do Webhook Meta: mode=${mode}, token=${token}`);

    if (mode === 'subscribe' && token === defaultVerifyToken) {
      this.logger.log('✅ Webhook da Meta verificado com sucesso.');
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      this.logger.warn(`❌ Falha na verificação do Webhook da Meta. Token esperado: ${defaultVerifyToken}, recebido: ${token}`);
      return res.status(HttpStatus.FORBIDDEN).send('Verification token mismatch');
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receber eventos em tempo real da Meta (mensagens e status)' })
  async handleWebhook(@Body() body: any) {
    this.logger.log('📥 Novo evento recebido no Webhook do WhatsApp da Meta');
    this.logger.debug(`Payload do Webhook: ${JSON.stringify(body, null, 2)}`);

    // Process async in the background to ensure quick 200 response to Meta
    this.handleWebhookUseCase.execute(body).catch(err => {
      this.logger.error('Erro ao processar webhook da Meta:', err);
    });
    
    return { status: 'EVENT_RECEIVED' };
  }

  @Post('flows')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint de Troca de Dados (Data Exchange) do WhatsApp Flows' })
  async handleFlowWebhook(
    @Body() body: any,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.handleFlowWebhookUseCase.execute(body, tenantId);
  }
}
