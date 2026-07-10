import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { DealOrmEntity, DealStatus } from '../../infrastructure/database/deal.orm-entity';
import { PipelineStageOrmEntity } from '../../infrastructure/database/pipeline-stage.orm-entity';
import { ContactService } from './contact.service';
import { PipelineService } from './pipeline.service';

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(DealOrmEntity)
    private readonly dealRepo: Repository<DealOrmEntity>,
    @InjectRepository(PipelineStageOrmEntity)
    private readonly stageRepo: Repository<PipelineStageOrmEntity>,
    private readonly contactService: ContactService,
    private readonly pipelineService: PipelineService,
  ) {}

  async create(tenantId: string, data: any): Promise<DealOrmEntity> {
    let pipelineId = data.pipelineId;
    let stageId = data.stageId;

    if (!pipelineId || !stageId) {
      // Find or create default pipeline and stages
      const defaultPipeline = await this.pipelineService.findOrCreateDefaultPipeline(tenantId);
      pipelineId = defaultPipeline.id;

      const stages = await this.pipelineService.getStages(tenantId, pipelineId);
      if (stages.length > 0) {
        stageId = stageId || stages[0].id;
      }
    }

    const deal = this.dealRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      contactId: data.contactId,
      pipelineId,
      stageId,
      title: data.title,
      description: data.description || null,
      value: data.value || 0,
      currency: data.currency || 'BRL',
      status: DealStatus.OPEN,
      vehicleId: data.vehicleId || null,
      ownerId: data.ownerId || null,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
    });

    return this.dealRepo.save(deal);
  }

  async findAll(
    tenantId: string,
    filters: { pipelineId?: string; status?: string } = {},
  ): Promise<DealOrmEntity[]> {
    const query = this.dealRepo.createQueryBuilder('deal')
      .leftJoinAndSelect('deal.contact', 'contact')
      .leftJoinAndSelect('deal.stage', 'stage')
      .leftJoinAndSelect('deal.vehicle', 'vehicle')
      .where('deal.tenantId = :tenantId', { tenantId });

    if (filters.pipelineId) {
      query.andWhere('deal.pipelineId = :pipelineId', { pipelineId: filters.pipelineId });
    }

    if (filters.status) {
      query.andWhere('deal.status = :status', { status: filters.status });
    }

    return query
      .orderBy('deal.createdAt', 'DESC')
      .getMany();
  }

  async findOne(tenantId: string, id: string): Promise<DealOrmEntity> {
    const deal = await this.dealRepo.findOne({
      where: { id, tenantId },
      relations: { contact: true, stage: true, vehicle: true },
    });

    if (!deal) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado.`);
    }

    return deal;
  }

  async update(tenantId: string, id: string, data: any): Promise<DealOrmEntity> {
    const deal = await this.findOne(tenantId, id);

    if (data.title !== undefined) deal.title = data.title;
    if (data.description !== undefined) deal.description = data.description;
    if (data.value !== undefined) deal.value = data.value;
    if (data.currency !== undefined) deal.currency = data.currency;
    if (data.vehicleId !== undefined) deal.vehicleId = data.vehicleId;
    if (data.ownerId !== undefined) deal.ownerId = data.ownerId;
    if (data.expectedCloseDate !== undefined) {
      deal.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
    }

    if (data.stageId !== undefined && data.stageId !== deal.stageId) {
      deal.stageId = data.stageId;

      // Fetch the target stage to check if it's Won or Lost
      const stage = await this.stageRepo.findOne({
        where: { id: data.stageId, tenantId },
      });

      if (stage) {
        if (stage.isWonStage) {
          deal.status = DealStatus.WON;
          deal.closedAt = new Date();
          // Trigger contact conversion to Customer
          await this.contactService.convertToCustomer(deal.contactId, tenantId);
        } else if (stage.isLostStage) {
          deal.status = DealStatus.LOST;
          deal.closedAt = new Date();
          deal.lostReason = data.lostReason || 'Perdido no funil';
        } else {
          deal.status = DealStatus.OPEN;
          deal.closedAt = null;
        }
      }
    }

    if (data.status !== undefined) {
      deal.status = data.status;
      if (data.status === DealStatus.WON) {
        deal.closedAt = new Date();
        await this.contactService.convertToCustomer(deal.contactId, tenantId);
      } else if (data.status === DealStatus.LOST) {
        deal.closedAt = new Date();
        deal.lostReason = data.lostReason || deal.lostReason;
      } else if (data.status === DealStatus.OPEN) {
        deal.closedAt = null;
      }
    }

    return this.dealRepo.save(deal);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const deal = await this.findOne(tenantId, id);
    await this.dealRepo.softRemove(deal);
  }
}
