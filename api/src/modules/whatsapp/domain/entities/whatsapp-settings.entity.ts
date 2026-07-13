export class WhatsappSettings {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public accessToken: string,
    public phoneNumberId: string,
    public businessAccountId: string,
    public webhookVerifyToken: string,
    public status: 'connected' | 'disconnected' | 'error',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public aiEnabled: boolean = false,
    public aiApiKey: string | null = null,
    public aiAgentInstructions: string | null = null,
    public aiModel: string = 'gemini-2.0-flash',
    public aiPausedPhones: string[] = [],
    public aiActiveTools: string[] = [],
  ) {}
}
