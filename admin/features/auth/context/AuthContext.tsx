"use client"

import React, { createContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { User, Tenant, AuthSession } from "../types"
import { authService } from "../services/authService"

interface AuthContextType {
  user: User | null
  activeTenant: Tenant | null
  tenants: Tenant[]
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, tenantName: string) => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
  createTenant: (name: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    authService.initialize()
    const session = authService.getCurrentSession()
    if (session) {
      setUser(session.user)
      setActiveTenant(session.activeTenant)
      setTenants(session.tenants)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const session = await authService.login(email, password)
      setUser(session.user)
      setActiveTenant(session.activeTenant)
      setTenants(session.tenants)
      router.push("/admin/vehicles")
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, tenantName: string) => {
    setLoading(true)
    try {
      const session = await authService.register(name, email, password, tenantName)
      setUser(session.user)
      setActiveTenant(session.activeTenant)
      setTenants(session.tenants)
      router.push("/admin/vehicles")
    } finally {
      setLoading(false)
    }
  }

  const switchTenant = async (tenantId: string) => {
    if (!user) return
    setLoading(true)
    try {
      const session = await authService.switchTenant(tenantId)
      setActiveTenant(session.activeTenant)
      setTenants(session.tenants)
      // Reload current page or redirect to main page to clear local states of previous tenant
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const createTenant = async (name: string) => {
    if (!user) return
    setLoading(true)
    try {
      const newTenant = await authService.createTenant(user.id, name)
      // Update session local state
      const session = authService.getCurrentSession()
      if (session) {
        setActiveTenant(session.activeTenant)
        setTenants(session.tenants)
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setActiveTenant(null)
    setTenants([])
    router.push("/login")
  }, [router])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const urlStr = typeof args[0] === "string"
          ? args[0]
          : (args[0] instanceof Request ? args[0].url : "")

        const response = await originalFetch(...args)

        if (response.status === 401 && !urlStr.includes("/auth/login") && !urlStr.includes("/auth/register")) {
          logout()
        }

        return response
      }

      return () => {
        window.fetch = originalFetch
      }
    }
  }, [logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        activeTenant,
        tenants,
        loading,
        login,
        register,
        switchTenant,
        createTenant,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
