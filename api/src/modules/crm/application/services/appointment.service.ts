import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AppointmentOrmEntity, AppointmentStatus } from '../../infrastructure/database/appointment.orm-entity';
import { ReminderService } from './reminder.service';
import { ActivityService } from './activity.service';
import { ActivityType } from '../../infrastructure/database/activity.orm-entity';
import { ReminderType } from '../../infrastructure/database/reminder.orm-entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly appointmentRepo: Repository<AppointmentOrmEntity>,
    private readonly reminderService: ReminderService,
    private readonly activityService: ActivityService,
  ) {}

  private async checkConflict(
    tenantId: string,
    assignedToUserId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const conflict = await this.appointmentRepo.createQueryBuilder('apt')
      .where('apt.tenantId = :tenantId', { tenantId })
      .andWhere('apt.assignedToUserId = :assignedToUserId', { assignedToUserId })
      .andWhere('apt.status NOT IN (:...excluded)', { excluded: [AppointmentStatus.CANCELED] })
      .andWhere('apt.startAt < :endAt AND apt.endAt > :startAt', { startAt, endAt })
      .andWhere(excludeId ? 'apt.id != :excludeId' : '1=1', { excludeId })
      .getOne();

    if (conflict) {
      throw new BadRequestException('Conflito de agendamento para o responsável.');
    }
  }

  async create(tenantId: string, createdByUserId: string, data: any): Promise<AppointmentOrmEntity> {
    const startAt = new Date(data.startAt);
    const endAt = new Date(data.endAt);

    if (startAt >= endAt) {
      throw new BadRequestException('A data de início deve ser menor que a data de término.');
    }

    if (data.assignedToUserId) {
      await this.checkConflict(tenantId, data.assignedToUserId, startAt, endAt);
    }

    const appointment = this.appointmentRepo.create({
      id: crypto.randomUUID(),
      tenantId,
      contactId: data.contactId || null,
      dealId: data.dealId || null,
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      startAt,
      endAt,
      status: AppointmentStatus.SCHEDULED,
      assignedToUserId: data.assignedToUserId || null,
      createdByUserId,
      googleCalendarEventId: data.googleCalendarEventId || null,
    });

    const saved = await this.appointmentRepo.save(appointment);

    // Create Activity if contactId is provided
    if (saved.contactId) {
      await this.activityService.create(tenantId, createdByUserId, {
        contactId: saved.contactId,
        dealId: saved.dealId,
        appointmentId: saved.id,
        type: ActivityType.APPOINTMENT_CREATED,
        title: `Agendamento criado: ${saved.title}`,
        description: `Horário: ${saved.startAt.toLocaleString('pt-BR')} - ${saved.endAt.toLocaleString('pt-BR')}`,
      });
    }

    // Auto-create Reminder 1h before startAt
    const remindAt = new Date(startAt.getTime() - 60 * 60 * 1000);
    if (remindAt > new Date()) {
      await this.reminderService.create(tenantId, {
        appointmentId: saved.id,
        contactId: saved.contactId,
        type: ReminderType.APPOINTMENT_REMINDER,
        remindAt,
      });
    }

    return saved;
  }

  async findAll(
    tenantId: string,
    filters: { contactId?: string; dealId?: string; status?: AppointmentStatus; assignedToUserId?: string } = {},
  ): Promise<AppointmentOrmEntity[]> {
    const query = this.appointmentRepo.createQueryBuilder('apt')
      .leftJoinAndSelect('apt.contact', 'contact')
      .leftJoinAndSelect('apt.deal', 'deal')
      .leftJoinAndSelect('apt.assignedToUser', 'assignedToUser')
      .where('apt.tenantId = :tenantId', { tenantId });

    if (filters.contactId) {
      query.andWhere('apt.contactId = :contactId', { contactId: filters.contactId });
    }
    if (filters.dealId) {
      query.andWhere('apt.dealId = :dealId', { dealId: filters.dealId });
    }
    if (filters.status) {
      query.andWhere('apt.status = :status', { status: filters.status });
    }
    if (filters.assignedToUserId) {
      query.andWhere('apt.assignedToUserId = :assignedToUserId', { assignedToUserId: filters.assignedToUserId });
    }

    return query
      .orderBy('apt.startAt', 'ASC')
      .getMany();
  }

  async findOne(tenantId: string, id: string): Promise<AppointmentOrmEntity> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id, tenantId },
      relations: { contact: true, deal: true, assignedToUser: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado.`);
    }

    return appointment;
  }

  async update(tenantId: string, id: string, data: any, updatedByUserId: string): Promise<AppointmentOrmEntity> {
    const appointment = await this.findOne(tenantId, id);
    const oldStatus = appointment.status;

    // Check if dates are changing (triggers Reschedule)
    const newStartAt = data.startAt ? new Date(data.startAt) : null;
    const newEndAt = data.endAt ? new Date(data.endAt) : null;

    const isRescheduled =
      (newStartAt && newStartAt.getTime() !== appointment.startAt.getTime()) ||
      (newEndAt && newEndAt.getTime() !== appointment.endAt.getTime()) ||
      data.status === AppointmentStatus.RESCHEDULED;

    if (isRescheduled) {
      const startAt = newStartAt || appointment.startAt;
      const endAt = newEndAt || appointment.endAt;

      if (startAt >= endAt) {
        throw new BadRequestException('A data de início deve ser menor que a data de término.');
      }

      const assignedToUserId = data.assignedToUserId !== undefined ? data.assignedToUserId : appointment.assignedToUserId;
      if (assignedToUserId) {
        await this.checkConflict(tenantId, assignedToUserId, startAt, endAt, appointment.id);
      }

      // Reschedule logic:
      // 1. Mark current appointment status = RESCHEDULED
      appointment.status = AppointmentStatus.RESCHEDULED;
      await this.appointmentRepo.save(appointment);
      await this.reminderService.cancelPendingForAppointment(appointment.id);

      // 2. Create NEW appointment
      const newApt = this.appointmentRepo.create({
        id: crypto.randomUUID(),
        tenantId,
        contactId: appointment.contactId,
        dealId: appointment.dealId,
        title: data.title !== undefined ? data.title : appointment.title,
        description: data.description !== undefined ? data.description : appointment.description,
        location: data.location !== undefined ? data.location : appointment.location,
        startAt,
        endAt,
        status: AppointmentStatus.SCHEDULED,
        assignedToUserId,
        createdByUserId: appointment.createdByUserId,
        googleCalendarEventId: data.googleCalendarEventId !== undefined ? data.googleCalendarEventId : appointment.googleCalendarEventId,
      });

      const savedNew = await this.appointmentRepo.save(newApt);

      // 3. Create Activity
      if (savedNew.contactId) {
        await this.activityService.create(tenantId, updatedByUserId, {
          contactId: savedNew.contactId,
          dealId: savedNew.dealId,
          appointmentId: savedNew.id,
          type: ActivityType.APPOINTMENT_RESCHEDULED,
          title: `Agendamento reagendado: ${savedNew.title}`,
          description: `Novo Horário: ${savedNew.startAt.toLocaleString('pt-BR')} - ${savedNew.endAt.toLocaleString('pt-BR')}`,
        });
      }

      // 4. Create Reminder for new appointment
      const remindAt = new Date(startAt.getTime() - 60 * 60 * 1000);
      if (remindAt > new Date()) {
        await this.reminderService.create(tenantId, {
          appointmentId: savedNew.id,
          contactId: savedNew.contactId,
          type: ReminderType.APPOINTMENT_REMINDER,
          remindAt,
        });
      }

      return savedNew;
    }

    // Normal update (no date change)
    if (data.title !== undefined) appointment.title = data.title;
    if (data.description !== undefined) appointment.description = data.description;
    if (data.location !== undefined) appointment.location = data.location;
    if (data.googleCalendarEventId !== undefined) {
      appointment.googleCalendarEventId = data.googleCalendarEventId;
    }

    if (data.assignedToUserId !== undefined && data.assignedToUserId !== appointment.assignedToUserId) {
      if (data.assignedToUserId) {
        await this.checkConflict(tenantId, data.assignedToUserId, appointment.startAt, appointment.endAt, appointment.id);
      }
      appointment.assignedToUserId = data.assignedToUserId;
    }

    if (data.status !== undefined && data.status !== oldStatus) {
      appointment.status = data.status;

      if (appointment.status === AppointmentStatus.CANCELED) {
        appointment.canceledAt = new Date();
        await this.reminderService.cancelPendingForAppointment(appointment.id);
        if (appointment.contactId) {
          await this.activityService.create(tenantId, updatedByUserId, {
            contactId: appointment.contactId,
            dealId: appointment.dealId,
            appointmentId: appointment.id,
            type: ActivityType.APPOINTMENT_CANCELED,
            title: `Agendamento cancelado: ${appointment.title}`,
            description: `Cancelado em: ${appointment.canceledAt.toLocaleString('pt-BR')}`,
          });
        }
      } else if (appointment.status === AppointmentStatus.CONFIRMED) {
        if (appointment.contactId) {
          await this.activityService.create(tenantId, updatedByUserId, {
            contactId: appointment.contactId,
            dealId: appointment.dealId,
            appointmentId: appointment.id,
            type: ActivityType.APPOINTMENT_CONFIRMED,
            title: `Agendamento confirmado: ${appointment.title}`,
          });
        }
      } else if (appointment.status === AppointmentStatus.COMPLETED) {
        if (appointment.contactId) {
          await this.activityService.create(tenantId, updatedByUserId, {
            contactId: appointment.contactId,
            dealId: appointment.dealId,
            appointmentId: appointment.id,
            type: ActivityType.APPOINTMENT_COMPLETED,
            title: `Agendamento concluído: ${appointment.title}`,
          });
        }
      }
    }

    return this.appointmentRepo.save(appointment);
  }

  async cancel(tenantId: string, id: string, updatedByUserId: string): Promise<AppointmentOrmEntity> {
    return this.update(tenantId, id, { status: AppointmentStatus.CANCELED }, updatedByUserId);
  }
}
