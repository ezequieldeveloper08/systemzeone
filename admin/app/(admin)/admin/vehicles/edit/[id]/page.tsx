import { VehicleForm } from "@/features/vehicles/components/VehicleForm"

interface EditVehiclePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditVehiclePageProps) {
  const { id } = await params
  return {
    title: `Editar Veículo | Painel`,
    description: `Edite a ficha técnica ou fotos do veículo ${id}.`,
  }
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params
  return <VehicleForm vehicleId={id} />
}
