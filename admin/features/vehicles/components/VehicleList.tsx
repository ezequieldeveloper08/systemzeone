"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useVehicles } from "../hooks/useVehicles"
import { Vehicle } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { VehicleEmptyState } from "./VehicleEmptyState"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CarFront
} from "lucide-react"


export function VehicleList() {
  const {
    vehicles,
    totalCount,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    deleteVehicle
  } = useVehicles()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeActionId, setActiveActionId] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Reset pagination on filter/search change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, sortBy])

  // Close action menus when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveActionId(null)
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <span className="size-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white" />
      </div>
    )
  }

  if (totalCount === 0 && !search && statusFilter === "all") {
    return <VehicleEmptyState />
  }

  // Calculate paginated slice
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedVehicles = vehicles.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.max(1, Math.ceil(vehicles.length / itemsPerPage))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedVehicles.map((v) => v.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza de que deseja excluir este veículo do catálogo?")) {
      try {
        await deleteVehicle(id)
        setSelectedIds((prev) => prev.filter((item) => item !== id))
        setActiveActionId(null)
      } catch (err: any) {
        alert(err.message || "Erro ao excluir veículo.")
      }
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(value)
  }

  const getFuelLabel = (fuel: Vehicle["fuel"]) => {
    const labels = {
      flex: "Flex",
      gasoline: "Gasolina",
      diesel: "Diesel",
      electric: "Elétrico",
      hybrid: "Híbrido",
    }
    return labels[fuel] || fuel
  }

  const getTransmissionLabel = (t: Vehicle["transmission"]) => {
    return t === "automatic" ? "Aut." : "Man."
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Estoque de Veículos
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Gerencie o catálogo de automóveis disponíveis para venda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="h-9 gap-1.5 font-semibold text-sm px-4 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
            <Link href="/admin/vehicles/new">
              <Plus className="size-4" />
              Adicionar Veículo
            </Link>
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs for Status */}
          <div className="flex items-center gap-1.5 rounded-lg bg-neutral-50 p-1 dark:bg-neutral-900">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "published"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setStatusFilter("hidden")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "hidden"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              Ocultos
            </button>
          </div>

          {/* Search and Sort controls */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
              <Input
                placeholder="Filtrar veículos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex h-9 items-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 appearance-none cursor-pointer"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="title">Nome (A-Z)</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
                  <ArrowUpDown className="size-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VEHICLES TABLE CONTAINER */}
      {paginatedVehicles.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum veículo corresponde aos filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full border-collapse text-left text-sm text-neutral-500 dark:text-neutral-400">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="w-12 px-6 py-4">
                    <Checkbox
                      checked={
                        paginatedVehicles.length > 0 &&
                        paginatedVehicles.every((v) => selectedIds.includes(v.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">Veículo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Preço</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Ano/KM</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Câmbio/Comb.</th>
                  <th scope="col" className="w-12 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {paginatedVehicles.map((vehicle) => {
                  const isSelected = selectedIds.includes(vehicle.id)
                  const isMenuOpen = activeActionId === vehicle.id

                  return (
                    <tr
                      key={vehicle.id}
                      className={`transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20 ${
                        isSelected ? "bg-neutral-50/50 dark:bg-neutral-800/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(vehicle.id, checked)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-50">
                        <div className="flex items-center gap-3">
                          {vehicle.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={vehicle.images[0]}
                              alt={vehicle.title}
                              className="size-11 rounded-lg object-cover border border-neutral-100 dark:border-neutral-800 bg-neutral-100"
                            />
                          ) : (
                            <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                              <CarFront className="size-5" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm line-clamp-1">
                              {vehicle.type === "motorcycle" ? "🏍️ " : vehicle.type === "truck" ? "🚛 " : "🚗 "}
                              {vehicle.title}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {vehicle.brand} • {vehicle.model} {vehicle.engine ? ` • ${vehicle.engine}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.status === "published" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <span className="size-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400" />
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-neutral-950 dark:text-neutral-100">
                        <div className="flex flex-col">
                          {vehicle.salePrice ? (
                            <>
                              <span className="text-xs text-neutral-400 line-through">
                                {formatPrice(vehicle.price)}
                              </span>
                              <span className="text-sm font-bold text-red-650 dark:text-red-400">
                                {formatPrice(vehicle.salePrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm">{formatPrice(vehicle.price)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        <div className="flex flex-col">
                          <span>Ano {vehicle.year}</span>
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {vehicle.km === 0 ? "Zero KM" : `${vehicle.km.toLocaleString("pt-BR")} KM`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        <div className="flex flex-col">
                          <span>{getTransmissionLabel(vehicle.transmission)}</span>
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {getFuelLabel(vehicle.fuel)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveActionId(isMenuOpen ? null : vehicle.id)
                            }}
                            className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <MoreHorizontal className="size-4 text-neutral-400" />
                          </button>

                          {/* Action Flyout */}
                          {isMenuOpen && (
                            <div className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                              <Link
                                href={`/admin/vehicles/edit/${vehicle.id}`}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                              >
                                <Edit2 className="size-3.5" />
                                Editar
                              </Link>
                              <button
                                onClick={() => handleDelete(vehicle.id)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="size-3.5" />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Mostrando <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{vehicles.length > 0 ? startIndex + 1 : 0}</strong> a{" "}
              <strong className="font-semibold text-neutral-900 dark:text-neutral-50">
                {Math.min(startIndex + itemsPerPage, vehicles.length)}
              </strong>{" "}
              de <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{vehicles.length}</strong> veículos
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 shadow-2xs hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Pág {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 shadow-2xs hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
