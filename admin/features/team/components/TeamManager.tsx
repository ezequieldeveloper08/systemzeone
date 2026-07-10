"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Search,
  User,
  UserPlus,
  Mail,
  Calendar,
  Loader2,
  AlertCircle,
  Trash2,
  Save,
  RefreshCw,
  Inbox,
  Lock,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Shield,
  MoreHorizontal
} from "lucide-react"
import { teamService, TeamMember } from "../services/teamService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters, search, and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "administrador" | "gerente" | "vendedor">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Action Menu dropdown (for row level actions)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)

  // Modal forms states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    role: "vendedor",
    password: ""
  })
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "vendedor",
    password: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  // Load members
  const loadMembers = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const data = await teamService.getMembers()
      setMembers(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Não foi possível carregar a equipe de colaboradores.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Close action menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveActionId(null)
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // Memoized stats
  const stats = useMemo(() => {
    return {
      total: members.length,
      admins: members.filter((m) => m.role === "administrador").length,
      managers: members.filter((m) => m.role === "gerente").length,
      sellers: members.filter((m) => m.role === "vendedor" || !m.role).length,
    }
  }, [members])

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)

      if (!matchesSearch) return false

      if (activeTab === "all") return true
      if (activeTab === "administrador") return member.role === "administrador"
      if (activeTab === "gerente") return member.role === "gerente"
      if (activeTab === "vendedor") return member.role === "vendedor" || !member.role

      return true
    })
  }, [members, searchQuery, activeTab])

  // Pagination calculation
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage))

  // Open modals handlers
  const handleOpenCreate = () => {
    setNewMemberForm({
      name: "",
      email: "",
      role: "vendedor",
      password: ""
    })
    setCreateError(null)
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (member: TeamMember) => {
    setSelectedMemberId(member.id)
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role || "vendedor",
      password: ""
    })
    setEditError(null)
    setIsEditOpen(true)
    setActiveActionId(null)
  }

  // Action handlers
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    if (!newMemberForm.name || !newMemberForm.email || !newMemberForm.password) {
      setCreateError("Preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)
    try {
      const created = await teamService.createMember(newMemberForm)
      setMembers((prev) => [created, ...prev])
      setIsCreateOpen(false)
    } catch (err: any) {
      console.error(err)
      setCreateError(err.message || "Erro ao adicionar colaborador.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId) return
    setEditError(null)

    setIsSaving(true)
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role
      }
      if (editForm.password.trim()) {
        payload.password = editForm.password
      }
      const updated = await teamService.updateMember(selectedMemberId, payload)
      setMembers((prev) => prev.map((m) => (m.id === selectedMemberId ? updated : m)))
      setIsEditOpen(false)
    } catch (err: any) {
      console.error(err)
      setEditError(err.message || "Erro ao salvar alterações do colaborador.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMember = async (id: string) => {
    setActiveActionId(null)
    if (!confirm("Tem certeza de que deseja remover este colaborador permanentemente?")) return
    try {
      await teamService.deleteMember(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erro ao excluir colaborador.")
    }
  }

  // Format helpers
  const formatRole = (roleKey?: string) => {
    switch (roleKey) {
      case "administrador":
        return "Administrador"
      case "gerente":
        return "Gerente"
      case "vendedor":
      default:
        return "Vendedor"
    }
  }

  const getRoleBadge = (roleKey?: string) => {
    switch (roleKey) {
      case "administrador":
        return "bg-neutral-900 text-white border-neutral-800 dark:bg-white dark:text-neutral-950 dark:border-neutral-200"
      case "gerente":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
      case "vendedor":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-neutral-900 p-2 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
            <User className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Colaboradores e Equipe
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Gerencie a equipe de colaboradores da concessionária e permissões de acesso ao painel.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadMembers(true)}
            variant="outline"
            className="flex items-center gap-1.5 h-9 border-neutral-200 dark:border-neutral-800"
            disabled={refreshing}
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="h-9 gap-1.5 font-semibold text-sm px-4 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
          >
            <UserPlus className="size-4" />
            Adicionar Colaborador
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
          {/* Role Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-neutral-50 p-1 dark:bg-neutral-950">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "all"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("administrador")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "administrador"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Admins ({stats.admins})
            </button>
            <button
              onClick={() => setActiveTab("gerente")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "gerente"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Gerentes ({stats.managers})
            </button>
            <button
              onClick={() => setActiveTab("vendedor")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "vendedor"
                  ? "bg-white text-neutral-950 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250"
              }`}
            >
              Vendedores ({stats.sellers})
            </button>
          </div>

          {/* Search controls */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
              <Input
                placeholder="Filtrar colaboradores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TEAM TABLE */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <span className="size-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white" />
        </div>
      ) : paginatedMembers.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <Inbox className="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Nenhum colaborador encontrado.</p>
          <p className="text-xs text-neutral-450 mt-0.5">Tente ajustar seus termos de busca ou filtros.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in duration-200">
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full border-collapse text-left text-sm text-neutral-500 dark:text-neutral-400">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Nome</th>
                  <th scope="col" className="px-6 py-4 font-semibold">E-mail</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Cargo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Membro desde</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                          {member.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getRoleBadge(member.role)}`}>
                        {formatRole(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-400 text-xs">
                      {new Date(member.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium relative">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(member)}
                          variant="outline"
                          className="h-8 px-2.5 text-neutral-600 dark:text-neutral-300 border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 text-xs flex items-center gap-1 font-semibold"
                        >
                          <Edit2 className="size-3" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDeleteMember(member.id)}
                          variant="outline"
                          className="h-8 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-950/30 dark:hover:bg-rose-950/20 text-xs flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="size-3" />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION SECTION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Mostrando <span className="font-semibold">{startIndex + 1}</span> a{" "}
                <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredMembers.length)}</span> de{" "}
                <span className="font-semibold">{filteredMembers.length}</span> colaboradores
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="size-8 p-0 border-neutral-250 dark:border-neutral-800"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Pág {currentPage} de {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="size-8 p-0 border-neutral-250 dark:border-neutral-800"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL / DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-neutral-950 dark:text-white text-lg flex items-center gap-2">
                <UserPlus className="size-5 text-neutral-500" />
                Adicionar Colaborador
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-xs rounded-xl border border-red-200/50 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Nome do colaborador"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="ex@concessionaria.com"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Cargo
                </label>
                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 focus:outline-hidden"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="gerente">Gerente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Senha Temporária <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newMemberForm.password}
                  onChange={(e) => setNewMemberForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              {/* Form Actions */}
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
                  className="bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-semibold"
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Colaborador"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL / DIALOG */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-neutral-950 dark:text-white text-lg flex items-center gap-2">
                <Edit2 className="size-5 text-neutral-500" />
                Editar Colaborador
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-xs rounded-xl border border-red-200/50 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Nome do colaborador"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="ex@concessionaria.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Cargo
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 focus:outline-hidden"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="gerente">Gerente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
                  <Lock className="size-3 text-neutral-400" />
                  Nova Senha (Opcional)
                </label>
                <Input
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  value={editForm.password}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-semibold"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
