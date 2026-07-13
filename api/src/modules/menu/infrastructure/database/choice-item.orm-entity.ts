import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ChoiceOrmEntity } from './choice.orm-entity';
import { ChoiceItemVariationOrmEntity } from './choice-item-variation.orm-entity';

@Entity('menu_choice_items')
export class ChoiceItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'choice_id' })
  choiceId: string;

  @ManyToOne(() => ChoiceOrmEntity, (choice) => choice.choiceItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'choice_id' })
  choice: ChoiceOrmEntity;

  @Column()
  name: string; // e.g. "Abacaxi", "Bacon"

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @OneToMany(() => ChoiceItemVariationOrmEntity, (variation) => variation.choiceItem, { cascade: true })
  variations: ChoiceItemVariationOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
