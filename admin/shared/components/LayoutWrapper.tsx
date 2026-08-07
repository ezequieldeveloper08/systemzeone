"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Sidebar } from "./Sidebar"
import { usePathname, useRouter } from "next/navigation"
import { X, Package, MessageSquare, Bell } from "lucide-react"

interface ToastMessage {
  id: string
  title: string
  message: string
  type: "order" | "whatsapp"
  link: string
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, activeTenant, loading } = useAuth()
  const router = useRouter()
  const path = usePathname()
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const routesIgnorePadding = ["/admin/whatsapp/chat"]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Play Premium audio notification chime using Web Audio API (no external asset files required)
  const playChime = (type: "order" | "whatsapp") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      if (type === "order") {
        // High-end double-tone chime for orders
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.type = "sine"
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
        gain1.gain.setValueAtTime(0.1, ctx.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.4)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = "sine"
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12) // A5
        gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.12)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.52)
        osc2.start(ctx.currentTime + 0.12)
        osc2.stop(ctx.currentTime + 0.52)
      } else {
        // Lighter single ping for WhatsApp
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = "sine"
        osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch (e) {
      console.warn("Falha ao tocar aviso sonoro:", e)
    }
  }

  // Set up SSE Event Listener for Active Tenant
  useEffect(() => {
    if (loading || !user || !activeTenant?.id) return

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    const eventSource = new EventSource(`${API_BASE_URL}/realtime/sse?tenantId=${activeTenant.id}`)

    eventSource.addEventListener("order-created", (event: MessageEvent) => {
      try {
        const order = JSON.parse(event.data)
        playChime("order")

        const newToast: ToastMessage = {
          id: Math.random().toString(),
          title: "Novo Pedido Recebido!",
          message: `Pedido de ${order.customerName} no valor de R$ ${(order.totalPrice || 0).toFixed(2)}`,
          type: "order",
          link: "/admin/orders",
        }

        setToasts((prev) => [newToast, ...prev])
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
        }, 5000)
      } catch (e) {
        console.error("Erro ao processar evento order-created:", e)
      }
    })

    eventSource.addEventListener("whatsapp-message", (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data)
        // Only trigger toast and sound if it's an inbound message AND the admin is not currently viewing the chat
        if (msg.messageDirection === "inbound" && !path.includes("/admin/whatsapp")) {
          playChime("whatsapp")

          const newToast: ToastMessage = {
            id: Math.random().toString(),
            title: `Nova mensagem de ${msg.senderName}!`,
            message: msg.bodyText || "Mensagem de mídia recebida.",
            type: "whatsapp",
            link: "/admin/whatsapp",
          }

          setToasts((prev) => [newToast, ...prev])
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
          }, 5000)
        }
      } catch (e) {
        console.error("Erro ao processar evento whatsapp-message:", e)
      }
    })

    return () => {
      eventSource.close()
    }
  }, [user, activeTenant, loading, path])

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
        <main className={routesIgnorePadding.includes(path) ? "" : "px-8 py-8 animate-in fade-in duration-200"}>
          {children}
        </main>
      </div>

      {/* Global Real-Time Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              router.push(toast.link)
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }}
            className="pointer-events-auto cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-2xl flex items-start gap-3 hover:scale-102 hover:shadow-lime-600/5 transition-all duration-300 animate-in slide-in-from-right-5 border-l-4 border-l-lime-600 text-neutral-800 dark:text-neutral-100"
          >
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === "order" ? "bg-lime-50 text-lime-600 dark:bg-lime-950/20" : "bg-blue-50 text-blue-600 dark:bg-blue-950/20"
              }`}>
              {toast.type === "order" ? <Package className="size-5" /> : <MessageSquare className="size-5" />}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="font-extrabold text-sm tracking-tight">{toast.title}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal truncate">{toast.message}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 transition-all shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
