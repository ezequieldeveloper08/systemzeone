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
      "ngrok-skip-browser-warning": "true",
    }
  } catch {
    return {}
  }
}

export interface Contact {
  id: string;
  tenantId: string;
  type: 'PERSON' | 'COMPANY';
  lifecycleStage: 'LEAD' | 'MQL' | 'SQL' | 'OPPORTUNITY' | 'CUSTOMER' | 'INACTIVE_CUSTOMER' | 'EVANGELIST' | 'OTHER';
  status: 'NEW' | 'IN_SERVICE' | 'WAITING_CUSTOMER' | 'QUALIFIED' | 'NEGOTIATION' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  name: string;
  displayName: string | null;
  documentType: 'CPF' | 'CNPJ' | 'OTHER' | null;
  document: string | null;
  email: string | null;
  phone: string;
  whatsappId: string | null;
  companyName: string | null;
  jobTitle: string | null;
  source: string;
  sourceDetails: string | null;
  ownerId: string | null;
  leadScore: number;
  temperature: 'COLD' | 'WARM' | 'HOT';
  firstContactAt: string | null;
  lastContactAt: string | null;
  convertedAt: string | null;
  lostReason: string | null;
  notes: string | null;
  isBlocked: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  tenantId: string;
  pipelineId: string;
  name: string;
  order: number;
  probability: number;
  isWonStage: boolean;
  isLostStage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  stages: PipelineStage[];
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  tenantId: string;
  contactId: string;
  pipelineId: string;
  stageId: string;
  title: string;
  description: string | null;
  value: number;
  currency: string;
  status: 'OPEN' | 'WON' | 'LOST' | 'CANCELED';
  expectedCloseDate: string | null;
  closedAt: string | null;
  lostReason: string | null;
  ownerId: string | null;
  vehicleId: string | null;
  contact: Contact | null;
  stage: PipelineStage | null;
  vehicle: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  tenantId: string;
  contactId: string | null;
  dealId: string | null;
  conversationId: string | null;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'WAITING' | 'DONE' | 'CANCELED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToUserId: string | null;
  createdByUserId: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  contactId: string | null;
  dealId: string | null;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELED' | 'RESCHEDULED';
  assignedToUserId: string | null;
  createdByUserId: string;
  googleCalendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
  canceledAt: string | null;
}

export interface Activity {
  id: string;
  tenantId: string;
  contactId: string;
  dealId: string | null;
  taskId: string | null;
  appointmentId: string | null;
  userId: string | null;
  type: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const crmService = {
  // Contacts API
  async getContacts(filters?: { lifecycleStage?: string; status?: string; source?: string; q?: string }): Promise<Contact[]> {
    let url = `${API_BASE_URL}/contacts`
    const params = new URLSearchParams()
    if (filters?.lifecycleStage) params.append("lifecycleStage", filters.lifecycleStage)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.source) params.append("source", filters.source)
    if (filters?.q) params.append("q", filters.q)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de contatos.")
    }

    return response.json()
  },

  async getContact(id: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter detalhes do contato.")
    }

    return response.json()
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao criar contato.")
    }

    return response.json()
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao atualizar contato.")
    }

    return response.json()
  },

  async deleteContact(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir contato.")
    }
  },

  // Pipelines API
  async getPipelines(): Promise<Pipeline[]> {
    const response = await fetch(`${API_BASE_URL}/pipelines`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter pipelines.")
    }

    return response.json()
  },

  // Deals API
  async getDeals(filters?: { pipelineId?: string; status?: string }): Promise<Deal[]> {
    let url = `${API_BASE_URL}/deals`
    const params = new URLSearchParams()
    if (filters?.pipelineId) params.append("pipelineId", filters.pipelineId)
    if (filters?.status) params.append("status", filters.status)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de negócios.")
    }

    return response.json()
  },

  async getDeal(id: string): Promise<Deal> {
    const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter detalhes do negócio.")
    }

    return response.json()
  },

  async createDeal(data: Partial<Deal>): Promise<Deal> {
    const response = await fetch(`${API_BASE_URL}/deals`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao criar negócio.")
    }

    return response.json()
  },

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao atualizar negócio.")
    }

    return response.json()
  },

  async deleteDeal(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir negócio.")
    }
  },

  // Tasks API
  async getTasks(filters?: { contactId?: string; dealId?: string; status?: string; assignedToUserId?: string }): Promise<Task[]> {
    let url = `${API_BASE_URL}/crm/tasks`
    const params = new URLSearchParams()
    if (filters?.contactId) params.append("contactId", filters.contactId)
    if (filters?.dealId) params.append("dealId", filters.dealId)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.assignedToUserId) params.append("assignedToUserId", filters.assignedToUserId)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de tarefas.")
    }

    return response.json()
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/crm/tasks`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao criar tarefa.")
    }

    return response.json()
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/crm/tasks/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao atualizar tarefa.")
    }

    return response.json()
  },

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/crm/tasks/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir tarefa.")
    }
  },

  // Appointments API
  async getAppointments(filters?: { contactId?: string; dealId?: string; status?: string; assignedToUserId?: string }): Promise<Appointment[]> {
    let url = `${API_BASE_URL}/crm/appointments`
    const params = new URLSearchParams()
    if (filters?.contactId) params.append("contactId", filters.contactId)
    if (filters?.dealId) params.append("dealId", filters.dealId)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.assignedToUserId) params.append("assignedToUserId", filters.assignedToUserId)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de compromissos.")
    }

    return response.json()
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/crm/appointments`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao agendar compromisso.")
    }

    return response.json()
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/crm/appointments/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao atualizar compromisso.")
    }

    return response.json()
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/crm/appointments/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao cancelar compromisso.")
    }

    return response.json()
  },

  // Activities API
  async getActivities(filters?: { contactId?: string; dealId?: string }): Promise<Activity[]> {
    let url = `${API_BASE_URL}/crm/activities`
    const params = new URLSearchParams()
    if (filters?.contactId) params.append("contactId", filters.contactId)
    if (filters?.dealId) params.append("dealId", filters.dealId)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de atividades.")
    }

    return response.json()
  },

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const response = await fetch(`${API_BASE_URL}/crm/activities`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Erro ao criar atividade.")
    }

    return response.json()
  }
}
