import { OrderHistoryFilters, OrderHistoryResponse } from "../types"

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

export const orderHistoryService = {
  async getHistory(filters: OrderHistoryFilters): Promise<OrderHistoryResponse> {
    const headers = getSessionHeaders()
    if (!headers["Authorization"]) {
      throw new Error("No authentication token found")
    }

    // Build query params
    const params = new URLSearchParams()
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.status) params.append("status", filters.status)
    if (filters.deliveryType) params.append("deliveryType", filters.deliveryType)
    if (filters.startDate) params.append("startDate", filters.startDate)
    if (filters.endDate) params.append("endDate", filters.endDate)

    const res = await fetch(`${API_BASE_URL}/orders/history?${params.toString()}`, {
      headers,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || "Failed to fetch order history")
    }

    return res.json()
  }
}
