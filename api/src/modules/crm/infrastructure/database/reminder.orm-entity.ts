import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { ContactOrmEntity } from './contact.orm-entity';

export enum ReminderType {
  TASK_DUE = 'TASK_DUE',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  FOLLOW_UP = 'FOLLOW_UP',
  PAYMENT_DUE = 'PAYMENT_DUE',
}

export enum ReminderChannel {
  SYSTEM = 'SYSTEM',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

@Entity('reminders')
export class ReminderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId: string | null;

  @ManyToOne('TaskOrmEntity', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: any | null;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId: string | null;

  @ManyToOne('AppointmentOrmEntity', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: any | null;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId: string | null;

  @ManyToOne(() => ContactOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: ContactOrmEntity | null;

  @Column({
    type: 'varchar',
  })
  type: ReminderType;

  @Column({ name: 'remind_at', type: 'timestamp' })
  remindAt: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({
    type: 'varchar',
    default: ReminderChannel.SYSTEM,
  })
  channel: ReminderChannel;

  @Column({
    type: 'varchar',
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
