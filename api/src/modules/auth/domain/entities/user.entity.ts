export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public tenantId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public role: string = 'vendedor',
  ) {}
}
