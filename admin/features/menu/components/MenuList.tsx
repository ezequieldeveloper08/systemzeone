"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useMenu } from "../hooks/useMenu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Utensils,
  ChefHat,
  Tag,
  Edit2,
  Trash2,
  Layers,
  Settings,
  X,
  PlusCircle,
  FolderOpen
} from "lucide-react"

export function MenuList() {
  const {
    menuItems,
    menuGroups,
    selectedGroupId,
    setSelectedGroupId,
    loading,
    search,
    setSearch,
    deleteMenuItem,
    createMenuGroup,
    deleteMenuGroup
  } = useMenu()

  const [showGroupsModal, setShowGroupsModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDesc, setNewGroupDesc] = useState("")

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item do cardápio?")) {
      try {
        await deleteMenuItem(id)
      } catch (err) {
        alert("Erro ao excluir item do cardápio.")
      }
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    try {
      await createMenuGroup(newGroupName, newGroupDesc)
      setNewGroupName("")
      setNewGroupDesc("")
    } catch (err) {
      alert("Erro ao criar agrupamento.")
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (confirm("Ao excluir este cardápio, os pratos vinculados a ele continuarão existindo em 'Sem Cardápio Principal'. Confirma a exclusão?")) {
      try {
        await deleteMenuGroup(id)
      } catch (err) {
        alert("Erro ao excluir cardápio.")
      }
    }
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto relative">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <ChefHat className="size-8 text-neutral-700 dark:text-neutral-300" />
            Cardápio Digital
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie as opções de pratos, bebidas e sobremesas do seu restaurante com opcionais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowGroupsModal(true)}
            variant="outline"
            className="flex items-center gap-1.5 h-10 font-semibold text-sm border-neutral-300 dark:border-neutral-700"
          >
            <Settings className="size-4 text-neutral-500" />
            Gerenciar Cardápios
          </Button>
          <Link href="/admin/menu/new">
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex items-center gap-2 h-10">
              <Plus className="size-4" />
              Cadastrar Item
            </Button>
          </Link>
        </div>
      </div>

      {/* TABS (CARDÁPIOS / AGRUPAMENTOS) */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setSelectedGroupId(null)}
            className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition-all ${
              selectedGroupId === null
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-50 dark:text-neutral-50"
                : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            Todos os Itens
          </button>
          {menuGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition-all ${
                selectedGroupId === group.id
                  ? "border-neutral-900 text-neutral-900 dark:border-neutral-50 dark:text-neutral-50"
                  : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              {group.name}
            </button>
          ))}
        </nav>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute top-3 left-3 size-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Buscar no cardápio por nome, categoria ou ingredientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* LOADING OR EMPTY STATE */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="size-6 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
          <Utensils className="size-12 mx-auto text-neutral-400 mb-3" />
          <p className="font-semibold text-neutral-600 dark:text-neutral-300">Nenhum item neste cardápio</p>
          <p className="text-sm text-neutral-400 mt-1">Crie um novo prato clicando em Cadastrar Item e vincule-o aqui.</p>
        </div>
      ) : (
        /* ITEMS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-950 flex flex-col"
            >
              {/* IMAGE HEADER */}
              <div className="relative h-48 w-full bg-neutral-100 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag className="size-3" />
                  {item.category}
                </div>

                {/* EDIT/DELETE ACTIONS */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-white/90 dark:bg-neutral-900/90 p-1 rounded-lg shadow-xs">
                  <Link href={`/admin/menu/edit/${item.id}`}>
                    <button className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors">
                      <Edit2 className="size-3.5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="p-5 flex flex-col justify-between flex-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 truncate">
                      {item.name}
                    </h3>
                    {item.choiceGroups && item.choiceGroups.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-full shrink-0">
                        <Layers className="size-3" />
                        {item.choiceGroups.length} adicionais
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* PRICE FOOTER */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Preço</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 flex items-center">
                    <span className="text-sm font-semibold mr-0.5">R$</span>
                    {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GROUPS MANAGER MODAL */}
      {showGroupsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800 mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <FolderOpen className="size-5 text-neutral-500" />
                Gerenciar Cardápios
              </h3>
              <button
                onClick={() => setShowGroupsModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Groups List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-4">
              {menuGroups.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-4">Nenhum agrupamento/cardápio cadastrado.</p>
              ) : (
                menuGroups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{g.name}</p>
                      {g.description && <p className="text-[10px] text-neutral-400 truncate">{g.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(g.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Create Group Form */}
            <form onSubmit={handleCreateGroup} className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Criar Novo Cardápio</p>
              <div className="space-y-1.5">
                <Input
                  placeholder="Nome do Cardápio (Ex: Bebidas, Happy Hour)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Input
                  placeholder="Descrição opcional"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <Button type="submit" className="w-full h-9 text-xs font-semibold flex items-center gap-1.5">
                <PlusCircle className="size-3.5" />
                Criar Cardápio
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
