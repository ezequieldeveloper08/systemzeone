import { ContactForm } from "@/features/leads/components/ContactForm"

interface EditContactPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditContactPageProps) {
  const { id } = await params
  return {
    title: `Editar Contato | Painel`,
    description: `Edite a ficha do contato ${id}.`,
  }
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { id } = await params
  return <ContactForm contactId={id} />
}
