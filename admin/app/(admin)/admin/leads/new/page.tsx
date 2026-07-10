import { ContactForm } from "@/features/leads/components/ContactForm"

export const metadata = {
  title: "Adicionar Novo Contato | Painel",
  description: "Cadastre informações detalhadas, preferências e veículo de interesse para um novo contato no CRM.",
}

export default function NewContactPage() {
  return <ContactForm />
}
