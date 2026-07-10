"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  X,
  FileText,
  UserPlus,
  Calendar,
  Smile,
  ClipboardList,
  Calculator,
  Shuffle,
  Users,
  Home,
  Check,
  ChevronRight,
  HelpCircle
} from "lucide-react"

interface WhatsappFlowsCreateFormProps {
  isOpen: boolean
  onClose: () => void
}

// Local representation of templates matching the builder template registry
const templateOptions = [
  {
    key: "blank",
    name: "Fluxo em Branco",
    description: "Inicie um fluxo do zero e adicione telas e componentes conforme sua necessidade.",
    icon: FileText,
    color: "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400"
  },
  {
    key: "leads",
    name: "Geração de Leads",
    description: "Ideal para capturar contatos de interesse em serviços ou novos lançamentos.",
    icon: UserPlus,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400"
  },
  {
    key: "agendamento",
    name: "Agendamento de Test Drive",
    description: "Ficha de seleção de veículo, calendário de data e confirmação.",
    icon: Calendar,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400"
  },
  {
    key: "satisfacao",
    name: "Pesquisa de Satisfação",
    description: "Coleta de notas de 1 a 5 e caixa para comentários de melhorias.",
    icon: Smile,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400"
  },
  {
    key: "cadastro",
    name: "Ficha Cadastral",
    description: "Ficha rápida coletando dados pessoais como CPF, nome e gênero.",
    icon: ClipboardList,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400"
  },
  {
    key: "orcamento",
    name: "Pedido de Orçamento",
    description: "Seleção de opcionais desejados, modelo de interesse e e-mail.",
    icon: Calculator,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400"
  },
  {
    key: "crm",
    name: "Triagem de Contato CRM",
    description: "Filtro inicial por departamento de atendimento e canal desejado.",
    icon: Shuffle,
    color: "text-violet-500 bg-violet-50 dark:bg-violet-950/20 dark:text-violet-400"
  },
  {
    key: "igreja",
    name: "Inscrição de Membro",
    description: "Congregações ativas, número de familiares e dados do membro.",
    icon: Users,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400"
  },
  {
    key: "imobiliaria",
    name: "Agendamento Imobiliária",
    description: "Escolha do tipo de imóvel, faixa de orçamento e data de visita.",
    icon: Home,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400"
  }
]

export function WhatsappFlowsCreateForm({ isOpen, onClose }: WhatsappFlowsCreateFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [category, setCategory] = useState("lead_generation")
  const [selectedTemplate, setSelectedTemplate] = useState("blank")
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("O nome do fluxo é obrigatório.")
      return
    }

    // Build URL query string with parameters
    const params = new URLSearchParams()
    params.set("name", name.trim())
    params.set("category", category)
    if (selectedTemplate !== "blank") {
      params.set("template", selectedTemplate)
    }

    // Close modal & route to Visual Builder with params
    onClose()
    router.push(`/admin/whatsapp/flows/create?${params.toString()}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-neutral-800">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              Criar Novo WhatsApp Flow
            </h3>
            <p className="text-xs text-neutral-450 dark:text-neutral-400 mt-1">
              Configure as informações básicas e selecione um ponto de partida para começar a desenhar seu fluxo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5">
          {error && (
            <div className="text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 p-3 rounded-lg border border-rose-100 dark:border-rose-900 flex items-center gap-2">
              <Check className="size-4 shrink-0 rotate-180" />
              <span>{error}</span>
            </div>
          )}

          {/* Flow details row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-400">
                Nome do Fluxo
              </label>
              <Input
                type="text"
                placeholder="Ex: Lead Agendamento Corolla Cross"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-sm font-semibold dark:bg-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-400">
                Categoria do Fluxo
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm h-10 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500/25 font-semibold"
              >
                <option value="lead_generation">Lead Generation (Captação de leads)</option>
                <option value="other">Outros (Suporte, Pesquisa, etc.)</option>
              </select>
            </div>
          </div>

          {/* Template Selection Grid */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-400">
                Selecione o Modelo de Início
              </label>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold">
                <HelpCircle className="size-3.5" />
              Todos os modelos podem ser modificados depois
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[300px] overflow-y-auto p-0.5">
              {templateOptions.map((tpl) => {
                const Icon = tpl.icon
                const isSelected = selectedTemplate === tpl.key
                return (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.key)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none relative group h-[132px] justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/10 shadow-[0_4px_16px_rgba(99,102,241,0.06)] ring-2 ring-indigo-500/10"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-350 dark:hover:border-neutral-700 hover:shadow-xs"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 size-4.5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                        <Check className="size-3" strokeWidth={3} />
                      </div>
                    )}
                    
                    <div className={`size-8 rounded-lg flex items-center justify-center border dark:border-neutral-800 ${tpl.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="size-4.5" />
                    </div>

                    <div className="mt-3.5 leading-snug">
                      <div className={`font-extrabold text-xs transition-colors ${isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-neutral-800 dark:text-neutral-250"}`}>
                        {tpl.name}
                      </div>
                      <p className="text-[9.5px] text-neutral-400 mt-1 line-clamp-2 leading-normal">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t dark:border-neutral-800 mt-6 bg-white dark:bg-neutral-900">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-4.5 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              className="h-9.5 text-xs font-bold gap-1.5 bg-indigo-650 hover:bg-indigo-750 text-white shadow-sm transition-all duration-200"
            >
              Criar Fluxo
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
