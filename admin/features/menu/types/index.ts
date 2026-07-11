export interface ChoiceOption {
  name: string
  price: number
}

export interface ChoiceGroup {
  name: string
  required: boolean
  minChoices: number
  maxChoices: number
  options: ChoiceOption[]
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
  category: string
  price: number
  status: "published" | "hidden"
  image: string | null
  choiceGroups: ChoiceGroup[]
  menuId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMenuItemInput {
  name: string
  description: string
  category: string
  price: number
  status?: "published" | "hidden"
  image?: string | null
  choiceGroups?: ChoiceGroup[]
  menuId?: string | null
}
