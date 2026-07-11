"use client"

import React, { useMemo } from "react"
import { useOrderHistory } from "../hooks/useOrderHistory"
import { Order } from "../types"
import { 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react"

export function OrderHistoryDashboard() {
  // Default to last 7 days
  const defaultStartDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split("T")[0]
  }, [])

  const defaultEndDate = useMemo(() => {
    return new Date().toISOString().split("T")[0]
  }, [])

  const { orders, total, loading, filters, updateFilters, setPage } = useOrderHistory({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    limit: 15
  })

  // Calculate stats for current page (or we could calculate for all if backend provided it)
  // Since backend doesn't provide global aggregates yet, we'll aggregate current page or 
  // just show the total count. Ideally, we would have an aggregate endpoint.
  // For now, let's just compute from the fetched list (it's partial, but serves as an example).
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)
  
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  const statusLabel = (status: Order["status"]) => {
    const map: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      pending: { label: "Aguardando", bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-400", icon: Clock },
      preparing: { label: "Cozinha", bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-400", icon: Clock },
      ready: { label: "Pronto", bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400", icon: CheckCircle2 },
      delivering: { label: "Em Rota", bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-400", icon: Truck },
      finished: { label: "Concluído", bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
      cancelled: { label: "Cancelado", bg: "bg-neutral-100 dark:bg-neutral-900", text: "text-neutral-700 dark:text-neutral-400", icon: XCircle },
    }
    return map[status] || { label: status, bg: "bg-neutral-100", text: "text-neutral-700", icon: Clock }
  }

  const totalPages = Math.ceil(total / (filters.limit || 15))

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 p-8 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Relatórios e Histórico
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Acompanhe o desempenho e visualize o histórico de pedidos.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-neutral-400 uppercase px-2">Data Inicial</label>
              <input 
                type="date" 
                value={filters.startDate || ""}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="h-8 px-2 text-sm bg-transparent border-none focus:ring-0 text-neutral-700 dark:text-neutral-300 font-semibold"
              />
            </div>
            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-neutral-400 uppercase px-2">Data Final</label>
              <input 
                type="date" 
                value={filters.endDate || ""}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="h-8 px-2 text-sm bg-transparent border-none focus:ring-0 text-neutral-700 dark:text-neutral-300 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="size-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Total de Pedidos</p>
              <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{total}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
              <DollarSign className="size-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Faturamento da Página</p>
              <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
              <TrendingUp className="size-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Ticket Médio (Página)</p>
              <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{formatCurrency(averageTicket)}</p>
            </div>
          </div>
        </div>

        {/* Data Table Area */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <select 
                value={filters.status || ""}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="">Todos os Status</option>
                <option value="finished">Concluídos</option>
                <option value="cancelled">Cancelados</option>
                <option value="pending">Aguardando</option>
                <option value="delivering">Em Rota</option>
              </select>

              <select 
                value={filters.deliveryType || ""}
                onChange={(e) => updateFilters({ deliveryType: e.target.value })}
                className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="">Todos os Tipos</option>
                <option value="delivery">Delivery</option>
                <option value="takeaway">Retirada</option>
                <option value="table">Mesa</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-400 bg-white dark:bg-neutral-900">
                  <th className="px-6 py-4 font-bold">Data</th>
                  <th className="px-6 py-4 font-bold">Cliente / Origem</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Itens</th>
                  <th className="px-6 py-4 font-bold">Pagamento</th>
                  <th className="px-6 py-4 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      Carregando histórico...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      Nenhum pedido encontrado para estes filtros.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => {
                    const statusInfo = statusLabel(order.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                              {order.customerName || "Sem Nome"}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {order.deliveryType === "table" 
                                ? `Mesa ${order.tableNumber}` 
                                : order.deliveryType === "delivery" ? "Delivery" : "Retirada"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                            <StatusIcon className="size-3.5" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]" title={order.paymentMethod || "Não informado"}>
                          {order.paymentMethod || "—"}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-black text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(order.totalPrice)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
            <span className="text-sm text-neutral-500 font-medium">
              Mostrando {orders.length} de {total} pedidos
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage((filters.page || 1) - 1)}
                disabled={(filters.page || 1) <= 1}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="size-5" />
              </button>
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 px-2">
                Página {filters.page || 1} de {totalPages || 1}
              </span>
              <button 
                onClick={() => setPage((filters.page || 1) + 1)}
                disabled={(filters.page || 1) >= totalPages}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
