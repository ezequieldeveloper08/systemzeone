"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { tenantService } from "@/features/menu/services/tenantService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Save,
  Image as ImageIcon,
  Camera,
  Phone,
  MapPin,
  Clock,
  Store,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

// Inline custom SVGs to guarantee compatibility
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

interface OpeningHour {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

const DEFAULT_HOURS: OpeningHour[] = [
  { day: "Segunda-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Terça-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Quarta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Quinta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Sexta-feira", isOpen: true, openTime: "18:00", closeTime: "00:00" },
  { day: "Sábado", isOpen: true, openTime: "11:00", closeTime: "00:00" },
  { day: "Domingo", isOpen: true, openTime: "11:00", closeTime: "23:00" },
]

const getSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function StoreSettingsPage() {
  const { activeTenant } = useAuth()

  // Form states
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [logo, setLogo] = useState("")
  const [banner, setBanner] = useState("")
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(DEFAULT_HOURS)

  // System states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showBannerInput, setShowBannerInput] = useState(false)
  const [showLogoInput, setShowLogoInput] = useState(false)

  // Fetch settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!activeTenant) return
      try {
        setLoading(true)
        const data = await tenantService.getTenant(activeTenant.id)
        setName(data.name || "")
        setBio(data.bio || "")
        setPhone(data.phone || "")
        setAddress(data.address || "")
        setLogo(data.logo || "")
        setBanner(data.banner || "")
        setInstagram(data.instagram || "")
        setFacebook(data.facebook || "")
        if (data.openingHours && Array.isArray(data.openingHours)) {
          setOpeningHours(data.openingHours)
        }
      } catch (err) {
        console.error("Erro ao carregar dados do tenant:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [activeTenant])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTenant) return
    setSaving(true)
    setMessage(null)

    try {
      await tenantService.updateTenant(activeTenant.id, {
        name,
        bio,
        phone,
        address,
        logo,
        banner,
        instagram,
        facebook,
        openingHours,
      })
      setMessage({ type: "success", text: "Configurações da empresa salvas com sucesso!" })
      
      // Auto dismiss success message
      setTimeout(() => setMessage(null), 4000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao salvar as configurações." })
    } finally {
      setSaving(false)
    }
  }

  const handleHourToggle = (idx: number, isOpen: boolean) => {
    setOpeningHours((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, isOpen } : h))
    )
  }

  const handleHourChange = (idx: number, field: "openTime" | "closeTime", value: string) => {
    setOpeningHours((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h))
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <Loader2 className="size-10 animate-spin text-neutral-500 mb-3" />
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Carregando configurações da empresa...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Store className="size-8 text-neutral-700 dark:text-neutral-300" />
            Perfil da Empresa
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie a identidade, dados de contato e horários de funcionamento do seu restaurante.
          </p>
        </div>
      </div>

      {/* FEEDBACK MESSAGE */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border animate-in slide-in-from-top-2 duration-150 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/50"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/50"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold">{message.type === "success" ? "Sucesso" : "Erro"}</p>
            <p className="text-xs mt-0.5 opacity-90">{message.text}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* BANNER & LOGO SECTION */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-xs dark:border-neutral-800/85 dark:bg-neutral-950">
          {/* Banner Container */}
          <div className="relative h-56 w-full bg-neutral-100 dark:bg-neutral-900">
            {banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner} alt="Banner" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-80" />
            )}

            {/* Change Banner button floating */}
            <div className="absolute top-4 right-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowBannerInput(!showBannerInput)}
                className="bg-white/85 backdrop-blur-xs text-neutral-800 hover:bg-white border border-neutral-200 shadow-xs flex items-center gap-1.5 h-8 text-xs font-bold"
              >
                <ImageIcon className="size-3.5" />
                Alterar Banner
              </Button>
            </div>
          </div>

          {/* Profile Header Content (holding logo & title) */}
          <div className="relative px-6 pb-6">
            {/* Logo Overlay Circle */}
            <div className="absolute -top-14 left-6 size-28 rounded-full border-4 border-white bg-white shadow-md overflow-visible dark:border-neutral-950 dark:bg-neutral-900 group">
              <div className="size-full rounded-full overflow-hidden relative">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Store className="size-10 text-neutral-400 dark:text-neutral-500" />
                  </div>
                )}
                
                {/* Camera hover trigger */}
                <button
                  type="button"
                  onClick={() => setShowLogoInput(!showLogoInput)}
                  className="absolute inset-0 bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150"
                >
                  <Camera className="size-5 text-white" />
                </button>
              </div>

              {/* Floating Camera Badge */}
              <button
                type="button"
                onClick={() => setShowLogoInput(!showLogoInput)}
                className="absolute bottom-0 right-0 size-8 rounded-full bg-neutral-900 text-white border-2 border-white shadow-md flex items-center justify-center hover:bg-neutral-800 dark:border-neutral-900 transition-colors"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            {/* Spacing and Name Header */}
            <div className="pt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50">
                  {name || "Nome do Restaurante"}
                </h2>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Restaurante Multitenant • ID: {activeTenant?.id}
                </p>
                {name && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex flex-wrap items-center gap-1.5 font-medium">
                    <span className="text-neutral-400 dark:text-neutral-500">Link do Cardápio:</span>
                    <a
                      href={`/restaurantes/${getSlug(name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 font-bold hover:underline"
                    >
                      zeone.com.br/restaurantes/{getSlug(name)}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Collapsible Edit Image URLs Inputs */}
            {(showLogoInput || showBannerInput) && (
              <div className="mt-6 p-5 rounded-xl border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800/20 dark:bg-neutral-900/10 space-y-4 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Editar Mídia de Identidade
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-bold text-neutral-500"
                    onClick={() => {
                      setShowLogoInput(false)
                      setShowBannerInput(false)
                    }}
                  >
                    Fechar
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showLogoInput && (
                    <div className="space-y-1.5 animate-in fade-in duration-100">
                      <Label htmlFor="logoUrl" className="text-xs font-semibold text-neutral-500">URL do Logo</Label>
                      <Input
                        id="logoUrl"
                        type="text"
                        placeholder="Cole a URL da imagem do logo..."
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                      />
                    </div>
                  )}
                  {showBannerInput && (
                    <div className="space-y-1.5 animate-in fade-in duration-100">
                      <Label htmlFor="bannerUrl" className="text-xs font-semibold text-neutral-500">URL do Banner</Label>
                      <Input
                        id="bannerUrl"
                        type="text"
                        placeholder="Cole a URL da imagem do banner..."
                        value={banner}
                        onChange={(e) => setBanner(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/85 dark:bg-neutral-950 space-y-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="storeName" className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500">Nome do Restaurante</Label>
              <Input
                id="storeName"
                type="text"
                required
                placeholder="Ex: Ze One Restaurante"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="bio" className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500">Biografia / Descrição Curta</Label>
              <Textarea
                id="bio"
                placeholder="Escreva uma breve descrição sobre o seu restaurante..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="phone" className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                <Phone className="size-3.5" />
                Telefone de Contato
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="Ex: (11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="address" className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                <MapPin className="size-3.5" />
                Endereço Físico
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SOCIAL NETWORKS */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/85 dark:bg-neutral-950 space-y-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Redes Sociais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="instagram" className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                <InstagramIcon className="size-3.5 text-pink-500" />
                Perfil do Instagram
              </Label>
              <Input
                id="instagram"
                type="text"
                placeholder="Ex: @zeonerestaurante"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="facebook" className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                <FacebookIcon className="size-3.5 text-blue-600" />
                Página do Facebook
              </Label>
              <Input
                id="facebook"
                type="text"
                placeholder="Ex: facebook.com/zeonerestaurante"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* OPENING HOURS */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/85 dark:bg-neutral-950 space-y-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Clock className="size-5 text-neutral-500" />
            Horário de Funcionamento
          </h3>
          
          <div className="space-y-4">
            {openingHours.map((hour, idx) => (
              <div
                key={hour.day}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 dark:border-neutral-900 dark:bg-neutral-900/10"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`day-${idx}`}
                    checked={hour.isOpen}
                    onCheckedChange={(checked) => handleHourToggle(idx, checked === true)}
                  />
                  <Label htmlFor={`day-${idx}`} className="font-bold text-sm text-neutral-700 dark:text-neutral-200">
                    {hour.day}
                  </Label>
                </div>

                {hour.isOpen ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => handleHourChange(idx, "openTime", e.target.value)}
                      className="w-24 h-9"
                    />
                    <span className="text-neutral-400 text-xs">até</span>
                    <Input
                      type="time"
                      value={hour.closeTime}
                      onChange={(e) => handleHourChange(idx, "closeTime", e.target.value)}
                      className="w-24 h-9"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-md">
                    Fechado
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SAVE ACTIONS */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 flex items-center gap-2 px-6 h-11 text-sm font-bold shadow-xs"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}
