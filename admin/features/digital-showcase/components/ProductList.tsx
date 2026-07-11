"use client"

import React, { useState } from "react"
import { useProducts } from "../hooks/useProducts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Store,
  Tag,
  Package,
  Boxes
} from "lucide-react"

export function ProductList() {
  const { products, loading, search, setSearch, createProduct } = useProducts()
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("eletrônicos")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProduct({
        title,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        status: "published",
        images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"]
      })
      // Clear form
      setTitle("")
      setDescription("")
      setPrice("")
      setStock("")
      setImageUrl("")
      setShowAddForm(false)
    } catch (err) {
      alert("Erro ao cadastrar produto")
    }
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Store className="size-8 text-neutral-700 dark:text-neutral-300" />
            Vitrine Digital
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie o catálogo de produtos e estoques da sua vitrine online.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex items-center gap-2"
        >
          <Plus className="size-4" />
          {showAddForm ? "Fechar Formulário" : "Cadastrar Produto"}
        </Button>
      </div>

      {/* ADD PRODUCT FORM */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-neutral-200 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-md backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Novo Produto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Título do Produto</label>
              <Input placeholder="Ex: Smartwatch Sport V2" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="eletrônicos">Eletrônicos</option>
                  <option value="calçados">Calçados</option>
                  <option value="esportes">Esportes</option>
                  <option value="roupas">Roupas</option>
                  <option value="acessorios">Acessórios</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Preço (R$)</label>
                <Input type="number" step="0.01" placeholder="Ex: 199.90" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Estoque (Qtd)</label>
                <Input type="number" placeholder="Ex: 10" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Descrição do Produto</label>
              <textarea
                placeholder="Ex: Carregamento magnético, sensor cardíaco, à prova d'água 5ATM e tela AMOLED."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-20 p-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">URL da Imagem</label>
              <Input placeholder="Ex: https://images.unsplash.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">Cadastrar</Button>
          </div>
        </form>
      )}

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute top-3 left-3 size-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Buscar produtos na vitrine por título, categoria ou descrição..."
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
      ) : products.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl dark:border-neutral-800">
          <Boxes className="size-12 mx-auto text-neutral-400 mb-3" />
          <p className="font-semibold text-neutral-600 dark:text-neutral-300">Nenhum produto cadastrado</p>
          <p className="text-sm text-neutral-400 mt-1">Crie um novo produto clicando em Cadastrar Produto.</p>
        </div>
      ) : (
        /* PRODUCTS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-950"
            >
              {/* IMAGE HEADER */}
              <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag className="size-3" />
                  {product.category}
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="p-5 flex flex-col justify-between h-[180px]">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 truncate">
                      {product.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* STOCK & PRICE FOOTER */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Package className="size-3.5" />
                    Estoque: {product.stock}
                  </span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 flex items-center">
                    <span className="text-sm font-semibold mr-0.5">R$</span>
                    {product.price.toFixed(2)}
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
