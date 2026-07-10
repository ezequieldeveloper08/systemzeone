import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FipeBrandOrmEntity } from './infrastructure/database/fipe-brand.orm-entity';
import { FipeModelOrmEntity } from './infrastructure/database/fipe-model.orm-entity';
import { FipePriceOrmEntity } from './infrastructure/database/fipe-price.orm-entity';
import { FipeSyncService } from './application/services/fipe-sync.service';
import { FipeController } from './presentation/controllers/fipe.controller';
import { FipeSyncController } from './presentation/controllers/fipe-sync.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FipeBrandOrmEntity,
      FipeModelOrmEntity,
      FipePriceOrmEntity,
    ]),
  ],
  providers: [FipeSyncService],
  controllers: [FipeController, FipeSyncController],
  exports: [TypeOrmModule, FipeSyncService],
})
export class FipeModule {}
