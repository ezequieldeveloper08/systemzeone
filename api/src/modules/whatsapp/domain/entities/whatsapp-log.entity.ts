export class WhatsappLog {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public contactId: string | null,
    public recipientName: string,
    public recipientPhone: string,
    public messageDirection: 'inbound' | 'outbound',
    public messageType: 'text' | 'template' | 'image' | 'document' | 'interactive' | 'audio',
    public templateName: string | null,
    public variables: Record<string, string>,
    public bodyText: string,
    public status: 'sent' | 'delivered' | 'read' | 'failed',
    public errorMessage: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
