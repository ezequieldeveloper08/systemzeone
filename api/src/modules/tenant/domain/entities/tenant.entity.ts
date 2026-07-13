export class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public businessType: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public logo: string | null = null,
    public banner: string | null = null,
    public bio: string | null = null,
    public phone: string | null = null,
    public address: string | null = null,
    public openingHours: any | null = null,
    public instagram: string | null = null,
    public facebook: string | null = null,
  ) {}
}
