const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

function getSessionHeaders(): Record<string, string> {
  try {
    const sessionStr = localStorage.getItem("auth_session")
    if (!sessionStr) return {}
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

export const tenantService = {
  async getTenant(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter dados da empresa do servidor.")
    }

    return response.json()
  },

  async updateTenant(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar dados da empresa.")
    }

    return response.json()
  }
}
