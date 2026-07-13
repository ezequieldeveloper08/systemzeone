import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItemOrmEntity } from './menu-item.orm-entity';

@Entity('menu_item_variations')
export class MenuItemVariationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @ManyToOne(() => MenuItemOrmEntity, (item) => item.variations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItemOrmEntity;

  @Column()
  name: string; // e.g., "Único", "Média", "Grande"

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
