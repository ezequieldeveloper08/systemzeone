import { ContactDetails } from "@/features/leads/components/ContactDetails"

interface ContactDetailsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ContactDetailsPageProps) {
  const { id } = await params
  return {
    title: `Detalhes do Contato | Painel`,
    description: `Veja a ficha e histórico completo do contato ${id}.`,
  }
}

export default async function ContactDetailsPage({ params }: ContactDetailsPageProps) {
  const { id } = await params
  return <ContactDetails contactId={id} />
}
