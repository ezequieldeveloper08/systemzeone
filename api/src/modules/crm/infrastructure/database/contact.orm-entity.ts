import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { UserOrmEntity } from '../../../auth/infrastructure/database/user.orm-entity';

export enum ContactType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

export enum LifecycleStage {
  LEAD = 'LEAD',
  MQL = 'MQL',
  SQL = 'SQL',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER',
  INACTIVE_CUSTOMER = 'INACTIVE_CUSTOMER',
  EVANGELIST = 'EVANGELIST',
  OTHER = 'OTHER',
}

export enum ContactStatus {
  NEW = 'NEW',
  IN_SERVICE = 'IN_SERVICE',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATION = 'NEGOTIATION',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  WON = 'WON',
  LOST = 'LOST',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum ContactSource {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK_ADS = 'FACEBOOK_ADS',
  GOOGLE_ADS = 'GOOGLE_ADS',
  WEBSITE = 'WEBSITE',
  LANDING_PAGE = 'LANDING_PAGE',
  REFERRAL = 'REFERRAL',
  MANUAL = 'MANUAL',
  IMPORTED = 'IMPORTED',
  OTHER = 'OTHER',
}

export enum LeadTemperature {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
}

export enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  OTHER = 'OTHER',
}

@Entity('contacts')
@Index(['tenantId', 'phone'], { unique: true })
export class ContactOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({
    type: 'varchar',
    default: ContactType.PERSON,
  })
  type: ContactType;

  @Column({
    name: 'lifecycle_stage',
    type: 'varchar',
    default: LifecycleStage.LEAD,
  })
  lifecycleStage: LifecycleStage;

  @Column({
    type: 'varchar',
    default: ContactStatus.NEW,
  })
  status: ContactStatus;

  @Column()
  name: string;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({
    name: 'document_type',
    type: 'varchar',
    nullable: true,
  })
  documentType: DocumentType | null;

  @Column({ type: 'varchar', nullable: true })
  document: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column()
  phone: string;

  @Column({ name: 'whatsapp_id', type: 'varchar', nullable: true })
  whatsappId: string | null;

  @Column({ name: 'company_name', type: 'varchar', nullable: true })
  companyName: string | null;

  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle: string | null;

  @Column({
    type: 'varchar',
    default: ContactSource.MANUAL,
  })
  source: ContactSource;

  @Column({ name: 'source_details', type: 'varchar', nullable: true })
  sourceDetails: string | null;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: UserOrmEntity | null;

  @Column({ name: 'lead_score', type: 'int', default: 0 })
  leadScore: number;

  @Column({
    type: 'varchar',
    default: LeadTemperature.COLD,
  })
  temperature: LeadTemperature;

  @Column({ name: 'first_contact_at', type: 'timestamp', nullable: true })
  firstContactAt: Date | null;

  @Column({ name: 'last_contact_at', type: 'timestamp', nullable: true })
  lastContactAt: Date | null;

  @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
  convertedAt: Date | null;

  @Column({ name: 'lost_reason', type: 'text', nullable: true })
  lostReason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
