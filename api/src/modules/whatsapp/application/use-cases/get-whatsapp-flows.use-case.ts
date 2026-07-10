import { Inject, Injectable } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappFlow } from '../../domain/entities/whatsapp-flow.entity';
import * as crypto from 'crypto';

@Injectable()
export class GetWhatsappFlowsUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
  ) {}

  async execute(tenantId: string): Promise<WhatsappFlow[]> {
    const flows = await this.whatsappRepository.findFlowsByTenantId(tenantId);
    if (flows.length > 0) {
      return flows;
    }

    // Auto-seed default flows for the tenant
    const testDriveFlow = new WhatsappFlow(
      crypto.randomUUID(),
      tenantId,
      'Agendamento de Test Drive',
      null,
      'draft',
      ['lead_generation'],
      {
        first_screen: {
          title: 'Agendar Test Drive',
          fields: [
            { name: 'name', type: 'text', label: 'Seu Nome Completo', required: true },
            { name: 'email', type: 'text', label: 'Seu E-mail', required: true },
            { name: 'vehicle', type: 'select', label: 'Selecione o Veículo', options: ['Chevrolet Onix 2026', 'Chevrolet Tracker 2026', 'Chevrolet S10 2026'], required: true },
          ],
          next_button: 'Ver Datas Disponíveis',
        },
        second_screen: {
          title: 'Escolher Data e Hora',
          fields: [
            { name: 'date', type: 'select', label: 'Data Disponível', options: ['2026-06-23 10:00', '2026-06-23 14:00', '2026-06-24 09:00', '2026-06-24 15:00'], required: true },
          ],
          next_button: 'Confirmar Agendamento',
        },
        third_screen: {
          title: 'Agendamento Confirmado!',
          fields: [
            { name: 'summary', type: 'info', label: 'Obrigado! Seu test drive foi agendado. Compareça à concessionária na data escolhida.' },
          ],
          finish: true,
        },
      },
      new Date(),
      new Date(),
    );

    const valuationFlow = new WhatsappFlow(
      crypto.randomUUID(),
      tenantId,
      'Avaliação de Veículo Usado',
      null,
      'draft',
      ['lead_generation'],
      {
        first_screen: {
          title: 'Avaliar Meu Usado',
          fields: [
            { name: 'brand_model', type: 'text', label: 'Marca / Modelo', required: true },
            { name: 'year', type: 'text', label: 'Ano de Fabricação', required: true },
            { name: 'km', type: 'text', label: 'Quilometragem (KM)', required: true },
          ],
          next_button: 'Próxima Etapa',
        },
        second_screen: {
          title: 'Informações de Contato',
          fields: [
            { name: 'client_name', type: 'text', label: 'Nome', required: true },
            { name: 'client_phone', type: 'text', label: 'WhatsApp para Retorno', required: true },
            { name: 'condition', type: 'select', label: 'Estado de Conservação', options: ['Excelente', 'Bom', 'Regular', 'Precisa de Reparos'], required: true },
          ],
          next_button: 'Enviar Avaliação',
        },
        third_screen: {
          title: 'Avaliação Enviada',
          fields: [
            { name: 'summary', type: 'info', label: 'Recebemos os dados! Nossa equipe fará a pré-avaliação e enviará a proposta no seu WhatsApp.' },
          ],
          finish: true,
        },
      },
      new Date(),
      new Date(),
    );

    const leadFlow = new WhatsappFlow(
      crypto.randomUUID(),
      tenantId,
      'Ficha de Cadastro de Lead',
      null,
      'draft',
      ['lead_generation'],
      {
        first_screen: {
          title: 'Ficha de Cadastro',
          fields: [
            { name: 'name', type: 'text', label: 'Nome Completo', required: true },
            { name: 'phone', type: 'text', label: 'Telefone de Contato', required: true },
            { name: 'interest', type: 'select', label: 'Canal de Preferência', options: ['WhatsApp', 'Ligação Telefônica', 'E-mail'], required: true },
            { name: 'financing', type: 'select', label: 'Deseja simular financiamento?', options: ['Sim', 'Não'], required: true },
          ],
          next_button: 'Concluir Cadastro',
        },
        second_screen: {
          title: 'Cadastro Concluído!',
          fields: [
            { name: 'summary', type: 'info', label: 'Obrigado por se cadastrar! Em instantes um consultor falará com você.' },
          ],
          finish: true,
        },
      },
      new Date(),
      new Date(),
    );

    await this.whatsappRepository.saveFlow(testDriveFlow);
    await this.whatsappRepository.saveFlow(valuationFlow);
    await this.whatsappRepository.saveFlow(leadFlow);

    return [testDriveFlow, valuationFlow, leadFlow];
  }
}
