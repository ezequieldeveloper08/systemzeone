"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { whatsappService } from "../services/whatsappService"
import { WhatsappFlow, WhatsappFlowResponse } from "../types"
import { WhatsappFlowsCreateForm } from "./WhatsappFlowsCreateForm"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Smartphone,
  Play,
  List,
  CheckCircle,
  RefreshCw,
  Plus,
  User,
  X,
  Sliders,
  Database,
  Edit,
  Send,
  AlertCircle,
  Trash2
} from "lucide-react"

export function WhatsappFlows() {
  const { activeTenant } = useAuth()
  const router = useRouter()

  const [flows, setFlows] = useState<WhatsappFlow[]>([])
  const [responses, setResponses] = useState<WhatsappFlowResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"flows" | "responses">("flows")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Simulator State
  const [activeSimFlow, setActiveSimFlow] = useState<WhatsappFlow | null>(null)
  const [simScreen, setSimScreen] = useState<string>("first_screen")
  const [simForm, setSimForm] = useState<Record<string, any>>({})
  const [simLoading, setSimLoading] = useState(false)
  const [simSuccessData, setSimSuccessData] = useState<any>(null)
  const [simError, setSimError] = useState<string | null>(null)

  // Send Message Modal State
  const [sendFlow, setSendFlow] = useState<WhatsappFlow | null>(null)
  const [sendForm, setSendForm] = useState({
    recipientPhone: "",
    recipientName: "",
    bodyText: "Olá! Para prosseguirmos com seu atendimento, por favor preencha as informações no botão abaixo.",
    flowCta: "Abrir Formulário",
  })
  const [sending, setSending] = useState(false)

  // Load Data
  const getFlowCategoryIcon = (categories: string[]) => {
    if (categories && categories.includes("lead_generation")) {
      return <User className="size-4 text-blue-500" />
    }
    return <Sliders className="size-4 text-neutral-400" />
  }

  const loadFlows = async () => {
    if (!activeTenant) return
    try {
      setLoading(true)
      const data = await whatsappService.getFlows()
      setFlows(data)
    } catch (err) {
      console.error("Erro ao carregar fluxos:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadResponses = async () => {
    if (!activeTenant) return
    try {
      setResponsesLoading(true)
      const data = await whatsappService.getFlowResponses()
      setResponses(data)
    } catch (err) {
      console.error("Erro ao carregar respostas:", err)
    } finally {
      setResponsesLoading(false)
    }
  }

  useEffect(() => {
    if (activeTenant) {
      loadFlows()
      loadResponses()
    }
  }, [activeTenant])

  const handleRefresh = () => {
    loadFlows()
    loadResponses()
  }

  const [syncingMeta, setSyncingMeta] = useState(false)

  const handleSyncMeta = async () => {
    try {
      setSyncingMeta(true)
      const updatedFlows = await whatsappService.syncFlows()
      setFlows(updatedFlows)
      alert("Fluxos sincronizados da conta Meta com sucesso!")
    } catch (err: any) {
      alert(err.message || "Erro ao sincronizar com a Meta.")
    } finally {
      setSyncingMeta(false)
    }
  }

  const handleDeleteFlow = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fluxo permanentemente do banco?")) return
    try {
      await whatsappService.deleteFlow(id)
      setFlows(flows.filter(f => f.id !== id))
      if (activeSimFlow?.id === id) setActiveSimFlow(null)
    } catch (err: any) {
      alert(err.message || "Erro ao excluir fluxo.")
    }
  }

  // Trigger Send Message
  const handleOpenSendModal = (flow: WhatsappFlow) => {
    setSendFlow(flow)
    setSendForm({
      recipientPhone: "",
      recipientName: "",
      bodyText: `Olá! Por favor preencha os dados do formulário *${flow.name}* tocando no botão abaixo para darmos andamento ao seu cadastro.`,
      flowCta: flow.name.includes("Test Drive")
        ? "Agendar Test Drive"
        : flow.name.includes("Avaliação")
        ? "Avaliar Usado"
        : "Abrir Formulário",
    })
  }

  const handleSendFlowMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sendFlow) return
    setSending(true)
    try {
      await whatsappService.sendFlowMessage(
        sendForm.recipientPhone,
        sendForm.recipientName,
        sendFlow.id,
        sendForm.bodyText,
        sendForm.flowCta
      )
      alert("Mensagem de Flow enviada com sucesso! Verifique o Histórico de Envios.")
      setSendFlow(null)
    } catch (err: any) {
      alert(err.message || "Erro ao enviar mensagem.")
    } finally {
      setSending(false)
    }
  }

  // Simulator Start
  const handleStartSimulation = (flow: WhatsappFlow) => {
    setActiveSimFlow(flow)
    setSimScreen(Object.keys(flow.screens)[0] || "first_screen")
    setSimForm({})
    setSimSuccessData(null)
    setSimError(null)
  }

  const handleSimInputChange = (name: string, value: any) => {
    setSimForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSimSubmit = async (nextScreen: string, isFinish = false) => {
    if (!activeSimFlow || !activeTenant) return
    setSimLoading(true)
    setSimError(null)

    const payload = {
      action: isFinish ? "submit" : "data_exchange",
      flow_token: `token_${activeSimFlow.id.slice(0, 8)}`,
      flow_id: activeSimFlow.id,
      screen: simScreen,
      data: {
        ...simForm,
        recipientName: "Cliente Simulação",
        recipientPhone: "5562988887777",
      },
    }

    try {
      const response = await whatsappService.simulateFlowWebhook(payload, activeTenant.id)
      
      if (response.screen === "SUCCESS") {
        setSimSuccessData(response.data)
        setSimScreen("success")
        loadResponses() // Reload responses table on successful submission!
      } else {
        setSimScreen(response.screen)
        if (response.data) {
          setSimForm(prev => ({ ...prev, ...response.data }))
        }
      }
    } catch (err: any) {
      setSimError(err.message || "Falha na comunicação com o Webhook.")
    } finally {
      setSimLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5 dark:border-neutral-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Sliders className="size-8 text-neutral-700 dark:text-neutral-300" />
            WhatsApp Flows
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Crie, edite, simule e monitore formulários interativos direto na Meta Cloud API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 text-xs font-semibold gap-1.5"
          >
            <Plus className="size-4" />
            Criar Novo Fluxo
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncMeta}
            disabled={syncingMeta}
            className="h-10 text-xs font-semibold gap-1.5 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-indigo-650 dark:text-indigo-400 hover:text-indigo-700"
          >
            <RefreshCw className={`size-4 ${syncingMeta ? 'animate-spin' : ''}`} />
            {syncingMeta ? 'Sincronizando...' : 'Sincronizar da Meta'}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="h-10 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          >
            <RefreshCw className="size-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("flows")}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 px-1 flex items-center gap-2 ${
              activeTab === "flows"
                ? "border-neutral-950 text-neutral-950 dark:border-neutral-50 dark:text-neutral-50"
                : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            <List className="size-4" />
            Modelos de Fluxos (Flows)
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 px-1 flex items-center gap-2 ${
              activeTab === "responses"
                ? "border-neutral-950 text-neutral-950 dark:border-neutral-50 dark:text-neutral-50"
                : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            <Database className="size-4" />
            Respostas Recebidas
            {responses.length > 0 && (
              <span className="ml-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-350 text-[10px] font-bold px-2 py-0.5 border dark:border-neutral-700">
                {responses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* STANDARD 2-COLUMN VIEW (FLOWS DASHBOARD & WEB LISTING) */}
      <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in duration-200">
        
        {/* LEFT COLUMN: FLOWS OR SUBMISSIONS */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "flows" ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                <RefreshCw className="size-8 text-neutral-300 animate-spin mb-3" />
                <span className="text-sm text-neutral-400">Carregando fluxos...</span>
              </div>
            ) : flows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 text-center px-4">
                <Smartphone className="size-12 text-neutral-300 mb-4" />
                <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Nenhum fluxo configurado</h3>
                <p className="text-sm text-neutral-400 max-w-sm mt-1">
                  Não encontramos nenhum fluxo cadastrado para sua concessionária. Clique em criar para criar seu primeiro fluxo.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {flows.map((flow) => {
                  const isActiveSim = activeSimFlow?.id === flow.id
                  return (
                    <div
                      key={flow.id}
                      className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-neutral-900 ${
                        isActiveSim
                          ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-neutral-100 dark:ring-neutral-100"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border dark:border-neutral-700 flex items-center gap-1.5">
                            {getFlowCategoryIcon(flow.categories)}
                            {flow.categories.includes("lead_generation") ? "Lead Generation" : "Outros"}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            flow.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                          }`}>
                            {flow.status === "published" ? "Publicado" : "Rascunho"}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mt-3.5">
                          {flow.name}
                        </h3>
                        {flow.flowId ? (
                          <div className="text-[10px] text-neutral-400 mt-1 font-mono flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-neutral-500">ID Meta:</span>
                            <span className="bg-neutral-50 dark:bg-neutral-950 px-1.5 py-0.5 rounded border dark:border-neutral-850 select-all">{flow.flowId}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                            Somente Local (Sem sincronização na Meta)
                          </div>
                        )}
                        <p className="text-xs text-neutral-400 mt-1.5 leading-normal">
                          {flow.name.includes("Test Drive")
                            ? "Fluxo interativo de agendamento de test drives de veículos direto no chat."
                            : flow.name.includes("Avaliação")
                            ? "Permite que o cliente cadastre os dados do carro usado dele para avaliação."
                            : "Formulário de captação de dados de leads para financiamento ou compras."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-6 border-t border-neutral-50 dark:border-neutral-800 mt-5">
                        <Button
                          size="sm"
                          onClick={() => handleStartSimulation(flow)}
                          className="flex-1 text-xs gap-1 font-semibold dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border"
                          variant="outline"
                        >
                          <Play className="size-3.5" />
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/whatsapp/flows/create?id=${flow.id}`)}
                          className="text-xs px-2.5 font-semibold"
                        >
                          <Edit className="size-3.5 text-neutral-600" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenSendModal(flow)}
                          className="text-xs px-2.5 font-semibold"
                        >
                          <Send className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFlow(flow.id)}
                          className="text-xs px-2.5 font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            // RESPONSES VIEW
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Histórico de Respostas</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Submissões concluídas de formulários pelo WhatsApp.</p>
              </div>

              {responsesLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="size-8 text-neutral-300 animate-spin mb-3" />
                  <span className="text-xs text-neutral-400">Carregando respostas...</span>
                </div>
              ) : responses.length === 0 ? (
                <div className="py-20 text-center text-neutral-400 text-xs">
                  Nenhuma resposta cadastrada ainda. Envie o formulário para um número para testar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-850 text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider text-[9px] font-bold">
                        <th className="py-3 px-5">Cliente</th>
                        <th className="py-3 px-5">Fluxo</th>
                        <th className="py-3 px-5">Dados Enviados</th>
                        <th className="py-3 px-5">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                      {responses.map((resp) => (
                        <tr key={resp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 text-neutral-700 dark:text-neutral-300">
                          <td className="py-3 px-5 leading-tight">
                            <div className="font-bold">{resp.recipientName}</div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{resp.recipientPhone}</div>
                          </td>
                          <td className="py-3 px-5 font-semibold text-neutral-600 dark:text-neutral-300">
                            {resp.flow?.name || "Fluxo Excluído"}
                          </td>
                          <td className="py-3 px-5 max-w-[280px]">
                            <div className="font-mono text-[10px] bg-neutral-50 dark:bg-neutral-950 p-2 rounded max-h-24 overflow-y-auto border border-neutral-100 dark:border-neutral-850 text-neutral-600 dark:text-neutral-400 leading-normal">
                              {JSON.stringify(resp.submittedData, null, 2)}
                            </div>
                          </td>
                          <td className="py-3 px-5 text-neutral-400 font-mono text-[10px]">
                            {new Date(resp.createdAt).toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIMULATOR VIEW */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {activeSimFlow ? (
              <div className="flex flex-col items-center">
                {/* Simulated Notch / Phone Design */}
                <div className="w-[320px] h-[600px] bg-neutral-950 rounded-[40px] p-3 shadow-2xl relative border-4 border-neutral-800 shrink-0">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-950 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1" />
                  </div>

                  {/* Screen */}
                  <div className="w-full h-full bg-neutral-100 rounded-[30px] overflow-hidden flex flex-col justify-between relative border border-neutral-900 z-10">
                    {/* Status Bar */}
                    <div className="bg-emerald-700 text-white px-6 pt-6 pb-2 text-[10px] flex justify-between items-center z-15 font-semibold">
                      <span>10:26</span>
                      <div className="flex items-center gap-1">
                        <span>4G</span>
                        <div className="w-5 h-2.5 border border-white rounded-xs p-0.5">
                          <div className="h-full bg-white w-4" />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Chat Header */}
                    <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                      <div className="size-8.5 rounded-full bg-emerald-500/50 flex items-center justify-center text-xs font-bold">
                        CN
                      </div>
                      <div className="leading-tight">
                        <div className="font-bold text-xs">Concessionária Premium</div>
                        <div className="text-[9px] text-emerald-100">online</div>
                      </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 bg-[#efeae2] p-3 overflow-y-auto space-y-3 flex flex-col">
                      <div className="self-start bg-white text-neutral-800 text-[11px] p-2.5 rounded-lg max-w-[85%] shadow-xs leading-normal">
                        Olá! Para te ajudar, por favor preencha os dados do formulário a seguir.
                        <div className="text-[8px] text-neutral-400 text-right mt-1">10:26</div>
                      </div>

                      {/* FLOW SCREEN POPUP MODAL (Inside phone) */}
                      <div className="w-full bg-white rounded-xl shadow-md border overflow-hidden flex flex-col flex-1 mt-2">
                        {/* Flow Header */}
                        <div className="bg-neutral-50 border-b px-4 py-2.5 flex items-center justify-between">
                          <span className="font-bold text-neutral-800 text-[11px] truncate">
                            {activeSimFlow.screens[simScreen]?.title || "Formulário"}
                          </span>
                          <button
                            onClick={() => setActiveSimFlow(null)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        {/* Flow Body Form */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
                          {simScreen === "success" ? (
                            <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
                              <CheckCircle className="size-12 text-emerald-500 animate-bounce" />
                              <h4 className="font-bold text-xs text-neutral-800">
                                {simSuccessData?.extension_message_response?.params?.status === "success" || !simSuccessData?.message
                                  ? "Envio concluído com sucesso!"
                                  : "Agendamento Realizado!"}
                              </h4>
                              <p className="text-[10px] text-neutral-500 leading-normal px-2">
                                {simSuccessData?.message ||
                                  "Os dados foram gravados em nossa central de atendimento de leads."}
                              </p>
                            </div>
                          ) : (
                            <>
                              {simError && (
                                <div className="text-[10px] bg-red-50 text-red-700 p-2 rounded border border-red-100 flex items-center gap-1.5">
                                  <AlertCircle className="size-3.5 shrink-0" />
                                  <span>{simError}</span>
                                </div>
                              )}

                              {/* Render Screen Fields */}
                              {(activeSimFlow.screens[simScreen]?.fields || []).map((field: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                  <label className="text-[10px] font-semibold text-neutral-500">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                  </label>
                                  {field.type === "select" || field.type === "Dropdown" || field.type === "RadioButtonsGroup" || field.type === "CheckboxGroup" ? (
                                    <select
                                      value={simForm[field.name || field.id] || ""}
                                      onChange={(e) => handleSimInputChange(field.name || field.id, e.target.value)}
                                      className="w-full text-xs h-8 border rounded px-2 bg-white text-neutral-800 focus:outline-emerald-500"
                                      required={field.required}
                                    >
                                      <option value="">Selecione...</option>
                                      {(field.name === "date" && simForm.dates ? simForm.dates : field.options || []).map((opt: string) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  ) : field.type === "info" || field.type === "TextBody" || field.type === "TextHeading" ? (
                                    <p className="text-[10px] text-neutral-600 bg-neutral-50 p-2.5 rounded leading-relaxed border border-neutral-100">
                                      {field.label}
                                    </p>
                                  ) : field.type === "Image" ? (
                                    <img
                                      src={field.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"}
                                      alt="Visual representation"
                                      className="w-full h-24 object-cover rounded"
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder={`Digite seu ${field.label.toLowerCase()}...`}
                                      value={simForm[field.name || field.id] || ""}
                                      onChange={(e) => handleSimInputChange(field.name || field.id, e.target.value)}
                                      className="w-full text-xs h-8 border rounded px-2 text-neutral-800 focus:outline-emerald-500"
                                      required={field.required}
                                    />
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Flow Footer Button */}
                        {simScreen !== "success" && (
                          <div className="p-3 border-t bg-neutral-50 flex items-center justify-end">
                            <Button
                              type="button"
                              onClick={() => {
                                const screenConfig = activeSimFlow.screens[simScreen]
                                const fields = screenConfig?.fields || []
                                const hasRequiredMissing = fields.some((f: any) => f.required && !simForm[f.name || f.id])

                                if (hasRequiredMissing) {
                                  setSimError("Preencha todos os campos obrigatórios.")
                                  return
                                }

                                let next = screenConfig.next_screen
                                let isFinish = screenConfig.finish

                                const footerBtn = fields.find((f: any) => f.type === "FooterButton" || f.type === "NavigationAction")
                                if (footerBtn) {
                                  if (footerBtn.actionType === "complete") isFinish = true
                                  if (footerBtn.actionType === "navigate" && footerBtn.nextScreen) next = footerBtn.nextScreen
                                  if (footerBtn.actionType === "data_exchange") {
                                    handleSimSubmit(simScreen, false)
                                    return
                                  }
                                }

                                if (isFinish) {
                                  handleSimSubmit(simScreen, true)
                                } else if (next) {
                                  setSimScreen(next)
                                } else {
                                  handleSimSubmit(simScreen, true)
                                }
                              }}
                              disabled={simLoading}
                              className="h-8.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {simLoading ? "Aguardando..." : (
                                activeSimFlow.screens[simScreen]?.next_button || 
                                (activeSimFlow.screens[simScreen]?.fields || []).find((f: any) => f.type === "FooterButton")?.label || 
                                "Avançar"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6">
                <Smartphone className="size-10 text-neutral-350 dark:text-neutral-600 mb-3" />
                <h4 className="font-bold text-xs text-neutral-700 dark:text-neutral-350">Simulador de Celular</h4>
                <p className="text-[10px] text-neutral-400 leading-normal max-w-[200px] mt-1">
                  Selecione "Testar" em qualquer um dos modelos de fluxo para experimentar o formulário interativo de forma idêntica ao WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DISPATCH FLOW MESSAGE DIALOG */}
      {sendFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-155">
            <div className="flex items-center justify-between border-b pb-3.5 mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Disparar WhatsApp Flow
              </h3>
              <button
                type="button"
                onClick={() => setSendFlow(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <form onSubmit={handleSendFlowMessage} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Fluxo Selecionado
                </span>
                <div className="font-bold text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                  {sendFlow.name}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Nome do Cliente
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={sendForm.recipientName}
                    onChange={(e) => setSendForm({ ...sendForm, recipientName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    WhatsApp do Cliente
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: 5562988887777"
                    value={sendForm.recipientPhone}
                    onChange={(e) => setSendForm({ ...sendForm, recipientPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Mensagem de Acompanhamento (Texto Livre)
                </label>
                <textarea
                  value={sendForm.bodyText}
                  onChange={(e) => setSendForm({ ...sendForm, bodyText: e.target.value })}
                  className="w-full text-sm border rounded-md p-2.5 text-neutral-850 dark:text-neutral-250 bg-white dark:bg-neutral-900 focus:outline-emerald-500 min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Texto do Botão (CTA)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Abrir Formulário"
                  value={sendForm.flowCta}
                  onChange={(e) => setSendForm({ ...sendForm, flowCta: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSendFlow(null)}
                  className="rounded-md border border-neutral-200 px-4 py-2 text-xs font-semibold transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  disabled={sending}
                  className="font-semibold text-xs"
                >
                  {sending ? (
                    <RefreshCw className="size-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Send className="size-3.5 mr-1.5" />
                  )}
                  Disparar Mensagem
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <WhatsappFlowsCreateForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  )
}
