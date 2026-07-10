import { VehicleForm } from "@/features/vehicles/components/VehicleForm"

export const metadata = {
  title: "Adicionar Novo Veículo | Painel",
  description: "Cadastre as informações, ficha técnica e fotos de um novo automóvel.",
}

export default function NewVehiclePage() {
  return <VehicleForm />
}
