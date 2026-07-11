export class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public businessType: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
