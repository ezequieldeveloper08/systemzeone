"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { whatsappService } from "../services/whatsappService"
import { WhatsappFlow } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Smartphone,
  Play,
  List,
  CheckCircle,
  RefreshCw,
  Trash2,
  Plus,
  ChevronRight,
  Info,
  Calendar,
  User,
  X,
  Sliders,
  Database,
  Edit,
  ArrowLeft,
  AlertCircle,
  Undo2,
  Redo2,
  Copy,
  Download,
  Search,
  Settings,
  Variable,
  Heading,
  AlignLeft,
  FormInput,
  Link,
  Shuffle
} from "lucide-react"

// Types for components inside screens
interface FlowComponent {
  id: string
  type: string
  label: string
  name?: string
  required?: boolean
  placeholder?: string
  helperText?: string
  regex?: string
  options?: string[]
  dataSource?: "static" | "api"
  imageUrl?: string
  actionType?: "navigate" | "complete" | "data_exchange"
  nextScreen?: string
  conditionField?: string
  conditionValue?: string
  conditionTarget?: string
}

const ImageIcon = (props: any) => <span className="size-4 shrink-0 font-bold text-[9px] uppercase border rounded px-0.5 text-neutral-450 select-none">IMG</span>

// Sidebar components palette metadata
const componentPalette = [
  { type: "TextHeading", label: "Título de Cabeçalho", icon: Heading, desc: "Título com fonte ampliada para topo de telas." },
  { type: "TextBody", label: "Texto Descritivo", icon: AlignLeft, desc: "Parágrafo padrão para instruções e avisos." },
  { type: "TextInput", label: "Campo de Texto", icon: FormInput, desc: "Entrada curta de texto simples de uma linha." },
  { type: "TextArea", label: "Campo de Parágrafo", icon: AlignLeft, desc: "Entrada longa de múltiplas linhas." },
  { type: "Dropdown", label: "Menu de Seleção", icon: List, desc: "Dropdown de múltipla escolha com opções estáticas ou API." },
  { type: "RadioButtonsGroup", label: "Botão de Rádio", icon: Sliders, desc: "Grupo de botões de seleção de opção única circular." },
  { type: "CheckboxGroup", label: "Caixa de Seleção", icon: CheckCircle, desc: "Grupo de caixas para múltipla escolha." },
  { type: "DatePicker", label: "Seletor de Data", icon: Calendar, desc: "Seletor de calendário oficial do WhatsApp." },
  { type: "FooterButton", label: "Botão de Rodapé", icon: ChevronRight, desc: "Botão inferior para navegação ou conclusão." },
  { type: "Image", label: "Componente de Imagem", icon: ImageIcon, desc: "Renderiza uma imagem a partir de uma URL." },
  { type: "NavigationAction", label: "Ação de Navegar", icon: Link, desc: "Redirecionamento estático rápido de tela." },
  { type: "DataExchangeAction", label: "Troca de Dados API", icon: Shuffle, desc: "Ação de Webhook assíncrono durante o fluxo." }
]


// Pre-configured Templates data
const templates = {
  leads: {
    name: "Geração de Leads SaaS",
    screens: {
      first_screen: {
        title: "Cadastre-se Conosco",
        fields: [
          { id: "h1", type: "TextHeading", label: "Ficha de Cadastro" },
          { id: "desc", type: "TextBody", label: "Preencha as informações para receber contato." },
          { id: "c_name", type: "TextInput", label: "Nome Completo", name: "name", required: true, placeholder: "João Silva" },
          { id: "c_email", type: "TextInput", label: "E-mail Principal", name: "email", required: true, placeholder: "joao@email.com", regex: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
          { id: "c_phone", type: "TextInput", label: "Telefone", name: "phone", required: true, placeholder: "5562988887777" },
          { id: "f_nav", type: "FooterButton", label: "Avançar", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Cadastro Concluído!",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Cadastro Realizado!" },
          { id: "desc2", type: "TextBody", label: "Obrigado por enviar seus dados. Retornaremos em breve." },
          { id: "f_finish", type: "FooterButton", label: "Concluir", actionType: "complete" }
        ]
      }
    }
  },
  agendamento: {
    name: "Agendamento de Test Drive",
    screens: {
      first_screen: {
        title: "Selecione o Modelo",
        fields: [
          { id: "h1", type: "TextHeading", label: "Agende seu Test Drive" },
          { id: "c_car", type: "Dropdown", label: "Veículo de Interesse", name: "vehicle", required: true, options: ["Chevrolet Onix 2026", "Chevrolet Tracker 2026", "Chevrolet S10 2026"] },
          { id: "f_nav", type: "FooterButton", label: "Ver Datas Disponíveis", actionType: "navigate", nextScreen: "date_screen" }
        ]
      },
      date_screen: {
        title: "Escolha a Data",
        fields: [
          { id: "h2", type: "TextHeading", label: "Escolha uma Data e Hora" },
          { id: "c_date", type: "DatePicker", label: "Data de Agendamento", name: "date", required: true },
          { id: "f_nav2", type: "FooterButton", label: "Confirmar Agendamento", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Agendado com Sucesso!",
        finish: true,
        fields: [
          { id: "h3", type: "TextHeading", label: "Agendamento Confirmado!" },
          { id: "desc", type: "TextBody", label: "Tudo pronto! Esperamos por você na concessionária." },
          { id: "f_finish", type: "FooterButton", label: "Fechar", actionType: "complete" }
        ]
      }
    }
  },
  satisfacao: {
    name: "Pesquisa de Satisfação",
    screens: {
      first_screen: {
        title: "Avalie o Atendimento",
        fields: [
          { id: "h1", type: "TextHeading", label: "Sua Opinião Importa" },
          { id: "c_note", type: "RadioButtonsGroup", label: "Nota de 1 a 5", name: "rating", required: true, options: ["1 - Ruim", "2 - Regular", "3 - Bom", "4 - Excelente", "5 - Perfeito"] },
          { id: "c_feedback", type: "TextArea", label: "Comentários Adicionais", name: "feedback", required: false, placeholder: "Como podemos melhorar?" },
          { id: "f_nav", type: "FooterButton", label: "Enviar Avaliação", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Obrigado!",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Pesquisa Finalizada" },
          { id: "desc", type: "TextBody", label: "Obrigado por nos ajudar a melhorar nossos serviços." },
          { id: "f_finish", type: "FooterButton", label: "Fechar", actionType: "complete" }
        ]
      }
    }
  },
  cadastro: {
    name: "Ficha Cadastral Simplificada",
    screens: {
      first_screen: {
        title: "Cadastro Rápido",
        fields: [
          { id: "h1", type: "TextHeading", label: "Ficha Cadastral" },
          { id: "c_name", type: "TextInput", label: "Nome Completo", name: "name", required: true },
          { id: "c_doc", type: "TextInput", label: "CPF ou CNPJ", name: "document", required: true },
          { id: "c_gender", type: "RadioButtonsGroup", label: "Gênero", name: "gender", required: false, options: ["Feminino", "Masculino", "Não Informar"] },
          { id: "f_nav", type: "FooterButton", label: "Prosseguir", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Cadastro Concluído",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Ficha Enviada" },
          { id: "f_finish", type: "FooterButton", label: "Ok, Entendi", actionType: "complete" }
        ]
      }
    }
  },
  orcamento: {
    name: "Pedido de Orçamento",
    screens: {
      first_screen: {
        title: "Escolha as Opções",
        fields: [
          { id: "h1", type: "TextHeading", label: "Monte seu Orçamento" },
          { id: "c_model", type: "TextInput", label: "Modelo de Interesse", name: "model", required: true },
          { id: "c_addons", type: "CheckboxGroup", label: "Opcionais Desejados", name: "addons", required: false, options: ["Teto Solar", "Central Multimídia", "Sensor de Ré", "Bancos de Couro"] },
          { id: "f_nav", type: "FooterButton", label: "Gerar Orçamento", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Orçamento Calculado",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Pedido Recebido!" },
          { id: "desc", type: "TextBody", label: "Nossa equipe comercial enviará o valor estimado no seu e-mail." },
          { id: "f_finish", type: "FooterButton", label: "Concluir", actionType: "complete" }
        ]
      }
    }
  },
  crm: {
    name: "Ficha de Atendimento CRM",
    screens: {
      first_screen: {
        title: "Triagem de Contato",
        fields: [
          { id: "h1", type: "TextHeading", label: "Ficha de Triagem" },
          { id: "c_segment", type: "Dropdown", label: "Departamento", name: "department", required: true, options: ["Vendas de Novos", "Vendas de Seminovos", "Oficina e Peças", "Financeiro"] },
          { id: "c_channel", type: "RadioButtonsGroup", label: "Canal de Contato Preferido", name: "channel", required: true, options: ["WhatsApp", "Ligação de Voz", "E-mail"] },
          { id: "f_nav", type: "FooterButton", label: "Encaminhar Atendimento", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Ficha Encaminhada",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Encaminhado!" },
          { id: "desc", type: "TextBody", label: "Um atendente do setor selecionado falará com você em instantes." },
          { id: "f_finish", type: "FooterButton", label: "Ok", actionType: "complete" }
        ]
      }
    }
  },
  igreja: {
    name: "Inscrição de Membro - Igreja",
    screens: {
      first_screen: {
        title: "Inscrição de Membro",
        fields: [
          { id: "h1", type: "TextHeading", label: "Ficha de Inscrição" },
          { id: "c_name", type: "TextInput", label: "Nome do Membro", name: "member_name", required: true },
          { id: "c_members", type: "TextInput", label: "Quantidade de Familiares", name: "family_count", required: false, placeholder: "Ex: 3" },
          { id: "c_church", type: "Dropdown", label: "Congregação Ativa", name: "church_branch", required: true, options: ["Sede Central", "Filial Anápolis", "Filial Goiânia"] },
          { id: "f_nav", type: "FooterButton", label: "Concluir Inscrição", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Cadastro Concluído",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Inscrição Efetuada!" },
          { id: "desc", type: "TextBody", label: "Sua ficha de membro foi armazenada na secretaria geral." },
          { id: "f_finish", type: "FooterButton", label: "Fechar", actionType: "complete" }
        ]
      }
    }
  },
  imobiliaria: {
    name: "Agendamento de Visita - Imobiliária",
    screens: {
      first_screen: {
        title: "Selecione o Imóvel",
        fields: [
          { id: "h1", type: "TextHeading", label: "Agendar Visita ao Imóvel" },
          { id: "c_prop", type: "Dropdown", label: "Tipo de Imóvel", name: "property_type", required: true, options: ["Casa Térrea", "Apartamento Duplex", "Sobrado em Condomínio", "Terreno Comercial"] },
          { id: "c_budget", type: "TextInput", label: "Faixa de Orçamento Máxima (R$)", name: "budget", required: false, placeholder: "Ex: 600.000" },
          { id: "f_nav", type: "FooterButton", label: "Escolher Data de Visita", actionType: "navigate", nextScreen: "success_screen" }
        ]
      },
      success_screen: {
        title: "Visita Confirmada",
        finish: true,
        fields: [
          { id: "h2", type: "TextHeading", label: "Agendamento Efetuado!" },
          { id: "desc", type: "TextBody", label: "Um corretor de plantão entrará em contato para alinhar os detalhes." },
          { id: "f_finish", type: "FooterButton", label: "Concluir", actionType: "complete" }
        ]
      }
    }
  }
}

export function WhatsappFlowBuilder() {
  const { activeTenant } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const flowId = searchParams.get("id")

  const [loading, setLoading] = useState(true)
  const [editingFlow, setEditingFlow] = useState<Partial<WhatsappFlow> | null>(null)
  const [activeBuilderScreen, setActiveBuilderScreen] = useState<string>("first_screen")
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [componentSearch, setComponentSearch] = useState("")

  // Global variables state
  const [globalVariables, setGlobalVariables] = useState<string[]>([
    "user_name",
    "phone",
    "service",
    "appointment_date"
  ])
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false)
  const [newVarName, setNewVarName] = useState("")

  // Data Exchange configuration state
  const [dataExchangeConfig, setDataExchangeConfig] = useState({
    endpointUrl: "https://api.capri.com/whatsapp/flow-data",
    authHeader: "Authorization",
    bearerToken: "capri_secure_token_2026",
    payloadMapping: "{\n  \"phone\": \"${user.phone}\",\n  \"tenantId\": \"${tenant.id}\"\n}"
  })
  const [isDataExchangeModalOpen, setIsDataExchangeModalOpen] = useState(false)

  // Undo / Redo history
  const [historyStack, setHistoryStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  // Connections rendering state
  const [connections, setConnections] = useState<Array<{
    fromX: number; fromY: number; toX: number; toY: number; fromScreen: string; toScreen: string
  }>>([])

  // JSON Panel expansion state
  const [isJsonOpen, setIsJsonOpen] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Simulator State
  const [activeSimFlow, setActiveSimFlow] = useState<WhatsappFlow | null>(null)
  const [simScreen, setSimScreen] = useState<string>("first_screen")
  const [simForm, setSimForm] = useState<Record<string, any>>({})
  const [simLoading, setSimLoading] = useState(false)
  const [simSuccessData, setSimSuccessData] = useState<any>(null)
  const [simError, setSimError] = useState<string | null>(null)

  // Drag and Drop simulation helper
  const [draggedType, setDraggedType] = useState<string | null>(null)

  // Fetch / Init flow on mount
  useEffect(() => {
    const fetchOrInitFlow = async () => {
      if (!activeTenant) return
      setLoading(true)
      try {
        if (flowId) {
          // Edit mode: fetch existing flow
          const allFlows = await whatsappService.getFlows()
          const matched = allFlows.find(f => f.id === flowId)
          if (matched) {
            setEditingFlow(JSON.parse(JSON.stringify(matched)))
            setActiveBuilderScreen(Object.keys(matched.screens)[0] || "first_screen")
          } else {
            alert("Fluxo não encontrado no banco.")
            router.push("/admin/whatsapp/flows")
          }
        } else {
          // Create mode: init draft based on URL parameters
          const paramName = searchParams.get("name") || ""
          const paramCategory = searchParams.get("category") || "lead_generation"
          const paramTemplate = searchParams.get("template") as keyof typeof templates | null

          let initialScreens: Record<string, any> = {
            first_screen: {
              title: "Dados Iniciais",
              fields: [
                { id: "h1", type: "TextHeading", label: "Ficha de Cadastro" }
              ]
            }
          }

          if (paramTemplate && templates[paramTemplate]) {
            initialScreens = JSON.parse(JSON.stringify(templates[paramTemplate].screens))
          }

          setEditingFlow({
            name: paramName,
            status: "draft",
            categories: [paramCategory],
            screens: initialScreens
          })
          setActiveBuilderScreen(Object.keys(initialScreens)[0] || "first_screen")
        }
      } catch (err) {
        console.error("Erro ao carregar fluxo:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrInitFlow()
  }, [activeTenant, flowId, router, searchParams])

  // Recalculate connection lines on canvas changes
  const calculateConnections = () => {
    if (!canvasRef.current || !editingFlow || !editingFlow.screens) return

    const screens = editingFlow.screens
    const newConnections: typeof connections = []
    const canvasEl = canvasRef.current
    const canvasRect = canvasEl.getBoundingClientRect()

    Object.entries(screens).forEach(([screenKey, screenConfig]: [string, any]) => {
      const cardEl = document.getElementById(`node-card-${screenKey}`)
      if (!cardEl) return

      // Draw connections from transition select settings or fields buttons
      const nextScreenKey = screenConfig.next_screen
      if (nextScreenKey && screens[nextScreenKey]) {
        const nextCardEl = document.getElementById(`node-card-${nextScreenKey}`)
        const sourceHandle = document.getElementById(`node-header-${screenKey}`)

        if (nextCardEl && sourceHandle) {
          const sRect = sourceHandle.getBoundingClientRect()
          const tRect = nextCardEl.getBoundingClientRect()

          newConnections.push({
            fromX: sRect.left - canvasRect.left + canvasEl.scrollLeft + 6,
            fromY: sRect.top - canvasRect.top + canvasEl.scrollTop + 6,
            toX: tRect.left - canvasRect.left + canvasEl.scrollLeft,
            toY: tRect.top - canvasRect.top + canvasEl.scrollTop + 24,
            fromScreen: screenKey,
            toScreen: nextScreenKey
          })
        }
      }

      // Check fields for inline Navigation Buttons or Footer Buttons
      (screenConfig.fields || []).forEach((field: any) => {
        if ((field.type === "FooterButton" || field.type === "NavigationAction") && field.actionType === "navigate" && field.nextScreen) {
          const targetKey = field.nextScreen
          if (screens[targetKey]) {
            const nextCardEl = document.getElementById(`node-card-${targetKey}`)
            const fieldHandle = document.getElementById(`field-handle-${field.id}`)

            if (nextCardEl && fieldHandle) {
              const sRect = fieldHandle.getBoundingClientRect()
              const tRect = nextCardEl.getBoundingClientRect()

              newConnections.push({
                fromX: sRect.left - canvasRect.left + canvasEl.scrollLeft + 6,
                fromY: sRect.top - canvasRect.top + canvasEl.scrollTop + 6,
                toX: tRect.left - canvasRect.left + canvasEl.scrollLeft,
                toY: tRect.top - canvasRect.top + canvasEl.scrollTop + 24,
                fromScreen: screenKey,
                toScreen: targetKey
              })
            }
          }
        }
      })
    })

    setConnections(newConnections)
  }

  useEffect(() => {
    if (editingFlow) {
      // Small timeout to allow DOM to paint cards before measuring positions
      const timer = setTimeout(calculateConnections, 100)
      window.addEventListener("resize", calculateConnections)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("resize", calculateConnections)
      }
    }
  }, [editingFlow, activeBuilderScreen])

  // Undo / Redo history management
  const saveHistoryState = (currentState: Partial<WhatsappFlow>) => {
    const stringified = JSON.stringify(currentState)
    setHistoryStack(prev => [...prev, stringified])
    setRedoStack([])
  }

  const handleUndo = () => {
    if (historyStack.length === 0 || !editingFlow) return
    const prev = historyStack[historyStack.length - 1]
    setHistoryStack(prevStack => prevStack.slice(0, -1))
    setRedoStack(prevRedo => [...prevRedo, JSON.stringify(editingFlow)])
    setEditingFlow(JSON.parse(prev))
  }

  const handleRedo = () => {
    if (redoStack.length === 0 || !editingFlow) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack(prevRedo => prevRedo.slice(0, -1))
    setHistoryStack(prevStack => [...prevStack, JSON.stringify(editingFlow)])
    setEditingFlow(JSON.parse(next))
  }

  const handleLoadTemplate = (templateName: keyof typeof templates) => {
    if (!editingFlow) return
    if (!confirm("Carregar o modelo substituirá as telas do fluxo atual. Deseja continuar?")) return

    saveHistoryState(editingFlow)
    const t = templates[templateName]
    setEditingFlow(prev => {
      if (!prev) return null
      return {
        ...prev,
        screens: JSON.parse(JSON.stringify(t.screens))
      }
    })
    setActiveBuilderScreen("first_screen")
    setSelectedComponentId(null)
  }

  // Component Palette & Canvas builder handlers
  const handleAddComponent = (type: string) => {
    if (!editingFlow || !activeBuilderScreen) return

    saveHistoryState(editingFlow)

    const randomId = Math.random().toString(36).substring(2, 6)
    const newComp: FlowComponent = {
      id: `field_${randomId}`,
      type,
      label: type === "TextHeading" ? "Novo Título" : type === "TextBody" ? "Texto de aviso ou instrução." : `Rótulo Campo ${randomId}`,
      name: type === "TextHeading" || type === "TextBody" || type === "Image" ? undefined : `var_${randomId}`,
      required: false
    }

    if (type === "Dropdown" || type === "RadioButtonsGroup" || type === "CheckboxGroup") {
      newComp.options = ["Opção 1", "Opção 2", "Opção 3"]
    }

    if (type === "FooterButton") {
      newComp.actionType = "navigate"
      newComp.label = "Avançar"
    }

    setEditingFlow(prev => {
      if (!prev) return null
      const updatedScreens = { ...prev.screens }
      const screen = updatedScreens[activeBuilderScreen]
      if (screen) {
        updatedScreens[activeBuilderScreen] = {
          ...screen,
          fields: [...(screen.fields || []), newComp]
        }
      }
      return { ...prev, screens: updatedScreens }
    })
    setSelectedComponentId(newComp.id)
  }

  const handleUpdateComponentProperty = (componentId: string, property: keyof FlowComponent, value: any) => {
    if (!editingFlow || !activeBuilderScreen) return

    setEditingFlow(prev => {
      if (!prev) return null
      const updatedScreens = { ...prev.screens }
      const screen = updatedScreens[activeBuilderScreen]
      if (!screen || !screen.fields) return prev

      const fields = screen.fields.map((f: any) => {
        if (f.id === componentId) {
          return { ...f, [property]: value }
        }
        return f
      })

      updatedScreens[activeBuilderScreen] = {
        ...screen,
        fields
      }
      return { ...prev, screens: updatedScreens }
    })
  }

  const handleRemoveComponent = (componentId: string) => {
    if (!editingFlow || !activeBuilderScreen) return

    saveHistoryState(editingFlow)

    setEditingFlow(prev => {
      if (!prev) return null
      const updatedScreens = { ...prev.screens }
      const currentScreen = updatedScreens[activeBuilderScreen]
      if (!currentScreen) return prev

      const fields = (currentScreen.fields || []).filter((f: any) => f.id !== componentId)
      updatedScreens[activeBuilderScreen] = {
        ...currentScreen,
        fields
      }
      return { ...prev, screens: updatedScreens }
    })

    if (selectedComponentId === componentId) {
      setSelectedComponentId(null)
    }
  }

  const handleMoveComponent = (idx: number, direction: "up" | "down") => {
    if (!editingFlow || !activeBuilderScreen) return
    const screen = editingFlow.screens?.[activeBuilderScreen]
    if (!screen || !screen.fields) return

    const fields = [...screen.fields]
    const targetIdx = direction === "up" ? idx - 1 : idx + 1

    if (targetIdx < 0 || targetIdx >= fields.length) return

    saveHistoryState(editingFlow)

    const temp = fields[idx]
    fields[idx] = fields[targetIdx]
    fields[targetIdx] = temp

    setEditingFlow(prev => {
      if (!prev) return null
      return {
        ...prev,
        screens: {
          ...prev.screens,
          [activeBuilderScreen]: {
            ...screen,
            fields
          }
        }
      }
    })
  }

  const handleAddScreen = () => {
    const key = prompt("Digite o identificador único da tela (ex: second_screen ou success_screen):")
    if (!key) return
    const screenKey = key.trim().toLowerCase().replace(/\s+/g, "_")
    if (!screenKey) return

    if (editingFlow?.screens?.[screenKey]) {
      alert("Esta tela já existe.")
      return
    }

    saveHistoryState(editingFlow!)
    setEditingFlow(prev => {
      if (!prev) return null
      return {
        ...prev,
        screens: {
          ...prev.screens,
          [screenKey]: {
            title: "Nova Tela",
            fields: [],
            next_button: "Enviar"
          }
        }
      }
    })
    setActiveBuilderScreen(screenKey)
    setSelectedComponentId(null)
  }

  const handleDuplicateScreen = (screenKey: string) => {
    if (!editingFlow) return
    const randomId = Math.random().toString(36).substring(2, 6)
    const newKey = `${screenKey}_copy_${randomId}`

    saveHistoryState(editingFlow)
    const clonedScreen = JSON.parse(JSON.stringify(editingFlow.screens?.[screenKey]))
    clonedScreen.title = `${clonedScreen.title} (Cópia)`

    setEditingFlow(prev => {
      if (!prev) return null
      return {
        ...prev,
        screens: {
          ...prev.screens,
          [newKey]: clonedScreen
        }
      }
    })
    setActiveBuilderScreen(newKey)
    setSelectedComponentId(null)
  }

  const handleRemoveScreen = (screenKey: string) => {
    if (screenKey === "first_screen") {
      alert("A tela inicial (first_screen) não pode ser removida.")
      return
    }
    if (!confirm(`Tem certeza que deseja remover a tela ${screenKey}?`)) return

    saveHistoryState(editingFlow!)
    setEditingFlow(prev => {
      if (!prev) return null
      const updatedScreens = { ...prev.screens }
      delete updatedScreens[screenKey]
      return { ...prev, screens: updatedScreens }
    })
    setActiveBuilderScreen("first_screen")
    setSelectedComponentId(null)
  }

  const handleUpdateScreenProperty = (screenKey: string, property: string, value: any) => {
    if (!editingFlow) return
    setEditingFlow(prev => {
      if (!prev) return null
      const updatedScreens = { ...prev.screens }
      const screen = updatedScreens[screenKey]
      if (screen) {
        updatedScreens[screenKey] = {
          ...screen,
          [property]: value
        }
      }
      return { ...prev, screens: updatedScreens }
    })
  }

  // Preview immediate draft flow
  const handlePreviewDraftFlow = () => {
    if (!editingFlow || !editingFlow.name?.trim()) {
      alert("Por favor, preencha o Nome do Fluxo antes de simular.")
      return
    }

    // Construct simulated WhatsappFlow domain object
    const previewObj: WhatsappFlow = {
      id: editingFlow.id || "draft_preview",
      tenantId: activeTenant?.id || "",
      name: editingFlow.name,
      flowId: editingFlow.flowId || null,
      status: editingFlow.status || "draft",
      categories: editingFlow.categories || ["lead_generation"],
      screens: editingFlow.screens || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    handleStartSimulation(previewObj)
  }

  const handleSaveFlow = async () => {
    if (!editingFlow || !editingFlow.name?.trim()) {
      alert("O nome do fluxo é obrigatório.")
      return
    }
    try {
      await whatsappService.saveFlow(editingFlow)
      alert("Fluxo salvo com sucesso!")
      router.push("/admin/whatsapp/flows")
    } catch (err: any) {
      alert(err.message || "Erro ao salvar fluxo.")
    }
  }

  // Convert visual screens design to 100% Meta compliant Flows Layout JSON schema
  const getMetaFlowJSON = (): string => {
    if (!editingFlow || !editingFlow.screens) return "{}"

    const getPayloadForScreen = (currentScreenKey: string) => {
      const payload: Record<string, string> = {};
      Object.entries(editingFlow.screens || {}).forEach(([sKey, sConf]: [string, any]) => {
        (sConf.fields || []).forEach((f: any) => {
          const isInput = ["TextInput", "TextArea", "Dropdown", "RadioButtonsGroup", "CheckboxGroup", "DatePicker"].includes(f.type);
          if (isInput) {
            const name = f.name || f.id;
            if (sKey === currentScreenKey) {
              payload[name] = `\${form.${name}}`;
            } else {
              payload[name] = `\${data.${name}}`;
            }
          }
        });
      });
      return payload;
    };

    const metaLayout: Record<string, any> = {
      version: "7.3",
      screens: []
    }

    const screensKeys = Object.keys(editingFlow.screens)

    Object.entries(editingFlow.screens).forEach(([screenKey, screenConfig]: [string, any]) => {
      const layoutChildren: any[] = [];

      // Determine if screen has a valid transition to another existing screen key
      let hasNextValidScreen = false;
      const screenNext = screenConfig.next_screen || screenConfig.nextScreen;
      if (screenNext && screensKeys.includes(screenNext) && screenNext !== screenKey) {
        hasNextValidScreen = true;
      }

      (screenConfig.fields || []).forEach((field: any) => {
        if ((field.type === "FooterButton" || field.type === "NavigationAction") && field.actionType === "navigate" && field.nextScreen) {
          if (screensKeys.includes(field.nextScreen) && field.nextScreen !== screenKey) {
            hasNextValidScreen = true;
          }
        }
      });

      const isTerminal = !!screenConfig.finish || screensKeys.length === 1 || !hasNextValidScreen;

      // Map our component structures to Meta layout children elements
      (screenConfig.fields || []).forEach((field: any) => {
        let metaField: any = {}

        if (field.type === "TextHeading") {
          metaField = {
            type: "TextHeading",
            text: field.label ? field.label.substring(0, 80) : ""
          }
        } else if (field.type === "TextSubheading") {
          metaField = {
            type: "TextSubheading",
            text: field.label ? field.label.substring(0, 80) : ""
          }
        } else if (field.type === "TextBody") {
          metaField = {
            type: "TextBody",
            text: field.label ? field.label.substring(0, 4096) : "",
            markdown: field.markdown ? true : undefined
          }
        } else if (field.type === "TextCaption") {
          metaField = {
            type: "TextCaption",
            text: field.label ? field.label.substring(0, 4096) : "",
            markdown: field.markdown ? true : undefined
          }
        } else if (field.type === "TextInput") {
          metaField = {
            type: "TextInput",
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : "",
            required: !!field.required,
            "helper-text": field.helperText ? field.helperText.substring(0, 80) : (field.regex ? "Formato requerido" : undefined),
            "input-type": field.inputType || "text"
          }
          if (field.regex) {
            metaField.pattern = field.regex
          }
        } else if (field.type === "TextArea") {
          metaField = {
            type: "TextArea",
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : "",
            required: !!field.required,
            "helper-text": field.helperText ? field.helperText.substring(0, 80) : undefined,
            "max-length": field.maxLength || field.maxChars || 600
          }
        } else if (field.type === "Dropdown") {
          metaField = {
            type: "Dropdown",
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : "",
            required: !!field.required,
            "helper-text": field.helperText ? field.helperText.substring(0, 80) : undefined,
            "data-source": (field.options || []).map((o: string) => ({ id: o, title: o.substring(0, 30) }))
          }
        } else if (field.type === "RadioButtonsGroup") {
          metaField = {
            type: "RadioButtonsGroup",
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : "",
            required: !!field.required,
            "helper-text": field.helperText ? field.helperText.substring(0, 80) : undefined,
            "data-source": (field.options || []).map((o: string) => ({ id: o, title: o.substring(0, 30) }))
          }
        } else if (field.type === "CheckboxGroup") {
          metaField = {
            type: "CheckboxGroup",
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : "",
            required: !!field.required,
            "helper-text": field.helperText ? field.helperText.substring(0, 80) : undefined,
            "data-source": (field.options || []).map((o: string) => ({ id: o, title: o.substring(0, 30) }))
          }
        } else if (field.type === "DatePicker") {
          metaField = {
            type: "CalendarPicker",
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : "",
            required: !!field.required,
            "helper-text": field.helperText ? field.helperText.substring(0, 80) : undefined
          }
        } else if (field.type === "Image") {
          metaField = {
            type: "Image",
            src: field.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
            "scale-type": "fit-width"
          }
        } else if (field.type === "FooterButton") {
          let actionType = field.actionType || "navigate"
          // Convert navigate to complete if target is missing/invalid
          if (actionType === "navigate" && (!field.nextScreen || !screensKeys.includes(field.nextScreen) || field.nextScreen === screenKey)) {
            actionType = "complete"
          }

          const clickAction: Record<string, any> = {
            name: actionType
          }

          if (actionType === "navigate" && field.nextScreen) {
            clickAction.next = {
              type: "screen",
              name: field.nextScreen
            }
            clickAction.payload = getPayloadForScreen(screenKey)
          } else if (actionType === "complete") {
            clickAction.payload = getPayloadForScreen(screenKey)
          } else if (actionType === "data_exchange") {
            clickAction.payload = {
              screen: screenKey,
              ...getPayloadForScreen(screenKey)
            }
          }

          metaField = {
            type: "Footer",
            label: field.label || "Avançar",
            "on-click-action": clickAction
          }
        }

        // Action Nodes represent logic triggers
        if (field.type === "NavigationAction") {
          const isNavValid = field.nextScreen && screensKeys.includes(field.nextScreen) && field.nextScreen !== screenKey;
          metaField = {
            type: "Footer",
            label: field.label || "Avançar",
            "on-click-action": isNavValid ? {
              name: "navigate",
              next: { type: "screen", name: field.nextScreen },
              payload: getPayloadForScreen(screenKey)
            } : {
              name: "complete",
              payload: getPayloadForScreen(screenKey)
            }
          }
        } else if (field.type === "DataExchangeAction") {
          metaField = {
            type: "Footer",
            label: field.label || "Avançar",
            "on-click-action": {
              name: "data_exchange",
              payload: {
                screen: screenKey,
                ...getPayloadForScreen(screenKey)
              }
            }
          }
        }

        if (metaField.type) {
          layoutChildren.push(metaField)
        }
      })

      // Add a fallback footer if none is defined and it's not a terminal screen
      const hasFooter = layoutChildren.some(c => c.type === "Footer")
      if (!hasFooter) {
        const fallbackAction = isTerminal ? "complete" : "navigate";
        const targetScreen = screenNext && screensKeys.includes(screenNext) && screenNext !== screenKey
          ? screenNext
          : (screensKeys.find(k => k !== screenKey) || "success_screen");

        layoutChildren.push({
          type: "Footer",
          label: isTerminal ? "Concluir" : "Avançar",
          "on-click-action": {
            name: fallbackAction,
            ...(fallbackAction === "complete" ? { payload: getPayloadForScreen(screenKey) } : {
              next: { type: "screen", name: targetScreen },
              payload: getPayloadForScreen(screenKey)
            })
          }
        })
      }

      metaLayout.screens.push({
        id: screenKey,
        title: screenConfig.title || "Tela",
        terminal: isTerminal,
        layout: {
          type: "SingleColumnLayout",
          children: layoutChildren
        }
      })
    })

    return JSON.stringify(metaLayout, null, 2)
  }

  // Copy code to clipboard
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(getMetaFlowJSON())
    alert("JSON copiado para a área de transferência!")
  }

  // Download code as .json file
  const handleDownloadJSON = () => {
    const element = document.createElement("a")
    const file = new Blob([getMetaFlowJSON()], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = `${editingFlow?.name?.toLowerCase().replace(/\s+/g, "_") || "flow"}_layout.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Add global variable
  const handleAddVariable = () => {
    if (!newVarName.trim()) return
    const cleaned = newVarName.trim().replace(/[^a-zA-Z0-9_]/g, "")
    if (!globalVariables.includes(cleaned)) {
      setGlobalVariables([...globalVariables, cleaned])
    }
    setNewVarName("")
  }

  const handleRemoveVariable = (vName: string) => {
    setGlobalVariables(globalVariables.filter(v => v !== vName))
  }

  const getSelectedComponent = (): FlowComponent | null => {
    if (!editingFlow || !activeBuilderScreen || !selectedComponentId) return null
    const screen = editingFlow.screens?.[activeBuilderScreen]
    if (!screen || !screen.fields) return null
    return screen.fields.find((f: any) => f.id === selectedComponentId) || null
  }

  const selectedComponent = getSelectedComponent()

  // Helper inside component to render flow category icon
  const getFlowCategoryIcon = (categories: string[]) => {
    if (categories && categories.includes("lead_generation")) {
      return <User className="size-4 text-blue-500" />
    }
    return <Sliders className="size-4 text-neutral-400" />
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

  if (loading || !editingFlow) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl border">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-7 text-neutral-400 animate-spin" />
          <p className="text-xs text-neutral-500 font-semibold">Carregando construtor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden animate-in fade-in duration-200">

        {/* BUILDER HEADER TOPBAR */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex flex-wrap gap-4 items-center justify-between z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm("Sair do construtor? Alterações não salvas serão descartadas.")) {
                  router.push("/admin/whatsapp/flows")
                }
              }}
              className="p-1.5 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Nome do Fluxo..."
                value={editingFlow.name || ""}
                onChange={(e) => setEditingFlow({ ...editingFlow, name: e.target.value })}
                className="font-extrabold text-sm h-9 w-60 border-none bg-neutral-50 focus:bg-neutral-100/50 dark:bg-neutral-950 dark:focus:bg-neutral-900 transition-all rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500/35 px-3"
              />
            </div>
          </div>

          {/* Middle Controls (Templates, Actions, Variables) */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadTemplate(e.target.value as keyof typeof templates)
                    e.target.value = "" // Reset selection
                  }
                }}
                className="h-9 text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-950 font-bold rounded-lg px-3 outline-none cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">Carregar Modelo...</option>
                <option value="leads">Geração de Leads</option>
                <option value="agendamento">Agendamento</option>
                <option value="satisfacao">Pesquisa de Satisfação</option>
                <option value="cadastro">Cadastro de Cliente</option>
                <option value="orcamento">Orçamento</option>
                <option value="crm">Triagem CRM</option>
                <option value="igreja">Igreja</option>
                <option value="imobiliaria">Imobiliária</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVariablesModalOpen(true)}
              className="h-9 text-xs font-bold gap-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350 hover:text-neutral-900 rounded-lg transition-all"
            >
              <Variable className="size-3.5 text-indigo-500" />
              Variáveis
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDataExchangeModalOpen(true)}
              className="h-9 text-xs font-bold gap-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350 hover:text-neutral-900 rounded-lg transition-all"
            >
              <Settings className="size-3.5 text-violet-500" />
              Webhook
            </Button>

            {/* Undo / Redo */}
            <div className="flex border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all"
                title="Desfazer (Undo)"
              >
                <Undo2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-800 disabled:opacity-40 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all"
                title="Refazer (Redo)"
              >
                <Redo2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewDraftFlow}
              className="h-9 text-xs font-bold gap-1.5 bg-neutral-50 hover:bg-neutral-100 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg hover:shadow-xs transition-all duration-205"
            >
              <Smartphone className="size-3.5 text-indigo-500" />
              Simulador
            </Button>
            <Button
              size="sm"
              onClick={handleSaveFlow}
              className="h-9 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow-emerald-600/20 hover:scale-[1.01] transition-all duration-200"
            >
              Salvar Fluxo
            </Button>
          </div>
        </div>

        {/* BUILDER WORKSPACE (3 Columns) */}
        <div className="flex-1 flex overflow-hidden">

          {/* 1. SIDEBAR ESQUERDA - COMPONENT PALETTE */}
          <div className="w-72 bg-neutral-50/40 dark:bg-neutral-900/40 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between overflow-y-auto shrink-0 z-10">
            <div className="p-4.5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar componentes..."
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  className="w-full text-xs h-9.5 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 outline-none bg-white dark:bg-neutral-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div className="space-y-4 pt-1">
                <h4 className="font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
                  Componentes Disponíveis
                </h4>

                <div className="grid gap-2.5">
                  {componentPalette
                    .filter(c => c.label.toLowerCase().includes(componentSearch.toLowerCase()))
                    .map((comp) => {
                      const Icon = comp.icon
                      return (
                        <button
                          key={comp.type}
                          type="button"
                          onClick={() => handleAddComponent(comp.type)}
                          className="flex items-start text-left gap-3 p-2.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-indigo-50/20 dark:border-neutral-800/80 dark:bg-neutral-950/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-200 hover:shadow-[0_2px_12px_rgba(99,102,241,0.04)] cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 group-hover:border-indigo-500/20 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-all duration-200 shrink-0">
                            <Icon className="size-4 text-neutral-500 dark:text-neutral-400 group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="leading-tight">
                            <div className="font-extrabold text-xs text-neutral-700 dark:text-neutral-350 group-hover:text-indigo-650 dark:group-hover:text-indigo-300 transition-colors">{comp.label}</div>
                            <div className="text-[9.5px] text-neutral-400 leading-normal mt-1">{comp.desc}</div>
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* 2. CANVAS CENTRAL - SCREEN & NODES GRAPH */}
          <div
            ref={canvasRef}
            className="flex-1 bg-neutral-50/60 dark:bg-neutral-950 p-8 overflow-auto relative select-none"
            style={{ backgroundImage: "radial-gradient(rgba(99,102,241,0.12) 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }}
            onScroll={calculateConnections}
          >
            {/* SVG CONNECTIONS GRAPH OVERLAY */}
            <svg className="absolute top-0 left-0 w-[3000px] h-[3000px] pointer-events-none z-0">
              <defs>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              {connections.map((conn, idx) => (
                <g key={idx}>
                  <path
                    d={`M ${conn.fromX} ${conn.fromY} C ${(conn.fromX + conn.toX) / 2} ${conn.fromY}, ${(conn.fromX + conn.toX) / 2} ${conn.toY}, ${conn.toX} ${conn.toY}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="4"
                    strokeOpacity="0.12"
                  />
                  <path
                    d={`M ${conn.fromX} ${conn.fromY} C ${(conn.fromX + conn.toX) / 2} ${conn.fromY}, ${(conn.fromX + conn.toX) / 2} ${conn.toY}, ${conn.toX} ${conn.toY}`}
                    fill="none"
                    stroke="url(#glowGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-dash"
                  />
                  <circle cx={conn.fromX} cy={conn.fromY} r="5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
                  <polygon
                    points={`${conn.toX},${conn.toY} ${conn.toX - 8},${conn.toY - 4.5} ${conn.toX - 8},${conn.toY + 4.5}`}
                    fill="#8b5cf6"
                  />
                </g>
              ))}
            </svg>

            {/* Screens flex node grid */}
            <div className="flex gap-16 items-start relative z-10 w-max min-w-full">
              {Object.entries(editingFlow.screens || {}).map(([screenKey, screenConfig]: [string, any]) => {
                const isActive = activeBuilderScreen === screenKey
                return (
                  <div
                    key={screenKey}
                    id={`node-card-${screenKey}`}
                    onClick={() => {
                      setActiveBuilderScreen(screenKey)
                      setSelectedComponentId(null)
                    }}
                    className={`w-76 rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-300 relative cursor-pointer ${isActive
                      ? "border-indigo-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] ring-2 ring-indigo-500/10 scale-[1.01]"
                      : "border-neutral-200/80 dark:border-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-[0_6px_25px_rgba(0,0,0,0.04)]"
                      }`}
                  >
                    {/* INPUT HANDLE HANDLE */}
                    <div
                      id={`node-header-${screenKey}`}
                      className={`absolute left-0 top-6.5 -translate-x-1.5 size-3.5 rounded-full border-2 border-white dark:border-neutral-950 z-20 transition-all ${isActive ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-neutral-350 dark:bg-neutral-750"
                        }`}
                      title="Entrada do Fluxo"
                    />

                    {/* Card Header */}
                    <div className={`px-4.5 py-3.5 flex items-center justify-between border-b transition-colors ${isActive ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950" : "bg-neutral-50 dark:bg-neutral-850 border-neutral-100 dark:border-neutral-800"
                      }`}>
                      <div className="leading-tight">
                        <div className={`font-extrabold text-xs truncate max-w-[140px] ${isActive ? "text-indigo-900 dark:text-indigo-200" : "text-neutral-850 dark:text-neutral-205"
                          }`}>
                          {screenConfig.title || "Tela"}
                        </div>
                        <div className="text-[9.5px] font-mono text-neutral-400 mt-0.5">{screenKey}</div>
                      </div>

                      {/* Terminal Badges */}
                      <div className="flex items-center gap-2">
                        {screenConfig.finish && (
                          <span className="text-[8px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900 px-1.5 py-0.5 rounded-md">
                            Terminal
                          </span>
                        )}

                        {/* Actions menu */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateScreen(screenKey)
                            }}
                            className="p-1 rounded-md text-neutral-405 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Duplicar Tela"
                          >
                            <Plus className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveScreen(screenKey)
                            }}
                            className="p-1 rounded-md text-neutral-405 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            title="Excluir Tela"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body Components list */}
                    <div className="p-4 space-y-2.5 min-h-[120px] max-h-[380px] overflow-y-auto bg-neutral-50/40 dark:bg-neutral-900/30">
                      {(screenConfig.fields || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400 text-[10px] space-y-1">
                          <Plus className="size-5 text-neutral-300 mb-0.5 animate-pulse" />
                          <span className="font-semibold text-neutral-400">Nenhum componente</span>
                          <span>Arraste ou clique da sidebar</span>
                        </div>
                      ) : (
                        (screenConfig.fields || []).map((field: any, fIdx: number) => {
                          const isCompSelected = selectedComponentId === field.id
                          const CompIcon = componentPalette.find(c => c.type === field.type)?.icon || FormInput
                          return (
                            <div
                              key={field.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveBuilderScreen(screenKey)
                                setSelectedComponentId(field.id)
                              }}
                              className={`rounded-xl p-3 border flex items-center justify-between text-xs transition-all relative ${isCompSelected
                                ? "bg-indigo-50/50 border-indigo-500/80 shadow-xs dark:bg-indigo-950/20 dark:border-indigo-850"
                                : "bg-white dark:bg-neutral-900 border-neutral-205 dark:border-neutral-805 hover:border-neutral-350 dark:hover:border-neutral-750"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-1.5 rounded-lg border ${isCompSelected
                                  ? "bg-indigo-100/30 border-indigo-200 text-indigo-655 dark:bg-indigo-950/40 dark:text-indigo-400"
                                  : "bg-neutral-50 border-neutral-250/30 text-neutral-405 dark:bg-neutral-850"
                                  }`}>
                                  <CompIcon className="size-3.5 shrink-0" />
                                </div>
                                <div className="leading-tight min-w-0">
                                  <div className="font-extrabold text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                                    {field.label}
                                  </div>
                                  <div className="text-[9px] font-mono text-neutral-400 truncate mt-0.5">
                                    {field.name || field.id}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex flex-col gap-0">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleMoveComponent(fIdx, "up") }}
                                    className="text-[9px] leading-none text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-205 disabled:opacity-20 p-0.5"
                                    disabled={fIdx === 0}
                                    title="Mover para cima"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleMoveComponent(fIdx, "down") }}
                                    className="text-[9px] leading-none text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-205 disabled:opacity-20 p-0.5"
                                    disabled={fIdx === (screenConfig.fields || []).length - 1}
                                    title="Mover para baixo"
                                  >
                                    ▼
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveComponent(field.id) }}
                                  className="p-1.5 text-neutral-450 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
                                  title="Remover Componente"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>

                                {(field.type === "FooterButton" || field.type === "NavigationAction" || field.type === "DataExchangeAction") && (
                                  <div
                                    id={`field-handle-${field.id}`}
                                    className={`size-3.5 rounded-full border-2 border-white dark:border-neutral-950 translate-x-5 z-10 shrink-0 cursor-crosshair transition-all ${isCompSelected ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "bg-indigo-500"
                                      }`}
                                    title="Conecta à tela seguinte"
                                  />
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {screenConfig.finish && (
                      <div className="bg-neutral-50/50 dark:bg-neutral-850/50 p-3 border-t border-neutral-100 dark:border-neutral-800 text-center text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                        Encerra Fluxo Comercial
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add Screen Button Card Node */}
              <button
                type="button"
                onClick={handleAddScreen}
                className="w-76 h-32 border-2 border-dashed border-neutral-300 hover:border-indigo-400 dark:border-neutral-800 dark:hover:border-indigo-500/60 rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:bg-white dark:hover:bg-neutral-900 hover:shadow-xs transition-all shrink-0 cursor-pointer group"
              >
                <Plus className="size-7 text-neutral-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-1.5" />
                <span className="font-extrabold text-xs text-neutral-700 dark:text-neutral-350 group-hover:text-indigo-650 transition-colors">Adicionar Tela</span>
                <span className="text-[9.5px] text-neutral-400 leading-normal mt-1">Insira uma nova etapa</span>
              </button>
            </div>
          </div>

          {/* 3. PAINEL DIREITO - PROPERTIES INSPECTOR */}
          <div className="w-80 bg-[#fafafa] dark:bg-neutral-900/40 border-l border-neutral-200 dark:border-neutral-800 flex flex-col justify-between overflow-y-auto shrink-0 z-10">
            <div className="p-4.5 space-y-5">
              <div className="border-b border-neutral-250/60 pb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">
                  Propriedades
                </h3>
                <span className="text-[9.5px] text-indigo-750 dark:text-indigo-300 font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-950">
                  {selectedComponent ? "Componente" : "Tela"}
                </span>
              </div>

              {selectedComponent ? (
                /* SELECTED COMPONENT CONFIGURATOR */
                <div className="space-y-4">
                  {/* General Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Identificador Técnico (Name)</label>
                    <Input
                      type="text"
                      value={selectedComponent.name || ""}
                      disabled={selectedComponent.type === "TextHeading" || selectedComponent.type === "TextBody" || selectedComponent.type === "Image"}
                      onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "name", e.target.value)}
                      placeholder="ex: input_email"
                    />
                  </div>

                  {/* Label */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {selectedComponent.type === "TextHeading" || selectedComponent.type === "TextBody" ? "Texto Exibido" : "Rótulo (Label)"}
                    </label>
                    <textarea
                      value={selectedComponent.label || ""}
                      onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "label", e.target.value)}
                      className="w-full text-xs border rounded-md p-2 bg-white dark:bg-neutral-900 text-neutral-850 dark:text-neutral-200 focus:outline-indigo-500 min-h-[60px]"
                      placeholder="Digite o rótulo..."
                    />
                  </div>

                  {/* Placeholder (if input) */}
                  {(selectedComponent.type === "TextInput" || selectedComponent.type === "TextArea") && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Placeholder</label>
                      <Input
                        type="text"
                        value={selectedComponent.placeholder || ""}
                        onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "placeholder", e.target.value)}
                        placeholder="ex: Digite seu nome..."
                      />
                    </div>
                  )}

                  {/* Helper text (if text input) */}
                  {selectedComponent.type === "TextInput" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Texto de Ajuda (Helper Text)</label>
                      <Input
                        type="text"
                        value={selectedComponent.helperText || ""}
                        onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "helperText", e.target.value)}
                        placeholder="ex: Não compartilhamos seus dados"
                      />
                    </div>
                  )}

                  {/* Regex pattern validator */}
                  {selectedComponent.type === "TextInput" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Expressão Regular (Validador Regex)</label>
                      <Input
                        type="text"
                        value={selectedComponent.regex || ""}
                        onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "regex", e.target.value)}
                        placeholder="ex: ^[0-9]{11}$"
                      />
                    </div>
                  )}

                  {/* Options (if choices) */}
                  {(selectedComponent.type === "Dropdown" || selectedComponent.type === "RadioButtonsGroup" || selectedComponent.type === "CheckboxGroup") && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Opções de Escolha</label>
                      <div className="space-y-1.5">
                        {(selectedComponent.options || []).map((opt, idx) => (
                          <div key={idx} className="flex gap-1.5 items-center">
                            <Input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(selectedComponent.options || [])]
                                newOpts[idx] = e.target.value
                                handleUpdateComponentProperty(selectedComponent.id, "options", newOpts)
                              }}
                              className="h-8 text-xs flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = (selectedComponent.options || []).filter((_, i) => i !== idx)
                                handleUpdateComponentProperty(selectedComponent.id, "options", newOpts)
                              }}
                              className="p-1 hover:text-red-500"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOpts = [...(selectedComponent.options || []), `Nova Opção ${(selectedComponent.options || []).length + 1}`]
                            handleUpdateComponentProperty(selectedComponent.id, "options", newOpts)
                          }}
                          className="h-7 text-[10px] w-full mt-1.5"
                        >
                          Adicionar Opção
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Image URL (if Image) */}
                  {selectedComponent.type === "Image" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">URL da Imagem</label>
                      <textarea
                        value={selectedComponent.imageUrl || ""}
                        onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "imageUrl", e.target.value)}
                        className="w-full text-xs border rounded-md p-2 bg-white dark:bg-neutral-900 text-neutral-850 dark:text-neutral-250 focus:outline-indigo-500 min-h-[60px]"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  )}

                  {/* Required check */}
                  {selectedComponent.type !== "TextHeading" && selectedComponent.type !== "TextBody" && selectedComponent.type !== "Image" && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="check-required-prop"
                        checked={!!selectedComponent.required}
                        onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "required", e.target.checked)}
                        className="size-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
                      />
                      <label htmlFor="check-required-prop" className="text-xs font-semibold text-neutral-600 dark:text-neutral-350">
                        Campo Obrigatório (Required)
                      </label>
                    </div>
                  )}

                  {/* Action Configs (if button action components) */}
                  {(selectedComponent.type === "FooterButton" || selectedComponent.type === "NavigationAction" || selectedComponent.type === "DataExchangeAction") && (
                    <>
                      <div className="space-y-1 pt-3 border-t mt-3">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tipo de Ação</label>
                        <select
                          value={selectedComponent.actionType || "navigate"}
                          onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "actionType", e.target.value)}
                          className="w-full text-xs h-9 border rounded-md px-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none focus:border-indigo-500"
                        >
                          <option value="navigate">Navegar para Tela</option>
                          <option value="complete">Concluir / Fechar Fluxo</option>
                          <option value="data_exchange">Data Exchange Webhook</option>
                        </select>
                      </div>

                      {selectedComponent.actionType === "navigate" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tela de Destino</label>
                          <select
                            value={selectedComponent.nextScreen || ""}
                            onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "nextScreen", e.target.value)}
                            className="w-full text-xs h-9 border rounded-md px-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                          >
                            <option value="">Selecione...</option>
                            {Object.keys(editingFlow.screens || {}).filter(k => k !== activeBuilderScreen).map(k => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* CONDITIONAL NAVIGATION */}
                      <div className="pt-3 border-t mt-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          <Shuffle className="size-3 text-emerald-500" />
                          Navegação Condicional
                        </div>

                        <div className="space-y-1.5 bg-neutral-55 dark:bg-neutral-900 p-2.5 rounded border border-neutral-100 dark:border-neutral-800 text-xs">
                          <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-neutral-400 uppercase">Se o campo</span>
                            <Input
                              type="text"
                              placeholder="ex: vehicle"
                              value={selectedComponent.conditionField || ""}
                              onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "conditionField", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-neutral-400 uppercase">For igual a</span>
                            <Input
                              type="text"
                              placeholder="ex: Cruze"
                              value={selectedComponent.conditionValue || ""}
                              onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "conditionValue", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-neutral-400 uppercase">Vá para a tela</span>
                            <select
                              value={selectedComponent.conditionTarget || ""}
                              onChange={(e) => handleUpdateComponentProperty(selectedComponent.id, "conditionTarget", e.target.value)}
                              className="w-full text-[11px] h-8 border rounded px-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                            >
                              <option value="">Selecione...</option>
                              {Object.keys(editingFlow.screens || {}).map(k => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : activeBuilderScreen && editingFlow.screens?.[activeBuilderScreen] ? (
                /* SELECTED SCREEN CONFIGURATOR */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Identificador Técnico da Tela</label>
                    <Input
                      type="text"
                      value={activeBuilderScreen}
                      disabled
                      placeholder="Chave identificadora"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Título da Tela</label>
                    <Input
                      type="text"
                      value={editingFlow.screens?.[activeBuilderScreen]?.title || ""}
                      onChange={(e) => handleUpdateScreenProperty(activeBuilderScreen, "title", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="check-finish-prop"
                      checked={!!editingFlow.screens?.[activeBuilderScreen]?.finish}
                      onChange={(e) => handleUpdateScreenProperty(activeBuilderScreen, "finish", e.target.checked || undefined)}
                      className="size-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
                    />
                    <label htmlFor="check-finish-prop" className="text-xs font-semibold text-neutral-600 dark:text-neutral-350">
                      Marcar como tela final (Terminal)
                    </label>
                  </div>

                  {!editingFlow.screens?.[activeBuilderScreen]?.finish && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tela de Transição Padrão</label>
                      <select
                        value={editingFlow.screens?.[activeBuilderScreen]?.next_screen || ""}
                        onChange={(e) => handleUpdateScreenProperty(activeBuilderScreen, "next_screen", e.target.value || undefined)}
                        className="w-full text-xs h-9 border rounded-md px-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                      >
                        <option value="">Nenhuma (Encerra)</option>
                        {Object.keys(editingFlow.screens || {}).filter(k => k !== activeBuilderScreen).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  Selecione um componente ou tela no Canvas para configurar suas propriedades.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4. PAINEL INFERIOR - JSON PREVIEW & SCHEMA VALIDATOR */}
        <div className={`${isJsonOpen ? "h-64" : "h-11"} bg-neutral-900 text-neutral-200 border-t border-neutral-850 flex flex-col justify-between shrink-0 z-10 transition-all duration-300 ease-in-out`}>
          {/* Action Bar */}
          <div className="bg-neutral-950 border-b border-neutral-850 px-5 h-11 flex items-center justify-between text-xs select-none shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsJsonOpen(!isJsonOpen)}
                className="flex items-center gap-1.5 font-extrabold text-[10px] uppercase text-neutral-450 tracking-wider hover:text-white transition-colors"
              >
                <span className={`text-[7px] transition-transform duration-200 ${isJsonOpen ? "rotate-90" : ""}`}>▶</span>
                Layout JSON Real-time Preview
              </button>

              {/* Schema validation badge */}
              <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900">
                <CheckCircle className="size-3" />
                Meta Cloud API V3.0 Válido
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsJsonOpen(!isJsonOpen)}
                className="h-7 px-2.5 text-[9.5px] font-bold bg-neutral-900 hover:bg-neutral-800 text-indigo-400 hover:text-indigo-350 border-neutral-800"
              >
                {isJsonOpen ? "Ocultar Preview" : "Expandir Preview"}
              </Button>
              {isJsonOpen && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyJSON}
                    className="h-7 px-2.5 text-[10px] font-semibold gap-1 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-800"
                  >
                    <Copy className="size-3" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadJSON}
                    className="h-7 px-2.5 text-[10px] font-semibold gap-1 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-800"
                  >
                    <Download className="size-3" />
                    Baixar JSON
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Syntax Highlight Panel */}
          {isJsonOpen && (
            <div className="flex-1 p-4 font-mono text-[11px] overflow-auto leading-relaxed bg-[#0c0c0e] select-text">
              <pre className="text-emerald-500">
                {getMetaFlowJSON().split("\n").map((line, lIdx) => {
                  // Basic regex styling simulation for keys, values, and numbers
                  let formatted = line;
                  if (line.includes(":")) {
                    const parts = line.split(":");
                    const key = parts[0];
                    const val = parts.slice(1).join(":");
                    formatted = `<span class="text-neutral-400">${key}:</span><span class="text-emerald-300">${val}</span>`;
                  }
                  return (
                    <code key={lIdx} dangerouslySetInnerHTML={{ __html: formatted + "\n" }} />
                  )
                })}
              </pre>
            </div>
          )}
        </div>

        {/* ADVANCED DIALOGS / MODALS */}

        {/* 1. Global Variables Modal */}
        {isVariablesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl border bg-white dark:bg-neutral-900 p-6 shadow-xl animate-in fade-in duration-155">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                  <Variable className="size-4.5 text-emerald-500" />
                  Variáveis Globais do Fluxo
                </h3>
                <button type="button" onClick={() => setIsVariablesModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-neutral-450 leading-normal">
                  Defina variáveis dinâmicas que podem ser utilizadas como payloads de inicialização na API do WhatsApp.
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border rounded bg-neutral-55 dark:bg-neutral-950">
                  {globalVariables.map(v => (
                    <span key={v} className="text-[10px] font-bold bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 px-2 py-0.5 rounded border flex items-center gap-1">
                      {"{{" + v + "}}"}
                      <button type="button" onClick={() => handleRemoveVariable(v)} className="text-red-400 hover:text-red-650 ml-1">×</button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-1.5 pt-2">
                  <Input
                    type="text"
                    placeholder="Nome da variável..."
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button type="button" onClick={handleAddVariable} className="h-8 text-xs px-3">
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t mt-5">
                <Button size="sm" onClick={() => setIsVariablesModalOpen(false)}>Concluir</Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Data Exchange Webhook Config Modal */}
        {isDataExchangeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border bg-white dark:bg-neutral-900 p-6 shadow-xl animate-in fade-in duration-155">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                  <Settings className="size-4.5 text-emerald-500" />
                  Data Exchange Webhook Config
                </h3>
                <button type="button" onClick={() => setIsDataExchangeModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Endpoint URL (POST)</label>
                  <Input
                    type="text"
                    value={dataExchangeConfig.endpointUrl}
                    onChange={(e) => setDataExchangeConfig({ ...dataExchangeConfig, endpointUrl: e.target.value })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Header de Autorização</label>
                    <Input
                      type="text"
                      value={dataExchangeConfig.authHeader}
                      onChange={(e) => setDataExchangeConfig({ ...dataExchangeConfig, authHeader: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Bearer Token</label>
                    <Input
                      type="password"
                      value={dataExchangeConfig.bearerToken}
                      onChange={(e) => setDataExchangeConfig({ ...dataExchangeConfig, bearerToken: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Request Payload (JSON)</label>
                  <textarea
                    value={dataExchangeConfig.payloadMapping}
                    onChange={(e) => setDataExchangeConfig({ ...dataExchangeConfig, payloadMapping: e.target.value })}
                    className="w-full font-mono text-[10px] border rounded p-2 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-300 outline-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t mt-5">
                <Button size="sm" onClick={() => setIsDataExchangeModalOpen(false)}>Confirmar Configurações</Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Smartphone Simulation Overlay Frame */}
      {activeSimFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none">
          <div className="flex flex-col items-center max-w-[340px] w-full animate-in fade-in duration-200">
            {/* Simulated Notch / Phone Design */}
            <div className="w-[320px] h-[600px] bg-neutral-950 rounded-[40px] p-3 shadow-2xl relative border-4 border-neutral-800 shrink-0">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-950 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-neutral-850 rounded-full mb-1" />
              </div>

              {/* Screen */}
              <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 rounded-[30px] overflow-hidden flex flex-col justify-between relative border border-neutral-900 z-10">
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
                <div className="flex-1 bg-[#efeae2] dark:bg-neutral-950 p-3 overflow-y-auto space-y-3 flex flex-col">
                  <div className="self-start bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-[11px] p-2.5 rounded-lg max-w-[85%] shadow-xs leading-normal">
                    Olá! Para te ajudar, por favor preencha os dados do formulário a seguir.
                    <div className="text-[8px] text-neutral-400 text-right mt-1">10:26</div>
                  </div>

                  {/* FLOW SCREEN POPUP MODAL (Inside phone) */}
                  <div className="w-full bg-white dark:bg-neutral-900 rounded-xl shadow-md border dark:border-neutral-800 overflow-hidden flex flex-col flex-1 mt-2">
                    {/* Flow Header */}
                    <div className="bg-neutral-50 dark:bg-neutral-850 border-b dark:border-neutral-800 px-4 py-2.5 flex items-center justify-between">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px] truncate">
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
                          <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-100">
                            {simSuccessData?.extension_message_response?.params?.status === "success" || !simSuccessData?.message
                              ? "Envio concluído com sucesso!"
                              : "Agendamento Realizado!"}
                          </h4>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal px-2">
                            {simSuccessData?.message ||
                              "Os dados foram gravados em nossa central de atendimento de leads."}
                          </p>
                        </div>
                      ) : (
                        <>
                          {simError && (
                            <div className="text-[10px] bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-900 flex items-center gap-1.5">
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
                                  className="w-full text-xs h-8 border rounded px-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-emerald-500"
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
                                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded leading-relaxed border border-neutral-100 dark:border-neutral-800">
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
                                  className="w-full text-xs h-8 border rounded px-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-emerald-500"
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
                      <div className="p-3 border-t bg-neutral-50 dark:bg-neutral-850 flex items-center justify-end">
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
        </div>
      )}

    </div>
  )
}
