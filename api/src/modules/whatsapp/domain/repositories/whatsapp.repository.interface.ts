import { WhatsappSettings } from '../entities/whatsapp-settings.entity';
import { WhatsappTemplate } from '../entities/whatsapp-template.entity';
import { WhatsappLog } from '../entities/whatsapp-log.entity';
import { WhatsappFlow } from '../entities/whatsapp-flow.entity';
import { WhatsappFlowResponse } from '../entities/whatsapp-flow-response.entity';

export interface IWhatsappRepository {
  findSettingsByTenantId(tenantId: string): Promise<WhatsappSettings | null>;
  findSettingsByPhoneNumberId(phoneNumberId: string): Promise<WhatsappSettings | null>;
  findSettingsByFacebookPageId(facebookPageId: string): Promise<WhatsappSettings | null>;
  findSettingsByInstagramBusinessAccountId(instagramBusinessAccountId: string): Promise<WhatsappSettings | null>;
  saveSettings(settings: WhatsappSettings): Promise<WhatsappSettings>;

  findTemplatesByTenantId(tenantId: string): Promise<WhatsappTemplate[]>;
  saveTemplate(template: WhatsappTemplate): Promise<WhatsappTemplate>;
  findTemplateByName(tenantId: string, name: string): Promise<WhatsappTemplate | null>;
  deleteTemplatesExcludingNames(tenantId: string, namesToKeep: string[]): Promise<void>;
  deleteTemplate(id: string): Promise<void>;

  findLogsByTenantId(tenantId: string): Promise<WhatsappLog[]>;
  findLogsByRecipient(tenantId: string, phone: string): Promise<WhatsappLog[]>;
  saveLog(log: WhatsappLog): Promise<WhatsappLog>;
  findLogById(id: string): Promise<WhatsappLog | null>;
  deleteLogsByRecipientPhones(tenantId: string, phones: string[]): Promise<void>;
  findUniqueChats(tenantId: string): Promise<{
    recipientPhone: string;
    recipientName: string;
    lastMessageText: string;
    lastMessageTime: Date;
    lastInboundMessageTime: Date | null;
    unreadCount: number;
  }[]>;

  // WhatsApp Flows
  findFlowsByTenantId(tenantId: string): Promise<WhatsappFlow[]>;
  findFlowById(id: string): Promise<WhatsappFlow | null>;
  saveFlow(flow: WhatsappFlow): Promise<WhatsappFlow>;
  deleteFlow(id: string): Promise<void>;

  // WhatsApp Flow Responses
  findFlowResponses(tenantId: string, flowId?: string): Promise<WhatsappFlowResponse[]>;
  saveFlowResponse(response: WhatsappFlowResponse): Promise<WhatsappFlowResponse>;
}

export const IWhatsappRepositoryToken = Symbol('IWhatsappRepository');

