export class Table {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public number: string,
    public capacity: number,
    public status: 'free' | 'occupied' | 'reserved',
    public label: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
