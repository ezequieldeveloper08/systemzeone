import { FinancesManager } from "@/features/finances/components/FinancesManager"

export const metadata = {
  title: "Gestão Financeira | CRM Concessionária",
  description: "Controle de fluxo de caixa, contas a receber e contas a pagar da concessionária.",
}

export default function FinancesPage() {
  return <FinancesManager />
}
