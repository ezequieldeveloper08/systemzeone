"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { MenuItem, CreateMenuItemInput, MenuGroup } from "../types"
import { menuService } from "../services/menuService"

export function useMenu() {
  const { activeTenant } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const loadMenu = useCallback(async () => {
    if (!activeTenant) return
    setLoading(true)
    setError(null)
    try {
      const groups = await menuService.getAllMenuGroups(activeTenant.id)
      setMenuGroups(groups)

      const items = await menuService.getAllMenuItems(activeTenant.id, {
        menuId: selectedGroupId || undefined,
      })
      setMenuItems(items)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar cardápio.")
    } finally {
      setLoading(false)
    }
  }, [activeTenant, selectedGroupId])

  useEffect(() => {
    loadMenu()
  }, [loadMenu])

  const createMenuItem = async (input: CreateMenuItemInput) => {
    if (!activeTenant) return
    try {
      const newItem = await menuService.createMenuItem(activeTenant.id, input)
      setMenuItems((prev) => [newItem, ...prev])
      return newItem
    } catch (err: any) {
      throw new Error(err.message || "Erro ao cadastrar item do cardápio.")
    }
  }

  const getMenuItemById = useCallback(async (id: string) => {
    if (!activeTenant) return null
    try {
      return await menuService.getMenuItemById(activeTenant.id, id)
    } catch (err: any) {
      throw new Error(err.message || "Erro ao obter item do cardápio.")
    }
  }, [activeTenant])

  const updateMenuItem = async (id: string, input: Partial<CreateMenuItemInput>) => {
    if (!activeTenant) return
    try {
      const updated = await menuService.updateMenuItem(activeTenant.id, id, input)
      setMenuItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      return updated
    } catch (err: any) {
      throw new Error(err.message || "Erro ao atualizar item do cardápio.")
    }
  }

  const deleteMenuItem = async (id: string) => {
    if (!activeTenant) return
    try {
      await menuService.deleteMenuItem(activeTenant.id, id)
      setMenuItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      throw new Error(err.message || "Erro ao deletar item do cardápio.")
    }
  }

  const uploadMenuItemImage = async (file: File) => {
    if (!activeTenant) return ""
    try {
      return await menuService.uploadMenuItemImage(activeTenant.id, file)
    } catch (err: any) {
      throw new Error(err.message || "Erro ao fazer upload da imagem do item.")
    }
  }

  // MenuGroup CRUD Operations
  const createMenuGroup = async (name: string, description?: string) => {
    if (!activeTenant) return
    try {
      const newGroup = await menuService.createMenuGroup(activeTenant.id, name, description)
      setMenuGroups((prev) => [...prev, newGroup])
      return newGroup
    } catch (err: any) {
      throw new Error(err.message || "Erro ao criar cardápio.")
    }
  }

  const updateMenuGroup = async (id: string, input: Partial<MenuGroup>) => {
    if (!activeTenant) return
    try {
      const updated = await menuService.updateMenuGroup(activeTenant.id, id, input)
      setMenuGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
      return updated
    } catch (err: any) {
      throw new Error(err.message || "Erro ao atualizar cardápio.")
    }
  }

  const deleteMenuGroup = async (id: string) => {
    if (!activeTenant) return
    try {
      await menuService.deleteMenuGroup(activeTenant.id, id)
      setMenuGroups((prev) => prev.filter((g) => g.id !== id))
      if (selectedGroupId === id) {
        setSelectedGroupId(null)
      }
    } catch (err: any) {
      throw new Error(err.message || "Erro ao deletar cardápio.")
    }
  }

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )

  return {
    menuItems: filteredItems,
    menuGroups,
    selectedGroupId,
    setSelectedGroupId,
    loading,
    error,
    search,
    setSearch,
    createMenuItem,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
    uploadMenuItemImage,
    createMenuGroup,
    updateMenuGroup,
    deleteMenuGroup,
    reload: loadMenu,
  }
}
