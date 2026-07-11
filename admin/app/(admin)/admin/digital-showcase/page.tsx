import { ProductList } from "@/features/digital-showcase/components/ProductList"

export const metadata = {
  title: "Vitrine Digital | Painel",
  description: "Gerencie e configure os produtos em destaque na sua vitrine virtual.",
}

export default function AdminDigitalShowcasePage() {
  return <ProductList />
}
