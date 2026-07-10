import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('vehicles')
export class VehicleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column()
  title: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ name: 'sale_price', type: 'float', nullable: true })
  salePrice: number | null;

  @Column({ type: 'varchar', default: 'published' })
  status: 'published' | 'hidden';

  @Column({ type: 'jsonb', default: '[]' })
  images: string[];

  @Column({ type: 'integer' })
  km: number;

  @Column({ type: 'varchar' })
  transmission: 'automatic' | 'manual';

  @Column({ type: 'varchar' })
  fuel: 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';

  @Column()
  color: string;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ type: 'jsonb', default: '[]' })
  collections: string[];

  // Webmotors extra details
  @Column({ type: 'varchar', default: 'car' })
  type: 'car' | 'motorcycle' | 'truck';

  @Column({ type: 'varchar', nullable: true })
  plate: string | null;

  @Column({ type: 'integer', nullable: true })
  doors: number | null;

  @Column({ type: 'jsonb', default: '[]' })
  features: string[];

  @Column({ type: 'varchar', nullable: true })
  engine: string | null;

  @Column({ name: 'body_type', type: 'varchar', nullable: true })
  bodyType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
