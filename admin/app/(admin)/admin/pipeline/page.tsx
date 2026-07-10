import { PipelineBoard } from "@/features/crm/components/PipelineBoard"

export const metadata = {
  title: "Funil de Vendas (CRM) | Concessionária",
  description: "Acompanhe e faça a gestão do funil de vendas e leads da sua concessionária.",
}

export default function AdminPipelinePage() {
  return <PipelineBoard />
}
