import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { WhatsappSettings } from '../../domain/entities/whatsapp-settings.entity';

@Injectable()
export class MetaWhatsappService {
  private readonly logger = new Logger(MetaWhatsappService.name);

  private isMock(settings: WhatsappSettings): boolean {
    return (
      !settings.accessToken ||
      settings.accessToken.startsWith('mock') ||
      settings.phoneNumberId.startsWith('mock') ||
      settings.businessAccountId.startsWith('mock')
    );
  }

  private formatRecipientPhone(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 55 (Brazil) and has 12 digits (missing the 9th digit)
    if (cleaned.startsWith('55') && cleaned.length === 12) {
      const ddd = cleaned.slice(2, 4);
      const rest = cleaned.slice(4);
      // In Brazil, all mobile numbers have 9 digits. We insert the '9' after the DDD.
      return `55${ddd}9${rest}`;
    }
    
    return cleaned;
  }

  async sendTemplateMessage(
    settings: WhatsappSettings,
    recipientPhone: string,
    templateName: string,
    language: string,
    variables: Record<string, string>,
  ): Promise<{ messageId: string }> {
    const formattedPhone = this.formatRecipientPhone(recipientPhone);

    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando envio de template simulado (Mock) para ${formattedPhone}.`);
      return { messageId: `wamid.HBgMNTU2Mjk4MTI3Mzg1FQIAERgSRDMxQzU2NDVDMTg1QzhFOUU1AA==` };
    }

    const url = `https://graph.facebook.com/v17.0/${settings.phoneNumberId}/messages`;
    
    // Map variables to the sequential format Meta requires: [{ type: 'text', text: 'value1' }, ...]
    // Sort variables by key (e.g., param1, param2) to ensure order
    const sortedKeys = Object.keys(variables).sort();
    const parameters = sortedKeys.map(key => ({
      type: 'text',
      text: variables[key],
    }));

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: parameters.length > 0 ? [
          {
            type: 'body',
            parameters,
          },
        ] : [],
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Cloud API.');
      }

      return { messageId: resData?.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Falha no disparo do template da Meta para ${formattedPhone}: ${error.message}`);
      throw error;
    }
  }

  async sendFreeTextMessage(
    settings: WhatsappSettings,
    recipientPhone: string,
    bodyText: string,
  ): Promise<{ messageId: string }> {
    const formattedPhone = this.formatRecipientPhone(recipientPhone);

    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando envio de mensagem de texto livre simulado (Mock) para ${formattedPhone}.`);
      return { messageId: `wamid.HBgMNTU2Mjk4MTI3Mzg1FQIAERgSRDMxQzU2NDVDMTg1QzhFOUU1AB==` };
    }

    const url = `https://graph.facebook.com/v17.0/${settings.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        body: bodyText,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Cloud API.');
      }

      return { messageId: resData?.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Falha no disparo de mensagem livre da Meta para ${formattedPhone}: ${error.message}`);
      throw error;
    }
  }

  async sendImageMessage(
    settings: WhatsappSettings,
    recipientPhone: string,
    imageUrl: string,
    caption?: string,
  ): Promise<{ messageId: string }> {
    const formattedPhone = this.formatRecipientPhone(recipientPhone);

    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando envio de imagem simulado (Mock) para ${formattedPhone}.`);
      return { messageId: `wamid.HBgMNTU2Mjk4MTI3Mzg1FQIAERgSRDMxQzU2NDVDMTg1QzhFOUU1AC==` };
    }

    let finalImageUrl = imageUrl;
    if (imageUrl.includes('localhost:3001') || imageUrl.includes('127.0.0.1:3001')) {
      try {
        const tunnelRes = await fetch('http://127.0.0.1:4040/api/tunnels');
        if (tunnelRes.ok) {
          const tunnelsData = await tunnelRes.json();
          const activeTunnel = tunnelsData.tunnels?.find((t: any) => t.config?.addr?.includes('3001'));
          if (activeTunnel?.public_url) {
            finalImageUrl = imageUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):3001/i, activeTunnel.public_url);
            this.logger.log(`Substituída URL local por túnel ngrok público: ${finalImageUrl}`);
          }
        }
      } catch (err) {
        this.logger.warn(`Não foi possível obter URL pública do ngrok: ${err.message}`);
      }
    }

    const url = `https://graph.facebook.com/v17.0/${settings.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'image',
      image: {
        link: finalImageUrl,
        ...(caption ? { caption } : {}),
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Cloud API.');
      }

      return { messageId: resData?.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Falha no disparo de imagem da Meta para ${formattedPhone}: ${error.message}`);
      throw error;
    }
  }

  async sendAudioMessage(
    settings: WhatsappSettings,
    recipientPhone: string,
    audioUrl: string,
  ): Promise<{ messageId: string }> {
    const formattedPhone = this.formatRecipientPhone(recipientPhone);

    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando envio de áudio simulado (Mock) para ${formattedPhone}.`);
      return { messageId: `wamid.HBgMNTU2Mjk4MTI3Mzg1FQIAERgSRDMxQzU2NDVDMTg1QzhFOUU1AE==` };
    }

    let finalAudioUrl = audioUrl;
    if (audioUrl.includes('localhost:3001') || audioUrl.includes('127.0.0.1:3001')) {
      try {
        const tunnelRes = await fetch('http://127.0.0.1:4040/api/tunnels');
        if (tunnelRes.ok) {
          const tunnelsData = await tunnelRes.json();
          const activeTunnel = tunnelsData.tunnels?.find((t: any) => t.config?.addr?.includes('3001'));
          if (activeTunnel?.public_url) {
            finalAudioUrl = audioUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):3001/i, activeTunnel.public_url);
            this.logger.log(`Substituída URL local de áudio por túnel ngrok público: ${finalAudioUrl}`);
          }
        }
      } catch (err) {
        this.logger.warn(`Não foi possível obter URL pública do ngrok: ${err.message}`);
      }
    }

    const url = `https://graph.facebook.com/v17.0/${settings.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'audio',
      audio: {
        link: finalAudioUrl,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Cloud API.');
      }

      return { messageId: resData?.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Falha no disparo de áudio da Meta para ${formattedPhone}: ${error.message}`);
      throw error;
    }
  }

  async sendInteractiveMessage(
    settings: WhatsappSettings,
    recipientPhone: string,
    interactiveType: 'cta_url' | 'list' | 'button',
    interactiveData: any,
  ): Promise<{ messageId: string }> {
    const formattedPhone = this.formatRecipientPhone(recipientPhone);

    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando envio de mensagem interativa simulada (Mock) para ${formattedPhone}.`);
      return { messageId: `wamid.HBgMNTU2Mjk4MTI3Mzg1FQIAERgSRDMxQzU2NDVDMTg1QzhFOUU1AD==` };
    }

    const url = `https://graph.facebook.com/v17.0/${settings.phoneNumberId}/messages`;

    let interactivePayload: any = {};

    if (interactiveType === 'cta_url') {
      interactivePayload = {
        type: 'cta_url',
        header: interactiveData.headerText ? { type: 'text', text: interactiveData.headerText } : undefined,
        body: { text: interactiveData.bodyText },
        footer: interactiveData.footerText ? { text: interactiveData.footerText } : undefined,
        action: {
          name: 'cta_url',
          parameters: {
            display_text: interactiveData.buttonLabel,
            url: interactiveData.url,
          },
        },
      };
    } else if (interactiveType === 'list') {
      interactivePayload = {
        type: 'list',
        header: interactiveData.headerText ? { type: 'text', text: interactiveData.headerText } : undefined,
        body: { text: interactiveData.bodyText },
        footer: interactiveData.footerText ? { text: interactiveData.footerText } : undefined,
        action: {
          button: interactiveData.buttonLabel,
          sections: interactiveData.sections,
        },
      };
    } else if (interactiveType === 'button') {
      interactivePayload = {
        type: 'button',
        header: interactiveData.headerText ? { type: 'text', text: interactiveData.headerText } : undefined,
        body: { text: interactiveData.bodyText },
        footer: interactiveData.footerText ? { text: interactiveData.footerText } : undefined,
        action: {
          buttons: (interactiveData.buttons || []).map((btn: any) => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
        },
      };
    }

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'interactive',
      interactive: interactivePayload,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Cloud API.');
      }

      return { messageId: resData?.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Falha no disparo de mensagem interativa da Meta para ${formattedPhone}: ${error.message}`);
      throw error;
    }
  }

  async sendFlowMessage(
    settings: WhatsappSettings,
    recipientPhone: string,
    flowId: string,
    flowCta: string,
    bodyText: string,
    headerText?: string,
    footerText?: string,
  ): Promise<{ messageId: string }> {
    const formattedPhone = this.formatRecipientPhone(recipientPhone);

    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando envio de mensagem de Flow simulado (Mock) para ${formattedPhone}.`);
      return { messageId: `wamid.HBgMNTU2Mjk4MTI3Mzg1FQIAERgSRDMxQzU2NDVDMTg1QzhFOUU1AE==` };
    }

    const url = `https://graph.facebook.com/v17.0/${settings.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: headerText ? { type: 'text', text: headerText } : undefined,
        body: { text: bodyText },
        footer: footerText ? { text: footerText } : undefined,
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: crypto.randomUUID ? crypto.randomUUID() : `flow_token_${Date.now()}`,
            flow_id: flowId,
            flow_cta: flowCta,
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'first_screen',
            },
          },
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao enviar mensagem de Flow na Meta.');
      }

      return { messageId: resData?.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Falha no disparo de mensagem de Flow da Meta para ${formattedPhone}: ${error.message}`);
      throw error;
    }
  }

  async fetchTemplates(settings: WhatsappSettings): Promise<any[]> {
    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando listagem simulada de templates Meta.`);
      return [
        {
          name: 'boas_vindas',
          category: 'MARKETING',
          language: 'pt_BR',
          status: 'APPROVED',
          components: [
            { type: 'BODY', text: 'Olá {{1}}! Seja bem-vindo à {{2}}.' },
          ],
        },
        {
          name: 'confirmacao_agendamento',
          category: 'UTILITY',
          language: 'pt_BR',
          status: 'APPROVED',
          components: [
            { type: 'BODY', text: 'Olá {{1}}, seu test drive para o veículo {{2}} está agendado para {{3}}.' },
          ],
        },
      ];
    }

    const url = `https://graph.facebook.com/v17.0/${settings.businessAccountId}/message_templates`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao carregar templates da Meta.');
      }

      return resData.data || [];
    } catch (error) {
      this.logger.error(`Falha ao carregar templates da Meta Cloud API: ${error.message}`);
      throw error;
    }
  }

  async createTemplate(
    settings: WhatsappSettings,
    data: {
      name: string;
      category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
      language: string;
      bodyText: string;
      headerText?: string;
      footerText?: string;
    },
  ): Promise<{ id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }> {
    if (this.isMock(settings)) {
      this.logger.warn(`Criando template simulado (Mock): ${data.name}`);
      return { id: `mock-id-${Date.now()}`, status: 'PENDING' };
    }

    const url = `https://graph.facebook.com/v17.0/${settings.businessAccountId}/message_templates`;

    const matches = [...data.bodyText.matchAll(/\{\{(\d+)\}\}/g)];
    const uniqueIds = Array.from(new Set(matches.map(m => parseInt(m[1], 10))));
    const bodyVarsCount = uniqueIds.length;

    const bodyComponent: any = {
      type: 'BODY',
      text: data.bodyText,
    };

    if (bodyVarsCount > 0) {
      const sampleValues = Array.from({ length: bodyVarsCount }, (_, i) => `ex_${i + 1}`);
      bodyComponent.example = {
        body_text: [sampleValues],
      };
    }

    const components: any[] = [bodyComponent];

    if (data.headerText) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: data.headerText,
      });
    }

    if (data.footerText) {
      components.push({
        type: 'FOOTER',
        text: data.footerText,
      });
    }

    const body = {
      name: data.name,
      category: data.category,
      language: data.language || 'pt_BR',
      components,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao criar template na Meta.');
      }

      return {
        id: resData.id,
        status: resData.status || 'PENDING',
      };
    } catch (error) {
      this.logger.error(`Falha ao criar template na Meta: ${error.message}`);
      throw error;
    }
  }

  async deleteTemplate(settings: WhatsappSettings, templateName: string): Promise<void> {
    if (this.isMock(settings)) {
      this.logger.warn(`Removendo template simulado (Mock): ${templateName}`);
      return;
    }

    const url = `https://graph.facebook.com/v17.0/${settings.businessAccountId}/message_templates?name=${templateName}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao deletar template na Meta.');
      }
    } catch (error) {
      this.logger.error(`Falha ao deletar template na Meta: ${error.message}`);
      throw error;
    }
  }

  async fetchFlows(settings: WhatsappSettings): Promise<any[]> {
    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando listagem simulada de flows Meta.`);
      return [
        {
          id: 'mock_flow_id_test_drive',
          name: 'Agendamento de Test Drive',
          status: 'DRAFT',
          categories: ['LEAD_GENERATION'],
        },
        {
          id: 'mock_flow_id_avaliacao',
          name: 'Avaliação de Veículo Usado',
          status: 'PUBLISHED',
          categories: ['LEAD_GENERATION'],
        },
      ];
    }

    const url = `https://graph.facebook.com/v17.0/${settings.businessAccountId}/flows`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao obter flows da Meta.');
      }

      return resData.data || [];
    } catch (error) {
      this.logger.error(`Falha ao obter flows da Meta Cloud API: ${error.message}`);
      throw error;
    }
  }

  async createFlow(
    settings: WhatsappSettings,
    name: string,
    category: string,
  ): Promise<{ id: string }> {
    if (this.isMock(settings)) {
      this.logger.warn(`Criando flow simulado (Mock): ${name}`);
      return { id: `mock_flow_id_${Date.now()}` };
    }

    const url = `https://graph.facebook.com/v17.0/${settings.businessAccountId}/flows`;

    const body = {
      name,
      categories: [category],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao criar flow na Meta.');
      }

      return { id: resData.id };
    } catch (error) {
      this.logger.error(`Falha ao criar flow na Meta: ${error.message}`);
      throw error;
    }
  }

  async updateFlowLayout(
    settings: WhatsappSettings,
    flowId: string,
    metaLayoutJson: any,
  ): Promise<{ id: string }> {
    if (this.isMock(settings)) {
      this.logger.warn(`Atualizando layout de flow simulado (Mock): ${flowId}`);
      return { id: `mock_asset_id_${Date.now()}` };
    }

    const url = `https://graph.facebook.com/v17.0/${flowId}/assets`;

    try {
      const formData = new FormData();
      formData.append('name', 'flow.json');
      formData.append('asset_type', 'FLOW_JSON');
      const blob = new Blob([JSON.stringify(metaLayoutJson)], { type: 'application/json' });
      formData.append('file', blob, 'flow.json');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao enviar layout do flow na Meta.');
      }

      return { id: resData.id };
    } catch (error) {
      this.logger.error(`Falha ao atualizar layout do flow na Meta: ${error.message}`);
      throw error;
    }
  }

  async publishFlow(
    settings: WhatsappSettings,
    flowId: string,
  ): Promise<{ success: boolean }> {
    if (this.isMock(settings)) {
      this.logger.warn(`Publicando flow simulado (Mock): ${flowId}`);
      return { success: true };
    }

    const url = `https://graph.facebook.com/v17.0/${flowId}/publish`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido ao publicar flow na Meta.');
      }

      return { success: resData.success || false };
    } catch (error) {
      this.logger.error(`Falha ao publicar flow na Meta: ${error.message}`);
      throw error;
    }
  }

  async deleteFlow(
    settings: WhatsappSettings,
    flowId: string,
    isPublished: boolean,
  ): Promise<{ success: boolean }> {
    if (this.isMock(settings)) {
      this.logger.warn(`Removendo/Depreciando flow simulado (Mock): ${flowId}`);
      return { success: true };
    }

    const url = isPublished
      ? `https://graph.facebook.com/v17.0/${flowId}/deprecate`
      : `https://graph.facebook.com/v17.0/${flowId}`;

    const method = isPublished ? 'POST' : 'DELETE';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(
          resData?.error?.message ||
            `Erro desconhecido ao ${isPublished ? 'depreciar' : 'deletar'} flow na Meta.`,
        );
      }

      return { success: resData.success || false };
    } catch (error) {
      this.logger.error(
        `Falha ao ${isPublished ? 'depreciar' : 'deletar'} flow na Meta: ${error.message}`,
      );
      throw error;
    }
  }

  async revokeMessage(
    settings: WhatsappSettings,
    messageId: string,
  ): Promise<void> {
    if (this.isMock(settings)) {
      this.logger.warn(`Utilizando revogação de mensagem simulada para o ID ${messageId}.`);
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${settings.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      status: 'deleted',
      message_id: messageId,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(
          resData?.error?.message || 'Erro ao deletar mensagem na Meta.',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Nota: A API oficial Cloud do WhatsApp da Meta não permite apagar mensagens no dispositivo do cliente. A mensagem ${messageId} será marcada como apagada localmente. Detalhes: ${error.message}`,
      );
      // Permitimos que o fluxo continue para que a mensagem seja apagada localmente no CRM
    }
  }

  async sendFacebookMessage(
    settings: WhatsappSettings,
    recipientPsid: string,
    bodyText: string,
  ): Promise<{ messageId: string }> {
    const cleanPsid = recipientPsid.replace('fb_', '');

    if (!settings.facebookPageAccessToken || settings.facebookPageAccessToken.startsWith('mock')) {
      this.logger.warn(`Utilizando envio de mensagem de Facebook simulado (Mock) para ${cleanPsid}.`);
      return { messageId: `fb_mid.${crypto.randomUUID ? crypto.randomUUID() : Date.now()}` };
    }

    const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${settings.facebookPageAccessToken}`;

    const body = {
      recipient: {
        id: cleanPsid,
      },
      message: {
        text: bodyText,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Messenger API.');
      }

      return { messageId: resData?.message_id || resData?.messages?.[0]?.id || `fb_mid.${Date.now()}` };
    } catch (error) {
      this.logger.error(`Falha no disparo de mensagem no Messenger para ${cleanPsid}: ${error.message}`);
      throw error;
    }
  }

  async sendInstagramMessage(
    settings: WhatsappSettings,
    recipientIgsid: string,
    bodyText: string,
  ): Promise<{ messageId: string }> {
    const cleanIgsid = recipientIgsid.replace('ig_', '');

    if (!settings.facebookPageAccessToken || settings.facebookPageAccessToken.startsWith('mock')) {
      this.logger.warn(`Utilizando envio de mensagem de Instagram simulado (Mock) para ${cleanIgsid}.`);
      return { messageId: `ig_mid.${crypto.randomUUID ? crypto.randomUUID() : Date.now()}` };
    }

    const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${settings.facebookPageAccessToken}`;

    const body = {
      recipient: {
        id: cleanIgsid,
      },
      message: {
        text: bodyText,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error?.message || 'Erro desconhecido na Meta Instagram API.');
      }

      return { messageId: resData?.message_id || resData?.messages?.[0]?.id || `ig_mid.${Date.now()}` };
    } catch (error) {
      this.logger.error(`Falha no disparo de mensagem no Instagram para ${cleanIgsid}: ${error.message}`);
      throw error;
    }
  }
}
