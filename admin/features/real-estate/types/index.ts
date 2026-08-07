export type PropertyType =
  | 'apartment'
  | 'house'
  | 'condo_house'
  | 'studio'
  | 'kitnet'
  | 'loft'
  | 'penthouse'
  | 'commercial'
  | 'land'
  | 'farm';

export type PropertyPurpose =
  | 'rent'
  | 'sale'
  | 'rent_and_sale';

export type PropertyStatus =
  | 'draft'
  | 'active'
  | 'inactive'
  | 'rented'
  | 'sold'
  | 'reserved';

export type FurnishingType =
  | 'unfurnished'
  | 'semi_furnished'
  | 'furnished';

export interface PropertyImage {
  id: string;
  url: string;
  position: number;
  description?: string;
  isCover?: boolean;
}

export interface PropertyVideo {
  id: string;
  url: string;
  title?: string;
  position?: number;
}

export interface Property {
  id: string;
  tenantId: string;

  // Identificação
  code?: string;
  title: string;
  description?: string;
  slug?: string;

  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;

  // Localização
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
  };

  // Áreas
  area: {
    total?: number;
    usable?: number;
    land?: number;
  };

  // Cômodos
  rooms: {
    bedrooms: number;
    suites: number;
    bathrooms: number;
    parkingSpaces: number;

    livingRooms?: number;
    kitchens?: number;
  };

  // Características estruturais
  details: {
    floor?: number;
    totalFloors?: number;
    constructionYear?: number;

    furnishing: FurnishingType;

    acceptsPets?: boolean;
    accessible?: boolean;
  };

  // Valores
  pricing: {
    rentPrice?: number;
    salePrice?: number;

    condominiumFee?: number;
    propertyTax?: number;
    fireInsurance?: number;
    serviceFee?: number;
  };

  // Características do imóvel
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
  };

  // Condomínio
  condominium?: {
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
  };

  // Regras
  rules?: {
    petsAllowed?: boolean;
    childrenAllowed?: boolean;
    smokingAllowed?: boolean;
  };

  // Mídia
  media: {
    cover?: string;

    images: PropertyImage[];

    videos?: PropertyVideo[];

    virtualTourUrl?: string;
  };

  // Dados comerciais
  commercial: {
    exclusive?: boolean;
    featured?: boolean;
    newListing?: boolean;

    availableForVisits?: boolean;
    availableFrom?: string;
  };

  // Responsáveis
  owner?: {
    id: string;
    name?: string;
  };

  realtor?: {
    id: string;
    name?: string;
  };

  agency?: {
    id: string;
    name?: string;
  };

  // SEO
  seo?: {
    title?: string;
    description?: string;
  };

  createdAt: string;
  updatedAt: string;
}

export type CreatePropertyInput = Omit<Property, "id" | "tenantId" | "createdAt" | "updatedAt">;
export type UpdatePropertyInput = Partial<CreatePropertyInput>;
