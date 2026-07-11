import { PropertyList } from "@/features/real-estate/components/PropertyList"

export const metadata = {
  title: "Portfólio de Imóveis | Painel",
  description: "Gerencie o portfólio de imóveis cadastrados.",
}

export default function AdminRealEstatePage() {
  return <PropertyList />
}
