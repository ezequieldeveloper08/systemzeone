import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Property, CreatePropertyInput } from "../types"
import { realEstateService } from "../services/realEstateService"

export function useProperties() {
  const { activeTenant } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const loadProperties = useCallback(async () => {
    if (!activeTenant) return
    setLoading(true)
    setError(null)
    try {
      const data = await realEstateService.getAllProperties(activeTenant.id)
      setProperties(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar imóveis.")
    } finally {
      setLoading(false)
    }
  }, [activeTenant])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const createProperty = async (input: CreatePropertyInput) => {
    if (!activeTenant) return
    try {
      const newProperty = await realEstateService.createProperty(activeTenant.id, input)
      setProperties((prev) => [newProperty, ...prev])
      return newProperty;
    } catch (err: any) {
      throw new Error(err.message || "Erro ao cadastrar imóvel.")
    }
  }

  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return {
    properties: filteredProperties,
    loading,
    error,
    search,
    setSearch,
    createProperty,
    reload: loadProperties,
  }
}
