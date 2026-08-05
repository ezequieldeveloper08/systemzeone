import { PrismaClient, MarketplaceType, WorkspaceRole, OfferStatus, AffiliateLinkStatus, CouponStatus, SocialNetwork, PublicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seeder do OfertaHub no MySQL...');

  // 1. User Profile
  const passwordHash = await bcrypt.hash('123456', 10);
  const profile = await prisma.profile.upsert({
    where: { email: 'admin@ofertahub.com' },
    update: {},
    create: {
      name: 'Afiliado Pro',
      email: 'admin@ofertahub.com',
      passwordHash,
    },
  });

  // 2. Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'ofertas-vip' },
    update: {},
    create: {
      name: 'Canal Ofertas VIP',
      slug: 'ofertas-vip',
      ownerId: profile.id,
      members: {
        create: {
          userId: profile.id,
          role: WorkspaceRole.OWNER,
        },
      },
    },
  });

  // 3. Categories
  const catFerramentas = await prisma.category.create({
    data: {
      workspaceId: workspace.id,
      name: 'Ferramentas',
      slug: 'ferramentas',
    },
  });

  const catEletronicos = await prisma.category.create({
    data: {
      workspaceId: workspace.id,
      name: 'Eletrônicos',
      slug: 'eletronicos',
    },
  });

  // 4. Catalog Products & Offers
  const productDeWalt = await prisma.catalogProduct.create({
    data: {
      marketplace: MarketplaceType.MERCADO_LIVRE,
      externalId: 'MLB-20984123',
      title: 'Parafusadeira Furadeira de Impacto DeWalt 20V DCD7781D2',
      brand: 'DeWalt',
      model: 'DCD7781D2',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
      offers: {
        create: {
          marketplace: MarketplaceType.MERCADO_LIVRE,
          externalItemId: 'MLB-3918241',
          sellerName: 'Loja Oficial DeWalt',
          price: 549.9,
          originalPrice: 799.0,
          discountPercentage: 31.1,
          freeShipping: true,
          soldQuantity: 1240,
          productUrl: 'https://www.mercadolivre.com.br/p/MLB-20984123',
        },
      },
    },
    include: {
      offers: true,
    },
  });

  const offerId = productDeWalt.offers[0].id;

  // 5. Saved Offer
  const savedOffer = await prisma.savedOffer.create({
    data: {
      workspaceId: workspace.id,
      marketplaceOfferId: offerId,
      status: OfferStatus.READY_TO_SHARE,
      score: 88,
    },
  });

  // 6. Affiliate Link
  await prisma.affiliateLink.create({
    data: {
      savedOfferId: savedOffer.id,
      originalUrl: 'https://www.mercadolivre.com.br/p/MLB-20984123',
      affiliateUrl: 'https://mercadolivre.com/sec/2oK8aX9',
      trackingTag: 'promos-tech',
      status: AffiliateLinkStatus.VALIDATED,
      clickCount: 142,
    },
  });

  // 7. Coupon
  await prisma.coupon.create({
    data: {
      workspaceId: workspace.id,
      marketplace: MarketplaceType.MERCADO_LIVRE,
      code: 'FERRAMENTA10',
      title: '10% OFF em Ferramentas DeWalt',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumPurchase: 200,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: CouponStatus.EXPIRING_SOON,
    },
  });

  console.log('✅ Seeder concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
