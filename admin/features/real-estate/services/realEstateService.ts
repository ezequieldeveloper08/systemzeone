import { Property, CreatePropertyInput, UpdatePropertyInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const INITIAL_PROPERTIES: Omit<Property, "id" | "tenantId" | "createdAt" | "updatedAt">[] = [
  {
    title: "Cobertura Duplex no Leblon",
    description: "Espetacular cobertura duplex reformada por renomado arquiteto, com vista para o mar e Cristo Redentor. 4 suítes, piscina privativa e terraço gourmet.",
    type: "penthouse",
    purpose: "sale",
    status: "active",
    address: {
      street: "Avenida Delfim Moreira",
      number: "1000",
      neighborhood: "Leblon",
      city: "Rio de Janeiro",
      state: "RJ",
      country: "Brasil",
      zipCode: "22441-000",
    },
    area: {
      total: 320,
      usable: 320,
    },
    rooms: {
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      parkingSpaces: 3,
    },
    details: {
      floor: 12,
      totalFloors: 12,
      furnishing: "furnished",
    },
    pricing: {
      salePrice: 8500000,
      condominiumFee: 3500,
      propertyTax: 800,
    },
    features: {
      pool: true,
      balcony: true,
      airConditioning: true,
      serviceArea: true,
      elevator: true,
    },
    media: {
      cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
      images: [
        { id: "img-1", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80", position: 1, isCover: true }
      ],
    },
    commercial: {
      featured: true,
      newListing: true,
    }
  },
  {
    title: "Casa Condomínio Alto de Pinheiros",
    description: "Moderna casa em condomínio fechado com segurança 24h. Living com pé direito duplo, automação residencial, 4 suítes e amplo jardim com piscina.",
    type: "condo_house",
    purpose: "sale",
    status: "active",
    address: {
      street: "Rua do Símbolo",
      number: "150",
      neighborhood: "Alto de Pinheiros",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      zipCode: "05462-000",
    },
    area: {
      total: 450,
      usable: 450,
    },
    rooms: {
      bedrooms: 4,
      suites: 4,
      bathrooms: 6,
      parkingSpaces: 4,
    },
    details: {
      constructionYear: 2018,
      furnishing: "semi_furnished",
    },
    pricing: {
      salePrice: 4900000,
      condominiumFee: 2200,
      propertyTax: 500,
    },
    features: {
      pool: true,
      backyard: true,
      garden: true,
      barbecue: true,
      airConditioning: true,
    },
    media: {
      cover: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
      images: [
        { id: "img-2", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", position: 1, isCover: true }
      ],
    },
    commercial: {
      featured: true,
    }
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
          const created = await this.createProperty(tenantId, item as any)
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

  async getPropertyById(tenantId: string, id: string): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/real-estate/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter dados do imóvel.")
    }

    return response.json()
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

  async updateProperty(tenantId: string, id: string, input: UpdatePropertyInput): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/real-estate/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao atualizar imóvel no servidor.")
    }

    return response.json()
  },

  async deleteProperty(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/real-estate/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir imóvel no servidor.")
    }
  },

  async uploadPropertyImage(tenantId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const headers = getSessionHeaders()
    if (headers["Content-Type"]) {
      delete headers["Content-Type"]
    }

    const response = await fetch(`${API_BASE_URL}/real-estate/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Erro ao fazer upload da imagem.")
    }

    return response.json()
  }
}
