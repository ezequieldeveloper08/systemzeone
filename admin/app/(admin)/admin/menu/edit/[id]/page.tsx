import { MenuForm } from "@/features/menu/components/MenuForm"

interface EditMenuPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditMenuPageProps) {
  const { id } = await params
  return {
    title: "Editar Item do Cardápio | Painel",
    description: `Edite os ingredientes, preços e opcionais do item ${id}.`,
  }
}

export default async function EditMenuPage({ params }: EditMenuPageProps) {
  const { id } = await params
  return <MenuForm menuItemId={id} />
}
