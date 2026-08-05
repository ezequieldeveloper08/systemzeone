import { Controller, Get, Query, Param } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';

@Controller('marketplaces')
export class MarketplacesController {
  constructor(private readonly marketplacesService: MarketplacesService) {}

  @Get('search')
  async search(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minDiscount') minDiscount?: string,
    @Query('freeShipping') freeShipping?: string,
    @Query('sortBy') sortBy?: 'discount' | 'price_asc' | 'price_desc' | 'relevance',
  ) {
    return this.marketplacesService.searchProducts({
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minDiscount: minDiscount ? parseFloat(minDiscount) : undefined,
      freeShipping: freeShipping === 'true',
      sortBy,
    });
  }

  @Get('ml/product-by-identifier')
  async getByProductIdentifier(@Query('id') id: string) {
    return this.marketplacesService.getProductByIdentifier(id || 'MLB58353028');
  }

  @Get('products/:id')
  async getDetails(@Param('id') id: string) {
    return this.marketplacesService.getProductDetails(id);
  }
}
