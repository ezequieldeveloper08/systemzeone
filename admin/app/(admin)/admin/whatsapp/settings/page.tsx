import { WhatsappSettings } from "@/features/whatsapp/components/WhatsappSettings"

export const metadata = {
  title: "Configuração API WhatsApp | Painel",
  description: "Gerencie as credenciais da API Oficial da Meta para integração com WhatsApp.",
}

export default function WhatsappSettingsPage() {
  return <WhatsappSettings />
}
