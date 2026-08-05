import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { OffersModule } from './offers/offers.module';
import { PublicationsModule } from './publications/publications.module';
import { CategoriesModule } from './categories/categories.module';
import { GeneratorModule } from './generator/generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    MarketplacesModule,
    OffersModule,
    PublicationsModule,
    CategoriesModule,
    GeneratorModule,
  ],
})
export class AppModule {}
