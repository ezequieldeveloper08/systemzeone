"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVehicles } from "../hooks/useVehicles"
import { Vehicle, CreateVehicleInput } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { formatCurrencyBRL, parseCurrencyBRL } from "@/lib/currency"
import {
  ChevronLeft,
  Upload,
  X,
  Plus,
  CarFront,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  Database
} from "lucide-react"
import Link from "next/link"

interface VehicleFormProps {
  vehicleId?: string
}

const PRESET_IMAGES = [
  {
    name: "Corvette C8 Vermelho",
    url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Camaro SS Amarelo",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "BMW M3 Cinza",
    url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Porsche 911 Giz",
    url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "SUV Elétrico SUV",
    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80"
  }
]

export function VehicleForm({ vehicleId }: VehicleFormProps) {
  const router = useRouter()
  const { vehicles, createVehicle, updateVehicle, uploadVehicleImage } = useVehicles()

  const isEdit = !!vehicleId
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form Field States
  const [title, setTitle] = useState("")
  const [brand, setBrand] = useState("Chevrolet")
  const [model, setModel] = useState("")
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<string>("")
  const [salePrice, setSalePrice] = useState<string>("")
  const [status, setStatus] = useState<"published" | "hidden">("published")
  const [images, setImages] = useState<string[]>([])
  const [km, setKm] = useState<number>(0)
  const [transmission, setTransmission] = useState<"automatic" | "manual">("automatic")
  const [fuel, setFuel] = useState<"flex" | "gasoline" | "diesel" | "electric" | "hybrid">("gasoline")
  const [color, setColor] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [collections, setCollections] = useState<string[]>([])

  // Webmotors extra details states
  const [type, setType] = useState<"car" | "motorcycle" | "truck">("car")
  const [plate, setPlate] = useState("")
  const [doors, setDoors] = useState<number | undefined>(undefined)
  const [features, setFeatures] = useState<string[]>([])
  const [engine, setEngine] = useState("")
  const [bodyType, setBodyType] = useState("")

  // UI Helper States
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [newTagInput, setNewTagInput] = useState("")
  const [customAttributeKey, setCustomAttributeKey] = useState("")
  const [customAttributeVal, setCustomAttributeVal] = useState("")
  const [customAttributes, setCustomAttributes] = useState<{ key: string; val: string }[]>([])

  // FIPE Integration States
  const [fipeBrands, setFipeBrands] = useState<any[]>([])
  const [fipeBrandId, setFipeBrandId] = useState("")
  const [fipeModels, setFipeModels] = useState<any[]>([])
  const [fipeModelId, setFipeModelId] = useState("")
  const [fipePrices, setFipePrices] = useState<any[]>([])
  const [fipePriceId, setFipePriceId] = useState("")

  // Load Fipe Brands when vehicle type changes
  useEffect(() => {
    const loadFipeBrands = async () => {
      try {
        const sessionStr = localStorage.getItem("veiculos_admin_session")
        if (!sessionStr) return
        const session = JSON.parse(sessionStr)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fipe/brands?type=${type}`, {
          headers: {
            "Authorization": `Bearer ${session.token}`,
          }
        })
        if (res.ok) {
          const data = await res.json()
          setFipeBrands(data)
          // Reset child states
          setFipeBrandId("")
          setFipeModels([])
          setFipeModelId("")
          setFipePrices([])
          setFipePriceId("")
        }
      } catch (err) {
        console.error("Erro ao carregar marcas FIPE:", err)
      }
    }
    loadFipeBrands()
  }, [type])

  const handleFipeBrandChange = async (brandId: string) => {
    setFipeBrandId(brandId)
    setFipeModels([])
    setFipeModelId("")
    setFipePrices([])
    setFipePriceId("")

    if (!brandId) return

    try {
      const sessionStr = localStorage.getItem("veiculos_admin_session")
      if (!sessionStr) return
      const session = JSON.parse(sessionStr)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fipe/models?brandId=${brandId}`, {
        headers: {
          "Authorization": `Bearer ${session.token}`,
        }
      })
      if (res.ok) {
        const data = await res.json()
        setFipeModels(data)
      }
    } catch (err) {
      console.error("Erro ao carregar modelos FIPE:", err)
    }
  }

  const handleFipeModelChange = async (modelId: string) => {
    setFipeModelId(modelId)
    setFipePrices([])
    setFipePriceId("")

    if (!modelId) return

    try {
      const sessionStr = localStorage.getItem("veiculos_admin_session")
      if (!sessionStr) return
      const session = JSON.parse(sessionStr)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fipe/prices?modelId=${modelId}`, {
        headers: {
          "Authorization": `Bearer ${session.token}`,
        }
      })
      if (res.ok) {
        const data = await res.json()
        setFipePrices(data)
      }
    } catch (err) {
      console.error("Erro ao carregar preços FIPE:", err)
    }
  }

  const applyFipeData = () => {
    if (!fipePriceId) return
    const selectedPrice = fipePrices.find(p => p.id === fipePriceId)
    if (!selectedPrice) return

    // Set brand
    const selectedBrand = fipeBrands.find(b => b.id === fipeBrandId)
    if (selectedBrand) {
      setBrand(selectedBrand.name)
    }

    // Set model
    const selectedModel = fipeModels.find(m => m.id === fipeModelId)
    if (selectedModel) {
      setModel(selectedModel.name)
    }

    // Set year
    if (selectedPrice.yearName) {
      const parsedYear = parseInt(selectedPrice.yearName.split(" ")[0], 10)
      if (!isNaN(parsedYear)) {
        setYear(parsedYear)
      }
    }

    // Set price
    if (selectedPrice.numericPrice) {
      setPrice(formatCurrencyBRL(selectedPrice.numericPrice))
    }

    // Set fuel
    if (selectedPrice.fuel) {
      const f = selectedPrice.fuel.toLowerCase()
      if (f.includes("gasolina")) setFuel("gasoline")
      else if (f.includes("diesel")) setFuel("diesel")
      else if (f.includes("flex")) setFuel("flex")
      else if (f.includes("elétrico") || f.includes("eletrico")) setFuel("electric")
      else if (f.includes("híbrido") || f.includes("hibrido")) setFuel("hybrid")
    }

    alert("Dados da Tabela FIPE mesclados com sucesso!")
  }

  // Pre-fill fields if editing
  useEffect(() => {
    if (isEdit && vehicles.length > 0) {
      const vehicle = vehicles.find((v) => v.id === vehicleId)
      if (vehicle) {
        setTitle(vehicle.title)
        setBrand(vehicle.brand)
        setModel(vehicle.model)
        setYear(vehicle.year)
        setDescription(vehicle.description)
        setPrice(formatCurrencyBRL(vehicle.price))
        setSalePrice(formatCurrencyBRL(vehicle.salePrice))
        setStatus(vehicle.status)
        setImages(vehicle.images)
        setKm(vehicle.km)
        setTransmission(vehicle.transmission)
        setFuel(vehicle.fuel)
        setColor(vehicle.color)
        setTags(vehicle.tags)
        setCollections(vehicle.collections)

        // Webmotors extra details
        setType(vehicle.type || "car")
        setPlate(vehicle.plate || "")
        setDoors(vehicle.doors !== undefined ? vehicle.doors : undefined)
        setFeatures(vehicle.features || [])
        setEngine(vehicle.engine || "")
        setBodyType(vehicle.bodyType || "")
      }
    }
  }, [isEdit, vehicleId, vehicles])

  const handleAddImagePreset = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url])
    }
  }

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault()
    if (imageUrlInput.trim() && !images.includes(imageUrlInput.trim())) {
      setImages((prev) => [...prev, imageUrlInput.trim()])
      setImageUrlInput("")
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const url = await uploadVehicleImage(file)
        uploadedUrls.push(url)
      }
      setImages((prev) => [...prev, ...uploadedUrls])
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload das imagens.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(newTagInput.trim())) {
        setTags((prev) => [...prev, newTagInput.trim()])
      }
      setNewTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  const handleAddAttribute = (e: React.MouseEvent) => {
    e.preventDefault()
    if (customAttributeKey.trim() && customAttributeVal.trim()) {
      setCustomAttributes((prev) => [
        ...prev,
        { key: customAttributeKey.trim(), val: customAttributeVal.trim() }
      ])
      // Also write descriptive tag
      const attributeTag = `${customAttributeKey.trim()}: ${customAttributeVal.trim()}`
      if (!tags.includes(attributeTag)) {
        setTags((prev) => [...prev, attributeTag])
      }
      setCustomAttributeKey("")
      setCustomAttributeVal("")
    }
  }

  const handleCollectionChange = (collectionName: string, checked: boolean) => {
    if (checked) {
      setCollections((prev) => [...prev, collectionName])
    } else {
      setCollections((prev) => prev.filter((c) => c !== collectionName))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("O título do veículo é obrigatório.")
      return
    }
    if (!model.trim()) {
      setError("O modelo do veículo é obrigatório.")
      return
    }
    if (parseCurrencyBRL(price) <= 0) {
      setError("Por favor, insira um preço válido.")
      return
    }

    setIsSubmitting(true)

    const payload: CreateVehicleInput = {
      title,
      brand,
      model,
      year: Number(year),
      description,
      price: parseCurrencyBRL(price),
      salePrice: salePrice ? parseCurrencyBRL(salePrice) : undefined,
      status,
      images,
      km: Number(km),
      transmission,
      fuel,
      color,
      tags,
      collections,
      type,
      plate: plate || undefined,
      doors: doors !== undefined ? Number(doors) : undefined,
      features,
      engine: engine || undefined,
      bodyType: bodyType || undefined,
    }

    try {
      if (isEdit && vehicleId) {
        await updateVehicle(vehicleId, payload)
      } else {
        await createVehicle(payload)
      }
      router.push("/admin/vehicles")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar o veículo.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* FORM TOP BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/vehicles" className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ChevronLeft className="size-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Voltar ao catálogo
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {isEdit ? `Editar: ${title || "Veículo"}` : "Novo Veículo"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild type="button" variant="outline" className="h-9 text-xs font-semibold px-4 rounded-lg">
            <Link href="/admin/vehicles">
              Descartar
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold px-4 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
          >
            {isSubmitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "Salvar Veículo"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: MAIN INPUTS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Title & Description */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  Título Comercial
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Chevrolet Corvette C8 Stingray 6.2 V8"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Rich text mock editor */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  Descrição do Veículo
                </Label>
                <div className="rounded-lg border border-neutral-200 overflow-hidden dark:border-neutral-800">
                  {/* Editor Toolbar */}
                  <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-800 dark:bg-neutral-800">
                    <button
                      type="button"
                      title="Negrito"
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      <Bold className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Itálico"
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      <Italic className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Sublinhado"
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      <Underline className="size-4" />
                    </button>
                    <div className="w-px h-4 bg-neutral-200 mx-1 dark:bg-neutral-800" />
                    <button
                      type="button"
                      title="Lista com marcadores"
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      <List className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Lista numerada"
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      <ListOrdered className="size-4" />
                    </button>
                  </div>
                  <Textarea
                    placeholder="Escreva detalhes adicionais, opcionais, ficha técnica, e diferenciais deste automóvel..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-0 rounded-none shadow-none focus-visible:ring-0 min-h-[160px] bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Media Library */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Galeria de Imagens
            </h3>

            <div className="space-y-4">
              {/* Image upload dropzone */}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center dark:border-neutral-800 relative hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors cursor-pointer">
                <Upload className="size-8 text-neutral-400 mb-2" />
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Arraste fotos ou clique aqui para fazer upload
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  PNG, JPG ou WEBP até 10MB
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex items-center gap-3 py-1 text-xs text-neutral-400">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span>OU ADICIONE POR URL</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>

              <div className="flex w-full items-center gap-2 max-w-none">
                <Input
                  placeholder="https://exemplo.com/foto-carro.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="h-9 text-xs font-semibold px-4 rounded-lg bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-950"
                >
                  Adicionar URL
                </Button>
              </div>

              {/* Preset selectors to help user test */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Presets de teste rápidos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddImagePreset(preset.url)}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                    >
                      <ImageIcon className="size-3" />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Images grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative h-24 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 dark:border-neutral-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Carro ${idx + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <X className="size-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[9px] text-white">
                        {idx === 0 ? "Principal" : `Foto ${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card: Pricing */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Tabela de Preços (R$)
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Preço Base de Venda</Label>
                <Input
                  id="price"
                  type="text"
                  placeholder="Ex: R$ 125.000,00"
                  value={price}
                  onChange={(e) => setPrice(formatCurrencyBRL(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salePrice">Preço Promocional (Opcional)</Label>
                <Input
                  id="salePrice"
                  type="text"
                  placeholder="Ex: R$ 119.000,00"
                  value={salePrice}
                  onChange={(e) => setSalePrice(formatCurrencyBRL(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Card: Variations / Specific details */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Variações e Atributos Técnicos
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Adicione atributos personalizados (ex: Opcionais, Chave Reserva, Garantia de Fábrica, Blindagem) que aparecerão nas especificações do veículo.
              </p>

              <div className="flex items-center gap-2 max-w-md">
                <Input
                  placeholder="Ex: Blindagem"
                  value={customAttributeKey}
                  onChange={(e) => setCustomAttributeKey(e.target.value)}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Ex: Nível III-A"
                  value={customAttributeVal}
                  onChange={(e) => setCustomAttributeVal(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAddAttribute}
                  className="h-8 text-xs font-semibold px-3 rounded-lg bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-950"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              {/* Attributes list */}
              {customAttributes.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {customAttributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      <span>
                        <strong>{attr.key}:</strong> {attr.val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR METADATA (1/3 width) */}
        <div className="space-y-6">
          {/* Card: Status setting */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <Label htmlFor="status" className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2 block">
              Status de Publicação
            </Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="published">Publicado (Visível no site)</option>
              <option value="hidden">Oculto (Rascunho privado)</option>
            </Select>
          </div>

          {/* Card: Organization Details */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Ficha Técnica Básica
            </h3>

            {/* FIPE AUTO-FILL BLOCK */}
            <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="size-3.5 text-neutral-400" />
                  Preenchimento Automático FIPE
                </span>
                <span className="text-[10px] text-neutral-400">Banco de dados local</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">Marca FIPE</label>
                  <Select
                    value={fipeBrandId}
                    onChange={(e) => handleFipeBrandChange(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {fipeBrands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">Modelo FIPE</label>
                  <Select
                    value={fipeModelId}
                    onChange={(e) => handleFipeModelChange(e.target.value)}
                    disabled={!fipeBrandId}
                  >
                    <option value="">Selecione...</option>
                    {fipeModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">Ano / Versão FIPE</label>
                  <Select
                    value={fipePriceId}
                    onChange={(e) => setFipePriceId(e.target.value)}
                    disabled={!fipeModelId}
                  >
                    <option value="">Selecione...</option>
                    {fipePrices.map((p) => (
                      <option key={p.id} value={p.id}>{p.yearName} ({p.price})</option>
                    ))}
                  </Select>
                </div>
              </div>

              {fipePriceId && (
                <Button
                  type="button"
                  onClick={applyFipeData}
                  className="w-full h-8 text-xs bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                >
                  Mesclar Dados FIPE com Formulário
                </Button>
              )}
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="brand">Marca / Fabricante</Label>
                <Select
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Porsche">Porsche</option>
                  <option value="BMW">BMW</option>
                  <option value="Audi">Audi</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Ford">Ford</option>
                  <option value="Hyundai">Hyundai</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="Ex: Corvette C8"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="year">Ano Modelo</Label>
                  <Input
                    id="year"
                    type="number"
                    value={year || ""}
                    onChange={(e) => setYear(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="km">Quilometragem (KM)</Label>
                  <Input
                    id="km"
                    type="number"
                    value={km === 0 ? "0" : km}
                    onChange={(e) => setKm(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="transmission">Câmbio</Label>
                  <Select
                    id="transmission"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                  >
                    <option value="automatic">Automático</option>
                    <option value="manual">Manual</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fuel">Combustível</Label>
                  <Select
                    id="fuel"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value as any)}
                  >
                    <option value="flex">Flex</option>
                    <option value="gasoline">Gasolina</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Elétrico</option>
                    <option value="hybrid">Híbrido</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color">Cor Externa</Label>
                <Input
                  id="color"
                  placeholder="Ex: Vermelho Adrenalina"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card: Webmotors Specification */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Ficha Técnica (Padrão Webmotors)
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-type">Tipo de Veículo</Label>
                  <Select
                    id="vehicle-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="car">🚗 Carro</option>
                    <option value="motorcycle">🏍️ Moto</option>
                    <option value="truck">🚛 Caminhão</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doors">Portas (opcional)</Label>
                  <Input
                    id="doors"
                    type="number"
                    placeholder="Ex: 4"
                    value={doors !== undefined ? doors : ""}
                    onChange={(e) => setDoors(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="engine">Motorização / Cilindrada</Label>
                  <Input
                    id="engine"
                    placeholder="Ex: 2.0 Turbo / 600cc"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bodyType">Carroceria / Estilo</Label>
                  <Input
                    id="bodyType"
                    placeholder="Ex: SUV, Sedan, Naked"
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="plate">Final da Placa / Placa Completa</Label>
                <Input
                  id="plate"
                  placeholder="Ex: ABC1D23 ou final 5"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Acessórios / Opcionais</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-neutral-100 rounded-lg p-3 dark:border-neutral-800">
                  {[
                    "Ar Condicionado",
                    "Direção Hidráulica",
                    "Freio ABS",
                    "Airbag",
                    "Alarme",
                    "Trava Elétrica",
                    "Vidro Elétrico",
                    "Som / Multimídia",
                    "Teto Solar",
                    "Bancos de Couro",
                    "Sensor de Ré",
                    "Câmera de Ré",
                    "Rodas de Liga Leve",
                    "Tração 4x4",
                    "Farol de Neblina",
                    "Computador de Bordo"
                  ].map((feat) => {
                    const checked = features.includes(feat)
                    return (
                      <label
                        key={feat}
                        className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 dark:text-neutral-400"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(isChecked) => {
                            if (isChecked) {
                              setFeatures((prev) => [...prev, feat])
                            } else {
                              setFeatures((prev) => prev.filter((f) => f !== feat))
                            }
                          }}
                        />
                        <span>{feat}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Collections & Categorization */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Coleções no Site
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 dark:text-neutral-400">
                <Checkbox
                  checked={collections.includes("Destaques")}
                  onCheckedChange={(checked) => handleCollectionChange("Destaques", checked)}
                />
                <span>Veículos em Destaque</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 dark:text-neutral-400">
                <Checkbox
                  checked={collections.includes("Mais Vendidos")}
                  onCheckedChange={(checked) => handleCollectionChange("Mais Vendidos", checked)}
                />
                <span>Mais Vendidos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 dark:text-neutral-400">
                <Checkbox
                  checked={collections.includes("Próximos Lançamentos")}
                  onCheckedChange={(checked) => handleCollectionChange("Próximos Lançamentos", checked)}
                />
                <span>Próximos Lançamentos</span>
              </label>
            </div>
          </div>

          {/* Card: Tags manager */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Tags (Palavras-chave)
            </h3>
            <div className="space-y-2">
              <div className="relative">
                <Tag className="absolute top-2.5 left-3 size-4 text-neutral-400" />
                <Input
                  placeholder="Escreva e aperte Enter..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 font-bold"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
