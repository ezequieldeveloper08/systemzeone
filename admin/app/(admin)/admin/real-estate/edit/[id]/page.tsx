import { PropertyForm } from "@/features/real-estate/components/PropertyForm"

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditPropertyPageProps) {
  const { id } = await params
  return {
    title: `Editar Imóvel | Painel`,
    description: `Edite os dados técnicos, cômodos ou fotos do imóvel ${id}.`,
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params
  return <PropertyForm propertyId={id} />
}
