import { MenuForm } from "@/features/menu/components/MenuForm"

export const metadata = {
  title: "Adicionar Item ao Cardápio | Painel",
  description: "Cadastre um novo prato ou bebida com opcionais.",
}

export default function AdminNewMenuItemPage() {
  return <MenuForm />
}
