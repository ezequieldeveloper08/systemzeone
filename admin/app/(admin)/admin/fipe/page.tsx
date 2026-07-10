import { FipeSyncPanel } from "@/features/fipe/components/FipeSyncPanel"

export const metadata = {
  title: "Sincronização FIPE | Super Admin",
  description: "Painel global de sincronização e gerenciamento da base de dados FIPE.",
}

export default function FipeSyncPage() {
  return <FipeSyncPanel />
}
