import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RealTimeService } from './realtime.service';

@ApiTags('Realtime Public')
@Controller('realtime')
export class RealTimeController {
  constructor(private readonly realTimeService: RealTimeService) {}

  @Get('sse')
  @ApiOperation({ summary: 'Conexão de fluxo de eventos SSE pública' })
  sse(
    @Query('tenantId') tenantId: string,
    @Query('orderId') orderId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Add client to active connection manager
    this.realTimeService.addClient(res, tenantId || undefined, orderId || undefined);

    // Send initial heart-beat event so client knows connection is successful
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'ok' })}\n\n`);

    // Clean up when client closes the connection
    req.on('close', () => {
      this.realTimeService.removeClient(res);
    });
  }
}
