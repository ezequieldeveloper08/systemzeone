import { Vehicle, CreateVehicleInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

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

export const vehicleService = {
  initialize() {
    // No-op
  },

  async getAllVehicles(tenantId: string): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de veículos do servidor.")
    }

    return response.json()
  },

  async getVehicleById(tenantId: string, id: string): Promise<Vehicle | null> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error("Erro ao obter detalhes do veículo.")
    }

    return response.json()
  },

  async createVehicle(tenantId: string, input: CreateVehicleInput): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar veículo no servidor.")
    }

    return response.json()
  },

  async updateVehicle(tenantId: string, id: string, input: Partial<CreateVehicleInput>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao atualizar veículo no servidor.")
    }

    return response.json()
  },

  async deleteVehicle(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao remover veículo no servidor.")
    }
  },

  async uploadImage(tenantId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const headers = getSessionHeaders()
    delete headers["Content-Type"]

    const response = await fetch(`${API_BASE_URL}/vehicles/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao fazer upload de imagem.")
    }

    const data = await response.json()
    return data.url
  },
}
