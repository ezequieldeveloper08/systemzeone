import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { CategoryItemOrmEntity } from './category-item.orm-entity';
import { MenuItemVariationOrmEntity } from './item-variation.orm-entity';
import { ChoiceOrmEntity } from './choice.orm-entity';

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

  @Column({ name: 'category_item_id', type: 'uuid', nullable: true })
  categoryItemId: string | null;

  @ManyToOne(() => CategoryItemOrmEntity, (cat) => cat.items, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_item_id' })
  categoryItem: CategoryItemOrmEntity | null;

  @Column({ nullable: true })
  category: string; // Keep for fallback compatibility

  @OneToMany(() => MenuItemVariationOrmEntity, (variation) => variation.menuItem, { cascade: true })
  variations: MenuItemVariationOrmEntity[];

  @ManyToMany(() => ChoiceOrmEntity, (choice) => choice.menuItems, { cascade: true })
  @JoinTable({
    name: 'menu_item_choices',
    joinColumn: { name: 'menu_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'choice_id', referencedColumnName: 'id' }
  })
  choices: ChoiceOrmEntity[];

  @Column({ type: 'varchar', default: 'published' })
  status: 'published' | 'hidden';

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ name: 'menu_id', type: 'uuid', nullable: true })
  menuId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
