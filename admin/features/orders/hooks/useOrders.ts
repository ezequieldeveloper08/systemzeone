import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Order } from "../types"
import { orderService } from "../services/orderService"

export function useOrders() {
  const { activeTenant } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    if (!activeTenant) return
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getAllOrders(activeTenant.id)
      setOrders(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar pedidos.")
    } finally {
      setLoading(false)
    }
  }, [activeTenant])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateOrderStatus = async (id: string, status: Order["status"], paymentMethod?: string | null) => {
    if (!activeTenant) return
    try {
      const updated = await orderService.updateOrderStatus(activeTenant.id, id, status, paymentMethod)
      setOrders((prev) => prev.map((order) => (order.id === id ? updated : order)))
      return updated
    } catch (err: any) {
      throw new Error(err.message || "Erro ao atualizar status do pedido.")
    }
  }

  const createOrder = async (input: Omit<Order, "id" | "tenantId" | "createdAt" | "updatedAt">) => {
    if (!activeTenant) return
    try {
      const newOrder = await orderService.createOrder(activeTenant.id, input)
      setOrders((prev) => [newOrder, ...prev])
      return newOrder
    } catch (err: any) {
      throw new Error(err.message || "Erro ao criar pedido.")
    }
  }

  // Simulate an incoming order for demo/testing
  const simulateIncomingOrder = async () => {
    if (!activeTenant) return
    const demoNames = ["Ezequiel Pires", "Alice Silva", "Bruno Sousa", "Mariana Costa"]
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)]
    const randomPhone = `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}`

    const demoItems = [
      {
        menuItemId: "demo-item-1",
        name: "Gran Burger Cheddar Bacon",
        price: 42.0,
        quantity: 1,
        selectedOptions: [
          { groupName: "Ponto da carne", optionName: "Ao ponto para bem", price: 0 },
          { groupName: "Adicionais", optionName: "Cebola Caramelizada", price: 3.5 },
        ],
      },
      {
        menuItemId: "demo-item-2",
        name: "Batata Frita Rústica",
        price: 18.0,
        quantity: 1,
        selectedOptions: [
          { groupName: "Molho extra", optionName: "Maionese de Alho", price: 2.0 },
        ],
      },
      {
        menuItemId: "demo-item-3",
        name: "Coca-Cola Zero 350ml",
        price: 6.0,
        quantity: 2,
        selectedOptions: [],
      },
    ]

    // Choose 1 or 2 items randomly
    const selectedItems = demoItems.filter(() => Math.random() > 0.4)
    if (selectedItems.length === 0) selectedItems.push(demoItems[0])

    const total = selectedItems.reduce((acc, item) => {
      const optionsPrice = item.selectedOptions.reduce((oAcc, opt) => oAcc + opt.price, 0)
      return acc + (item.price + optionsPrice) * item.quantity
    }, 0)

    const deliveryTypes: Order["deliveryType"][] = ["delivery", "table", "takeaway"]
    const delivery = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)]

    const newOrderInput = {
      customerName: randomName,
      customerPhone: randomPhone,
      deliveryType: delivery,
      address: delivery === "delivery" ? "Av. Paulista, 1000 - Bela Vista, São Paulo" : null,
      tableNumber: delivery === "table" ? String(Math.floor(Math.random() * 15) + 1) : null,
      totalPrice: Number(total.toFixed(2)),
      status: "pending" as const,
      items: selectedItems,
      paymentMethod: delivery === "delivery" ? "Cartão de Crédito" : null,
    }

    try {
      const created = await orderService.createOrder(activeTenant.id, newOrderInput)
      setOrders((prev) => [created, ...prev])
      return created
    } catch (err: any) {
      console.error("Failed to simulate order:", err)
    }
  }

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    simulateIncomingOrder,
    reload: loadOrders,
  }
}
