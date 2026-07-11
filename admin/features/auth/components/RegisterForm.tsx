"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Mail, Lock, User, Store, AlertCircle } from "lucide-react"

export function RegisterForm() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [businessType, setBusinessType] = useState("crm_only")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register(name, email, password, tenantName, businessType)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao registrar.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Image
          src="/logo-dark-mode.svg"
          alt="Zemobi Logo"
          width={130}
          height={32}
          className="h-8 w-auto dark:block hidden mb-2"
          priority
        />
        <Image
          src="/logo-ligth-mode.svg"
          alt="Zemobi Logo"
          width={130}
          height={32}
          className="h-8 w-auto dark:hidden block mb-2"
          priority
        />
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Criar Conta Admin
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Registre sua empresa e configure seu painel modular multitenant
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tenantName">Nome da Empresa (Sua Marca)</Label>
          <div className="relative">
            <Store className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="tenantName"
              placeholder="Ex: Capri Veículos, Simovel Imóveis, Burger Shop..."
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessType">Segmento de Negócio</Label>
          <select
            id="businessType"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300"
          >
            <option value="crm_only">Apenas CRM (Padrão)</option>
            <option value="veiculos">Concessionária / Garagem (Veículos)</option>
            <option value="imoveis">Imobiliária (Imóveis)</option>
            <option value="menu">Restaurante (Cardápio)</option>
            <option value="vitrine">Loja / Comércio (Vitrine Digital)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Seu Nome Completo</Label>
          <div className="relative">
            <User className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="name"
              placeholder="Ex: Ezequiel Pires"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail de Acesso</Label>
          <div className="relative">
            <Mail className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="email"
              type="email"
              placeholder="exemplo@marca.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Criar Senha</Label>
          <div className="relative">
            <Lock className="absolute top-2.5 left-3 size-4 text-neutral-400" />
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              minLength={6}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full justify-center h-10 font-semibold text-sm transition-all mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Registrando...
            </div>
          ) : (
            "Registrar e Acessar"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Já tem um registro?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-950 hover:underline dark:text-neutral-50"
        >
          Faça Login
        </Link>
      </div>
    </div>
  )
}
