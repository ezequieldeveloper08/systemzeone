export class Order {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public customerName: string,
    public customerPhone: string,
    public deliveryType: 'delivery' | 'takeaway' | 'table',
    public address: string | null,
    public tableNumber: string | null,
    public totalPrice: number,
    public status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'finished' | 'cancelled',
    public items: any[], // Array of items containing option selections
    public paymentMethod: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
