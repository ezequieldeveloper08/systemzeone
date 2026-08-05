import { Injectable } from '@nestjs/common';
import { MarketplaceProvider, NormalizedProduct, SearchProductParams } from '../types';

@Injectable()
export class MarketplaceMockProvider implements MarketplaceProvider {
  marketplaceId: 'MERCADO_LIVRE' | 'SHOPEE' | 'MANUAL' = 'MERCADO_LIVRE';

  private readonly mockProducts: NormalizedProduct[] = [
    {
      id: 'prod-dewalt-01',
      externalId: 'MLB-20984123',
      catalogProductId: 'MLB-CAT-DEWALT-20V',
      title: 'Parafusadeira Furadeira de Impacto DeWalt 20V MAX Li-Ion DCD7781D2-BR',
      description: 'Parafusadeira e Furadeira de Impacto 1/2" (13mm) 20V MAX* Íon de Lítio, com 2 Baterias 2.0Ah, Carregador Bivolt e Maleta Rígida DeWalt.',
      brand: 'DeWalt',
      model: 'DCD7781D2-BR',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',
      ],
      marketplace: 'MERCADO_LIVRE',
      offers: [
        {
          externalItemId: 'MLB-3918241',
          sellerId: 'SELL-01',
          sellerName: 'Loja Oficial DeWalt Brasil',
          price: 549.9,
          originalPrice: 799.0,
          discountPercentage: 31.1,
          freeShipping: true,
          availableQuantity: 45,
          soldQuantity: 1240,
          productUrl: 'https://www.mercadolivre.com.br/p/MLB-20984123',
        },
        {
          externalItemId: 'MLB-3918242',
          sellerId: 'SELL-02',
          sellerName: 'EletroTools Distribuidora ML',
          price: 579.0,
          originalPrice: 750.0,
          discountPercentage: 22.8,
          freeShipping: true,
          availableQuantity: 18,
          soldQuantity: 320,
          productUrl: 'https://www.mercadolivre.com.br/p/MLB-20984123',
        },
      ],
    },
    {
      id: 'prod-makita-02',
      externalId: 'MLB-20984124',
      catalogProductId: 'MLB-CAT-MAKITA-12V',
      title: 'Furadeira e Parafusadeira Makita 12V CXT HP333DWYE com 2 Baterias e Maleta',
      description: 'Furadeira/parafusadeira de impacto a bateria Makita 12V max CXT. Mandril de aperto rápido.',
      brand: 'Makita',
      model: 'HP333DWYE',
      imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',
      ],
      marketplace: 'MERCADO_LIVRE',
      offers: [
        {
          externalItemId: 'MLB-3918245',
          sellerId: 'SELL-03',
          sellerName: 'Makita Store Oficial',
          price: 489.0,
          originalPrice: 629.0,
          discountPercentage: 22.25,
          freeShipping: true,
          availableQuantity: 32,
          soldQuantity: 850,
          productUrl: 'https://www.mercadolivre.com.br/p/MLB-20984124',
        },
      ],
    },
    {
      id: 'prod-airfryer-03',
      externalId: 'MLB-20984125',
      catalogProductId: 'MLB-CAT-AIRFRYER-MONDIAL',
      title: 'Fritadeira Elétrica sem Óleo Air Fryer Mondial Family 4 Litros AFN-40-BI 1500W Inox/Preta',
      description: 'Cesto com revestimento antiaderente Duraflon, controle de temperatura até 200°C e timer de 60 minutos.',
      brand: 'Mondial',
      model: 'AFN-40-BI',
      imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
      ],
      marketplace: 'SHOPEE',
      offers: [
        {
          externalItemId: 'SHP-991241',
          sellerId: 'SELL-SHP-01',
          sellerName: 'Mondial Eletro Shopee',
          price: 249.9,
          originalPrice: 399.0,
          discountPercentage: 37.36,
          freeShipping: true,
          availableQuantity: 120,
          soldQuantity: 3400,
          productUrl: 'https://shopee.com.br/product/991241',
        },
      ],
    },
    {
      id: 'prod-smarttv-04',
      externalId: 'MLB-20984126',
      catalogProductId: 'MLB-CAT-TV-SAMSUNG-55',
      title: 'Smart TV 55" UHD 4K Samsung 55CU7700 Processador Crystal 4K Gaming Hub',
      description: 'Visual livre de cabos, tela sem bordas, som em movimento virtual, comando de voz e Alexa integrada.',
      brand: 'Samsung',
      model: '55CU7700',
      imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      ],
      marketplace: 'MERCADO_LIVRE',
      offers: [
        {
          externalItemId: 'MLB-4912901',
          sellerId: 'SELL-04',
          sellerName: 'Samsung Loja Oficial ML',
          price: 2199.0,
          originalPrice: 3299.0,
          discountPercentage: 33.34,
          freeShipping: true,
          availableQuantity: 15,
          soldQuantity: 980,
          productUrl: 'https://www.mercadolivre.com.br/p/MLB-20984126',
        },
      ],
    },
  ];

  async searchProducts(params: SearchProductParams): Promise<NormalizedProduct[]> {
    let result = [...this.mockProducts];

    if (params.query) {
      const q = params.query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q)
      );
    }

    if (params.minDiscount) {
      result = result.filter((p) =>
        p.offers.some((o) => o.discountPercentage >= (params.minDiscount || 0))
      );
    }

    if (params.freeShipping) {
      result = result.filter((p) => p.offers.some((o) => o.freeShipping));
    }

    return result;
  }

  async getProductDetails(productId: string): Promise<NormalizedProduct | null> {
    const found = this.mockProducts.find((p) => p.id === productId || p.externalId === productId);
    return found || this.mockProducts[0];
  }
}
