import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('whatsapp_logs')
export class WhatsappLogOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({ name: 'contact_id', nullable: true, type: 'uuid' })
  contactId: string | null;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'recipient_phone' })
  recipientPhone: string;

  @Column({ name: 'message_direction' })
  messageDirection: 'inbound' | 'outbound';

  @Column({ name: 'message_type' })
  messageType: 'text' | 'template' | 'image' | 'document' | 'interactive' | 'audio';

  @Column({ name: 'template_name', type: 'varchar', nullable: true })
  templateName: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  variables: Record<string, string>;

  @Column({ name: 'body_text', type: 'text' })
  bodyText: string;

  @Column()
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ name: 'error_message', nullable: true, type: 'text' })
  errorMessage: string | null;

  @Column({ type: 'varchar', length: 50, default: 'whatsapp' })
  channel: 'whatsapp' | 'instagram' | 'facebook';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
