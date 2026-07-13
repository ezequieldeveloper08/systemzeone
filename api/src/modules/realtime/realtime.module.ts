import { Module, Global } from '@nestjs/common';
import { RealTimeService } from './realtime.service';
import { RealTimeController } from './realtime.controller';

@Global()
@Module({
  providers: [RealTimeService],
  controllers: [RealTimeController],
  exports: [RealTimeService],
})
export class RealTimeModule {}
