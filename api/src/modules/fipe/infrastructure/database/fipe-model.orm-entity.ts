import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { FipeBrandOrmEntity } from './fipe-brand.orm-entity';

@Entity('fipe_models')
@Unique(['brandId', 'code'])
export class FipeModelOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brand_id' })
  @Index()
  brandId: string;

  @ManyToOne(() => FipeBrandOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: FipeBrandOrmEntity;

  @Column()
  code: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
