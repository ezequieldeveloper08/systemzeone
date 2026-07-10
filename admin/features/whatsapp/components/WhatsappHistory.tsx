"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { whatsappService } from "../services/whatsappService"
import { WhatsappMessageLog, WhatsappTemplate } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import {
  History,
  Search,
  Send,
  Check,
  CheckCheck,
  AlertTriangle,
  Play,
  User,
  Phone,
  RefreshCw,
  Info
} from "lucide-react"

export function WhatsappHistory() {
  const { activeTenant } = useAuth()
  const [logs, setLogs] = useState<WhatsappMessageLog[]>([])
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // Simulator Form States
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [variables, setVariables] = useState<Record<string, string>>({})

  // Fetch data
  const loadLogs = async () => {
    if (activeTenant) {
      try {
        const data = await whatsappService.getHistory(activeTenant.id)
        setLogs(data)
      } catch (err) {
        console.error("Erro ao obter logs:", err)
      }
    }
  }

  const loadTemplates = async () => {
    if (activeTenant) {
      try {
        const data = await whatsappService.getTemplates()
        setTemplates(data.filter(t => t.status === "APPROVED"))
      } catch (err) {
        console.error("Erro ao obter templates:", err)
      }
    }
  }

  useEffect(() => {
    if (activeTenant) {
      setLoading(true)
      Promise.all([loadLogs(), loadTemplates()]).finally(() => {
        setLoading(false)
      })
    }
  }, [activeTenant])

  // Selected template object
  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId)
  }, [selectedTemplateId, templates])

  // Reset/setup variables inputs when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialVars: Record<string, string> = {}
      selectedTemplate.variables.forEach((_, index) => {
        initialVars[String(index + 1)] = ""
      })
      setVariables(initialVars)
    } else {
      setVariables({})
    }
  }, [selectedTemplate])

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const query = searchTerm.toLowerCase()
      return (
        log.recipientName.toLowerCase().includes(query) ||
        log.recipientPhone.includes(query) ||
        log.templateName.toLowerCase().includes(query)
      )
    })
  }, [logs, searchTerm])

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTenant || !selectedTemplate || !recipientName.trim() || !recipientPhone.trim()) return

    setSending(true)
    try {
      await whatsappService.sendTemplate(
        recipientName,
        recipientPhone.replace(/\D/g, ""), // clean non-digits for Meta
        selectedTemplate.name,
        variables
      )

      // Reset simulator inputs
      setRecipientName("")
      setRecipientPhone("")
      setSelectedTemplateId("")
      
      // Reload logs to see the new entry
      await loadLogs()

      alert("Disparo enviado via API Oficial Meta com sucesso!")
    } catch (err: any) {
      alert(err.message || "Erro ao disparar template.")
    } finally {
      setSending(false)
    }
  }

  const getStatusIcon = (status: WhatsappMessageLog["status"], errMsg?: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            <Check className="size-3 text-neutral-400" /> Enviado
          </span>
        )
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <CheckCheck className="size-3 text-blue-400" /> Entregue
          </span>
        )
      case "read":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCheck className="size-3 text-emerald-600 dark:text-emerald-400" /> Lido
          </span>
        )
      case "failed":
        return (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 cursor-help"
            title={errMsg || "Erro no envio"}
          >
            <AlertTriangle className="size-3" /> Falhou
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Histórico e Simulador de Disparos
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Gerencie o registro de mensagens enviadas e simule disparos automáticos da API Oficial.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* SIMULATOR PANEL */}
        <div className="lg:col-span-1 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 h-fit">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 mb-4">
            <Play className="size-4.5 text-emerald-600" />
            Disparo de Template (Meta)
          </h2>
          <form onSubmit={handleSimulate} className="space-y-4">
            {/* Recipient Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <User className="size-3 text-neutral-500" />
                Nome do Destinatário
              </label>
              <Input
                type="text"
                placeholder="Ex: Carlos Alberto"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>

            {/* Recipient Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="size-3 text-neutral-500" />
                Telefone Celular (com DDI e DDD)
              </label>
              <Input
                type="tel"
                placeholder="Ex: 5511999998888"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                required
              />
            </div>

            {/* Select Template */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Modelo de Mensagem
              </label>
              <Select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Selecione um modelo...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Dynamic Variables Inputs */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <div className="space-y-3 p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
                <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Variáveis do Template
                </h4>
                {selectedTemplate.variables.map((vLabel, idx) => {
                  const varNum = String(idx + 1)
                  return (
                    <div key={idx} className="space-y-1">
                      <label className="text-[10px] font-semibold text-neutral-400">
                        {"{{"}{varNum}{"}}"} - {vLabel}
                      </label>
                      <Input
                        type="text"
                        placeholder={`Inserir ${vLabel.toLowerCase()}...`}
                        value={variables[varNum] || ""}
                        onChange={(e) =>
                          setVariables({ ...variables, [varNum]: e.target.value })
                        }
                        required
                        className="h-8.5 text-xs"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            <Button
              type="submit"
              disabled={!selectedTemplateId || sending}
              className="w-full gap-1.5 h-9.5 font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {sending ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {sending ? "Disparando..." : "Disparar Template"}
            </Button>
          </form>
        </div>

        {/* LOG HISTORY LIST */}
        <div className="lg:col-span-2 space-y-4">
          {/* SEARCH BAR */}
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
              <Input
                id="log-search"
                type="text"
                placeholder="Filtrar por destinatário, telefone ou template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={loadLogs}
              className="h-9 gap-1.5 font-semibold text-xs dark:bg-neutral-900"
            >
              <RefreshCw className="size-3.5" /> Atualizar
            </Button>
          </div>

          {/* LOGS TABLE / CARDS */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs font-semibold text-neutral-400 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-950/20">
                    <th className="px-5 py-3">Destinatário</th>
                    <th className="px-5 py-3">Template</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-800/10">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {log.recipientName}
                          </div>
                          <div className="text-xs text-neutral-400">{log.recipientPhone}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                            {log.templateName}
                          </div>
                          {/* Variables details */}
                          <div className="text-[10px] text-neutral-400 mt-1 max-w-[200px] truncate" title={JSON.stringify(log.variables)}>
                            {Object.values(log.variables).join(" | ")}
                          </div>
                        </td>
                        <td className="px-5 py-3">{getStatusIcon(log.status, log.errorMessage)}</td>
                        <td className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(log.sentAt).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-neutral-400">
                        <History className="size-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                        Nenhum registro de disparo encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
