"use client"

import React, { useState, useMemo } from "react"
import { Table } from "../types"
import { Order, OrderItem } from "@/features/orders/types"
import { useMenu } from "@/features/menu/hooks/useMenu"
import { MenuItem } from "@/features/menu/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  CheckCircle2,
  ChefHat,
  Users,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  ChevronRight,
  Check,
  Clock,
} from "lucide-react"

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  selectedOptions: { groupName: string; optionName: string; price: number }[]
  uniqueKey: string
}

interface CommandaModalProps {
  table: Table
  activeOrders: Order[]
  onClose: () => void
  onAddItems: (items: Omit<Order, "id" | "tenantId" | "createdAt" | "updatedAt">) => Promise<void>
  onCloseAccount: (paymentMethod: string) => Promise<void>
}

const PAYMENT_METHODS = [
  { value: "Dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "Cartão de Crédito", label: "Crédito", icon: CreditCard },
  { value: "Cartão de Débito", label: "Débito", icon: CreditCard },
  { value: "Pix", label: "Pix", icon: QrCode },
]

type Panel = "comanda" | "add-items" | "close-account"

const formatCurrencyBRL = (cents: number): string => {
  if (!cents) return "R$ 0,00"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents)
}

const parseCurrencyBRL = (formatted: string): number => {
  const clean = formatted.replace(/\D/g, "")
  return isNaN(parseFloat(clean)) ? 0 : parseFloat(clean) / 100
}

export function CommandaModal({ table, activeOrders, onClose, onAddItems, onCloseAccount }: CommandaModalProps) {
  const { menuItems } = useMenu()
  const [panel, setPanel] = useState<Panel>("comanda")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<any>(null)
  const [tempOptions, setTempOptions] = useState<{ [groupName: string]: any[] }>({})
  const [optionErrors, setOptionErrors] = useState<{ [groupName: string]: string }>({})
  const [paymentEntries, setPaymentEntries] = useState<{ method: string; amount: string; received: string }[]>([
    { method: "Dinheiro", amount: "", received: "" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Compute totals
  const commandaTotal = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0)
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const categories = useMemo(
    () => Array.from(new Set(menuItems.map((i) => i.category))),
    [menuItems]
  )

  const filteredItems = useMemo(
    () =>
      menuItems.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = activeCategory ? item.category === activeCategory : true
        return matchesSearch && matchesCategory && item.status === "published"
      }),
    [menuItems, searchTerm, activeCategory]
  )

  // Cart management
  const addToCartDirect = (item: MenuItem, selectedOptions: CartItem["selectedOptions"], variation?: any) => {
    const activeVar = variation || item.variations?.[0]
    const basePrice = activeVar ? activeVar.price : 0
    const optionsKey = selectedOptions.map((o) => `${o.groupName}:${o.optionName}`).sort().join("|")
    const uniqueKey = `${item.id}-${activeVar?.name || "Unico"}-${optionsKey}`
    const itemPrice = basePrice + selectedOptions.reduce((acc, opt) => acc + opt.price, 0)
    const displayName = `${item.name}${activeVar && activeVar.name !== "Único" ? ` (${activeVar.name})` : ""}`

    setCart((prev) => {
      const existing = prev.find((i) => i.uniqueKey === uniqueKey)
      if (existing) {
        return prev.map((i) => (i.uniqueKey === uniqueKey ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { menuItemId: item.id, name: displayName, price: itemPrice, quantity: 1, selectedOptions, uniqueKey }]
    })
  }

  const handleAddItemClick = (item: MenuItem) => {
    const hasChoices = item.choices && item.choices.length > 0
    const hasMultipleVariations = item.variations && item.variations.length > 1

    if (hasChoices || hasMultipleVariations) {
      setCustomizingItem(item)
      setSelectedVariation(item.variations?.[0] || null)
      const initial: typeof tempOptions = {}
      if (item.choices) {
        item.choices.forEach((g) => { initial[g.name] = [] })
      }
      setTempOptions(initial)
      setOptionErrors({})
    } else {
      addToCartDirect(item, [], item.variations?.[0] || null)
    }
  }

  const confirmCustomization = () => {
    if (!customizingItem) return
    const errors: typeof optionErrors = {}

    if (!selectedVariation && customizingItem.variations && customizingItem.variations.length > 0) {
      errors["variation"] = "Selecione uma variação/tamanho"
    }

    customizingItem.choices?.forEach((g) => {
      const isRequired = g.minChoices > 0
      const selectedCount = tempOptions[g.name]?.length || 0
      if (isRequired && selectedCount < g.minChoices) {
        errors[g.name] = `Selecione no mínimo ${g.minChoices} opção(ões) em "${g.name}"`
      }
    })

    if (Object.keys(errors).length > 0) { setOptionErrors(errors); return }

    const selectedOptions = Object.entries(tempOptions).flatMap(([groupName, opts]) =>
      opts.map((opt) => ({ groupName, optionName: opt.name, price: opt.variations?.[0]?.additionalPrice || 0 }))
    )
    addToCartDirect(customizingItem, selectedOptions, selectedVariation)
    setCustomizingItem(null)
    setSelectedVariation(null)
  }

  const adjustQty = (uniqueKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.uniqueKey === uniqueKey ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)
    try {
      await onAddItems({
        customerName: `Mesa ${table.number}`,
        customerPhone: "",
        deliveryType: "table",
        address: null,
        tableNumber: table.number,
        totalPrice: cartTotal,
        status: "pending",
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
        paymentMethod: null,
      })
      setCart([])
      setPanel("comanda")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseAccount = async () => {
    // For each entry: if method is Dinheiro and received is set, use received as the "paid" amount
    // The actual charge to dinheiro is the amount field
    const totalCharged = paymentEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    if (totalCharged < commandaTotal - 0.01) return // guard
    // Build summary
    const parts = paymentEntries
      .filter((e) => parseFloat(e.amount) > 0)
      .map((e) => {
        const amt = parseFloat(e.amount)
        const rcv = parseFloat(e.received)
        if (e.method === "Dinheiro" && rcv > amt + 0.01) {
          return `Dinheiro: R$${amt.toFixed(2)} (recebido R$${rcv.toFixed(2)}, troco R$${(rcv - amt).toFixed(2)})`
        }
        return `${e.method}: R$${amt.toFixed(2)}`
      })
    setIsSubmitting(true)
    try {
      await onCloseAccount(parts.join(" | "))
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusLabel = (status: Order["status"]) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: "Aguardando", color: "text-red-500" },
      preparing: { label: "Na Cozinha", color: "text-orange-500" },
      ready: { label: "Pronto", color: "text-blue-500" },
      delivering: { label: "Em rota", color: "text-purple-500" },
      finished: { label: "Entregue", color: "text-emerald-500" },
    }
    return map[status] || { label: status, color: "text-neutral-500" }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          <X className="size-5 text-neutral-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Mesa {table.number}
            {table.label && <span className="ml-2 text-sm font-normal text-neutral-400">• {table.label}</span>}
          </h1>
          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
            <Users className="size-3" /> Capacidade: {table.capacity} pessoas
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1">
          {(["comanda", "add-items"] as Panel[]).map((p) => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                panel === p
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {p === "comanda" ? "Comanda" : "Adicionar Itens"}
            </button>
          ))}
        </div>

        {/* Total + close account */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-neutral-400">Total da Mesa</p>
            <p className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
              R$ {commandaTotal.toFixed(2)}
            </p>
          </div>
          {activeOrders.length > 0 && (
            <Button
              onClick={() => setPanel("close-account")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 flex items-center gap-2"
            >
              <Receipt className="size-4" />
              Fechar Conta
            </Button>
          )}
        </div>
      </div>

      {/* ─── PANEL: COMANDA ─── */}
      {panel === "comanda" && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
              <div className="size-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <Receipt className="size-8 text-neutral-300" />
              </div>
              <div>
                <p className="text-base font-semibold text-neutral-600 dark:text-neutral-400">Comanda vazia</p>
                <p className="text-sm text-neutral-400 mt-1">Adicione itens para iniciar a comanda desta mesa</p>
              </div>
              <Button
                onClick={() => setPanel("add-items")}
                className="bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 flex gap-2"
              >
                <Plus className="size-4" />
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-neutral-400" />
                      <span className="text-xs text-neutral-500">
                        {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className={`text-xs font-bold uppercase ${statusLabel(order.status).color}`}>
                      {statusLabel(order.status).label}
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {order.items.map((item: OrderItem, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 mr-2">{item.quantity}×</span>
                            {item.name}
                          </p>
                          {item.selectedOptions?.length > 0 && (
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {item.selectedOptions.map((o) => o.optionName).join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                    <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                      R$ {order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-200 dark:border-neutral-700">
                <span className="text-base font-bold text-neutral-600 dark:text-neutral-400">Total</span>
                <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  R$ {commandaTotal.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={() => setPanel("add-items")}
                variant="outline"
                className="w-full flex gap-2 h-10"
              >
                <Plus className="size-4" />
                Adicionar Mais Itens
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── PANEL: ADD ITEMS ─── */}
      {panel === "add-items" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: menu */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 dark:border-neutral-800">
            {/* Search + categories */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                <Input
                  placeholder="Buscar item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    !activeCategory
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Items grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddItemClick(item)}
                  className="flex flex-col items-start p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 hover:shadow-sm transition-all text-left group"
                >
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{item.description}</p>
                  <div className="flex items-center justify-between w-full mt-2">
                    <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                      R$ {(item.variations?.[0]?.price || 0).toFixed(2)}
                    </span>
                    <span className="size-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950 transition-colors">
                      <Plus className="size-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: cart */}
          <div className="w-80 flex flex-col bg-white dark:bg-neutral-950">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Itens a enviar
                {cart.length > 0 && (
                  <span className="ml-auto text-xs bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-full px-2 py-0.5 font-bold">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 italic">Nenhum item selecionado</div>
              ) : (
                cart.map((item) => (
                  <div key={item.uniqueKey} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.name}</p>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-[10px] text-neutral-400 truncate">
                          {item.selectedOptions.map((o) => o.optionName).join(", ")}
                        </p>
                      )}
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => adjustQty(item.uniqueKey, -1)}
                        className="size-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => adjustQty(item.uniqueKey, 1)}
                        className="size-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase">Subtotal</span>
                <span className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleSendToKitchen}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full h-11 font-bold bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex gap-2"
              >
                <ChefHat className="size-4" />
                {isSubmitting ? "Enviando..." : "Enviar para Cozinha"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PANEL: CLOSE ACCOUNT ─── */}
      {panel === "close-account" && (
        <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-6">
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
                <Receipt className="size-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">Fechar Conta</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Mesa {table.number}</p>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Pedidos</span>
                <span>{activeOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Itens</span>
                <span>{activeOrders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0), 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 font-extrabold text-lg text-neutral-900 dark:text-neutral-100">
                <span>Total a pagar</span>
                <span>R$ {commandaTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Multi-payment entries */}
            {(() => {
              const totalCharged = paymentEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
              const remaining = commandaTotal - totalCharged
              // Total troco: for dinheiro entries, troco = received - amount; for others no troco
              const totalTroco = paymentEntries.reduce((s, e) => {
                if (e.method === "Dinheiro") {
                  const rcv = parseFloat(e.received) || 0
                  const amt = parseFloat(e.amount) || 0
                  return s + Math.max(0, rcv - amt)
                }
                return s
              }, 0)
              const canConfirm = totalCharged >= commandaTotal - 0.01

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase text-neutral-500">Formas de Pagamento</p>
                    <button
                      onClick={() =>
                        setPaymentEntries((prev) => [...prev, { method: "Dinheiro", amount: "", received: "" }])
                      }
                      className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Plus className="size-3.5" />
                      Adicionar forma
                    </button>
                  </div>

                  <div className="space-y-2">
                    {paymentEntries.map((entry, idx) => {
                      const amt = parseFloat(entry.amount) || 0
                      const rcv = parseFloat(entry.received) || 0
                      const lineTroco = entry.method === "Dinheiro" && rcv > amt + 0.01 ? rcv - amt : 0

                      return (
                        <div key={idx} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2 bg-white dark:bg-neutral-950">
                          {/* Method + amount row */}
                          <div className="flex items-center gap-2">
                            <select
                              value={entry.method}
                              onChange={(e) =>
                                setPaymentEntries((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, method: e.target.value, received: "" } : p))
                                )
                              }
                              className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
                            >
                              {PAYMENT_METHODS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                            </select>
                            <div className="relative w-36">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="R$ 0,00"
                                value={parseFloat(String(entry.amount)) > 0 ? formatCurrencyBRL(parseFloat(String(entry.amount))) : ""}
                                onChange={(e) => {
                                  const val = parseCurrencyBRL(e.target.value)
                                  setPaymentEntries((prev) =>
                                    prev.map((p, i) => (i === idx ? { ...p, amount: String(val) } : p))
                                  )
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                              />
                            </div>
                            {paymentEntries.length > 1 && (
                              <button
                                onClick={() =>
                                  setPaymentEntries((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>

                          {/* Dinheiro: extra row for valor recebido + troco */}
                          {entry.method === "Dinheiro" && (
                            <div className="flex items-center gap-2 pl-1">
                              <span className="text-xs text-neutral-400 w-28 shrink-0">Valor recebido:</span>
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="R$ 0,00"
                                  value={parseFloat(String(entry.received)) > 0 ? formatCurrencyBRL(parseFloat(String(entry.received))) : ""}
                                  onChange={(e) => {
                                    const val = parseCurrencyBRL(e.target.value)
                                    setPaymentEntries((prev) =>
                                      prev.map((p, i) => (i === idx ? { ...p, received: String(val) } : p))
                                    )
                                  }}
                                  className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                              </div>
                              {lineTroco > 0.01 && (
                                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 shrink-0">
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Troco</span>
                                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">R$ {lineTroco.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Running totals */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 space-y-1.5 bg-neutral-50 dark:bg-neutral-950 text-sm">
                    <div className="flex justify-between text-neutral-500">
                      <span>Total cobrado</span>
                      <span className="font-semibold">R$ {totalCharged.toFixed(2)}</span>
                    </div>
                    {remaining > 0.01 && (
                      <div className="flex justify-between text-red-600 dark:text-red-400 font-bold">
                        <span>Faltam</span>
                        <span>R$ {remaining.toFixed(2)}</span>
                      </div>
                    )}
                    {totalTroco > 0.01 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Troco total</span>
                        <span>R$ {totalTroco.toFixed(2)}</span>
                      </div>
                    )}
                    {canConfirm && totalTroco <= 0.01 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>✓ Pagamento completo</span>
                        <span>R$ {totalCharged.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      onClick={handleCloseAccount}
                      disabled={isSubmitting || !canConfirm}
                      className="w-full h-12 font-extrabold text-base bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-5" />
                      {isSubmitting ? "Finalizando..." : "Confirmar e Fechar Conta"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPanel("comanda")}
                      className="w-full h-10"
                    >
                      Voltar
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* ─── OPTIONS POP-UP ─── */}
      {customizingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">{customizingItem.name}</p>
                <p className="text-xs text-neutral-400">Escolha as opções</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                <X className="size-4 text-neutral-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-5 max-h-96 overflow-y-auto">
              {/* Variations selection */}
              {customizingItem.variations && customizingItem.variations.length > 1 && (
                <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs font-bold uppercase text-neutral-500 mb-2">
                    Tamanho / Opção <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.variations.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariation(v)}
                        className={`px-3 py-2 rounded-lg border transition-all text-xs text-left ${
                          selectedVariation?.id === v.id
                            ? "border-neutral-950 bg-neutral-50 dark:border-white dark:bg-neutral-900 font-semibold"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                        }`}
                      >
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-[10px] text-neutral-400">R$ {v.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {customizingItem.choices?.map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-bold uppercase text-neutral-500 mb-2">
                    {group.name}
                    {group.minChoices > 0 && <span className="ml-1 text-red-500">*</span>}
                    {group.maxChoices > 1 && (
                      <span className="ml-1 text-neutral-400 normal-case font-normal">
                        (máx. {group.maxChoices})
                      </span>
                    )}
                  </p>
                  <div className="space-y-1.5">
                    {group.choiceItems?.map((ci) => {
                      const isSelected = tempOptions[group.name]?.some((o) => o.name === ci.name)
                      const itemPrice = ci.variations?.[0]?.additionalPrice || 0
                      return (
                        <button
                          key={ci.id}
                          type="button"
                          onClick={() => {
                            setTempOptions((prev) => {
                              const current = prev[group.name] || []
                              if (isSelected) return { ...prev, [group.name]: current.filter((o) => o.name !== ci.name) }
                              if (group.maxChoices === 1) return { ...prev, [group.name]: [ci] }
                              if (current.length >= group.maxChoices) return prev
                              return { ...prev, [group.name]: [...current, ci] }
                            })
                            setOptionErrors((prev) => ({ ...prev, [group.name]: "" }))
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm ${
                            isSelected
                              ? "border-neutral-950 bg-neutral-50 dark:border-white dark:bg-neutral-900"
                              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                          }`}
                        >
                          <span className={isSelected ? "font-semibold" : ""}>{ci.name}</span>
                          <span className="text-xs font-bold text-neutral-500">
                            {itemPrice > 0 ? `+R$ ${itemPrice.toFixed(2)}` : "Incluído"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {optionErrors[group.name] && (
                    <p className="text-xs text-red-500 mt-1">{optionErrors[group.name]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button
                onClick={confirmCustomization}
                className="w-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
              >
                <Check className="size-4 mr-2" />
                Adicionar ao Pedido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
