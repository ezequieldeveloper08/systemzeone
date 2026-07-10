import { WhatsappFlow } from './whatsapp-flow.entity';

export class WhatsappFlowResponse {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly flowId: string,
    public recipientPhone: string,
    public recipientName: string,
    public submittedData: Record<string, any>,
    public readonly createdAt: Date,
    public flow?: WhatsappFlow,
  ) {}
}
