"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useVehicles } from "@/features/vehicles/hooks/useVehicles"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { DashboardCharts } from "@/features/dashboard/components/DashboardCharts"
import { leadsService } from "@/features/leads/services/leadsService"
import { crmService, Activity } from "@/features/crm/services/crmService"
import {
  CarFront,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  Clock,
  Car
} from "lucide-react"

export default function AdminDashboardPage() {
  const { activeTenant } = useAuth()
  const { vehicles, totalCount } = useVehicles()
  const [leadsCount, setLeadsCount] = useState(0)
  const [proposalsCount, setProposalsCount] = useState(0)
  const [activities, setActivities] = useState<Activity[]>([])

  // Calculate dynamic stats
  const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0)
  const publishedCount = vehicles.filter((v) => v.status === "published").length
  const draftCount = vehicles.filter((v) => v.status === "hidden").length

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(value)
  }

  useEffect(() => {
    if (activeTenant) {
      leadsService.getLeads().then(l => setLeadsCount(l.length)).catch(() => setLeadsCount(0))
      crmService.getDeals().then(d => setProposalsCount(d.length)).catch(() => setProposalsCount(0))
      crmService.getActivities().then(a => {
        const sorted = [...a].sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
        setActivities(sorted)
      }).catch(() => setActivities([]))
    }
  }, [activeTenant])

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Olá, bem-vindo de volta!
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Aqui está o resumo geral para a concessionária <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{activeTenant?.name}</strong>.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI: Total Vehicles */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Veículos no Catálogo
            </span>
            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <CarFront className="size-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {totalCount}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {publishedCount} ativos
              </span>
              <span>•</span>
              <span className="text-neutral-400">{draftCount} rascunhos</span>
            </div>
          </div>
        </div>

        {/* KPI: Estimated Stock Value */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Valor do Estoque
            </span>
            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 truncate block">
              {formatPrice(totalValue)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="text-neutral-400">Média de {totalCount > 0 ? formatPrice(totalValue / totalCount) : "R$ 0"} por veículo</span>
            </div>
          </div>
        </div>

        {/* KPI: Leads */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Novos Leads (Este Mês)
            </span>
            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {leadsCount}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="size-3.5" />
              <span>+18% em relação à semana passada</span>
            </div>
          </div>
        </div>

        {/* KPI: Proposals */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Propostas Ativas
            </span>
            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <TrendingUp className="size-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {proposalsCount}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="text-neutral-400">Taxa de conversão de 14.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts vehicles={vehicles} />

      {/* Grid: Recent activity and vehicles list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Vehicles (Left Column 2/3) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-neutral-900 dark:text-neutral-50">
              Últimos Veículos Adicionados
            </h3>
            <Link href="/admin/vehicles" className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Ver tudo
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">Nenhum veículo adicionado ainda.</p>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {vehicle.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={vehicle.images[0]} alt={vehicle.title} className="size-10 rounded-md object-cover" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                        <CarFront className="size-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                        {vehicle.title}
                      </h4>
                      <p className="text-xs text-neutral-400">{vehicle.brand} • {vehicle.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                      {formatPrice(vehicle.price)}
                    </span>
                    <p className="text-[10px] text-neutral-400">
                      {vehicle.status === "published" ? "Publicado" : "Oculto"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent leads / activities (Right Column 1/3) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <h3 className="text-md font-bold text-neutral-900 dark:text-neutral-50">
            Atividades Recentes
          </h3>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-neutral-500 py-6 text-center">Nenhuma atividade recente.</p>
            ) : (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex gap-3 text-xs leading-normal">
                  <Clock className="size-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">
                      <strong>{activity.title}</strong>
                      {activity.description && ` - ${activity.description}`}
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(activity.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
