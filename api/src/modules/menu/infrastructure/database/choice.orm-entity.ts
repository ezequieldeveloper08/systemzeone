import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { ChoiceItemOrmEntity } from './choice-item.orm-entity';
import { MenuItemOrmEntity } from './menu-item.orm-entity';

@Entity('menu_choices')
export class ChoiceOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column()
  name: string; // e.g. "Adicionais", "Remover Ingredientes"

  @Column({ name: 'choice_type', type: 'int', default: 1 })
  choiceType: number;

  @Column({ name: 'min_choices', type: 'int', default: 0 })
  minChoices: number;

  @Column({ name: 'max_choices', type: 'int', default: 1 })
  maxChoices: number;

  @OneToMany(() => ChoiceItemOrmEntity, (choiceItem) => choiceItem.choice, { cascade: true })
  choiceItems: ChoiceItemOrmEntity[];

  @ManyToMany(() => MenuItemOrmEntity, (item) => item.choices)
  menuItems: MenuItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
