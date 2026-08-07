import { PropertyForm } from "@/features/real-estate/components/PropertyForm"

export const metadata = {
  title: "Cadastrar Imóvel | Painel",
  description: "Adicione um novo imóvel ao portfólio.",
}

export default function NewPropertyPage() {
  return <PropertyForm />
}
