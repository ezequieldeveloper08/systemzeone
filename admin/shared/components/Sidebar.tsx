"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import {
  Car,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Home,
  CarFront,
  Tags,
  Boxes,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  Percent,
  TrendingUp,
  Sliders,
  DollarSign,
  MessageSquare,
  Database,
  UserCheck,
  Kanban,
  Calendar,
  Utensils,
  Store
} from "lucide-react"
import Image from "next/image"

export function Sidebar() {
  const { user, activeTenant, tenants, switchTenant, createTenant, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Dropdown states
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [createTenantDialogOpen, setCreateTenantDialogOpen] = useState(false)
  const [newTenantName, setNewTenantName] = useState("")

  // Collapsible menus
  const [catalogOpen, setCatalogOpen] = useState(true)
  const [realEstateOpen, setRealEstateOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(true)
  const [digitalShowcaseOpen, setDigitalShowcaseOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [financesOpen, setFinancesOpen] = useState(true)

  const tenantMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Listen to theme mounting to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target as Node)) {
        setTenantDropdownOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!activeTenant) return null

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTenantName.trim()) return
    await createTenant(newTenantName.trim())
    setNewTenantName("")
    setCreateTenantDialogOpen(false)
    setTenantDropdownOpen(false)
  }

  const currentTab = searchParams ? searchParams.get("tab") : null

  // Navigation structure
  const menuItems: any[] = [
    {
      label: "Início",
      icon: Home,
      href: "/admin/dashboard",
      active: pathname === "/admin/dashboard",
    },
  ]

  if (activeTenant.businessType === "veiculos") {
    menuItems.push({
      label: "Catálogo",
      icon: CarFront,
      isCollapsible: true,
      isOpen: catalogOpen,
      setIsOpen: setCatalogOpen,
      subItems: [
        { label: "Todos os Veículos", href: "/admin/vehicles", active: pathname === "/admin/vehicles" },
        { label: "Adicionar Veículo", href: "/admin/vehicles/new", active: pathname === "/admin/vehicles/new" },
      ],
    })
  } else if (activeTenant.businessType === "imoveis") {
    menuItems.push({
      label: "Imóveis",
      icon: Home,
      isCollapsible: true,
      isOpen: realEstateOpen,
      setIsOpen: setRealEstateOpen,
      subItems: [
        { label: "Todos os Imóveis", href: "/admin/real-estate", active: pathname === "/admin/real-estate" },
      ],
    })
  } else if (activeTenant.businessType === "menu") {
    menuItems.push({
      label: "Restaurante",
      icon: Utensils,
      isCollapsible: true,
      isOpen: menuOpen,
      setIsOpen: setMenuOpen,
      subItems: [
        { label: "Gestor de Pedidos", href: "/admin/orders", active: pathname === "/admin/orders" },
        { label: "Relatórios e Histórico", href: "/admin/orders/history", active: pathname === "/admin/orders/history" },
        { label: "Mesas e Comandas", href: "/admin/tables", active: pathname === "/admin/tables" },
        { label: "Gerenciar Itens", href: "/admin/menu", active: pathname === "/admin/menu" },
        { label: "Configuração da Loja", href: "/admin/menu/settings", active: pathname === "/admin/menu/settings" },
      ],
    })
  } else if (activeTenant.businessType === "vitrine") {
    menuItems.push({
      label: "Vitrine Digital",
      icon: Store,
      isCollapsible: true,
      isOpen: digitalShowcaseOpen,
      setIsOpen: setDigitalShowcaseOpen,
      subItems: [
        { label: "Gerenciar Vitrine", href: "/admin/digital-showcase", active: pathname === "/admin/digital-showcase" },
      ],
    })
  }

  menuItems.push(
    {
      label: "Conversas",
      icon: MessageSquare,
      href: "/admin/whatsapp/chat",
      active: pathname === "/admin/whatsapp/chat" || pathname.startsWith("/admin/whatsapp/chat"),
    },
    {
      label: "Contatos",
      icon: Users,
      href: "/admin/leads",
      active: pathname === "/admin/leads",
    },
    {
      label: "Funil (CRM)",
      icon: Kanban,
      href: "/admin/pipeline",
      active: pathname === "/admin/pipeline",
    },
    {
      label: "Agenda",
      icon: Calendar,
      href: "/admin/calendar",
      active: pathname === "/admin/calendar",
    },
    {
      label: "Equipe",
      icon: UserCheck,
      href: "/admin/team",
      active: pathname === "/admin/team",
    },
    {
      label: "Finanças",
      icon: DollarSign,
      isCollapsible: true,
      isOpen: financesOpen,
      setIsOpen: setFinancesOpen,
      subItems: [
        { label: "Fluxo de Caixa", href: "/admin/finances?tab=flow", active: pathname === "/admin/finances" && (currentTab === "flow" || !currentTab) },
        { label: "Contas a Receber", href: "/admin/finances?tab=receivables", active: pathname === "/admin/finances" && currentTab === "receivables" },
        { label: "Contas a Pagar", href: "/admin/finances?tab=payables", active: pathname === "/admin/finances" && currentTab === "payables" },
      ],
    },
    {
      label: "Configurações",
      icon: Settings,
      isCollapsible: true,
      isOpen: settingsOpen,
      setIsOpen: setSettingsOpen,
      subItems: [
        { label: "Integrações", href: "/admin/whatsapp/settings", active: pathname === "/admin/whatsapp/settings" },
        { label: "Modelos de Mensagem", href: "/admin/whatsapp/templates", active: pathname === "/admin/whatsapp/templates" },
        { label: "Fluxos (Flows)", href: "/admin/whatsapp/flows", active: pathname === "/admin/whatsapp/flows" },
        { label: "Histórico de Envios", href: "/admin/whatsapp/history", active: pathname === "/admin/whatsapp/history" },
      ],
    }
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-neutral-200 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950">
        {/* LOGO & TENANT SELECTOR */}
        <Image src={theme === "dark" ? "/logo-dark-mode.svg" : "/logo-ligth-mode.svg"} alt="Logo" width={100} height={48} />
        <div className="relative my-5" ref={tenantMenuRef}>
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-200/80 bg-white p-2.5 text-left shadow-xs transition-colors hover:bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold text-xs text-neutral-400 uppercase tracking-wider">
                  {activeTenant.businessType === "veiculos" ? "Veículos Multitenant" :
                    activeTenant.businessType === "imoveis" ? "Imóveis Multitenant" :
                      activeTenant.businessType === "menu" ? "Cardápio Multitenant" :
                        activeTenant.businessType === "vitrine" ? "Vitrine Multitenant" :
                          "SaaS Multitenant"}
                </span>
                <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 truncate">
                  {activeTenant.name}
                </span>
              </div>
            </div>
            <ChevronDown className="size-4 text-neutral-400 shrink-0 ml-1.5" />
          </button>

          {/* TENANT SELECTOR DROPDOWN */}
          {tenantDropdownOpen && (
            <div className="absolute top-full left-0 z-30 mt-1.5 w-full rounded-lg border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <p className="px-2.5 py-1 text-xs font-semibold text-neutral-400 uppercase">
                {activeTenant.businessType === "veiculos" ? "Concessionárias" :
                  activeTenant.businessType === "imoveis" ? "Imobiliárias" :
                    activeTenant.businessType === "menu" ? "Restaurantes" :
                      activeTenant.businessType === "vitrine" ? "Lojas" :
                        "Empresas"}
              </p>
              <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={async () => {
                      await switchTenant(t.id)
                      setTenantDropdownOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors ${t.id === activeTenant.id
                      ? "bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50"
                      : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
                      }`}
                  >
                    <span className="truncate">{t.name}</span>
                    {t.id === activeTenant.id && (
                      <span className="size-1.5 rounded-full bg-neutral-950 dark:bg-neutral-50" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-neutral-100 my-1.5 dark:border-neutral-800" />

              <button
                onClick={() => setCreateTenantDialogOpen(true)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
              >
                <Plus className="size-4" />
                Criar {activeTenant.businessType === "veiculos" ? "Concessionária" :
                  activeTenant.businessType === "imoveis" ? "Imobiliária" :
                    activeTenant.businessType === "menu" ? "Restaurante" :
                      activeTenant.businessType === "vitrine" ? "Loja" :
                        "Empresa"}
              </button>
            </div>
          )}
        </div>

        {/* MOCK SEARCH INPUT */}
        <div className="relative mb-6">
          <Search className="absolute top-2.5 left-3 size-4 text-neutral-600" />
          <input
            type="text"
            placeholder="Buscar..."
            disabled
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-12 text-sm text-neutral-600 shadow-2xs opacity-75 select-none dark:border-neutral-800 dark:bg-neutral-900 cursor-not-allowed"
          />
          <kbd className="absolute top-2 right-2 flex h-5 items-center gap-0.5 rounded border border-neutral-200 bg-neutral-50 px-1 text-[10px] font-medium text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            <span>⌘</span>K
          </kbd>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {menuItems.map((item, idx) => {
            if (item.isCollapsible) {
              return (
                <div key={idx} className="space-y-1">
                  <button
                    onClick={() => item.setIsOpen!(!item.isOpen)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="size-4 text-neutral-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.isOpen ? (
                      <ChevronDown className="size-3.5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="size-3.5 text-neutral-400" />
                    )}
                  </button>

                  {item.isOpen && (
                    <div className="pl-6.5 space-y-1 border-l border-neutral-200/60 ml-4.5 dark:border-neutral-800/60">
                      {item.subItems!.map((sub: any, sIdx: number) => (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${sub.active
                            ? "bg-neutral-900 font-semibold text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                            }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={idx}
                href={item.href || "#"}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${item.active
                  ? "bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
                  }`}
              >
                <item.icon className="size-4 text-neutral-400" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* BOTTOM USER ACCOUNT */}
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800 mt-auto">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/40 text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt={user?.name || "Profile"}
                  className="size-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-800"
                />
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">
                    {user?.name || "Usuário"}
                  </span>
                  <span className="text-xs text-neutral-400 truncate">
                    {user?.email || "admin@exemplo.com"}
                  </span>
                </div>
              </div>
              <ChevronDown className="size-4 text-neutral-400 shrink-0 ml-1" />
            </button>

            {/* USER SETTINGS DROPDOWN */}
            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 z-30 mb-2 w-full rounded-lg border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                {mounted && (
                  <button
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark")
                      setUserDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="size-4 text-neutral-400" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="size-4 text-neutral-400" />
                        Modo Escuro
                      </>
                    )}
                  </button>
                )}

                <div className="border-t border-neutral-100 my-1 dark:border-neutral-800" />

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <LogOut className="size-4" />
                  Sair do Sistema
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CREATE NEW DEALERSHIP DIALOG (MODAL) */}
      {createTenantDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              Nova Concessionária
            </h3>
            <p className="text-sm text-neutral-500 mt-1 mb-4 dark:text-neutral-400">
              Cadastre outra filial ou concessionária sob seu gerenciamento.
            </p>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Nome da Marca
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Capri Chevrolet Anápolis"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateTenantDialogOpen(false)}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                >
                  Criar e Alternar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
