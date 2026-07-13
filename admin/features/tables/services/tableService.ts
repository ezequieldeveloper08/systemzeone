import { Table, CreateTableInput, UpdateTableInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const getSessionHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  const sessionStr = localStorage.getItem("veiculos_admin_session")
  if (!sessionStr) return {}
  try {
    const session = JSON.parse(sessionStr)
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      "x-tenant-id": String(session.activeTenant?.id || ""),
      "ngrok-skip-browser-warning": "1",
      "Bypass-Tunnel-Reminder": "true",
    }
  } catch {
    return {}
  }
}

export const tableService = {
  async getAllTables(): Promise<Table[]> {
    const response = await fetch(`${API_BASE_URL}/tables`, {
      method: "GET",
      headers: getSessionHeaders(),
    })
    if (!response.ok) throw new Error("Erro ao carregar mesas.")
    return response.json()
  },

  async createTable(input: CreateTableInput): Promise<Table> {
    const response = await fetch(`${API_BASE_URL}/tables`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao criar mesa.")
    }
    return response.json()
  },

  async updateTable(id: string, input: UpdateTableInput): Promise<Table> {
    const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao atualizar mesa.")
    }
    return response.json()
  },

  async deleteTable(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })
    if (!response.ok) throw new Error("Erro ao remover mesa.")
  },
}
