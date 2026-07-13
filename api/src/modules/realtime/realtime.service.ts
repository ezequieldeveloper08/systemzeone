import { Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';

interface SseClient {
  res: Response;
  tenantId?: string;
  orderId?: string;
}

@Injectable()
export class RealTimeService {
  private readonly logger = new Logger(RealTimeService.name);
  private clients: SseClient[] = [];

  addClient(res: Response, tenantId?: string, orderId?: string) {
    this.clients.push({ res, tenantId, orderId });
    this.logger.log(
      `Cliente SSE adicionado. Total: ${this.clients.length} (tenantId: ${tenantId || 'nenhum'}, orderId: ${orderId || 'nenhum'})`,
    );
  }

  removeClient(res: Response) {
    const index = this.clients.findIndex((c) => c.res === res);
    if (index !== -1) {
      this.clients.splice(index, 1);
      this.logger.log(`Cliente SSE removido. Total: ${this.clients.length}`);
    }
  }

  emitToTenant(tenantId: string, event: string, data: any) {
    const targets = this.clients.filter((c) => c.tenantId === tenantId);
    this.logger.log(`Transmitindo evento '${event}' para ${targets.length} clientes do tenant '${tenantId}'`);
    
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    for (const client of targets) {
      try {
        client.res.write(message);
      } catch (err) {
        this.logger.error(`Erro ao escrever no cliente SSE do tenant '${tenantId}':`, err);
      }
    }
  }

  emitToOrder(orderId: string, event: string, data: any) {
    const targets = this.clients.filter((c) => c.orderId === orderId);
    this.logger.log(`Transmitindo evento '${event}' para ${targets.length} clientes do pedido '${orderId}'`);
    
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of targets) {
      try {
        client.res.write(message);
      } catch (err) {
        this.logger.error(`Erro ao escrever no cliente SSE do pedido '${orderId}':`, err);
      }
    }
  }
}
