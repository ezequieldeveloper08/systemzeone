import { User, Tenant, AuthSession } from "../types"

const STORAGE_KEYS = {
  SESSION: "veiculos_admin_session",
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export const authService = {
  initialize() {
    // No initialization steps required for API connection
  },

  getCurrentSession(): AuthSession | null {
    if (typeof window === "undefined") return null
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (!sessionStr) return null
    try {
      return JSON.parse(sessionStr) as AuthSession
    } catch {
      return null
    }
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao realizar login.")
    }

    const data = await response.json() // { accessToken: string, user: { id, name, email, tenantId }, tenant: { id, name, businessType } }

    const activeTenant: Tenant = {
      id: data.tenant?.id || data.user.tenantId,
      name: data.tenant?.name || "Concessionária Principal",
      slug: data.tenant?.name ? data.tenant.name.toLowerCase().replace(/\s+/g, "-") : "concessionaria-principal",
      businessType: data.tenant?.businessType || "veiculos",
      cnpj: "00.000.000/0001-00",
      address: "Endereço da Concessionária",
    }

    const session: AuthSession = {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
      },
      activeTenant,
      tenants: [activeTenant],
      token: data.accessToken,
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
    return session
  },

  async register(name: string, email: string, password: string, tenantName: string, businessType: string): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, tenantName, businessType }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao registrar conta.")
    }

    // Auto login immediately after successful registration
    return this.login(email, password)
  },

  async createTenant(userId: string, name: string): Promise<Tenant> {
    // Multi-tenant switching is handled by registrations in this version
    const session = this.getCurrentSession()
    if (!session) throw new Error("Sessão não encontrada.")
    return session.activeTenant
  },

  async switchTenant(tenantId: string): Promise<AuthSession> {
    const session = this.getCurrentSession()
    if (!session) throw new Error("Sessão não encontrada.")
    return session
  },

  logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.SESSION)
  },
}
