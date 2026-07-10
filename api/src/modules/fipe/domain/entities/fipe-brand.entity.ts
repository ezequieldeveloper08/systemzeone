export class FipeBrand {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly type: 'car' | 'motorcycle' | 'truck',
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
