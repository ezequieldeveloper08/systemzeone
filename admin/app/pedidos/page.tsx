"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Utensils,
  RefreshCw,
  Package,
  Bike,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronRight,
  Info,
  DollarSign,
  Phone
} from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface LocalOrder {
  id: string
  restaurantName: string
  restaurantSlug: string
  date: string
  totalPrice: number
}

interface ApiOrder {
  id: string
  tenantId: string
  customerName: string
  customerPhone: string
  deliveryType: "delivery" | "takeaway" | "table"
  address: string | null
  tableNumber: string | null
  totalPrice: number
  status: "pending" | "preparing" | "ready" | "delivering" | "finished" | "cancelled"
  items: any[]
  paymentMethod: string | null
  createdAt: string
  updatedAt: string
}

export default function PedidosPage() {
  const router = useRouter()
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([])
  const [ordersMap, setOrdersMap] = useState<Record<string, ApiOrder>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null)

  // 1. Load order list from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrdersStr = localStorage.getItem("zeone_customer_orders")
      if (savedOrdersStr) {
        try {
          const parsed = JSON.parse(savedOrdersStr) as LocalOrder[]
          setLocalOrders(parsed)
        } catch (e) {
          console.error("Erro ao ler localStorage de pedidos:", e)
        }
      }
      setLoading(false)
    }
  }, [])

  // 2. Fetch full statuses for all orders
  const fetchOrderDetails = async (ordersList: LocalOrder[], showLoadingState = false) => {
    if (showLoadingState) setRefreshing(true)

    const nextMap: Record<string, ApiOrder> = { ...ordersMap }
    let changed = false

    await Promise.all(
      ordersList.map(async (order) => {
        try {
          const res = await fetch(`${API_BASE_URL}/orders-public/${order.id}`)
          if (res.ok) {
            const data = (await res.json()) as ApiOrder
            nextMap[order.id] = data
            changed = true
          }
        } catch (err) {
          console.error(`Erro ao carregar detalhes do pedido ${order.id}:`, err)
        }
      })
    )

    if (changed) {
      setOrdersMap(nextMap)
      // Update selected order details if currently open
      if (selectedOrder) {
        const updatedSelected = nextMap[selectedOrder.id]
        if (updatedSelected) {
          setSelectedOrder(updatedSelected)
        }
      }
    }
    setRefreshing(false)
  }

  // Fetch when localOrders are loaded
  useEffect(() => {
    if (localOrders.length > 0) {
      fetchOrderDetails(localOrders)
    }
  }, [localOrders])

  // 3. Real-time SSE updates for active orders
  useEffect(() => {
    if (localOrders.length === 0) return

    // Find active order IDs (not finished or cancelled)
    const activeOrderIds = localOrders
      .filter((order) => {
        const details = ordersMap[order.id]
        return !details || (details.status !== "finished" && details.status !== "cancelled")
      })
      .map((o) => o.id)

    if (activeOrderIds.length === 0) return

    const eventSources: EventSource[] = []

    activeOrderIds.forEach((orderId) => {
      try {
        const eventSource = new EventSource(`${API_BASE_URL}/realtime/sse?orderId=${orderId}`)
        
        eventSource.addEventListener("order-status-changed", (event: MessageEvent) => {
          try {
            const updatedOrder = JSON.parse(event.data) as ApiOrder
            setOrdersMap((prev) => ({
              ...prev,
              [orderId]: updatedOrder,
            }))
            
            // Also update selectedOrder if it is this one
            setSelectedOrder((prev) => {
              if (prev && prev.id === orderId) {
                return updatedOrder
              }
              return prev
            })
            
            // Synthesize notification chime for customer
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
              if (AudioCtx) {
                const ctx = new AudioCtx()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.type = "sine"
                osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
                gain.gain.setValueAtTime(0.08, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
                osc.start(ctx.currentTime)
                osc.stop(ctx.currentTime + 0.4)
              }
            } catch (e) {}
          } catch (e) {
            console.error("Erro ao processar status alterado via SSE:", e)
          }
        })
        
        eventSources.push(eventSource)
      } catch (err) {
        console.error(`Erro ao conectar SSE para o pedido ${orderId}:`, err)
      }
    })

    return () => {
      eventSources.forEach((es) => es.close())
    }
  }, [localOrders, ordersMap])

  // 4. Slower backup polling (every 30s) just in case network drops
  useEffect(() => {
    if (localOrders.length === 0) return

    const interval = setInterval(() => {
      const hasActiveOrders = localOrders.some((order) => {
        const details = ordersMap[order.id]
        return !details || (details.status !== "finished" && details.status !== "cancelled")
      })

      if (hasActiveOrders) {
        fetchOrderDetails(localOrders)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [localOrders, ordersMap])

  // Helper to format currency
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Helper to format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Map status values to badges
  const getStatusBadge = (status: ApiOrder["status"]) => {
    const config = {
      pending: {
        text: "Recebido",
        bg: "bg-amber-50 border-amber-200 text-amber-700",
        icon: <Clock className="size-3.5 animate-pulse" />,
      },
      preparing: {
        text: "Em Preparação",
        bg: "bg-orange-50 border-orange-200 text-orange-700",
        icon: <Utensils className="size-3.5 animate-spin" style={{ animationDuration: '3s' }} />,
      },
      ready: {
        text: "Pronto p/ Retirar",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        icon: <Package className="size-3.5" />,
      },
      delivering: {
        text: "Saiu p/ Entrega",
        bg: "bg-purple-50 border-purple-200 text-purple-700",
        icon: <Bike className="size-3.5 animate-bounce" />,
      },
      finished: {
        text: "Concluído",
        bg: "bg-green-50 border-green-200 text-green-700",
        icon: <CheckCircle className="size-3.5" />,
      },
      cancelled: {
        text: "Cancelado",
        bg: "bg-red-50 border-red-200 text-red-700",
        icon: <XCircle className="size-3.5" />,
      },
    }

    const item = config[status] || {
      text: "Pendente",
      bg: "bg-neutral-50 border-neutral-200 text-neutral-700",
      icon: <Clock className="size-3.5" />,
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${item.bg}`}>
        {item.icon}
        {item.text}
      </span>
    )
  }

  const getStatusStepIndex = (status: ApiOrder["status"]) => {
    const steps: ApiOrder["status"][] = ["pending", "preparing", "delivering", "finished"]
    if (status === "ready") return 2 // ready acts as delivering/pickup step
    return steps.indexOf(status)
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-950 font-bold transition-all text-sm"
          >
            <ArrowLeft className="size-4" />
            <span>Início</span>
          </button>
          <h1 className="font-extrabold text-neutral-800 tracking-tight text-lg uppercase">Meus Pedidos</h1>
          <button
            onClick={() => fetchOrderDetails(localOrders, true)}
            disabled={refreshing || localOrders.length === 0}
            className="p-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50"
            title="Atualizar Status"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* CONTENT MAIN BODY */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-10 border-4 border-lime-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-neutral-500 text-sm font-semibold">Buscando seu histórico...</p>
          </div>
        ) : localOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
            <div className="size-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
              <Clock className="size-8" />
            </div>
            <h3 className="text-lg font-black text-neutral-800 tracking-tight uppercase">Sem pedidos ainda</h3>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
              Você não realizou nenhum pedido neste navegador recentemente. Adicione itens à sua sacola no cardápio do restaurante e finalize.
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-3 bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase rounded-xl transition-all shadow-md shadow-neutral-900/10"
            >
              Ver Restaurantes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Orders Feed */}
            {localOrders.map((localOrder) => {
              const details = ordersMap[localOrder.id]
              const status = details?.status || "pending"

              return (
                <div
                  key={localOrder.id}
                  onClick={() => details && setSelectedOrder(details)}
                  className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${details ? "border-neutral-200/80 hover:border-lime-500/50 hover:shadow-lg hover:shadow-lime-600/[0.03]" : "border-neutral-100 opacity-60"
                    }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-neutral-800 text-base">{localOrder.restaurantName}</span>
                      <ChevronRight className="size-3.5 text-neutral-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-neutral-400" />
                        {formatDate(localOrder.date)}
                      </span>
                      <span>•</span>
                      <span className="text-neutral-700 font-black">{formatPrice(localOrder.totalPrice)}</span>
                      <span>•</span>
                      <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-mono">
                        ID: {localOrder.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-50">
                    <div className="text-xs text-neutral-400 font-semibold md:hidden">Status atual:</div>
                    {details ? (
                      getStatusBadge(status)
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-neutral-50 border-neutral-100 text-neutral-400">
                        <div className="size-3 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
                        Sincronizando...
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* DETAILED TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-neutral-100 shadow-2xl animate-in scale-in duration-200 relative my-8 text-neutral-800">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-full transition-all"
            >
              <XCircle className="size-5" />
            </button>

            {/* Header info */}
            <div className="border-b border-neutral-100 pb-5 mb-5 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black tracking-tight text-neutral-800 uppercase">Acompanhar Pedido</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <p className="text-xs text-neutral-500 font-semibold flex items-center gap-3">
                <span>Pedido: <strong className="font-mono text-neutral-700">{selectedOrder.id}</strong></span>
                <span>•</span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
              </p>
            </div>

            {/* TRACKING TIMELINE / STEPPER (Only for active statuses, hide if cancelled) */}
            {selectedOrder.status !== "cancelled" ? (
              <div className="bg-neutral-50 rounded-2xl p-5 mb-6">
                <div className="relative flex justify-between items-center w-full">
                  {/* Stepper progress track line */}
                  <div className="absolute left-4 right-4 top-4 h-1 bg-neutral-200 -z-0" />
                  <div
                    className="absolute left-4 top-4 h-1 bg-lime-600 -z-0 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, (getStatusStepIndex(selectedOrder.status) / 3) * 100))}%`,
                    }}
                  />

                  {/* Steps nodes */}
                  {[
                    { status: "pending", label: "Recebido", icon: <Clock className="size-4" /> },
                    { status: "preparing", label: "Preparo", icon: <Utensils className="size-4" /> },
                    { status: "delivering", label: "Rota", icon: <Bike className="size-4" /> },
                    { status: "finished", label: "Entregue", icon: <CheckCircle className="size-4" /> },
                  ].map((step, idx) => {
                    const stepIdx = getStatusStepIndex(selectedOrder.status)
                    const isDone = stepIdx >= idx
                    const isActive = stepIdx === idx

                    return (
                      <div key={step.status} className="flex flex-col items-center z-10 text-center gap-1.5 relative">
                        <div
                          className={`size-9 rounded-full flex items-center justify-center transition-all border ${isActive
                              ? "bg-lime-600 border-lime-600 text-white shadow-md shadow-lime-600/30 scale-110"
                              : isDone
                                ? "bg-lime-500 border-lime-500 text-white"
                                : "bg-white border-neutral-200 text-neutral-400"
                            }`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider transition-colors ${isActive ? "text-lime-700" : isDone ? "text-neutral-700" : "text-neutral-400"
                            }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6">
                <XCircle className="size-6 shrink-0" />
                <div className="text-xs font-semibold leading-relaxed">
                  Este pedido foi **Cancelado**. Se você tiver qualquer dúvida ou problema, por favor entre em contato direto com o estabelecimento.
                </div>
              </div>
            )}

            {/* ORDER ITEMS LIST */}
            <div className="space-y-3 mb-6">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5">
                Itens Selecionados
              </h4>
              <div className="max-h-[160px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 text-xs font-semibold border-b border-neutral-50 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="space-y-1">
                      <span className="text-neutral-800 font-extrabold">{item.quantity}x {item.name}</span>
                      {item.variation && (
                        <p className="text-[10px] text-neutral-500">Tamanho: {item.variation.name}</p>
                      )}
                      {item.choices && item.choices.length > 0 && (
                        <ul className="text-[10px] text-neutral-400 list-disc pl-3.5 space-y-0.5 mt-0.5">
                          {item.choices.map((c: any, cidx: number) => (
                            <li key={cidx}>{c.itemName || c.selectedItem?.name}</li>
                          ))}
                        </ul>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-neutral-400 italic font-medium bg-neutral-50 px-2 py-1 rounded mt-1">
                          Obs: {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-neutral-700 font-black">
                      {formatPrice((item.variation?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DETAILS FOOTER */}
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-2.5 text-xs font-semibold border border-neutral-100">
              <div className="flex justify-between items-center text-neutral-500">
                <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Tipo</span>
                <span className="text-neutral-800 uppercase text-[10px] font-black">
                  {selectedOrder.deliveryType === "delivery"
                    ? "Entrega a Domicílio"
                    : selectedOrder.deliveryType === "takeaway"
                      ? "Retirada Balcão"
                      : `Consumo Local • Mesa ${selectedOrder.tableNumber}`}
                </span>
              </div>

              {selectedOrder.deliveryType === "delivery" && selectedOrder.address && (
                <div className="flex justify-between items-start text-neutral-500 border-t border-neutral-100/60 pt-2.5">
                  <span className="flex items-center gap-1.5 shrink-0"><MapPin className="size-3.5" /> Endereço</span>
                  <span className="text-neutral-700 text-[10px] leading-relaxed text-right font-medium max-w-[220px]">
                    {selectedOrder.address}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-neutral-500 border-t border-neutral-100/60 pt-2.5">
                <span className="flex items-center gap-1.5"><DollarSign className="size-3.5" /> Pagamento</span>
                <span className="text-neutral-700 font-bold">{selectedOrder.paymentMethod || "Não informado"}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-800 text-sm border-t border-dashed border-neutral-200 pt-2.5">
                <span className="font-extrabold uppercase tracking-wide">Valor Total</span>
                <span className="font-black text-lime-700 text-base">{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
