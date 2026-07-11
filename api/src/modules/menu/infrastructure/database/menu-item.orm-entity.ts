import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('menu_items')
export class MenuItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'varchar', default: 'published' })
  status: 'published' | 'hidden';

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ name: 'choice_groups', type: 'jsonb', default: '[]' })
  choiceGroups: any[];

  @Column({ name: 'menu_id', type: 'uuid', nullable: true })
  menuId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
