export class FipeModel {
  constructor(
    public readonly id: string,
    public readonly brandId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
