import { Injectable } from '@nestjs/common';
import { MercadoLivreProvider } from './providers/mercadolivre.provider';
import { MarketplaceMockProvider } from './providers/mock.provider';
import { SearchProductParams, NormalizedProduct } from './types';

@Injectable()
export class MarketplacesService {
  constructor(
    private readonly mlProvider: MercadoLivreProvider,
    private readonly mockProvider: MarketplaceMockProvider,
  ) {}

  async searchProducts(params: SearchProductParams): Promise<NormalizedProduct[]> {
    if (params.query && params.query.startsWith('MLB')) {
      const mlResult = await this.mlProvider.searchByProductIdentifier(params.query);
      if (mlResult) return [mlResult];
    }

    const mockResults = await this.mockProvider.searchProducts(params);
    return mockResults;
  }

  async getProductByIdentifier(identifier: string): Promise<NormalizedProduct | null> {
    const mlResult = await this.mlProvider.searchByProductIdentifier(identifier);
    if (mlResult) return mlResult;
    return this.mockProvider.getProductDetails(identifier);
  }

  async getProductDetails(productId: string): Promise<NormalizedProduct | null> {
    return this.getProductByIdentifier(productId);
  }
}
