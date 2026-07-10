import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('whatsapp_settings')
export class WhatsappSettingsOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', unique: true })
  tenantId: string;

  @OneToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({ name: 'access_token' })
  accessToken: string;

  @Column({ name: 'phone_number_id' })
  phoneNumberId: string;

  @Column({ name: 'business_account_id' })
  businessAccountId: string;

  @Column({ name: 'webhook_verify_token' })
  webhookVerifyToken: string;

  @Column({ default: 'disconnected' })
  status: 'connected' | 'disconnected' | 'error';

  @Column({ name: 'ai_enabled', default: false })
  aiEnabled: boolean;

  @Column({ type: 'varchar', name: 'ai_api_key', nullable: true })
  aiApiKey: string | null;

  @Column({ type: 'text', name: 'ai_agent_instructions', nullable: true })
  aiAgentInstructions: string | null;

  @Column({ type: 'varchar', name: 'ai_model', default: 'gemini-2.0-flash' })
  aiModel: string;

  @Column({ type: 'jsonb', name: 'ai_paused_phones', default: '[]' })
  aiPausedPhones: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
