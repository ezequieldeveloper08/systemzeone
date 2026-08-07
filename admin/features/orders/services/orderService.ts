import { Order } from "../types"

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

export const orderService = {
  async getAllOrders(tenantId: string, status?: string): Promise<Order[]> {
    let url = `${API_BASE_URL}/orders`
    if (status) {
      url += `?status=${encodeURIComponent(status)}`
    }
    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de pedidos do servidor.")
    }

    return response.json()
  },

  async createOrder(tenantId: string, input: Omit<Order, "id" | "tenantId" | "createdAt" | "updatedAt">): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar pedido no servidor.")
    }

    return response.json()
  },

  async updateOrderStatus(tenantId: string, id: string, status: Order["status"], paymentMethod?: string | null): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify({ status, paymentMethod }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao atualizar status do pedido no servidor.")
    }

    return response.json()
  },
}
