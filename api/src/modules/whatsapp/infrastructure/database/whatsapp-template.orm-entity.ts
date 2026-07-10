import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('whatsapp_templates')
export class WhatsappTemplateOrmEntity {
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column()
  name: string;

  @Column()
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

  @Column({ default: 'pt_BR' })
  language: string;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({ name: 'header_type', default: 'NONE' })
  headerType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'NONE';

  @Column({ name: 'header_text', type: 'varchar', nullable: true })
  headerText: string | null;

  @Column({ name: 'body_text', type: 'text' })
  bodyText: string;

  @Column({ name: 'footer_text', type: 'varchar', nullable: true })
  footerText: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  buttons: any[];

  @Column({ type: 'jsonb', default: '[]' })
  variables: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
