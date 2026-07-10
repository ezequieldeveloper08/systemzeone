import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ActivityOrmEntity, ActivityType } from '../../infrastructure/database/activity.orm-entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityOrmEntity)
    private readonly activityRepo: Repository<ActivityOrmEntity>,
  ) {}

  async create(
    tenantId: string,
    userId: string | null,
    data: {
      contactId: string;
      dealId?: string | null;
      taskId?: string | null;
      appointmentId?: string | null;
      type: ActivityType;
      title: string;
      description?: string | null;
      dueDate?: Date | null;
      completedAt?: Date | null;
    },
  ): Promise<ActivityOrmEntity> {
    const activity = this.activityRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      userId,
      contactId: data.contactId,
      dealId: data.dealId || null,
      taskId: data.taskId || null,
      appointmentId: data.appointmentId || null,
      type: data.type,
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      completedAt: data.completedAt || null,
    });

    return this.activityRepo.save(activity);
  }

  async findAll(
    tenantId: string,
    filters: { contactId?: string; dealId?: string },
  ): Promise<ActivityOrmEntity[]> {
    const query = this.activityRepo.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .leftJoinAndSelect('activity.deal', 'deal')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.tenantId = :tenantId', { tenantId });

    if (filters.contactId) {
      query.andWhere('activity.contactId = :contactId', { contactId: filters.contactId });
    }

    if (filters.dealId) {
      query.andWhere('activity.dealId = :dealId', { dealId: filters.dealId });
    }

    return query
      .orderBy('activity.createdAt', 'DESC')
      .getMany();
  }
}
