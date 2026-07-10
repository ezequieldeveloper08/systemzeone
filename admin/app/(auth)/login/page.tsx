import { LoginForm } from "@/features/auth/components/LoginForm"

export const metadata = {
  title: "Entrar | Gestor de Veículos Multitenant",
  description: "Faça login no painel administrativo da sua concessionária.",
}

export default function LoginPage() {
  return <LoginForm />
}
