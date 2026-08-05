export interface SearchProductParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  freeShipping?: boolean;
  sortBy?: 'discount' | 'price_asc' | 'price_desc' | 'relevance';
}

export interface NormalizedOffer {
  externalItemId: string;
  sellerId?: string;
  sellerName?: string;
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  freeShipping: boolean;
  availableQuantity: number;
  soldQuantity: number;
  productUrl: string;
}

export interface NormalizedProduct {
  id: string;
  externalId: string;
  catalogProductId?: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  imageUrl: string;
  images: string[];
  marketplace: 'MERCADO_LIVRE' | 'SHOPEE' | 'MANUAL';
  offers: NormalizedOffer[];
}

export interface MarketplaceProvider {
  marketplaceId: 'MERCADO_LIVRE' | 'SHOPEE' | 'MANUAL';
  searchProducts(params: SearchProductParams): Promise<NormalizedProduct[]>;
  getProductDetails(productId: string): Promise<NormalizedProduct | null>;
}
