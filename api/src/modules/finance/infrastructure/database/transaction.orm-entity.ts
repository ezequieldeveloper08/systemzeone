import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { VehicleOrmEntity } from '../../../vehicle/infrastructure/database/vehicle.orm-entity';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column()
  description: string;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    transformer: { 
      to: (value: number) => value, 
      from: (value: string) => parseFloat(value) 
    } 
  })
  amount: number;

  @Column({ type: 'varchar' })
  type: 'revenue' | 'expense';

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'paid';

  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date | null;

  @Column({ default: 'outros' })
  category: string;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string | null;

  @ManyToOne(() => VehicleOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: VehicleOrmEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
