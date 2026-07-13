export interface CategoryItem {
  id: string
  name: string
  order: number
  enabled: boolean
}

export interface MenuItemVariation {
  id: string
  name: string // Ex: "Único", "Média"
  price: number
  enabled: boolean
  order: number
}

export interface ChoiceItemVariation {
  id: string
  additionalPrice: number
  variationId?: string | null
}

export interface ChoiceItem {
  id: string
  name: string
  enabled: boolean
  order: number
  variations: ChoiceItemVariation[]
}

export interface Choice {
  id: string
  name: string
  choiceType: number // 1 = adicionais/multiple, etc.
  minChoices: number
  maxChoices: number
  choiceItems: ChoiceItem[]
}

export interface MenuGroup {
  id: string
  tenantId: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  tenantId: string
  name: string
  description: string
  category: string // Fallback simple category string
  categoryItemId: string | null
  categoryItem: CategoryItem | null
  status: "published" | "hidden"
  image: string | null
  variations: MenuItemVariation[]
  choices: Choice[]
  menuId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMenuItemInput {
  name: string
  description: string
  category?: string
  status?: "published" | "hidden"
  image?: string | null
  categoryItemId?: string | null
  variations?: MenuItemVariation[]
  choices?: Choice[]
  menuId?: string | null
}
