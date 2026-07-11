"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { tableService } from "../services/tableService"
import { Table, CreateTableInput, UpdateTableInput } from "../types"

export function useTables() {
  const { activeTenant } = useAuth()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTables = useCallback(async () => {
    if (!activeTenant) return
    setLoading(true)
    setError(null)
    try {
      const data = await tableService.getAllTables()
      setTables(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar mesas.")
    } finally {
      setLoading(false)
    }
  }, [activeTenant])

  useEffect(() => {
    loadTables()
  }, [loadTables])

  const createTable = async (input: CreateTableInput) => {
    if (!activeTenant) return
    try {
      const newTable = await tableService.createTable(input)
      setTables((prev) => [...prev, newTable])
      return newTable
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateTable = async (id: string, input: UpdateTableInput) => {
    if (!activeTenant) return
    try {
      const updated = await tableService.updateTable(id, input)
      setTables((prev) => prev.map((t) => (t.id === id ? updated : t)))
      return updated
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteTable = async (id: string) => {
    if (!activeTenant) return
    try {
      await tableService.deleteTable(id)
      setTables((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    reload: loadTables,
  }
}
