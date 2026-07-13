import { WhatsappConfig, WhatsappTemplate, WhatsappMessageLog, WhatsappFlow, WhatsappFlowResponse } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const getSessionHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  const sessionStr = localStorage.getItem("veiculos_admin_session")
  if (!sessionStr) return {}
  try {
    const session = JSON.parse(sessionStr)
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`,
      "x-tenant-id": String(session.activeTenant?.id || ""),
      "ngrok-skip-browser-warning": "1",
      "Bypass-Tunnel-Reminder": "true",
    }
  } catch {
    return {}
  }
}

export const whatsappService = {
  initialize() {
    // No-op
  },

  async getConfig(): Promise<WhatsappConfig> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/settings`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter configurações do WhatsApp.")
    }

    const data = await response.json()
    return {
      phoneNumberId: data.phoneNumberId || "",
      businessAccountId: data.businessAccountId || "",
      accessToken: data.accessToken || "",
      webhookVerificationToken: data.webhookVerifyToken || "capri_verify_token_2026",
      webhookUrl: `${API_BASE_URL}/whatsapp/webhook`,
      isEnabled: data.status === "connected",
      status: data.status || "disconnected",
      lastVerifiedAt: data.updatedAt || new Date().toISOString(),
      aiEnabled: data.aiEnabled || false,
      aiApiKey: data.aiApiKey || "",
      aiAgentInstructions: data.aiAgentInstructions || "",
      aiModel: data.aiModel || "gemini-2.0-flash",
      aiPausedPhones: data.aiPausedPhones || [],
      aiActiveTools: data.aiActiveTools || [],
    }
  },

  async saveConfig(config: WhatsappConfig): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/settings`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({
        accessToken: config.accessToken,
        phoneNumberId: config.phoneNumberId,
        businessAccountId: config.businessAccountId,
        webhookVerifyToken: config.webhookVerificationToken,
        aiEnabled: config.aiEnabled,
        aiApiKey: config.aiApiKey,
        aiAgentInstructions: config.aiAgentInstructions,
        aiModel: config.aiModel,
        aiActiveTools: config.aiActiveTools,
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao salvar configurações do WhatsApp.")
    }
  },

  async getTemplates(): Promise<WhatsappTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/templates`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao carregar templates do WhatsApp.")
    }

    const data = await response.json()
    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      headerText: t.headerText || "",
      bodyText: t.bodyText,
      footerText: t.footerText || "",
      buttons: t.buttons || [],
      variables: t.variables || [],
    }))
  },

  async syncTemplates(): Promise<WhatsappTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/templates/sync`, {
      method: "POST",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao sincronizar templates do WhatsApp.")
    }

    // After sync completes, return the updated templates list
    return this.getTemplates()
  },

  async addTemplate(template: Omit<WhatsappTemplate, "id" | "status" | "variables" | "buttons">): Promise<WhatsappTemplate> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/templates`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({
        name: template.name,
        category: template.category,
        language: template.language || "pt_BR",
        bodyText: template.bodyText,
        headerText: template.headerText || undefined,
        footerText: template.footerText || undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao criar template na Meta.")
    }

    const t = await response.json()
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      headerText: t.headerText || "",
      bodyText: t.bodyText,
      footerText: t.footerText || "",
      buttons: t.buttons || [],
      variables: t.variables || [],
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/templates/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao deletar template na Meta.")
    }
  },

  async getHistory(tenantId: string): Promise<WhatsappMessageLog[]> {
    // History page wants a list of messages. We can query getChats or get log details.
    // In our backend, we have GET /whatsapp/chats. But we can also get messages by fetching chats, then fetching messages of those chats, 
    // or just loading the chats list which already contains the lastMessageText.
    // Let's implement an endpoint to get all logs on backend?
    // Wait, on the backend we can load messages for all chats or we can map this by listing chats.
    // To make it very simple: we can load all messages for the current tenant by fetching the logs endpoint!
    // Oh, wait! Did we implement GET /whatsapp/logs on the backend? No, but wait: we can implement it in the controller, or we can just fetch logs inside a custom endpoint!
    // Wait, let's look at `WhatsappController`. We did not define a logs endpoint, but we can query logs from the chat list, or add GET /whatsapp/logs to WhatsappController.
    // Let's check: yes, we can add GET /whatsapp/logs! That will make getHistory(tenantId) fetch all messages perfectly!
    // Let's implement `GET /whatsapp/logs` in the backend WhatsappController.
    // Let's write the frontend method first to expect it:
    const response = await fetch(`${API_BASE_URL}/whatsapp/chats`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao carregar histórico do WhatsApp.")
    }

    const chats = await response.json() // returns unique chats list
    // To populate the history table, we can fetch messages for each chat, or we can list logs.
    // Listing logs directly is cleaner. Let's write a backend endpoint for logs!
    // Let's call GET `${API_BASE_URL}/whatsapp/logs` which we will add.
    const logsResponse = await fetch(`${API_BASE_URL}/whatsapp/logs`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!logsResponse.ok) {
      return []
    }

    const logs = await logsResponse.json()
    return logs.map((l: any) => ({
      id: l.id,
      tenantId: l.tenantId,
      recipientPhone: l.recipientPhone,
      recipientName: l.recipientName,
      templateId: l.id,
      templateName: l.templateName || "Mensagem de Texto",
      variables: l.variables || {},
      status: l.status,
      sentAt: l.createdAt,
      errorMessage: l.errorMessage,
    }))
  },

  async sendTemplate(
    recipientName: string,
    recipientPhone: string,
    templateName: string,
    variables: Record<string, string>,
    leadId?: string,
  ): Promise<WhatsappMessageLog> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/send-template`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({
        recipientPhone,
        recipientName,
        templateName,
        variables,
        leadId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao disparar template.")
    }

    const data = await response.json()
    return {
      id: data.id,
      tenantId: data.tenantId,
      recipientPhone: data.recipientPhone,
      recipientName: data.recipientName,
      templateId: data.id,
      templateName: data.templateName,
      variables: data.variables,
      status: data.status,
      sentAt: data.createdAt,
    }
  },

  async getChats(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/chats`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de conversas.")
    }

    return response.json()
  },

  async getChatMessages(phone: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/chats/${phone}/messages`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter mensagens da conversa.")
    }

    return response.json()
  },

  async sendFreeTextMessage(
    recipientPhone: string,
    recipientName: string,
    bodyText: string,
    leadId?: string,
    type?: "text" | "image" | "interactive" | "audio",
    imageUrl?: string,
    interactiveType?: "cta_url" | "list" | "button",
    interactiveData?: any,
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/send-message`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({
        recipientPhone,
        recipientName,
        bodyText,
        leadId,
        type,
        imageUrl,
        interactiveType,
        interactiveData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao enviar mensagem.")
    }

    return response.json()
  },

  async getFlows(): Promise<WhatsappFlow[]> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/flows`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de fluxos (Flows).")
    }

    return response.json()
  },

  async syncFlows(): Promise<WhatsappFlow[]> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/flows/sync`, {
      method: "POST",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao sincronizar fluxos (Flows) com a Meta.")
    }

    return response.json()
  },

  async saveFlow(flow: Partial<WhatsappFlow>): Promise<WhatsappFlow> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/flows`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(flow),
    })

    if (!response.ok) {
      throw new Error("Erro ao salvar fluxo (Flow).")
    }

    return response.json()
  },

  async deleteFlow(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/flows/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir fluxo.")
    }
  },

  async sendFlowMessage(
    recipientPhone: string,
    recipientName: string,
    flowId: string,
    bodyText: string,
    flowCta: string,
    headerText?: string,
    footerText?: string,
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/flows/send`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({
        recipientPhone,
        recipientName,
        flowId,
        bodyText,
        flowCta,
        headerText,
        footerText,
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao disparar mensagem de Flow.")
    }

    return response.json()
  },

  async getFlowResponses(flowId?: string): Promise<WhatsappFlowResponse[]> {
    const url = flowId
      ? `${API_BASE_URL}/whatsapp/flows/responses?flowId=${flowId}`
      : `${API_BASE_URL}/whatsapp/flows/responses`

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter respostas dos fluxos.")
    }

    return response.json()
  },

  async simulateFlowWebhook(payload: any, tenantId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/webhook/flows?tenantId=${tenantId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Erro no retorno do webhook simulado.")
    }

    return response.json()
  },

  async pauseAi(phone: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/chats/${phone}/pause-ai`, {
      method: "POST",
      headers: getSessionHeaders(),
    })
    if (!response.ok) {
      throw new Error("Erro ao pausar a IA para este chat.")
    }
  },

  async resumeAi(phone: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/chats/${phone}/resume-ai`, {
      method: "POST",
      headers: getSessionHeaders(),
    })
    if (!response.ok) {
      throw new Error("Erro ao retomar a IA para este chat.")
    }
  },

  async revokeMessage(messageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/messages/${messageId}/revoke`, {
      method: "POST",
      headers: getSessionHeaders(),
    })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData?.message || "Erro ao revogar mensagem.")
    }
  },

  async connectEmbeddedSignup(code: string): Promise<WhatsappConfig> {
    const response = await fetch(`${API_BASE_URL}/whatsapp/embedded-signup`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erro ao conectar conta Meta.")
    }

    const data = await response.json()
    return {
      phoneNumberId: data.phoneNumberId || "",
      businessAccountId: data.businessAccountId || "",
      accessToken: data.accessToken || "",
      webhookVerificationToken: data.webhookVerifyToken || "capri_verify_token_2026",
      webhookUrl: `${API_BASE_URL}/whatsapp/webhook`,
      isEnabled: data.status === "connected",
      status: data.status || "disconnected",
      lastVerifiedAt: data.updatedAt || new Date().toISOString(),
      aiEnabled: data.aiEnabled || false,
      aiApiKey: data.aiApiKey || "",
      aiAgentInstructions: data.aiAgentInstructions || "",
      aiModel: data.aiModel || "gemini-2.0-flash",
      aiPausedPhones: data.aiPausedPhones || [],
      aiActiveTools: data.aiActiveTools || [],
    }
  },
}
