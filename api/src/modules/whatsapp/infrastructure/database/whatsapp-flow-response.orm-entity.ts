import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { WhatsappFlowOrmEntity } from './whatsapp-flow.orm-entity';

@Entity('whatsapp_flow_responses')
export class WhatsappFlowResponseOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({ name: 'flow_id', type: 'uuid' })
  flowId: string;

  @ManyToOne(() => WhatsappFlowOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flow_id' })
  flow: WhatsappFlowOrmEntity;

  @Column({ name: 'recipient_phone' })
  recipientPhone: string;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'submitted_data', type: 'jsonb', default: '{}' })
  submittedData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
