import React from "react"
import { LayoutWrapper } from "@/shared/components/LayoutWrapper"

export const metadata = {
  title: "Painel de Administração | Veículos Multitenant",
  description: "Gerencie o estoque de veículos e propostas da sua concessionária.",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}
