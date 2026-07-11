"use client"

import React, { useState, useEffect } from "react"
import { useOrders } from "../hooks/useOrders"
import { Order } from "../types"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Clock,
  MapPin,
  Phone,
  Play,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Utensils,
  User,
  Coffee,
  Calendar,
  X,
  ShoppingCart
} from "lucide-react"
import { OrderPDVModal } from "./OrderPDVModal"

export function OrderBoard() {
  const { orders, loading, createOrder, updateOrderStatus, simulateIncomingOrder } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [showPDVModal, setShowPDVModal] = useState(false)
  const [finalizePaymentMethod, setFinalizePaymentMethod] = useState<string>("Dinheiro")
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null)

  useEffect(() => {
    if (selectedOrder) {
      setFinalizePaymentMethod(selectedOrder.paymentMethod || "Dinheiro")
    }
  }, [selectedOrder])

  // Filter orders by status
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const preparingOrders = orders.filter((o) => o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready")
  const deliveringOrders = orders.filter((o) => o.status === "delivering")
  const finishedOrders = orders.filter((o) => o.status === "finished" || o.status === "cancelled")

  const handleStatusChange = async (id: string, newStatus: Order["status"], paymentMethod?: string) => {
    try {
      await updateOrderStatus(id, newStatus, paymentMethod)
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus, paymentMethod: paymentMethod || prev.paymentMethod } : null))
      }
    } catch (err) {
      alert("Erro ao atualizar status do pedido.")
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: Order["status"]) => {
    e.preventDefault()
    setDraggedOverColumn(null)
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return

    const order = orders.find((o) => o.id === id)
    if (!order || order.status === targetStatus) return

    if (targetStatus === "finished") {
      if (order.paymentMethod === null) {
        setSelectedOrder(order)
        alert(`Selecione a forma de pagamento e finalize o pedido de ${order.customerName}.`)
        return
      } else {
        await handleStatusChange(id, "finished", order.paymentMethod)
      }
    } else {
      await handleStatusChange(id, targetStatus)
    }
  }

  const handleSimulate = async () => {
    setIsPlayingSound(true)
    await simulateIncomingOrder()
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, context.currentTime) // D5
      osc.frequency.setValueAtTime(880.00, context.currentTime + 0.15) // A5
      gain.gain.setValueAtTime(0.3, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(context.destination)
      osc.start()
      osc.stop(context.currentTime + 0.4)
    } catch (e) {
      console.warn("AudioContext block:", e)
    }
    setTimeout(() => setIsPlayingSound(false), 1000)
  }

  const getDeliveryBadge = (type: Order["deliveryType"]) => {
    switch (type) {
      case "delivery":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            <MapPin className="size-3" />
            Entrega
          </span>
        )
      case "table":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
            <Utensils className="size-3" />
            Mesa
          </span>
        )
      case "takeaway":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400">
            <ShoppingBag className="size-3" />
            Retirada
          </span>
        )
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-8 max-w-full mx-auto relative h-full">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Coffee className="size-8 text-neutral-700 dark:text-neutral-300" />
            Gestor de Pedidos
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Acompanhe e controle o fluxo de preparo e despacho dos pedidos da cozinha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPDVModal(true)}
            variant="outline"
            className="flex items-center gap-2 h-10 font-bold border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <ShoppingCart className="size-4" />
            Novo Pedido (PDV)
          </Button>
          <Button
            onClick={handleSimulate}
            className={`flex items-center gap-2 h-10 font-bold ${
              isPlayingSound ? "bg-orange-500 hover:bg-orange-600 animate-bounce" : "bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            }`}
          >
            <Bell className={`size-4 ${isPlayingSound ? "animate-spin" : ""}`} />
            Simular Novo Pedido
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80">
          <div className="size-8 border-3 border-neutral-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* BOARD COLUMNS */
        <div className="flex gap-4 items-start overflow-x-auto pb-4 -mx-8 px-8">
          
          {/* COLUMN 1: PENDING */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "pending")}
            onDragEnter={() => setDraggedOverColumn("pending")}
            onDragLeave={() => setDraggedOverColumn(null)}
            className={`w-[300px] shrink-0 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 space-y-4 min-h-[500px] transition-all ${
              draggedOverColumn === "pending" ? "ring-2 ring-dashed ring-neutral-400 bg-neutral-100/30 dark:bg-neutral-800/20" : ""
            }`}
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                Novos Pedidos
              </h3>
              <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {pendingOrders.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 italic">Nenhum pedido pendente</div>
              ) : (
                pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing space-y-3 group border-l-4 border-l-red-500 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors uppercase">
                        #{order.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {getDeliveryBadge(order.deliveryType)}
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                        R$ {order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: PREPARING */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "preparing")}
            onDragEnter={() => setDraggedOverColumn("preparing")}
            onDragLeave={() => setDraggedOverColumn(null)}
            className={`w-[300px] shrink-0 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 space-y-4 min-h-[500px] transition-all ${
              draggedOverColumn === "preparing" ? "ring-2 ring-dashed ring-neutral-400 bg-neutral-100/30 dark:bg-neutral-800/20" : ""
            }`}
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
                Na Cozinha
              </h3>
              <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {preparingOrders.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 italic">Cozinha vazia</div>
              ) : (
                preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing space-y-3 group border-l-4 border-l-orange-500 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors uppercase">
                        #{order.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {getDeliveryBadge(order.deliveryType)}
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                        R$ {order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: READY */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "ready")}
            onDragEnter={() => setDraggedOverColumn("ready")}
            onDragLeave={() => setDraggedOverColumn(null)}
            className={`w-[300px] shrink-0 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 space-y-4 min-h-[500px] transition-all ${
              draggedOverColumn === "ready" ? "ring-2 ring-dashed ring-neutral-400 bg-neutral-100/30 dark:bg-neutral-800/20" : ""
            }`}
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                Pronto p/ Entrega
              </h3>
              <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {readyOrders.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 italic">Nenhum pedido pronto</div>
              ) : (
                readyOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing space-y-3 group border-l-4 border-l-blue-500 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors uppercase">
                        #{order.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {getDeliveryBadge(order.deliveryType)}
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                        R$ {order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 4: DELIVERING */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "delivering")}
            onDragEnter={() => setDraggedOverColumn("delivering")}
            onDragLeave={() => setDraggedOverColumn(null)}
            className={`w-[300px] shrink-0 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 space-y-4 min-h-[500px] transition-all ${
              draggedOverColumn === "delivering" ? "ring-2 ring-dashed ring-neutral-400 bg-neutral-100/30 dark:bg-neutral-800/20" : ""
            }`}
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
                Saiu pra Entrega
              </h3>
              <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {deliveringOrders.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {deliveringOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 italic">Nenhum pedido em rota</div>
              ) : (
                deliveringOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing space-y-3 group border-l-4 border-l-purple-500 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors uppercase">
                        #{order.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {getDeliveryBadge(order.deliveryType)}
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                        R$ {order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 5: FINISHED */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "finished")}
            onDragEnter={() => setDraggedOverColumn("finished")}
            onDragLeave={() => setDraggedOverColumn(null)}
            className={`w-[300px] shrink-0 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 space-y-4 min-h-[500px] transition-all ${
              draggedOverColumn === "finished" ? "ring-2 ring-dashed ring-neutral-400 bg-neutral-100/30 dark:bg-neutral-800/20" : ""
            }`}
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-neutral-400" />
                Histórico (Hoje)
              </h3>
              <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {finishedOrders.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {finishedOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 italic">Sem histórico recente</div>
              ) : (
                finishedOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    className={`rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-md border-l-4 transition-all cursor-grab active:cursor-grabbing space-y-3 group dark:border-neutral-800 dark:bg-neutral-950 ${
                      order.status === "cancelled" ? "border-l-neutral-300 opacity-60" : "border-l-emerald-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors uppercase">
                        #{order.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        {order.status === "cancelled" ? (
                          <span className="text-[10px] text-red-500 font-bold">CANCELADO</span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="size-3" />
                            ENTREGUE
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {getDeliveryBadge(order.deliveryType)}
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                        R$ {order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1"
            >
              <X className="size-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2.5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Pedido #{selectedOrder.id.slice(0, 8)}
                </span>
                {getDeliveryBadge(selectedOrder.deliveryType)}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                    <User className="size-5 text-neutral-400" />
                    {selectedOrder.customerName}
                  </h3>
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                    <Phone className="size-3" />
                    {selectedOrder.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="py-4 space-y-4 max-h-60 overflow-y-auto my-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Itens do Pedido</p>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-extrabold text-neutral-900 dark:text-neutral-50">
                        R$ {item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Options list */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="pl-3.5 border-l border-neutral-200/60 dark:border-neutral-800/60 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {item.selectedOptions.map((opt, oIdx) => (
                          <div key={oIdx} className="flex justify-between">
                            <span>
                              {opt.groupName}: <strong className="font-semibold">{opt.optionName}</strong>
                            </span>
                            {opt.price > 0 && <span>+ R$ {opt.price.toFixed(2)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Details (Address/Table) & Total */}
            <div className="p-4 rounded-xl bg-neutral-100/55 dark:bg-neutral-900/65 flex flex-col gap-2">
              {selectedOrder.deliveryType === "delivery" && (
                <div className="flex gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <MapPin className="size-4 shrink-0 text-red-500" />
                  <div>
                    <strong className="font-semibold block">Endereço de Entrega:</strong>
                    <span>{selectedOrder.address}</span>
                  </div>
                </div>
              )}
              {selectedOrder.deliveryType === "table" && (
                <div className="flex gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <Utensils className="size-4 shrink-0 text-emerald-500" />
                  <div>
                    <strong className="font-semibold">Mesa de Atendimento:</strong>{" "}
                    <span>Mesa {selectedOrder.tableNumber}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 mt-1">
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Total do Pedido:</span>
                <span className="text-xl font-extrabold text-neutral-950 dark:text-neutral-50">
                  R$ {selectedOrder.totalPrice.toFixed(2)}
                </span>
              </div>
              {selectedOrder.paymentMethod && (
                <div className="flex justify-between items-center pt-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Forma de Pagamento:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedOrder.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
              {selectedOrder.status === "pending" && (
                <>
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20 flex gap-1 h-9 text-xs"
                  >
                    <XCircle className="size-4" />
                    Recusar
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, "preparing")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-1.5 h-9 text-xs"
                  >
                    <Play className="size-3.5 fill-current" />
                    Aceitar e Preparar
                  </Button>
                </>
              )}
              {selectedOrder.status === "preparing" && (
                <Button
                  onClick={() => handleStatusChange(selectedOrder.id, "ready")}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex gap-1.5 w-full h-10 font-bold text-sm"
                >
                  <CheckCircle2 className="size-4" />
                  Marcar como Pronto para Entrega
                </Button>
              )}
              {selectedOrder.status === "ready" && (
                selectedOrder.deliveryType === "delivery" ? (
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, "delivering")}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex gap-1.5 w-full h-10 font-bold text-sm"
                  >
                    <MapPin className="size-4" />
                    Saiu pra Entrega
                  </Button>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="space-y-1.5 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 text-left">
                      <label htmlFor="finalPaymentMethod" className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">Confirmar Forma de Pagamento</label>
                      <select
                        id="finalPaymentMethod"
                        value={finalizePaymentMethod}
                        onChange={(e) => setFinalizePaymentMethod(e.target.value)}
                        className="w-full h-8 mt-1 px-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-xs focus:outline-hidden"
                      >
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Pix">Pix</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => handleStatusChange(selectedOrder.id, "finished", finalizePaymentMethod)}
                      className="bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex gap-1.5 w-full h-10 font-bold text-sm"
                    >
                      <CheckCircle2 className="size-4" />
                      Finalizar Pedido e Registrar Pagamento
                    </Button>
                  </div>
                )
              )}
              {selectedOrder.status === "delivering" && (
                <div className="w-full space-y-3">
                  <div className="space-y-1.5 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 text-left">
                    <label htmlFor="finalPaymentMethod" className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">Pedido entregue — Registrar Pagamento</label>
                    <select
                      id="finalPaymentMethod"
                      value={finalizePaymentMethod}
                      onChange={(e) => setFinalizePaymentMethod(e.target.value)}
                      className="w-full h-8 mt-1 px-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-xs focus:outline-hidden"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Pix">Pix</option>
                    </select>
                  </div>
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, "finished", finalizePaymentMethod)}
                    className="bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex gap-1.5 w-full h-10 font-bold text-sm"
                  >
                    <CheckCircle2 className="size-4" />
                    Confirmar Entrega e Pagamento
                  </Button>
                </div>
              )}
              {(selectedOrder.status === "finished" || selectedOrder.status === "cancelled") && (
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  className="w-full h-9 text-xs"
                >
                  Fechar Detalhes
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPDVModal && (
        <OrderPDVModal
          onClose={() => setShowPDVModal(false)}
          onSubmit={async (orderInput) => {
            await createOrder(orderInput)
            try {
              const context = new (window.AudioContext || (window as any).webkitAudioContext)()
              const osc = context.createOscillator()
              const gain = context.createGain()
              osc.type = "sine"
              osc.frequency.setValueAtTime(659.25, context.currentTime) // E5
              osc.frequency.setValueAtTime(880.00, context.currentTime + 0.12) // A5
              gain.gain.setValueAtTime(0.2, context.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.35)
              osc.connect(gain)
              gain.connect(context.destination)
              osc.start()
              osc.stop(context.currentTime + 0.35)
            } catch {}
          }}
        />
      )}
    </div>
  )
}
