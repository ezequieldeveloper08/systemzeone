import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { LeadOrmEntity } from '../../infrastructure/database/lead.orm-entity';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(LeadOrmEntity)
    private readonly leadRepo: Repository<LeadOrmEntity>,
  ) {}

  async create(tenantId: string, data: any): Promise<LeadOrmEntity> {
    const lead = this.leadRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message || null,
      status: data.status || 'new',
      source: data.source || 'website',
      vehicleId: data.vehicleId || null,
      notes: data.notes || null,
    });
    return this.leadRepo.save(lead);
  }

  async findAll(tenantId: string, filters: { status?: string; source?: string } = {}): Promise<LeadOrmEntity[]> {
    const query = this.leadRepo.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.vehicle', 'vehicle')
      .where('lead.tenantId = :tenantId', { tenantId });

    if (filters.status) {
      query.andWhere('lead.status = :status', { status: filters.status });
    }

    if (filters.source) {
      query.andWhere('lead.source = :source', { source: filters.source });
    }

    return query
      .orderBy('lead.createdAt', 'DESC')
      .getMany();
  }

  async findOne(tenantId: string, id: string): Promise<LeadOrmEntity> {
    const lead = await this.leadRepo.findOne({
      where: { id, tenantId },
      relations: { vehicle: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead com ID ${id} não encontrado.`);
    }

    return lead;
  }

  async update(tenantId: string, id: string, data: any): Promise<LeadOrmEntity> {
    const lead = await this.findOne(tenantId, id);

    if (data.name !== undefined) lead.name = data.name;
    if (data.email !== undefined) lead.email = data.email;
    if (data.phone !== undefined) lead.phone = data.phone;
    if (data.message !== undefined) lead.message = data.message;
    if (data.status !== undefined) lead.status = data.status;
    if (data.source !== undefined) lead.source = data.source;
    if (data.vehicleId !== undefined) lead.vehicleId = data.vehicleId;
    if (data.notes !== undefined) lead.notes = data.notes;

    return this.leadRepo.save(lead);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const lead = await this.findOne(tenantId, id);
    await this.leadRepo.remove(lead);
  }
}
