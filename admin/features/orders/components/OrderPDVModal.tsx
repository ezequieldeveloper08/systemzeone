"use client"

import React, { useState, useEffect } from "react"
import { useMenu } from "../../menu/hooks/useMenu"
import { useTables } from "../../tables/hooks/useTables"
import { MenuItem, MenuItemVariation, Choice, ChoiceItem, ChoiceItemVariation } from "../../menu/types"
import { OrderItem, Order } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  ShoppingBag,
  MapPin,
  Check,
  ChevronRight,
  ShoppingCart,
  ChefHat
} from "lucide-react"

interface OrderPDVModalProps {
  onClose: () => void
  onSubmit: (orderInput: Omit<Order, "id" | "tenantId" | "createdAt" | "updatedAt">) => Promise<void>
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  selectedOptions: {
    groupName: string
    optionName: string
    price: number
  }[]
  uniqueKey: string // distinguishes same item with different options
}

export function OrderPDVModal({ onClose, onSubmit }: OrderPDVModalProps) {
  const { menuItems, loading: menuLoading } = useMenu()
  const { tables } = useTables()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([])

  // Customer State
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryType, setDeliveryType] = useState<Order["deliveryType"]>("table")
  const [address, setAddress] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("Dinheiro")

  // Form Submitting
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Options Pop-up State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<any>(null)
  const [tempOptions, setTempOptions] = useState<{ [groupName: string]: any[] }>({})
  const [optionErrors, setOptionErrors] = useState<{ [groupName: string]: string }>({})

  // Unique category list
  const categories = Array.from(new Set(menuItems.map((item) => item.category)))

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory ? item.category === activeCategory : true
    return matchesSearch && matchesCategory && item.status === "published"
  })

  // Handle adding a menu item
  const handleAddItemClick = (item: MenuItem) => {
    const hasChoices = item.choices && item.choices.length > 0
    const hasMultipleVariations = item.variations && item.variations.length > 1

    if (hasChoices || hasMultipleVariations) {
      // Open customization modal
      setCustomizingItem(item)
      setSelectedVariation(item.variations?.[0] || null)
      // Reset temp selections
      const initialTemp: typeof tempOptions = {}
      if (item.choices) {
        item.choices.forEach((g) => {
          initialTemp[g.name] = []
        })
      }
      setTempOptions(initialTemp)
      setOptionErrors({})
    } else {
      // Direct add to cart
      addToCartDirect(item, [], item.variations?.[0] || null)
    }
  }

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
      } else {
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: displayName,
            price: itemPrice,
            quantity: 1,
            selectedOptions,
            uniqueKey,
          },
        ]
      }
    })
  }

  // Handle option checkbox/radio change
  const handleOptionSelect = (group: Choice, option: ChoiceItem, isRadio: boolean) => {
    setTempOptions((prev) => {
      const currentSelections = prev[group.name] || []
      let newSelections: any[] = []

      if (isRadio) {
        newSelections = [option]
      } else {
        const index = currentSelections.findIndex((o) => o.name === option.name)
        if (index > -1) {
          newSelections = currentSelections.filter((o) => o.name !== option.name)
        } else {
          // Check max limit
          if (currentSelections.length < group.maxChoices) {
            newSelections = [...currentSelections, option]
          } else {
            newSelections = [...currentSelections.slice(1), option]
          }
        }
      }

      // Clear error for this group if it's now valid
      if (newSelections.length >= group.minChoices) {
        setOptionErrors((errs) => {
          const { [group.name]: _, ...rest } = errs
          return rest
        })
      }

      return {
        ...prev,
        [group.name]: newSelections,
      }
    })
  }

  // Confirm custom choices
  const handleConfirmCustomization = () => {
    if (!customizingItem) return

    // Validate selections
    const errors: typeof optionErrors = {}

    if (!selectedVariation && customizingItem.variations && customizingItem.variations.length > 0) {
      errors["variation"] = "Selecione uma variação/tamanho"
    }

    customizingItem.choices?.forEach((g) => {
      const selections = tempOptions[g.name] || []
      if (g.minChoices > 0 && selections.length < g.minChoices) {
        errors[g.name] = `Selecione no mínimo ${g.minChoices} opção(ões).`
      }
    })

    if (Object.keys(errors).length > 0) {
      setOptionErrors(errors)
      return
    }

    // Map tempOptions to cart format
    const selectedOptionsList: CartItem["selectedOptions"] = []
    Object.entries(tempOptions).forEach(([groupName, options]) => {
      options.forEach((opt) => {
        selectedOptionsList.push({
          groupName,
          optionName: opt.name,
          price: opt.variations?.[0]?.additionalPrice || 0,
        })
      })
    })

    addToCartDirect(customizingItem, selectedOptionsList, selectedVariation)
    setCustomizingItem(null)
    setSelectedVariation(null)
  }

  // Cart actions
  const handleIncrement = (uniqueKey: string) => {
    setCart((prev) => prev.map((i) => (i.uniqueKey === uniqueKey ? { ...i, quantity: i.quantity + 1 } : i)))
  }

  const handleDecrement = (uniqueKey: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.uniqueKey === uniqueKey)
      if (!item) return prev
      if (item.quantity === 1) {
        return prev.filter((i) => i.uniqueKey !== uniqueKey)
      } else {
        return prev.map((i) => (i.uniqueKey === uniqueKey ? { ...i, quantity: i.quantity - 1 } : i))
      }
    })
  }

  const handleRemove = (uniqueKey: string) => {
    setCart((prev) => prev.filter((i) => i.uniqueKey !== uniqueKey))
  }

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = deliveryType === "delivery" ? 7.0 : 0.0
  const total = subtotal + deliveryFee

  // Submit Order
  const handleFinalizeOrder = async () => {
    if (cart.length === 0) return
    if (!customerName.trim()) {
      alert("Por favor, insira o nome do cliente.")
      return
    }

    setIsSubmitting(true)
    try {
      // Map CartItems back to OrderItems
      const mappedItems: OrderItem[] = cart.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        selectedOptions: i.selectedOptions,
      }))

      const payload = {
        customerName,
        customerPhone: customerPhone || "Não informado",
        deliveryType,
        address: deliveryType === "delivery" ? address : null,
        tableNumber: deliveryType === "table" ? tableNumber : null,
        totalPrice: Number(total.toFixed(2)),
        items: mappedItems,
        status: "pending" as const,
        paymentMethod: deliveryType === "table" ? null : paymentMethod,
      }

      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      alert(err.message || "Erro ao salvar pedido no PDV.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 flex flex-col overflow-hidden animate-in fade-in duration-100">
      <div className="w-screen h-screen bg-white dark:bg-neutral-950 flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 p-4 shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat className="size-6 text-neutral-600 dark:text-neutral-300" />
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Lançar Pedido - PDV</h2>
              <p className="text-xs text-neutral-400">Monte o pedido escolhendo os pratos e adicionais para o cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* MAIN PDV LAYOUT */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* LEFT PANEL: PRODUCTS SELECTION */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20">
            {/* Search & Categories scroll */}
            <div className="space-y-4 shrink-0">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
                <Input
                  placeholder="Pesquisar prato, bebida ou ingrediente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Categories Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                    activeCategory === null
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                      : "bg-white text-neutral-600 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors uppercase ${
                      activeCategory === cat
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                        : "bg-white text-neutral-600 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              {menuLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="size-6 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-sm text-neutral-400 italic">Nenhum item disponível no cardápio.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddItemClick(item)}
                      className="group p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:shadow-xs transition-all cursor-pointer flex gap-3 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
                    >
                      <div className="size-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80"}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-neutral-400 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-50">
                            R$ {(item.variations?.[0]?.price || 0).toFixed(2)}
                          </span>
                          {item.choices && item.choices.length > 0 && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1 py-0.2 rounded-sm dark:bg-orange-950/20 dark:text-orange-400">
                              Opcionais
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: CART & CUSTOMER DETAILS */}
          <div className="w-96 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden bg-white dark:bg-neutral-950 shrink-0">
            {/* Header label */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/20 shrink-0">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="size-4" />
                Carrinho
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[10px] text-red-500 hover:text-red-600 font-bold"
                >
                  Esvaziar
                </button>
              )}
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 border-b border-neutral-200 dark:border-neutral-800">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 space-y-2 py-12">
                  <ShoppingCart className="size-8 text-neutral-300" />
                  <p className="text-xs">Carrinho vazio</p>
                  <p className="text-[10px]">Clique nos pratos do cardápio para adicionar.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.uniqueKey} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/40 dark:border-neutral-800/40 dark:bg-neutral-900/10 space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{item.name}</p>
                        {item.selectedOptions.length > 0 && (
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {item.selectedOptions.map((o) => o.optionName).join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50 shrink-0">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleRemove(item.uniqueKey)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrement(item.uniqueKey)}
                          className="size-5 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:bg-neutral-50"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.uniqueKey)}
                          className="size-5 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:bg-neutral-50"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CUSTOMER DETAILS FORM */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3 shrink-0">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Cliente & Entrega</p>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nome do Cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 text-xs col-span-2"
                  required
                />
                <Input
                  placeholder="Telefone (Opcional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8 text-xs col-span-2"
                />
              </div>

              {/* Delivery Type selector */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => setDeliveryType("table")}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    deliveryType === "table"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                      : "bg-white text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
                  }`}
                >
                  <Utensils className="size-3.5" />
                  Mesa
                </button>
                <button
                  onClick={() => setDeliveryType("takeaway")}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    deliveryType === "takeaway"
                      ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900"
                      : "bg-white text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
                  }`}
                >
                  <ShoppingBag className="size-3.5" />
                  Retirada
                </button>
                <button
                  onClick={() => setDeliveryType("delivery")}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    deliveryType === "delivery"
                      ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                      : "bg-white text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
                  }`}
                >
                  <MapPin className="size-3.5" />
                  Entrega
                </button>
              </div>

              {/* Dynamic Sub-inputs based on Delivery type */}
              {deliveryType === "table" && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-75">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase">Selecionar Mesa</Label>
                  {tables.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">Nenhuma mesa cadastrada</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto">
                      {tables.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTableNumber(t.number)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border-2 text-xs font-bold transition-all ${
                            tableNumber === t.number
                              ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                          }`}
                        >
                          <span className="text-sm font-extrabold leading-none">{t.number}</span>
                          {t.label && <span className="text-[8px] font-normal opacity-70 truncate w-full text-center">{t.label}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {deliveryType === "delivery" && (
                <Input
                  type="text"
                  placeholder="Endereço de entrega completo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-8 text-xs animate-in slide-in-from-top-1 duration-75"
                />
              )}
              {deliveryType !== "table" && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-75">
                  <Label htmlFor="pdvPaymentMethod" className="text-[10px] font-bold text-neutral-400 uppercase">Forma de Pagamento</Label>
                  <select
                    id="pdvPaymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-xs focus:outline-hidden"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Pix">Pix</option>
                  </select>
                </div>
              )}
            </div>

            {/* TOTALS & SUBMIT ACTION */}
            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">R$ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryType === "delivery" && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Taxa de entrega:</span>
                    <span className="font-semibold">R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-1.5 border-t border-neutral-200 dark:border-neutral-800">
                  <span>Total Geral:</span>
                  <span className="text-base font-extrabold text-neutral-950 dark:text-neutral-50">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleFinalizeOrder}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full h-10 font-bold bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs flex gap-1.5"
              >
                {isSubmitting ? "Enviando..." : "Confirmar e Enviar Pedido"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* CUSTOMIZATION POPUP MODAL (iFOOD STYLE) */}
        {customizingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
            <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 animate-in zoom-in-95 duration-150 relative max-h-[80vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1"
              >
                <X className="size-5" />
              </button>

              {/* Customization Header */}
              <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex gap-4 items-center shrink-0">
                <div className="size-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customizingItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80"}
                    alt={customizingItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">{customizingItem.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{customizingItem.description}</p>
                </div>
              </div>

              {/* Choice Groups List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-5 my-1 pr-1 min-h-0">
                {/* Variations Selection */}
                {customizingItem.variations && customizingItem.variations.length > 1 && (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/30 dark:border-neutral-800 dark:bg-neutral-900/10">
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Tamanho / Opção *</p>
                    <div className="grid grid-cols-2 gap-2">
                      {customizingItem.variations.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                            selectedVariation?.id === v.id
                              ? "border-neutral-900 bg-neutral-950/5 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-900 dark:text-white"
                              : "border-neutral-200 bg-white hover:bg-neutral-50/50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50"
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className="font-bold">R$ {v.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customizingItem.choices?.map((group) => {
                  const isRadio = group.maxChoices === 1 && group.minChoices === 1
                  const selectedCount = (tempOptions[group.name] || []).length
                  const hasError = !!optionErrors[group.name]

                  return (
                    <div
                      key={group.id}
                      className={`p-4 rounded-xl border transition-all ${
                        hasError
                          ? "border-red-300 bg-red-50/20 dark:border-red-900/40"
                          : "border-neutral-200 bg-neutral-50/30 dark:border-neutral-800 dark:bg-neutral-900/10"
                      }`}
                    >
                      {/* Group title & requirements */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{group.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {isRadio
                              ? "Escolha 1 opção (Obrigatório)"
                              : `Escolha de ${group.minChoices} a ${group.maxChoices} opções`}
                          </p>
                        </div>
                        {group.minChoices > 0 && (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-sm dark:bg-red-950/35 dark:text-red-400">
                            Obrigatório
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="mt-3 space-y-2">
                        {group.choiceItems?.map((ci) => {
                          const isSelected = (tempOptions[group.name] || []).some((o) => o.name === ci.name)
                          const itemPrice = ci.variations?.[0]?.additionalPrice || 0

                          return (
                            <div
                              key={ci.id}
                              onClick={() => handleOptionSelect(group, ci, isRadio)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? "border-neutral-900 bg-neutral-950/5 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-900 dark:text-white"
                                  : "border-neutral-200 bg-white hover:bg-neutral-50/50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`size-4 rounded-sm border flex items-center justify-center shrink-0 ${
                                  isSelected ? "bg-neutral-950 border-neutral-950 text-white dark:bg-white dark:border-white dark:text-neutral-950" : "border-neutral-300 dark:border-neutral-700"
                                }`}>
                                  {isSelected && <Check className="size-3" />}
                                </span>
                                <span>{ci.name}</span>
                              </div>
                              {itemPrice > 0 && (
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">+ R$ {itemPrice.toFixed(2)}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Error message */}
                      {hasError && (
                        <p className="text-[10px] text-red-500 font-bold mt-2 animate-in slide-in-from-top-1 duration-75">
                          {optionErrors[group.name]}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Customization Footer */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center shrink-0">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total item: <strong className="text-sm font-extrabold text-neutral-950 dark:text-neutral-50">
                    R$ {(
                      (selectedVariation?.price || customizingItem.variations?.[0]?.price || 0) +
                      Object.values(tempOptions)
                        .flat()
                        .reduce((acc, o) => acc + (o.variations?.[0]?.additionalPrice || 0), 0)
                    ).toFixed(2)}
                  </strong>
                </div>
                <Button
                  onClick={handleConfirmCustomization}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs h-9"
                >
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
