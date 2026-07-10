"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Search, Database, Calendar, DollarSign, Tag, Car, Bike, Truck, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fipeService } from "../../fipe/services/fipeService"

interface Brand {
  id: string;
  code: string;
  name: string;
  type: "car" | "motorcycle" | "truck";
}

interface Model {
  id: string;
  code: string;
  name: string;
}

interface PriceDetail {
  id: string;
  yearCode: string;
  yearName: string;
  price: string;
  fuel: string;
  fipeCode: string;
  referenceMonth: string;
}

export function BrandsList() {
  const [activeTab, setActiveTab] = useState<"car" | "motorcycle" | "truck">("car")
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelSearch, setModelSearch] = useState("")

  // State to track expanded models and their loaded prices
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null)
  const [prices, setPrices] = useState<Record<string, PriceDetail[]>>({})
  const [loadingPrices, setLoadingPrices] = useState(false)

  // 1. Fetch brands when tab changes
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true)
      setSelectedBrand(null)
      setModels([])
      setExpandedModelId(null)
      try {
        const data = await fipeService.getBrands(activeTab)
        setBrands(data)
      } catch (err) {
        console.error("Erro ao carregar marcas da FIPE:", err)
      } finally {
        setLoadingBrands(false)
      }
    }
    fetchBrands()
  }, [activeTab])

  // 2. Fetch models when brand is selected
  const handleSelectBrand = async (brand: Brand) => {
    setSelectedBrand(brand)
    setModels([])
    setExpandedModelId(null)
    setLoadingModels(true)
    try {
      const data = await fipeService.getModels(brand.id)
      setModels(data)
    } catch (err) {
      console.error("Erro ao obter modelos da FIPE:", err)
    } finally {
      setLoadingModels(false)
    }
  }

  // 3. Toggle model expansion and fetch prices
  const handleToggleModel = async (model: Model) => {
    if (expandedModelId === model.id) {
      setExpandedModelId(null)
      return
    }

    setExpandedModelId(model.id)
    
    // If prices already loaded, don't refetch
    if (prices[model.id]) return

    setLoadingPrices(true)
    try {
      const data = await fipeService.getPrices(model.id)
      setPrices(prev => ({ ...prev, [model.id]: data }))
    } catch (err) {
      console.error("Erro ao obter preços FIPE do modelo:", err)
    } finally {
      setLoadingPrices(false)
    }
  }

  // Memoized filtered lists
  const filteredBrands = useMemo(() => {
    return brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
  }, [brands, brandSearch])

  const filteredModels = useMemo(() => {
    return models.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
  }, [models, modelSearch])

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Base de Dados FIPE (Local)
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Navegue pelas marcas, modelos e preços oficiais sincronizados em seu banco de dados local.
        </p>
      </div>

      {/* VEHICLE TYPE TABS */}
      <div className="flex gap-2.5 border-b border-neutral-200 pb-px dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("car")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "car"
              ? "border-neutral-900 text-neutral-950 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <Car className="size-4" />
          Carros
        </button>
        <button
          onClick={() => setActiveTab("motorcycle")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "motorcycle"
              ? "border-neutral-900 text-neutral-950 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <Bike className="size-4" />
          Motos
        </button>
        <button
          onClick={() => setActiveTab("truck")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "truck"
              ? "border-neutral-900 text-neutral-950 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <Truck className="size-4" />
          Caminhões
        </button>
      </div>

      {/* MAIN VIEWGRID */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* BRANDS SECTION (LEFT COLUMN) */}
        <div className="lg:col-span-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Tag className="size-4 text-neutral-400" />
              Marcas ({filteredBrands.length})
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar marca..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-neutral-950 text-sm"
            />
          </div>

          {loadingBrands ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 text-sm gap-2">
              <RefreshCw className="size-6 animate-spin text-neutral-500" />
              Carregando marcas...
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-between ${
                    selectedBrand?.id === brand.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  <span>{brand.name}</span>
                  <span className="text-[10px] opacity-65 font-mono bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 text-neutral-700 px-1.5 py-0.5 rounded">
                    {brand.code}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-400 text-sm">
              Nenhuma marca sincronizada para este tipo.
            </div>
          )}
        </div>

        {/* MODELS & PRICES (RIGHT COLUMN) */}
        <div className="lg:col-span-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40 min-h-[500px] flex flex-col">
          {!selectedBrand ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400 py-20">
              <Database className="size-12 text-neutral-300 dark:text-neutral-800 mb-3 animate-pulse" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Nenhuma Marca Selecionada</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
                Selecione uma marca na coluna ao lado para visualizar os modelos e valores oficiais correspondentes.
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Selected Brand Header */}
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Marca Selecionada</div>
                  <h3 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2 mt-0.5">
                    {selectedBrand.name}
                    <span className="text-xs font-mono font-normal text-neutral-400">
                      Código FIPE: {selectedBrand.code}
                    </span>
                  </h3>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Filtrar modelos..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="pl-9 bg-white dark:bg-neutral-950 text-sm"
                  />
                </div>
              </div>

              {/* Models List */}
              {loadingModels ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-neutral-400 text-sm gap-2">
                  <RefreshCw className="size-6 animate-spin text-neutral-500" />
                  Buscando modelos...
                </div>
              ) : filteredModels.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1">
                  {filteredModels.map((model) => {
                    const isExpanded = expandedModelId === model.id
                    const modelDetailPrices = prices[model.id] || []

                    return (
                      <div
                        key={model.id}
                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden transition-all"
                      >
                        {/* Collapsible header */}
                        <button
                          onClick={() => handleToggleModel(model)}
                          className="w-full px-4.5 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-bold text-xs uppercase">
                              {model.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm block">
                                {model.name}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                Código: {model.code}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="size-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="size-4 text-neutral-500" />
                          )}
                        </button>

                        {/* Collapsible content (Prices) */}
                        {isExpanded && (
                          <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 p-4 space-y-3">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                              <DollarSign className="size-3.5" />
                              Versões & Anos Sincronizados
                            </h4>

                            {loadingPrices && !prices[model.id] ? (
                              <div className="flex items-center gap-2 text-xs text-neutral-400 py-3">
                                <RefreshCw className="size-3.5 animate-spin text-neutral-500" />
                                Carregando valores da FIPE...
                              </div>
                            ) : modelDetailPrices.length > 0 ? (
                              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-400 font-semibold">
                                      <th className="p-3">Ano / Versão</th>
                                      <th className="p-3">Combustível</th>
                                      <th className="p-3">Ref. Mês</th>
                                      <th className="p-3 text-right">Valor FIPE</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                                    {modelDetailPrices.map((price) => (
                                      <tr key={price.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/20">
                                        <td className="p-3">
                                          <div>{price.yearName}</div>
                                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                            Cod: {price.fipeCode}
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                            {price.fuel}
                                          </span>
                                        </td>
                                        <td className="p-3 text-neutral-400 flex items-center gap-1 mt-1 border-none">
                                          <Calendar className="size-3" />
                                          {price.referenceMonth}
                                        </td>
                                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                          {price.price}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 rounded-lg bg-neutral-100/60 p-3 text-xs text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                <AlertCircle className="size-4 text-neutral-400" />
                                <span>
                                  Nenhum preço ou ano sincronizado para este modelo (sincronizado apenas modelo).
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-neutral-400 text-sm">
                  Nenhum modelo cadastrado para esta marca nesta categoria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
