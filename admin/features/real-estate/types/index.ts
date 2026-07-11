export interface Property {
  id: string
  tenantId: string
  title: string
  description: string
  type: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  status: "published" | "hidden"
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyInput {
  title: string
  description: string
  type: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  status?: "published" | "hidden"
  images?: string[]
}
