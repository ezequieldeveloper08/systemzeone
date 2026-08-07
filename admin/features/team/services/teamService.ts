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

export interface TeamMember {
  id: string
  name: string
  email: string
  role?: string
  createdAt: string
}

export const teamService = {
  async getMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/team`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao obter lista de membros da equipe.")
    }

    return response.json()
  },

  async createMember(data: Partial<TeamMember> & { password?: string }): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/team`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao adicionar membro.")
    }

    return response.json()
  },

  async updateMember(id: string, data: Partial<TeamMember> & { password?: string }): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao atualizar membro da equipe.")
    }

    return response.json()
  },

  async deleteMember(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao excluir membro da equipe.")
    }
  }
}
