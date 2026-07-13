import { Inject, Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappSettings } from '../../domain/entities/whatsapp-settings.entity';

@Injectable()
export class ExchangeMetaCodeUseCase {
  private readonly logger = new Logger(ExchangeMetaCodeUseCase.name);

  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string, code: string): Promise<WhatsappSettings> {
    this.logger.log(`Iniciando troca de código Meta para o tenant ${tenantId}...`);

    let clientAccessToken = '';
    let businessAccountId = '';
    let phoneNumberId = '';
    let numberFormatted = '5511999998888';

    if (code === 'mock_code' || !process.env.META_APP_SECRET) {
      this.logger.log(`Modo simulação ativado ou credenciais do App Meta ausentes. Utilizando mock de conexão.`);
      clientAccessToken = `mock_token_waba_${Date.now()}`;
      businessAccountId = `mock_waba_${Math.floor(Math.random() * 100000000)}`;
      phoneNumberId = `mock_phone_id_${Math.floor(Math.random() * 100000000)}`;
    } else {
      const appId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || '';
      const appSecret = process.env.META_APP_SECRET || '';
      const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000';

      try {
        // 1. Trocar o código temporário pelo System User Token do cliente
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
        const tokenRes = await fetch(tokenUrl);
        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          throw new Error(`Erro ao trocar token: ${errText}`);
        }

        const tokenData = await tokenRes.json();
        clientAccessToken = tokenData.access_token;

        // 2. Consultar o token para obter a ID da WABA (businessAccountId)
        const debugUrl = `https://graph.facebook.com/v19.0/debug_token?input_token=${clientAccessToken}&access_token=${appId}|${appSecret}`;
        const debugRes = await fetch(debugUrl);
        if (!debugRes.ok) {
          const errText = await debugRes.text();
          throw new Error(`Erro ao depurar token: ${errText}`);
        }

        const debugData = await debugRes.json();
        businessAccountId = debugData.data?.profile_id;
        if (!businessAccountId) {
          throw new Error('Não foi possível obter a ID comercial (WABA) no payload da Meta.');
        }

        // 3. Consultar números de telefone vinculados a WABA comercial
        const phoneUrl = `https://graph.facebook.com/v19.0/${businessAccountId}/phone_numbers`;
        const phoneRes = await fetch(phoneUrl, {
          headers: {
            Authorization: `Bearer ${clientAccessToken}`,
          },
        });
        if (!phoneRes.ok) {
          const errText = await phoneRes.text();
          throw new Error(`Erro ao obter números de telefone da WABA: ${errText}`);
        }

        const phoneData = await phoneRes.json();
        const firstPhone = phoneData.data?.[0];
        if (!firstPhone) {
          throw new Error('Nenhum número de telefone encontrado para a WABA selecionada.');
        }

        phoneNumberId = firstPhone.id;
        numberFormatted = firstPhone.display_phone_number?.replace(/\D/g, '') || numberFormatted;

        // 4. Inscrever a WABA do cliente nos webhooks do aplicativo central da Zeone
        const subscribeUrl = `https://graph.facebook.com/v19.0/${businessAccountId}/subscribed_apps`;
        const subscribeRes = await fetch(subscribeUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientAccessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!subscribeRes.ok) {
          const errText = await subscribeRes.text();
          this.logger.warn(`Falha não fatal ao registrar webhooks da WABA na Meta: ${errText}`);
        } else {
          this.logger.log(`WABA ${businessAccountId} inscrita com sucesso nos webhooks do aplicativo da Zeone.`);
        }
      } catch (err) {
        this.logger.error(`Falha ao conectar WABA via Embedded Signup: ${err.message}`);
        throw new BadRequestException(`Erro na integração com a Meta: ${err.message}`);
      }
    }

    // 5. Salvar ou atualizar as configurações do WhatsApp
    let settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    if (settings) {
      settings.accessToken = clientAccessToken;
      settings.phoneNumberId = phoneNumberId;
      settings.businessAccountId = businessAccountId;
      settings.status = 'connected';
    } else {
      settings = new WhatsappSettings(
        crypto.randomUUID(),
        tenantId,
        clientAccessToken,
        phoneNumberId,
        businessAccountId,
        'capri_verify_token_2026', // Token de verificação padrão local
        'connected',
        new Date(),
        new Date(),
        false, // IA desativada por padrão ao conectar novo número
        '',
        'Você é um assistente virtual atencioso para nosso negócio. Responda de forma profissional e prestativa.',
        'gemini-2.0-flash',
        [],
        [],
      );
    }

    return this.whatsappRepository.saveSettings(settings);
  }
}
