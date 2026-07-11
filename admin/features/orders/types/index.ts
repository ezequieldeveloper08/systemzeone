export interface OrderOptionSelection {
  groupName: string
  optionName: string
  price: number
}

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  selectedOptions: OrderOptionSelection[]
}

export interface Order {
  id: string
  tenantId: string
  customerName: string
  customerPhone: string
  deliveryType: "delivery" | "takeaway" | "table"
  address: string | null
  tableNumber: string | null
  totalPrice: number
  status: "pending" | "preparing" | "ready" | "delivering" | "finished" | "cancelled"
  items: OrderItem[]
  paymentMethod: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderHistoryFilters {
  status?: string
  deliveryType?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface OrderHistoryResponse {
  items: Order[]
  total: number
}
