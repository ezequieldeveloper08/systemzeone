"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Sidebar } from "./Sidebar"
import { usePathname, useRouter } from "next/navigation"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-svh w-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-3 border-neutral-950 border-t-transparent dark:border-neutral-50" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Carregando painel...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-svh bg-neutral-50/30 dark:bg-neutral-950/10">
      <Sidebar />
      <div className="pl-72">
        <main className={path === "/admin/whatsapp/chat" || path === "/admin/whatsapp/flows/create" || path?.startsWith("/admin/whatsapp/flows/create/") ? "" : "mx-auto max-w-6xl px-8 py-8 animate-in fade-in duration-200"}>
          {children}
        </main>
      </div>
    </div>
  )
}
