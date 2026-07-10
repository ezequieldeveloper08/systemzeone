export class WhatsappTemplate {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION',
    public language: string,
    public status: 'PENDING' | 'APPROVED' | 'REJECTED',
    public headerType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'NONE',
    public headerText: string | null,
    public bodyText: string,
    public footerText: string | null,
    public buttons: any[],
    public variables: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
