"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { crmService } from "@/features/crm/services/crmService"
import { vehicleService } from "@/features/vehicles/services/vehicleService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  Users,
  AlertCircle,
  CarIcon,
  Tag,
  Clock,
  UserCheck,
  Flame
} from "lucide-react"
const formatPhoneToMask = (phoneStr: string) => {
  if (!phoneStr) return ""
  let clean = phoneStr.replace(/\D/g, "")
  if (clean.startsWith("55") && (clean.length === 12 || clean.length === 13)) {
    clean = clean.substring(2)
  }
  if (clean.length <= 2) {
    return clean.length > 0 ? `(${clean}` : ""
  }
  if (clean.length <= 6) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2)}`
  }
  if (clean.length <= 10) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6)}`
  }
  return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`
}

export function ContactForm({ contactId }: { contactId?: string }) {
  const router = useRouter()
  const { activeTenant } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])

  // Form Fields - Contact
  const [name, setName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [type, setType] = useState<"PERSON" | "COMPANY">("PERSON")
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ" | "OTHER">("CPF")
  const [document, setDocument] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [source, setSource] = useState<string>("website")
  const [sourceDetails, setSourceDetails] = useState("")
  const [notes, setNotes] = useState("")

  // Form Fields - CRM Metrics
  const [lifecycleStage, setLifecycleStage] = useState<string>("LEAD")
  const [status, setStatus] = useState<string>("NEW")
  const [temperature, setTemperature] = useState<string>("COLD")
  const [leadScore, setLeadScore] = useState<number>(10)

  // Form Fields - Opportunity Link
  const [vehicleId, setVehicleId] = useState("")

  // Fetch vehicles for selection
  useEffect(() => {
    const loadVehicles = async () => {
      if (!activeTenant?.id) return
      try {
        const vehiclesData = await vehicleService.getAllVehicles(activeTenant.id)
        setVehicles(vehiclesData)
      } catch (err) {
        console.error("Erro ao carregar veículos para o formulário:", err)
      }
    }
    loadVehicles()
  }, [activeTenant])

  // Fetch contact data if in edit mode
  useEffect(() => {
    const loadContact = async () => {
      if (!contactId) return
      setIsSubmitting(true)
      try {
        const contact = await crmService.getContact(contactId)
        setName(contact.name || "")
        setDisplayName(contact.displayName || "")
        setPhone(formatPhoneToMask(contact.phone || ""))
        setEmail(contact.email || "")
        setType(contact.type || "PERSON")
        setDocumentType(contact.documentType || "CPF")
        setDocument(contact.document || "")
        setCompanyName(contact.companyName || "")
        setJobTitle(contact.jobTitle || "")
        setNotes(contact.notes || "")
        setLifecycleStage(contact.lifecycleStage || "LEAD")
        setStatus(contact.status || "NEW")
        setTemperature(contact.temperature || "COLD")
        setLeadScore(contact.leadScore || 0)

        // Map reverse source
        const sourceMapReverse: Record<string, string> = {
          "WEBSITE": "website",
          "WHATSAPP": "whatsapp",
          "MANUAL": "showroom",
          "OTHER": "webmotors"
        }
        setSource(sourceMapReverse[contact.source] || "showroom")
        setSourceDetails(contact.sourceDetails || "")
      } catch (err) {
        console.error("Erro ao carregar contato:", err)
        setError("Não foi possível carregar as informações do contato.")
      } finally {
        setIsSubmitting(false)
      }
    }
    loadContact()
  }, [contactId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("O nome do contato é obrigatório.")
      return
    }
    if (!phone.trim()) {
      setError("O telefone do contato é obrigatório.")
      return
    }

    setIsSubmitting(true)

    try {
      // Map frontend source values to ContactSource enum
      const sourceMap: Record<string, string> = {
        website: "WEBSITE",
        whatsapp: "WHATSAPP",
        showroom: "MANUAL",
        webmotors: "OTHER",
        olx: "OTHER"
      }
      const mappedSource = sourceMap[source] || "MANUAL"

      const contactPayload = {
        name,
        displayName: displayName || null,
        phone,
        email: email || null,
        type,
        documentType: document ? documentType : null,
        document: document || null,
        companyName: companyName || null,
        jobTitle: jobTitle || null,
        source: mappedSource as any,
        sourceDetails: sourceDetails || null,
        notes: notes || null,
        lifecycleStage: lifecycleStage as any,
        status: status as any,
        temperature: temperature as any,
        leadScore: Number(leadScore),
      }

      if (contactId) {
        await crmService.updateContact(contactId, contactPayload)
      } else {
        const contact = await crmService.createContact(contactPayload)

        // Create deal if vehicle selected
        if (vehicleId) {
          const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
          const price = selectedVehicle ? selectedVehicle.price : 0
          const vehicleTitle = selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Veículo"

          await crmService.createDeal({
            contactId: contact.id,
            title: `Negócio - Interesse em ${vehicleTitle}`,
            vehicleId: vehicleId,
            value: price,
            description: `Oportunidade criada a partir do cadastro do contato.`,
          })
        }
      }

      router.push("/admin/leads")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar o contato.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* FORM TOP BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ChevronLeft className="size-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Voltar aos contatos
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {contactId ? "Editar Contato" : "Novo Contato"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild type="button" variant="outline" className="h-9 text-xs font-semibold px-4 rounded-lg">
            <Link href="/admin/leads">
              Descartar
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold px-4 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
          >
            {isSubmitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              contactId ? "Salvar Alterações" : "Salvar Contato"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: MAIN INPUTS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Info */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
              <Users className="size-4" />
              Informações do Contato
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Ex: Carlos Souza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="displayName">Nome de Exibição (Apelido)</Label>
                <Input
                  id="displayName"
                  placeholder="Ex: Carlinhos"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Tipo de Contato</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="PERSON">Pessoa Física</option>
                  <option value="COMPANY">Pessoa Jurídica (Empresa)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone / Celular <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  placeholder="Ex: (11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneToMask(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="carlos@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="document">Número do Documento</Label>
                <Input
                  id="document"
                  placeholder="Apenas números"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Souza Automóveis LTDA"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Cargo / Função</Label>
                <Input
                  id="jobTitle"
                  placeholder="Ex: Diretor de Vendas"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card: Notes */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Anotações e Histórico Inicial
            </h3>
            <Textarea
              placeholder="Escreva detalhes adicionais, preferências de contato, veículos anteriores, ou qualquer observação comercial..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] bg-white dark:bg-neutral-950"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR METADATA (1/3 width) */}
        <div className="space-y-6">
          {/* Card: Lifecycle & Status */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Clock className="size-4" />
              Ciclo Comercial
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="lifecycleStage">Estágio de Relacionamento</Label>
                <select
                  id="lifecycleStage"
                  value={lifecycleStage}
                  onChange={(e) => setLifecycleStage(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="LEAD">Lead (Contato Frio)</option>
                  <option value="MQL">MQL (Lead de Marketing)</option>
                  <option value="SQL">SQL (Lead Qualificado Vendas)</option>
                  <option value="OPPORTUNITY">Oportunidade Comercial</option>
                  <option value="CUSTOMER">Cliente (Conversão Concluída)</option>
                  <option value="INACTIVE_CUSTOMER">Cliente Inativo</option>
                  <option value="EVANGELIST">Promotor / Indicador</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status do Contato</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="NEW">Novo</option>
                  <option value="IN_SERVICE">Em Atendimento</option>
                  <option value="WAITING_CUSTOMER">Aguardando Cliente</option>
                  <option value="QUALIFIED">Qualificado</option>
                  <option value="NEGOTIATION">Em Negociação</option>
                  <option value="PROPOSAL_SENT">Proposta Enviada</option>
                  <option value="WON">Ganho</option>
                  <option value="LOST">Perdido</option>
                  <option value="ACTIVE">Cliente Ativo</option>
                  <option value="INACTIVE">Cliente Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="temperature" className="flex items-center gap-1">
                  <Flame className="size-3.5 text-orange-500" />
                  Temperatura do Lead
                </Label>
                <select
                  id="temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="COLD">Frio (Cold)</option>
                  <option value="WARM">Morno (Warm)</option>
                  <option value="HOT">Quente (Hot)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="leadScore">Lead Score (Pontuação)</Label>
                <Input
                  id="leadScore"
                  type="number"
                  placeholder="Ex: 10"
                  value={leadScore}
                  onChange={(e) => setLeadScore(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Card: Source */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Tag className="size-4" />
              Origem e Atribuição
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="source">Canal de Origem</Label>
                <select
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="website">Website / Formulário</option>
                  <option value="whatsapp">WhatsApp Concessionária</option>
                  <option value="showroom">Showroom / Visita Física</option>
                  <option value="webmotors">Webmotors</option>
                  <option value="olx">OLX</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sourceDetails">Detalhes da Origem</Label>
                <Input
                  id="sourceDetails"
                  placeholder="Ex: Anúncio do Instagram, Indicação..."
                  value={sourceDetails}
                  onChange={(e) => setSourceDetails(e.target.value)}
                />
              </div>
            </div>
          </div>

          {!contactId && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <CarIcon className="size-4" />
                Interesse e Negócio
              </h3>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleId">Veículo de Interesse</Label>
                  <select
                    id="vehicleId"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    <option value="">-- Sem veículo específico --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.year}) - R$ {v.price.toLocaleString("pt-BR")}
                      </option>
                    ))}
                  </select>
                </div>

                {vehicleId && (
                  <div className="rounded-lg bg-neutral-50 p-3 text-[11px] text-neutral-500 leading-relaxed dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">Nota de CRM:</span>
                    Ao selecionar um veículo de interesse, uma oportunidade de negócio (Deal) será criada automaticamente no primeiro estágio do seu funil comercial ativo.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
