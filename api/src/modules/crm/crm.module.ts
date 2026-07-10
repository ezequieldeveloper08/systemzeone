import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { VehicleModule } from '../vehicle/vehicle.module';

import { ContactOrmEntity } from './infrastructure/database/contact.orm-entity';
import { DealOrmEntity } from './infrastructure/database/deal.orm-entity';
import { PipelineOrmEntity } from './infrastructure/database/pipeline.orm-entity';
import { PipelineStageOrmEntity } from './infrastructure/database/pipeline-stage.orm-entity';
import { ActivityOrmEntity } from './infrastructure/database/activity.orm-entity';
import { TagOrmEntity } from './infrastructure/database/tag.orm-entity';
import { ContactTagOrmEntity } from './infrastructure/database/contact-tag.orm-entity';
import { OrderOrmEntity } from './infrastructure/database/order.orm-entity';
import { OrderItemOrmEntity } from './infrastructure/database/order-item.orm-entity';
import { TaskOrmEntity } from './infrastructure/database/task.orm-entity';
import { AppointmentOrmEntity } from './infrastructure/database/appointment.orm-entity';
import { ReminderOrmEntity } from './infrastructure/database/reminder.orm-entity';

import { ContactService } from './application/services/contact.service';
import { PipelineService } from './application/services/pipeline.service';
import { DealService } from './application/services/deal.service';
import { ActivityService } from './application/services/activity.service';
import { ReminderService } from './application/services/reminder.service';
import { TaskService } from './application/services/task.service';
import { AppointmentService } from './application/services/appointment.service';

import { ContactController } from './presentation/controllers/contact.controller';
import { PipelineController } from './presentation/controllers/pipeline.controller';
import { DealController } from './presentation/controllers/deal.controller';
import { TaskController } from './presentation/controllers/task.controller';
import { AppointmentController } from './presentation/controllers/appointment.controller';
import { ActivityController } from './presentation/controllers/activity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactOrmEntity,
      DealOrmEntity,
      PipelineOrmEntity,
      PipelineStageOrmEntity,
      ActivityOrmEntity,
      TagOrmEntity,
      ContactTagOrmEntity,
      OrderOrmEntity,
      OrderItemOrmEntity,
      TaskOrmEntity,
      AppointmentOrmEntity,
      ReminderOrmEntity,
    ]),
    AuthModule,
    TenantModule,
    VehicleModule,
  ],
  providers: [
    ContactService,
    PipelineService,
    DealService,
    ActivityService,
    ReminderService,
    TaskService,
    AppointmentService,
  ],
  controllers: [
    ContactController,
    PipelineController,
    DealController,
    TaskController,
    AppointmentController,
    ActivityController,
  ],
  exports: [
    ContactService,
    PipelineService,
    DealService,
    ActivityService,
    ReminderService,
    TaskService,
    AppointmentService,
  ],
})
export class CrmModule {}
