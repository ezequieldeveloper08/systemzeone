import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FipeBrandOrmEntity } from '../../infrastructure/database/fipe-brand.orm-entity';
import { FipeModelOrmEntity } from '../../infrastructure/database/fipe-model.orm-entity';
import { FipePriceOrmEntity } from '../../infrastructure/database/fipe-price.orm-entity';

export interface FipeSyncState {
  isSyncing: boolean;
  isPaused: boolean;
  currentStage: 'idle' | 'initializing' | 'brands' | 'models' | 'prices' | 'completed' | 'stopped';
  vehicleTypes: ('cars' | 'motorcycles' | 'trucks')[];
  currentVehicleType: 'cars' | 'motorcycles' | 'trucks' | null;
  currentBrandName: string | null;
  currentModelName: string | null;
  totalBrands: number;
  processedBrands: number;
  totalModels: number;
  processedModels: number;
  totalPrices: number;
  processedPrices: number;
  delayMs: number;
  onlyMainBrands: boolean;
  maxModelsPerBrand: number;
  maxYearsPerModel: number;
  errorCount: number;
  errorMessage: string | null;
  logs: string[];
  token?: string | null;
  syncOnlyModels?: boolean;
}

const MAIN_BRANDS_KEYWORDS = [
  'chevrolet', 'fiat', 'ford', 'volkswagen', 'toyota', 'honda', 'hyundai', 'renault',
  'jeep', 'nissan', 'mitsubishi', 'bmw', 'mercedes-benz', 'audi', 'porsche', 'peugeot',
  'citroen', 'kia', 'yamaha', 'scania', 'volvo', 'iveco', 'harley-davidson', 'kawasaki'
];

const TYPE_MAPPING: Record<'cars' | 'motorcycles' | 'trucks', 'car' | 'motorcycle' | 'truck'> = {
  cars: 'car',
  motorcycles: 'motorcycle',
  trucks: 'truck',
};

@Injectable()
export class FipeSyncService {
  private readonly logger = new Logger(FipeSyncService.name);
  private state: FipeSyncState = this.getInitialState();

  constructor(
    @InjectRepository(FipeBrandOrmEntity)
    private readonly brandRepo: Repository<FipeBrandOrmEntity>,
    @InjectRepository(FipeModelOrmEntity)
    private readonly modelRepo: Repository<FipeModelOrmEntity>,
    @InjectRepository(FipePriceOrmEntity)
    private readonly priceRepo: Repository<FipePriceOrmEntity>,
  ) {}

  private getInitialState(): FipeSyncState {
    return {
      isSyncing: false,
      isPaused: false,
      currentStage: 'idle',
      vehicleTypes: ['cars', 'motorcycles', 'trucks'],
      currentVehicleType: null,
      currentBrandName: null,
      currentModelName: null,
      totalBrands: 0,
      processedBrands: 0,
      totalModels: 0,
      processedModels: 0,
      totalPrices: 0,
      processedPrices: 0,
      delayMs: 500,
      onlyMainBrands: true,
      maxModelsPerBrand: 5,
      maxYearsPerModel: 1,
      errorCount: 0,
      errorMessage: null,
      logs: [],
      token: null,
      syncOnlyModels: false,
    };
  }

  getStatus(): FipeSyncState {
    return this.state;
  }

  pause() {
    if (this.state.isSyncing && !this.state.isPaused) {
      this.state.isPaused = true;
      this.addLog('Sincronização pausada pelo administrador.');
    }
  }

  resume() {
    if (this.state.isSyncing && this.state.isPaused) {
      this.state.isPaused = false;
      this.addLog('Sincronização retomada.');
    }
  }

  stop() {
    if (this.state.isSyncing) {
      this.state.isSyncing = false;
      this.state.isPaused = false;
      this.state.currentStage = 'stopped';
      this.addLog('Sincronização interrompida.');
    }
  }

  async clearDatabase() {
    this.addLog('Limpando dados da Tabela FIPE do banco...');
    await this.priceRepo.delete({});
    await this.modelRepo.delete({});
    await this.brandRepo.delete({});
    this.state = this.getInitialState();
    this.addLog('Banco de dados da FIPE limpo com sucesso.');
  }

  start(options: Partial<FipeSyncState>) {
    if (this.state.isSyncing) {
      throw new Error('Sincronização já está em andamento.');
    }

    this.state = {
      ...this.getInitialState(),
      isSyncing: true,
      currentStage: 'initializing',
      vehicleTypes: options.vehicleTypes || ['cars'],
      delayMs: options.delayMs !== undefined ? options.delayMs : 500,
      onlyMainBrands: options.onlyMainBrands !== undefined ? options.onlyMainBrands : true,
      maxModelsPerBrand: options.maxModelsPerBrand !== undefined ? options.maxModelsPerBrand : 5,
      maxYearsPerModel: options.maxYearsPerModel !== undefined ? options.maxYearsPerModel : 1,
      token: options.token || null,
      syncOnlyModels: options.syncOnlyModels !== undefined ? options.syncOnlyModels : false,
    };

    this.addLog('Iniciando processo de sincronização da Tabela FIPE...');
    this.runSync().catch((err) => {
      this.state.isSyncing = false;
      this.state.errorMessage = err.message;
      this.addLog(`Erro fatal: ${err.message}`);
      this.logger.error('Erro na sincronização da FIPE:', err);
    });

    return this.state;
  }

  private addLog(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.state.logs.unshift(`[${timestamp}] ${msg}`);
    if (this.state.logs.length > 100) {
      this.state.logs.pop();
    }
    this.logger.log(msg);
  }

  private async checkPauseAndStop() {
    if ((this.state.currentStage as string) === 'stopped' || !this.state.isSyncing) {
      throw new Error('Processo cancelado pelo usuário.');
    }
    while (this.state.isPaused) {
      if ((this.state.currentStage as string) === 'stopped' || !this.state.isSyncing) {
        throw new Error('Processo cancelado pelo usuário.');
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  private async sleep() {
    await new Promise((resolve) => setTimeout(resolve, this.state.delayMs));
  }

  private async runSync() {
    try {
      for (const type of this.state.vehicleTypes) {
        this.state.currentVehicleType = type;
        const mappedType = TYPE_MAPPING[type];
        
        // Stage 1: Fetch and Sync Brands
        this.state.currentStage = 'brands';
        this.addLog(`[${type}] Buscando marcas da API FIPE...`);
        const apiBrands = await this.fetchApi(`/${type}/brands`);
        
        await this.checkPauseAndStop();

        let brandsToSync = apiBrands;
        if (this.state.onlyMainBrands) {
          brandsToSync = apiBrands.filter((b: any) =>
            MAIN_BRANDS_KEYWORDS.some((kw) => b.name.toLowerCase().includes(kw))
          );
          this.addLog(`[${type}] Filtrando principais marcas: de ${apiBrands.length} para ${brandsToSync.length}`);
        }

        this.state.totalBrands += brandsToSync.length;

        for (const brand of brandsToSync) {
          await this.checkPauseAndStop();
          this.state.currentBrandName = brand.name;
          
          let brandEntity = await this.brandRepo.findOne({
            where: { type: mappedType, code: brand.code },
          });

          if (!brandEntity) {
            brandEntity = this.brandRepo.create({
              type: mappedType,
              code: brand.code,
              name: brand.name,
            });
            await this.brandRepo.save(brandEntity);
          } else if (brandEntity.name !== brand.name) {
            brandEntity.name = brand.name;
            await this.brandRepo.save(brandEntity);
          }

          this.state.processedBrands++;
          await this.sleep();

          // Stage 2: Fetch and Sync Models
          this.state.currentStage = 'models';
          this.addLog(`[${type}] Buscando modelos para a marca: ${brand.name}...`);
          
          try {
            const apiModels = await this.fetchApi(`/${type}/brands/${brand.code}/models`);
            let modelsToSync = apiModels;
            
            if (this.state.maxModelsPerBrand > 0 && apiModels.length > this.state.maxModelsPerBrand) {
              modelsToSync = apiModels.slice(0, this.state.maxModelsPerBrand);
            }

            this.state.totalModels += modelsToSync.length;

            for (const model of modelsToSync) {
              await this.checkPauseAndStop();
              this.state.currentModelName = model.name;

              let modelEntity = await this.modelRepo.findOne({
                where: { brandId: brandEntity.id, code: model.code },
              });

              if (!modelEntity) {
                modelEntity = this.modelRepo.create({
                  brandId: brandEntity.id,
                  code: model.code,
                  name: model.name,
                });
                await this.modelRepo.save(modelEntity);
              } else if (modelEntity.name !== model.name) {
                modelEntity.name = model.name;
                await this.modelRepo.save(modelEntity);
              }

              this.state.processedModels++;
              await this.sleep();

              // Stage 3: Fetch and Sync Years & Prices
              if (this.state.syncOnlyModels) {
                continue;
              }

              this.state.currentStage = 'prices';
              try {
                const apiYears = await this.fetchApi(`/${type}/brands/${brand.code}/models/${model.code}/years`);
                let yearsToSync = apiYears;
                
                if (this.state.maxYearsPerModel > 0 && apiYears.length > this.state.maxYearsPerModel) {
                  yearsToSync = apiYears.slice(0, this.state.maxYearsPerModel);
                }

                this.state.totalPrices += yearsToSync.length;

                for (const year of yearsToSync) {
                  await this.checkPauseAndStop();
                  
                  // Query price details for this year
                  try {
                    const priceDetail = await this.fetchApi(`/${type}/brands/${brand.code}/models/${model.code}/years/${year.code}`);
                    
                    // Parse numeric price
                    let numericPrice: number | null = null;
                    if (priceDetail.price) {
                      const cleanStr = priceDetail.price.replace(/[^\d]/g, '');
                      if (cleanStr) {
                        numericPrice = parseFloat(cleanStr) / 100;
                      }
                    }

                    let priceEntity = await this.priceRepo.findOne({
                      where: { modelId: modelEntity.id, yearCode: year.code },
                    });

                    if (!priceEntity) {
                      priceEntity = this.priceRepo.create({
                        modelId: modelEntity.id,
                        yearCode: year.code,
                        yearName: year.name,
                        price: priceDetail.price,
                        numericPrice,
                        fuel: priceDetail.fuel,
                        fipeCode: priceDetail.fipeCode,
                        referenceMonth: priceDetail.referenceMonth,
                      });
                    } else {
                      priceEntity.price = priceDetail.price;
                      priceEntity.numericPrice = numericPrice;
                      priceEntity.fuel = priceDetail.fuel;
                      priceEntity.fipeCode = priceDetail.fipeCode;
                      priceEntity.referenceMonth = priceDetail.referenceMonth;
                    }

                    await this.priceRepo.save(priceEntity);
                    this.state.processedPrices++;
                  } catch (priceErr) {
                    this.state.errorCount++;
                    this.addLog(`Erro ao buscar preço (${year.name}): ${priceErr.message}`);
                  }
                  
                  await this.sleep();
                }
              } catch (yearErr) {
                this.state.errorCount++;
                this.addLog(`Erro ao buscar anos de ${model.name}: ${yearErr.message}`);
              }
            }
          } catch (modelErr) {
            this.state.errorCount++;
            this.addLog(`Erro ao buscar modelos de ${brand.name}: ${modelErr.message}`);
          }
        }
      }

      this.state.isSyncing = false;
      this.state.currentStage = 'completed';
      this.state.currentBrandName = null;
      this.state.currentModelName = null;
      this.addLog('Sincronização concluída com sucesso!');
    } catch (err) {
      if (err.message === 'Processo cancelado pelo usuário.') {
        this.state.isSyncing = false;
        this.state.currentStage = 'stopped';
        this.addLog('Processo cancelado pelo usuário.');
      } else {
        throw err;
      }
    }
  }

  private async waitFiveMinutesCountdown(): Promise<void> {
    const totalWaitMs = 5 * 60 * 1000; // 5 minutes
    const intervalMs = 1000; // check state every 1 second
    let elapsedMs = 0;
    
    this.addLog('[Modo Resiliência] Entrando em modo de espera de 5 minutos antes de tentar novamente...');

    while (elapsedMs < totalWaitMs) {
      if (!this.state.isSyncing) {
        throw new Error('Processo cancelado pelo usuário.');
      }
      
      // If paused, suspend countdown progress
      if (this.state.isPaused) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Log every 30 seconds
      if (elapsedMs % 30000 === 0) {
        const remainingSeconds = Math.round((totalWaitMs - elapsedMs) / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.addLog(`Tempo de espera restante para tentar novamente: ${timeStr}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      elapsedMs += intervalMs;
    }
  }

  private async fetchApi(path: string): Promise<any> {
    const url = `https://fipe.parallelum.com.br/api/v2${path}`;
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };
    if (this.state.token) {
      headers['X-Subscription-Token'] = this.state.token;
    }

    let retries = 3;

    while (retries > 0) {
      try {
        const response = await fetch(url, { headers });

        if (response.status === 429) {
          retries--;
          if (retries === 0) {
            const body = await response.text().catch(() => '');
            throw new Error(`API FIPE retornou limite excedido (429): ${body || response.statusText}`);
          }
          this.addLog(`[429 Too Many Requests] Limite de requisições excedido pela API FIPE.`);
          await this.waitFiveMinutesCountdown();
          continue;
        }

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`API FIPE retornou status ${response.status}: ${body || response.statusText}`);
        }

        return response.json();
      } catch (err) {
        if (err.message === 'Processo cancelado pelo usuário.') {
          throw err;
        }
        retries--;
        if (retries === 0) {
          throw err;
        }
        this.addLog(`[Erro de Conexão] Falha na requisição: ${err.message}.`);
        await this.waitFiveMinutesCountdown();
      }
    }
  }
}
