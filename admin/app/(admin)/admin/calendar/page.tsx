"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { crmService, Task, Appointment, Contact } from "@/features/crm/services/crmService"
import { teamService, TeamMember } from "@/features/team/services/teamService"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
  CheckSquare,
  MapPin,
  User,
  AlertCircle,
  X,
  Filter,
  XCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Video,
  Tag,
  Briefcase
} from "lucide-react"

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

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "LOW": return "Baixa"
    case "MEDIUM": return "Média"
    case "HIGH": return "Alta"
    case "URGENT": return "Urgente"
    default: return priority
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
    case "MEDIUM":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-955/20 dark:text-amber-400"
    case "HIGH":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400"
    case "URGENT":
      return "border-red-200 bg-red-50 text-red-750 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-450"
  }
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

const getAptStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
    case "COMPLETED":
      return "border-neutral-200 bg-neutral-50 text-neutral-550 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
    case "NO_SHOW":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400"
    case "CANCELED":
      return "border-red-200 bg-red-50 text-red-755 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
    case "RESCHEDULED":
      return "border-purple-200 bg-purple-50 text-purple-755 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400"
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-600"
  }
}

export default function CalendarPage() {
  const { activeTenant } = useAuth()

  // Data states
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation states
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [activeView, setActiveView] = useState<"month" | "week" | "day">("month")

  // Filter states
  const [showTasks, setShowTasks] = useState(true)
  const [showAppointments, setShowAppointments] = useState(true)
  const [selectedAssignee, setSelectedAssignee] = useState("")

  // Modal / Selection states
  const [selectedEvent, setSelectedEvent] = useState<{ type: "task" | "appointment"; data: any } | null>(null)
  const [createEventDate, setCreateEventDate] = useState<string | null>(null)
  const [createEventType, setCreateEventType] = useState<"task" | "appointment">("task")
  
  // Reschedule state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null)
  const [rescheduleStart, setRescheduleStart] = useState("")
  const [rescheduleEnd, setRescheduleEnd] = useState("")
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [isRescheduling, setIsRescheduling] = useState(false)

  // Contact Search State inside Modals
  const [contactSearch, setContactSearch] = useState("")

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [taskDueDate, setTaskDueDate] = useState("")
  const [taskAssignedTo, setTaskAssignedTo] = useState("")
  const [taskContactId, setTaskContactId] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [taskFormError, setTaskFormError] = useState<string | null>(null)

  // Form states - Appointment
  const [aptTitle, setAptTitle] = useState("")
  const [aptDescription, setAptDescription] = useState("")
  const [aptLocation, setAptLocation] = useState("")
  const [aptStartAt, setAptStartAt] = useState("")
  const [aptEndAt, setAptEndAt] = useState("")
  const [aptAssignedTo, setAptAssignedTo] = useState("")
  const [aptContactId, setAptContactId] = useState("")
  const [isCreatingApt, setIsCreatingApt] = useState(false)
  const [aptFormError, setAptFormError] = useState<string | null>(null)

  // Load calendar events
  const loadData = async () => {
    if (!activeTenant?.id) return
    setLoading(true)
    setError(null)
    try {
      const [fetchedTasks, fetchedApts, fetchedContacts, fetchedMembers] = await Promise.all([
        crmService.getTasks(),
        crmService.getAppointments(),
        crmService.getContacts(),
        teamService.getMembers().catch(() => [])
      ])
      setTasks(fetchedTasks)
      setAppointments(fetchedApts)
      setContacts(fetchedContacts)
      setTeamMembers(fetchedMembers)
    } catch (err) {
      console.error("Erro ao carregar dados da agenda:", err)
      setError("Não foi possível carregar as tarefas e compromissos do calendário.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTenant])

  // Calculated Calendar Grids
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()

    const days = []
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevDays - i),
        isCurrentMonth: false,
      })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }
    return days
  }, [currentDate])

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentDate])

  // Filters Events List
  const filteredEvents = useMemo(() => {
    let result: { type: "task" | "appointment"; start: Date; end: Date; data: any }[] = []

    if (showTasks) {
      tasks.forEach(task => {
        if (!selectedAssignee || task.assignedToUserId === selectedAssignee) {
          const date = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt)
          result.push({
            type: "task",
            start: date,
            end: date,
            data: task
          })
        }
      })
    }

    if (showAppointments) {
      appointments.forEach(apt => {
        if (apt.status !== "CANCELED" && (!selectedAssignee || apt.assignedToUserId === selectedAssignee)) {
          result.push({
            type: "appointment",
            start: new Date(apt.startAt),
            end: new Date(apt.endAt),
            data: apt
          })
        }
      })
    }

    // Sort by date/time
    return result.sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [tasks, appointments, showTasks, showAppointments, selectedAssignee])

  // Get events on a specific day
  const getEventsOnDay = (date: Date) => {
    return filteredEvents.filter(event => {
      return (
        event.start.getFullYear() === date.getFullYear() &&
        event.start.getMonth() === date.getMonth() &&
        event.start.getDate() === date.getDate()
      )
    })
  }

  // Format Helpers
  const formatMonthYear = () => {
    return currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" })
  }

  const navigateTime = (direction: number) => {
    const nextDate = new Date(currentDate)
    if (activeView === "month") {
      nextDate.setMonth(currentDate.getMonth() + direction)
    } else if (activeView === "week") {
      nextDate.setDate(currentDate.getDate() + direction * 7)
    } else {
      nextDate.setDate(currentDate.getDate() + direction)
    }
    setCurrentDate(nextDate)
  }

  const jumpToToday = () => {
    setCurrentDate(new Date())
  }

  // Filters contacts list inside creators modal
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const q = contactSearch.toLowerCase()
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.phone.includes(q) ||
        (contact.email && contact.email.toLowerCase().includes(q))
      )
    })
  }, [contacts, contactSearch])

  // ---------------------------------------------------------------------------
  // Creation Event Actions
  // ---------------------------------------------------------------------------
  const handleOpenCreateModal = (dayDate: Date) => {
    // Standard format for input type="datetime-local"
    const tzOffset = dayDate.getTimezoneOffset() * 60000
    const localDate = new Date(dayDate.getTime() - tzOffset)
    const localISO = localDate.toISOString().slice(0, 16)
    
    setCreateEventDate(localISO)
    setTaskDueDate(localISO)
    setAptStartAt(localISO)
    
    // Default apt end: start + 1 hour
    const end = new Date(dayDate.getTime() - tzOffset + 3600000)
    setAptEndAt(end.toISOString().slice(0, 16))
    
    setCreateEventType("task")
    setTaskTitle("")
    setTaskDescription("")
    setTaskPriority("MEDIUM")
    setTaskAssignedTo("")
    setTaskContactId("")
    setTaskFormError(null)

    setAptTitle("")
    setAptDescription("")
    setAptLocation("")
    setAptAssignedTo("")
    setAptContactId("")
    setAptFormError(null)
    setContactSearch("")
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !taskContactId) {
      setTaskFormError("Título e Contato são campos obrigatórios.")
      return
    }
    setIsCreatingTask(true)
    setTaskFormError(null)
    try {
      await crmService.createTask({
        title: taskTitle,
        description: taskDescription || null,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assignedToUserId: taskAssignedTo || null,
        contactId: taskContactId
      })
      setCreateEventDate(null)
      loadData()
    } catch (err: any) {
      setTaskFormError(err.message || "Erro ao criar tarefa.")
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aptTitle.trim() || !aptStartAt || !aptEndAt || !aptContactId) {
      setAptFormError("Título, Horário de início, fim e Contato são obrigatórios.")
      return
    }
    if (new Date(aptStartAt) >= new Date(aptEndAt)) {
      setAptFormError("O horário de início deve ser anterior ao término.")
      return
    }
    setIsCreatingApt(true)
    setAptFormError(null)
    try {
      await crmService.createAppointment({
        title: aptTitle,
        description: aptDescription || null,
        location: aptLocation || null,
        startAt: new Date(aptStartAt).toISOString(),
        endAt: new Date(aptEndAt).toISOString(),
        assignedToUserId: aptAssignedTo || null,
        contactId: aptContactId
      })
      setCreateEventDate(null)
      loadData()
    } catch (err: any) {
      setAptFormError(err.message || "Erro ao agendar compromisso.")
    } finally {
      setIsCreatingApt(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Action Handlers for Existing Events
  // ---------------------------------------------------------------------------
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    try {
      const updated = await crmService.updateTask(taskId, { status: newStatus })
      setSelectedEvent(prev => prev ? { ...prev, data: updated } : null)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status da tarefa.")
    }
  }

  const handleCancelTask = async (taskId: string) => {
    if (!confirm("Deseja realmente cancelar esta tarefa?")) return
    try {
      const updated = await crmService.updateTask(taskId, { status: "CANCELED" })
      setSelectedEvent(prev => prev ? { ...prev, data: updated } : null)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erro ao cancelar tarefa.")
    }
  }

  const handleUpdateAptStatus = async (aptId: string, newStatus: string) => {
    try {
      const updated = await crmService.updateAppointment(aptId, { status: newStatus as any })
      setSelectedEvent(prev => prev ? { ...prev, data: updated } : null)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status do compromisso.")
    }
  }

  const handleCancelApt = async (aptId: string) => {
    if (!confirm("Deseja realmente cancelar este compromisso?")) return
    try {
      const updated = await crmService.cancelAppointment(aptId)
      setSelectedEvent(prev => prev ? { ...prev, data: updated } : null)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erro ao cancelar compromisso.")
    }
  }

  const handleOpenReschedule = (apt: Appointment) => {
    setReschedulingApt(apt)
    setRescheduleStart(toLocalDateTimeString(apt.startAt))
    setRescheduleEnd(toLocalDateTimeString(apt.endAt))
    setRescheduleError(null)
  }

  const handleRescheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reschedulingApt || !rescheduleStart || !rescheduleEnd) return
    if (new Date(rescheduleStart) >= new Date(rescheduleEnd)) {
      setRescheduleError("O horário de início deve ser anterior ao término.")
      return
    }
    setIsRescheduling(true)
    setRescheduleError(null)
    try {
      await crmService.updateAppointment(reschedulingApt.id, {
        startAt: new Date(rescheduleStart).toISOString(),
        endAt: new Date(rescheduleEnd).toISOString()
      })
      setReschedulingApt(null)
      setSelectedEvent(null)
      loadData()
    } catch (err: any) {
      setRescheduleError(err.message || "Erro ao reagendar compromisso.")
    } finally {
      setIsRescheduling(false)
    }
  }

  // Get active contacts mapping
  const contactMap = useMemo(() => {
    const map = new Map<string, Contact>()
    contacts.forEach(c => map.set(c.id, c))
    return map
  }, [contacts])

  // Get active members mapping
  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>()
    teamMembers.forEach(m => map.set(m.id, m))
    return map
  }, [teamMembers])

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Agenda do CRM
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie propostas, visitas de clientes e tarefas organizadas cronologicamente.
          </p>
        </div>
        <Button
          onClick={() => handleOpenCreateModal(new Date())}
          className="h-10 text-xs font-bold px-4 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Novo Agendamento
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-bold">Ocorreu um erro</h4>
            <p className="mt-1 font-medium">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-neutral-200 rounded-2xl dark:bg-neutral-900 dark:border-neutral-800">
          <span className="size-8 animate-spin rounded-full border-3 border-neutral-900 border-t-transparent dark:border-neutral-100" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Carregando dados da Agenda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* FILTER SIDE PANEL */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Filter className="size-4" />
              Filtros da Agenda
            </div>

            <div className="space-y-4">
              {/* Type checkboxes */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Exibir na Agenda</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAppointments}
                      onChange={(e) => setShowAppointments(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                    Compromissos
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTasks}
                      onChange={(e) => setShowTasks(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                    Tarefas
                  </label>
                </div>
              </div>

              {/* Assignee selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Filtrar por Responsável</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="">Todos os colaboradores</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upcoming events list */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Próximos Compromissos</h3>
              {filteredEvents.filter(e => e.start.getTime() >= new Date().getTime()).slice(0, 3).length === 0 ? (
                <p className="text-xs text-neutral-400 italic">Sem eventos agendados em breve.</p>
              ) : (
                <div className="space-y-2">
                  {filteredEvents
                    .filter(e => e.start.getTime() >= new Date().getTime())
                    .slice(0, 3)
                    .map((event, idx) => {
                      const dateText = event.start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                      const timeText = event.start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                      const isTask = event.type === "task"
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedEvent({ type: event.type, data: event.data })}
                          className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-750 transition-colors cursor-pointer bg-neutral-50/50 dark:bg-neutral-950/20 flex gap-2"
                        >
                          <div className="flex flex-col items-center justify-center shrink-0 w-11 h-11 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200/60 dark:border-neutral-800 text-[10px] leading-tight font-bold">
                            <span className="text-neutral-900 dark:text-neutral-200">{dateText}</span>
                            <span className="text-neutral-400 text-[9px] font-medium">{timeText}</span>
                          </div>
                          <div className="min-w-0 flex-1 leading-tight py-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                              {isTask ? "Tarefa" : "Compromisso"}
                            </span>
                            <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate mt-0.5">
                              {event.data.title}
                            </h5>
                            <span className="text-[10px] text-neutral-450 block truncate mt-1">
                              Contato: {contactMap.get(event.data.contactId)?.name || "N/A"}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* MAIN CALENDAR DISPLAY */}
          <div className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden flex flex-col">
            
            {/* View navigation header */}
            <div className="border-b border-neutral-200 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-250 dark:border-neutral-800 rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => navigateTime(-1)}
                    className="p-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-400 transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={jumpToToday}
                    className="px-3 py-1 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-xs font-bold text-neutral-700 dark:text-neutral-300 border-x border-neutral-250 dark:border-neutral-800 transition-colors"
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => navigateTime(1)}
                    className="p-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-400 transition-colors"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <h3 className="font-extrabold text-sm md:text-base text-neutral-800 dark:text-neutral-100 capitalize">
                  {formatMonthYear()}
                </h3>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg dark:bg-neutral-950/80 max-w-xs self-start md:self-auto">
                {([
                  { id: "month", label: "Mês" },
                  { id: "week", label: "Semana" },
                  { id: "day", label: "Dia" }
                ] as const).map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      activeView === view.id
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-50"
                        : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-255"
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MONTH VIEW CALENDAR GRID */}
            {activeView === "month" && (
              <div className="flex-1 flex flex-col">
                {/* Weekdays row */}
                <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 text-center py-2 bg-neutral-50/20 text-xs font-bold text-neutral-450 dark:text-neutral-500 select-none">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                {/* Day cells grid */}
                <div className="grid grid-cols-7 flex-1 min-h-[500px]">
                  {monthDays.map((cell, idx) => {
                    const cellEvents = getEventsOnDay(cell.date)
                    const isToday = new Date().toDateString() === cell.date.toDateString()
                    
                    return (
                      <div
                        key={idx}
                        className={`min-h-[85px] border-b border-r border-neutral-200/60 dark:border-neutral-800/60 p-2 flex flex-col transition-colors ${
                          cell.isCurrentMonth
                            ? "bg-white dark:bg-neutral-900"
                            : "bg-neutral-50/30 text-neutral-300 dark:bg-neutral-950/20 dark:text-neutral-700"
                        } hover:bg-neutral-50/50 dark:hover:bg-neutral-850/40 relative group`}
                      >
                        {/* Day number */}
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`flex items-center justify-center size-6 rounded-full text-xs font-extrabold ${
                              isToday
                                ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                                : cell.isCurrentMonth
                                ? "text-neutral-800 dark:text-neutral-200"
                                : "text-neutral-300 dark:text-neutral-600"
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>
                          
                          {/* Hover action to schedule */}
                          <button
                            onClick={() => handleOpenCreateModal(cell.date)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-450 dark:text-neutral-500 transition-all"
                            title="Agendar neste dia"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        {/* Events listed */}
                        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 text-[10px] leading-tight max-h-[100px] scrollbar-none">
                          {cellEvents.slice(0, 3).map((event, eventIdx) => {
                            const isTask = event.type === "task"
                            const statusDone = isTask && event.data.status === "DONE"
                            const statusCanceled = isTask && event.data.status === "CANCELED"
                            
                            return (
                              <div
                                key={eventIdx}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedEvent({ type: event.type, data: event.data })
                                }}
                                className={`rounded px-1.5 py-0.5 border font-semibold truncate cursor-pointer transition-transform hover:scale-[1.01] ${
                                  isTask
                                    ? statusDone
                                      ? "border-emerald-100 bg-emerald-50/20 text-emerald-600 line-through dark:border-emerald-950/20 dark:text-emerald-500"
                                      : statusCanceled
                                      ? "border-neutral-200 bg-neutral-100 text-neutral-400 line-through dark:border-neutral-800 dark:bg-neutral-950/30"
                                      : getPriorityColor(event.data.priority)
                                    : getAptStatusColor(event.data.status)
                                }`}
                              >
                                {isTask ? (
                                  <span className="flex items-center gap-0.5">
                                    <CheckSquare className="size-2 shrink-0" />
                                    {event.data.title}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="size-2 shrink-0" />
                                    {event.data.title}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                          
                          {cellEvents.length > 3 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenCreateModal(cell.date) // opens day modal, or simply we can navigate day view
                                setCurrentDate(cell.date)
                                setActiveView("day")
                              }}
                              className="text-[9px] font-bold text-neutral-450 hover:underline cursor-pointer text-center select-none"
                            >
                              + {cellEvents.length - 3} mais
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW: Render columns side-by-side */}
            {activeView === "week" && (
              <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
                {weekDays.map((day, idx) => {
                  const dayEvents = getEventsOnDay(day)
                  const isToday = new Date().toDateString() === day.toDateString()
                  const weekdayLabel = day.toLocaleDateString("pt-BR", { weekday: "short" })

                  return (
                    <div key={idx} className="flex-1 p-4 flex flex-col min-h-[300px] bg-white dark:bg-neutral-900">
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-3 select-none">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 capitalize block">
                            {weekdayLabel}
                          </span>
                          <span className={`text-base font-extrabold mt-0.5 inline-block ${
                            isToday ? "text-blue-600 dark:text-blue-400" : "text-neutral-800 dark:text-neutral-200"
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenCreateModal(day)}
                          className="p-1 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          title="Agendar neste dia"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      {/* Events vertical list */}
                      <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1">
                        {dayEvents.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center py-10">
                            <span className="text-[10px] text-neutral-400 italic">Sem eventos</span>
                          </div>
                        ) : (
                          dayEvents.map((event, eventIdx) => {
                            const isTask = event.type === "task"
                            const statusDone = isTask && event.data.status === "DONE"
                            const statusCanceled = isTask && event.data.status === "CANCELED"
                            const timeText = event.start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                            
                            return (
                              <div
                                key={eventIdx}
                                onClick={() => setSelectedEvent({ type: event.type, data: event.data })}
                                className={`rounded-xl border p-3 cursor-pointer hover:border-neutral-350 dark:hover:border-neutral-750 transition-colors bg-white dark:bg-neutral-950 flex flex-col justify-between gap-1.5 ${
                                  isTask
                                    ? statusDone
                                      ? "border-emerald-100 bg-emerald-50/20 opacity-60 dark:border-emerald-950/20"
                                      : statusCanceled
                                      ? "border-neutral-200 bg-neutral-150 opacity-60 dark:border-neutral-800"
                                      : "border-neutral-150 shadow-3xs"
                                    : "border-neutral-150 shadow-3xs"
                                }`}
                              >
                                <div>
                                  <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold border inline-block mb-1.5 ${
                                    isTask ? getPriorityColor(event.data.priority) : getAptStatusColor(event.data.status)
                                  }`}>
                                    {isTask ? `Tarefa: ${getPriorityLabel(event.data.priority)}` : `Compromisso: ${getAptStatusLabel(event.data.status)}`}
                                  </span>
                                  <h6 className={`text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-snug ${statusDone || statusCanceled ? "line-through text-neutral-400 dark:text-neutral-500" : ""}`}>
                                    {event.data.title}
                                  </h6>
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-neutral-400 font-medium pt-1 border-t border-neutral-50 dark:border-neutral-850">
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="size-2.5" />
                                    {timeText}
                                  </span>
                                  <span className="truncate max-w-[80px]">
                                    {contactMap.get(event.data.contactId)?.name || "Sistema"}
                                  </span>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* DAY VIEW: Hourly breakdown / lists */}
            {activeView === "day" && (
              <div className="flex-1 p-6 space-y-6 bg-white dark:bg-neutral-900">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 select-none">
                  <div>
                    <h4 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                      {currentDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Compromissos e tarefas para o dia selecionado.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenCreateModal(currentDate)}
                    className="h-8 text-xs font-bold px-3 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center gap-1 shadow-sm"
                    size="sm"
                  >
                    <Plus className="size-3.5" />
                    Agendar Neste Dia
                  </Button>
                </div>

                <div className="space-y-4">
                  {getEventsOnDay(currentDate).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                      <CalendarIcon className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">Nenhum agendamento para hoje</h4>
                      <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">
                        Não há tarefas pendentes ou compromissos marcados para este dia específico.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getEventsOnDay(currentDate).map((event, idx) => {
                        const isTask = event.type === "task"
                        const timeText = event.start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        const member = memberMap.get(event.data.assignedToUserId)
                        const contact = contactMap.get(event.data.contactId)
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedEvent({ type: event.type, data: event.data })}
                            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-950 hover:border-neutral-350 transition-all cursor-pointer flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                                  {event.data.title}
                                </h4>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${
                                  isTask ? getPriorityColor(event.data.priority) : getAptStatusColor(event.data.status)
                                }`}>
                                  {isTask ? `Tarefa: ${getPriorityLabel(event.data.priority)}` : `Compromisso: ${getAptStatusLabel(event.data.status)}`}
                                </span>
                              </div>

                              {event.data.description && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                                  {event.data.description}
                                </p>
                              )}

                              <div className="grid grid-cols-1 gap-1.5 text-xs text-neutral-600 dark:text-neutral-450 border-t border-neutral-100 dark:border-neutral-850 pt-3 mt-3">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="size-3.5 text-neutral-450 shrink-0" />
                                  <span>
                                    <strong>Horário:</strong> {timeText} 
                                    {!isTask && ` até ${new Date(event.data.endAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                                  </span>
                                </span>
                                {event.data.location && (
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-neutral-450 shrink-0" />
                                    <span><strong>Local:</strong> {event.data.location}</span>
                                  </span>
                                )}
                                {contact && (
                                  <span className="flex items-center gap-1.5">
                                    <Users className="size-3.5 text-neutral-450 shrink-0" />
                                    <span><strong>Contato:</strong> {contact.name} ({contact.phone})</span>
                                  </span>
                                )}
                                {member && (
                                  <span className="flex items-center gap-1.5">
                                    <User className="size-3.5 text-neutral-400 shrink-0" />
                                    <span><strong>Responsável:</strong> {member.name}</span>
                                  </span>
                                )}
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
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL (NEW TASK / APPOINTMENT) */}
      {createEventDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Agendar Evento do CRM
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Preencha os dados e escolha se é tarefa ou compromisso.
                </p>
              </div>
              <button
                onClick={() => setCreateEventDate(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Event type switch selector */}
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-lg dark:bg-neutral-950/80 mb-5">
              <button
                type="button"
                onClick={() => setCreateEventType("task")}
                className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                  createEventType === "task"
                    ? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400"
                }`}
              >
                Tarefa (Task)
              </button>
              <button
                type="button"
                onClick={() => setCreateEventType("appointment")}
                className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                  createEventType === "appointment"
                    ? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400"
                }`}
              >
                Compromisso (Visita/Meet)
              </button>
            </div>

            {/* FORM TAREFA */}
            {createEventType === "task" && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                {taskFormError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 font-semibold">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div>{taskFormError}</div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Título da Tarefa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ligar para confirmar proposta comercial"
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
                    placeholder="Ex: Verificar se já assinou contrato ou possui impedimentos..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
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
                      Prazo de Vencimento
                    </label>
                    <input
                      type="datetime-local"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                    />
                  </div>
                </div>

                {/* Contact Selector with Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Contato / Lead Vinculado *
                  </label>
                  <input
                    type="text"
                    placeholder="🔍 Digite para pesquisar contato..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 mb-1"
                  />
                  <select
                    required
                    value={taskContactId}
                    onChange={(e) => setTaskContactId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    <option value="">Selecione o contato...</option>
                    {filteredContacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
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
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateEventDate(null)}
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
            )}

            {/* FORM COMPROMISSO */}
            {createEventType === "appointment" && (
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                {aptFormError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-805 dark:border-red-950/30 dark:bg-red-955/20 dark:text-red-400 font-semibold">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div>{aptFormError}</div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Título do Compromisso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Test-drive e entrega de contrato"
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
                    placeholder="Ex: Trazer ficha cadastral impressa e termos de vistoria..."
                    value={aptDescription}
                    onChange={(e) => setAptDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Local do Compromisso
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Showroom principal, Google Meet..."
                    value={aptLocation}
                    onChange={(e) => setAptLocation(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Horário de Início *
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
                      Horário de Término *
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

                {/* Contact Selector with Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Contato / Lead Vinculado *
                  </label>
                  <input
                    type="text"
                    placeholder="🔍 Digite para pesquisar contato..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-850 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 mb-1"
                  />
                  <select
                    required
                    value={aptContactId}
                    onChange={(e) => setAptContactId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    <option value="">Selecione o contato...</option>
                    {filteredContacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
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
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateEventDate(null)}
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
            )}
          </div>
        </div>
      )}

      {/* EVENT DETAILS OVERLAY (TASK OR APPOINTMENT) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                  selectedEvent.type === "task" 
                    ? getPriorityColor(selectedEvent.data.priority) 
                    : getAptStatusColor(selectedEvent.data.status)
                }`}>
                  {selectedEvent.type === "task" 
                    ? `Tarefa - Prioridade: ${getPriorityLabel(selectedEvent.data.priority)}` 
                    : `Compromisso - Status: ${getAptStatusLabel(selectedEvent.data.status)}`
                  }
                </span>
                <h3 className={`text-base font-bold text-neutral-900 dark:text-neutral-50 mt-2 ${
                  selectedEvent.type === "task" && (selectedEvent.data.status === "DONE" || selectedEvent.data.status === "CANCELED")
                    ? "line-through text-neutral-450 dark:text-neutral-500" 
                    : ""
                }`}>
                  {selectedEvent.data.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body Info */}
            <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-b border-neutral-100 dark:border-neutral-800 py-4 my-4">
              {selectedEvent.data.description && (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Descrição</span>
                  <p className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/50 dark:bg-neutral-950/20 dark:border-neutral-850">
                    {selectedEvent.data.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Prazo / Horário</span>
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-250">
                    <Clock className="size-3.5 text-neutral-450 shrink-0" />
                    <span>
                      {selectedEvent.type === "task" 
                        ? (selectedEvent.data.dueDate ? new Date(selectedEvent.data.dueDate).toLocaleString("pt-BR") : "Sem prazo")
                        : `${new Date(selectedEvent.data.startAt).toLocaleString("pt-BR")} até ${new Date(selectedEvent.data.endAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                      }
                    </span>
                  </div>
                </div>

                {selectedEvent.type === "appointment" && selectedEvent.data.location && (
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Local</span>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-255">
                      <MapPin className="size-3.5 text-neutral-450 shrink-0" />
                      <span className="truncate">{selectedEvent.data.location}</span>
                    </div>
                  </div>
                )}

                {selectedEvent.data.assignedToUserId && (
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Responsável</span>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-850 dark:text-neutral-200">
                      <User className="size-3.5 text-neutral-400 shrink-0" />
                      <span>{memberMap.get(selectedEvent.data.assignedToUserId)?.name || "Sistema"}</span>
                    </div>
                  </div>
                )}

                {selectedEvent.data.contactId && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Contato Vinculado</span>
                    <div className="flex items-center justify-between gap-1.5 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-200/50 dark:bg-neutral-950/20 dark:border-neutral-850">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-neutral-450 shrink-0" />
                        <div>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                            {contactMap.get(selectedEvent.data.contactId)?.name || "Contato Excluído"}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {contactMap.get(selectedEvent.data.contactId)?.phone || ""}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/admin/leads?id=${selectedEvent.data.contactId}`}
                        onClick={() => setSelectedEvent(null)}
                        className="text-[10px] font-bold text-neutral-900 hover:underline dark:text-neutral-200"
                      >
                        Ver Detalhes →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap gap-2 justify-end">
              {selectedEvent.type === "task" && (
                <>
                  {selectedEvent.data.status !== "DONE" && selectedEvent.data.status !== "CANCELED" && (
                    <Button
                      onClick={() => handleToggleTaskStatus(selectedEvent.data.id, selectedEvent.data.status)}
                      className="h-8 text-[11px] font-bold px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      size="sm"
                    >
                      Marcar Concluída
                    </Button>
                  )}
                  {selectedEvent.data.status === "DONE" && (
                    <Button
                      onClick={() => handleToggleTaskStatus(selectedEvent.data.id, selectedEvent.data.status)}
                      className="h-8 text-[11px] font-bold px-3 rounded-lg bg-neutral-900 text-white hover:bg-neutral-850"
                      size="sm"
                    >
                      Reabrir Tarefa
                    </Button>
                  )}
                  {selectedEvent.data.status !== "CANCELED" && selectedEvent.data.status !== "DONE" && (
                    <Button
                      onClick={() => handleCancelTask(selectedEvent.data.id)}
                      className="h-8 text-[11px] font-bold px-3 rounded-lg bg-white border border-red-200 text-red-650 hover:bg-red-50"
                      size="sm"
                    >
                      Cancelar Tarefa
                    </Button>
                  )}
                </>
              )}

              {selectedEvent.type === "appointment" && (
                <>
                  {selectedEvent.data.status === "SCHEDULED" && (
                    <Button
                      onClick={() => handleUpdateAptStatus(selectedEvent.data.id, "CONFIRMED")}
                      className="h-8 text-[11px] font-bold px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      size="sm"
                    >
                      Confirmar
                    </Button>
                  )}
                  {(selectedEvent.data.status === "SCHEDULED" || selectedEvent.data.status === "CONFIRMED" || selectedEvent.data.status === "RESCHEDULED") && (
                    <>
                      <Button
                        onClick={() => handleUpdateAptStatus(selectedEvent.data.id, "COMPLETED")}
                        className="h-8 text-[11px] font-bold px-3 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                        size="sm"
                      >
                        Concluir
                      </Button>
                      <Button
                        onClick={() => handleOpenReschedule(selectedEvent.data)}
                        className="h-8 text-[11px] font-bold px-3 rounded-lg bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 dark:bg-neutral-900 dark:text-purple-400 dark:border-purple-900/40 dark:hover:bg-purple-950/20"
                        size="sm"
                      >
                        Reagendar
                      </Button>
                      <Button
                        onClick={() => handleCancelApt(selectedEvent.data.id)}
                        className="h-8 text-[11px] font-bold px-3 rounded-lg bg-white border border-red-205 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="h-8 text-[11px] font-bold px-3.5 rounded-lg"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Reagendar Compromisso
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Escolha as novas datas de início e término para o compromisso.
                </p>
              </div>
              <button
                onClick={() => setReschedulingApt(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {rescheduleError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 font-semibold">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>{rescheduleError}</div>
              </div>
            )}

            <form onSubmit={handleRescheduleAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Novo Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={rescheduleStart}
                    onChange={(e) => setRescheduleStart(e.target.value)}
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
                    value={rescheduleEnd}
                    onChange={(e) => setRescheduleEnd(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-855 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReschedulingApt(null)}
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
