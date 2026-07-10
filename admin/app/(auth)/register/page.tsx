import { RegisterForm } from "@/features/auth/components/RegisterForm"

export const metadata = {
  title: "Cadastrar Concessionária | Gestor de Veículos Multitenant",
  description: "Registre uma nova conta administrativa e configure sua concessionária.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
