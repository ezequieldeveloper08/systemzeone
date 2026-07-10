export class WhatsappFlow {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public flowId: string | null,
    public status: 'draft' | 'published' | 'deprecated',
    public categories: string[],
    public screens: Record<string, any>,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
