import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { FipeSyncService, FipeSyncState } from '../../application/services/fipe-sync.service';

@ApiTags('Fipe Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fipe/sync')
export class FipeSyncController {
  constructor(private readonly syncService: FipeSyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obter status atual da sincronização da FIPE' })
  getStatus(): any {
    return this.syncService.getStatus();
  }

  @Post('start')
  @ApiOperation({ summary: 'Iniciar sincronização da FIPE' })
  start(@Body() options: any): any {
    return this.syncService.start(options);
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pausar sincronização' })
  pause() {
    this.syncService.pause();
    return { success: true };
  }

  @Post('resume')
  @ApiOperation({ summary: 'Retomar sincronização' })
  resume() {
    this.syncService.resume();
    return { success: true };
  }

  @Post('stop')
  @ApiOperation({ summary: 'Interromper sincronização' })
  stop() {
    this.syncService.stop();
    return { success: true };
  }

  @Post('clear')
  @ApiOperation({ summary: 'Limpar banco de dados da FIPE' })
  async clear() {
    await this.syncService.clearDatabase();
    return { success: true };
  }
}
