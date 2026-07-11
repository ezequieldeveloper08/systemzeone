import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';

@Entity('restaurant_orders')
export class OrderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @Column({ name: 'delivery_type', type: 'varchar', default: 'delivery' })
  deliveryType: 'delivery' | 'takeaway' | 'table';

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'table_number', type: 'varchar', nullable: true })
  tableNumber: string | null;

  @Column({ name: 'total_price', type: 'float' })
  totalPrice: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'finished' | 'cancelled';

  @Column({ type: 'jsonb', default: '[]' })
  items: any[];

  @Column({ name: 'payment_method', type: 'varchar', nullable: true })
  paymentMethod: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
