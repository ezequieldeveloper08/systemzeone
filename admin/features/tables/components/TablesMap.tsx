"use client"

import React, { useState, useMemo } from "react"
import { useTables } from "../hooks/useTables"
import { useOrders } from "@/features/orders/hooks/useOrders"
import { Table } from "../types"
import { Order } from "@/features/orders/types"
import { Button } from "@/components/ui/button"
import { CommandaModal } from "./CommandaModal"
import { ManageTablesModal } from "./ManageTablesModal"
import {
  LayoutGrid,
  Settings,
  Users,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react"

export function TablesMap() {
  const { tables, loading: tablesLoading, createTable, updateTable, deleteTable } = useTables()
  const { orders, loading: ordersLoading, createOrder, updateOrderStatus } = useOrders()

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showManage, setShowManage] = useState(false)

  // Group active (non-finished/cancelled) orders by tableNumber
  const activeOrdersByTable = useMemo(() => {
    const map: Record<string, Order[]> = {}
    for (const order of orders) {
      if (
        order.deliveryType === "table" &&
        order.tableNumber &&
        order.status !== "finished" &&
        order.status !== "cancelled"
      ) {
        if (!map[order.tableNumber]) map[order.tableNumber] = []
        map[order.tableNumber].push(order)
      }
    }
    return map
  }, [orders])

  const getTableStatus = (table: Table): "free" | "occupied" | "reserved" => {
    if (activeOrdersByTable[table.number]?.length > 0) return "occupied"
    return table.status
  }

  const getTableTotal = (table: Table): number => {
    return (activeOrdersByTable[table.number] || []).reduce((s, o) => s + o.totalPrice, 0)
  }

  const getActiveOrders = (table: Table): Order[] => {
    return activeOrdersByTable[table.number] || []
  }

  const statusConfig = {
    free: {
      bg: "bg-white dark:bg-neutral-950",
      border: "border-emerald-300 dark:border-emerald-700",
      ring: "hover:ring-2 hover:ring-emerald-400",
      dot: "bg-emerald-500",
      label: "Livre",
      labelColor: "text-emerald-600 dark:text-emerald-400",
    },
    occupied: {
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-300 dark:border-orange-700",
      ring: "hover:ring-2 hover:ring-orange-400",
      dot: "bg-orange-500 animate-pulse",
      label: "Ocupada",
      labelColor: "text-orange-600 dark:text-orange-400",
    },
    reserved: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-300 dark:border-blue-700",
      ring: "hover:ring-2 hover:ring-blue-400",
      dot: "bg-blue-500",
      label: "Reservada",
      labelColor: "text-blue-600 dark:text-blue-400",
    },
  }

  const handleCloseAccount = async (table: Table, paymentMethod: string) => {
    const activeOrders = getActiveOrders(table)
    for (const order of activeOrders) {
      await updateOrderStatus(order.id, "finished", paymentMethod)
    }
    // Set table free
    if (table.status !== "reserved") {
      await updateTable(table.id, { status: "free" })
    }
  }

  const loading = tablesLoading || ordersLoading

  return (
    <div className="space-y-8 max-w-full relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-neutral-900 dark:bg-white p-2 text-white dark:text-neutral-950 shadow-sm">
              <LayoutGrid className="size-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Mesas e Comandas
            </h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Gerencie as mesas do salão e acompanhe as comandas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 mr-2 px-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {(["free", "occupied", "reserved"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${statusConfig[s].dot}`} />
                <span className="text-xs font-medium text-neutral-500">{statusConfig[s].label}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowManage(true)}
            variant="outline"
            className="flex items-center gap-1.5 h-10 border-neutral-200 dark:border-neutral-800"
          >
            <Settings className="size-4" />
            Gerenciar Mesas
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!loading && tables.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Livres",
              value: tables.filter((t) => getTableStatus(t) === "free").length,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/20",
              border: "border-emerald-200 dark:border-emerald-800/50",
            },
            {
              label: "Ocupadas",
              value: tables.filter((t) => getTableStatus(t) === "occupied").length,
              color: "text-orange-600 dark:text-orange-400",
              bg: "bg-orange-50 dark:bg-orange-950/20",
              border: "border-orange-200 dark:border-orange-800/50",
            },
            {
              label: "Reservadas",
              value: tables.filter((t) => getTableStatus(t) === "reserved").length,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/20",
              border: "border-blue-200 dark:border-blue-800/50",
            },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border p-4 ${bg} ${border}`}>
              <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
              <p className={`text-3xl font-extrabold ${color} mt-1`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tables Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="size-8 animate-spin text-neutral-300" />
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div className="size-20 rounded-3xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
            <LayoutGrid className="size-10 text-neutral-300" />
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">Nenhuma mesa cadastrada</p>
            <p className="text-sm text-neutral-400 mt-1">Configure as mesas do salão para começar</p>
          </div>
          <Button
            onClick={() => setShowManage(true)}
            className="bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 flex gap-2"
          >
            <Plus className="size-4" />
            Cadastrar Mesas
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tables.map((table) => {
            const status = getTableStatus(table)
            const cfg = statusConfig[status]
            const total = getTableTotal(table)
            const orderCount = getActiveOrders(table).length

            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-150 cursor-pointer group aspect-square ${cfg.bg} ${cfg.border} ${cfg.ring}`}
              >
                {/* Status dot */}
                <span className={`absolute top-3 right-3 size-2.5 rounded-full ${cfg.dot}`} />

                {/* Table number */}
                <span className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-200 leading-none mb-1">
                  {table.number}
                </span>

                {/* Label */}
                {table.label && (
                  <span className="text-[10px] font-medium text-neutral-400 truncate max-w-full px-1">
                    {table.label}
                  </span>
                )}

                {/* Capacity */}
                <div className="flex items-center gap-1 mt-2">
                  <Users className="size-3 text-neutral-400" />
                  <span className="text-[10px] text-neutral-400">{table.capacity}</span>
                </div>

                {/* Status label */}
                <span className={`text-[10px] font-bold uppercase mt-1 ${cfg.labelColor}`}>{cfg.label}</span>

                {/* Total if occupied */}
                {status === "occupied" && (
                  <div className="mt-2 px-2 py-1 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                      R$ {total.toFixed(2)}
                    </p>
                    <p className="text-[9px] text-neutral-400 text-center">{orderCount} pedido{orderCount > 1 ? "s" : ""}</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* Quick add button */}
          <button
            onClick={() => setShowManage(true)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-all aspect-square group"
          >
            <Plus className="size-8 group-hover:scale-110 transition-transform" />
            <span className="text-xs mt-2 font-medium">Nova Mesa</span>
          </button>
        </div>
      )}

      {/* Comanda Modal */}
      {selectedTable && (
        <CommandaModal
          table={selectedTable}
          activeOrders={getActiveOrders(selectedTable)}
          onClose={() => setSelectedTable(null)}
          onAddItems={async (orderInput) => {
            await createOrder(orderInput)
          }}
          onCloseAccount={async (paymentMethod) => {
            await handleCloseAccount(selectedTable, paymentMethod)
            setSelectedTable(null)
          }}
        />
      )}

      {/* Manage Tables Modal */}
      {showManage && (
        <ManageTablesModal
          tables={tables}
          onClose={() => setShowManage(false)}
          onCreate={createTable}
          onUpdate={updateTable}
          onDelete={deleteTable}
        />
      )}
    </div>
  )
}
