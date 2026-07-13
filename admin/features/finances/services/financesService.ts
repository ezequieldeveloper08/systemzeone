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

export interface Transaction {
  id: string
  tenantId: string
  description: string
  amount: number
  type: "revenue" | "expense"
  status: "pending" | "paid"
  dueDate: string
  paymentDate: string | null
  category: string
  vehicleId: string | null
  vehicle?: {
    id: string
    brand: string
    model: string
    plate: string
    year: number
  } | null
  createdAt: string
  updatedAt: string
}

export interface FlowSummary {
  metrics: {
    totalRevenue: number
    totalExpense: number
    balance: number
    pendingRevenue: number
    pendingExpense: number
  }
  history: Array<{
    month: string
    revenue: number
    expense: number
    balance: number
  }>
}

export const financesService = {
  async getTransactions(filters?: {
    type?: "revenue" | "expense"
    status?: "pending" | "paid"
    startDate?: string
    endDate?: string
  }): Promise<Transaction[]> {
    let url = `${API_BASE_URL}/finance`
    const params = new URLSearchParams()
    if (filters?.type) params.append("type", filters.type)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao obter transações financeiras.")
    }

    return response.json()
  },

  async getFlowSummary(): Promise<FlowSummary> {
    const response = await fetch(`${API_BASE_URL}/finance/flow`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao obter resumo do fluxo de caixa.")
    }

    return response.json()
  },

  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/finance`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao criar transação financeira.")
    }

    return response.json()
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/finance/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao atualizar transação.")
    }

    return response.json()
  },

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/finance/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Erro ao remover transação.")
    }
  }
}
