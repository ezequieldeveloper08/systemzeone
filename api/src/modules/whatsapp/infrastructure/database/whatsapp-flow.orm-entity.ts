import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('whatsapp_flows')
export class WhatsappFlowOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column()
  name: string;

  @Column({ name: 'flow_id', type: 'varchar', nullable: true })
  flowId: string | null;

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'deprecated';

  @Column({ type: 'jsonb', default: '[]' })
  categories: string[];

  @Column({ type: 'jsonb', default: '{}' })
  screens: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
