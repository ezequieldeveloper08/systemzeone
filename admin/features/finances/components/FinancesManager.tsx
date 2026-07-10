"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  AlertCircle,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Car
} from "lucide-react"
import { financesService, Transaction, FlowSummary } from "../services/financesService"
import { vehicleService } from "../../vehicles/services/vehicleService"
import { useAuth } from "../../auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

export function FinancesManagerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeTenant } = useAuth()

  // Tab synchronization with query params
  const activeTab = searchParams ? (searchParams.get("tab") || "flow") : "flow"

  const setActiveTab = (tab: string) => {
    router.push(`/admin/finances?tab=${tab}`)
  }

  // Financial States
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<FlowSummary | null>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters for lists
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Form Fields
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"revenue" | "expense">("revenue")
  const [status, setStatus] = useState<"pending" | "paid">("pending")
  const [dueDate, setDueDate] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [category, setCategory] = useState("outros")
  const [vehicleId, setVehicleId] = useState("")

  const loadData = async () => {
    if (!activeTenant) return
    setLoading(true)
    setError(null)
    try {
      // Get all vehicles in stock
      const vehiclesData = await vehicleService.getAllVehicles(activeTenant.id).catch(() => [])
      setVehicles(vehiclesData)

      // Get summary
      const summaryData = await financesService.getFlowSummary()
      setSummary(summaryData)

      // Get transactions
      const transactionsData = await financesService.getTransactions()
      setTransactions(transactionsData)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados financeiros.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTenant, activeTab])

  // Open modal for Create
  const handleOpenCreate = (forcedType?: "revenue" | "expense") => {
    setEditingTransaction(null)
    setDescription("")
    setAmount("")
    setType(forcedType || "revenue")
    setStatus("pending")

    // Set default due date to today
    const today = new Date().toISOString().substring(0, 10)
    setDueDate(today)
    setPaymentDate("")
    setCategory("outros")
    setVehicleId("")
    setModalError(null)
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setDescription(t.description)
    setAmount(String(t.amount))
    setType(t.type)
    setStatus(t.status)
    setDueDate(new Date(t.dueDate).toISOString().substring(0, 10))
    setPaymentDate(t.paymentDate ? new Date(t.paymentDate).toISOString().substring(0, 10) : "")
    setCategory(t.category)
    setVehicleId(t.vehicleId || "")
    setModalError(null)
    setIsModalOpen(true)
  }

  // Submit form (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setSubmitting(true)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setModalError("Por favor, digite um valor maior que zero.")
      setSubmitting(false)
      return
    }

    const payload = {
      description,
      amount: numAmount,
      type,
      status,
      dueDate: new Date(dueDate).toISOString(),
      paymentDate: status === "paid" ? new Date(paymentDate || new Date()).toISOString() : null,
      category,
      vehicleId: vehicleId || null,
    }

    try {
      if (editingTransaction) {
        await financesService.updateTransaction(editingTransaction.id, payload)
      } else {
        await financesService.createTransaction(payload)
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      setModalError(err.message || "Erro ao salvar transação financeira.")
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle paid status quickly
  const handleTogglePaid = async (t: Transaction) => {
    const newStatus = t.status === "paid" ? "pending" : "paid"
    try {
      await financesService.updateTransaction(t.id, {
        status: newStatus,
        paymentDate: newStatus === "paid" ? new Date().toISOString() : null
      })
      loadData()
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status.")
    }
  }

  // Delete transaction
  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este lançamento financeiro?")) return
    try {
      await financesService.deleteTransaction(id)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erro ao remover transação.")
    }
  }

  // Format currencies
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val)
  }

  // Filtered lists
  const filteredTransactions = transactions.filter(t => {
    // filter by active tab (receivables = revenue, payables = expense)
    if (activeTab === "receivables" && t.type !== "revenue") return false
    if (activeTab === "payables" && t.type !== "expense") return false

    // filter by status selector
    if (filterStatus !== "all" && t.status !== filterStatus) return false

    // filter by category
    if (filterCategory !== "all" && t.category !== filterCategory) return false

    return true
  })

  // Categories list helper
  const categories = [
    { value: "venda", label: "Venda de Veículo" },
    { value: "preparacao", label: "Preparação/Reforma" },
    { value: "marketing", label: "Marketing/Anúncios" },
    { value: "comissao", label: "Comissão" },
    { value: "despesa_fixa", label: "Despesa Fixa" },
    { value: "outros", label: "Outros" }
  ]

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            Painel Financeiro
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Fluxo de caixa, controle de contas a pagar, contas a receber e faturamentos da concessionária.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "receivables" && (
            <Button
              onClick={() => handleOpenCreate("revenue")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 rounded-xl h-11 px-4 shadow-xs"
            >
              <Plus className="size-4" />
              Nova Receita
            </Button>
          )}
          {activeTab === "payables" && (
            <Button
              onClick={() => handleOpenCreate("expense")}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 rounded-xl h-11 px-4 shadow-xs"
            >
              <Plus className="size-4" />
              Nova Despesa
            </Button>
          )}
          {activeTab === "flow" && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleOpenCreate("revenue")}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 flex items-center gap-2 rounded-xl h-11 px-4 border border-neutral-200 dark:border-neutral-700"
              >
                <ArrowUpRight className="size-4 text-emerald-500" />
                Receita
              </Button>
              <Button
                onClick={() => handleOpenCreate("expense")}
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex items-center gap-2 rounded-xl h-11 px-4"
              >
                <ArrowDownRight className="size-4 text-red-500" />
                Despesa
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200/50 flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Erro ao sincronizar finanças</h4>
            <p className="text-xs mt-1">{error}</p>
            <Button onClick={loadData} variant="outline" className="mt-3 h-8 text-xs">
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* TABS SELECTOR */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("flow")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === "flow"
              ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
        >
          Fluxo de Caixa
        </button>
        <button
          onClick={() => setActiveTab("receivables")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === "receivables"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
        >
          Contas a Receber
        </button>
        <button
          onClick={() => setActiveTab("payables")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === "payables"
              ? "border-red-500 text-red-600 dark:text-red-400"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
        >
          Contas a Pagar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-neutral-500" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Carregando informações financeiras...
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: CASH FLOW */}
          {activeTab === "flow" && summary && (
            <div className="space-y-6">
              {/* METRIC CARDS */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* CARD 1: SALDO */}
                <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Saldo em Caixa (Realizado)
                    </span>
                    <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                      <DollarSign className="size-4.5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h2 className={`text-2xl font-bold tracking-tight ${summary.metrics.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {formatCurrency(summary.metrics.balance)}
                    </h2>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Entradas menos saídas confirmadas.
                    </p>
                  </div>
                </div>

                {/* CARD 2: TOTAL RECEBIDO / PAGO */}
                <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Realizado Efetuado
                    </span>
                    <div className="flex gap-1">
                      <TrendingUp className="size-4 text-emerald-500" />
                      <TrendingDown className="size-4 text-red-500" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Total Recebido:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.metrics.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Total Pago:</span>
                      <span className="font-semibold text-red-500">{formatCurrency(summary.metrics.totalExpense)}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: PREVISÃO PENDENTES */}
                <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Previsão de Pendentes
                    </span>
                    <Clock className="size-4 text-amber-500" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">A Receber:</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formatCurrency(summary.metrics.pendingRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">A Pagar:</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formatCurrency(summary.metrics.pendingExpense)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHART: HISTÓRICO DE FLUXO */}
              <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                  <TrendingUp className="size-4 text-neutral-500" />
                  Evolução do Fluxo de Caixa (Mensal realizado)
                </h3>

                {summary.history.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-10">Não há dados suficientes para gerar o histórico.</p>
                ) : (
                  <div className="space-y-4">
                    {/* CUSTOM CSS BARS */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 min-h-60">
                      {summary.history.map((h, i) => {
                        const maxVal = Math.max(...summary.history.map(item => Math.max(item.revenue, item.expense, 1000)))
                        const revHeight = (h.revenue / maxVal) * 100
                        const expHeight = (h.expense / maxVal) * 100
                        const balHeight = Math.abs((h.balance / maxVal) * 100)

                        const [year, month] = h.month.split("-")
                        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
                        const label = `${monthNames[parseInt(month) - 1]} / ${year}`

                        return (
                          <div key={i} className="flex-1 flex flex-row md:flex-col items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                            {/* Bars Container */}
                            <div className="flex items-end gap-2 h-32 md:h-44 w-2/3 md:w-full justify-start md:justify-center">
                              {/* Revenue Bar */}
                              <div className="relative group w-6 md:w-8 bg-emerald-500/80 dark:bg-emerald-500/65 rounded-t-md hover:bg-emerald-600 transition-all" style={{ height: `${Math.max(revHeight, 3)}%` }}>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-950 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 shadow-lg">
                                  Receita: {formatCurrency(h.revenue)}
                                </div>
                              </div>
                              {/* Expense Bar */}
                              <div className="relative group w-6 md:w-8 bg-red-500/80 dark:bg-red-500/65 rounded-t-md hover:bg-red-600 transition-all" style={{ height: `${Math.max(expHeight, 3)}%` }}>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-950 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 shadow-lg">
                                  Despesa: {formatCurrency(h.expense)}
                                </div>
                              </div>
                            </div>

                            {/* Label */}
                            <div className="text-center">
                              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</p>
                              <p className={`text-[10px] font-bold ${h.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                Balanço: {formatCurrency(h.balance)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-center gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-xs bg-emerald-500" />
                        <span className="text-neutral-500">Receitas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-xs bg-red-500" />
                        <span className="text-neutral-500">Despesas</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RECENT TRANSACTIONS */}
              <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <FileText className="size-4 text-neutral-500" />
                  Últimas Transações Realizadas
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium">
                        <th className="py-3 pr-4">Descrição</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Vencimento</th>
                        <th className="py-3 pl-4">Categoria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {transactions.filter(t => t.status === "paid").slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                          <td className="py-3.5 pr-4 font-medium text-neutral-800 dark:text-neutral-200">
                            {t.description}
                          </td>
                          <td className={`py-3.5 px-4 font-bold ${t.type === "revenue" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                            {t.type === "revenue" ? "+" : "-"} {formatCurrency(t.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${t.type === "revenue" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                              {t.type === "revenue" ? "Receita" : "Despesa"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3.5 pl-4 text-neutral-500 capitalize">
                            {t.category}
                          </td>
                        </tr>
                      ))}
                      {transactions.filter(t => t.status === "paid").length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                            Nenhuma movimentação realizada ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 & 3: RECEIVABLES & PAYABLES LISTINGS */}
          {(activeTab === "receivables" || activeTab === "payables") && (
            <div className="space-y-4">
              {/* FILTERS TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-100/50 dark:bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/80">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Status Filters */}
                  <div className="flex gap-1.5 p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`py-1.5 px-3 rounded-md transition-all ${filterStatus === "all"
                          ? "bg-neutral-900 text-white dark:bg-neutral-800"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                        }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterStatus("paid")}
                      className={`py-1.5 px-3 rounded-md transition-all ${filterStatus === "paid"
                          ? "bg-neutral-900 text-white dark:bg-neutral-800"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                        }`}
                    >
                      {activeTab === "receivables" ? "Recebidos" : "Pagos"}
                    </button>
                    <button
                      onClick={() => setFilterStatus("pending")}
                      className={`py-1.5 px-3 rounded-md transition-all ${filterStatus === "pending"
                          ? "bg-neutral-900 text-white dark:bg-neutral-800"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                        }`}
                    >
                      Pendentes
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="size-3.5 text-neutral-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="text-xs bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 font-medium focus:outline-hidden"
                    >
                      <option value="all">Todas as categorias</option>
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 font-medium">
                  Exibindo {filteredTransactions.length} lançamentos
                </div>
              </div>

              {/* LIST TABLE */}
              <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                        <th className="py-3 px-5">Descrição</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4">Vencimento</th>
                        <th className="py-3 px-4">Pagamento</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-800/10 transition-colors">
                          <td className="py-4 px-5">
                            <div>
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {t.description}
                              </span>
                              {t.vehicle && (
                                <div className="inline-flex items-center gap-1 text-[10px] text-neutral-500 font-bold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded mt-1 block w-fit">
                                  <Car className="size-3" />
                                  {t.vehicle.brand} {t.vehicle.model} ({t.vehicle.plate})
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`py-4 px-4 font-bold ${t.type === "revenue" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                            {formatCurrency(t.amount)}
                          </td>
                          <td className="py-4 px-4 text-neutral-500">
                            {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-4 px-4 text-neutral-400">
                            {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString("pt-BR") : "-"}
                          </td>
                          <td className="py-4 px-4 text-neutral-500 capitalize">
                            {categories.find(c => c.value === t.category)?.label || t.category}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleTogglePaid(t)}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition-colors ${t.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 hover:bg-amber-100"
                                }`}
                            >
                              {t.status === "paid" ? (
                                <>
                                  <CheckCircle2 className="size-3" />
                                  {activeTab === "receivables" ? "Recebido" : "Pago"}
                                </>
                              ) : (
                                <>
                                  <Clock className="size-3" />
                                  Pendente
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={() => handleOpenEdit(t)}
                                variant="ghost"
                                className="h-8 px-2.5 text-xs text-neutral-500 hover:text-neutral-800"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDelete(t.id)}
                                variant="ghost"
                                className="h-8 px-2.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/15"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-400 text-sm">
                            Nenhum lançamento financeiro encontrado com os filtros ativos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE & EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <DollarSign className="size-5 text-neutral-500" />
                {editingTransaction ? "Editar Lançamento" : `Novo Lançamento: ${type === "revenue" ? "Receita" : "Despesa"}`}
              </h3>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="size-4" />
              </Button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-xs rounded-xl border border-red-200/50 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Descrição do Lançamento
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Venda do Chevrolet Onix 1.0"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl h-10"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Valor (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-xl h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Categoria
                  </label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl h-10"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Status
                  </label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "pending" | "paid")}
                    className="rounded-xl h-10"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Confirmado ({type === "revenue" ? "Recebido" : "Pago"})</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Data de Vencimento
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl h-10"
                    required
                  />
                </div>

                {status === "paid" && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Data de Pagamento
                    </label>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="rounded-xl h-10"
                      required
                    />
                  </div>
                )}

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Veículo Relacionado (Opcional)
                  </label>
                  <Select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="rounded-xl h-10"
                  >
                    <option value="">Nenhum veículo</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.plate || v.year})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="rounded-xl h-10 px-4"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 h-10 px-4"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Transação"
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

export function FinancesManager() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-neutral-500" />
      </div>
    }>
      <FinancesManagerContent />
    </Suspense>
  )
}
