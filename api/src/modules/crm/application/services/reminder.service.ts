import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ReminderOrmEntity, ReminderStatus, ReminderChannel, ReminderType } from '../../infrastructure/database/reminder.orm-entity';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(ReminderOrmEntity)
    private readonly reminderRepo: Repository<ReminderOrmEntity>,
  ) {}

  async create(
    tenantId: string,
    data: {
      taskId?: string | null;
      appointmentId?: string | null;
      contactId?: string | null;
      type: ReminderType;
      remindAt: Date;
      channel?: ReminderChannel;
    },
  ): Promise<ReminderOrmEntity> {
    const reminder = this.reminderRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      taskId: data.taskId || null,
      appointmentId: data.appointmentId || null,
      contactId: data.contactId || null,
      type: data.type,
      remindAt: data.remindAt,
      channel: data.channel || ReminderChannel.SYSTEM,
      status: ReminderStatus.PENDING,
    });

    return this.reminderRepo.save(reminder);
  }

  async cancelPendingForAppointment(appointmentId: string): Promise<void> {
    await this.reminderRepo.update(
      { appointmentId, status: ReminderStatus.PENDING },
      { status: ReminderStatus.CANCELED },
    );
  }

  async cancelPendingForTask(taskId: string): Promise<void> {
    await this.reminderRepo.update(
      { taskId, status: ReminderStatus.PENDING },
      { status: ReminderStatus.CANCELED },
    );
  }

  async findAllPending(tenantId: string): Promise<ReminderOrmEntity[]> {
    return this.reminderRepo.find({
      where: { tenantId, status: ReminderStatus.PENDING },
      order: { remindAt: 'ASC' },
    });
  }
}
