import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { FipeModelOrmEntity } from './fipe-model.orm-entity';

@Entity('fipe_prices')
@Unique(['modelId', 'yearCode'])
export class FipePriceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'model_id' })
  @Index()
  modelId: string;

  @ManyToOne(() => FipeModelOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: FipeModelOrmEntity;

  @Column({ name: 'year_code' })
  yearCode: string;

  @Column({ name: 'year_name' })
  yearName: string;

  @Column()
  price: string;

  @Column({ name: 'numeric_price', type: 'float', nullable: true })
  numericPrice: number | null;

  @Column({ nullable: true })
  fuel: string;

  @Column({ name: 'fipe_code', nullable: true })
  fipeCode: string;

  @Column({ name: 'reference_month', nullable: true })
  referenceMonth: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
