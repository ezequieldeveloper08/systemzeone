import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { TaskOrmEntity, TaskStatus, TaskPriority } from '../../infrastructure/database/task.orm-entity';
import { ActivityService } from './activity.service';
import { ReminderService } from './reminder.service';
import { ActivityType } from '../../infrastructure/database/activity.orm-entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly taskRepo: Repository<TaskOrmEntity>,
    private readonly activityService: ActivityService,
    private readonly reminderService: ReminderService,
  ) {}

  private async updateOverdueTasks(tenantId: string): Promise<void> {
    await this.taskRepo.createQueryBuilder()
      .update(TaskOrmEntity)
      .set({ status: TaskStatus.OVERDUE })
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('dueDate < :now', { now: new Date() })
      .andWhere('status NOT IN (:...excluded)', { excluded: [TaskStatus.DONE, TaskStatus.CANCELED, TaskStatus.OVERDUE] })
      .execute();
  }

  async create(tenantId: string, createdByUserId: string, data: any): Promise<TaskOrmEntity> {
    const task = this.taskRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      contactId: data.contactId || null,
      dealId: data.dealId || null,
      conversationId: data.conversationId || null,
      title: data.title,
      description: data.description || null,
      status: data.status || TaskStatus.TODO,
      priority: data.priority || TaskPriority.MEDIUM,
      assignedToUserId: data.assignedToUserId || null,
      createdByUserId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    });

    const saved = await this.taskRepo.save(task);

    // Create Activity if contactId is provided
    if (saved.contactId) {
      await this.activityService.create(tenantId, createdByUserId, {
        contactId: saved.contactId,
        dealId: saved.dealId,
        taskId: saved.id,
        type: ActivityType.TASK_CREATED,
        title: `Tarefa criada: ${saved.title}`,
        description: saved.description,
        dueDate: saved.dueDate,
      });
    }

    return saved;
  }

  async findAll(
    tenantId: string,
    filters: { contactId?: string; dealId?: string; status?: TaskStatus; assignedToUserId?: string } = {},
  ): Promise<TaskOrmEntity[]> {
    await this.updateOverdueTasks(tenantId);

    const query = this.taskRepo.createQueryBuilder('task')
      .leftJoinAndSelect('task.contact', 'contact')
      .leftJoinAndSelect('task.deal', 'deal')
      .leftJoinAndSelect('task.assignedToUser', 'assignedToUser')
      .where('task.tenantId = :tenantId', { tenantId });

    if (filters.contactId) {
      query.andWhere('task.contactId = :contactId', { contactId: filters.contactId });
    }
    if (filters.dealId) {
      query.andWhere('task.dealId = :dealId', { dealId: filters.dealId });
    }
    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters.assignedToUserId) {
      query.andWhere('task.assignedToUserId = :assignedToUserId', { assignedToUserId: filters.assignedToUserId });
    }

    return query
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }

  async findOne(tenantId: string, id: string): Promise<TaskOrmEntity> {
    await this.updateOverdueTasks(tenantId);

    const task = await this.taskRepo.findOne({
      where: { id, tenantId },
      relations: { contact: true, deal: true, assignedToUser: true },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }

    return task;
  }

  async update(tenantId: string, id: string, data: any, updatedByUserId: string): Promise<TaskOrmEntity> {
    const task = await this.findOne(tenantId, id);

    const oldStatus = task.status;

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.assignedToUserId !== undefined) task.assignedToUserId = data.assignedToUserId;
    if (data.dueDate !== undefined) {
      task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.status !== undefined && data.status !== oldStatus) {
      task.status = data.status;

      if (task.status === TaskStatus.DONE) {
        task.completedAt = new Date();
        if (task.contactId) {
          await this.activityService.create(tenantId, updatedByUserId, {
            contactId: task.contactId,
            dealId: task.dealId,
            taskId: task.id,
            type: ActivityType.TASK_COMPLETED,
            title: `Tarefa concluída: ${task.title}`,
            completedAt: task.completedAt,
          });
        }
      } else if (task.status === TaskStatus.CANCELED) {
        if (task.contactId) {
          await this.activityService.create(tenantId, updatedByUserId, {
            contactId: task.contactId,
            dealId: task.dealId,
            taskId: task.id,
            type: ActivityType.TASK_CANCELED,
            title: `Tarefa cancelada: ${task.title}`,
          });
        }
        await this.reminderService.cancelPendingForTask(task.id);
      }
    }

    return this.taskRepo.save(task);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const task = await this.findOne(tenantId, id);
    await this.taskRepo.softRemove(task);
    await this.reminderService.cancelPendingForTask(task.id);
  }
}
