export class Product {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public title: string,
    public description: string,
    public category: string, // Ex: 'eletronicos', 'roupas', 'calcados'
    public price: number,
    public stock: number,
    public status: 'published' | 'hidden',
    public images: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
