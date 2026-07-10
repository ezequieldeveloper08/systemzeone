export class FipePrice {
  constructor(
    public readonly id: string,
    public readonly modelId: string,
    public readonly yearCode: string,
    public readonly yearName: string,
    public readonly price: string,
    public readonly numericPrice: number | null,
    public readonly fuel: string | null,
    public readonly fipeCode: string | null,
    public readonly referenceMonth: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
