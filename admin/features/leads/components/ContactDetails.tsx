"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { crmService, Contact, Deal, Task, Appointment, Activity } from "@/features/crm/services/crmService"
import { whatsappService } from "@/features/whatsapp/services/whatsappService"
import { teamService, TeamMember } from "@/features/team/services/teamService"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  Edit2,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CarIcon,
  DollarSign,
  TrendingUp,
  Inbox,
  AlertCircle,
  Flame,
  Tag,
  Briefcase,
  Calendar,
  User,
  CheckCheck,
  Check,
  XCircle,
  CheckSquare,
  MapPin,
  Plus,
  Trash2,
  Activity as ActivityIcon,
  Video,
  X,
  PlusCircle,
  HelpCircle,
  CheckCircle2
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

const toLocalDateTimeString = (dateStr: string) => {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    const tzOffset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
  } catch {
    return ""
  }
}

const getActivityStyles = (type: string) => {
  switch (type) {
    case "NOTE":
      return { icon: Tag, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30" }
    case "CALL":
      return { icon: Phone, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" }
    case "EMAIL":
      return { icon: Mail, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30" }
    case "MEETING":
      return { icon: Video, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" }
    case "TASK_CREATED":
      return { icon: PlusCircle, color: "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800" }
    case "TASK_COMPLETED":
      return { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" }
    case "TASK_CANCELED":
      return { icon: X, color: "text-red-500 bg-red-50 dark:bg-red-950/30" }
    case "APPOINTMENT_CREATED":
      return { icon: Calendar, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" }
    case "APPOINTMENT_RESCHEDULED":
      return { icon: Clock, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" }
    case "APPOINTMENT_CANCELED":
      return { icon: XCircle, color: "text-red-500 bg-red-50 dark:bg-red-950/30" }
    default:
      return { icon: ActivityIcon, color: "text-neutral-500 bg-neutral-50 dark:bg-neutral-900" }
  }
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "LOW": return "Baixa"
    case "MEDIUM": return "Média"
    case "HIGH": return "Alta"
    case "URGENT": return "Urgente"
    default: return priority
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30"
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/30 dark:text-amber-400 dark:border-amber-900/30"
    case "HIGH":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30"
    case "URGENT":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30"
    default:
      return "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-455 dark:border-neutral-850"
  }
}

const isTaskOverdue = (task: Task) => {
  if (task.status === "DONE" || task.status === "CANCELED" || !task.dueDate) return false
  return new Date(task.dueDate) < new Date()
}

const getAptStatusLabel = (status: string) => {
  switch (status) {
    case "SCHEDULED": return "Agendado"
    case "CONFIRMED": return "Confirmado"
    case "COMPLETED": return "Realizado"
    case "NO_SHOW": return "Não Compareceu"
    case "CANCELED": return "Cancelado"
    case "RESCHEDULED": return "Reagendado"
    default: return status
  }
}

const getAptStatusBadge = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30"
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
    case "COMPLETED":
      return "bg-neutral-50 text-neutral-550 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-850"
    case "NO_SHOW":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
    case "CANCELED":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30"
    case "RESCHEDULED":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30"
    default:
      return "bg-neutral-50 text-neutral-700 border-neutral-200"
  }
}

export function ContactDetails({ contactId }: { contactId: string }) {
  const router = useRouter()
  const { activeTenant } = useAuth()

  const [contact, setContact] = useState<Contact | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Expanded Tabs
  const [activeTab, setActiveTab] = useState<"whatsapp" | "deals" | "activities" | "tasks" | "appointments">("whatsapp")

  // New CRM lists
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // Modal toggle states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAptModalOpen, setIsAptModalOpen] = useState(false)
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null)

  // Forms states - Task
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [taskDueDate, setTaskDueDate] = useState("")
  const [taskAssignedTo, setTaskAssignedTo] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)

  // Forms states - Appointment
  const [aptTitle, setAptTitle] = useState("")
  const [aptDescription, setAptDescription] = useState("")
  const [aptLocation, setAptLocation] = useState("")
  const [aptStartAt, setAptStartAt] = useState("")
  const [aptEndAt, setAptEndAt] = useState("")
  const [aptAssignedTo, setAptAssignedTo] = useState("")
  const [isCreatingApt, setIsCreatingApt] = useState(false)
  const [aptError, setAptError] = useState<string | null>(null)

  // Reschedule Form State
  const [newStartAt, setNewStartAt] = useState("")
  const [newEndAt, setNewEndAt] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  // Manual Activity Form State
  const [newActType, setNewActType] = useState<'NOTE' | 'CALL' | 'EMAIL' | 'MEETING'>('NOTE')
  const [newActTitle, setNewActTitle] = useState("")
  const [newActDescription, setNewActDescription] = useState("")
  const [isCreatingAct, setIsCreatingAct] = useState(false)

  // Notes state
  const [notes, setNotes] = useState("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesSuccess, setNotesSuccess] = useState(false)

  // Close service state
  const [closeServiceOpen, setCloseServiceOpen] = useState(false)
  const [closeServiceStatus, setCloseServiceStatus] = useState<"WAITING_CUSTOMER" | "LOST" | "WON">("WAITING_CUSTOMER")
  const [closeServiceReason, setCloseServiceReason] = useState("")
  const [isClosingService, setIsClosingService] = useState(false)

  const loadContactData = async () => {
    if (!contactId || !activeTenant?.id) return
    setLoading(true)
    setError(null)

    try {
      // Load contact, all deals, and whatsapp messages
      const fetchedContact = await crmService.getContact(contactId)
      setContact(fetchedContact)
      setNotes(fetchedContact.notes || "")

      const [allDeals, chatMessages, fetchedTasks, fetchedApts, fetchedActs, fetchedMembers] = await Promise.all([
        crmService.getDeals(),
        whatsappService.getChatMessages(fetchedContact.phone).catch(() => []),
        crmService.getTasks({ contactId }),
        crmService.getAppointments({ contactId }),
        crmService.getActivities({ contactId }),
        teamService.getMembers().catch(() => []),
      ])

      // Filter deals for this contact
      const contactDeals = allDeals.filter((d) => d.contactId === contactId)
      setDeals(contactDeals)

      // Sort messages by creation date
      const sortedMessages = chatMessages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      setMessages(sortedMessages)

      // Set lists
      setTasks(fetchedTasks)
      setAppointments(fetchedApts)
      setActivities(fetchedActs)
      setTeamMembers(fetchedMembers)
    } catch (err) {
      console.error("Erro ao carregar detalhes do contato:", err)
      setError("Não foi possível carregar a ficha completa do contato.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContactData()
  }, [contactId, activeTenant])

  // ----------------------------------------------------
  // Handlers - Tasks
  // ----------------------------------------------------
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !contact) return
    setIsCreatingTask(true)
    try {
      await crmService.createTask({
        contactId: contact.id,
        title: taskTitle,
        description: taskDescription || null,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assignedToUserId: taskAssignedTo || null,
      })
      setTaskTitle("")
      setTaskDescription("")
      setTaskPriority("MEDIUM")
      setTaskDueDate("")
      setTaskAssignedTo("")
      setIsTaskModalOpen(false)
      
      // Reload tasks & activities
      const [fetchedTasks, fetchedActs] = await Promise.all([
        crmService.getTasks({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setTasks(fetchedTasks)
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao criar tarefa.")
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!contact) return
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    try {
      await crmService.updateTask(taskId, { status: newStatus })
      const [fetchedTasks, fetchedActs] = await Promise.all([
        crmService.getTasks({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setTasks(fetchedTasks)
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status da tarefa.")
    }
  }

  const handleCancelTask = async (taskId: string) => {
    if (!contact) return
    if (!confirm("Deseja realmente cancelar esta tarefa?")) return
    try {
      await crmService.updateTask(taskId, { status: "CANCELED" })
      const [fetchedTasks, fetchedActs] = await Promise.all([
        crmService.getTasks({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setTasks(fetchedTasks)
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao cancelar tarefa.")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!contact) return
    if (!confirm("Deseja realmente excluir esta tarefa permanentemente?")) return
    try {
      await crmService.deleteTask(taskId)
      const [fetchedTasks, fetchedActs] = await Promise.all([
        crmService.getTasks({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setTasks(fetchedTasks)
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao excluir tarefa.")
    }
  }

  // ----------------------------------------------------
  // Handlers - Appointments
  // ----------------------------------------------------
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aptTitle.trim() || !aptStartAt || !aptEndAt || !contact) return
    setIsCreatingApt(true)
    setAptError(null)
    try {
      await crmService.createAppointment({
        contactId: contact.id,
        dealId: deals[0]?.id || null,
        title: aptTitle,
        description: aptDescription || null,
        location: aptLocation || null,
        startAt: new Date(aptStartAt).toISOString(),
        endAt: new Date(aptEndAt).toISOString(),
        assignedToUserId: aptAssignedTo || null,
      })
      setAptTitle("")
      setAptDescription("")
      setAptLocation("")
      setAptStartAt("")
      setAptEndAt("")
      setAptAssignedTo("")
      setIsAptModalOpen(false)

      const [fetchedApts, fetchedActs] = await Promise.all([
        crmService.getAppointments({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setAppointments(fetchedApts)
      setActivities(fetchedActs)
    } catch (err: any) {
      setAptError(err.message || "Erro ao agendar compromisso.")
    } finally {
      setIsCreatingApt(false)
    }
  }

  const handleUpdateAptStatus = async (aptId: string, newStatus: string) => {
    if (!contact) return
    try {
      await crmService.updateAppointment(aptId, { status: newStatus as any })
      const [fetchedApts, fetchedActs] = await Promise.all([
        crmService.getAppointments({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setAppointments(fetchedApts)
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status do compromisso.")
    }
  }

  const handleCancelApt = async (aptId: string) => {
    if (!contact) return
    if (!confirm("Deseja realmente cancelar este compromisso?")) return
    try {
      await crmService.cancelAppointment(aptId)
      const [fetchedApts, fetchedActs] = await Promise.all([
        crmService.getAppointments({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setAppointments(fetchedApts)
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao cancelar compromisso.")
    }
  }

  const handleRescheduleApt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reschedulingApt || !newStartAt || !newEndAt || !contact) return
    setIsRescheduling(true)
    setRescheduleError(null)
    try {
      await crmService.updateAppointment(reschedulingApt.id, {
        startAt: new Date(newStartAt).toISOString(),
        endAt: new Date(newEndAt).toISOString(),
      })
      setNewStartAt("")
      setNewEndAt("")
      setReschedulingApt(null)

      const [fetchedApts, fetchedActs] = await Promise.all([
        crmService.getAppointments({ contactId: contact.id }),
        crmService.getActivities({ contactId: contact.id }),
      ])
      setAppointments(fetchedApts)
      setActivities(fetchedActs)
    } catch (err: any) {
      setRescheduleError(err.message || "Erro ao reagendar compromisso.")
    } finally {
      setIsRescheduling(false)
    }
  }

  // ----------------------------------------------------
  // Handlers - Activities (Manual Logging)
  // ----------------------------------------------------
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActTitle.trim() || !contact) return
    setIsCreatingAct(true)
    try {
      await crmService.createActivity({
        contactId: contact.id,
        dealId: deals[0]?.id || null,
        type: newActType as any,
        title: newActTitle,
        description: newActDescription || null,
      })
      setNewActTitle("")
      setNewActDescription("")
      setNewActType("NOTE")

      const fetchedActs = await crmService.getActivities({ contactId: contact.id })
      setActivities(fetchedActs)
    } catch (err: any) {
      alert(err.message || "Erro ao registrar atividade.")
    } finally {
      setIsCreatingAct(false)
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  const handleSaveNotes = async () => {
    if (!contact) return
    setIsSavingNotes(true)
    setNotesSuccess(false)
    try {
      await crmService.updateContact(contact.id, { notes: notes || null })
      setContact((prev) => prev ? { ...prev, notes: notes || null } : null)
      setNotesSuccess(true)
      setTimeout(() => setNotesSuccess(false), 3000)
    } catch (err) {
      console.error("Erro ao salvar observações:", err)
      alert("Não foi possível salvar as anotações.")
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleCloseService = async () => {
    if (!contact) return
    setIsClosingService(true)
    try {
      const updatePayload: Partial<Contact> = {
        status: closeServiceStatus as any,
      }
      if (closeServiceReason.trim()) {
        updatePayload.notes = contact.notes
          ? `${contact.notes}\n\n[Finalização - ${new Date().toLocaleDateString("pt-BR")}]: ${closeServiceReason}`
          : `[Finalização - ${new Date().toLocaleDateString("pt-BR")}]: ${closeServiceReason}`
      }
      if (closeServiceStatus === "LOST" && closeServiceReason.trim()) {
        updatePayload.lostReason = closeServiceReason
      }
      const updated = await crmService.updateContact(contact.id, updatePayload)
      setContact(updated)
      setNotes(updated.notes || "")
      setCloseServiceOpen(false)
      setCloseServiceReason("")
    } catch (err) {
      console.error("Erro ao finalizar atendimento:", err)
      alert("Não foi possível finalizar o atendimento.")
    } finally {
      setIsClosingService(false)
    }
  }

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
      case "NEW": return "Novo"
      case "IN_SERVICE": return "Em Atendimento"
      case "WAITING_CUSTOMER": return "Aguardando Cliente"
      case "QUALIFIED": return "Qualificado"
      case "NEGOTIATION": return "Em Negociação"
      case "PROPOSAL_SENT": return "Proposta Enviada"
      case "WON": return "Ganho"
      case "LOST": return "Perdido"
      case "ACTIVE": return "Cliente Ativo"
      case "INACTIVE": return "Cliente Inativo"
      case "BLOCKED": return "Bloqueado"
      default: return status
    }
  }

  const getTemperatureBadge = (temp: string) => {
    switch (temp) {
      case "HOT":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
      case "WARM":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30"
      case "COLD":
      default:
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30"
    }
  }

  const getTemperatureLabel = (temp: string) => {
    switch (temp) {
      case "HOT": return "Quente (Hot)"
      case "WARM": return "Morno (Warm)"
      case "COLD":
      default: return "Frio (Cold)"
    }
  }

  const getSourceLabel = (src: string) => {
    switch (src) {
      case "WHATSAPP": return "WhatsApp"
      case "WEBSITE": return "Website / Formulário"
      case "MANUAL": return "Manual (Showroom)"
      case "OTHER": return "Anúncio Externo"
      default: return src
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white" />
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900/30 dark:bg-red-950/10 dark:text-red-400 max-w-xl mx-auto mt-10">
        <AlertCircle className="size-8 mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-lg">Erro ao carregar contato</h3>
        <p className="text-sm mt-1">{error || "Contato não encontrado."}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/admin/leads">
            Voltar para Contatos
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* TOP HEADER BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ChevronLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-lg uppercase shadow-sm">
              {contact.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
                  {contact.name}
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(contact.status)}`}>
                  {getStatusLabel(contact.status)}
                </span>
              </div>
              <p className="text-xs text-neutral-450 mt-0.5">
                Contato desde {new Date(contact.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Close Service Button - show when contact is active/in service */}
          {["NEW", "IN_SERVICE", "WAITING_CUSTOMER", "QUALIFIED", "NEGOTIATION", "PROPOSAL_SENT"].includes(contact.status) && (
            <Button
              onClick={() => setCloseServiceOpen(true)}
              variant="outline"
              className="h-9 gap-1.5 text-xs font-semibold px-4 rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-950/20"
            >
              <XCircle className="size-3.5" />
              Finalizar Atendimento
            </Button>
          )}

          <Button asChild variant="outline" className="h-9 gap-1.5 text-xs font-semibold px-4 rounded-lg">
            <Link href={`/admin/leads/edit/${contact.id}`}>
              <Edit2 className="size-3.5" />
              Editar Contato
            </Link>
          </Button>

          <Button asChild className="h-9 gap-1.5 text-xs font-semibold px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm">
            <Link href={`/admin/whatsapp/chat?phone=${contact.phone}&name=${encodeURIComponent(contact.name)}`}>
              <MessageCircle className="size-4" />
              WhatsApp Chat
            </Link>
          </Button>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN (2/3 width) - Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Details */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
              <User className="size-4" />
              Informações Cadastrais
            </h3>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Nome Completo</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{contact.name}</span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Nome de Exibição / Apelido</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{contact.displayName || <span className="italic font-normal text-neutral-400">Não informado</span>}</span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Telefone</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block select-all">{formatPhoneToMask(contact.phone)}</span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">E-mail</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block select-all truncate" title={contact.email || ""}>
                  {contact.email || <span className="italic font-normal text-neutral-400">Não informado</span>}
                </span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Tipo de Pessoa</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                  {contact.type === "COMPANY" ? "Pessoa Jurídica" : "Pessoa Física"}
                </span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Documento ({contact.documentType || "CPF"})</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block select-all">{contact.document || <span className="italic font-normal text-neutral-400">Não informado</span>}</span>
              </div>
              {contact.type === "COMPANY" && (
                <>
                  <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                    <span className="text-xs text-neutral-400 font-medium block">Razão Social / Empresa</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{contact.companyName || <span className="italic font-normal text-neutral-400">Não informado</span>}</span>
                  </div>
                  <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                    <span className="text-xs text-neutral-400 font-medium block">Cargo</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{contact.jobTitle || <span className="italic font-normal text-neutral-400">Não informado</span>}</span>
                  </div>
                </>
              )}
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Origem de Cadastro</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{getSourceLabel(contact.source)}</span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-medium block">Detalhes da Origem</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{contact.sourceDetails || <span className="italic font-normal text-neutral-400">Sem detalhes</span>}</span>
              </div>
            </div>
          </div>

          {/* TABBED TIMELINE SECTION */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            {/* Tabs Header */}
            <div className="border-b border-neutral-200 bg-neutral-50/50 px-6 py-2 dark:border-neutral-800 dark:bg-neutral-950/40 flex items-center justify-between overflow-x-auto">
              <div className="flex gap-4 whitespace-nowrap min-w-max">
                <button
                  onClick={() => setActiveTab("whatsapp")}
                  className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "whatsapp"
                      ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Histórico WhatsApp ({messages.length})
                </button>
                <button
                  onClick={() => setActiveTab("deals")}
                  className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "deals"
                      ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Oportunidades Funil ({deals.length})
                </button>
                <button
                  onClick={() => setActiveTab("activities")}
                  className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "activities"
                      ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Atividades ({activities.length})
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "tasks"
                      ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Tarefas ({tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELED').length})
                </button>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "appointments"
                      ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  Compromissos ({appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'RESCHEDULED').length})
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              
              {/* TAB: WHATSAPP MESSAGES TIMELINE */}
              {activeTab === "whatsapp" && (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Inbox className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">Sem mensagens registradas</h4>
                      <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">
                        Este contato ainda não enviou mensagens nem recebeu disparos oficiais do WhatsApp.
                      </p>
                      <Button asChild className="mt-4 h-8 text-xs font-semibold px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" size="sm">
                        <Link href={`/admin/whatsapp/chat?phone=${contact.phone}&name=${encodeURIComponent(contact.name)}`}>
                          Iniciar WhatsApp Chat
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto pr-1 space-y-4">
                      {messages.map((msg) => {
                        const isOutbound = msg.messageDirection === "outbound"
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-xl p-3.5 border shadow-2xs leading-relaxed text-sm ${
                                isOutbound
                                  ? "bg-neutral-950 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-neutral-200"
                                  : "bg-neutral-50 text-neutral-800 border-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-850"
                              }`}
                            >
                              {msg.messageType === "image" && msg.variables?.imageUrl && (
                                <div className="mb-2 max-w-sm overflow-hidden rounded-lg">
                                  <img
                                    src={msg.variables.imageUrl}
                                    alt="Mídia WhatsApp"
                                    className="max-h-48 w-full object-cover"
                                  />
                                </div>
                              )}
                              {msg.messageType === "audio" && msg.variables?.audioUrl && (
                                <div className="mb-2">
                                  <audio controls src={msg.variables.audioUrl} className="max-w-xs" />
                                </div>
                              )}
                              <p className="whitespace-pre-line text-xs font-medium">{msg.bodyText}</p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-450 mt-1 px-1">
                              <span>{formatDate(msg.createdAt)}</span>
                              {isOutbound && (
                                <span className="inline-flex">
                                  {msg.status === "read" ? (
                                    <CheckCheck className="size-3.5 text-blue-500" />
                                  ) : msg.status === "delivered" ? (
                                    <CheckCheck className="size-3.5 text-neutral-400" />
                                  ) : msg.status === "failed" ? (
                                    <span className="text-red-500 font-bold" title={msg.errorMessage || ""}>! Falhou</span>
                                  ) : (
                                    <Check className="size-3.5 text-neutral-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: DEALS / OPPORTUNITIES */}
              {activeTab === "deals" && (
                <div className="space-y-4">
                  {deals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Briefcase className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">Sem negócios ativos</h4>
                      <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">
                        Nenhuma oportunidade ou negócio foi aberto para este contato até o momento.
                      </p>
                      <Button asChild className="mt-4 h-8 text-xs font-semibold px-4 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950" size="sm">
                        <Link href="/admin/crm">
                          Ir para o Kanban (Criar Negócio)
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {deals.map((deal) => {
                        const statusColors = {
                          OPEN: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
                          WON: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400",
                          LOST: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
                          CANCELED: "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                        }
                        
                        return (
                          <div
                            key={deal.id}
                            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between hover:border-neutral-350 transition-colors"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                                  {deal.title}
                                </h4>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${statusColors[deal.status]}`}>
                                  {deal.status}
                                </span>
                              </div>

                              <span className="text-[10px] text-neutral-400 font-semibold block mt-1">
                                Estágio: <strong className="text-neutral-700 dark:text-neutral-300">{deal.stage?.name || "Funil Comercial"}</strong>
                              </span>

                              {/* Vehicle interest */}
                              {deal.vehicle ? (
                                <div className="mt-3 flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-lg border border-neutral-100 dark:border-neutral-850">
                                  {deal.vehicle.images && deal.vehicle.images.length > 0 ? (
                                    <img
                                      src={deal.vehicle.images[0]}
                                      alt={deal.vehicle.title}
                                      className="size-10 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="size-10 bg-neutral-100 dark:bg-neutral-850 rounded flex items-center justify-center text-neutral-400 shrink-0">
                                      <CarIcon className="size-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1 leading-tight">
                                    <span className="text-[9px] text-neutral-400 font-bold uppercase">{deal.vehicle.brand}</span>
                                    <h5 className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">{deal.vehicle.title}</h5>
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                      R$ {deal.vehicle.price.toLocaleString("pt-BR")}
                                    </span>
                                  </div>
                                </div>
                              ) : deal.value > 0 ? (
                                <div className="mt-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60 px-2 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-850">
                                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Valor Estimado:</span>
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    R$ {deal.value.toLocaleString("pt-BR")}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded p-1 text-center font-mono mt-3">
                                  Sem veículo / valor indefinido
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-850 mt-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {new Date(deal.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                              <Link href="/admin/crm" className="text-neutral-950 font-bold hover:underline dark:text-white flex items-center gap-0.5">
                                Ver Pipeline
                                <ChevronLeft className="size-3 rotate-180" />
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ACTIVITIES / TIMELINE */}
              {activeTab === "activities" && (
                <div className="space-y-6">
                  {/* Manual activity logger */}
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/40 p-4 dark:border-neutral-800 dark:bg-neutral-950/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Registrar Nova Atividade</h4>
                    <form onSubmit={handleCreateActivity} className="space-y-3">
                      {/* Activity Type selectors */}
                      <div className="flex flex-wrap gap-2">
                        {([
                          { type: "NOTE", label: "Nota", icon: Tag },
                          { type: "CALL", label: "Ligação", icon: Phone },
                          { type: "EMAIL", label: "E-mail", icon: Mail },
                          { type: "MEETING", label: "Reunião", icon: Video },
                        ] as const).map((opt) => {
                          const Icon = opt.icon
                          const isActive = newActType === opt.type
                          return (
                            <button
                              key={opt.type}
                              type="button"
                              onClick={() => setNewActType(opt.type)}
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                                isActive
                                  ? "bg-neutral-950 text-white border-neutral-950 dark:bg-white dark:text-neutral-950 dark:border-white shadow-xs"
                                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:bg-neutral-850"
                              }`}
                            >
                              <Icon className="size-3.5" />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* Inputs */}
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          required
                          placeholder="Título da atividade (ex: Ligação de acompanhamento, Visita ao Showroom...)"
                          value={newActTitle}
                          onChange={(e) => setNewActTitle(e.target.value)}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                        />
                        <Textarea
                          placeholder="Observações ou notas detalhadas sobre o contato..."
                          value={newActDescription}
                          onChange={(e) => setNewActDescription(e.target.value)}
                          className="min-h-[70px] text-xs bg-white border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isCreatingAct}
                          className="h-8 text-xs font-semibold px-4 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm shrink-0"
                          size="sm"
                        >
                          {isCreatingAct ? (
                            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            "Registrar"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Linha de Tempo</h4>
                    {activities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                        <ActivityIcon className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                        <h5 className="font-semibold text-neutral-700 dark:text-neutral-300 text-xs">Sem atividades registradas</h5>
                        <p className="text-[11px] text-neutral-400 max-w-xs mt-1 leading-relaxed">
                          Ainda não há registros de atividades ou notas para este contato.
                        </p>
                      </div>
                    ) : (
                      <div className="relative pl-6 border-l border-neutral-200 dark:border-neutral-800 ml-4 space-y-5 py-2">
                        {activities.map((act) => {
                          const style = getActivityStyles(act.type)
                          const Icon = style.icon
                          return (
                            <div key={act.id} className="relative group transition-all">
                              {/* Left Bullet Icon */}
                              <div className={`absolute -left-[35px] top-1 flex size-6 items-center justify-center rounded-full border border-neutral-205 dark:border-neutral-800 shadow-2xs ${style.color}`}>
                                <Icon className="size-3" />
                              </div>

                              {/* Timeline Content Card */}
                              <div className="rounded-xl border border-neutral-150 bg-white p-3.5 hover:border-neutral-300 dark:border-neutral-850 dark:bg-neutral-950/60 transition-colors shadow-3xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                  <h5 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                                    {act.title}
                                  </h5>
                                  <span className="text-[10px] text-neutral-400 font-medium">
                                    {formatDateTime(act.createdAt)}
                                  </span>
                                </div>

                                {act.description && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">
                                    {act.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-end text-[9px] text-neutral-450 font-mono mt-2">
                                  <span>Por: {act.user?.name || "Sistema"}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: TASKS / TAREFAS */}
              {activeTab === "tasks" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Gerenciador de Tarefas</h4>
                    <Button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="h-8 text-xs font-bold px-3 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center gap-1 shadow-sm"
                      size="sm"
                    >
                      <Plus className="size-3.5" />
                      Nova Tarefa
                    </Button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                      <CheckSquare className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">Sem tarefas criadas</h4>
                      <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed font-normal">
                        Nenhuma tarefa pendente ou concluída para este contato. Crie uma para organizar suas ações.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Active / Pending Tasks */}
                      {tasks.filter(t => t.status !== "DONE" && t.status !== "CANCELED").length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">Pendentes</h5>
                          <div className="space-y-2.5">
                            {tasks.filter(t => t.status !== "DONE" && t.status !== "CANCELED").map((task) => {
                              const member = teamMembers.find(m => m.id === task.assignedToUserId)
                              const overdue = isTaskOverdue(task)
                              return (
                                <div
                                  key={task.id}
                                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-950 flex items-start justify-between gap-3 hover:border-neutral-350 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Toggle Checkbox Button */}
                                    <button
                                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                      className="mt-0.5 rounded border border-neutral-300 text-neutral-400 hover:text-neutral-800 dark:border-neutral-700 dark:hover:text-neutral-300 flex size-4.5 shrink-0 items-center justify-center transition-all bg-white dark:bg-neutral-900 cursor-pointer"
                                      title="Concluir tarefa"
                                    >
                                      <Check className="size-3.5 opacity-0 hover:opacity-100 transition-opacity text-emerald-600" />
                                    </button>

                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="font-bold text-sm text-neutral-900 dark:text-white">
                                          {task.title}
                                        </h5>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getPriorityBadge(task.priority)}`}>
                                          {getPriorityLabel(task.priority)}
                                        </span>
                                        {overdue && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold border border-red-205 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-405 dark:border-red-900/30 flex items-center gap-0.5">
                                            <AlertCircle className="size-2.5" />
                                            Atrasada
                                          </span>
                                        )}
                                      </div>

                                      {task.description && (
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-400 mt-2 font-medium">
                                        {task.dueDate && (
                                          <span className={`flex items-center gap-1 ${overdue ? "text-red-500 font-semibold" : ""}`}>
                                            <Clock className="size-3" />
                                            Vence em: {formatDateTime(task.dueDate)}
                                          </span>
                                        )}
                                        {member && (
                                          <span className="flex items-center gap-1">
                                            <User className="size-3" />
                                            Responsável: {member.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                      onClick={() => handleCancelTask(task.id)}
                                      className="rounded-lg p-1.5 text-neutral-450 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                      title="Cancelar Tarefa"
                                    >
                                      <XCircle className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="rounded-lg p-1.5 text-neutral-450 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                      title="Excluir Tarefa"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Completed / Canceled Tasks */}
                      {tasks.filter(t => t.status === "DONE" || t.status === "CANCELED").length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">Concluídas & Canceladas</h5>
                          <div className="space-y-2">
                            {tasks.filter(t => t.status === "DONE" || t.status === "CANCELED").map((task) => {
                              const member = teamMembers.find(m => m.id === task.assignedToUserId)
                              const isDone = task.status === "DONE"
                              return (
                                <div
                                  key={task.id}
                                  className="rounded-xl border border-neutral-150 bg-neutral-50/50 p-4 dark:border-neutral-850 dark:bg-neutral-900/20 flex items-start justify-between gap-3 opacity-70 group"
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Toggle Checkbox Button */}
                                    {isDone ? (
                                      <button
                                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                        className="mt-0.5 rounded border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-650 flex size-4.5 shrink-0 items-center justify-center transition-all cursor-pointer hover:scale-105"
                                        title="Reabrir tarefa"
                                      >
                                        <Check className="size-3.5 text-emerald-650 dark:text-emerald-400" />
                                      </button>
                                    ) : (
                                      <div className="mt-0.5 rounded border border-neutral-350 bg-neutral-200 dark:bg-neutral-800 text-neutral-450 flex size-4.5 shrink-0 items-center justify-center">
                                        <X className="size-3 text-neutral-500" />
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className={`font-semibold text-sm leading-tight ${isDone ? "line-through text-neutral-450 dark:text-neutral-500" : "text-neutral-450 italic"}`}>
                                          {task.title}
                                        </h5>
                                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-semibold border ${
                                          isDone 
                                            ? "border-emerald-100 bg-emerald-50/30 text-emerald-600 dark:border-emerald-950/20 dark:text-emerald-500"
                                            : "border-neutral-200 bg-neutral-100 text-neutral-505 dark:border-neutral-800 dark:text-neutral-500"
                                        }`}>
                                          {isDone ? "Concluída" : "Cancelada"}
                                        </span>
                                      </div>

                                      {task.description && (
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 block line-through">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9.5px] text-neutral-400 mt-1 font-medium">
                                        {task.dueDate && (
                                          <span>Prazo: {formatDateTime(task.dueDate)}</span>
                                        )}
                                        {member && (
                                          <span>Responsável: {member.name}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="rounded-lg p-1.5 text-neutral-450 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Excluir tarefa"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: APPOINTMENTS / COMPROMISSOS */}
              {activeTab === "appointments" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Agenda de Compromissos</h4>
                    <Button
                      onClick={() => setIsAptModalOpen(true)}
                      className="h-8 text-xs font-bold px-3 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center gap-1 shadow-sm"
                      size="sm"
                    >
                      <Plus className="size-3.5" />
                      Agendar Compromisso
                    </Button>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                      <Calendar className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">Sem compromissos agendados</h4>
                      <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed font-normal font-sans">
                        Não há reuniões, test-drives ou visitas agendadas com este contato no momento.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {appointments.map((apt) => {
                        const member = teamMembers.find(m => m.id === apt.assignedToUserId)
                        const isActive = apt.status === "SCHEDULED" || apt.status === "CONFIRMED" || apt.status === "RESCHEDULED"
                        
                        return (
                          <div
                            key={apt.id}
                            className="rounded-xl border border-neutral-200 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between hover:border-neutral-350 transition-all gap-4"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                                  {apt.title}
                                </h4>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${getAptStatusBadge(apt.status)}`}>
                                  {getAptStatusLabel(apt.status)}
                                </span>
                              </div>

                              {apt.description && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                                  {apt.description}
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-neutral-600 dark:text-neutral-450 border-t border-neutral-100 dark:border-neutral-850 pt-3">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                                  <span><strong>Início:</strong> {formatDateTime(apt.startAt)}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="size-3.5 text-neutral-400 shrink-0" />
                                  <span><strong>Término:</strong> {formatDateTime(apt.endAt)}</span>
                                </span>
                                {apt.location && (
                                  <span className="flex items-center gap-1.5 sm:col-span-2">
                                    <MapPin className="size-3.5 text-neutral-400 shrink-0" />
                                    <span className="truncate"><strong>Local:</strong> {apt.location}</span>
                                  </span>
                                )}
                                {member && (
                                  <span className="flex items-center gap-1.5 sm:col-span-2">
                                    <User className="size-3.5 text-neutral-400 shrink-0" />
                                    <span><strong>Responsável:</strong> {member.name}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions bar */}
                            {isActive && (
                              <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-850 justify-end">
                                {apt.status === "SCHEDULED" && (
                                  <Button
                                    type="button"
                                    onClick={() => handleUpdateAptStatus(apt.id, "CONFIRMED")}
                                    className="h-7 text-[10px] font-bold px-3 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                                    size="sm"
                                  >
                                    Confirmar
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  onClick={() => handleUpdateAptStatus(apt.id, "COMPLETED")}
                                  className="h-7 text-[10px] font-bold px-3 rounded bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                                  size="sm"
                                >
                                  Concluir
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setReschedulingApt(apt)
                                    setNewStartAt(toLocalDateTimeString(apt.startAt))
                                    setNewEndAt(toLocalDateTimeString(apt.endAt))
                                  }}
                                  className="h-7 text-[10px] font-bold px-3 rounded bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 dark:bg-neutral-900 dark:text-purple-400 dark:border-purple-900/40 dark:hover:bg-purple-950/20"
                                  size="sm"
                                >
                                  Reagendar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleCancelApt(apt.id)}
                                  className="h-7 text-[10px] font-bold px-3 rounded text-red-650 border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-955/20"
                                  size="sm"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 width) - Metrics & Notes */}
        <div className="space-y-6">
          
          {/* Card: Commercial Metrics */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <TrendingUp className="size-4" />
              Métricas do CRM
            </h3>

            <div className="space-y-4">
              <div className="leading-tight">
                <span className="text-xs text-neutral-400 block mb-1">Estágio de Relacionamento</span>
                <span className="inline-flex px-2.5 py-1 rounded-lg border text-xs font-bold bg-neutral-50 text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:border-neutral-850">
                  {getLifecycleLabel(contact.lifecycleStage)}
                </span>
              </div>

              <div className="leading-tight">
                <span className="text-xs text-neutral-400 block mb-1 flex items-center gap-1">
                  <Flame className="size-3.5 text-orange-500" />
                  Temperatura
                </span>
                <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-bold ${getTemperatureBadge(contact.temperature)}`}>
                  {getTemperatureLabel(contact.temperature)}
                </span>
              </div>

              <div className="leading-tight">
                <span className="text-xs text-neutral-400 block mb-1">Lead Score (Pontuação)</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-neutral-900 dark:text-neutral-50">
                    {contact.leadScore || 0} <span className="text-xs text-neutral-400 font-normal">pts</span>
                  </span>
                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-850 overflow-hidden max-w-[120px]">
                    <div
                      className="h-full bg-neutral-950 dark:bg-white"
                      style={{ width: `${Math.min(100, Math.max(0, (contact.leadScore || 0) * 0.8))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Notes Editor */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Tag className="size-4" />
              Anotações Internas
            </h3>

            <div className="space-y-3">
              <Textarea
                placeholder="Escreva anotações, preferências do cliente, carros que ele possui interesse, observações de financiamento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[160px] text-xs leading-relaxed bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850"
              />

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Última alt: {formatDate(contact.updatedAt)}
                </span>
                
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="h-8 text-xs font-semibold px-4 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm shrink-0"
                  size="sm"
                >
                  {isSavingNotes ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : notesSuccess ? (
                    "Salvo!"
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CLOSE SERVICE MODAL */}
      {closeServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Finalizar Atendimento
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Qual foi o resultado deste atendimento?
                </p>
              </div>
              <button
                onClick={() => { setCloseServiceOpen(false); setCloseServiceReason("") }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <XCircle className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Resultado do Atendimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "WAITING_CUSTOMER", label: "Aguardando Cliente", color: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-950/20 dark:text-yellow-400" },
                    { value: "WON", label: "Ganho (Venda Realizada)", color: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400" },
                    { value: "LOST", label: "Perdido (Sem conversão)", color: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCloseServiceStatus(opt.value)}
                      className={`rounded-lg border p-3 text-left text-[11px] font-semibold transition-all leading-tight ${
                        closeServiceStatus === opt.value
                          ? `${opt.color} ring-2 ring-offset-1 ring-current`
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {closeServiceStatus === "LOST" ? "Motivo da Perda (obrigatório)" : "Observação Final (opcional)"}
                </label>
                <textarea
                  placeholder={
                    closeServiceStatus === "LOST"
                      ? "Ex: Cliente optou por outro veículo, preço fora do orçamento..."
                      : "Ex: Contrato assinado, aguardando retorno de proposta..."
                  }
                  value={closeServiceReason}
                  onChange={(e) => setCloseServiceReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs leading-relaxed text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setCloseServiceOpen(false); setCloseServiceReason("") }}
                className="h-9 text-xs font-semibold px-4 rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCloseService}
                disabled={isClosingService || (closeServiceStatus === "LOST" && !closeServiceReason.trim())}
                className={`h-9 text-xs font-semibold px-5 rounded-lg text-white shadow-sm ${
                  closeServiceStatus === "WON"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : closeServiceStatus === "LOST"
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                }`}
              >
                {isClosingService ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Confirmar Finalização"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Nova Tarefa
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Adicione uma tarefa vinculada a este contato
                </p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Enviar proposta de financiamento"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Descrição (Opcional)
                </label>
                <textarea
                  placeholder="Ex: Ligar para verificar se recebeu o e-mail com as taxas..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Prioridade
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Vencimento
                  </label>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Responsável
                </label>
                <select
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="">Nenhum (Sem responsável)</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="h-9 text-xs font-semibold px-4 rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingTask}
                  className="h-9 text-xs font-semibold px-5 rounded-lg text-white bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm"
                >
                  {isCreatingTask ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Criar Tarefa"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE APPOINTMENT MODAL */}
      {isAptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Agendar Compromisso
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Marque uma visita, reunião ou test-drive
                </p>
              </div>
              <button
                onClick={() => { setIsAptModalOpen(false); setAptError(null); }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {aptError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-905/30 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{aptError}</div>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Título do Compromisso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Test-drive Jeep Compass"
                  value={aptTitle}
                  onChange={(e) => setAptTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Descrição (Opcional)
                </label>
                <textarea
                  placeholder="Ex: Trazer termo de responsabilidade para assinatura..."
                  value={aptDescription}
                  onChange={(e) => setAptDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Local / Link Reunião
                </label>
                <input
                  type="text"
                  placeholder="Ex: Showroom, Google Meet, Zoom..."
                  value={aptLocation}
                  onChange={(e) => setAptLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={aptStartAt}
                    onChange={(e) => setAptStartAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Fim *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={aptEndAt}
                    onChange={(e) => setAptEndAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Responsável
                </label>
                <select
                  value={aptAssignedTo}
                  onChange={(e) => setAptAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="">Nenhum (Sem responsável)</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsAptModalOpen(false); setAptError(null); }}
                  className="h-9 text-xs font-semibold px-4 rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingApt}
                  className="h-9 text-xs font-semibold px-5 rounded-lg text-white bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm"
                >
                  {isCreatingApt ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Agendar"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Reagendar Compromisso
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Selecione os novos horários para: <strong className="text-neutral-700 dark:text-neutral-300">{reschedulingApt.title}</strong>
                </p>
              </div>
              <button
                onClick={() => { setReschedulingApt(null); setRescheduleError(null); }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {rescheduleError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{rescheduleError}</div>
              </div>
            )}

            <form onSubmit={handleRescheduleApt} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Novo Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newStartAt}
                    onChange={(e) => setNewStartAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Novo Fim *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEndAt}
                    onChange={(e) => setNewEndAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setReschedulingApt(null); setRescheduleError(null); }}
                  className="h-9 text-xs font-semibold px-4 rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isRescheduling}
                  className="h-9 text-xs font-semibold px-5 rounded-lg text-white bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm"
                >
                  {isRescheduling ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Confirmar Reagendamento"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
