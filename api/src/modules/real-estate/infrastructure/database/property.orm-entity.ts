import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TenantOrmEntity } from '../../../tenant/infrastructure/database/tenant.orm-entity';
import { PropertyType, PropertyPurpose, PropertyStatus, FurnishingType, PropertyImage, PropertyVideo } from '../../domain/entities/property.entity';

@Entity('properties')
export class PropertyOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantOrmEntity;

  @Column({ type: 'varchar', nullable: true })
  code: string | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', nullable: true })
  type: string | null;

  @Column({ type: 'varchar', nullable: true })
  purpose: string | null;

  @Column({ type: 'varchar', nullable: true })
  status: string | null;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    zipCode?: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
    hideExactAddress?: boolean;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  area: {
    total?: number;
    usable?: number;
    land?: number;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  rooms: {
    bedrooms: number;
    suites: number;
    bathrooms: number;
    parkingSpaces: number;
    livingRooms?: number;
    kitchens?: number;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  details: {
    floor?: number;
    totalFloors?: number;
    constructionYear?: number;
    furnishing: FurnishingType;
    acceptsPets?: boolean;
    accessible?: boolean;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  pricing: {
    rentPrice?: number;
    salePrice?: number;
    condominiumFee?: number;
    propertyTax?: number;
    fireInsurance?: number;
    serviceFee?: number;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  features: {
    balcony?: boolean;
    airConditioning?: boolean;
    builtInCabinets?: boolean;
    serviceArea?: boolean;
    backyard?: boolean;
    garden?: boolean;
    pool?: boolean;
    privatePool?: boolean;
    barbecue?: boolean;
    homeOffice?: boolean;
    closet?: boolean;
    bathtub?: boolean;
    elevator?: boolean;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  condominium: {
    id?: string;
    name?: string;
    features?: {
      pool?: boolean;
      gym?: boolean;
      playground?: boolean;
      partyRoom?: boolean;
      gameRoom?: boolean;
      sportsCourt?: boolean;
      barbecue?: boolean;
      coworking?: boolean;
      laundry?: boolean;
      elevator?: boolean;
      concierge?: boolean;
      concierge24h?: boolean;
      gatedCommunity?: boolean;
      garden?: boolean;
      sauna?: boolean;
      petArea?: boolean;
      bikeRack?: boolean;
    };
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  rules: {
    petsAllowed?: boolean;
    childrenAllowed?: boolean;
    smokingAllowed?: boolean;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  media: {
    cover?: string;
    images: PropertyImage[];
    videos?: PropertyVideo[];
    virtualTourUrl?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  commercial: {
    exclusive?: boolean;
    featured?: boolean;
    newListing?: boolean;
    availableForVisits?: boolean;
    availableFrom?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  owner: {
    id: string;
    name?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  realtor: {
    id: string;
    name?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  agency: {
    id: string;
    name?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  seo: {
    title?: string;
    description?: string;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
