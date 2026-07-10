import { BrandsList } from "@/features/brands/components/BrandsList"

export const metadata = {
  title: "Banco de Dados FIPE | Painel",
  description: "Visualização e consulta local de marcas, modelos e preços sincronizados da Tabela FIPE.",
}

export default function AdminBrandsPage() {
  return <BrandsList />
}
