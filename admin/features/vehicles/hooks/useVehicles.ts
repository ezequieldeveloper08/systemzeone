"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Vehicle, CreateVehicleInput } from "../types"
import { vehicleService } from "../services/vehicleService"

export function useVehicles() {
  const { activeTenant } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "hidden">("all")
  const [sortBy, setSortBy] = useState<"title" | "price-asc" | "price-desc" | "newest">("newest")

  const loadVehicles = useCallback(async () => {
    if (!activeTenant) return
    setLoading(true)
    try {
      const data = await vehicleService.getAllVehicles(activeTenant.id)
      setVehicles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar veículos.")
    } finally {
      setLoading(false)
    }
  }, [activeTenant])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const createVehicle = async (input: CreateVehicleInput) => {
    if (!activeTenant) throw new Error("Sem concessionária ativa.")
    setLoading(true)
    try {
      const newVehicle = await vehicleService.createVehicle(activeTenant.id, input)
      setVehicles((prev) => [...prev, newVehicle])
      return newVehicle
    } finally {
      setLoading(false)
    }
  }

  const updateVehicle = async (id: string, input: Partial<CreateVehicleInput>) => {
    if (!activeTenant) throw new Error("Sem concessionária ativa.")
    setLoading(true)
    try {
      const updated = await vehicleService.updateVehicle(activeTenant.id, id, input)
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)))
      return updated
    } finally {
      setLoading(false)
    }
  }

  const deleteVehicle = async (id: string) => {
    if (!activeTenant) throw new Error("Sem concessionária ativa.")
    setLoading(true)
    try {
      await vehicleService.deleteVehicle(activeTenant.id, id)
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } finally {
      setLoading(false)
    }
  }

  const uploadVehicleImage = async (file: File): Promise<string> => {
    if (!activeTenant) throw new Error("Sem concessionária ativa.")
    setLoading(true)
    try {
      return await vehicleService.uploadImage(activeTenant.id, file)
    } finally {
      setLoading(false)
    }
  }

  // Filtered & sorted vehicles
  const filteredVehicles = vehicles
    .filter((v) => {
      const matchesSearch =
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.brand.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || v.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === "price-asc") {
        return a.price - b.price
      }
      if (sortBy === "price-desc") {
        return b.price - a.price
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return {
    vehicles: filteredVehicles,
    totalCount: vehicles.length,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    uploadVehicleImage,
    refresh: loadVehicles,
  }
}
