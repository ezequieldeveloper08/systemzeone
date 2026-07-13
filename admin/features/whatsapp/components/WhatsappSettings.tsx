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

  useEffect(() => {
    // Inicializa o SDK da Meta para o Embedded Signup
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
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
        (window as any).FB.init({
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
    (window as any).FB.login((response: any) => {
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
              Conexão da Conta Meta (WABA)
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
                    Token de Acesso (Gerenciado pela Zeone)
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

                      <div className="space-y-3 pt-3 border-t border-neutral-105 dark:border-neutral-800 animate-in fade-in duration-200">
                        <div>
                          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Ferramentas e Ações da IA
                          </label>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                            Ative as funções que o assistente virtual poderá executar autonomamente durante as conversas baseando-se no segmento do seu negócio ({(activeTenant?.businessType || 'veiculos') === 'veiculos' ? 'Concessionária' : (activeTenant?.businessType || 'veiculos') === 'imoveis' ? 'Imobiliária' : (activeTenant?.businessType || 'veiculos') === 'menu' ? 'Restaurante' : 'Geral'}).
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
                                  <p className="text-[10px] text-neutral-550 dark:text-neutral-400 leading-tight">
                                    {tool.desc}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Button type="submit" disabled={loading} className="font-semibold text-sm">
                    {loading ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Conecte o seu número de WhatsApp ao CRM da Zeone em poucos cliques usando o painel oficial de login seguro da Meta. Não é necessário criar contas no portal de desenvolvedores.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={launchEmbeddedSignup}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-10 px-5 flex items-center gap-2"
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
                    className="border-neutral-200 text-neutral-700 dark:text-neutral-300 font-semibold text-sm h-10 px-5"
                  >
                    Simular Conexão (Desenvolvedor)
                  </Button>
                </div>
              </div>
            )}
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
