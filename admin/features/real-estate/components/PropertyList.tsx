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
  DollarSign,
  Building,
  Tag
} from "lucide-react"

export function PropertyList() {
  const { properties, loading, search, setSearch, createProperty } = useProperties()
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("apartamento")
  const [price, setPrice] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [area, setArea] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProperty({
        title,
        description,
        type,
        price: Number(price),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        status: "published",
        images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80"]
      })
      // Clear form
      setTitle("")
      setDescription("")
      setPrice("")
      setBedrooms("")
      setBathrooms("")
      setArea("")
      setImageUrl("")
      setShowAddForm(false)
    } catch (err) {
      alert("Erro ao cadastrar imóvel")
    }
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
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
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex items-center gap-2"
        >
          <Plus className="size-4" />
          {showAddForm ? "Fechar Formulário" : "Cadastrar Imóvel"}
        </Button>
      </div>

      {/* ADD PROPERTY FORM */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-neutral-200 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-md backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Novo Imóvel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Título</label>
              <Input placeholder="Ex: Casa Duplex Alphaville" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Preço (R$)</label>
                <Input type="number" placeholder="Ex: 850000" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Descrição</label>
              <textarea
                placeholder="Detalhes sobre quartos, acabamento, condomínio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-20 p-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Quartos</label>
                <Input type="number" placeholder="Ex: 3" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Banheiros</label>
                <Input type="number" placeholder="Ex: 2" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Área (m²)</label>
                <Input type="number" placeholder="Ex: 120" value={area} onChange={(e) => setArea(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400 uppercase">URL da Imagem</label>
              <Input placeholder="Ex: https://images.unsplash.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">Cadastrar</Button>
          </div>
        </form>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-950"
            >
              {/* IMAGE HEADER */}
              <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={property.images[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80"}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag className="size-3" />
                  {property.type}
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 truncate">
                    {property.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {property.description}
                  </p>
                </div>

                {/* ICON METRICS */}
                <div className="grid grid-cols-3 gap-2 border-y border-neutral-100 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5 justify-center">
                    <BedDouble className="size-4 shrink-0 text-neutral-400" />
                    <span>{property.bedrooms} Qts</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Bath className="size-4 shrink-0 text-neutral-400" />
                    <span>{property.bathrooms} Banhs</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Maximize2 className="size-4 shrink-0 text-neutral-400" />
                    <span>{property.area} m²</span>
                  </div>
                </div>

                {/* PRICE FOOTER */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Valor Venda</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 flex items-center">
                    <span className="text-sm font-semibold mr-0.5">R$</span>
                    {property.price.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
