import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './modules/tenant/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { FipeModule } from './modules/fipe/fipe.module';
import { TeamModule } from './modules/team/team.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CrmModule } from './modules/crm/crm.module';
import { RealEstateModule } from './modules/real-estate/real-estate.module';
import { MenuModule } from './modules/menu/menu.module';
import { DigitalShowcaseModule } from './modules/digital-showcase/digital-showcase.module';
import { OrderModule } from './modules/order/order.module';
import { TableModule } from './modules/table/table.module';
import { RealTimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RealTimeModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'veiculos',
      autoLoadEntities: true,
      synchronize: true, // Auto-create tables for local development
    }),
    TenantModule,
    AuthModule,
    WhatsappModule,
    VehicleModule,
    FipeModule,
    CrmModule,
    TeamModule,
    FinanceModule,
    RealEstateModule,
    MenuModule,
    DigitalShowcaseModule,
    OrderModule,
    TableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
