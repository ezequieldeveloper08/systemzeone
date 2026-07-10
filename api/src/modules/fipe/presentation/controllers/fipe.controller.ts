import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { FipeBrandOrmEntity } from '../../infrastructure/database/fipe-brand.orm-entity';
import { FipeModelOrmEntity } from '../../infrastructure/database/fipe-model.orm-entity';
import { FipePriceOrmEntity } from '../../infrastructure/database/fipe-price.orm-entity';

@ApiTags('Fipe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fipe')
export class FipeController {
  constructor(
    @InjectRepository(FipeBrandOrmEntity)
    private readonly brandRepo: Repository<FipeBrandOrmEntity>,
    @InjectRepository(FipeModelOrmEntity)
    private readonly modelRepo: Repository<FipeModelOrmEntity>,
    @InjectRepository(FipePriceOrmEntity)
    private readonly priceRepo: Repository<FipePriceOrmEntity>,
  ) {}

  @Get('brands')
  @ApiOperation({ summary: 'Listar marcas sincronizadas da FIPE' })
  async getBrands(@Query('type') type: 'car' | 'motorcycle' | 'truck') {
    return this.brandRepo.find({
      where: { type },
      order: { name: 'ASC' },
    });
  }

  @Get('models')
  @ApiOperation({ summary: 'Listar modelos sincronizados de uma marca' })
  async getModels(@Query('brandId') brandId: string) {
    return this.modelRepo.find({
      where: { brandId },
      order: { name: 'ASC' },
    });
  }

  @Get('prices')
  @ApiOperation({ summary: 'Listar anos e preços de um modelo' })
  async getPrices(@Query('modelId') modelId: string) {
    return this.priceRepo.find({
      where: { modelId },
      order: { yearName: 'DESC' },
    });
  }

  @Get('price-detail')
  @ApiOperation({ summary: 'Detalhe do preço FIPE por ano/versão' })
  async getPriceDetail(@Query('priceId') priceId: string) {
    return this.priceRepo.findOne({
      where: { id: priceId },
      relations: { model: { brand: true } },
    });
  }
}
