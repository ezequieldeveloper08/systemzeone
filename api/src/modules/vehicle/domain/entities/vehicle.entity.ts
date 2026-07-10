export class Vehicle {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public title: string,
    public brand: string,
    public model: string,
    public year: number,
    public description: string,
    public price: number,
    public salePrice: number | null,
    public status: 'published' | 'hidden',
    public images: string[],
    public km: number,
    public transmission: 'automatic' | 'manual',
    public fuel: 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid',
    public color: string,
    public tags: string[],
    public collections: string[],
    
    // Webmotors extra details
    public type: 'car' | 'motorcycle' | 'truck',
    public plate: string | null,
    public doors: number | null,
    public features: string[],
    public engine: string | null,
    public bodyType: string | null,
    
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
