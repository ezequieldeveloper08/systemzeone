"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { crmService, Contact, Deal, Pipeline, PipelineStage } from "@/features/crm/services/crmService"
import { vehicleService } from "@/features/vehicles/services/vehicleService"
import {
  Search,
  User,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Inbox,
  Send,
  Save,
  MessageCircle,
  CarIcon,
  Columns,
  ListFilter,
  Layers,
  ListTodo,
  Info,
  DollarSign
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

const getWhatsappLink = (phoneStr: string) => {
  if (!phoneStr) return "#"
  const digits = phoneStr.replace(/\D/g, "")
  const finalPhone = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${finalPhone}`
}

const getStageColorClasses = (stage: PipelineStage, index: number) => {
  if (stage.isWonStage) {
    return {
      colorClass: "bg-emerald-500 text-white",
      borderColorClass: "border-emerald-200 dark:border-emerald-900/50",
      bgClass: "bg-emerald-50/40 dark:bg-emerald-950/10",
      hoverBgClass: "bg-emerald-50/80 dark:bg-emerald-950/20"
    };
  }
  if (stage.isLostStage) {
    return {
      colorClass: "bg-rose-500 text-white",
      borderColorClass: "border-rose-200 dark:border-rose-900/50",
      bgClass: "bg-rose-50/40 dark:bg-rose-950/10",
      hoverBgClass: "bg-rose-50/80 dark:bg-rose-950/20"
    };
  }
  const colors = [
    { colorClass: "bg-blue-500 text-white", borderColorClass: "border-blue-200 dark:border-blue-900/50", bgClass: "bg-blue-50/40 dark:bg-blue-950/10", hoverBgClass: "bg-blue-50/80 dark:bg-blue-950/20" },
    { colorClass: "bg-amber-500 text-white", borderColorClass: "border-amber-200 dark:border-amber-900/50", bgClass: "bg-amber-50/30 dark:bg-amber-950/5", hoverBgClass: "bg-amber-50/70 dark:bg-amber-950/15" },
    { colorClass: "bg-orange-500 text-white", borderColorClass: "border-orange-200 dark:border-orange-900/50", bgClass: "bg-orange-50/40 dark:bg-orange-950/10", hoverBgClass: "bg-orange-50/80 dark:bg-orange-950/20" },
    { colorClass: "bg-indigo-500 text-white", borderColorClass: "border-indigo-200 dark:border-indigo-900/50", bgClass: "bg-indigo-50/40 dark:bg-indigo-950/10", hoverBgClass: "bg-indigo-50/80 dark:bg-indigo-950/20" },
    { colorClass: "bg-violet-500 text-white", borderColorClass: "border-violet-200 dark:border-violet-900/50", bgClass: "bg-violet-50/40 dark:bg-violet-950/10", hoverBgClass: "bg-violet-50/80 dark:bg-violet-950/20" },
    { colorClass: "bg-fuchsia-500 text-white", borderColorClass: "border-fuchsia-200 dark:border-fuchsia-900/50", bgClass: "bg-fuchsia-50/40 dark:bg-fuchsia-950/10", hoverBgClass: "bg-fuchsia-50/80 dark:bg-fuchsia-950/20" },
  ];
  return colors[index % colors.length];
};

export function PipelineBoard() {
  const { activeTenant } = useAuth()
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  // Drag states
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null)

  // Selected deal for Detail Drawer
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  // Modal form for creating a new Deal/Opportunity
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newDealForm, setNewDealForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    value: "",
    message: "",
    source: "whatsapp",
    vehicleId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load pipelines, deals and vehicles
  const loadData = async (mode: "initial" | "refresh" | "silent" = "initial") => {
    if (!activeTenant?.id) return
    if (mode === "initial") setLoading(true)
    if (mode === "refresh") setRefreshing(true)
    setError(null)

    try {
      const [pipelinesData, dealsData, vehiclesData] = await Promise.all([
        crmService.getPipelines(),
        crmService.getDeals(),
        vehicleService.getAllVehicles(activeTenant.id).catch(() => []),
      ])
      setPipelines(pipelinesData)
      const defaultPipeline = pipelinesData.find(p => p.isDefault) || pipelinesData[0] || null
      setActivePipeline(defaultPipeline)
      setDeals(dealsData)
      setVehicles(vehiclesData)
    } catch (err) {
      console.error("Erro ao carregar dados do pipeline:", err)
      if (mode !== "silent") {
        setError("Não foi possível carregar as informações do pipeline comercial.")
      }
    } finally {
      if (mode === "initial") setLoading(false)
      if (mode === "refresh") setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData("initial")

    // Polling background reload every 10 seconds
    const interval = setInterval(() => {
      loadData("silent")
    }, 10000)

    return () => clearInterval(interval)
  }, [activeTenant])

  // Selected deal details
  const selectedDeal = useMemo(() => {
    return deals.find((d) => d.id === selectedDealId) || null
  }, [deals, selectedDealId])

  useEffect(() => {
    if (selectedDeal) {
      setNotes(selectedDeal.description || "")
    } else {
      setNotes("")
    }
  }, [selectedDealId, deals])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDealId(id)
    e.dataTransfer.setData("text/plain", id)
    const target = e.target as HTMLElement
    setTimeout(() => {
      target.style.opacity = "0.4"
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = "1"
    setDraggedDealId(null)
    setDraggedOverStage(null)
  }

  const handleDragOverColumn = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedOverStage !== stageId) {
      setDraggedOverStage(stageId)
    }
  }

  const handleDragLeaveColumn = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropColumn = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault()
    const dealId = draggedDealId || e.dataTransfer.getData("text/plain")
    if (!dealId) return

    setDraggedOverStage(null)

    const dealToUpdate = deals.find((d) => d.id === dealId)
    if (!dealToUpdate || dealToUpdate.stageId === targetStageId) return

    // Optimistic UI Update
    const originalDeals = [...deals]
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stageId: targetStageId } : d))
    )

    try {
      const updated = await crmService.updateDeal(dealId, { stageId: targetStageId })
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updated : d)))
    } catch (err) {
      console.error("Erro ao mover negócio via drag and drop:", err)
      setDeals(originalDeals)
      alert("Falha ao mover o negócio. Tente novamente.")
    }
  }

  // Update deal stage or status from dropdown
  const handleUpdateStage = async (dealId: string, newStageId: string) => {
    try {
      const updated = await crmService.updateDeal(dealId, { stageId: newStageId })
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updated : d)))
    } catch (err) {
      console.error("Erro ao atualizar etapa do negócio:", err)
      alert("Erro ao salvar a etapa.")
    }
  }

  // Save notes/description from drawer
  const handleSaveNotes = async () => {
    if (!selectedDealId) return
    setIsSavingNotes(true)
    try {
      const updated = await crmService.updateDeal(selectedDealId, { description: notes })
      setDeals((prev) => prev.map((d) => (d.id === selectedDealId ? updated : d)))
    } catch (err) {
      console.error("Erro ao salvar observações do negócio:", err)
      alert("Erro ao salvar observações.")
    } finally {
      setIsSavingNotes(false)
    }
  }

  // Delete deal
  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Excluir esta oportunidade permanentemente?")) return
    try {
      await crmService.deleteDeal(dealId)
      setDeals((prev) => prev.filter((d) => d.id !== dealId))
      setSelectedDealId(null)
    } catch (err) {
      console.error("Erro ao deletar oportunidade:", err)
      alert("Erro ao deletar oportunidade.")
    }
  }

  // Create Deal/Opportunity (Resolving or creating Contact first)
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDealForm.name || !newDealForm.phone || !newDealForm.title) {
      alert("Preencha os campos obrigatórios (Nome, Telefone e Título).")
      return
    }

    setIsSubmitting(true)
    try {
      let contactId = ""
      const contacts = await crmService.getContacts({ q: newDealForm.phone })
      const existing = contacts.find(c => c.phone.replace(/\D/g, "") === newDealForm.phone.replace(/\D/g, ""))

      if (existing) {
        contactId = existing.id
      } else {
        const contact = await crmService.createContact({
          name: newDealForm.name,
          phone: newDealForm.phone,
          email: newDealForm.email || null,
          source: newDealForm.source as any,
          notes: newDealForm.message || null,
        })
        contactId = contact.id
      }

      await crmService.createDeal({
        contactId,
        title: newDealForm.title,
        description: newDealForm.message || null,
        value: Number(newDealForm.value || 0),
        vehicleId: newDealForm.vehicleId || null,
        pipelineId: activePipeline?.id,
        stageId: activePipeline?.stages[0]?.id,
      })

      await loadData()
      setIsCreateOpen(false)
      setNewDealForm({
        name: "",
        email: "",
        phone: "",
        title: "",
        value: "",
        message: "",
        source: "whatsapp",
        vehicleId: "",
      })
    } catch (err: any) {
      console.error("Erro ao criar negócio:", err)
      alert(err.message || "Erro ao cadastrar negócio.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date helper
  const formatDateRelative = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const diffMs = Date.now() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return "Hoje"
      if (diffDays === 1) return "Ontem"
      if (diffDays < 7) return `${diffDays} dias atrás`

      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    } catch {
      return dateStr
    }
  }

  // Filtered deals list
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        (deal.title || "").toLowerCase().includes(query) ||
        (deal.description || "").toLowerCase().includes(query) ||
        (deal.contact?.name || "").toLowerCase().includes(query) ||
        (deal.contact?.email || "").toLowerCase().includes(query) ||
        (deal.contact?.phone || "").toLowerCase().includes(query) ||
        (deal.vehicle?.title || "").toLowerCase().includes(query)

      const matchesSource = sourceFilter === "all" || (deal.contact?.source || "") === sourceFilter

      return matchesSearch && matchesSource
    })
  }, [deals, searchQuery, sourceFilter])

  // Group filtered deals by stage
  const groupedDeals = useMemo(() => {
    const groups: Record<string, Deal[]> = {}
    if (activePipeline) {
      activePipeline.stages.forEach(stage => {
        groups[stage.id] = []
      })
    }
    filteredDeals.forEach((deal) => {
      if (groups[deal.stageId]) {
        groups[deal.stageId].push(deal)
      } else {
        const firstStageId = activePipeline?.stages[0]?.id
        if (firstStageId && groups[firstStageId]) {
          groups[firstStageId].push(deal)
        }
      }
    })
    return groups
  }, [filteredDeals, activePipeline])

  // Calculate sum of vehicle prices in each stage
  const stageValues = useMemo(() => {
    const values: Record<string, number> = {}
    if (activePipeline) {
      activePipeline.stages.forEach(stage => {
        values[stage.id] = 0
      })
    }
    deals.forEach((deal) => {
      if (deal.vehicle?.price && values[deal.stageId] !== undefined) {
        values[deal.stageId] += deal.vehicle.price
      }
    })
    return values
  }, [deals, activePipeline])

  // Get source label/color helper
  const getSourceBadge = (source: string) => {
    switch (source) {
      case "WHATSAPP":
      case "whatsapp":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
      case "WEBSITE":
      case "website":
        return "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30"
      case "SHOWROOM":
      case "showroom":
        return "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30"
      case "WEBMOTORS":
      case "webmotors":
        return "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30"
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
    }
  }

  return (
    <div className="space-y-6 min-h-screen flex flex-col pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-neutral-900 p-2 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
              <Columns className="size-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              CRM Comercial (Pipeline)
            </h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Gerencie o progresso das suas negociações arrastando os negócios entre as fases de venda.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/leads">
            <Button
              variant="outline"
              className="flex items-center gap-1.5 h-10 border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <ListTodo className="size-4" />
              Contatos
            </Button>
          </Link>

          <Button
            onClick={() => loadData("refresh")}
            variant="outline"
            className="flex items-center gap-1.5 h-10 border-neutral-200 dark:border-neutral-800"
            disabled={refreshing}
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 h-10 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm"
          >
            <Plus className="size-4" />
            Novo Negócio
          </Button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por cliente, negócio, veículo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-neutral-950 text-sm h-10 border-neutral-200 dark:border-neutral-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <ListFilter className="size-3.5" />
            Filtrar Origem:
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
          >
            <option value="all">Todas as Origens</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="website">Website</option>
            <option value="showroom">Showroom</option>
            <option value="webmotors">WebMotors</option>
          </select>
        </div>
      </div>

      {/* PIPELINE KANBAN BOARD */}
      {loading ? (
        <div className="flex gap-5 overflow-x-auto pb-4 flex-1">
          {[1, 2, 3, 4, 5].map((id) => (
            <div
              key={id}
              className="w-[320px] shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-neutral-900/20 p-4 space-y-4"
            >
              <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-neutral-100 dark:bg-neutral-800/50 rounded animate-pulse w-1/2" />
              <div className="space-y-3 pt-4">
                <div className="h-28 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 animate-pulse" />
                <div className="h-28 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-5 items-start flex-1 overflow-x-auto pb-4">
          {activePipeline?.stages.map((stage, idx) => {
            const stageDeals = groupedDeals[stage.id] || []
            const stageVal = stageValues[stage.id] || 0
            const isOver = draggedOverStage === stage.id
            const colors = getStageColorClasses(stage, idx)

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOverColumn(e, stage.id)}
                onDragLeave={handleDragLeaveColumn}
                onDrop={(e) => handleDropColumn(e, stage.id)}
                className={`w-[320px] shrink-0 rounded-xl border transition-all flex flex-col max-h-[720px] ${isOver
                  ? "border-neutral-400 bg-neutral-100/50 dark:border-neutral-700 dark:bg-neutral-800/20 scale-[1.01]"
                  : `${colors.borderColorClass} ${colors.bgClass}`
                  }`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-1.5 shrink-0 bg-white/50 dark:bg-neutral-900/10 rounded-t-xl backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">
                      {stage.name}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-neutral-500 font-semibold mt-0.5">
                    <DollarSign className="size-3.5 text-neutral-400" />
                    <span>Estoque: </span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0
                      }).format(stageVal)}
                    </span>
                  </div>
                </div>

                {/* Column Body - Cards List */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[350px]">
                  {stageDeals.length > 0 ? (
                    stageDeals.map((deal) => {
                      const hasVehicle = !!deal.vehicle
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedDealId(deal.id)}
                          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 cursor-grab active:cursor-grabbing transition-all group space-y-3 relative overflow-hidden"
                        >
                          {/* Card Top / Ident */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col min-w-0">
                              <h4 className="font-extrabold text-sm text-neutral-950 dark:text-white truncate">
                                {deal.title}
                              </h4>
                              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1 block mt-0.5">
                                {deal.contact?.name}
                              </span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider shrink-0 self-start ${getSourceBadge(deal.contact?.source || "")}`}>
                              {deal.contact?.source || "manual"}
                            </span>
                          </div>

                          {/* Vehicle Details */}
                          {hasVehicle ? (
                            <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 p-2 rounded-lg shrink-0">
                              {deal.vehicle!.images && deal.vehicle!.images.length > 0 ? (
                                <img
                                  src={deal.vehicle!.images[0]}
                                  alt={deal.vehicle!.title}
                                  className="size-10 rounded-md object-cover border border-neutral-100 dark:border-neutral-800"
                                />
                              ) : (
                                <div className="size-10 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-400">
                                  <CarIcon className="size-4" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1 leading-normal">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                                  {deal.vehicle!.brand}
                                </span>
                                <h4 className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">
                                  {deal.vehicle!.title}
                                </h4>
                                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(deal.vehicle!.price)}
                                </span>
                              </div>
                            </div>
                          ) : deal.value > 0 ? (
                            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 px-2 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-900">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase">Valor Negócio:</span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deal.value)}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 py-1 px-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg text-center font-mono">
                              Sem Veículo / Valor Não Definido
                            </div>
                          )}

                          {/* Notes snippet */}
                          {deal.description && (
                            <div className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-2 bg-neutral-50/40 dark:bg-neutral-950/20 p-2 rounded border border-neutral-100/50 dark:border-neutral-800/40 italic">
                              "{deal.description}"
                            </div>
                          )}

                          {/* Card Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="size-2.5" />
                              {formatDateRelative(deal.createdAt)}
                            </span>

                            {deal.contact?.phone && (
                              <a
                                href={getWhatsappLink(deal.contact.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="size-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/40 dark:border-emerald-900/20 transition-colors shadow-2xs"
                                title="Iniciar WhatsApp"
                              >
                                <MessageCircle className="size-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-400/60 border-2 border-dashed border-neutral-200/40 dark:border-neutral-800/30 rounded-xl min-h-[150px]">
                      <Inbox className="size-7 text-neutral-300 dark:text-neutral-800 mb-1" />
                      <p className="text-[10px] font-semibold">Sem Oportunidades</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DETAIL DRAWER / SLIDE OVER PANEL */}
      {selectedDeal && (
        <>
          {/* Overlay background */}
          <div
            onClick={() => setSelectedDealId(null)}
            className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer body */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                  {selectedDeal.contact?.name.substring(0, 1) || "N"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                    {selectedDeal.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                    <span>Cliente:</span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-200">
                      {selectedDeal.contact?.name}
                    </span>
                    <span className="mx-0.5">•</span>
                    <span>Criado em: {new Date(selectedDeal.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDealId(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Status & Stage Selector */}
              <div className="space-y-2 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/80">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Estágio da Oportunidade
                </label>
                <select
                  value={selectedDeal.stageId}
                  onChange={(e) => handleUpdateStage(selectedDeal.id, e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  {activePipeline?.stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>{stg.name}</option>
                  ))}
                </select>
              </div>

              {/* Direct Communication Buttons */}
              {selectedDeal.contact?.phone && (
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={getWhatsappLink(selectedDeal.contact.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-2xs"
                  >
                    <MessageCircle className="size-4 shrink-0" />
                    Chamar WhatsApp
                  </a>
                  <a
                    href={selectedDeal.contact.email ? `mailto:${selectedDeal.contact.email}` : "#"}
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-950 font-bold text-sm text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    <Mail className="size-4 shrink-0" />
                    Enviar E-mail
                  </a>
                </div>
              )}

              {/* Contact Data Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Informações do Contato
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-800 rounded-xl leading-normal">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Celular / WhatsApp
                    </span>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 select-all block mt-0.5">
                      {selectedDeal.contact?.phone ? formatPhoneToMask(selectedDeal.contact.phone) : "Não informado"}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-800 rounded-xl leading-normal">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      E-mail
                    </span>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 select-all block truncate mt-0.5" title={selectedDeal.contact?.email || ""}>
                      {selectedDeal.contact?.email || "Não informado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Vehicle of Interest */}
              {selectedDeal.vehicle ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CarIcon className="size-3.5" />
                    Veículo de Interesse
                  </h4>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-950 flex items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                    {selectedDeal.vehicle.images && selectedDeal.vehicle.images.length > 0 ? (
                      <img
                        src={selectedDeal.vehicle.images[0]}
                        alt={selectedDeal.vehicle.title}
                        className="size-16 rounded-lg object-cover border border-neutral-100 dark:border-neutral-800 shrink-0"
                      />
                    ) : (
                      <div className="size-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-400 shrink-0">
                        <CarIcon className="size-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {selectedDeal.vehicle.brand} • {selectedDeal.vehicle.year}
                      </span>
                      <h5 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {selectedDeal.vehicle.title}
                      </h5>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedDeal.vehicle.price)}
                      </div>
                    </div>
                    <Link
                      href={`/admin/vehicles`}
                      className="size-8 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-800 shrink-0 transition-colors"
                      title="Ver Veículos"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CarIcon className="size-3.5" />
                    Veículo de Interesse
                  </h4>
                  <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400/80">
                    Nenhum veículo vinculado. Interesse geral.
                  </div>
                </div>
              )}

              {/* Internal CRM notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    Observações da Oportunidade
                  </h4>
                  {isSavingNotes && (
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <RefreshCw className="size-3 animate-spin" />
                      Salvando...
                    </span>
                  )}
                </div>
                <textarea
                  placeholder="Escreva anotações internas sobre o andamento da oportunidade comercial..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[110px] p-3.5 rounded-xl border border-neutral-200 bg-white text-xs focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 resize-y leading-relaxed"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotes}
                    className="h-9 px-3 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center gap-1 rounded-lg text-xs"
                  >
                    <Save className="size-3.5" />
                    Salvar Observações
                  </Button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex items-center justify-between shrink-0">
              <Button
                onClick={() => handleDeleteDeal(selectedDeal.id)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 text-xs h-9 flex items-center gap-1"
              >
                <Trash2 className="size-3.5" />
                Excluir Negócio
              </Button>

              <Button
                onClick={() => setSelectedDealId(null)}
                className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 text-xs h-9"
              >
                Concluído
              </Button>
            </div>
          </div>
        </>
      )}

      {/* CREATE MODAL / DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-neutral-950 dark:text-white text-lg">Criar Oportunidade (Deal)</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Título da Oportunidade <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Compra de Tracker pelo Carlos"
                    value={newDealForm.title}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Nome do Cliente <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Nome completo do cliente"
                    value={newDealForm.name}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    value={newDealForm.phone}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, phone: formatPhoneToMask(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="ex@cliente.com"
                    value={newDealForm.email}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Valor Estimado (R$)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 85000"
                    value={newDealForm.value}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, value: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Origem do Contato
                  </label>
                  <select
                    value={newDealForm.source}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, source: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    <option value="whatsapp">WhatsApp Concessionária</option>
                    <option value="website">Website / Formulário</option>
                    <option value="showroom">Showroom / Físico</option>
                    <option value="webmotors">Webmotors</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Veículo de Interesse
                  </label>
                  <select
                    value={newDealForm.vehicleId}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    <option value="">-- Sem veículo específico --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.year}) - R$ {v.price.toLocaleString("pt-BR")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Mensagem / Observação Inicial
                  </label>
                  <textarea
                    placeholder="Escreva detalhes da oportunidade..."
                    value={newDealForm.message}
                    onChange={(e) => setNewDealForm((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full min-h-[80px] p-3.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                  {isSubmitting ? "Criando..." : "Criar Oportunidade"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
