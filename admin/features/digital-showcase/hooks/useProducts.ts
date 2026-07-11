import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Product, CreateProductInput } from "../types"
import { digitalShowcaseService } from "../services/digitalShowcaseService"

export function useProducts() {
  const { activeTenant } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const loadProducts = useCallback(async () => {
    if (!activeTenant) return
    setLoading(true)
    setError(null)
    try {
      const data = await digitalShowcaseService.getAllProducts(activeTenant.id)
      setProducts(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar produtos.")
    } finally {
      setLoading(false)
    }
  }, [activeTenant])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const createProduct = async (input: CreateProductInput) => {
    if (!activeTenant) return
    try {
      const newProduct = await digitalShowcaseService.createProduct(activeTenant.id, input)
      setProducts((prev) => [newProduct, ...prev])
      return newProduct;
    } catch (err: any) {
      throw new Error(err.message || "Erro ao cadastrar produto.")
    }
  }

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return {
    products: filteredProducts,
    loading,
    error,
    search,
    setSearch,
    createProduct,
    reload: loadProducts,
  }
}
