"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { whatsappService } from "../services/whatsappService"
import { WhatsappTemplate } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  HelpCircle,
  RefreshCw
} from "lucide-react"

export function WhatsappTemplates() {
  const { activeTenant } = useAuth()
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // New Template form states
  const [name, setName] = useState("")
  const [category, setCategory] = useState<"UTILITY" | "MARKETING" | "AUTHENTICATION">("UTILITY")
  const [bodyText, setBodyText] = useState("")
  const [headerText, setHeaderText] = useState("")
  const [footerText, setFooterText] = useState("")

  const loadTemplates = async () => {
    if (activeTenant) {
      setLoading(true)
      try {
        const data = await whatsappService.getTemplates()
        setTemplates(data)
      } catch (err) {
        console.error("Erro ao carregar templates:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [activeTenant])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const data = await whatsappService.syncTemplates()
      setTemplates(data)
      alert("Templates sincronizados da Meta com sucesso!")
    } catch (err: any) {
      alert(err.message || "Erro ao sincronizar templates.")
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja remover este modelo oficial? Esta ação tentará excluí-lo na Meta e no banco local.")) {
      return
    }
    setLoading(true)
    try {
      await whatsappService.deleteTemplate(id)
      await loadTemplates()
      alert("Template removido com sucesso!")
    } catch (err: any) {
      alert(err.message || "Erro ao remover o template.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await whatsappService.addTemplate({
        name,
        category,
        language: "pt_BR",
        bodyText,
        headerText,
        footerText,
      })
      
      setName("")
      setCategory("UTILITY")
      setBodyText("")
      setHeaderText("")
      setFooterText("")
      setIsOpen(false)
      
      await loadTemplates()
      alert("Modelo enviado para aprovação na Meta com sucesso!")
    } catch (err: any) {
      alert(err.message || "Erro ao criar modelo de mensagem.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: WhatsappTemplate["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle2 className="size-3" /> Aprovado
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Clock className="size-3" /> Pendente (Meta)
          </span>
        )
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="size-3" /> Rejeitado
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Modelos de Mensagem (Templates)
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Configure e sincronize os modelos de mensagens pré-aprovados da Meta Cloud API para disparos ativos de leads.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="gap-1.5 font-semibold text-sm h-9 dark:bg-neutral-900"
          >
            <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar da Meta
          </Button>
          <Button onClick={() => setIsOpen(true)} className="gap-1.5 font-semibold text-sm h-9">
            <Plus className="size-4" /> Criar Modelo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400 gap-2">
          <RefreshCw className="size-6 animate-spin text-neutral-400" />
          <span>Carregando templates...</span>
        </div>
      ) : (
        /* TEMPLATE GRID */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="space-y-3">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 truncate" title={tpl.name}>
                      {tpl.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {tpl.category} • {tpl.language}
                    </span>
                  </div>
                  <div className="shrink-0">{getStatusBadge(tpl.status)}</div>
                </div>

                {/* Message Preview Container */}
                <div className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3.5 dark:border-neutral-800/60 dark:bg-neutral-950/40">
                  {tpl.headerText && (
                    <div className="font-bold text-xs text-neutral-800 dark:text-neutral-200 mb-1 border-b border-neutral-200/50 pb-1 dark:border-neutral-800">
                      {tpl.headerText}
                    </div>
                  )}
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {tpl.bodyText}
                  </p>
                  {tpl.footerText && (
                    <div className="text-[10px] text-neutral-400 mt-1.5 pt-1.5 border-t border-neutral-200/50 dark:border-neutral-800">
                      {tpl.footerText}
                    </div>
                  )}

                  {/* Quick Action Buttons display */}
                  {tpl.buttons && tpl.buttons.length > 0 && (
                    <div className="mt-3.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex flex-wrap gap-1.5">
                      {tpl.buttons.map((btn, bIdx) => (
                        <span key={bIdx} className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-medium text-neutral-500 border border-neutral-200 shadow-3xs dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400">
                          <MessageSquare className="size-3 text-neutral-400" />
                          {btn.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variables Helper */}
                {tpl.variables.length > 0 && (
                  <div className="text-[10px] text-neutral-400 flex flex-wrap gap-1 items-center">
                    <span className="font-semibold">Variáveis:</span>
                    {tpl.variables.map((v, vIdx) => (
                      <span key={vIdx} className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {"{{"}{vIdx + 1}{"}}"}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(tpl.id)}
                  className="h-8 text-xs font-medium text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 dark:border-red-950/20 dark:hover:bg-red-950/10"
                >
                  <Trash2 className="size-3.5 mr-1" /> Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE DIALOG MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              Novo Modelo de Mensagem
            </h3>
            <p className="text-sm text-neutral-500 mt-1 mb-4 dark:text-neutral-400">
              Crie a estrutura para um novo modelo de disparo. Ele será enviado para aprovação da Meta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Nome do Modelo
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: boas_vindas_vendas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Categoria
                  </label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="UTILITY">Serviço (Utility)</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Autenticação</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Cabeçalho (Opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Confirmação do Pedido"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Corpo da Mensagem
                  </label>
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <HelpCircle className="size-3" /> Use {"{{1}}"}, {"{{2}}"} para variáveis
                  </span>
                </div>
                <Textarea
                  placeholder="Olá {{1}}! Seu cadastro na concessionária {{2}} foi concluído..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Rodapé (Opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Atendimento Automático"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Modelo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
