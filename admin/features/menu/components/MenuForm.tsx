"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMenu } from "../hooks/useMenu"
import { ChoiceGroup, ChoiceOption } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  Plus,
  Trash2,
  PlusCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Upload,
  X
} from "lucide-react"
import Link from "next/link"

interface MenuFormProps {
  menuItemId?: string
}

const formatCurrencyBRL = (value: number | string | null | undefined): string => {
  if (value === undefined || value === null) return "R$ 0,00"
  const numeric = typeof value === "number" ? value : parseFloat(String(value).replace(/\D/g, "")) / 100
  if (isNaN(numeric)) return "R$ 0,00"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(numeric)
}

const parseCurrencyBRL = (formattedValue: string): number => {
  const cleanValue = formattedValue.replace(/\D/g, "")
  const numeric = parseFloat(cleanValue) / 100
  return isNaN(numeric) ? 0 : numeric
}

export function MenuForm({ menuItemId }: MenuFormProps) {
  const router = useRouter()
  const { createMenuItem, getMenuItemById, updateMenuItem, uploadMenuItemImage, menuGroups } = useMenu()
  const isEdit = !!menuItemId

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Field states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("hambúrgueres")
  const [price, setPrice] = useState<number>(0)
  const [image, setImage] = useState("")
  const [status, setStatus] = useState<"published" | "hidden">("published")
  const [choiceGroups, setChoiceGroups] = useState<ChoiceGroup[]>([])
  const [menuId, setMenuId] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)
    try {
      const url = await uploadMenuItemImage(files[0])
      setImage(url)
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload da imagem.")
    } finally {
      setIsUploading(false)
    }
  }

  // Load menu item for edit mode
  useEffect(() => {
    if (isEdit && menuItemId) {
      getMenuItemById(menuItemId).then((item) => {
        if (item) {
          setName(item.name)
          setDescription(item.description)
          setCategory(item.category)
          setPrice(item.price)
          setImage(item.image || "")
          setStatus(item.status)
          setChoiceGroups(item.choiceGroups || [])
          setMenuId(item.menuId || "")
        }
      }).catch(() => setError("Erro ao carregar dados do prato."))
    }
  }, [isEdit, menuItemId, getMenuItemById])

  // Choice Groups Actions
  const addChoiceGroup = () => {
    const newGroup: ChoiceGroup = {
      name: "",
      required: false,
      minChoices: 0,
      maxChoices: 1,
      options: []
    }
    setChoiceGroups([...choiceGroups, newGroup])
  }

  const removeChoiceGroup = (groupIndex: number) => {
    setChoiceGroups(choiceGroups.filter((_, idx) => idx !== groupIndex))
  }

  const updateGroupField = (groupIndex: number, field: keyof ChoiceGroup, value: any) => {
    const updated = [...choiceGroups]
    updated[groupIndex] = {
      ...updated[groupIndex],
      [field]: value
    }
    setChoiceGroups(updated)
  }

  const addOptionToGroup = (groupIndex: number) => {
    const updated = [...choiceGroups]
    const newOption: ChoiceOption = {
      name: "",
      price: 0
    }
    updated[groupIndex].options = [...updated[groupIndex].options, newOption]
    setChoiceGroups(updated)
  }

  const removeOptionFromGroup = (groupIndex: number, optionIndex: number) => {
    const updated = [...choiceGroups]
    updated[groupIndex].options = updated[groupIndex].options.filter((_, idx) => idx !== optionIndex)
    setChoiceGroups(updated)
  }

  const updateOptionField = (groupIndex: number, optionIndex: number, field: keyof ChoiceOption, value: any) => {
    const updated = [...choiceGroups]
    updated[groupIndex].options[optionIndex] = {
      ...updated[groupIndex].options[optionIndex],
      [field]: value
    }
    setChoiceGroups(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Basic Validations
    if (!name.trim()) {
      setError("O nome do item é obrigatório.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      name,
      description,
      category,
      price: Number(price),
      image: image || null,
      status,
      choiceGroups,
      menuId: menuId || null
    }

    try {
      if (isEdit && menuItemId) {
        await updateMenuItem(menuItemId, payload)
      } else {
        await createMenuItem(payload)
      }
      router.push("/admin/menu")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar item do cardápio.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* BACK LINK */}
      <Link href="/admin/menu" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
        <ChevronLeft className="size-3.5" />
        Voltar para o cardápio
      </Link>

      {/* HEADER */}
      <div className="border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          {isEdit ? "Editar Item do Cardápio" : "Adicionar ao Cardápio"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {isEdit
            ? "Atualize as informações, fotos e adicionais do item selecionado."
            : "Insira os dados, preços e grupos de adicionais estilo iFood."}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: BASIC INFO */}
        <div className="p-6 rounded-2xl border border-neutral-200 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <FileText className="size-5 text-neutral-400" />
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do Prato/Bebida</Label>
              <Input
                id="name"
                placeholder="Ex: Gran Burger Cheddar Bacon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="hambúrgueres">Hambúrgueres</option>
                  <option value="pizzas">Pizzas</option>
                  <option value="sobremesas">Sobremesas</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="entradas">Entradas</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Preço Padrão</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                  <Input
                    id="price"
                    type="text"
                    className="pl-8"
                    placeholder="R$ 0,00"
                    value={formatCurrencyBRL(price)}
                    onChange={(e) => setPrice(parseCurrencyBRL(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description">Descrição/Ingredientes</Label>
              <Textarea
                id="description"
                placeholder="Ex: Blend de fraldinha 150g grelhado no fogo, cebola roxa marinada, rúcula..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Imagem do Prato</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Upload zone */}
                <div className="md:col-span-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center dark:border-neutral-800 relative hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors cursor-pointer min-h-36">
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="size-6 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent mb-2" />
                      <p className="text-xs text-neutral-500">Fazendo upload...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="size-8 text-neutral-400 mb-2" />
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Clique aqui para fazer upload
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        PNG, JPG ou WEBP até 10MB
                      </p>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>

                {/* Preview or URL entry */}
                <div className="flex flex-col gap-2 h-full justify-between">
                  {image ? (
                    <div className="relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 h-28 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-28 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/40 text-[11px] text-neutral-400 italic">
                      Nenhuma imagem enviada
                    </div>
                  )}

                  <div className="relative">
                    <ImageIcon className="absolute left-2.5 top-2.5 size-3.5 text-neutral-400" />
                    <Input
                      placeholder="Ou cole a URL da foto"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="pl-8 text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Visibilidade</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
              >
                <option value="published">Disponível no Cardápio</option>
                <option value="hidden">Pausado/Indisponível</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="menuId">Vincular ao Cardápio</Label>
              <select
                id="menuId"
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
              >
                <option value="">Sem Cardápio Principal (Geral)</option>
                {menuGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: iFOOD CHOICE GROUPS */}
        <div className="p-6 rounded-2xl border border-neutral-200 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Layers className="size-5 text-neutral-400" />
              Grupos de Escolhas (Adicionais iFood)
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={addChoiceGroup}
              className="flex items-center gap-1.5 text-xs h-8 border-dashed"
            >
              <PlusCircle className="size-4 text-neutral-500" />
              Novo Grupo
            </Button>
          </div>

          {choiceGroups.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl dark:border-neutral-800 text-xs text-neutral-400">
              Nenhum grupo de escolhas configurado. Este prato não terá opcionais.
            </div>
          ) : (
            <div className="space-y-6">
              {choiceGroups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40 relative space-y-4 animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    type="button"
                    onClick={() => removeChoiceGroup(gIdx)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-8">
                    {/* Group Title */}
                    <div className="md:col-span-6 space-y-1">
                      <Label className="text-[11px] font-semibold text-neutral-400 uppercase">Nome do Grupo</Label>
                      <Input
                        placeholder="Ex: Escolha o ponto da carne, Adicionais, Bebida..."
                        value={group.name}
                        onChange={(e) => updateGroupField(gIdx, "name", e.target.value)}
                        required
                      />
                    </div>
                    {/* Min Choices */}
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-[11px] font-semibold text-neutral-400 uppercase">Mínimo</Label>
                      <Input
                        type="number"
                        min={0}
                        value={group.minChoices}
                        onChange={(e) => updateGroupField(gIdx, "minChoices", Number(e.target.value))}
                        required
                      />
                    </div>
                    {/* Max Choices */}
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-[11px] font-semibold text-neutral-400 uppercase">Máximo</Label>
                      <Input
                        type="number"
                        min={1}
                        value={group.maxChoices}
                        onChange={(e) => updateGroupField(gIdx, "maxChoices", Number(e.target.value))}
                        required
                      />
                    </div>
                    {/* Required Checkbox */}
                    <div className="md:col-span-2 flex items-center h-full pt-6 justify-center">
                      <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 cursor-pointer">
                        <Checkbox
                          checked={group.required}
                          onCheckedChange={(checked) => updateGroupField(gIdx, "required", !!checked)}
                        />
                        Obrigatório
                      </label>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Opções de Escolha / Adicionais
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => addOptionToGroup(gIdx)}
                        className="text-[11px] h-6 text-neutral-500 hover:text-neutral-900"
                      >
                        <Plus className="size-3 mr-1" />
                        Adicionar Opção
                      </Button>
                    </div>

                    {group.options.length === 0 ? (
                      <p className="text-[11px] text-neutral-400 italic">Cadastre ao menos uma opção (ex: Coca-Cola, Sem Gelo, etc.)</p>
                    ) : (
                      <div className="space-y-2">
                        {group.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2 items-center animate-in fade-in-50 duration-75">
                            <Input
                              placeholder="Nome da opção (Ex: Molho de Alho)"
                              value={opt.name}
                              onChange={(e) => updateOptionField(gIdx, oIdx, "name", e.target.value)}
                              className="h-8 text-xs flex-1"
                              required
                            />
                            <div className="relative w-36">
                              <span className="absolute left-2.5 top-2 text-[10px] text-neutral-400 font-bold">R$</span>
                              <Input
                                type="text"
                                placeholder="Valor adicional"
                                value={formatCurrencyBRL(opt.price)}
                                onChange={(e) => updateOptionField(gIdx, oIdx, "price", parseCurrencyBRL(e.target.value))}
                                className="h-8 text-xs pl-7"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOptionFromGroup(gIdx, oIdx)}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/admin/menu">
            <Button type="button" variant="outline" className="h-10 text-sm font-semibold">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 h-10 text-sm font-semibold min-w-32"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Item"}
          </Button>
        </div>
      </form>
    </div>
  )
}
