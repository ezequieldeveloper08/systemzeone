import { VehicleList } from "@/features/vehicles/components/VehicleList"

export const metadata = {
  title: "Catálogo de Veículos | Painel",
  description: "Gerencie o catálogo e status dos veículos cadastrados.",
}

export default function AdminVehiclesPage() {
  return <VehicleList />
}
