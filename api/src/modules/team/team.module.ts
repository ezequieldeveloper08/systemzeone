import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { TeamController } from './presentation/controllers/team.controller';

@Module({
  imports: [
    AuthModule,
    TenantModule,
  ],
  controllers: [TeamController],
})
export class TeamModule {}
