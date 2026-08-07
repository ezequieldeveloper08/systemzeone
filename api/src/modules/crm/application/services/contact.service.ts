import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import {
  ContactOrmEntity,
  ContactType,
  LifecycleStage,
  ContactStatus,
  ContactSource,
  LeadTemperature,
  DocumentType,
} from '../../infrastructure/database/contact.orm-entity';
import { DealOrmEntity, DealStatus } from '../../infrastructure/database/deal.orm-entity';
import { PipelineStageOrmEntity } from '../../infrastructure/database/pipeline-stage.orm-entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactOrmEntity)
    private readonly contactRepo: Repository<ContactOrmEntity>,
    @InjectRepository(DealOrmEntity)
    private readonly dealRepo: Repository<DealOrmEntity>,
    @InjectRepository(PipelineStageOrmEntity)
    private readonly stageRepo: Repository<PipelineStageOrmEntity>,
  ) { }

  normalizePhone(phone: string): string {
    if (phone && (phone.startsWith('fb_') || phone.startsWith('ig_'))) {
      return phone;
    }
    let clean = phone.replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) {
      clean = '55' + clean;
    }

    // Format to 9-digit if it is a 12-digit Brazilian mobile number (starts with 55, next 2 digits are DDD, local number starts with 9)
    if (clean.startsWith('55') && clean.length === 12) {
      const ddd = clean.slice(2, 4);
      const rest = clean.slice(4);
      if (rest.startsWith('9')) {
        clean = `55${ddd}9${rest}`;
      }
    }

    return clean;
  }

  getPhoneVariants(phone: string): string[] {
    const normalized = this.normalizePhone(phone);
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

  async findByPhone(tenantId: string, phone: string): Promise<ContactOrmEntity | null> {
    const variants = this.getPhoneVariants(phone);
    return this.contactRepo.findOne({
      where: variants.map(v => ({ tenantId, phone: v })),
    });
  }

  async create(tenantId: string, data: any): Promise<ContactOrmEntity> {
    const normalizedPhone = this.normalizePhone(data.phone);
    const variants = this.getPhoneVariants(data.phone);

    const existing = await this.contactRepo.findOne({
      where: variants.map(v => ({ tenantId, phone: v })),
      withDeleted: true,
    });
    if (existing) {
      if (existing.deletedAt) {
        existing.deletedAt = null;
        existing.name = data.name;
        existing.email = data.email || existing.email;
        existing.status = data.status || ContactStatus.NEW;
        return this.contactRepo.save(existing);
      }
      throw new BadRequestException(`Já existe um contato cadastrado com o telefone ${data.phone}.`);
    }

    const contact = this.contactRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      name: data.name,
      phone: normalizedPhone,
      email: data.email || null,
      type: data.type || ContactType.PERSON,
      displayName: data.displayName || null,
      documentType: data.documentType || null,
      document: data.document || null,
      companyName: data.companyName || null,
      jobTitle: data.jobTitle || null,
      source: data.source || ContactSource.MANUAL,
      sourceDetails: data.sourceDetails || null,
      ownerId: data.ownerId || null,
      notes: data.notes || null,
      temperature: data.temperature || LeadTemperature.COLD,
      lifecycleStage: data.lifecycleStage || LifecycleStage.LEAD,
      status: data.status || ContactStatus.NEW,
      leadScore: data.leadScore || 0,
      firstContactAt: new Date(),
      lastContactAt: new Date(),
    });

    return this.contactRepo.save(contact);
  }

  async findOrCreateFromWhatsapp(data: {
    tenantId: string;
    name: string;
    phone: string;
    whatsappId?: string;
  }): Promise<ContactOrmEntity> {
    const normalizedPhone = this.normalizePhone(data.phone);
    const variants = this.getPhoneVariants(data.phone);

    let contact = await this.contactRepo.findOne({
      where: variants.map(v => ({ tenantId: data.tenantId, phone: v })),
      withDeleted: true,
    });

    if (contact) {
      if (contact.deletedAt) {
        contact.deletedAt = null;
        contact.status = ContactStatus.NEW;
      }

      contact.lastContactAt = new Date();

      if (
        (!contact.name ||
          contact.name === 'Cliente Instagram' ||
          contact.name === 'Cliente Messenger' ||
          contact.name.startsWith('ig_') ||
          contact.name.startsWith('fb_') ||
          contact.name === contact.phone) &&
        data.name &&
        data.name !== 'Cliente Instagram' &&
        data.name !== 'Cliente Messenger'
      ) {
        contact.name = data.name;
      }

      if (!contact.whatsappId && data.whatsappId) {
        contact.whatsappId = data.whatsappId;
      }

      return this.contactRepo.save(contact);
    }

    contact = this.contactRepo.create({
      id: crypto.randomUUID(),
      tenantId: data.tenantId,
      name: data.name || normalizedPhone,
      phone: normalizedPhone,
      whatsappId: data.whatsappId || null,
      source: ContactSource.WHATSAPP,
      lifecycleStage: LifecycleStage.LEAD,
      status: ContactStatus.NEW,
      temperature: LeadTemperature.COLD,
      leadScore: 10,
      firstContactAt: new Date(),
      lastContactAt: new Date(),
    });

    return this.contactRepo.save(contact);
  }

  async convertToCustomer(contactId: string, tenantId: string): Promise<ContactOrmEntity> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, tenantId },
    });

    if (!contact) {
      throw new NotFoundException(`Contato com ID ${contactId} não encontrado.`);
    }

    contact.lifecycleStage = LifecycleStage.CUSTOMER;
    contact.status = ContactStatus.ACTIVE;
    contact.convertedAt = contact.convertedAt || new Date();
    contact.leadScore += 100;

    return this.contactRepo.save(contact);
  }

  async findAll(
    tenantId: string,
    filters: { lifecycleStage?: string; status?: string; source?: string; q?: string } = {},
  ): Promise<ContactOrmEntity[]> {
    const query = this.contactRepo.createQueryBuilder('contact')
      .where('contact.tenantId = :tenantId', { tenantId });

    if (filters.lifecycleStage) {
      query.andWhere('contact.lifecycleStage = :lifecycleStage', { lifecycleStage: filters.lifecycleStage });
    }

    if (filters.status) {
      query.andWhere('contact.status = :status', { status: filters.status });
    }

    if (filters.source) {
      query.andWhere('contact.source = :source', { source: filters.source });
    }

    if (filters.q) {
      query.andWhere(
        '(contact.name ILIKE :q OR contact.phone ILIKE :q OR contact.email ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    return query
      .orderBy('contact.createdAt', 'DESC')
      .getMany();
  }

  async findOne(tenantId: string, id: string): Promise<ContactOrmEntity> {
    const contact = await this.contactRepo.findOne({
      where: { id, tenantId },
    });

    if (!contact) {
      throw new NotFoundException(`Contato com ID ${id} não encontrado.`);
    }

    return contact;
  }

  async update(tenantId: string, id: string, data: any): Promise<ContactOrmEntity> {
    const contact = await this.findOne(tenantId, id);

    if (data.name !== undefined) contact.name = data.name;
    if (data.displayName !== undefined) contact.displayName = data.displayName;
    if (data.email !== undefined) contact.email = data.email;
    if (data.phone !== undefined) contact.phone = this.normalizePhone(data.phone);
    if (data.type !== undefined) contact.type = data.type;
    if (data.documentType !== undefined) contact.documentType = data.documentType;
    if (data.document !== undefined) contact.document = data.document;
    if (data.companyName !== undefined) contact.companyName = data.companyName;
    if (data.jobTitle !== undefined) contact.jobTitle = data.jobTitle;
    if (data.source !== undefined) contact.source = data.source;
    if (data.sourceDetails !== undefined) contact.sourceDetails = data.sourceDetails;
    if (data.ownerId !== undefined) contact.ownerId = data.ownerId;
    if (data.notes !== undefined) contact.notes = data.notes;
    if (data.temperature !== undefined) contact.temperature = data.temperature;
    if (data.lifecycleStage !== undefined) contact.lifecycleStage = data.lifecycleStage;

    const oldStatus = contact.status;
    if (data.status !== undefined) {
      contact.status = data.status;
      if (data.status === ContactStatus.WON) {
        contact.lifecycleStage = LifecycleStage.CUSTOMER;
        contact.convertedAt = contact.convertedAt || new Date();
        contact.leadScore = (contact.leadScore || 0) + 100;
      }
    }
    if (data.leadScore !== undefined) contact.leadScore = data.leadScore;

    const savedContact = await this.contactRepo.save(contact);

    // Propagate status change to associated deals if status was modified
    if (data.status !== undefined && data.status !== oldStatus) {
      await this.propagateStatusToDeals(tenantId, id, data.status, data.lostReason);
    }

    return savedContact;
  }

  private async propagateStatusToDeals(
    tenantId: string,
    contactId: string,
    status: ContactStatus,
    lostReason?: string,
  ): Promise<void> {
    try {
      // Find all open deals for this contact
      const openDeals = await this.dealRepo.find({
        where: { tenantId, contactId, status: DealStatus.OPEN },
      });

      if (openDeals.length === 0) return;

      if (status === ContactStatus.WON) {
        for (const deal of openDeals) {
          const wonStage = await this.stageRepo.findOne({
            where: { tenantId, pipelineId: deal.pipelineId, isWonStage: true },
          });
          if (wonStage) {
            deal.status = DealStatus.WON;
            deal.stageId = wonStage.id;
            deal.closedAt = new Date();
            await this.dealRepo.save(deal);
          }
        }
      } else if (status === ContactStatus.LOST) {
        for (const deal of openDeals) {
          const lostStage = await this.stageRepo.findOne({
            where: { tenantId, pipelineId: deal.pipelineId, isLostStage: true },
          });
          if (lostStage) {
            deal.status = DealStatus.LOST;
            deal.stageId = lostStage.id;
            deal.closedAt = new Date();
            deal.lostReason = lostReason || 'Contato encerrado como perdido';
            await this.dealRepo.save(deal);
          }
        }
      } else if (status === ContactStatus.IN_SERVICE) {
        for (const deal of openDeals) {
          const currentStage = await this.stageRepo.findOne({
            where: { id: deal.stageId, tenantId },
          });
          if (currentStage && currentStage.order === 0) {
            const nextStage = await this.stageRepo.findOne({
              where: { tenantId, pipelineId: deal.pipelineId, order: 1 },
            });
            if (nextStage) {
              deal.stageId = nextStage.id;
              await this.dealRepo.save(deal);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Erro ao propagar status do contato para negócios:`, err);
    }
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const contact = await this.findOne(tenantId, id);
    await this.contactRepo.softRemove(contact);
  }
}
