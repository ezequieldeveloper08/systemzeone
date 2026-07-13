export class CategoryItem {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public order: number,
    public enabled: boolean,
  ) {}
}

export class MenuItemVariation {
  constructor(
    public readonly id: string,
    public readonly menuItemId: string,
    public name: string,
    public price: number,
    public order: number,
    public enabled: boolean,
  ) {}
}

export class ChoiceItemVariation {
  constructor(
    public readonly id: string,
    public readonly choiceItemId: string,
    public additionalPrice: number,
    public variationId: string | null,
  ) {}
}

export class ChoiceItem {
  constructor(
    public readonly id: string,
    public readonly choiceId: string,
    public name: string,
    public order: number,
    public enabled: boolean,
    public variations: ChoiceItemVariation[],
  ) {}
}

export class Choice {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public choiceType: number,
    public minChoices: number,
    public maxChoices: number,
    public choiceItems: ChoiceItem[],
  ) {}
}

export class MenuItem {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public description: string,
    public category: string, // Keep for backward fallback
    public status: 'published' | 'hidden',
    public image: string | null,
    public menuId: string | null,
    public categoryItemId: string | null,
    public categoryItem: CategoryItem | null,
    public variations: MenuItemVariation[],
    public choices: Choice[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
