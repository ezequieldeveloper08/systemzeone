import { Module } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';
import { MarketplacesController } from './marketplaces.controller';
import { MercadoLivreProvider } from './providers/mercadolivre.provider';
import { MarketplaceMockProvider } from './providers/mock.provider';

@Module({
  controllers: [MarketplacesController],
  providers: [MarketplacesService, MercadoLivreProvider, MarketplaceMockProvider],
  exports: [MarketplacesService, MercadoLivreProvider],
})
export class MarketplacesModule {}
