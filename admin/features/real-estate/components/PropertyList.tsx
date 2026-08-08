"use client"

import React, { useState } from "react"
import { useProperties } from "../hooks/useProperties"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Home,
  BedDouble,
  Bath,
  Maximize2,
  Building,
  Tag,
  Pencil,
  Trash2,
  EyeOff
} from "lucide-react"
import Link from "next/link"

export function PropertyList() {
  const { properties, loading, search, setSearch, deleteProperty } = useProperties()

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este imóvel permanentemente?")) {
      try {
        await deleteProperty(id)
      } catch (err: any) {
        alert(err.message || "Erro ao excluir imóvel")
      }
    }
  }

  // Translate property type key for display
  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      apartment: "Apartamento",
      house: "Casa",
      condo_house: "Casa Condomínio",
      studio: "Studio",
      kitnet: "Kitnet",
      loft: "Loft",
      penthouse: "Cobertura",
      commercial: "Comercial",
      land: "Terreno",
      farm: "Chácara / Sítio",
    }
    return map[type] || type
  }

  return (
    <div className="space-y-8 py-6 mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Home className="size-8 text-neutral-700 dark:text-neutral-300" />
            Portfólio de Imóveis
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie e anuncie os imóveis da sua imobiliária.
          </p>
        </div>
        <Button
          asChild
          className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex items-center gap-2"
        >
          <Link href="/admin/real-estate/new">
            <Plus className="size-4" />
            Cadastrar Imóvel
          </Link>
        </Button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="relative">
        <Search className="absolute top-3 left-3 size-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Buscar por título, tipo ou descrição..."
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
      ) : properties.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl dark:border-neutral-800">
          <Building className="size-12 mx-auto text-neutral-400 mb-3" />
          <p className="font-semibold text-neutral-600 dark:text-neutral-300">Nenhum imóvel encontrado</p>
          <p className="text-sm text-neutral-400 mt-1">Crie um novo anúncio clicando em Cadastrar Imóvel.</p>
        </div>
      ) : (
        /* PROPERTIES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => {
            // Defensive fallbacks for old vs new schema properties
            const bedroomsCount = property.rooms?.bedrooms ?? (property as any).bedrooms ?? 0
            const bathroomsCount = property.rooms?.bathrooms ?? (property as any).bathrooms ?? 0
            const totalAreaSize = property.area?.total ??
              property.area?.usable ??
              (typeof (property as any).area === "number" ? (property as any).area : 0)
            const salePriceVal = property.pricing?.salePrice ?? property.pricing?.rentPrice ?? (property as any).price ?? 0
            const rentPriceVal = property.pricing?.rentPrice ?? null

            const coverImageSrc = property.media?.cover ??
              property.media?.images?.[0]?.url ??
              ((property as any).images && (property as any).images[0]) ??
              null

            const isDraft = property.status === "draft"
            const isInactive = property.status === "inactive"

            return (
              <div
                key={property.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-950"
              >
                <div>
                  {/* IMAGE HEADER */}
                  <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden flex items-center justify-center border-b border-neutral-100 dark:border-neutral-900">
                    {coverImageSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={coverImageSrc}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 gap-1.5">
                        <Building className="size-10 stroke-[1.5]" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Sem Imagem</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="size-3" />
                      {getTypeLabel(property.type)}
                    </div>

                    {(isDraft || isInactive) && (
                      <div className="absolute top-3 right-3 bg-yellow-500/90 text-neutral-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <EyeOff className="size-3" />
                        {isDraft ? "Rascunho" : "Inativo"}
                      </div>
                    )}
                  </div>

                  {/* CARD CONTENT */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50 truncate" title={property.title}>
                        {property.title}
                      </h3>
                      {property.address?.city && property.address?.state && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {property.address.neighborhood}, {property.address.city} - {property.address.state}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-2">
                        {property.description}
                      </p>
                    </div>

                    {/* ICON METRICS */}
                    <div className="grid grid-cols-3 gap-2 border-y border-neutral-100 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5 justify-center">
                        <BedDouble className="size-4 shrink-0 text-neutral-400" />
                        <span>{bedroomsCount} Qts</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <Bath className="size-4 shrink-0 text-neutral-400" />
                        <span>{bathroomsCount} Banhs</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <Maximize2 className="size-4 shrink-0 text-neutral-400" />
                        <span>{totalAreaSize} m²</span>
                      </div>
                    </div>

                    {/* PRICE FOOTER */}
                    <div className="flex flex-col gap-0.5 pt-1">
                      {property.purpose === "rent" ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-400 uppercase">Aluguel</span>
                          <span className="text-base font-extrabold text-neutral-950 dark:text-neutral-50 flex items-center">
                            <span className="text-xs font-semibold mr-0.5">R$</span>
                            {rentPriceVal ? rentPriceVal.toLocaleString("pt-BR") : salePriceVal.toLocaleString("pt-BR")}/mês
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-400 uppercase">Preço Venda</span>
                          <span className="text-base font-extrabold text-neutral-950 dark:text-neutral-50 flex items-center">
                            <span className="text-xs font-semibold mr-0.5">R$</span>
                            {salePriceVal.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD ACTIONS */}
                <div className="flex gap-2 p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-8 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Link href={`/admin/real-estate/edit/${property.id}`}>
                      <Pencil className="size-3.5" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleDelete(property.id)}
                    className="h-8 text-xs font-semibold text-red-650 hover:text-white hover:bg-red-500 rounded-lg flex items-center justify-center gap-1.5 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                    Excluir
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
