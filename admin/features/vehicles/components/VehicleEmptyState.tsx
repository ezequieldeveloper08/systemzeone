"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function VehicleEmptyState() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      {/* UFO / Spaceship SVG illustration */}
      <div className="relative mb-6 flex items-center justify-center">
        <svg
          className="size-32 text-neutral-400 dark:text-neutral-600"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Light beam */}
          <path
            d="M60 100 L140 100 L165 170 L35 170 Z"
            fill="url(#beam-gradient)"
            opacity="0.15"
          />
          {/* Small car getting beamed up */}
          <g transform="translate(85, 120) scale(0.6)">
            <rect x="5" y="15" width="40" height="15" rx="5" fill="currentColor" opacity="0.4" />
            <path d="M10 15 L15 5 L35 5 L40 15 Z" fill="currentColor" opacity="0.4" />
            <circle cx="15" cy="30" r="5" fill="currentColor" opacity="0.5" />
            <circle cx="35" cy="30" r="5" fill="currentColor" opacity="0.5" />
          </g>
          {/* UFO Body */}
          <ellipse cx="100" cy="80" rx="45" ry="15" fill="currentColor" opacity="0.2" />
          <ellipse cx="100" cy="76" rx="35" ry="12" fill="currentColor" opacity="0.3" />
          <path d="M80 76 C80 60 120 60 120 76 Z" fill="currentColor" opacity="0.5" />
          {/* Cockpit alien glowing */}
          <circle cx="100" cy="70" r="3" fill="currentColor" className="animate-ping" />
          {/* Lights */}
          <circle cx="75" cy="80" r="1.5" fill="currentColor" opacity="0.8" />
          <circle cx="87" cy="82" r="1.5" fill="currentColor" opacity="0.8" />
          <circle cx="100" cy="83" r="1.5" fill="currentColor" opacity="0.8" />
          <circle cx="113" cy="82" r="1.5" fill="currentColor" opacity="0.8" />
          <circle cx="125" cy="80" r="1.5" fill="currentColor" opacity="0.8" />
          <defs>
            <linearGradient id="beam-gradient" x1="100" y1="100" x2="100" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="currentColor" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
        Nenhum veículo cadastrado
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
        Comece a organizar seu estoque. Cadastre seu primeiro veículo e ele aparecerá na listagem do seu catálogo.
      </p>
      <div className="mt-6">
        <Button asChild className="font-semibold text-sm h-9 gap-1.5 px-4 rounded-lg">
          <Link href="/admin/vehicles/new">
            <Plus className="size-4" />
            Adicionar Veículo
          </Link>
        </Button>
      </div>
    </div>
  )
}
