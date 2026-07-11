export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  businessType?: string
  logoUrl?: string
  cnpj?: string
  address?: string
}

export interface AuthSession {
  user: User
  activeTenant: Tenant
  tenants: Tenant[]
  token: string
}
