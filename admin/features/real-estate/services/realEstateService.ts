import { Property, CreatePropertyInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const INITIAL_PROPERTIES: Omit<Property, "id" | "createdAt" | "updatedAt">[] = [
  {
    tenantId: "t-1",
    title: "Cobertura Duplex no Leblon",
    description: "Espetacular cobertura duplex reformada por renomado arquiteto, com vista para o mar e Cristo Redentor. 4 suítes, piscina privativa e terraço gourmet.",
    type: "cobertura",
    price: 8500000,
    bedrooms: 4,
    bathrooms: 5,
    area: 320,
    status: "published",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80"],
  },
  {
    tenantId: "t-1",
    title: "Casa Condomínio Alto de Pinheiros",
    description: "Moderna casa em condomínio fechado com segurança 24h. Living com pé direito duplo, automação residencial, 4 suítes e amplo jardim com piscina.",
    type: "casa",
    price: 4900000,
    bedrooms: 4,
    bathrooms: 6,
    area: 450,
    status: "published",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"],
  },
  {
    tenantId: "t-1",
    title: "Apartamento Decorado nos Jardins",
    description: "Lindo apartamento totalmente mobiliado e equipado. Pronto para morar, com ar-condicionado em todos os ambientes e acabamento em mármore.",
    type: "apartamento",
    price: 2200000,
    bedrooms: 2,
    bathrooms: 3,
    area: 110,
    status: "published",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80"],
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
      "ngrok-skip-browser-warning": "1",
      "Bypass-Tunnel-Reminder": "true",
    }
  } catch {
    return {}
  }
}

export const realEstateService = {
  async getAllProperties(tenantId: string): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/real-estate`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de imóveis do servidor.")
    }

    const data = (await response.json()) as Property[]

    // Auto-seed if database is empty for this tenant
    if (data.length === 0) {
      const seeded: Property[] = []
      for (const item of INITIAL_PROPERTIES) {
        try {
          const { tenantId: _, ...input } = item
          const created = await this.createProperty(tenantId, input)
          seeded.push(created)
        } catch (e) {
          console.error("Failed to seed property:", e)
        }
      }
      if (seeded.length > 0) {
        return seeded
      }
    }

    return data
  },

  async createProperty(tenantId: string, input: CreatePropertyInput): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/real-estate`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar imóvel no servidor.")
    }

    return response.json()
  },
}
