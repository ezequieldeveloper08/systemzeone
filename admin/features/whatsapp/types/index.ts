export interface WhatsappConfig {
  phoneNumberId: string
  businessAccountId: string
  accessToken: string
  webhookVerificationToken: string
  webhookUrl: string
  isEnabled: boolean
  status: "disconnected" | "connected" | "error"
  lastVerifiedAt?: string
  aiEnabled: boolean
  aiApiKey?: string
  aiAgentInstructions?: string
  aiModel?: string
  aiPausedPhones: string[]
  aiActiveTools?: string[]
  facebookPageId?: string
  facebookPageAccessToken?: string
  instagramBusinessAccountId?: string
}

export type TemplateStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface WhatsappTemplate {
  id: string
  name: string
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION"
  language: string
  status: TemplateStatus
  bodyText: string
  headerText?: string
  footerText?: string
  buttons?: Array<{
    type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"
    text: string
    url?: string
    phoneNumber?: string
  }>
  variables: string[] // List of variables like {{1}}, {{2}}
}

export interface WhatsappMessageLog {
  id: string
  tenantId: string
  recipientPhone: string
  recipientName: string
  templateId: string
  templateName: string
  variables: Record<string, string>
  status: "sent" | "delivered" | "read" | "failed"
  sentAt: string
  errorMessage?: string
}

export interface WhatsappFlow {
  id: string
  tenantId: string
  name: string
  flowId: string | null
  status: "draft" | "published" | "deprecated"
  categories: string[]
  screens: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface WhatsappFlowResponse {
  id: string
  tenantId: string
  flowId: string
  recipientPhone: string
  recipientName: string
  submittedData: Record<string, any>
  flow?: WhatsappFlow
  createdAt: string
}

