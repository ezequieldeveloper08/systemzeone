const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

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

export interface Lead {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  message: string | null
  status: 'new' | 'contacted' | 'in_negotiation' | 'won' | 'lost'
  source: string
  vehicleId: string | null
  vehicle: {
    id: string
    title: string
    brand: string
    model: string
    year: number
    price: number
    images: string[]
  } | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export const leadsService = {
  async getLeads(filters?: { status?: string; source?: string }): Promise<Lead[]> {
    let url = `${API_BASE_URL}/leads`
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.source) params.append("source", filters.source)
    
    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de leads.")
    }

    return response.json()
  },

  async getLead(id: string): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter detalhes do lead.")
    }

    return response.json()
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar lead manualmente.")
    }

    return response.json()
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar lead.")
    }

    return response.json()
  },

  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir lead.")
    }
  }
}
