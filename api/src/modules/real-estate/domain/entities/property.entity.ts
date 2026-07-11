export class Property {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public title: string,
    public description: string,
    public type: string, // Ex: 'casa', 'apartamento', 'terreno'
    public price: number,
    public bedrooms: number,
    public bathrooms: number,
    public area: number, // em metros quadrados
    public status: 'published' | 'hidden',
    public images: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
