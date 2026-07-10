"use client"

import React, { useState, useEffect, useRef } from "react"
import { Play, Pause, Square, Trash2, Database, Sliders, Activity, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fipeService, FipeSyncState } from "../services/fipeService"

export function FipeSyncPanel() {
  const [state, setState] = useState<FipeSyncState>({
    isSyncing: false,
    isPaused: false,
    currentStage: "idle",
    vehicleTypes: ["cars"],
    currentVehicleType: null,
    currentBrandName: null,
    currentModelName: null,
    totalBrands: 0,
    processedBrands: 0,
    totalModels: 0,
    processedModels: 0,
    totalPrices: 0,
    processedPrices: 0,
    delayMs: 500,
    onlyMainBrands: true,
    maxModelsPerBrand: 5,
    maxYearsPerModel: 1,
    errorCount: 0,
    errorMessage: null,
    logs: [],
  })

  // Configuration options for start
  const [delayMs, setDelayMs] = useState(500)
  const [token, setToken] = useState("")
  const [syncOnlyModels, setSyncOnlyModels] = useState(false)
  const [onlyMainBrands, setOnlyMainBrands] = useState(true)
  const [maxModelsPerBrand, setMaxModelsPerBrand] = useState(5)
  const [maxYearsPerModel, setMaxYearsPerModel] = useState(1)
  const [syncCars, setSyncCars] = useState(true)
  const [syncMotorcycles, setSyncMotorcycles] = useState(false)
  const [syncTrucks, setSyncTrucks] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)

  // Polling hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const fetchStatus = async () => {
      try {
        const currentStatus = await fipeService.getStatus()
        setState(currentStatus)
      } catch (err) {
        console.error("Erro ao obter status da FIPE:", err)
      }
    }

    // Initial check
    fetchStatus()

    // Poll every 1s when active sync is running
    interval = setInterval(fetchStatus, 1000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const handleStart = async () => {
    setLoading(true)
    try {
      const types: ("cars" | "motorcycles" | "trucks")[] = []
      if (syncCars) types.push("cars")
      if (syncMotorcycles) types.push("motorcycles")
      if (syncTrucks) types.push("trucks")

      if (types.length === 0) {
        alert("Selecione ao menos um tipo de veículo para sincronizar.")
        setLoading(false)
        return
      }

      const res = await fipeService.startSync({
        vehicleTypes: types,
        delayMs,
        onlyMainBrands,
        maxModelsPerBrand,
        maxYearsPerModel,
        token: token || undefined,
        syncOnlyModels,
      })
      setState(res)
    } catch (err: any) {
      alert(err.message || "Erro ao iniciar sincronização.")
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async () => {
    try {
      await fipeService.pauseSync()
      setState(prev => ({ ...prev, isPaused: true }))
    } catch (err: any) {
      alert(err.message || "Erro ao pausar.")
    }
  }

  const handleResume = async () => {
    try {
      await fipeService.resumeSync()
      setState(prev => ({ ...prev, isPaused: false }))
    } catch (err: any) {
      alert(err.message || "Erro ao retomar.")
    }
  }

  const handleStop = async () => {
    try {
      await fipeService.stopSync()
      setState(prev => ({ ...prev, isSyncing: false, isPaused: false, currentStage: "stopped" }))
    } catch (err: any) {
      alert(err.message || "Erro ao parar.")
    }
  }

  const handleClear = async () => {
    if (!confirm("Tem certeza que deseja apagar TODOS os dados da Tabela FIPE do seu banco de dados local?")) return
    setClearing(true)
    try {
      await fipeService.clearSync()
      alert("Banco FIPE limpo com sucesso.")
      // Refresh status
      const res = await fipeService.getStatus()
      setState(res)
    } catch (err: any) {
      alert(err.message || "Erro ao limpar banco.")
    } finally {
      setClearing(false)
    }
  }

  // Calculate percentages
  const brandPct = state.totalBrands > 0 ? Math.round((state.processedBrands / state.totalBrands) * 100) : 0
  const modelPct = state.totalModels > 0 ? Math.round((state.processedModels / state.totalModels) * 100) : 0
  const pricePct = state.totalPrices > 0 ? Math.round((state.processedPrices / state.totalPrices) * 100) : 0

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Sincronização FIPE (Global Admin)
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Painel geral para carregar e atualizar a base de dados local da Tabela FIPE de forma otimizada.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={state.isSyncing || clearing}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 className="mr-1.5 size-4" />
            {clearing ? "Limpando..." : "Limpar Base FIPE"}
          </Button>
        </div>
      </div>

      {/* QUICK STATUS DISPLAY */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Status card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status Atual</span>
            <Activity className={`size-4 ${state.isSyncing ? "text-emerald-500 animate-pulse" : "text-neutral-400"}`} />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            {state.currentStage === "idle" && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                Inativo
              </span>
            )}
            {state.currentStage === "initializing" && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 animate-pulse">
                Inicializando...
              </span>
            )}
            {state.currentStage === "brands" && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                Lendo Marcas
              </span>
            )}
            {state.currentStage === "models" && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950/40 dark:text-purple-400">
                Lendo Modelos
              </span>
            )}
            {state.currentStage === "prices" && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400">
                Lendo Preços FIPE
              </span>
            )}
            {state.currentStage === "completed" && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                Concluído 🎉
              </span>
            )}
            {state.currentStage === "stopped" && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-400">
                Cancelado
              </span>
            )}
            {state.isPaused && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                Pausado
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {state.isSyncing 
              ? `Atraso: ${state.delayMs}ms por chamada` 
              : "Aguardando início do processo"}
          </p>
        </div>

        {/* Sync counters */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">Marcas Processadas</span>
          <div className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {state.processedBrands} <span className="text-xs font-normal text-neutral-400">/ {state.totalBrands}</span>
          </div>
          <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${brandPct}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">Modelos Processados</span>
          <div className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {state.processedModels} <span className="text-xs font-normal text-neutral-400">/ {state.totalModels}</span>
          </div>
          <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-300" style={{ width: `${modelPct}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">Valores Gravados (FIPE)</span>
          <div className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {state.processedPrices} <span className="text-xs font-normal text-neutral-400">/ {state.totalPrices}</span>
          </div>
          <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${pricePct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* SYNC CONFIGURATION FORM */}
        <div className="lg:col-span-1 rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40 space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <Sliders className="size-4 text-neutral-400" />
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Ajustes & Throttling</h2>
          </div>

          {/* Types selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Tipos de Veículo
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncCars}
                  onChange={(e) => setSyncCars(e.target.checked)}
                  disabled={state.isSyncing}
                  className="size-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800"
                />
                🚗 Carros (cars)
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncMotorcycles}
                  onChange={(e) => setSyncMotorcycles(e.target.checked)}
                  disabled={state.isSyncing}
                  className="size-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800"
                />
                🏍️ Motos (motorcycles)
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncTrucks}
                  onChange={(e) => setSyncTrucks(e.target.checked)}
                  disabled={state.isSyncing}
                  className="size-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800"
                />
                🚚 Caminhões (trucks)
              </label>
            </div>
          </div>

          {/* Throttle sleep delay */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Delay entre Requisições
            </label>
            <select
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              disabled={state.isSyncing}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
            >
              <option value={200}>200ms (Agressivo)</option>
              <option value={500}>500ms (Recomendado)</option>
              <option value={1000}>1000ms (Seguro)</option>
              <option value={2000}>2000ms (Ultra Seguro)</option>
            </select>
            <p className="text-[10px] text-neutral-400 leading-normal">
              Ajuste para respeitar a cota e evitar bloqueios IP da API FIPE (Parallelum).
            </p>
          </div>

          {/* Token de Assinatura Fipe.online */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Token de Inscrição FIPE (Opcional)
            </label>
            <Input
              type="text"
              placeholder="Ex: seu-token-fipe-online"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={state.isSyncing}
              className="bg-white dark:bg-neutral-950 text-sm"
            />
            <p className="text-[10px] text-neutral-400 leading-normal">
              Acesse{" "}
              <a
                href="https://fipe.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:underline font-semibold"
              >
                fipe.online
              </a>{" "}
              para obter um token gratuito e estender o limite para 1.000 requisições diárias.
            </p>
          </div>

          {/* Filtering main brands only */}
          <div className="space-y-2">
            <label className="flex items-start gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyMainBrands}
                onChange={(e) => setOnlyMainBrands(e.target.checked)}
                disabled={state.isSyncing}
                className="size-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800 mt-0.5"
              />
              <span className="flex flex-col">
                <span>Apenas principais marcas</span>
                <span className="text-[10px] font-normal text-neutral-400 mt-0.5">
                  Foca nas marcas mais vendidas no Brasil (Fiat, VW, Ford, GM, Toyota, etc.) reduzindo tempo de sync em 90%.
                </span>
              </span>
            </label>
          </div>

          {/* Sync Only Models */}
          <div className="space-y-2">
            <label className="flex items-start gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOnlyModels}
                onChange={(e) => setSyncOnlyModels(e.target.checked)}
                disabled={state.isSyncing}
                className="size-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 dark:border-neutral-800 mt-0.5"
              />
              <span className="flex flex-col">
                <span>Apenas modelos (sem anos/preços)</span>
                <span className="text-[10px] font-normal text-neutral-400 mt-0.5">
                  Não realiza requisições de preços individuais de cada modelo. Sincronização ultra-rápida sem consumo excessivo de requisições.
                </span>
              </span>
            </label>
          </div>

          {/* Limit models per brand */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Max Modelos por Marca
            </label>
            <select
              value={maxModelsPerBrand}
              onChange={(e) => setMaxModelsPerBrand(Number(e.target.value))}
              disabled={state.isSyncing}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
            >
              <option value={1}>1 Modelo (Teste ultra rápido)</option>
              <option value={5}>5 Modelos (Rápido)</option>
              <option value={10}>10 Modelos (Standard)</option>
              <option value={30}>30 Modelos (Avançado)</option>
              <option value={0}>Todos os Modelos (Completo)</option>
            </select>
          </div>

          {/* Limit years per model */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Max Anos/Preços por Modelo
            </label>
            <select
              value={maxYearsPerModel}
              onChange={(e) => setMaxYearsPerModel(Number(e.target.value))}
              disabled={state.isSyncing || syncOnlyModels}
              className={`w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 ${
                syncOnlyModels ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {syncOnlyModels ? (
                <option value={0}>Ignorado (Apenas modelos)</option>
              ) : (
                <>
                  <option value={1}>Último ano apenas (Teste rápido)</option>
                  <option value={3}>Últimos 3 anos</option>
                  <option value={5}>Últimos 5 anos</option>
                  <option value={0}>Todos os anos (Completo)</option>
                </>
              )}
            </select>
          </div>

          {/* CONTROLS */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            {!state.isSyncing ? (
              <Button onClick={handleStart} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Play className="mr-1.5 size-4" />
                {loading ? "Iniciando..." : "Iniciar Sincronização"}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {state.isPaused ? (
                  <Button onClick={handleResume} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    <Play className="mr-1.5 size-4" /> Retomar
                  </Button>
                ) : (
                  <Button onClick={handlePause} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                    <Pause className="mr-1.5 size-4" /> Pausar
                  </Button>
                )}
                <Button onClick={handleStop} variant="destructive" className="w-full font-bold">
                  <Square className="mr-1.5 size-4" /> Parar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* LOGS AND PROGRESS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active processing element */}
          {state.isSyncing && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Processando Agora</h3>
              <div className="mt-3 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-semibold text-neutral-400">Marca:</span>{" "}
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{state.currentBrandName || "Buscando..."}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-400">Modelo:</span>{" "}
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{state.currentModelName || "Aguardando..."}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800/80">
                  <RefreshCw className="size-3.5 text-neutral-400 animate-spin" />
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Tipo ativo: <strong className="text-neutral-700 dark:text-neutral-300">{state.currentVehicleType}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* LOGS CONSOLE */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-5 shadow-lg flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Logs do Sistema</span>
              </div>
              {state.errorCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-950/40 border border-red-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-red-400">
                  <AlertTriangle className="size-3" /> {state.errorCount} Erros
                </span>
              )}
            </div>

            {/* Logs entries */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs leading-relaxed select-text">
              {state.logs.length > 0 ? (
                state.logs.map((log, index) => {
                  let colorClass = "text-neutral-400"
                  if (log.includes("Erro")) colorClass = "text-red-400"
                  else if (log.includes("concluído") || log.includes("sucesso")) colorClass = "text-emerald-400"
                  else if (log.includes("Iniciando") || log.includes("Buscando")) colorClass = "text-cyan-400 font-semibold"
                  else if (log.includes("pausada") || log.includes("interrompida")) colorClass = "text-amber-400"

                  return (
                    <div key={index} className={`${colorClass} whitespace-pre-wrap hover:bg-neutral-900/50 px-1 py-0.5 rounded transition-colors`}>
                      {log}
                    </div>
                  )
                })
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-neutral-600">
                  <Database className="size-8 text-neutral-800 mb-2 animate-pulse" />
                  <span>Nenhum log gravado. Inicie a sincronização para ver os logs em tempo real.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
