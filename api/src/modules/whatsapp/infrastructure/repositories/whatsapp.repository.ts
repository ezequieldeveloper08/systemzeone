import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappSettings } from '../../domain/entities/whatsapp-settings.entity';
import { WhatsappTemplate } from '../../domain/entities/whatsapp-template.entity';
import { WhatsappLog } from '../../domain/entities/whatsapp-log.entity';
import { WhatsappFlow } from '../../domain/entities/whatsapp-flow.entity';
import { WhatsappFlowResponse } from '../../domain/entities/whatsapp-flow-response.entity';
import { WhatsappSettingsOrmEntity } from '../database/whatsapp-settings.orm-entity';
import { WhatsappTemplateOrmEntity } from '../database/whatsapp-template.orm-entity';
import { WhatsappLogOrmEntity } from '../database/whatsapp-log.orm-entity';
import { WhatsappFlowOrmEntity } from '../database/whatsapp-flow.orm-entity';
import { WhatsappFlowResponseOrmEntity } from '../database/whatsapp-flow-response.orm-entity';

function normalizeRecipientPhone(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  
  if (clean.startsWith('55') && clean.length === 12) {
    const ddd = clean.slice(2, 4);
    const rest = clean.slice(4);
    if (rest.startsWith('9')) {
      clean = `55${ddd}9${rest}`;
    }
  }
  return clean;
}

function getPhoneVariants(phone: string): string[] {
  const normalized = normalizeRecipientPhone(phone);
  const variants = [normalized];

  if (normalized.startsWith('55') && normalized.length >= 4) {
    const ddd = normalized.substring(2, 4);
    const local = normalized.substring(4);

    if (local.startsWith('9')) {
      if (local.length === 8) {
        variants.push('55' + ddd + '9' + local);
      } else if (local.length === 9) {
        variants.push('55' + ddd + local.substring(1));
      }
    }
  }

  return variants;
}

@Injectable()
export class WhatsappRepository implements IWhatsappRepository {
  constructor(
    @InjectRepository(WhatsappSettingsOrmEntity)
    private readonly settingsRepository: Repository<WhatsappSettingsOrmEntity>,
    @InjectRepository(WhatsappTemplateOrmEntity)
    private readonly templateRepository: Repository<WhatsappTemplateOrmEntity>,
    @InjectRepository(WhatsappLogOrmEntity)
    private readonly logRepository: Repository<WhatsappLogOrmEntity>,
    @InjectRepository(WhatsappFlowOrmEntity)
    private readonly flowRepository: Repository<WhatsappFlowOrmEntity>,
    @InjectRepository(WhatsappFlowResponseOrmEntity)
    private readonly flowResponseRepository: Repository<WhatsappFlowResponseOrmEntity>,
  ) {}

  // Mappers
  private toFlowDomain(orm: WhatsappFlowOrmEntity): WhatsappFlow {
    return new WhatsappFlow(
      orm.id,
      orm.tenantId,
      orm.name,
      orm.flowId,
      orm.status,
      orm.categories,
      orm.screens,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toFlowOrm(domain: WhatsappFlow): WhatsappFlowOrmEntity {
    const orm = new WhatsappFlowOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.name = domain.name;
    orm.flowId = domain.flowId;
    orm.status = domain.status;
    orm.categories = domain.categories;
    orm.screens = domain.screens;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  private toFlowResponseDomain(orm: WhatsappFlowResponseOrmEntity): WhatsappFlowResponse {
    const domain = new WhatsappFlowResponse(
      orm.id,
      orm.tenantId,
      orm.flowId,
      orm.recipientPhone,
      orm.recipientName,
      orm.submittedData,
      orm.createdAt,
    );
    if (orm.flow) {
      domain.flow = this.toFlowDomain(orm.flow);
    }
    return domain;
  }

  private toFlowResponseOrm(domain: WhatsappFlowResponse): WhatsappFlowResponseOrmEntity {
    const orm = new WhatsappFlowResponseOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.flowId = domain.flowId;
    orm.recipientPhone = domain.recipientPhone;
    orm.recipientName = domain.recipientName;
    orm.submittedData = domain.submittedData;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  private toSettingsDomain(orm: WhatsappSettingsOrmEntity): WhatsappSettings {
    return new WhatsappSettings(
      orm.id,
      orm.tenantId,
      orm.accessToken,
      orm.phoneNumberId,
      orm.businessAccountId,
      orm.webhookVerifyToken,
      orm.status,
      orm.createdAt,
      orm.updatedAt,
      orm.aiEnabled,
      orm.aiApiKey,
      orm.aiAgentInstructions,
      orm.aiModel,
      orm.aiPausedPhones || [],
    );
  }

  private toSettingsOrm(domain: WhatsappSettings): WhatsappSettingsOrmEntity {
    const orm = new WhatsappSettingsOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.accessToken = domain.accessToken;
    orm.phoneNumberId = domain.phoneNumberId;
    orm.businessAccountId = domain.businessAccountId;
    orm.webhookVerifyToken = domain.webhookVerifyToken;
    orm.status = domain.status;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.aiEnabled = domain.aiEnabled;
    orm.aiApiKey = domain.aiApiKey;
    orm.aiAgentInstructions = domain.aiAgentInstructions;
    orm.aiModel = domain.aiModel;
    orm.aiPausedPhones = domain.aiPausedPhones || [];
    return orm;
  }

  private toTemplateDomain(orm: WhatsappTemplateOrmEntity): WhatsappTemplate {
    return new WhatsappTemplate(
      orm.id,
      orm.tenantId,
      orm.name,
      orm.category,
      orm.language,
      orm.status,
      orm.headerType,
      orm.headerText,
      orm.bodyText,
      orm.footerText,
      orm.buttons,
      orm.variables,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toTemplateOrm(domain: WhatsappTemplate): WhatsappTemplateOrmEntity {
    const orm = new WhatsappTemplateOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.name = domain.name;
    orm.category = domain.category;
    orm.language = domain.language;
    orm.status = domain.status;
    orm.headerType = domain.headerType;
    orm.headerText = domain.headerText;
    orm.bodyText = domain.bodyText;
    orm.footerText = domain.footerText;
    orm.buttons = domain.buttons;
    orm.variables = domain.variables;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  private toLogDomain(orm: WhatsappLogOrmEntity): WhatsappLog {
    return new WhatsappLog(
      orm.id,
      orm.tenantId,
      orm.contactId,
      orm.recipientName,
      orm.recipientPhone,
      orm.messageDirection,
      orm.messageType,
      orm.templateName,
      orm.variables,
      orm.bodyText,
      orm.status,
      orm.errorMessage,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toLogOrm(domain: WhatsappLog): WhatsappLogOrmEntity {
    const orm = new WhatsappLogOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.contactId = domain.contactId;
    orm.recipientName = domain.recipientName;
    orm.recipientPhone = normalizeRecipientPhone(domain.recipientPhone);
    orm.messageDirection = domain.messageDirection;
    orm.messageType = domain.messageType;
    orm.templateName = domain.templateName;
    orm.variables = domain.variables;
    orm.bodyText = domain.bodyText;
    orm.status = domain.status;
    orm.errorMessage = domain.errorMessage;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  // Settings
  async findSettingsByTenantId(tenantId: string): Promise<WhatsappSettings | null> {
    const orm = await this.settingsRepository.findOneBy({ tenantId });
    return orm ? this.toSettingsDomain(orm) : null;
  }

  async findSettingsByPhoneNumberId(phoneNumberId: string): Promise<WhatsappSettings | null> {
    const orm = await this.settingsRepository.findOneBy({ phoneNumberId });
    return orm ? this.toSettingsDomain(orm) : null;
  }

  async saveSettings(settings: WhatsappSettings): Promise<WhatsappSettings> {
    const orm = this.toSettingsOrm(settings);
    const saved = await this.settingsRepository.save(orm);
    return this.toSettingsDomain(saved);
  }

  // Templates
  async findTemplatesByTenantId(tenantId: string): Promise<WhatsappTemplate[]> {
    const orms = await this.templateRepository.find({ where: { tenantId } });
    return orms.map(o => this.toTemplateDomain(o));
  }

  async saveTemplate(template: WhatsappTemplate): Promise<WhatsappTemplate> {
    const orm = this.toTemplateOrm(template);
    const saved = await this.templateRepository.save(orm);
    return this.toTemplateDomain(saved);
  }

  async findTemplateByName(tenantId: string, name: string): Promise<WhatsappTemplate | null> {
    const orm = await this.templateRepository.findOneBy({ tenantId, name });
    return orm ? this.toTemplateDomain(orm) : null;
  }

  async deleteTemplatesExcludingNames(tenantId: string, namesToKeep: string[]): Promise<void> {
    if (namesToKeep.length === 0) {
      await this.templateRepository.delete({ tenantId });
      return;
    }
    await this.templateRepository.createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('name NOT IN (:...namesToKeep)', { namesToKeep })
      .execute();
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.templateRepository.delete(id);
  }

  // Logs
  async findLogsByTenantId(tenantId: string): Promise<WhatsappLog[]> {
    const orms = await this.logRepository.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
    return orms.map(o => this.toLogDomain(o));
  }

  async findLogsByRecipient(tenantId: string, phone: string): Promise<WhatsappLog[]> {
    const variants = getPhoneVariants(phone);
    const orms = await this.logRepository.find({
      where: variants.map(v => ({ tenantId, recipientPhone: v })),
      order: { createdAt: 'ASC' },
    });
    return orms.map(o => this.toLogDomain(o));
  }

  async saveLog(log: WhatsappLog): Promise<WhatsappLog> {
    const orm = this.toLogOrm(log);
    const saved = await this.logRepository.save(orm);
    return this.toLogDomain(saved);
  }

  async deleteLogsByRecipientPhones(tenantId: string, phones: string[]): Promise<void> {
    if (phones.length === 0) return;
    const allPhones = [...phones];
    for (const phone of phones) {
      const variants = getPhoneVariants(phone);
      for (const v of variants) {
        if (!allPhones.includes(v)) {
          allPhones.push(v);
        }
      }
    }
    await this.logRepository.createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('recipient_phone IN (:...phones)', { phones: allPhones })
      .execute();
  }

  async findLogById(id: string): Promise<WhatsappLog | null> {
    const orm = await this.logRepository.findOneBy({ id });
    return orm ? this.toLogDomain(orm) : null;
  }

  async findUniqueChats(tenantId: string): Promise<{
    recipientPhone: string;
    recipientName: string;
    lastMessageText: string;
    lastMessageTime: Date;
    lastInboundMessageTime: Date | null;
    unreadCount: number;
  }[]> {
    const logs = await this.logRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    const chatMap = new Map<string, WhatsappLogOrmEntity>();
    const lastInboundMap = new Map<string, Date>();
    const unreadMap = new Map<string, number>();

    for (const log of logs) {
      const normalizedPhone = normalizeRecipientPhone(log.recipientPhone);
      if (!chatMap.has(normalizedPhone)) {
        const chatLog = { ...log, recipientPhone: normalizedPhone };
        chatMap.set(normalizedPhone, chatLog as any);
      }
      if (log.messageDirection === 'inbound') {
        if (!lastInboundMap.has(normalizedPhone)) {
          lastInboundMap.set(normalizedPhone, log.createdAt);
        }
        if (log.status !== 'read') {
          const currentCount = unreadMap.get(normalizedPhone) || 0;
          unreadMap.set(normalizedPhone, currentCount + 1);
        }
      }
    }

    return Array.from(chatMap.values()).map(log => ({
      recipientPhone: log.recipientPhone,
      recipientName: log.recipientName,
      lastMessageText: log.bodyText,
      lastMessageTime: log.createdAt,
      lastInboundMessageTime: lastInboundMap.get(log.recipientPhone) || null,
      unreadCount: unreadMap.get(log.recipientPhone) || 0,
    }));
  }

  // WhatsApp Flows
  async findFlowsByTenantId(tenantId: string): Promise<WhatsappFlow[]> {
    const orms = await this.flowRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => this.toFlowDomain(orm));
  }

  async findFlowById(id: string): Promise<WhatsappFlow | null> {
    const orm = await this.flowRepository.findOneBy({ id });
    return orm ? this.toFlowDomain(orm) : null;
  }

  async saveFlow(flow: WhatsappFlow): Promise<WhatsappFlow> {
    const orm = this.toFlowOrm(flow);
    const saved = await this.flowRepository.save(orm);
    return this.toFlowDomain(saved);
  }

  async deleteFlow(id: string): Promise<void> {
    await this.flowRepository.delete(id);
  }

  // WhatsApp Flow Responses
  async findFlowResponses(tenantId: string, flowId?: string): Promise<WhatsappFlowResponse[]> {
    const query: any = { tenantId };
    if (flowId) {
      query.flowId = flowId;
    }
    const orms = await this.flowResponseRepository.find({
      where: query,
      relations: { flow: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => this.toFlowResponseDomain(orm));
  }

  async saveFlowResponse(response: WhatsappFlowResponse): Promise<WhatsappFlowResponse> {
    const orm = this.toFlowResponseOrm(response);
    const saved = await this.flowResponseRepository.save(orm);
    return this.toFlowResponseDomain(saved);
  }
}
