"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { whatsappService } from "../services/whatsappService"
import { WhatsappTemplate } from "../types"
import { teamService } from "@/features/team/services/teamService"
import { vehicleService } from "@/features/vehicles/services/vehicleService"
import { crmService } from "@/features/crm/services/crmService"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  MoreVertical,
  Send,
  Plus,
  CheckCheck,
  UserCheck,
  UserX,
  XCircle,
  FileText,
  Paperclip,
  Smile,
  AlertCircle,
  RefreshCw,
  Upload,
  Mic,
  Trash2,
  Pause,
  Play,
  Brain
} from "lucide-react"

interface ChatMessage {
  id: string
  sender: "lead" | "agent"
  text: string
  time: string
  status?: "sent" | "delivered" | "read" | "failed"
  messageType?: "text" | "template" | "image" | "document" | "interactive" | "audio"
  variables?: Record<string, string>
}

interface ChatContact {
  id: string // phone is used as id
  name: string
  phone: string
  company: string
  queue: "Comercial" | "Suporte" | "Financeiro"
  responsible: string
  avatarInitials: string
  unreadCount: number
  lastMsgTime: string
  lastMsgText: string
  lastInboundMessageTime: string | null
  tags: string[]
  notes: string
  messages: ChatMessage[]
}

export function WhatsappChat() {
  const { activeTenant } = useAuth()
  const searchParams = useSearchParams()
  const phoneParam = searchParams ? searchParams.get("phone") : null
  const nameParam = searchParams ? searchParams.get("name") : null

  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedChatPhone, setSelectedChatPhone] = useState<string>("")
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([])
  const [selectedFlowResponse, setSelectedFlowResponse] = useState<{ name: string; data: any } | null>(null)
  const [showRawFlowJson, setShowRawFlowJson] = useState(false)
  const [filterTab, setFilterTab] = useState<"todas" | "nao_lidas" | "abertas" | "pendentes">("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiPausedPhones, setAiPausedPhones] = useState<string[]>([])

  // Message input state
  const [inputText, setInputText] = useState("")

  // Tag input states
  const [newTagText, setNewTagText] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)

  const [crmContact, setCrmContact] = useState<any | null>(null)

  // Template states
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [sendingTemplate, setSendingTemplate] = useState(false)

  // Transfer Modal states
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [selectedQueue, setSelectedQueue] = useState<"Comercial" | "Suporte" | "Financeiro">("Comercial")
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Actions Dropdown state
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)

  // Attachment/Interactive Message state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [activeAttachmentType, setActiveAttachmentType] = useState<null | 'image' | 'cta_url' | 'list' | 'button' | 'audio'>(null)

  // Input fields for attachment/interactive modal
  const [attachImageLink, setAttachImageLink] = useState("")
  const [attachCaption, setAttachCaption] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [attachAudioLink, setAttachAudioLink] = useState("")
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  // Custom WhatsApp voice recorder states
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'preview'>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [previewDuration, setPreviewDuration] = useState(0)
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0)

  const [interactiveHeader, setInteractiveHeader] = useState("")
  const [interactiveBody, setInteractiveBody] = useState("")
  const [interactiveFooter, setInteractiveFooter] = useState("")
  const [interactiveButtonLabel, setInteractiveButtonLabel] = useState("")
  const [interactiveUrl, setInteractiveUrl] = useState("")

  // List sections default: 1 section with 2 rows
  const [listSectionTitle, setListSectionTitle] = useState("Selecione uma opção")
  const [listRow1Id, setListRow1Id] = useState("opt1")
  const [listRow1Title, setListRow1Title] = useState("")
  const [listRow1Desc, setListRow1Desc] = useState("")
  const [listRow2Id, setListRow2Id] = useState("opt2")
  const [listRow2Title, setListRow2Title] = useState("")
  const [listRow2Desc, setListRow2Desc] = useState("")

  // Quick reply buttons default: 2 buttons
  const [quickReply1Id, setQuickReply1Id] = useState("btn1")
  const [quickReply1Title, setQuickReply1Title] = useState("")
  const [quickReply2Id, setQuickReply2Id] = useState("btn2")
  const [quickReply2Title, setQuickReply2Title] = useState("")
  const [quickReply3Id, setQuickReply3Id] = useState("btn3")
  const [quickReply3Title, setQuickReply3Title] = useState("")

  // Scroll ref for messages
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastScrollPhoneRef = useRef<string | null>(null)
  const lastScrollMsgCountRef = useRef<number>(0)

  // Recording refs
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<any>(null)
  const recordingDurationRef = useRef<number>(0)
  const sendImmediatelyRef = useRef<boolean>(false)
  const audioBlobRef = useRef<Blob | null>(null)

  // Audio Context and Visualizer refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<any>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const tenantId = activeTenant?.id || "t-1"
      const url = await vehicleService.uploadImage(tenantId, file)
      setAttachImageLink(url)
    } catch (err: any) {
      console.error(err)
      alert("Erro ao fazer upload de imagem: " + (err.message || err))
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAudio(true)
    try {
      const tenantId = activeTenant?.id || "t-1"
      const url = await vehicleService.uploadImage(tenantId, file)
      setAttachAudioLink(url)
    } catch (err: any) {
      console.error(err)
      alert("Erro ao fazer upload de áudio: " + (err.message || err))
    } finally {
      setIsUploadingAudio(false)
    }
  }

  const startRecording = async () => {
    try {
      // Reset preview states
      setPreviewUrl(null)
      setIsPreviewPlaying(false)
      setPreviewDuration(0)
      setPreviewCurrentTime(0)
      audioBlobRef.current = null
      sendImmediatelyRef.current = false

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" })
        audioBlobRef.current = audioBlob
        
        cleanupAudioNodes()

        if (sendImmediatelyRef.current) {
          await uploadAndSendAudioBlob(audioBlob)
          setRecordingState('idle')
        } else {
          const url = URL.createObjectURL(audioBlob)
          setPreviewUrl(url)
          setRecordingState('preview')
        }
        
        stream.getTracks().forEach((track) => track.stop())
      }

      // Initialize analyzer for visualizer
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        const audioContext = new AudioContextClass()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        audioContextRef.current = audioContext
        analyserRef.current = analyser
        dataArrayRef.current = dataArray
        sourceRef.current = source
      }

      mediaRecorder.start()
      setRecordingState('recording')
      setRecordingDuration(0)
      recordingDurationRef.current = 0

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const next = prev + 1
          recordingDurationRef.current = next
          return next
        })
      }, 1000)
    } catch (err: any) {
      console.error("Erro no microfone:", err)
      alert("Não foi possível acessar o microfone. Verifique as permissões.")
    }
  }

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    sendImmediatelyRef.current = true
    mediaRecorderRef.current.stop()
  }

  const stopAndPreviewRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    sendImmediatelyRef.current = false
    mediaRecorderRef.current.stop()
  }

  const cancelRecording = () => {
    if (!mediaRecorderRef.current) {
      setRecordingState('idle')
      return
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    mediaRecorderRef.current.onstop = null
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    mediaRecorderRef.current.stream.getTracks().forEach((track: any) => track.stop())
    cleanupAudioNodes()

    setRecordingState('idle')
    setRecordingDuration(0)
    recordingDurationRef.current = 0
    audioBlobRef.current = null
  }

  const discardPreviewRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setRecordingState('idle')
    setPreviewUrl(null)
    audioBlobRef.current = null
  }

  const sendPreviewRecording = async () => {
    if (!audioBlobRef.current) return

    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const blobToSend = audioBlobRef.current
    setRecordingState('idle')
    setPreviewUrl(null)
    audioBlobRef.current = null

    await uploadAndSendAudioBlob(blobToSend)
  }

  const uploadAndSendAudioBlob = async (blob: Blob) => {
    setIsUploadingAudio(true)
    try {
      const audioFile = new File([blob], `gravar_${Date.now()}.ogg`, { type: "audio/ogg" })
      const tenantId = activeTenant?.id || "t-1"
      const url = await vehicleService.uploadImage(tenantId, audioFile)

      await whatsappService.sendFreeTextMessage(
        activeChat!.phone,
        activeChat!.name,
        "[Áudio]",
        undefined,
        "audio",
        url
      )

      if (aiEnabled && !aiPausedPhones.includes(activeChat!.phone)) {
        setAiPausedPhones(prev => [...prev, activeChat!.phone])
      }

      const newMsg: ChatMessage = {
        id: `wamid.local_${Date.now()}`,
        sender: "agent",
        text: "[Áudio]",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        messageType: "audio",
        variables: { audioUrl: url }
      }
      setActiveChatMessages(prev => [...prev, newMsg])
    } catch (err: any) {
      console.error(err)
      alert("Erro ao enviar áudio gravado: " + (err.message || err))
    } finally {
      setIsUploadingAudio(false)
    }
  }

  const cleanupAudioNodes = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    dataArrayRef.current = null
  }

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    const bufferLength = analyser.frequencyBinCount

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return
      animationFrameIdRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, width, height)

      const barWidth = 2
      const barGap = 2
      const barCount = Math.floor(width / (barWidth + barGap))
      
      ctx.fillStyle = "#10b981" // Emerald

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[dataIndex]
        const percent = value / 255
        const barHeight = Math.max(2, percent * height * 0.8)
        const x = i * (barWidth + barGap)
        const y = (height - barHeight) / 2

        ctx.beginPath()
        if ((ctx as any).roundRect) {
          ;(ctx as any).roundRect(x, y, barWidth, barHeight, 1)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }
    }

    draw()
  }

  // Preview playback handlers
  const handlePreviewTimeUpdate = () => {
    if (previewAudioRef.current) {
      setPreviewCurrentTime(previewAudioRef.current.currentTime)
    }
  }

  const handlePreviewLoadedMetadata = () => {
    if (previewAudioRef.current) {
      setPreviewDuration(previewAudioRef.current.duration)
    }
  }

  const handlePreviewEnded = () => {
    setIsPreviewPlaying(false)
    setPreviewCurrentTime(0)
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = 0
    }
  }

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return
    if (isPreviewPlaying) {
      previewAudioRef.current.pause()
      setIsPreviewPlaying(false)
    } else {
      previewAudioRef.current.play()
      setIsPreviewPlaying(true)
    }
  }

  const handlePreviewProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setPreviewCurrentTime(time)
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = time
    }
  }

  // Timer cleanup and initial effect
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  // Draw visualizer loop when recordingState becomes 'recording'
  useEffect(() => {
    if (recordingState === 'recording' && canvasRef.current && analyserRef.current) {
      drawWaveform()
    }
    return () => {
      cleanupAudioNodes()
    }
  }, [recordingState])

  const getAvatarInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Load contacts/chats list from backend
  const loadChats = async (silent = false) => {
    if (!activeTenant) return
    if (!silent) setLoading(true)
    try {
      const chatsData = await whatsappService.getChats()

      const mappedContacts: ChatContact[] = chatsData.map((c: any) => {
        // Read tags and notes from localStorage if present
        let savedTags: string[] = []
        let savedNotes = ""
        if (typeof window !== "undefined") {
          savedTags = JSON.parse(localStorage.getItem(`wa_tags_${c.recipientPhone}`) || "[]")
          savedNotes = localStorage.getItem(`wa_notes_${c.recipientPhone}`) || ""
        }

        return {
          id: c.recipientPhone,
          name: c.recipientName,
          phone: c.recipientPhone,
          company: "Cliente WhatsApp",
          queue: "Comercial",
          responsible: "Você",
          avatarInitials: getAvatarInitials(c.recipientName),
          unreadCount: c.unreadCount || 0,
          lastMsgTime: formatTime(c.lastMessageTime),
          lastMsgText: c.lastMessageText,
          lastInboundMessageTime: c.lastInboundMessageTime || null,
          tags: savedTags,
          notes: savedNotes,
          messages: []
        }
      })

      setContacts(mappedContacts)

      // Auto-select chat if phone query parameter exists or select first
      if (phoneParam) {
        const cleanPhone = phoneParam.replace(/\D/g, "")
        const found = mappedContacts.find(c => c.phone.replace(/\D/g, "") === cleanPhone)
        if (found) {
          setSelectedChatPhone(found.phone)
        } else {
          // If not in the list, create a placeholder contact
          const placeholderContact: ChatContact = {
            id: phoneParam,
            name: nameParam || phoneParam,
            phone: phoneParam,
            company: "Cliente WhatsApp",
            queue: "Comercial",
            responsible: "Você",
            avatarInitials: getAvatarInitials(nameParam || phoneParam),
            unreadCount: 0,
            lastMsgTime: "Agora",
            lastMsgText: "Nova conversa iniciada...",
            lastInboundMessageTime: null,
            tags: [],
            notes: "",
            messages: []
          }
          mappedContacts.unshift(placeholderContact)
          setContacts(mappedContacts)
          setSelectedChatPhone(phoneParam)
        }
      } else if (!selectedChatPhone && mappedContacts.length > 0 && !silent) {
        setSelectedChatPhone(mappedContacts[0].phone)
      }
    } catch (err) {
      console.error("Erro ao obter chats:", err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Load messages for the selected chat
  const loadMessages = async (phone: string, silent = false) => {
    try {
      const messagesData = await whatsappService.getChatMessages(phone)
      const mappedMessages: ChatMessage[] = messagesData.map((m: any) => ({
        id: m.id,
        sender: m.messageDirection === "inbound" ? "lead" : "agent",
        text: m.bodyText,
        time: formatTime(m.createdAt),
        status: m.status,
        messageType: m.messageType,
        variables: m.variables,
      }))
      setActiveChatMessages(mappedMessages)
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err)
    }
  }

  // Initial load
  useEffect(() => {
    loadChats()
    const loadTemplates = async () => {
      if (!activeTenant) return
      try {
        const data = await whatsappService.getTemplates()
        // Only keep approved templates
        const approved = data.filter(t => t.status === "APPROVED")
        setTemplates(approved)
      } catch (err) {
        console.error("Erro ao obter templates:", err)
      }
    }
    const loadSettings = async () => {
      if (!activeTenant) return
      try {
        const configData = await whatsappService.getConfig()
        setAiEnabled(configData.aiEnabled || false)
        setAiPausedPhones(configData.aiPausedPhones || [])
      } catch (err) {
        console.error("Erro ao obter configurações de IA:", err)
      }
    }
    loadTemplates()
    loadSettings()
  }, [activeTenant])

  // Load messages when selected chat changes
  useEffect(() => {
    if (selectedChatPhone) {
      loadMessages(selectedChatPhone)
    } else {
      setActiveChatMessages([])
    }
  }, [selectedChatPhone])

  // Fetch CRM contact when active chat changes
  useEffect(() => {
    const fetchCrmContact = async () => {
      if (!selectedChatPhone) {
        setCrmContact(null)
        return
      }
      try {
        const results = await crmService.getContacts({ q: selectedChatPhone })
        const matched = results.find(
          c => c.phone.replace(/\D/g, "") === selectedChatPhone.replace(/\D/g, "")
        )
        if (matched) {
          setCrmContact(matched)
        } else {
          setCrmContact(null)
        }
      } catch (err) {
        console.error("Erro ao carregar contato do CRM no chat:", err)
        setCrmContact(null)
      }
    }
    fetchCrmContact()
  }, [selectedChatPhone])

  // Polling for incoming messages & chat updates (every 2.5 seconds)
  useEffect(() => {
    if (!activeTenant) return

    const interval = setInterval(() => {
      loadChats(true) // silent refresh chats list
      if (selectedChatPhone) {
        loadMessages(selectedChatPhone, true) // silent refresh message feed
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [activeTenant, selectedChatPhone])

  // Load team members when transfer modal opens
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!showTransferModal) return
      setLoadingMembers(true)
      try {
        const members = await teamService.getMembers()
        setTeamMembers(members)
        if (members.length > 0) {
          setSelectedMemberId(members[0].id)
        }
      } catch (err) {
        console.error("Erro ao carregar membros da equipe:", err)
      } finally {
        setLoadingMembers(false)
      }
    }
    loadTeamMembers()
  }, [showTransferModal])

  // Active chat object
  const activeChat = useMemo(() => {
    return contacts.find(c => c.phone === selectedChatPhone) || null
  }, [contacts, selectedChatPhone])

  // Active chat window calculation (24h rule)
  const windowStatus = useMemo(() => {
    if (!activeChat || !activeChat.lastInboundMessageTime) {
      return { isOpen: false, remainingText: "" }
    }
    const lastInbound = new Date(activeChat.lastInboundMessageTime).getTime()
    const now = Date.now()
    const diff = now - lastInbound
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (diff >= twentyFourHours) {
      return { isOpen: false, remainingText: "" }
    }

    const remainingMs = twentyFourHours - diff
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60))
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

    return {
      isOpen: true,
      remainingText: `${remainingHours}h ${remainingMinutes}m`
    }
  }, [activeChat])

  // Check if AI is currently active for the selected chat
  const isAiActive = useMemo(() => {
    return !!(aiEnabled && activeChat && !aiPausedPhones.includes(activeChat.phone))
  }, [aiEnabled, activeChat, aiPausedPhones])

  // Currently selected template
  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || null
  }, [templates, selectedTemplateId])

  // Replace {{1}}, {{2}} with user-provided parameters in template body
  const renderTemplatePreview = (tpl: WhatsappTemplate) => {
    let text = tpl.bodyText
    if (tpl.variables && tpl.variables.length > 0) {
      tpl.variables.forEach((vName: string, index: number) => {
        const varNum = index + 1
        const val = templateVariables[`param${varNum}`] || `[${vName}]`
        text = text.replace(new RegExp(`\\{\\{${varNum}\\}\\}`, 'g'), val)
      })
    }
    return text
  }

  // Validate if all variables for the template are filled
  const areVariablesFilled = (tpl: WhatsappTemplate | null) => {
    if (!tpl) return false
    if (!tpl.variables || tpl.variables.length === 0) return true
    for (let i = 0; i < tpl.variables.length; i++) {
      const varNum = i + 1
      const val = templateVariables[`param${varNum}`]
      if (!val || !val.trim()) return false
    }
    return true
  }

  // Send WhatsApp Template Message
  const handleSendTemplateMessage = async () => {
    if (!activeChat || !selectedTemplate) return
    setSendingTemplate(true)
    try {
      await whatsappService.sendTemplate(
        activeChat.name,
        activeChat.phone,
        selectedTemplate.name,
        templateVariables
      )

      if (aiEnabled && !aiPausedPhones.includes(activeChat.phone)) {
        setAiPausedPhones(prev => [...prev, activeChat.phone])
      }
      setSelectedTemplateId("")
      setTemplateVariables({})
      // Force reload messages right away
      await loadMessages(activeChat.phone, true)
    } catch (err: any) {
      alert(err.message || "Falha ao disparar template.")
    } finally {
      setSendingTemplate(false)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!activeChatMessages || activeChatMessages.length === 0) {
      lastScrollMsgCountRef.current = 0
      return
    }

    const selectedChatChanged = lastScrollPhoneRef.current !== selectedChatPhone
    const msgCountIncreased = activeChatMessages.length > lastScrollMsgCountRef.current

    if (selectedChatChanged || msgCountIncreased) {
      messagesEndRef.current?.scrollIntoView({ behavior: selectedChatChanged ? "auto" : "smooth" })
      lastScrollPhoneRef.current = selectedChatPhone
      lastScrollMsgCountRef.current = activeChatMessages.length
    }
  }, [activeChatMessages, selectedChatPhone])

  // Filter contacts list
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      if (!matchesSearch) return false

      if (filterTab === "nao_lidas") return c.unreadCount > 0
      if (filterTab === "abertas") return c.responsible === "Você"
      if (filterTab === "pendentes") return c.responsible === "Sem Atendente"

      return c.responsible !== "Encerrada"
    })
  }, [contacts, searchTerm, filterTab])

  // Action buttons
  const handleAssignToMe = () => {
    if (!activeChat) return
    setContacts(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return { ...c, responsible: "Você" }
      }
      return c
    }))
  }

  const handlePauseAi = async () => {
    if (!activeChat) return
    try {
      await whatsappService.pauseAi(activeChat.phone)
      setAiPausedPhones(prev => [...prev, activeChat.phone])
      handleAssignToMe()
    } catch (err: any) {
      alert(err.message || "Erro ao pausar a IA.")
    }
  }

  const handleResumeAi = async () => {
    if (!activeChat) return
    try {
      await whatsappService.resumeAi(activeChat.phone)
      setAiPausedPhones(prev => prev.filter(p => p !== activeChat.phone))
      setContacts(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          return { ...c, responsible: "Sem Atendente" }
        }
        return c
      }))
    } catch (err: any) {
      alert(err.message || "Erro ao retomar a IA.")
    }
  }

  const handleRevokeMessage = async (messageId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta mensagem para todos os participantes?")) return
    try {
      await whatsappService.revokeMessage(messageId)
      
      // Update local state immediately
      setActiveChatMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            text: "Esta mensagem foi apagada.",
            variables: {
              ...(m.variables || {}),
              isDeleted: "true"
            }
          }
        }
        return m
      }))
    } catch (err: any) {
      alert(err.message || "Erro ao apagar mensagem.")
    }
  }

  const handleTransferChat = () => {
    if (!activeChat) return
    setShowTransferModal(true)
  }

  const confirmTransferChat = () => {
    if (!activeChat) return
    const selectedMember = teamMembers.find(m => m.id === selectedMemberId)
    if (!selectedMember) {
      alert("Selecione um membro da equipe válido.")
      return
    }

    setContacts(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          queue: selectedQueue,
          responsible: selectedMember.name
        }
      }
      return c
    }))

    setShowTransferModal(false)
    alert(`Conversa transferida para ${selectedMember.name} (Fila: ${selectedQueue})!`)
  }

  const handleCrmStatusChange = async (newStatus: string) => {
    if (!crmContact) return
    try {
      const updated = await crmService.updateContact(crmContact.id, { status: newStatus as any })
      setCrmContact(updated)
    } catch (err) {
      console.error("Erro ao atualizar status CRM:", err)
      alert("Não foi possível atualizar o status no CRM.")
    }
  }

  const handleCloseChat = async () => {
    if (!activeChat) return
    if (confirm("Tem certeza de que deseja encerrar este atendimento?")) {
      if (crmContact) {
        try {
          const updated = await crmService.updateContact(crmContact.id, { status: "WAITING_CUSTOMER" })
          setCrmContact(updated)
        } catch (err) {
          console.error("Erro ao atualizar status CRM ao encerrar chat:", err)
        }
      }

      setContacts(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          return { ...c, responsible: "Encerrada" }
        }
        return c
      }))
      setSelectedChatPhone("")
    }
  }

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChat) return

    const messageText = inputText
    setInputText("")

    // Optimistic UI updates
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      sender: "agent",
      text: messageText,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "sent"
    }
    setActiveChatMessages(prev => [...prev, optimisticMessage])

    try {
      await whatsappService.sendFreeTextMessage(
        activeChat.phone,
        activeChat.name,
        messageText
      )

      if (aiEnabled && !aiPausedPhones.includes(activeChat.phone)) {
        setAiPausedPhones(prev => [...prev, activeChat.phone])
      }
      // Force reload messages right away
      await loadMessages(activeChat.phone, true)
    } catch (err: any) {
      alert(err.message || "Falha ao enviar mensagem.")
      // Remove optimistic message on error
      setActiveChatMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleSendSpecialMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!activeChat) return

    try {
      let type: "text" | "image" | "interactive" | "audio" = "text"
      let bodyText = ""
      let imageUrl = ""
      let interactiveType: "cta_url" | "list" | "button" | undefined = undefined
      let interactiveData: any = undefined

      if (activeAttachmentType === "audio") {
        type = "audio"
        imageUrl = attachAudioLink
        bodyText = "[Áudio]"
      } else if (activeAttachmentType === "image") {
        type = "image"
        imageUrl = attachImageLink
        bodyText = attachCaption
      } else if (activeAttachmentType === "cta_url") {
        type = "interactive"
        interactiveType = "cta_url"
        interactiveData = {
          headerText: interactiveHeader || undefined,
          bodyText: interactiveBody,
          footerText: interactiveFooter || undefined,
          buttonLabel: interactiveButtonLabel,
          url: interactiveUrl,
        }
        bodyText = `[Botão Link] ${interactiveBody}`
      } else if (activeAttachmentType === "list") {
        type = "interactive"
        interactiveType = "list"

        const sections = [
          {
            title: listSectionTitle,
            rows: [
              { id: listRow1Id, title: listRow1Title, description: listRow1Desc || undefined },
              ...(listRow2Title ? [{ id: listRow2Id, title: listRow2Title, description: listRow2Desc || undefined }] : [])
            ]
          }
        ]

        interactiveData = {
          headerText: interactiveHeader || undefined,
          bodyText: interactiveBody,
          footerText: interactiveFooter || undefined,
          buttonLabel: interactiveButtonLabel,
          sections,
        }
        bodyText = `[Lista] ${interactiveBody}`
      } else if (activeAttachmentType === "button") {
        type = "interactive"
        interactiveType = "button"

        const buttons = [
          { id: quickReply1Id, title: quickReply1Title },
          ...(quickReply2Title ? [{ id: quickReply2Id, title: quickReply2Title }] : []),
          ...(quickReply3Title ? [{ id: quickReply3Id, title: quickReply3Title }] : [])
        ]

        interactiveData = {
          headerText: interactiveHeader || undefined,
          bodyText: interactiveBody,
          footerText: interactiveFooter || undefined,
          buttons,
        }
        bodyText = `[Botões de Resposta] ${interactiveBody}`
      }

      await whatsappService.sendFreeTextMessage(
        activeChat.phone,
        activeChat.name,
        bodyText,
        undefined,
        type,
        imageUrl,
        interactiveType,
        interactiveData
      )

      if (aiEnabled && !aiPausedPhones.includes(activeChat.phone)) {
        setAiPausedPhones(prev => [...prev, activeChat.phone])
      }

      // Add to local message list immediately
      const newMsg: ChatMessage = {
        id: `wamid.local_${Date.now()}`,
        sender: "agent",
        text: type === "image" ? `[Imagem] ${bodyText || imageUrl}` : type === "audio" ? "[Áudio]" : bodyText,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        messageType: type,
        variables: type === "image"
          ? { imageUrl, caption: bodyText }
          : type === "audio"
            ? { audioUrl: imageUrl }
            : { interactiveType: interactiveType || "", interactiveData: JSON.stringify(interactiveData || {}) }
      }

      setActiveChatMessages(prev => [...prev, newMsg])

      // Update contact status
      setContacts(prev => prev.map(c => {
        if (c.phone === activeChat.phone) {
          return {
            ...c,
            lastMsgText: newMsg.text,
            lastMsgTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          }
        }
        return c
      }))

      // Reset states
      setActiveAttachmentType(null)
      setAttachImageLink("")
      setAttachCaption("")
      setInteractiveHeader("")
      setInteractiveBody("")
      setInteractiveFooter("")
      setInteractiveButtonLabel("")
      setInteractiveUrl("")
      setListRow1Title("")
      setListRow1Desc("")
      setListRow2Title("")
      setListRow2Desc("")
      setQuickReply1Title("")
      setQuickReply2Title("")
      setQuickReply3Title("")

      alert("Mensagem enviada com sucesso!")
    } catch (err: any) {
      alert(err.message || "Erro ao enviar mensagem.")
    }
  }

  // Update Notes
  const handleNotesChange = (text: string) => {
    if (!activeChat) return

    // Save to local storage for persistence
    localStorage.setItem(`wa_notes_${activeChat.phone}`, text)

    setContacts(prev => prev.map(c => {
      if (c.phone === activeChat.phone) {
        return { ...c, notes: text }
      }
      return c
    }))
  }

  // Manage tags
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagText.trim() || !activeChat) return

    const cleanTag = newTagText.trim()
    const updatedTags = activeChat.tags.includes(cleanTag) ? activeChat.tags : [...activeChat.tags, cleanTag]

    // Save to local storage
    localStorage.setItem(`wa_tags_${activeChat.phone}`, JSON.stringify(updatedTags))

    setContacts(prev => prev.map(c => {
      if (c.phone === activeChat.phone) {
        return { ...c, tags: updatedTags }
      }
      return c
    }))

    setNewTagText("")
    setShowTagInput(false)
  }

  const handleRemoveTag = (tag: string) => {
    if (!activeChat) return
    const updatedTags = activeChat.tags.filter(t => t !== tag)

    // Save to local storage
    localStorage.setItem(`wa_tags_${activeChat.phone}`, JSON.stringify(updatedTags))

    setContacts(prev => prev.map(c => {
      if (c.phone === activeChat.phone) {
        return { ...c, tags: updatedTags }
      }
      return c
    }))
  }

  const getQueueColor = (queue: ChatContact["queue"]) => {
    switch (queue) {
      case "Comercial":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
      case "Suporte":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
      case "Financeiro":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
    }
  }

  return (
    <div className="h-screen overflow-hidden flex bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm animate-in fade-in duration-200">

      {/* COLUMN 1: CONVERSATIONS LIST (320px) */}
      <div className="w-80 border-r border-neutral-200 flex flex-col dark:border-neutral-800 shrink-0">

        {/* Search */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="chat-search"
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800/60 flex gap-1 bg-neutral-50/50 dark:bg-neutral-900/10">
          {[
            { id: "todas", label: "Todas" },
            { id: "nao_lidas", label: "Não lidas" },
            { id: "abertas", label: "Abertas" },
            { id: "pendentes", label: "Pendentes" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${filterTab === tab.id
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contacts List Scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900">
          {loading ? (
            <div className="p-8 text-center text-neutral-400 text-xs flex items-center justify-center gap-1.5">
              <RefreshCw className="size-4 animate-spin" />
              Carregando conversas...
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map(c => {
              const isSelected = c.phone === selectedChatPhone
              return (
                <div
                  key={c.phone}
                  onClick={() => setSelectedChatPhone(c.phone)}
                  className={`p-4 flex gap-3 cursor-pointer transition-colors relative ${isSelected
                    ? "bg-neutral-50 dark:bg-neutral-900/40"
                    : "hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                    }`}
                >
                  {/* Status dot / Initials avatar */}
                  <div className="relative size-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                    {c.avatarInitials}
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {c.lastMsgTime}
                      </span>
                    </div>

                    <p className={`text-xs truncate pr-4 mt-0.5 ${c.unreadCount > 0 ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
                      {c.lastMsgText || "Nenhuma mensagem"}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${getQueueColor(c.queue)}`}>
                        {c.queue}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="size-4.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
              <MessageSquare className="size-6 text-neutral-300 dark:text-neutral-700" />
              Nenhuma conversa encontrada
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: ACTIVE CHAT SCREEN */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-neutral-50/20 dark:bg-neutral-900/5">

          {/* Header */}
          <div className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-950">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300">
                {activeChat.avatarInitials}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{activeChat.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    online (oficial)
                  </span>
                  {aiEnabled && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      {aiPausedPhones.includes(activeChat.phone) ? (
                        <span className="font-semibold text-neutral-500 dark:text-neutral-450 flex items-center gap-0.5">
                          <Brain className="size-3 text-neutral-400" />
                          IA Pausada
                        </span>
                      ) : (
                        <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-0.5 animate-in fade-in duration-200">
                          <Brain className="size-3 animate-pulse text-violet-500 dark:text-violet-400" />
                          IA Respondendo
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {aiEnabled ? (
                activeChat.responsible !== "Você" ? (
                  <Button
                    onClick={aiPausedPhones.includes(activeChat.phone) ? handleAssignToMe : handlePauseAi}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1 dark:bg-neutral-900 text-neutral-700 hover:text-neutral-900 dark:text-neutral-350 dark:hover:text-white"
                  >
                    <UserCheck className="size-3.5" /> Assumir
                  </Button>
                ) : aiPausedPhones.includes(activeChat.phone) ? (
                  <Button
                    onClick={handleResumeAi}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1 dark:bg-neutral-900 text-violet-650 hover:text-violet-750 hover:bg-violet-50/50 dark:text-violet-450 dark:hover:text-violet-350 dark:hover:bg-violet-950/20 border-violet-200 dark:border-violet-900/30"
                  >
                    <Play className="size-3.5" /> Devolver para IA
                  </Button>
                ) : (
                  <Button
                    onClick={handlePauseAi}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1 dark:bg-neutral-900 text-amber-650 hover:text-amber-750 hover:bg-amber-50/50 dark:text-amber-450 dark:hover:text-amber-350 dark:hover:bg-amber-950/20 border-amber-200 dark:border-amber-900/30"
                  >
                    <Pause className="size-3.5" /> Pausar IA
                  </Button>
                )
              ) : (
                activeChat.responsible !== "Você" ? (
                  <Button
                    onClick={handleAssignToMe}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1 dark:bg-neutral-900"
                  >
                    <UserCheck className="size-3.5" /> Assumir
                  </Button>
                ) : (
                  <span className="text-[11px] font-semibold text-neutral-400 mr-2 bg-neutral-100 px-2 py-0.5 rounded dark:bg-neutral-800 dark:text-neutral-300">
                    Atribuído a você
                  </span>
                )
              )}
              <div className="border-l border-neutral-200 pl-1 ml-1 h-5 dark:border-neutral-800" />
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                >
                  <MoreVertical className="size-4" />
                </Button>
                {showActionsDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowActionsDropdown(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900 z-40 animate-in fade-in slide-in-from-top-1 duration-100">
                      <button
                        onClick={() => {
                          setShowActionsDropdown(false)
                          handleTransferChat()
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        <UserX className="size-3.5 text-neutral-400" />
                        Transferir
                      </button>
                      <button
                        onClick={() => {
                          setShowActionsDropdown(false)
                          handleCloseChat()
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-650 hover:bg-red-50 dark:text-red-450 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <XCircle className="size-3.5 text-red-500" />
                        Encerrar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 24-Hour Conversation Window Banner */}
          {windowStatus.isOpen ? (
            <div className="bg-emerald-50/70 border-b border-emerald-100/60 px-6 py-2 flex items-center justify-between text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-medium">Janela de conversação ativa. Você pode enviar mensagens livres.</span>
              </div>
              <span className="font-semibold text-[10px] bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-350 shrink-0">
                Expira em: {windowStatus.remainingText}
              </span>
            </div>
          ) : (
            <div className="bg-amber-50/70 border-b border-amber-100/60 px-6 py-2 flex items-center justify-between text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="font-medium">Janela de conversação fechada. Envie um modelo (template) oficial para reiniciar.</span>
              </div>
              <span className="font-semibold text-[10px] bg-amber-100 text-amber-850 px-2 py-0.5 rounded border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/30 dark:text-amber-350 shrink-0">
                Apenas templates
              </span>
            </div>
          )}

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex justify-center my-2">
              <span className="text-[10px] font-bold text-neutral-400 bg-white border border-neutral-100 rounded-full px-3 py-0.5 dark:bg-neutral-900 dark:border-neutral-800">
                Histórico de Mensagens
              </span>
            </div>

            {activeChatMessages.map((m) => {
              const isLead = m.sender === "lead"
              const isDeleted = m.variables?.isDeleted === "true"
              return (
                <div key={m.id} className={`flex ${isLead ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-150`}>
                  <div className={`relative group max-w-[70%] rounded-xl px-4 py-2.5 shadow-3xs ${
                    isDeleted
                      ? "bg-neutral-100 text-neutral-500 border border-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-400 dark:border-neutral-800/80"
                      : isLead
                        ? "bg-white text-neutral-800 border border-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800"
                        : "bg-emerald-500 text-neutral-950 dark:bg-emerald-500"
                  }`}>
                    {/* Trash/Revoke Button for outbound messages */}
                    {!isLead && !isDeleted && (
                      <button
                        type="button"
                        onClick={() => handleRevokeMessage(m.id)}
                        className="absolute left-[-42px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-neutral-400 hover:text-rose-500 cursor-pointer bg-white dark:bg-neutral-900 rounded-full shadow-xs border border-neutral-200 dark:border-neutral-800 hover:scale-105 transition-all duration-200 flex items-center justify-center z-10"
                        title="Apagar para todos"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}

                    {/* Render message body content */}
                    {isDeleted ? (
                      <p className="text-xs italic text-neutral-400 dark:text-neutral-500">Esta mensagem foi apagada.</p>
                    ) : m.messageType === "image" ? (
                      <div className="space-y-2">
                        {m.variables?.imageUrl && (
                          <img
                            src={m.variables.imageUrl}
                            alt="WhatsApp Media"
                            className="max-h-60 rounded-md object-cover w-full border border-neutral-100/10"
                          />
                        )}
                        {m.variables?.caption && (
                          <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{m.variables.caption}</p>
                        )}
                      </div>
                    ) : m.messageType === "audio" ? (
                      <div className="py-1.5 min-w-[260px]">
                        <audio
                          src={m.variables?.audioUrl || m.variables?.imageUrl}
                          controls
                          className="w-full text-xs outline-none"
                        />
                      </div>
                    ) : m.messageType === "interactive" ? (
                      (() => {
                        const type = m.variables?.interactiveType
                        let data: any = {}
                        try {
                          data = JSON.parse(m.variables?.interactiveData || "{}")
                        } catch {
                          data = {}
                        }

                        if (type === "cta_url") {
                          return (
                            <div className="flex flex-col rounded-lg bg-emerald-600/90 text-white dark:bg-emerald-600/90 overflow-hidden min-w-[200px]">
                              {data.headerText && (
                                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase opacity-75 border-b border-white/10">
                                  {data.headerText}
                                </div>
                              )}
                              <div className="px-3 py-2.5 text-xs font-semibold leading-relaxed">
                                {data.bodyText}
                              </div>
                              {data.footerText && (
                                <div className="px-3 pb-2 text-[9px] opacity-70 leading-relaxed">
                                  {data.footerText}
                                </div>
                              )}
                              <a
                                href={data.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-700/80 hover:bg-emerald-850/80 text-xs font-bold text-center text-white border-t border-white/15 transition-colors cursor-pointer"
                              >
                                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                                </svg>
                                {data.buttonLabel || "Acessar Link"}
                              </a>
                            </div>
                          )
                        } else if (type === "button") {
                          return (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              {data.headerText && (
                                <div className="text-[10px] font-bold tracking-wide uppercase opacity-75">
                                  {data.headerText}
                                </div>
                              )}
                              <div className="text-xs font-semibold leading-relaxed">
                                {data.bodyText}
                              </div>
                              {data.footerText && (
                                <div className="text-[9px] opacity-70">
                                  {data.footerText}
                                </div>
                              )}
                              <div className="flex flex-col gap-1.5 mt-2">
                                {(data.buttons || []).map((btn: any) => (
                                  <div
                                    key={btn.id}
                                    className="flex items-center justify-center py-2 bg-emerald-600/50 hover:bg-emerald-600/70 border border-emerald-400/20 text-neutral-900 rounded-md text-xs font-bold text-center cursor-default select-none"
                                  >
                                    {btn.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        } else if (type === "list") {
                          return (
                            <div className="flex flex-col gap-2 min-w-[220px]">
                              {data.headerText && (
                                <div className="text-[10px] font-bold tracking-wide uppercase opacity-75">
                                  {data.headerText}
                                </div>
                              )}
                              <div className="text-xs font-semibold leading-relaxed">
                                {data.bodyText}
                              </div>
                              {data.footerText && (
                                <div className="text-[9px] opacity-70">
                                  {data.footerText}
                                </div>
                              )}

                              <div className="mt-2.5 border-t border-white/10 pt-2.5">
                                <div className="flex items-center justify-between text-xs font-bold px-3 py-2 bg-emerald-600/50 hover:bg-emerald-600/70 border border-emerald-400/20 text-neutral-900 rounded-md cursor-default select-none">
                                  <span>📋 {data.buttonLabel || "Selecionar Opção"}</span>
                                </div>
                                <div className="mt-2 pl-2 border-l-2 border-emerald-400/40 space-y-1.5">
                                  <div className="text-[9px] font-bold text-neutral-700 uppercase tracking-wider">
                                    {(data.sections || [])[0]?.title || "Opções"}
                                  </div>
                                  {(data.sections || []).flatMap((s: any) => s.rows || []).map((r: any) => (
                                    <div key={r.id} className="text-[10px] leading-relaxed">
                                      <div className="font-semibold text-neutral-900">• {r.title}</div>
                                      {r.description && <div className="text-[9px] opacity-80 pl-2.5">{r.description}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{m.text}</p>
                      })()
                    ) : (
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{m.text}</p>
                    )}
                    {m.variables?.flowResponse && !isDeleted && (
                      <button
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(m.variables!.flowResponse)
                            setSelectedFlowResponse({
                              name: m.variables!.flowName || "Formulário",
                              data: parsed
                            })
                          } catch (e) {
                            console.error("Erro ao analisar resposta do flow:", e)
                          }
                        }}
                        className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg text-[11px] shadow-2xs transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                      >
                        <FileText className="size-3.5 text-emerald-500" />
                        Ver Respostas do Formulário
                      </button>
                    )}
                    <div className="flex justify-end items-center gap-1 mt-1 text-[9px] opacity-65">
                      {m.variables?.sentBy === "ai" && !isDeleted && (
                        <span className="flex items-center gap-0.5 bg-violet-650/15 text-violet-950 dark:text-violet-200 px-1 rounded mr-1 font-bold">
                          <Brain className="size-2.5" /> IA
                        </span>
                      )}
                      <span>{m.time}</span>
                      {!isLead && !isDeleted && m.status === "read" && (
                        <CheckCheck className="size-3.5" />
                      )}
                      {!isLead && !isDeleted && m.status === "delivered" && (
                        <CheckCheck className="size-3.5 text-neutral-800" />
                      )}
                      {!isLead && !isDeleted && m.status === "sent" && (
                        <span className="text-[10px]">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-4 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            {isAiActive ? (
              <div className="rounded-lg border border-violet-100 bg-violet-50/20 p-4 dark:border-violet-950/30 dark:bg-violet-950/10 space-y-3 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="size-10 rounded-full bg-violet-100/60 dark:bg-violet-900/40 flex items-center justify-center">
                  <Brain className="size-5 text-violet-600 dark:text-violet-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-violet-900 dark:text-violet-300">Respostas Automáticas por IA Ativas</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-450 max-w-md mx-auto leading-relaxed">
                    O agente de IA está controlando esta conversa. O teclado está bloqueado para evitar respostas conflitantes. Assuma a conversa para desativar a IA e responder manualmente.
                  </p>
                </div>
                <Button
                  onClick={handlePauseAi}
                  className="h-8.5 px-4 text-xs font-semibold bg-violet-600 hover:bg-violet-750 text-white dark:bg-violet-500 dark:hover:bg-violet-600 rounded-lg shadow-sm gap-1.5 cursor-pointer mt-1"
                >
                  <UserCheck className="size-3.5" /> Assumir e Liberar Teclado
                </Button>
              </div>
            ) : !windowStatus.isOpen ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/15 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Janela de Conversação Fechada</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">
                      O cliente não interage há mais de 24 horas. As regras oficiais da Meta exigem o uso de um **Template Aprovado** para reabrir a conversa.
                    </p>
                  </div>
                </div>

                {/* Template Selector dropdown */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Selecione um Modelo (Template)
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => {
                        setSelectedTemplateId(e.target.value)
                        setTemplateVariables({})
                      }}
                      className="w-full text-xs rounded-md border border-neutral-200 bg-white p-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="">-- Selecione o template para iniciar --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                      ))}
                    </select>
                  </div>

                  {/* Variables Input fields if any variables are required */}
                  {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-neutral-100 dark:border-neutral-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Preencha as Variáveis do Modelo
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedTemplate.variables.map((vName: string, index: number) => {
                          const varNum = index + 1
                          return (
                            <div key={index} className="flex flex-col gap-1">
                              <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                {`{{${varNum}}}`} ({vName})
                              </label>
                              <Input
                                type="text"
                                placeholder={`Valor para ${vName}`}
                                value={templateVariables[`param${varNum}`] || ""}
                                onChange={(e) => setTemplateVariables(prev => ({
                                  ...prev,
                                  [`param${varNum}`]: e.target.value
                                }))}
                                className="h-8 text-xs"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Template Preview display */}
                  {selectedTemplate && (
                    <div className="p-3 bg-neutral-100/50 dark:bg-neutral-950/60 rounded-md border border-neutral-200/50 dark:border-neutral-800/80">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Pré-visualização do Envio
                      </span>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed italic">
                        {renderTemplatePreview(selectedTemplate)}
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleSendTemplateMessage}
                    disabled={!selectedTemplateId || sendingTemplate || !areVariablesFilled(selectedTemplate)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 h-9 text-xs font-semibold gap-1.5"
                  >
                    {sendingTemplate ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        Disparando Template...
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        Disparar Template Oficial
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : recordingState !== 'idle' ? (
              <div className="flex gap-3 items-center w-full bg-neutral-50 dark:bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
                {/* Trash/Cancel Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={recordingState === 'preview' ? discardPreviewRecording : cancelRecording}
                  className="h-8.5 w-8.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full shrink-0 transition-colors cursor-pointer"
                  title="Descartar gravação"
                >
                  <Trash2 className="size-4.5" />
                </Button>

                {recordingState === 'recording' ? (
                  // Active recording layout
                  <>
                    {/* Flashing Red Dot & Timer */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300">
                        {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>

                    {/* Waveform Visualizer Canvas */}
                    <div className="flex-1 h-8 bg-neutral-100/50 dark:bg-neutral-950/40 rounded-md px-2 flex items-center overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={200}
                        height={32}
                        className="w-full h-full block"
                      />
                    </div>

                    {/* Pause Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={stopAndPreviewRecording}
                      className="h-8.5 w-8.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 rounded-full shrink-0 cursor-pointer flex items-center justify-center"
                      title="Pausar e ouvir"
                    >
                      <Pause className="size-4" />
                    </Button>

                    {/* Send Immediately Button */}
                    <Button
                      type="button"
                      onClick={stopAndSendRecording}
                      disabled={isUploadingAudio}
                      className="h-8.5 w-8.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-full shadow-sm cursor-pointer flex items-center justify-center"
                      title="Enviar áudio imediatamente"
                    >
                      {isUploadingAudio ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                    </Button>
                  </>
                ) : (
                  // Preview recording layout
                  <>
                    {/* Play/Pause preview */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePreviewPlay}
                      className="h-8.5 w-8.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/20 rounded-full shrink-0 cursor-pointer flex items-center justify-center"
                      title={isPreviewPlaying ? "Pausar" : "Ouvir"}
                    >
                      {isPreviewPlaying ? (
                        <Pause className="size-4 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Play className="size-4 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </Button>

                    {/* Styled Audio Progress Bar */}
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={previewDuration || 1}
                        step={0.01}
                        value={previewCurrentTime}
                        onChange={handlePreviewProgressChange}
                        className="flex-1 accent-emerald-500 h-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 cursor-pointer appearance-none"
                      />
                      <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">
                        {Math.floor(previewCurrentTime / 60)}:{(Math.floor(previewCurrentTime) % 60).toString().padStart(2, "0")}
                        {" / "}
                        {Math.floor(previewDuration / 60)}:{(Math.floor(previewDuration) % 60).toString().padStart(2, "0")}
                      </span>
                    </div>

                    {/* Send Button */}
                    <Button
                      type="button"
                      onClick={sendPreviewRecording}
                      disabled={isUploadingAudio}
                      className="h-8.5 w-8.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-full shadow-sm cursor-pointer flex items-center justify-center"
                      title="Enviar áudio"
                    >
                      {isUploadingAudio ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                    </Button>
                  </>
                )}

                {/* Hidden Audio Player for Preview */}
                {previewUrl && (
                  <audio
                    ref={previewAudioRef}
                    src={previewUrl}
                    onTimeUpdate={handlePreviewTimeUpdate}
                    onLoadedMetadata={handlePreviewLoadedMetadata}
                    onEnded={handlePreviewEnded}
                    className="hidden"
                  />
                )}
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-neutral-400 hover:text-neutral-500 shrink-0 cursor-pointer"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <Paperclip className="size-5" />
                  </Button>
                  {showAttachmentMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowAttachmentMenu(false)}
                      />
                      <div className="absolute left-0 bottom-full mb-2 w-56 rounded-md border border-neutral-200 bg-white py-1.5 shadow-md dark:border-neutral-800 dark:bg-neutral-900 z-40 animate-in fade-in slide-in-from-bottom-2 duration-100">
                        <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Enviar Mensagem Especial
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false)
                            setActiveAttachmentType("image")
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <FileText className="size-3.5 text-neutral-400" />
                          Mensagem com Imagem
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false)
                            setActiveAttachmentType("audio")
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <Mic className="size-3.5 text-neutral-400" />
                          Mensagem com Áudio
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false)
                            setActiveAttachmentType("cta_url")
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <Plus className="size-3.5 text-neutral-400" />
                          Botão com Link (CTA)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false)
                            setActiveAttachmentType("list")
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <MessageSquare className="size-3.5 text-neutral-400" />
                          Mensagem com Lista
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false)
                            setActiveAttachmentType("button")
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <CheckCheck className="size-3.5 text-neutral-400" />
                          Botões de Resposta Rápida
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-neutral-500 shrink-0">
                  <Smile className="size-5" />
                </Button>

                <Input
                  id="message-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite uma resposta rápida..."
                  className="flex-1 h-9.5"
                  autoComplete="off"
                />

                {inputText.trim() ? (
                  <Button type="submit" size="icon" className="h-9.5 w-9.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 dark:bg-emerald-500 dark:hover:bg-emerald-600 cursor-pointer rounded-full flex items-center justify-center">
                    <Send className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={startRecording}
                    disabled={isUploadingAudio}
                    size="icon"
                    className="h-9.5 w-9.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 shrink-0 cursor-pointer rounded-full flex items-center justify-center"
                    title="Gravar áudio"
                  >
                    {isUploadingAudio ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Mic className="size-4.5" />
                    )}
                  </Button>
                )}
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 text-sm">
          <MessageSquare className="size-10 text-neutral-300 dark:text-neutral-700 animate-pulse mb-3" />
          Selecione uma conversa para iniciar o atendimento ao vivo.
        </div>
      )}

      {/* COLUMN 3: CUSTOMER PROFILE DETAILS (300px) */}
      {activeChat && (
        <div className="w-72 border-l border-neutral-200 p-6 flex flex-col gap-6 overflow-y-auto dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">

          {/* Avatar Area */}
          <div className="flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-extrabold text-neutral-700 dark:text-neutral-300 mb-3">
              {activeChat.avatarInitials}
            </div>
            <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{activeChat.name}</h4>
            <span className="text-xs text-neutral-400 mt-1">{activeChat.phone}</span>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="icon" className="h-8.5 w-8.5 rounded-full dark:bg-neutral-900" title="Ligar">
                <Phone className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8.5 w-8.5 rounded-full dark:bg-neutral-900" title="Enviar Email">
                <Mail className="size-4" />
              </Button>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800/80 space-y-4">

            {/* Informações */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Informações</h5>

              <div className="grid grid-cols-2 text-xs gap-y-1.5 leading-normal">
                <span className="text-neutral-400">Empresa:</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-medium text-right truncate">{activeChat.company}</span>

                <span className="text-neutral-400">Fila:</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-medium text-right">{activeChat.queue}</span>

                <span className="text-neutral-400">Responsável:</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-medium text-right">{activeChat.responsible}</span>
              </div>
            </div>

            {/* CRM Status */}
            {crmContact && (
              <div className="space-y-2.5">
                <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Status CRM</h5>
                <select
                  value={crmContact.status || "NEW"}
                  onChange={(e) => handleCrmStatusChange(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 focus:outline-none dark:border-neutral-850 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  <option value="NEW">Novo</option>
                  <option value="IN_SERVICE">Em Atendimento</option>
                  <option value="WAITING_CUSTOMER">Aguardando Cliente</option>
                  <option value="QUALIFIED">Qualificado</option>
                  <option value="NEGOTIATION">Em Negociação</option>
                  <option value="PROPOSAL_SENT">Proposta Enviada</option>
                  <option value="WON">Ganho</option>
                  <option value="LOST">Perdido</option>
                  <option value="ACTIVE">Cliente Ativo</option>
                  <option value="INACTIVE">Cliente Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tags</h5>
              <div className="flex flex-wrap gap-1.5 items-center">
                {activeChat.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded dark:bg-neutral-800 dark:text-neutral-300">
                    {t}
                    <button onClick={() => handleRemoveTag(t)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white ml-0.5 font-bold">×</button>
                  </span>
                ))}

                {showTagInput ? (
                  <form onSubmit={handleAddTag} className="flex gap-1 items-center mt-1">
                    <Input
                      id="tag-input"
                      type="text"
                      placeholder="Tag..."
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      className="h-6.5 text-[10px] w-20 px-1.5"
                      autoFocus
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 border border-dashed border-neutral-300 rounded px-2 py-0.5 dark:border-neutral-800"
                  >
                    <Plus className="size-3 mr-0.5" /> Adicionar
                  </button>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Observações</h5>
              <Textarea
                placeholder="Adicionar uma observação interna..."
                value={activeChat.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
              <span className="text-[9px] text-neutral-400 italic block text-right mt-1">Salvo no Navegador</span>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                Transferir Conversa
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Membro da Equipe
                </label>
                {loadingMembers ? (
                  <div className="text-xs text-neutral-500 py-2">Carregando membros...</div>
                ) : (
                  <Select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                  >
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role || "Membro"})
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Fila / Setor de Destino
                </label>
                <Select
                  value={selectedQueue}
                  onChange={(e) => setSelectedQueue(e.target.value as any)}
                >
                  <option value="Comercial">Comercial</option>
                  <option value="Suporte">Suporte</option>
                  <option value="Financeiro">Financeiro</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransferModal(false)}
                className="h-9 text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmTransferChat}
                disabled={loadingMembers || teamMembers.length === 0}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Transferir Agora
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedFlowResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                  <FileText className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-850 dark:text-neutral-100">
                    Respostas do Formulário
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium leading-none mt-1">
                    Fluxo: {selectedFlowResponse.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFlowResponse(null)
                  setShowRawFlowJson(false)
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xl font-medium p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-4">
              {Object.entries(selectedFlowResponse.data).filter(([key]) => key !== 'flow_token').length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">Nenhum dado enviado neste formulário.</p>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {Object.entries(selectedFlowResponse.data)
                    .filter(([key]) => key !== 'flow_token')
                    .map(([key, value]) => {
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      return (
                        <div key={key} className="py-3 flex flex-col gap-1 first:pt-0 last:pb-0">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            {label}
                          </span>
                          <span className="text-xs text-neutral-800 dark:text-neutral-200 font-semibold whitespace-pre-wrap break-words">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setShowRawFlowJson(!showRawFlowJson)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer select-none"
                >
                  <span>{showRawFlowJson ? '▼' : '▶'}</span>
                  <span>Dados brutos do formulário (JSON)</span>
                </button>
                {showRawFlowJson && (
                  <pre className="mt-2.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 text-[10px] font-mono text-neutral-700 dark:text-neutral-300 overflow-x-auto select-all max-h-48 leading-normal">
                    {JSON.stringify(selectedFlowResponse.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFlowResponse(null)
                  setShowRawFlowJson(false)
                }}
                className="h-9 text-xs cursor-pointer"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeAttachmentType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                {activeAttachmentType === "image" && "Enviar Mensagem com Imagem"}
                {activeAttachmentType === "cta_url" && "Enviar Botão com Link (CTA)"}
                {activeAttachmentType === "list" && "Enviar Mensagem com Lista"}
                {activeAttachmentType === "button" && "Enviar Botões de Resposta Rápida"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveAttachmentType(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendSpecialMessage} className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Common Header, Body, Footer fields for Interactive Messages */}
              {activeAttachmentType !== "image" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Texto do Cabeçalho (Opcional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Atenção"
                      value={interactiveHeader}
                      onChange={(e) => setInteractiveHeader(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Corpo da Mensagem (Obrigatório)
                    </label>
                    <Textarea
                      placeholder="Digite o texto principal da mensagem..."
                      value={interactiveBody}
                      onChange={(e) => setInteractiveBody(e.target.value)}
                      className="text-xs resize-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Texto do Rodapé (Opcional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Clique em uma das opções abaixo"
                      value={interactiveFooter}
                      onChange={(e) => setInteractiveFooter(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Image Fields */}
              {activeAttachmentType === "image" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Selecionar Imagem (Upload)
                    </label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors relative">
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <RefreshCw className="size-6 text-emerald-500 animate-spin" />
                          <span className="text-xs font-medium text-neutral-500">Enviando imagem...</span>
                        </div>
                      ) : attachImageLink ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={attachImageLink}
                            alt="Preview"
                            className="max-h-36 rounded-lg object-contain border border-neutral-200 dark:border-neutral-800"
                          />
                          <button
                            type="button"
                            onClick={() => setAttachImageLink("")}
                            className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                          >
                            Remover e escolher outra
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer w-full py-4 text-center">
                          <Upload className="size-8 text-neutral-400" />
                          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Clique para selecionar imagem
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            PNG, JPG ou WEBP de até 5MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                            required
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Legenda da Imagem (Opcional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Confira as fotos do veículo!"
                      value={attachCaption}
                      onChange={(e) => setAttachCaption(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Audio Fields */}
              {activeAttachmentType === "audio" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Selecionar Arquivo de Áudio (Upload)
                    </label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors relative">
                      {isUploadingAudio ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <RefreshCw className="size-6 text-emerald-500 animate-spin" />
                          <span className="text-xs font-medium text-neutral-500">Enviando áudio...</span>
                        </div>
                      ) : attachAudioLink ? (
                        <div className="flex flex-col items-center gap-3">
                          <audio
                            src={attachAudioLink}
                            controls
                            className="max-w-full rounded border border-neutral-250 dark:border-neutral-850"
                          />
                          <button
                            type="button"
                            onClick={() => setAttachAudioLink("")}
                            className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                          >
                            Remover e escolher outro
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer w-full py-4 text-center">
                          <Mic className="size-8 text-neutral-400 animate-pulse" />
                          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Clique para selecionar áudio
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            MP3, WAV, OGG ou M4A de até 16MB
                          </span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioFileChange}
                            className="hidden"
                            required
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* CTA Link Fields */}
              {activeAttachmentType === "cta_url" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Rótulo do Botão (Obrigatório)
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Ver Veículo"
                      value={interactiveButtonLabel}
                      onChange={(e) => setInteractiveButtonLabel(e.target.value)}
                      className="h-9 text-xs"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Link de Destino / URL (Obrigatório)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/pagina"
                      value={interactiveUrl}
                      onChange={(e) => setInteractiveUrl(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                </>
              )}

              {/* List Menu Fields */}
              {activeAttachmentType === "list" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Texto do Botão do Menu (Obrigatório)
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Ver Menu de Opções"
                      value={interactiveButtonLabel}
                      onChange={(e) => setInteractiveButtonLabel(e.target.value)}
                      className="h-9 text-xs"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Título da Seção de Opções
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Escolha o Departamento"
                      value={listSectionTitle}
                      onChange={(e) => setListSectionTitle(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Opção 1 (Obrigatória)
                    </span>
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        type="text"
                        placeholder="ID (Ex: opt_financeiro)"
                        value={listRow1Id}
                        onChange={(e) => setListRow1Id(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                      <Input
                        type="text"
                        placeholder="Título da Opção"
                        value={listRow1Title}
                        onChange={(e) => setListRow1Title(e.target.value)}
                        className="h-8 text-xs"
                        maxLength={24}
                        required
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Descrição da Opção (Opcional)"
                      value={listRow1Desc}
                      onChange={(e) => setListRow1Desc(e.target.value)}
                      className="h-8 text-xs"
                      maxLength={72}
                    />
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Opção 2 (Opcional)
                    </span>
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        type="text"
                        placeholder="ID (Ex: opt_suporte)"
                        value={listRow2Id}
                        onChange={(e) => setListRow2Id(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="text"
                        placeholder="Título da Opção"
                        value={listRow2Title}
                        onChange={(e) => setListRow2Title(e.target.value)}
                        className="h-8 text-xs"
                        maxLength={24}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Descrição da Opção (Opcional)"
                      value={listRow2Desc}
                      onChange={(e) => setListRow2Desc(e.target.value)}
                      className="h-8 text-xs"
                      maxLength={72}
                    />
                  </div>
                </>
              )}

              {/* Reply Buttons Fields */}
              {activeAttachmentType === "button" && (
                <>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Botão de Resposta 1 (Obrigatório)
                    </span>
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        type="text"
                        placeholder="ID (Ex: sim)"
                        value={quickReply1Id}
                        onChange={(e) => setQuickReply1Id(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                      <Input
                        type="text"
                        placeholder="Rótulo (Ex: Sim, desejo)"
                        value={quickReply1Title}
                        onChange={(e) => setQuickReply1Title(e.target.value)}
                        className="h-8 text-xs"
                        maxLength={20}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Botão de Resposta 2 (Opcional)
                    </span>
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        type="text"
                        placeholder="ID (Ex: nao)"
                        value={quickReply2Id}
                        onChange={(e) => setQuickReply2Id(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="text"
                        placeholder="Rótulo (Ex: Não, obrigado)"
                        value={quickReply2Title}
                        onChange={(e) => setQuickReply2Title(e.target.value)}
                        className="h-8 text-xs"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Botão de Resposta 3 (Opcional)
                    </span>
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        type="text"
                        placeholder="ID (Ex: mais_tarde)"
                        value={quickReply3Id}
                        onChange={(e) => setQuickReply3Id(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="text"
                        placeholder="Rótulo (Ex: Outro momento)"
                        value={quickReply3Title}
                        onChange={(e) => setQuickReply3Title(e.target.value)}
                        className="h-8 text-xs"
                        maxLength={20}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveAttachmentType(null)}
                  className="h-9 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploadingImage || isUploadingAudio}
                  className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? "Enviando Imagem..." : isUploadingAudio ? "Enviando Áudio..." : "Enviar Mensagem"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
