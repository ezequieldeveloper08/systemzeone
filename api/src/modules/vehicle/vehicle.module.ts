import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { VehicleOrmEntity } from './infrastructure/database/vehicle.orm-entity';
import { VehicleRepository } from './infrastructure/repositories/vehicle.repository';
import { IVehicleRepositoryToken } from './domain/repositories/vehicle.repository.interface';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.use-case';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.use-case';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { VehicleController } from './presentation/controllers/vehicle.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([VehicleOrmEntity]),
  ],
  providers: [
    {
      provide: IVehicleRepositoryToken,
      useClass: VehicleRepository,
    },
    ListVehiclesUseCase,
    GetVehicleUseCase,
    CreateVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  controllers: [VehicleController],
  exports: [IVehicleRepositoryToken],
})
export class VehicleModule {}
