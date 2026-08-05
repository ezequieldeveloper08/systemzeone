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
  Brain,
  MessageSquare
} from "lucide-react"

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.465L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.116-2.905-6.993C16.255 1.87 13.78 1.078 11.139 1.077c-5.441 0-9.865 4.42-9.869 9.863-.001 1.77.462 3.498 1.341 5.022L1.6 22.4l6.637-1.74zM16.924 13.91c-.296-.148-1.748-.863-2.019-.962-.27-.099-.467-.148-.663.148-.197.296-.764.962-.937 1.16-.172.196-.344.221-.64.073-.296-.148-1.25-.46-2.38-1.467-.88-.785-1.474-1.754-1.647-2.05-.172-.296-.018-.456.13-.603.133-.133.296-.346.444-.519.148-.173.197-.296.296-.494.099-.197.049-.37-.025-.519-.074-.148-.663-1.6-.908-2.186-.239-.575-.483-.497-.663-.506-.17-.008-.367-.01-.564-.01-.197 0-.518.074-.789.37-.27.296-1.033 1.012-1.033 2.467 0 1.456 1.059 2.861 1.206 3.059.148.197 2.083 3.18 5.046 4.46.705.305 1.256.487 1.684.624.708.226 1.353.194 1.862.118.568-.084 1.748-.715 1.995-1.4.246-.688.246-1.281.172-1.4-.074-.118-.27-.197-.566-.346z"/>
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

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
  const [connectionMode, setConnectionMode] = useState<"simplified" | "manual">("simplified")
  const [activeTab, setActiveTab] = useState<"whatsapp" | "social" | "ai" | "webhook">("whatsapp")

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

  useEffect(() => {
    // Inicializa o SDK da Meta para o Embedded Signup
    ;(window as any).fbAsyncInit = function() {
      ;(window as any).FB.init({
        appId      : process.env.NEXT_PUBLIC_META_APP_ID || '1234567890',
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
    };

    // Carrega o SDK de forma assíncrona se ainda não carregado
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = "https://connect.facebook.net/pt_BR/sdk.js";
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    } else {
      // Se o script já foi carregado anteriormente, reinicializa o FB se disponível
      if ((window as any).FB) {
        ;(window as any).FB.init({
          appId      : process.env.NEXT_PUBLIC_META_APP_ID || '1234567890',
          cookie     : true,
          xfbml      : true,
          version    : 'v19.0'
        });
      }
    }
  }, []);

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

  const handleConnectEmbeddedSignup = async (code: string) => {
    setLoading(true);
    try {
      const updatedConfig = await whatsappService.connectEmbeddedSignup(code);
      setConfig(updatedConfig);
      alert("Conta do WhatsApp conectada com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao conectar conta.");
    } finally {
      setLoading(false);
    }
  };

  const launchEmbeddedSignup = () => {
    if (!(window as any).FB) {
      alert("O SDK do Facebook ainda não foi carregado. Por favor, aguarde alguns instantes e tente novamente.");
      return;
    }
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || 'mock_config_id';
    ;(window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        handleConnectEmbeddedSignup(code);
      } else {
        alert("O fluxo de conexão foi cancelado.");
      }
    }, {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true
    });
  };

  const handleSimulatedConnect = () => {
    handleConnectEmbeddedSignup('mock_code');
  };

  const handleDisconnect = async () => {
    if (!confirm("Deseja realmente desconectar esta conta de WhatsApp? A IA e os envios serão interrompidos.")) return;
    setLoading(true);
    try {
      const resetConfig: WhatsappConfig = {
        ...config,
        accessToken: "",
        phoneNumberId: "",
        businessAccountId: "",
        status: "disconnected"
      };
      await whatsappService.saveConfig(resetConfig);
      setConfig(resetConfig);
      alert("WhatsApp desconectado com sucesso.");
    } catch (err: any) {
      alert(err.message || "Erro ao desconectar.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTool = (toolName: string) => {
    if (!config) return
    const activeTools = config.aiActiveTools || []
    let updatedTools: string[]
    if (activeTools.includes(toolName)) {
      updatedTools = activeTools.filter(t => t !== toolName)
    } else {
      updatedTools = [...activeTools, toolName]
    }
    setConfig({ ...config, aiActiveTools: updatedTools })
  }

  const getAvailableTools = () => {
    const businessType = activeTenant?.businessType || "veiculos"
    const list = [
      { id: "agendarCompromisso", label: "Agendamento de Compromissos", desc: "Permite à IA agendar visitas, test-drives ou reuniões no calendário/CRM." },
      { id: "atualizarDadosLead", label: "Atualizar Dados do Lead", desc: "Permite à IA coletar e salvar e-mail e notas adicionais no contato do CRM." }
    ]
    
    if (businessType === "veiculos") {
      list.push(
        { id: "buscarVeiculosEstoque", label: "Buscar Veículos no Estoque", desc: "Permite à IA pesquisar veículos por marca, modelo, ano ou preço." },
        { id: "consultarTabelaFipe", label: "Consultar Tabela FIPE", desc: "Permite à IA buscar preços estimados de veículos na Tabela FIPE." }
      )
    } else if (businessType === "imoveis") {
      list.push(
        { id: "buscarImoveisCatalogo", label: "Buscar Imóveis no Catálogo", desc: "Permite à IA pesquisar casas e apartamentos disponíveis por tipo, preço ou finalidade." }
      )
    } else if (businessType === "menu") {
      list.push(
        { id: "consultarCardapio", label: "Consultar Cardápio", desc: "Permite à IA pesquisar itens de comida e bebida disponíveis no cardápio." },
        { id: "criarPedido", label: "Registrar Pré-pedidos", desc: "Permite à IA registrar pré-pedidos direto no painel para delivery, mesa ou retirada." }
      )
    }
    
    return list
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Configuração de Canais & Integrações
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Gerencie as conexões oficiais de WhatsApp, Instagram, Facebook Messenger, agente de IA e webhooks.
        </p>
      </div>

      {/* HORIZONTAL TAB MENU */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "whatsapp"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-350"
          }`}
        >
          <WhatsappIcon className="size-3.5" />
          WhatsApp API
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "social"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-350"
          }`}
        >
          <InstagramIcon className="size-3.5 text-pink-500" />
          Facebook & Instagram
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "ai"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-350"
          }`}
        >
          <Brain className="size-3.5 text-violet-500" />
          Agente de IA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("webhook")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "webhook"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-350"
          }`}
        >
          <Server className="size-3.5" />
          Webhook
        </button>
      </div>

      <div className="grid gap-6">
        {/* WHATSAPP TAB */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6">
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
                      : "Insira as credenciais do WhatsApp Cloud API para ativar o disparo."}
                  </p>
                </div>
              </div>
              {config.status === "connected" && (
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
              )}
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
                <span>Falha na conectividade. Verifique se suas credenciais da API estão corretas.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Key className="size-4.5 text-neutral-400" />
                Credenciais do WhatsApp API (WABA)
              </h2>

              {config.status === "connected" ? (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Smartphone className="size-3 text-neutral-500" />
                        ID do Telefone (Phone Number ID)
                      </label>
                      <Input
                        type="text"
                        value={config.phoneNumberId}
                        readOnly
                        className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-600 dark:text-neutral-400 cursor-not-allowed text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        ID da Conta WhatsApp Business (WABA ID)
                      </label>
                      <Input
                        type="text"
                        value={config.businessAccountId}
                        readOnly
                        className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-600 dark:text-neutral-400 cursor-not-allowed text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Token de Acesso permanente
                    </label>
                    <Input
                      type="password"
                      value="••••••••••••••••••••••••••••••••••••••••"
                      readOnly
                      className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-600 dark:text-neutral-400 cursor-not-allowed text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="font-semibold text-xs h-9"
                    >
                      Desconectar WhatsApp
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setConnectionMode("simplified")}
                      className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                        connectionMode === "simplified"
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "border-transparent text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      Conexão Simplificada
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectionMode("manual")}
                      className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                        connectionMode === "manual"
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "border-transparent text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      Configuração Manual
                    </button>
                  </div>

                  {connectionMode === "simplified" ? (
                    <div className="space-y-5 py-2 animate-in fade-in duration-200">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Conecte o seu número de WhatsApp ao CRM da Zeone em poucos cliques usando o painel oficial de login seguro da Meta. Não é necessário configurar o portal de desenvolvedores.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          type="button"
                          onClick={launchEmbeddedSignup}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-10 px-5 flex items-center gap-2 cursor-pointer"
                        >
                          <svg className="size-4 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Conectar WhatsApp via Meta
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSimulatedConnect}
                          disabled={loading}
                          className="border-neutral-200 text-neutral-700 dark:text-neutral-300 font-semibold text-sm h-10 px-5 cursor-pointer"
                        >
                          Simular Conexão (Desenvolvedor)
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Insira as credenciais do seu próprio aplicativo da Meta Developers para conectar manualmente.
                      </p>

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
                            ID da Conta WhatsApp Business (WABA ID)
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
                          Token de Acesso Permanente
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
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                          >
                            {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <Button type="submit" disabled={loading} className="font-semibold text-sm cursor-pointer">
                          {loading ? "Salvando..." : "Salvar Configurações"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

        {/* FACEBOOK & INSTAGRAM TAB */}
        {activeTab === "social" && (
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 max-w-4xl">
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <FacebookIcon className="size-4.5 text-blue-600" />
                Integração Facebook Messenger & Instagram Direct
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Integre as conversas das suas páginas oficiais do Facebook e contas comerciais do Instagram Direct no mesmo painel de chat.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <FacebookIcon className="size-3 text-neutral-500" />
                  ID da Página do Facebook
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 1029384756"
                  value={config.facebookPageId || ""}
                  onChange={(e) => setConfig({ ...config, facebookPageId: e.target.value })}
                  className="text-xs"
                />
                <p className="text-[10px] text-neutral-450">ID numérico da página do Facebook a ser monitorada.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <InstagramIcon className="size-3 text-pink-500" />
                  ID da Conta Instagram Business
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 9876543210"
                  value={config.instagramBusinessAccountId || ""}
                  onChange={(e) => setConfig({ ...config, instagramBusinessAccountId: e.target.value })}
                  className="text-xs"
                />
                <p className="text-[10px] text-neutral-450">ID da conta do Instagram conectada à sua página.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <Key className="size-3 text-neutral-500" />
                Token de Acesso da Página (Page Access Token)
              </label>
              <Input
                type="password"
                placeholder="Insira o Page Access Token gerado no Meta Developers"
                value={config.facebookPageAccessToken || ""}
                onChange={(e) => setConfig({ ...config, facebookPageAccessToken: e.target.value })}
                className="text-xs"
              />
              <p className="text-[10px] text-neutral-450 leading-relaxed">
                Token permanente da página com escopos `pages_messaging` e `instagram_manage_messages` para disparar respostas automáticas e manuais.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button type="submit" disabled={loading} className="font-semibold text-sm cursor-pointer">
                {loading ? "Salvando..." : "Salvar Configurações Sociais"}
              </Button>
            </div>
          </form>
        )}

        {/* AI AGENT TAB */}
        {activeTab === "ai" && (
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 max-w-4xl">
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Brain className="size-4.5 text-violet-500" />
                Agente de Inteligência Artificial (Gemini)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Configure o assistente virtual baseado em IA generativa do Google Gemini para interagir e qualificar leads autonomamente.
              </p>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Habilitar Respostas Automáticas
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  A IA assumirá o atendimento respondendo às mensagens de entrada de forma imediata.
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

            {config.aiEnabled ? (
              <div className="space-y-5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Modelo do Gemini
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
                        className="text-[10px] text-emerald-650 hover:underline"
                      >
                        Criar Chave API
                      </a>
                    </label>
                    <div className="relative">
                      <Input
                        type={showAiKey ? "text" : "password"}
                        placeholder="Chave API do Google AI Studio"
                        value={config.aiApiKey || ""}
                        onChange={(e) => setConfig({ ...config, aiApiKey: e.target.value })}
                        required={config.aiEnabled}
                        className="pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAiKey(!showAiKey)}
                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                      >
                        {showAiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Instruções de Personalidade (System Prompt)
                  </label>
                  <textarea
                    placeholder="Ex: Você é o vendedor virtual da nossa concessionária principal. Seu objetivo é coletar o contato e sanar dúvidas de estoque..."
                    value={config.aiAgentInstructions || ""}
                    onChange={(e) => setConfig({ ...config, aiAgentInstructions: e.target.value })}
                    required={config.aiEnabled}
                    rows={5}
                    className="w-full p-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed"
                  />
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal">
                    Fale sobre tom de voz, regras de atendimento, opções de financiamento e comportamento esperado do robô.
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Ações e Ferramentas Disponíveis
                    </label>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                      Habilite integrações de banco de dados para a IA consultar estoques e agendar horários em tempo real.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 mt-2">
                    {getAvailableTools().map((tool) => {
                      const isChecked = config.aiActiveTools?.includes(tool.id) || false
                      return (
                        <div
                          key={tool.id}
                          onClick={() => handleToggleTool(tool.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none ${
                            isChecked
                              ? "bg-emerald-50/50 border-emerald-500/30 dark:bg-emerald-950/10 dark:border-emerald-500/25"
                              : "bg-neutral-50/50 border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="mt-1 size-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 shrink-0 accent-emerald-500 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-none">
                              {tool.label}
                            </span>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                              {tool.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Button type="submit" disabled={loading} className="font-semibold text-sm cursor-pointer">
                    {loading ? "Salvando..." : "Salvar Configurações de IA"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 dark:bg-neutral-950/20 dark:border-neutral-800 text-center text-xs text-neutral-500">
                Ligue a chave acima para configurar as diretrizes da inteligência artificial.
              </div>
            )}
          </form>
        )}

        {/* WEBHOOK TAB */}
        {activeTab === "webhook" && (
          <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 max-w-4xl">
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Server className="size-4.5 text-neutral-400" />
                Webhook e Recebimento de Mensagens
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Utilize estes links no portal Meta Developers para permitir que a API de WhatsApp, Facebook ou Instagram envie novas mensagens recebidas para a plataforma.
              </p>
            </div>

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
                    className="text-xs bg-neutral-50 dark:bg-neutral-800/50 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(config.webhookUrl, "url")}
                    className="px-3 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-neutral-400">Configure no campo `URL de Retorno` da sua assinatura de Webhooks no Meta Developers.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Token de Verificação (Verify Token)
                </label>
                <div className="flex gap-1.5">
                  <Input
                    type="text"
                    readOnly
                    value={config.webhookVerificationToken}
                    className="text-xs bg-neutral-50 dark:bg-neutral-800/50 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(config.webhookVerificationToken, "token")}
                    className="px-3 cursor-pointer"
                  >
                    {copiedToken ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-neutral-400">Insira no campo `Token de Verificação` na Meta para autenticar o canal.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
