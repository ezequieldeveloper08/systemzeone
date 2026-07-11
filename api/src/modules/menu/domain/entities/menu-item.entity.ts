export class MenuItem {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public description: string,
    public category: string, // Ex: 'bebidas', 'entradas', 'pratos principais', 'sobremesas'
    public price: number,
    public status: 'published' | 'hidden', // Disponível ou esgotado/inativo
    public image: string | null,
    public choiceGroups: any[],
    public menuId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
