"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { crmService } from "@/features/crm/services/crmService"
import { vehicleService } from "@/features/vehicles/services/vehicleService"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  Inbox,
  Clock,
  RefreshCw,
  Tag
} from "lucide-react"

const formatPhoneToMask = (phoneStr: string) => {
  if (!phoneStr) return ""
  let clean = phoneStr.replace(/\D/g, "")
  if (clean.startsWith("55") && (clean.length === 12 || clean.length === 13)) {
    clean = clean.substring(2)
  }
  if (clean.length <= 2) {
    return clean.length > 0 ? `(${clean}` : ""
  }
  if (clean.length <= 6) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2)}`
  }
  if (clean.length <= 10) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6)}`
  }
  return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`
}

export function LeadsList() {
  const { activeTenant } = useAuth()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeActionId, setActiveActionId] = useState<string | null>(null)

  // Filters and search states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "negotiation" | "won" | "lost">("all")
  const [sortBy, setSortBy] = useState<"newest" | "name">("newest")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Load contacts and deals
  const loadData = async (showRefreshIndicator = false) => {
    if (!activeTenant?.id) return
    if (showRefreshIndicator) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [contactsData, dealsData] = await Promise.all([
        crmService.getContacts(),
        crmService.getDeals(),
      ])

      // Map contacts to include their deals and vehicle of interest
      const mappedContacts = contactsData.map((contact) => {
        const contactDeals = dealsData.filter((d) => d.contactId === contact.id)
        const dealWithVehicle = contactDeals.find((d) => d.vehicle !== null)
        return {
          ...contact,
          deals: contactDeals,
          vehicle: dealWithVehicle ? dealWithVehicle.vehicle : null,
        }
      })

      setContacts(mappedContacts)
    } catch (err) {
      console.error("Erro ao obter contatos:", err)
      setError("Não foi possível carregar a lista de contatos.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTenant])

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy])

  // Close action menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveActionId(null)
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  // Handle delete contact
  const handleDelete = async (contactId: string) => {
    if (confirm("Tem certeza de que deseja excluir este contato permanentemente? Todos os negócios vinculados também serão afetados.")) {
      try {
        await crmService.deleteContact(contactId)
        setContacts((prev) => prev.filter((c) => c.id !== contactId))
        setSelectedIds((prev) => prev.filter((id) => id !== contactId))
        setActiveActionId(null)
      } catch (err: any) {
        alert(err.message || "Erro ao excluir contato.")
      }
    }
  }

  // Memoized filter stats
  const stats = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter((c) => c.status === "NEW").length,
      negotiation: contacts.filter((c) => ["IN_SERVICE", "WAITING_CUSTOMER", "QUALIFIED", "NEGOTIATION", "PROPOSAL_SENT"].includes(c.status)).length,
      won: contacts.filter((c) => c.status === "WON" || c.status === "ACTIVE" || c.lifecycleStage === "CUSTOMER").length,
      lost: contacts.filter((c) => c.status === "LOST").length,
    }
  }, [contacts])

  // Filtered and sorted contacts
  const processedContacts = useMemo(() => {
    let result = contacts.filter((lead) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        lead.name.toLowerCase().includes(query) ||
        (lead.email || "").toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        (lead.vehicle?.title || "").toLowerCase().includes(query)

      if (!matchesSearch) return false

      // 2. Tab Filter
      if (statusFilter === "all") return true
      if (statusFilter === "new") return lead.status === "NEW"
      if (statusFilter === "negotiation") return ["IN_SERVICE", "WAITING_CUSTOMER", "QUALIFIED", "NEGOTIATION", "PROPOSAL_SENT"].includes(lead.status)
      if (statusFilter === "won") return lead.status === "WON" || lead.status === "ACTIVE" || lead.lifecycleStage === "CUSTOMER"
      if (statusFilter === "lost") return lead.status === "LOST"

      return true
    })

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [contacts, searchQuery, statusFilter, sortBy])

  // Pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedContacts = processedContacts.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.max(1, Math.ceil(processedContacts.length / itemsPerPage))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedContacts.map((c) => c.id))
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  // Get lifecycle status label
  const getLifecycleLabel = (stage: string) => {
    const labels: Record<string, string> = {
      LEAD: "Lead",
      MQL: "MQL",
      SQL: "SQL",
      OPPORTUNITY: "Oportunidade",
      CUSTOMER: "Cliente",
      INACTIVE_CUSTOMER: "Cliente Inativo",
      EVANGELIST: "Promotor",
      OTHER: "Outro"
    }
    return labels[stage] || stage
  }

  // Get status pill style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      case "IN_SERVICE":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "WAITING_CUSTOMER":
        return "bg-yellow-50 text-yellow-850 border-yellow-250 dark:bg-yellow-900/20 dark:text-yellow-455 dark:border-yellow-850"
      case "QUALIFIED":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
      case "NEGOTIATION":
        return "bg-orange-50 text-orange-750 border-orange-250 dark:bg-orange-900/30 dark:text-orange-455 dark:border-orange-850"
      case "PROPOSAL_SENT":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
      case "WON":
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
      case "LOST":
      case "INACTIVE":
      case "BLOCKED":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "Novo"
      case "IN_SERVICE":
        return "Em Atendimento"
      case "WAITING_CUSTOMER":
        return "Aguardando Cliente"
      case "QUALIFIED":
        return "Qualificado"
      case "NEGOTIATION":
        return "Em Negociação"
      case "PROPOSAL_SENT":
        return "Proposta Enviada"
      case "WON":
        return "Ganho"
      case "LOST":
        return "Perdido"
      case "ACTIVE":
        return "Ativo (Cliente)"
      case "INACTIVE":
        return "Inativo"
      case "BLOCKED":
        return "Bloqueado"
      default:
        return status
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "WHATSAPP":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
      case "WEBSITE":
        return "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30"
      case "MANUAL":
        return "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30"
      case "OTHER":
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-neutral-900 p-2 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Contatos e Leads (CRM)
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Gerencie seus contatos comerciais, histórico de atendimento e preferências de veículos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadData(true)}
            variant="outline"
            className="flex items-center gap-1.5 h-9 border-neutral-200 dark:border-neutral-800"
            disabled={refreshing}
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button asChild className="h-9 gap-1.5 font-semibold text-sm px-4 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
            <Link href="/admin/leads/new">
              <Plus className="size-4" />
              Adicionar Contato
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-neutral-50 p-1 dark:bg-neutral-950">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "new"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Novos ({stats.new})
            </button>
            <button
              onClick={() => setStatusFilter("negotiation")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "negotiation"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Em Atendimento ({stats.negotiation})
            </button>
            <button
              onClick={() => setStatusFilter("won")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "won"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Clientes ({stats.won})
            </button>
            <button
              onClick={() => setStatusFilter("lost")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "lost"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Perdidos ({stats.lost})
            </button>
          </div>

          {/* Search controls */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
              <Input
                placeholder="Filtrar contatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <option value="name">Nome (A-Z)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
                  <ArrowUpDown className="size-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACTS TABLE CONTAINER */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <span className="size-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white" />
        </div>
      ) : paginatedContacts.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <Inbox className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Nenhum contato encontrado.</p>
          <p className="text-xs text-neutral-450 mt-0.5">Tente ajustar seus termos de busca ou filtros.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in duration-200">
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full border-collapse text-left text-sm text-neutral-500 dark:text-neutral-400">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="w-12 px-6 py-4">
                    <Checkbox
                      checked={
                        paginatedContacts.length > 0 &&
                        paginatedContacts.every((c) => selectedIds.includes(c.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">Contato</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Fase do CRM</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Interesse</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Origem</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Criado em</th>
                  <th scope="col" className="w-12 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {paginatedContacts.map((contact, index) => {
                  const isSelected = selectedIds.includes(contact.id)
                  const isMenuOpen = activeActionId === contact.id
                  const openUpwards = index >= Math.max(0, paginatedContacts.length - 2)

                  return (
                    <tr
                      key={contact.id}
                      className={`transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-850/20 ${
                        isSelected ? "bg-neutral-50/50 dark:bg-neutral-800/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(contact.id, checked)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-50">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                            {contact.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate">{contact.name}</span>
                            <span className="text-xs text-neutral-400 truncate">{formatPhoneToMask(contact.phone)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs text-neutral-700 dark:text-neutral-300">
                        {getLifecycleLabel(contact.lifecycleStage)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold inline-flex ${getStatusBadge(contact.status)}`}>
                          {getStatusLabel(contact.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-neutral-850 dark:text-neutral-200">
                        {contact.vehicle ? (
                          <div className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                            <span>{contact.vehicle.brand} {contact.vehicle.model}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic font-normal">Nenhum veículo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${getSourceBadge(contact.source)}`}>
                          {contact.source.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-400">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right" style={{ position: "relative", overflow: "visible" }}>
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveActionId(isMenuOpen ? null : contact.id)
                            }}
                            className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <MoreHorizontal className="size-4 text-neutral-400" />
                          </button>

                          {/* Flyout actions menu */}
                          {isMenuOpen && (
                            <div
                              className={`absolute right-0 z-50 w-44 rounded-lg border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 ${
                                openUpwards ? "bottom-full mb-1 origin-bottom-right animate-in slide-in-from-bottom-2" : "top-full mt-1 origin-top-right animate-in slide-in-from-top-2"
                              }`}
                              style={{ zIndex: 9999 }}
                            >
                              <Link
                                href={`/admin/leads/${contact.id}`}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                              >
                                <Eye className="size-3.5" />
                                Ver Detalhes
                              </Link>
                              <Link
                                href={`/admin/leads/edit/${contact.id}`}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                              >
                                <Edit2 className="size-3.5" />
                                Editar
                              </Link>
                              <Link
                                href={`/admin/whatsapp/chat?phone=${contact.phone}&name=${encodeURIComponent(contact.name)}`}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-450 dark:hover:bg-emerald-950/20"
                              >
                                <MessageCircle className="size-3.5" />
                                WhatsApp Chat
                              </Link>
                              <button
                                onClick={() => handleDelete(contact.id)}
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
              Mostrando <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{processedContacts.length > 0 ? startIndex + 1 : 0}</strong> a{" "}
              <strong className="font-semibold text-neutral-900 dark:text-neutral-50">
                {Math.min(startIndex + itemsPerPage, processedContacts.length)}
              </strong>{" "}
              de <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{processedContacts.length}</strong> contatos
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
