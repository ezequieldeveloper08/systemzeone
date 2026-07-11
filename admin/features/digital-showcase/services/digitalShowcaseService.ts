import { Product, CreateProductInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const INITIAL_PRODUCTS: Omit<Product, "id" | "createdAt" | "updatedAt">[] = [
  {
    tenantId: "t-1",
    title: "Fone de Ouvido Over-Ear Noise Cancelling",
    description: "Fone Bluetooth premium com cancelamento ativo de ruído, som de alta resolução e bateria de até 40 horas.",
    category: "eletrônicos",
    price: 899.0,
    stock: 25,
    status: "published",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
  },
  {
    tenantId: "t-1",
    title: "Tênis Running Ultralight Pro",
    description: "Tênis projetado para alta performance na corrida, com entressola super macia de amortecimento e tecido respirável.",
    category: "calçados",
    price: 499.9,
    stock: 12,
    status: "published",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"],
  },
  {
    tenantId: "t-1",
    title: "Garrafa Térmica Sport 900ml",
    description: "Garrafa térmica em aço inoxidável com parede dupla a vácuo, mantém a água gelada por até 24 horas.",
    category: "esportes",
    price: 159.0,
    stock: 40,
    status: "published",
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"],
  }
]

const getSessionHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  const sessionStr = localStorage.getItem("veiculos_admin_session")
  if (!sessionStr) return {}
  try {
    const session = JSON.parse(sessionStr)
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`,
      "x-tenant-id": String(session.activeTenant?.id || ""),
    }
  } catch {
    return {}
  }
}

export const digitalShowcaseService = {
  async getAllProducts(tenantId: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/digital-showcase`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de produtos do servidor.")
    }

    const data = (await response.json()) as Product[]

    // Auto-seed if database is empty for this tenant
    if (data.length === 0) {
      const seeded: Product[] = []
      for (const item of INITIAL_PRODUCTS) {
        try {
          const { tenantId: _, ...input } = item
          const created = await this.createProduct(tenantId, input)
          seeded.push(created)
        } catch (e) {
          console.error("Failed to seed product:", e)
        }
      }
      if (seeded.length > 0) {
        return seeded
      }
    }

    return data
  },

  async createProduct(tenantId: string, input: CreateProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/digital-showcase`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar produto no servidor.")
    }

    return response.json()
  },
}
