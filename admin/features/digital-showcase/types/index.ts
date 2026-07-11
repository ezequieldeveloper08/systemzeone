export interface Product {
  id: string
  tenantId: string
  title: string
  description: string
  category: string
  price: number
  stock: number
  status: "published" | "hidden"
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  title: string
  description: string
  category: string
  price: number
  stock?: number
  status?: "published" | "hidden"
  images?: string[]
}
