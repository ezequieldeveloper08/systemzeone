"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  MessageSquare,
  LayoutDashboard,
  Car,
  Shield,
  Zap,
  Check,
  ArrowRight,
  ChevronRight,
  Star,
  Lock,
  Settings,
  Layers,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  Volume2,
  ListFilter
} from "lucide-react"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual")
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  // Price calculations (20% discount for annual)
  const prices = {
    light: billingPeriod === "annual" ? 159 : 199,
    pro: billingPeriod === "annual" ? 319 : 399,
    group: billingPeriod === "annual" ? 639 : 799
  }

  const featuresList = [
    {
      icon: <Car className="size-6 text-emerald-500" />,
      title: "Catálogo & FIPE Integrados",
      desc: "Cadastre veículos de forma rápida, consulte valores de referência da Tabela FIPE instantaneamente e gerencie sua frota com tags inteligentes."
    },
    {
      icon: <LayoutDashboard className="size-6 text-emerald-500" />,
      title: "Funil de Vendas (CRM)",
      desc: "Visualize suas negociações em um quadro Kanban interativo. Arraste leads por etapas e acompanhe o potencial financeiro agregado de cada coluna."
    },
    {
      icon: <MessageSquare className="size-6 text-emerald-500" />,
      title: "WhatsApp Web Oficial",
      desc: "Atendimento ao vivo centralizado com suporte para envio de imagens, mensagens de voz nativas e reprodução de áudio diretamente no chat."
    },
    {
      icon: <Sparkles className="size-6 text-emerald-500" />,
      title: "Meta Flows & Modelos",
      desc: "Dispare templates oficiais aprovados pela Meta e crie fluxos interativos de respostas e botões para automatizar a qualificação de leads."
    },
    {
      icon: <Shield className="size-6 text-emerald-500" />,
      title: "Isolamento Multitenant",
      desc: "Perfeito para grupos de concessionárias. Dados, estoques, membros de equipe e configurações do WhatsApp totalmente isolados por filial."
    },
    {
      icon: <Zap className="size-6 text-emerald-500" />,
      title: "Performance de Elite",
      desc: "Interface ultra responsiva construída em Next.js e Tailwind CSS. Carregamentos instantâneos e transições fluidas projetadas para alta conversão."
    }
  ]

  const faqs = [
    {
      q: "O Zemobi é homologado com a API Oficial do WhatsApp?",
      a: "Sim. A nossa plataforma integra-se diretamente com o WhatsApp Cloud API oficial da Meta. Isso garante estabilidade máxima, ausência de bloqueios de números e acesso aos recursos premium como Templates e Flows interativos."
    },
    {
      q: "Como funciona a estrutura Multitenant (Multiloja)?",
      a: "Cada concessionária cadastrada opera de forma 100% isolada, possuindo seu próprio estoque de veículos, leads e número do WhatsApp. Ideal para proprietários de múltiplas lojas ou redes que querem gerenciar tudo em um único painel administrativo."
    },
    {
      q: "Preciso ter conhecimento de programação para criar os fluxos (Flows)?",
      a: "Absolutamente não. Nossos módulos e templates facilitam o disparo de botões e listas interativas para seus clientes, tudo de forma visual com poucos cliques."
    },
    {
      q: "Posso testar a plataforma antes de assinar?",
      a: "Sim! Oferecemos um período de teste gratuito de 14 dias com acesso total a todos os recursos de catálogo e CRM para você comprovar a eficiência do sistema."
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-neutral-950">
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none -z-10 animate-pulse duration-5000" />
      <div className="absolute top-[800px] right-10 w-[500px] h-[500px] rounded-full bg-emerald-900/5 blur-[130px] pointer-events-none -z-10" />

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-dark-mode.svg"
              alt="Zemobi Logo"
              width={130}
              height={31}
              className="h-8 w-auto transition-transform group-hover:scale-102"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Recursos</a>
            <a href="#demo" className="hover:text-emerald-400 transition-colors">Como Funciona</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Planos</a>
            <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Depoimentos</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">Dúvidas</a>
          </nav>

          {/* CTA / Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <span className="h-8 w-24 bg-neutral-900 animate-pulse rounded-lg" />
            ) : user ? (
              <Link
                href="/admin/dashboard"
                className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 flex items-center gap-1.5"
              >
                <LayoutDashboard className="size-3.5" />
                Painel Administrativo
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-neutral-300 hover:text-white transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="h-9 px-4 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold transition-all"
                >
                  Começar Agora
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-900 bg-neutral-950/95 backdrop-blur-lg px-6 py-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-neutral-300 hover:text-emerald-400 transition-colors"
            >
              Recursos
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-neutral-300 hover:text-emerald-400 transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-neutral-300 hover:text-emerald-400 transition-colors"
            >
              Planos
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-neutral-300 hover:text-emerald-400 transition-colors"
            >
              Depoimentos
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-neutral-300 hover:text-emerald-400 transition-colors"
            >
              Dúvidas
            </a>
            <hr className="border-neutral-900" />
            <div className="flex flex-col gap-3">
              {user ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="size-4" />
                  Ir para o Painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white text-sm font-bold flex items-center justify-center"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 rounded-lg bg-white text-neutral-950 text-sm font-bold flex items-center justify-center"
                  >
                    Cadastrar Grátis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-36 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold animate-pulse">
              <Sparkles className="size-3.5" />
              <span>Plataforma Multiloja Oficial Meta</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Venda veículos em tempo real no{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                WhatsApp
              </span>
            </h1>

            <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Zemobi conecta o seu estoque, funil de vendas (CRM) Kanban e atendimento ao vivo no WhatsApp com templates oficiais Meta. Tudo em um painel multitenant premium e veloz.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto h-12 px-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Começar Teste de 14 Dias
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto h-12 px-8 rounded-lg border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 text-neutral-300 font-bold transition-all text-sm flex items-center justify-center cursor-pointer"
              >
                Ver Recursos
              </a>
            </div>

            {/* Micro proof */}
            <div className="pt-6 border-t border-neutral-900/60 max-w-md mx-auto lg:mx-0 flex items-center justify-center lg:justify-start gap-6 text-neutral-500 text-xs font-bold uppercase tracking-wider">
              <span>Sem cartão de crédito</span>
              <span className="size-1 rounded-full bg-neutral-700" />
              <span>Instalação instantânea</span>
            </div>
          </div>

          {/* Hero Right: HTML/CSS Dashboard High-Fidelity Mockup */}
          <div className="lg:col-span-6 relative w-full flex items-center justify-center">
            {/* Background glowing mesh */}
            <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-2xl -z-10" />

            {/* Main Application Mockup Container */}
            <div className="w-full max-w-xl border border-neutral-800 bg-neutral-950 rounded-2xl shadow-2xl shadow-emerald-950/20 overflow-hidden flex flex-col scale-100 hover:scale-[1.01] transition-transform duration-500">
              {/* Fake Window OS Header */}
              <div className="h-10 px-4 bg-neutral-900/80 border-b border-neutral-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/30" />
                  <span className="size-3 rounded-full bg-yellow-500/30" />
                  <span className="size-3 rounded-full bg-emerald-500/30" />
                </div>
                <div className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase font-mono">
                  zemobi.app - concessionária principal
                </div>
                <div className="size-4 opacity-0" />
              </div>

              {/* Fake Dashboard body */}
              <div className="grid grid-cols-12 h-[340px] bg-neutral-950">
                {/* Mini Sidebar */}
                <div className="col-span-3 border-r border-neutral-900 p-2.5 flex flex-col gap-2.5 bg-neutral-950">
                  <div className="h-6 rounded bg-neutral-900 flex items-center px-2 gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-neutral-400">Ativo</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center px-2 gap-1.5 text-[9px] font-bold">
                      <LayoutDashboard className="size-3" />
                      Painel
                    </div>
                    <div className="h-5 rounded text-neutral-500 flex items-center px-2 gap-1.5 text-[9px] font-bold">
                      <Car className="size-3" />
                      Estoque
                    </div>
                    <div className="h-5 rounded text-neutral-500 flex items-center px-2 gap-1.5 text-[9px] font-bold">
                      <MessageSquare className="size-3" />
                      Atendimento
                    </div>
                  </div>
                </div>

                {/* Main mini-contents: Split into mini CRM & Chat */}
                <div className="col-span-9 p-3 flex flex-col gap-3 overflow-hidden bg-neutral-950">
                  {/* Row 1: Stock overview card */}
                  <div className="flex gap-2.5 items-center justify-between p-2.5 rounded-lg border border-neutral-900 bg-neutral-900/30">
                    <div className="flex items-center gap-2">
                      <div className="size-10 bg-neutral-800 rounded-md overflow-hidden flex items-center justify-center font-bold text-xs text-neutral-400">
                        🚗
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white">Corvette C8 Stingray</div>
                        <div className="text-[8px] font-semibold text-emerald-400">R$ 1.190.000</div>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Disponível
                    </span>
                  </div>

                  {/* Row 2: Overlaying CRM Pipeline and Audio Message */}
                  <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
                    {/* Fake CRM column */}
                    <div className="rounded-lg border border-neutral-900 bg-neutral-900/10 p-2 flex flex-col gap-2 overflow-hidden">
                      <div className="flex justify-between items-center text-[8px] font-bold text-neutral-500 tracking-wide uppercase">
                        <span>Em Negociação</span>
                        <span className="text-emerald-400">R$ 1.9M</span>
                      </div>
                      <div className="p-2 bg-neutral-900/60 rounded-md border border-neutral-800/40 flex flex-col gap-1 shadow-3xs cursor-grab">
                        <span className="text-[9px] font-bold text-white">Ezequiel Pires</span>
                        <span className="text-[7px] text-neutral-500">BMW M3 BiTurbo</span>
                        <div className="flex items-center justify-between mt-1 text-[7px] font-mono text-neutral-500">
                          <span>Comercial</span>
                          <span className="text-emerald-400">R$ 820k</span>
                        </div>
                      </div>
                    </div>

                    {/* Fake WhatsApp Chat visualizer */}
                    <div className="rounded-lg border border-neutral-900 bg-neutral-900/15 p-2 flex flex-col justify-between overflow-hidden">
                      <div className="flex gap-1.5 items-center border-b border-neutral-900/50 pb-1.5 mb-1.5">
                        <span className="size-4.5 rounded-full bg-neutral-800 text-[8px] font-bold flex items-center justify-center text-white">EP</span>
                        <span className="text-[8px] font-bold text-white truncate">Atendendo: Ezequiel</span>
                      </div>
                      
                      {/* Audio visualizer display */}
                      <div className="flex flex-col gap-1.5">
                        {/* Audio bubble */}
                        <div className="p-1.5 bg-emerald-500 rounded-lg flex items-center gap-1.5 text-neutral-950 shadow-3xs self-end">
                          <Volume2 className="size-3.5" />
                          <div className="flex gap-0.5 items-center">
                            <span className="h-3 w-[2px] bg-neutral-950 rounded-full animate-bounce duration-500" />
                            <span className="h-4.5 w-[2px] bg-neutral-950 rounded-full animate-bounce duration-700" />
                            <span className="h-2 w-[2px] bg-neutral-950 rounded-full animate-bounce duration-400" />
                            <span className="h-3.5 w-[2px] bg-neutral-950 rounded-full animate-bounce duration-600" />
                          </div>
                          <span className="text-[7px] font-bold">0:05</span>
                        </div>
                        {/* Status notification */}
                        <span className="text-[6px] text-neutral-500 self-end">Lido às 18:49</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="border-y border-neutral-900 bg-neutral-900/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">+R$ 15M</div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mt-1">Negociados em Leads</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">99.9%</div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mt-1">Uptime de Disparos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">+50</div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mt-1">Lojas Ativas</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">Zero</div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mt-1">Bloqueios de Contas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Recursos do Sistema</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Tudo o que sua concessionária precisa para crescer online
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed font-medium">
            Elimine planilhas complexas e ferramentas de chat paralelas. Zemobi centraliza sua operação de vendas de carros em um só ecossistema intuitivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950 hover:bg-neutral-900/20 hover:border-neutral-800/80 transition-all duration-300 flex flex-col gap-4 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-neutral-900 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / PIPELINE SHOWCASE */}
      <section id="demo" className="py-24 bg-neutral-950 border-t border-neutral-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-900/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Visual Steps Graphic */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold flex items-center justify-center">1</span>
                  <span className="font-bold text-white text-sm">Qualificação Automática no WhatsApp</span>
                </div>
                <div className="pl-9 text-xs text-neutral-400 leading-relaxed">
                  O cliente manda mensagem sobre um veículo. O sistema responde com uma lista interativa de opções ou template Meta homologado.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-900 bg-neutral-950/45 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold flex items-center justify-center">2</span>
                  <span className="font-bold text-white text-sm">Geração de Lead no CRM Pipeline</span>
                </div>
                <div className="pl-9 text-xs text-neutral-400 leading-relaxed">
                  Sem trabalho manual. O contato vira um card na coluna "Novos Leads" com a estimativa do valor do carro anexado.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold flex items-center justify-center">3</span>
                  <span className="font-bold text-white text-sm">Atendimento Humano em Tempo Real</span>
                </div>
                <div className="pl-9 text-xs text-neutral-400 leading-relaxed">
                  Seus vendedores conversam por chat, escutam e gravam mensagens de áudio nativas e enviam PDFs de propostas diretamente do painel administrativo.
                </div>
              </div>
            </div>

            {/* Description content */}
            <div className="lg:col-span-6 space-y-8 lg:pl-6 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Praticidade</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Um fluxo de vendas automatizado do primeiro contato ao fechamento
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                Nossos clientes relatam um ganho de produtividade de mais de 45% nos times de vendas. Ao unificar as ferramentas que antes eram isoladas, o vendedor responde o cliente com as especificações do carro e registra as anotações no CRM em segundos.
              </p>
              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 font-bold transition-all text-xs cursor-pointer"
                >
                  Criar conta grátis
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Planos e Preços</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Valores transparentes que acompanham o seu tamanho
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Escolha o melhor plano para sua concessionária. Altere ou cancele sua assinatura a qualquer momento.
          </p>

          {/* Monthly/Annual Toggle Switch */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-white" : "text-neutral-500"}`}>
              Faturamento Mensal
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
              className="h-6 w-11 rounded-full bg-neutral-900 border border-neutral-800 p-0.5 relative transition-all duration-300"
            >
              <span className={`h-4.5 w-4.5 rounded-full bg-emerald-500 absolute top-0.5 left-0.5 transition-all duration-300 ${billingPeriod === "annual" ? "translate-x-5" : ""}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingPeriod === "annual" ? "text-emerald-400" : "text-neutral-500"}`}>
              Faturamento Anual (Economize 20%)
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: Light */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950 flex flex-col justify-between relative hover:border-neutral-800 transition-all duration-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-bold text-neutral-400 uppercase tracking-wider">Concessionária Light</h3>
                <p className="text-xs text-neutral-500 mt-1">Para lojas independentes e novos showrooms.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-white">R$ {prices.light}</span>
                <span className="text-neutral-500 text-xs font-medium ml-1">/ mês</span>
              </div>
              <hr className="border-neutral-900" />
              <ul className="space-y-3.5 text-xs text-neutral-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>1 Concessionária (Tenant) ativa</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Até 50 veículos no catálogo</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Até 3 vendedores logados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Integração Oficial Meta WhatsApp</span>
                </li>
                <li className="flex items-center gap-2.5 text-neutral-500 line-through">
                  <Check className="size-4 text-neutral-500 shrink-0" />
                  <span>Relatórios Financeiros Avançados</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register"
                className="w-full h-10 rounded-lg border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 text-neutral-300 font-bold transition-all text-xs flex items-center justify-center cursor-pointer"
              >
                Escolher Plano Light
              </Link>
            </div>
          </div>

          {/* Card 2: Pro */}
          <div className="p-8 rounded-2xl border-2 border-emerald-500 bg-neutral-950/80 flex flex-col justify-between relative shadow-lg shadow-emerald-950/15 hover:scale-[1.02] transition-all duration-300">
            {/* Best choice badge */}
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-emerald-500 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wide">
              Mais Vendido
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-md font-bold text-emerald-400 uppercase tracking-wider">Concessionária Pro</h3>
                <p className="text-xs text-neutral-400 mt-1">Para lojas de médio porte em expansão acelerada.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-white">R$ {prices.pro}</span>
                <span className="text-neutral-400 text-xs font-medium ml-1">/ mês</span>
              </div>
              <hr className="border-neutral-850" />
              <ul className="space-y-3.5 text-xs text-neutral-200 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Até 3 Concessionárias (Filiais) ativas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Estoque e veículos ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Até 10 vendedores logados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Gerenciador de CRM Kanban com drag-and-drop</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Uploads de fotos e áudios nativos ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Suporte prioritário 24/7</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register"
                className="w-full h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold transition-all text-xs flex items-center justify-center shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Escolher Plano Pro
              </Link>
            </div>
          </div>

          {/* Card 3: Enterprise / Group */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950 flex flex-col justify-between relative hover:border-neutral-800 transition-all duration-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-bold text-neutral-400 uppercase tracking-wider">Grupo Premium</h3>
                <p className="text-xs text-neutral-500 mt-1">Para grandes grupos de concessionárias e redes.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-white">R$ {prices.group}</span>
                <span className="text-neutral-500 text-xs font-medium ml-1">/ mês</span>
              </div>
              <hr className="border-neutral-900" />
              <ul className="space-y-3.5 text-xs text-neutral-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Filiais e Concessionárias ilimitadas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Estoque e veículos ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Vendedores e usuários ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Customização e desenvolvimento de Flows sob demanda</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Infraestrutura dedicada com SLA garantido</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register"
                className="w-full h-10 rounded-lg border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 text-neutral-300 font-bold transition-all text-xs flex items-center justify-center cursor-pointer"
              >
                Escolher Plano Grupo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-neutral-900/10 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Depoimentos</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              O que dizem os donos de concessionárias
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Veja a opinião de quem já utiliza o Zemobi no dia a dia para otimizar suas operações de vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950 flex flex-col justify-between gap-6 hover:border-neutral-850 transition-colors duration-300">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-300 text-xs italic leading-relaxed font-medium">
                  "O visualizador de ondas e a gravação de áudio direto no chat salvaram nosso tempo. Meus vendedores mandam áudios rápidos da ficha do carro sem precisar encostar no celular. A conversão de leads aumentou drasticamente!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-neutral-800 text-xs font-bold flex items-center justify-center text-white">RB</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Roberto Barbosa</h4>
                  <span className="text-[10px] text-neutral-500">Diretor de Vendas - Barbosa Veículos</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950 flex flex-col justify-between gap-6 hover:border-neutral-850 transition-colors duration-300">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-300 text-xs italic leading-relaxed font-medium">
                  "O funil de vendas integrado com cálculo de potencial financeiro nos deu uma clareza incrível. Hoje sei exatamente quantos milhões de reais temos pendentes em cada estágio do estoque de forma automática."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-neutral-800 text-xs font-bold flex items-center justify-center text-white">MS</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Mariana Souza</h4>
                  <span className="text-[10px] text-neutral-500">CEO - Mob Shop Premium</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950 flex flex-col justify-between gap-6 hover:border-neutral-850 transition-colors duration-300">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-300 text-xs italic leading-relaxed font-medium">
                  "O suporte multitenant é excelente. Tenho 4 concessionárias e cada uma tem seu estoque isolado com números de WhatsApp separados, mas consigo auditar o desempenho de toda a equipe em um painel unificado em segundos."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-neutral-800 text-xs font-bold flex items-center justify-center text-white">AL</span>
                <div>
                  <h4 className="text-xs font-bold text-white">André Lopes</h4>
                  <span className="text-[10px] text-neutral-500">Proprietário - Lopes Multimarcas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 md:py-32 max-w-4xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Dúvidas Frequentes</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Perguntas Comuns
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index
            return (
              <div
                key={index}
                className="rounded-xl border border-neutral-900 bg-neutral-950 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 text-sm font-bold text-white hover:bg-neutral-900/10 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className={`text-emerald-500 font-extrabold text-lg transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs text-neutral-400 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* FOOTER CTA SECTION */}
      <section className="py-24 bg-gradient-to-t from-emerald-950/20 to-neutral-950 border-t border-neutral-900 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Pronto para transformar a gestão de vendas da sua concessionária?
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto font-medium">
            Cadastre-se hoje e ganhe acesso imediato ao catálogo, CRM Kanban e atendimento integrado. Teste completo sem compromisso.
          </p>
          <div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold transition-all text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Começar Meu Teste Grátis
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 text-center text-xs text-neutral-600 font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-dark-mode.svg"
              alt="Zemobi Logo"
              width={110}
              height={26}
              className="h-6 w-auto transition-transform group-hover:scale-102"
            />
          </Link>

          <div className="flex flex-wrap justify-center gap-8 text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#demo" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Depoimentos</a>
          </div>

          <div>
            © {new Date().getFullYear()} Zemobi. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
