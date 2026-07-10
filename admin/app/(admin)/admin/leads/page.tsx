import { LeadsList } from "@/features/leads/components/LeadsList"

export const metadata = {
  title: "Gestão de Contatos | CRM",
  description: "Gerencie e acompanhe contatos de interesse em veículos e propostas comerciais.",
}

export default function AdminLeadsPage() {
  return <LeadsList />
}
