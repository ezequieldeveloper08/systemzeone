import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LeadOrmEntity } from './infrastructure/database/lead.orm-entity';
import { LeadService } from './application/services/lead.service';
import { LeadController } from './presentation/controllers/lead.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([LeadOrmEntity]),
  ],
  providers: [LeadService],
  controllers: [LeadController],
  exports: [LeadService],
})
export class LeadModule {}
