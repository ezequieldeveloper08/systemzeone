export interface Vehicle {
  id: string
  tenantId: string
  title: string
  brand: string
  model: string
  year: number
  description: string
  price: number
  salePrice?: number
  status: "published" | "hidden"
  images: string[]
  km: number
  transmission: "automatic" | "manual"
  fuel: "flex" | "gasoline" | "diesel" | "electric" | "hybrid"
  color: string
  tags: string[]
  collections: string[]
  createdAt: string

  // Webmotors extra details
  type?: "car" | "motorcycle" | "truck"
  plate?: string
  doors?: number
  features?: string[]
  engine?: string
  bodyType?: string
}

export type CreateVehicleInput = Omit<Vehicle, "id" | "tenantId" | "createdAt">
