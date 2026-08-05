"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Mail, Lock, AlertCircle } from "lucide-react"

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao entrar.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Image
          src="/logo-dark-mode.svg"
          alt="Zemobi Logo"
          width={100} height={48}
          className="dark:block hidden mb-6"
          priority
        />
        <Image
          src="/logo-ligth-mode.svg"
          alt="Zemobi Logo"
          width={100} height={48}
          className="dark:hidden block mb-6"
          priority
        />
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Entrar no Painel
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Gerencie o estoque e vendas de veículos da sua concessionária
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="email"
              type="email"
              placeholder="seuemail@concessionaria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <a href="#" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full justify-center h-10 font-semibold text-sm transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Entrando...
            </div>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Não possui uma conta?{" "}
        <Link
          href="/register"
          className="font-medium text-neutral-950 hover:underline dark:text-neutral-50"
        >
          Cadastre sua concessionária
        </Link>
      </div>

      <div className="rounded-lg bg-neutral-50 p-3 text-center text-xs text-neutral-500 dark:bg-neutral-800/40 dark:text-neutral-400">
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">Acesso de Demonstração:</p>
        <p>E-mail: <code className="font-mono">admin@capri.com.br</code> | Senha: <code className="font-mono">password123</code></p>
      </div>
    </div>
  )
}
