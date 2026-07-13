import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChoiceItemOrmEntity } from './choice-item.orm-entity';

@Entity('menu_choice_item_variations')
export class ChoiceItemVariationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'choice_item_id' })
  choiceItemId: string;

  @ManyToOne(() => ChoiceItemOrmEntity, (item) => item.variations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'choice_item_id' })
  choiceItem: ChoiceItemOrmEntity;

  @Column({ name: 'additional_price', type: 'float', default: 0 })
  additionalPrice: number;

  @Column({ name: 'variation_id', type: 'uuid', nullable: true })
  variationId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
