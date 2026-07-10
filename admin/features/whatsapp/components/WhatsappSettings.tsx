"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { whatsappService } from "../services/whatsappService"
import { WhatsappConfig } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Key,
  Smartphone,
  Server,
  RefreshCw,
  Eye,
  EyeOff,
  Brain
} from "lucide-react"

export function WhatsappSettings() {
  const { activeTenant } = useAuth()
  const [config, setConfig] = useState<WhatsappConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showAiKey, setShowAiKey] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)

  const loadConfig = async () => {
    if (activeTenant) {
      try {
        const data = await whatsappService.getConfig()
        setConfig(data)
      } catch (err) {
        console.error("Erro ao obter configurações:", err)
      }
    }
  }

  useEffect(() => {
    loadConfig()
  }, [activeTenant])

  if (!config) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await whatsappService.saveConfig(config)
      alert("Configurações salvas com sucesso!")
      await loadConfig()
    } catch (err: any) {
      alert(err.message || "Erro ao salvar configurações.")
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      // Simulate real ping checks against backend status updates
      await whatsappService.saveConfig(config)
      const latest = await whatsappService.getConfig()
      setConfig(latest)
      setTestResult(latest.status === "connected" ? "success" : "error")
    } catch {
      setTestResult("error")
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string, type: "url" | "token") => {
    navigator.clipboard.writeText(text)
    if (type === "url") {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } else {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Integração WhatsApp API
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Configure as credenciais oficiais do WhatsApp Business Platform (Meta Cloud API) para sua concessionária.
        </p>
      </div>

      {/* CONNECTION STATUS */}
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border p-5 ${
        config.status === "connected"
          ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/10"
          : "border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/10"
      }`}>
        <div className="flex items-start gap-3.5">
          {config.status === "connected" ? (
            <CheckCircle className="size-6.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-6.5 text-amber-500 shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-neutral-200">
              {config.status === "connected" ? "Integração WhatsApp Ativa" : "Integração Desconectada"}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {config.status === "connected"
                ? `Conexão autenticada e webhooks prontos. Última verificação: ${new Date(config.lastVerifiedAt || "").toLocaleString("pt-BR")}`
                : "Insira suas credenciais da Meta para ativar o disparo automático de mensagens."}
            </p>
          </div>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing}
            className="h-9 font-semibold text-xs gap-1.5 dark:bg-neutral-900"
          >
            {testing ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            Testar Conectividade
          </Button>
        </div>
      </div>

      {testResult === "success" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>Conexão bem-sucedida! Retornou código 200 OK da Meta Graph API.</span>
        </div>
      )}

      {testResult === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>Falha na conectividade. Certifique-se de configurar credenciais oficiais válidas (não de testes simuladas) para passar no ping da Meta Graph API.</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* CREDENTIALS FORM */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Key className="size-4.5 text-neutral-400" />
              Credenciais da Meta API
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="size-3 text-neutral-500" />
                  ID do Telefone (Phone Number ID)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 109283746582910"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  ID da Conta WhatsApp Business
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 928374615243546"
                  value={config.businessAccountId}
                  onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Token de Acesso Permanente (Meta System User Token)
              </label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="EAAGb..."
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-normal">
                Gere este token no painel de desenvolvedores do Facebook com as permissões <code>whatsapp_business_messaging</code> e <code>whatsapp_business_management</code>.
              </p>
            </div>
            
            {/* AGENTE DE INTELIGÊNCIA ARTIFICIAL CARD */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-5">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Brain className="size-4.5 text-neutral-400" />
                Agente de Inteligência Artificial (Gemini)
              </h2>

              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-305">
                    Respostas Automáticas
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Permitir que o agente de IA responda aos clientes quando receber novas mensagens.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.aiEnabled}
                    onChange={(e) => setConfig({ ...config, aiEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-850 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-700 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {config.aiEnabled && (
                <div className="space-y-5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Modelo de IA (Gemini)
                      </label>
                      <select
                        value={config.aiModel || "gemini-2.0-flash"}
                        onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      >
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recomendado)</option>
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                        <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                        <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Chave API do Gemini</span>
                        <a
                          href="https://aistudio.google.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-650 hover:underline capitalize"
                        >
                          Obter chave API
                        </a>
                      </label>
                      <div className="relative">
                        <Input
                          type={showAiKey ? "text" : "password"}
                          placeholder="Chave API do Google AI Studio"
                          value={config.aiApiKey || ""}
                          onChange={(e) => setConfig({ ...config, aiApiKey: e.target.value })}
                          required={config.aiEnabled}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAiKey(!showAiKey)}
                          className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {showAiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Instruções do Agente (System Prompt)
                    </label>
                    <textarea
                      placeholder="Ex: Você é o vendedor virtual da concessionária Capri Veículos. Seu objetivo é ajudar o cliente..."
                      value={config.aiAgentInstructions || ""}
                      onChange={(e) => setConfig({ ...config, aiAgentInstructions: e.target.value })}
                      required={config.aiEnabled}
                      rows={4}
                      className="w-full p-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                      Defina a personalidade da IA, informações da concessionária e instruções de como ela deve responder.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button type="submit" disabled={loading} className="font-semibold text-sm">
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </div>

        {/* WEBHOOK INFO BOX */}
        <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <Server className="size-4.5 text-neutral-400" />
            Configuração Webhook
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Configure o webhook no painel da Meta para receber atualizações de mensagens em tempo real (Enviado, Entregue, Lido).
          </p>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                URL de Callback
              </label>
              <div className="flex gap-1.5">
                <Input
                  type="text"
                  readOnly
                  value={config.webhookUrl}
                  className="h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(config.webhookUrl, "url")}
                  className="h-8 px-2"
                >
                  {copiedUrl ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Token de Verificação
              </label>
              <div className="flex gap-1.5">
                <Input
                  type="text"
                  readOnly
                  value={config.webhookVerificationToken}
                  className="h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(config.webhookVerificationToken, "token")}
                  className="h-8 px-2"
                >
                  {copiedToken ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
