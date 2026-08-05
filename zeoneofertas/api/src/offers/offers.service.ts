import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceType, OfferStatus } from '@prisma/client';

export interface SaveOfferDto {
  externalProductId: string;
  externalItemId?: string;
  title: string;
  brand?: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  freeShipping?: boolean;
  sellerName?: string;
  productUrl: string;
  workspaceId?: string;
}

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  calculateScore(discountPercentage: number, freeShipping: boolean, soldQuantity: number, hasCoupon: boolean, hasAffiliate: boolean): number {
    let score = 0;
    score += Math.min(discountPercentage * 0.8, 40);
    if (freeShipping) score += 15;
    if (soldQuantity >= 1000) score += 15;
    else if (soldQuantity >= 100) score += 10;
    else if (soldQuantity >= 10) score += 5;
    if (hasCoupon) score += 15;
    if (hasAffiliate) score += 15;

    return Math.min(Math.round(score), 100);
  }

  async saveOffer(dto: SaveOfferDto) {
    const workspace = await this.prisma.workspace.findFirst();
    const workspaceId = dto.workspaceId || workspace?.id || 'demo-workspace-01';

    // 1. Upsert CatalogProduct
    const catalogProduct = await this.prisma.catalogProduct.upsert({
      where: {
        marketplace_externalId: {
          marketplace: MarketplaceType.MERCADO_LIVRE,
          externalId: dto.externalProductId,
        },
      },
      update: {
        title: dto.title,
        brand: dto.brand,
        imageUrl: dto.imageUrl,
      },
      create: {
        marketplace: MarketplaceType.MERCADO_LIVRE,
        externalId: dto.externalProductId,
        title: dto.title,
        brand: dto.brand || 'Mercado Livre',
        imageUrl: dto.imageUrl,
      },
    });

    // 2. Create MarketplaceOffer
    const marketplaceOffer = await this.prisma.marketplaceOffer.create({
      data: {
        catalogProductId: catalogProduct.id,
        marketplace: MarketplaceType.MERCADO_LIVRE,
        externalItemId: dto.externalItemId || dto.externalProductId,
        sellerName: dto.sellerName || 'Vendedor Oficial ML',
        price: dto.price,
        originalPrice: dto.originalPrice,
        discountPercentage: dto.discountPercentage || 0,
        freeShipping: dto.freeShipping ?? true,
        productUrl: dto.productUrl,
      },
    });

    // 3. Calculate Score
    const score = this.calculateScore(
      dto.discountPercentage || 0,
      dto.freeShipping ?? true,
      100,
      false,
      false
    );

    // 4. Create SavedOffer in MySQL
    const savedOffer = await this.prisma.savedOffer.create({
      data: {
        workspaceId,
        marketplaceOfferId: marketplaceOffer.id,
        status: OfferStatus.FOUND,
        score,
      },
      include: {
        marketplaceOffer: {
          include: {
            catalogProduct: true,
          },
        },
      },
    });

    return savedOffer;
  }

  async getSavedOffers(workspaceId?: string) {
    const workspace = await this.prisma.workspace.findFirst();
    const wsId = workspaceId || workspace?.id || 'demo-workspace-01';

    return this.prisma.savedOffer.findMany({
      where: { workspaceId: wsId },
      include: {
        marketplaceOffer: {
          include: {
            catalogProduct: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
