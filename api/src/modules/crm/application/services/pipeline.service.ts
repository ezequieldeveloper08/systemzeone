import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PipelineOrmEntity } from '../../infrastructure/database/pipeline.orm-entity';
import { PipelineStageOrmEntity } from '../../infrastructure/database/pipeline-stage.orm-entity';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(PipelineOrmEntity)
    private readonly pipelineRepo: Repository<PipelineOrmEntity>,
    @InjectRepository(PipelineStageOrmEntity)
    private readonly stageRepo: Repository<PipelineStageOrmEntity>,
  ) {}

  async findOrCreateDefaultPipeline(tenantId: string): Promise<PipelineOrmEntity> {
    let pipeline = await this.pipelineRepo.findOne({
      where: { tenantId, isDefault: true },
    });

    if (pipeline) {
      return pipeline;
    }

    // Create default pipeline
    const pipelineId = crypto.randomUUID();
    pipeline = this.pipelineRepo.create({
      id: pipelineId,
      tenantId,
      name: 'Funil de Vendas Padrão',
      description: 'Funil comercial padrão para a concessionária',
      isDefault: true,
      isActive: true,
    });
    await this.pipelineRepo.save(pipeline);

    // Create default stages
    const defaultStages = [
      { name: 'Novo Lead', order: 0, probability: 100, isWonStage: false, isLostStage: false },
      { name: 'Contato Iniciado', order: 1, probability: 80, isWonStage: false, isLostStage: false },
      { name: 'Qualificado', order: 2, probability: 60, isWonStage: false, isLostStage: false },
      { name: 'Diagnóstico', order: 3, probability: 50, isWonStage: false, isLostStage: false },
      { name: 'Proposta Enviada', order: 4, probability: 40, isWonStage: false, isLostStage: false },
      { name: 'Negociação', order: 5, probability: 20, isWonStage: false, isLostStage: false },
      { name: 'Fechado - Ganho', order: 6, probability: 100, isWonStage: true, isLostStage: false },
      { name: 'Fechado - Perdido', order: 7, probability: 0, isWonStage: false, isLostStage: true },
    ];

    for (const s of defaultStages) {
      const stage = this.stageRepo.create({
        id: crypto.randomUUID(),
        tenantId,
        pipelineId,
        name: s.name,
        order: s.order,
        probability: s.probability,
        isWonStage: s.isWonStage,
        isLostStage: s.isLostStage,
      });
      await this.stageRepo.save(stage);
    }

    return pipeline;
  }

  async getPipelines(tenantId: string): Promise<any[]> {
    // Ensure at least a default pipeline exists
    await this.findOrCreateDefaultPipeline(tenantId);

    const pipelines = await this.pipelineRepo.find({
      where: { tenantId, isActive: true },
      order: { createdAt: 'ASC' },
    });

    const result: any[] = [];
    for (const p of pipelines) {
      const stages = await this.stageRepo.find({
        where: { tenantId, pipelineId: p.id },
        order: { order: 'ASC' },
      });
      result.push({
        ...p,
        stages,
      });
    }

    return result;
  }

  async getStages(tenantId: string, pipelineId: string): Promise<PipelineStageOrmEntity[]> {
    return this.stageRepo.find({
      where: { tenantId, pipelineId },
      order: { order: 'ASC' },
    });
  }
}
