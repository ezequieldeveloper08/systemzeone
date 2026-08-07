import { MenuItem, CreateMenuItemInput, MenuGroup } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const INITIAL_MENU_ITEMS: Omit<MenuItem, "id" | "createdAt" | "updatedAt">[] = [
  {
    tenantId: "t-1",
    name: "Burger Monster Bacon",
    description: "Hambúrguer com blend de costela 180g, muito queijo cheddar derretido, cebola caramelizada e fatias crocantes de bacon no pão brioche.",
    category: "hambúrgueres",
    categoryItemId: null,
    categoryItem: null,
    status: "published",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    variations: [
      { id: "", name: "Único", price: 42.0, enabled: true, order: 0 }
    ],
    choices: [],
    menuId: null,
  },
  {
    tenantId: "t-1",
    name: "Pizza Margherita Especial",
    description: "Molho de tomate artesanal, muçarela de búfala fresca, tomate cereja, pesto de manjericão e finalizada com azeite trufado.",
    category: "pizzas",
    categoryItemId: null,
    categoryItem: null,
    status: "published",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
    variations: [
      { id: "", name: "Único", price: 65.0, enabled: true, order: 0 }
    ],
    choices: [],
    menuId: null,
  },
  {
    tenantId: "t-1",
    name: "Petit Gâteau com Sorvete",
    description: "Bolo quente de chocolate belga com recheio cremoso e escorrendo, acompanhado de uma bola de sorvete de baunilha artesanal.",
    category: "sobremesas",
    categoryItemId: null,
    categoryItem: null,
    status: "published",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    variations: [
      { id: "", name: "Único", price: 26.0, enabled: true, order: 0 }
    ],
    choices: [],
    menuId: null,
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

export const menuService = {
  async getAllMenuItems(tenantId: string, filters?: { menuId?: string }): Promise<MenuItem[]> {
    let url = `${API_BASE_URL}/menu`
    if (filters?.menuId) {
      url += `?menuId=${encodeURIComponent(filters.menuId)}`
    }
    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de itens do cardápio do servidor.")
    }

    const data = (await response.json()) as MenuItem[]

    // Auto-seed if database is empty for this tenant
    if (data.length === 0 && !filters?.menuId) {
      const seeded: MenuItem[] = []
      for (const item of INITIAL_MENU_ITEMS) {
        try {
          const { tenantId: _, ...input } = item
          const created = await this.createMenuItem(tenantId, input)
          seeded.push(created)
        } catch (e) {
          console.error("Failed to seed menu item:", e)
        }
      }
      if (seeded.length > 0) {
        return seeded
      }
    }

    return data
  },

  async getMenuItemById(tenantId: string, id: string): Promise<MenuItem | null> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error("Erro ao obter detalhes do item do cardápio.")
    }

    return response.json()
  },

  async createMenuItem(tenantId: string, input: CreateMenuItemInput): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar item do cardápio no servidor.")
    }

    return response.json()
  },

  async updateMenuItem(tenantId: string, id: string, input: Partial<CreateMenuItemInput>): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao atualizar item do cardápio no servidor.")
    }

    return response.json()
  },

  async deleteMenuItem(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao remover item do cardápio no servidor.")
    }
  },

  async uploadMenuItemImage(tenantId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const headers = getSessionHeaders()
    delete headers["Content-Type"]

    const response = await fetch(`${API_BASE_URL}/menu/upload`, {
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

  async getAllMenuGroups(tenantId: string): Promise<MenuGroup[]> {
    const response = await fetch(`${API_BASE_URL}/menu/groups`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de cardápios (agrupamentos) da unidade.")
    }

    return response.json()
  },

  async createMenuGroup(tenantId: string, name: string, description?: string): Promise<MenuGroup> {
    const response = await fetch(`${API_BASE_URL}/menu/groups`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({ name, description }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar cardápio na unidade.")
    }

    return response.json()
  },

  async updateMenuGroup(tenantId: string, id: string, input: Partial<MenuGroup>): Promise<MenuGroup> {
    const response = await fetch(`${API_BASE_URL}/menu/groups/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao atualizar cardápio na unidade.")
    }

    return response.json()
  },

  async deleteMenuGroup(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/menu/groups/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao remover cardápio na unidade.")
    }
  },
}
