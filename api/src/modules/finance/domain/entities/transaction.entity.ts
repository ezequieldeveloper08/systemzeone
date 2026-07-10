export class Transaction {
  constructor(
    public readonly id: string,
    public tenantId: string,
    public description: string,
    public amount: number,
    public type: 'revenue' | 'expense',
    public status: 'pending' | 'paid',
    public dueDate: Date,
    public paymentDate: Date | null,
    public category: string,
    public vehicleId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
