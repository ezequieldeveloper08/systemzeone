import { TeamManager } from "@/features/team/components/TeamManager"

export const metadata = {
  title: "Equipe | CRM Concessionária",
  description: "Gerencie a equipe de colaboradores e permissões de acesso da concessionária.",
}

export default function TeamPage() {
  return <TeamManager />
}
