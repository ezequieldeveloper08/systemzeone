import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PropertyOrmEntity } from './infrastructure/database/property.orm-entity';
import { PropertyRepository } from './infrastructure/repositories/property.repository';
import { IPropertyRepositoryToken } from './domain/repositories/property.repository.interface';
import { ListPropertiesUseCase } from './application/use-cases/list-properties.use-case';
import { CreatePropertyUseCase } from './application/use-cases/create-property.use-case';
import { GetPropertyUseCase } from './application/use-cases/get-property.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property.use-case';
import { DeletePropertyUseCase } from './application/use-cases/delete-property.use-case';
import { RealEstateController } from './presentation/controllers/real-estate.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PropertyOrmEntity]),
  ],
  providers: [
    {
      provide: IPropertyRepositoryToken,
      useClass: PropertyRepository,
    },
    ListPropertiesUseCase,
    CreatePropertyUseCase,
    GetPropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
  ],
  controllers: [RealEstateController],
  exports: [IPropertyRepositoryToken],
})
export class RealEstateModule {}
