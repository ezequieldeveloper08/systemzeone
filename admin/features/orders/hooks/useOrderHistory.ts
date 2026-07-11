import { useState, useEffect, useCallback } from "react"
import { Order, OrderHistoryFilters } from "../types"
import { orderHistoryService } from "../services/orderHistoryService"

export function useOrderHistory(initialFilters: OrderHistoryFilters = {}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<OrderHistoryFilters>({
    page: 1,
    limit: 20,
    ...initialFilters
  })

  const fetchHistory = useCallback(async (currentFilters: OrderHistoryFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderHistoryService.getHistory(currentFilters)
      setOrders(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message || "Failed to load history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory(filters)
  }, [filters, fetchHistory])

  const updateFilters = (newFilters: Partial<OrderHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }))
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return {
    orders,
    total,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refresh: () => fetchHistory(filters)
  }
}
