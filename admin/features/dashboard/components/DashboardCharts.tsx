"use client"

import React, { useState } from "react"
import { Vehicle } from "@/features/vehicles/types"
import { TrendingUp, BarChart3, PieChart, Info } from "lucide-react"

interface DashboardChartsProps {
  vehicles: Vehicle[]
}

const MONTHLY_DATA = [
  { month: "Jan", sales: 12, leads: 48 },
  { month: "Fev", sales: 19, leads: 58 },
  { month: "Mar", sales: 15, leads: 72 },
  { month: "Abr", sales: 25, leads: 95 },
  { month: "Mai", sales: 22, leads: 84 },
  { month: "Jun", sales: 30, leads: 110 }
]

export function DashboardCharts({ vehicles }: DashboardChartsProps) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)

  // Calculate dynamic brand distribution
  const totalVehicles = vehicles.length
  const brandCounts: Record<string, number> = {}
  vehicles.forEach((v) => {
    brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1
  })

  const brandDistribution = Object.entries(brandCounts)
    .map(([brand, count]) => ({
      brand,
      count,
      percentage: totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)

  // Chart configuration parameters
  const chartHeight = 180
  const chartWidth = 500
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 10
  const paddingBottom = 30

  const graphHeight = chartHeight - paddingTop - paddingBottom
  const graphWidth = chartWidth - paddingLeft - paddingRight

  // Find max value in monthly data for scale
  const maxLeads = Math.max(...MONTHLY_DATA.map((d) => d.leads))
  const maxVal = Math.ceil(maxLeads / 20) * 20 // round to next multiple of 20

  const getCoordinates = (index: number, value: number) => {
    const x = paddingLeft + (index / (MONTHLY_DATA.length - 1)) * graphWidth
    const y = paddingTop + graphHeight - (value / maxVal) * graphHeight
    return { x, y }
  }

  // Construct SVG paths
  const leadPoints = MONTHLY_DATA.map((d, i) => getCoordinates(i, d.leads))
  const salesPoints = MONTHLY_DATA.map((d, i) => getCoordinates(i, d.sales * 3)) // scale sales up for visibility

  const leadsPath = leadPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const leadsAreaPath = `
    ${leadsPath} 
    L ${leadPoints[leadPoints.length - 1].x} ${paddingTop + graphHeight} 
    L ${leadPoints[0].x} ${paddingTop + graphHeight} Z
  `

  const salesPath = salesPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const salesAreaPath = `
    ${salesPath} 
    L ${salesPoints[salesPoints.length - 1].x} ${paddingTop + graphHeight} 
    L ${salesPoints[0].x} ${paddingTop + graphHeight} Z
  `

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Chart 1: Performance Line/Area Chart */}
      <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-md font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
              <TrendingUp className="size-4.5 text-neutral-500" />
              Histórico de Performance
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Controle de conversões de leads e vendas nos últimos 6 meses.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
              <span className="size-2.5 rounded-full bg-neutral-950 dark:bg-white" />
              <span>Leads</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span>Vendas (x3)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#171717" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#171717" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="leadsGradientDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + graphHeight * ratio
              const value = Math.round(maxVal * (1 - ratio))
              return (
                <g key={idx} className="opacity-40 dark:opacity-20">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + graphWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-neutral-300 dark:text-neutral-800"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-neutral-450 dark:fill-neutral-500 font-mono text-[9px] font-semibold"
                  >
                    {value}
                  </text>
                </g>
              )
            })}

            {/* Area under the curves */}
            <path
              d={leadsAreaPath}
              className="fill-[url(#leadsGradient)] dark:fill-[url(#leadsGradientDark)]"
            />
            <path d={salesAreaPath} className="fill-[url(#salesGradient)]" />

            {/* Line Paths */}
            <path
              d={leadsPath}
              fill="none"
              strokeWidth="2.5"
              className="stroke-neutral-950 dark:stroke-white"
            />
            <path d={salesPath} fill="none" strokeWidth="2.5" className="stroke-emerald-500" />

            {/* Interactive Circles & Tooltip triggers */}
            {MONTHLY_DATA.map((d, idx) => {
              const leadP = leadPoints[idx]
              const salesP = salesPoints[idx]
              const isHovered = activeTooltip === idx

              return (
                <g key={idx}>
                  {/* Invisible broad column for hover detection */}
                  <rect
                    x={leadP.x - graphWidth / (MONTHLY_DATA.length - 1) / 2}
                    y={paddingTop}
                    width={graphWidth / (MONTHLY_DATA.length - 1)}
                    height={graphHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveTooltip(idx)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />

                  {/* Highlight bar on hover */}
                  {isHovered && (
                    <line
                      x1={leadP.x}
                      y1={paddingTop}
                      x2={leadP.x}
                      y2={paddingTop + graphHeight}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-neutral-200 dark:text-neutral-800 opacity-60"
                    />
                  )}

                  {/* Leads Dot */}
                  <circle
                    cx={leadP.x}
                    cy={leadP.y}
                    r={isHovered ? 5 : 3.5}
                    className="fill-neutral-950 dark:fill-white stroke-white dark:stroke-neutral-950 stroke-2 transition-all"
                  />

                  {/* Sales Dot */}
                  <circle
                    cx={salesP.x}
                    cy={salesP.y}
                    r={isHovered ? 5 : 3.5}
                    className="fill-emerald-500 stroke-white dark:stroke-neutral-950 stroke-2 transition-all"
                  />
                </g>
              )
            })}

            {/* Bottom X-Axis labels */}
            {MONTHLY_DATA.map((d, idx) => {
              const p = leadPoints[idx]
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="fill-neutral-400 dark:fill-neutral-500 font-sans text-[10px] font-semibold"
                >
                  {d.month}
                </text>
              )
            })}
          </svg>

          {/* Floating HTML tooltip */}
          {activeTooltip !== null && (
            <div
              className="absolute pointer-events-none rounded-lg border border-neutral-200 bg-white/95 p-2.5 shadow-md dark:border-neutral-800 dark:bg-neutral-950/95 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
              style={{
                left: `${(leadPoints[activeTooltip].x / chartWidth) * 100}%`,
                top: `${(leadPoints[activeTooltip].y / chartHeight) * 100 - 35}%`,
                transform: "translateX(-50%)"
              }}
            >
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                {MONTHLY_DATA[activeTooltip].month}
              </p>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Leads: <strong className="font-semibold text-neutral-800 dark:text-neutral-100">{MONTHLY_DATA[activeTooltip].leads}</strong>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Vendas: <strong className="font-semibold">{MONTHLY_DATA[activeTooltip].sales}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Brand Distribution Breakdown */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-5">
        <div>
          <h3 className="text-md font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
            <BarChart3 className="size-4.5 text-neutral-500" />
            Distribuição por Marca
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Proporção de veículos cadastrados por montadora.
          </p>
        </div>

        {totalVehicles === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-neutral-450 dark:text-neutral-500 space-y-1">
            <Info className="size-5" />
            <span>Adicione veículos para ver a distribuição do seu catálogo por marca.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {brandDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  <span>{item.brand}</span>
                  <span>
                    {item.count} {item.count === 1 ? "veículo" : "veículos"}{" "}
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                      ({item.percentage}%)
                    </span>
                  </span>
                </div>
                {/* Premium Animated Progress Bar */}
                <div className="relative h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-neutral-950 dark:bg-white transition-all duration-500 ease-out"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
