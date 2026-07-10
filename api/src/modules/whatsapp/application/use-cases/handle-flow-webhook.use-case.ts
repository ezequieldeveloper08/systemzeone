import { Inject, Injectable, Logger } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappFlowResponse } from '../../domain/entities/whatsapp-flow-response.entity';
import * as crypto from 'crypto';

@Injectable()
export class HandleWhatsappFlowWebhookUseCase {
  private readonly logger = new Logger(HandleWhatsappFlowWebhookUseCase.name);

  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(body: any, queryTenantId?: string): Promise<any> {
    this.logger.log('Recebida requisição no Webhook do WhatsApp Flows');

    let decryptedPayload: any = null;
    let aesKeyBuffer: Buffer | null = null;
    let isEncrypted = false;

    // 1. Check if the payload is encrypted (Meta official format)
    if (body.encrypted_flow_data && body.encrypted_aes_key && body.initialization_vector) {
      isEncrypted = true;
      try {
        const privateKeyPem = process.env.META_FLOW_PRIVATE_KEY || process.env.META_PRIVATE_KEY;
        if (!privateKeyPem) {
          throw new Error('Chave privada META_FLOW_PRIVATE_KEY não está configurada no ambiente.');
        }

        // Decrypt AES Key using RSA-OAEP
        aesKeyBuffer = crypto.privateDecrypt(
          {
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
          },
          Buffer.from(body.encrypted_aes_key, 'base64'),
        );

        // Decrypt Flow Data using AES-128-GCM
        const cipherTextBuffer = Buffer.from(body.encrypted_flow_data, 'base64');
        const ivBuffer = Buffer.from(body.initialization_vector, 'base64');
        
        // The authentication tag is appended to the ciphertext (last 16 bytes)
        const tagLength = 16;
        const tag = cipherTextBuffer.subarray(cipherTextBuffer.length - tagLength);
        const encryptedData = cipherTextBuffer.subarray(0, cipherTextBuffer.length - tagLength);

        const decipher = crypto.createDecipheriv('aes-128-gcm', aesKeyBuffer, ivBuffer);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encryptedData, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        decryptedPayload = JSON.parse(decrypted);
        this.logger.log('Payload do WhatsApp Flows descriptografado com sucesso.');
      } catch (err) {
        this.logger.error('Falha ao descriptografar payload do WhatsApp Flows:', err);
        throw err;
      }
    } else {
      // Plaintext mode (used by frontend simulator / local testing)
      decryptedPayload = body;
      this.logger.log('Processando payload do WhatsApp Flows em modo texto plano (Simulator/Sandbox).');
    }

    // 2. Process Flow Logic
    const responseData = await this.processFlowLogic(decryptedPayload, queryTenantId);

    // 3. Encrypt response if the request was encrypted
    if (isEncrypted && aesKeyBuffer) {
      try {
        const responseString = JSON.stringify(responseData);
        const responseIv = crypto.randomBytes(12);
        
        const cipher = crypto.createCipheriv('aes-128-gcm', aesKeyBuffer, responseIv);
        let encryptedResponse = cipher.update(responseString, 'utf8', 'base64');
        encryptedResponse += cipher.final('base64');
        const tagBuffer = cipher.getAuthTag();

        // Concatenate ciphertext and tag
        const encryptedPayload = Buffer.concat([
          Buffer.from(encryptedResponse, 'base64'),
          tagBuffer,
        ]).toString('base64');

        return {
          encrypted_response: encryptedPayload,
          initialization_vector: responseIv.toString('base64'),
        };
      } catch (err) {
        this.logger.error('Falha ao criptografar resposta do WhatsApp Flows:', err);
        throw err;
      }
    }

    // Plaintext return
    return responseData;
  }

  private async processFlowLogic(payload: any, queryTenantId?: string): Promise<any> {
    const action = payload.action || 'data_exchange';
    const screen = payload.screen;
    const flowToken = payload.flow_token || 'simulated_token';
    const flowIdMeta = payload.flow_id;
    const clientData = payload.data || {};

    if (action === 'ping') {
      return {
        version: '7.3',
        status: 'active',
      };
    }

    // Find the flow and tenant
    let tenantId = queryTenantId || 'fallback_tenant';
    let flowDbId = '';

    if (flowIdMeta) {
      // Find flow by Meta Flow ID
      const flows = await this.whatsappRepository.findFlowsByTenantId(tenantId);
      const match = flows.find(f => f.flowId === flowIdMeta);
      if (match) {
        flowDbId = match.id;
        tenantId = match.tenantId;
      }
    }

    // If we can't find by meta flow ID, try finding a flow with matching name or matching screens configuration
    if (!flowDbId && payload.flow_id) {
      // Maybe the flow_id parameter is actually our database flow UUID (used by simulator)
      const flow = await this.whatsappRepository.findFlowById(payload.flow_id);
      if (flow) {
        flowDbId = flow.id;
        tenantId = flow.tenantId;
      }
    }

    // Fallback if not found
    if (!flowDbId) {
      const allFlows = await this.whatsappRepository.findFlowsByTenantId(tenantId);
      if (allFlows.length > 0) {
        flowDbId = allFlows[0].id;
      } else {
        flowDbId = crypto.randomUUID();
      }
    }

    this.logger.log(`Processando tela do Flow: ${screen}, Action: ${action}, Tenant: ${tenantId}`);

    // Standard Next Screen logic depending on the screen and fields
    // We accumulated data using flow_token. In the simulator, the client passes the accumulated form data
    // inside the "data" object because the client maintains state.
    
    // Check if the user is finishing the flow (submitting the final form)
    const isSuccessSubmit = 
      screen === 'second_screen' && (clientData.date || clientData.condition) ||
      screen === 'first_screen' && clientData.financing; // Lead flow only has 2 screens, so first_screen -> second_screen is the submission

    if (isSuccessSubmit || payload.action === 'submit') {
      // Save response to the database!
      const recipientName = clientData.name || clientData.client_name || clientData.recipientName || 'Cliente WhatsApp';
      const recipientPhone = clientData.phone || clientData.client_phone || clientData.recipientPhone || '5562999999999';

      const flowResponse = new WhatsappFlowResponse(
        crypto.randomUUID(),
        tenantId,
        flowDbId,
        recipientPhone,
        recipientName,
        clientData,
        new Date(),
      );

      await this.whatsappRepository.saveFlowResponse(flowResponse);
      this.logger.log(`Respostas do Flow salvas no banco de dados para o destinatário: ${recipientName}`);
    }

    // Determine the next screen response
    if (screen === 'first_screen') {
      // For Test Drive flow:
      if (clientData.vehicle) {
        return {
          version: '7.3',
          screen: 'second_screen',
          data: {
            // Dynamic dates depending on the selected vehicle
            vehicle: clientData.vehicle,
            dates: clientData.vehicle.includes('S10')
              ? ['2026-06-25 10:00', '2026-06-25 15:00', '2026-06-26 11:00']
              : ['2026-06-23 10:00', '2026-06-23 14:00', '2026-06-24 09:00', '2026-06-24 15:00'],
          },
        };
      }

      // For Used Valuation flow:
      if (clientData.brand_model) {
        return {
          version: '7.3',
          screen: 'second_screen',
          data: {
            brand_model: clientData.brand_model,
            year: clientData.year,
            km: clientData.km,
          },
        };
      }

      // For Lead capture flow (which only has 2 screens, so first_screen submits directly to second_screen success):
      if (clientData.name) {
        return {
          version: '7.3',
          screen: 'second_screen',
          data: {
            message: 'Ficha de Cadastro recebida com sucesso!',
          },
        };
      }
    }

    if (screen === 'second_screen') {
      // Confirmations
      return {
        version: '7.3',
        screen: 'third_screen',
        data: {
          message: 'Processamento concluído com sucesso!',
        },
      };
    }

    // Success response structure
    return {
      version: '7.3',
      screen: 'SUCCESS',
      data: {
        extension_message_response: {
          params: {
            flow_token: flowToken,
            status: 'success',
          },
        },
      },
    };
  }
}
