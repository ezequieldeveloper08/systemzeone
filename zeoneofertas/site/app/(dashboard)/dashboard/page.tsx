'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  Tag,
  Ticket,
  Send,
  Link as LinkIcon,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            OfertaHub SaaS
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bem-vindo ao seu Hub de Ofertas
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Acompanhe suas ofertas encontradas hoje, converta links de afiliados no Mercado Livre e Shopee, e crie publicações para WhatsApp e Instagram em segundos.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-lg shadow-amber-500/25"
            >
              <Search className="w-4 h-4" />
              Buscar Produtos
            </Link>
            <Link
              href="/coupons"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              Adicionar Cupom
            </Link>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <Send className="w-4 h-4 text-amber-400" />
              Criar Publicação
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Produtos Hoje</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">128</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +14%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Capturados nas buscas ativas</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Ofertas Salvas</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">42</span>
            <span className="text-xs font-medium text-slate-400">no funil</span>
          </div>
          <p className="text-[11px] text-slate-400">24 Prontas para divulgar</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Aguardando Afiliado</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <LinkIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</span>
            <span className="text-xs font-semibold text-amber-500">Pendente</span>
          </div>
          <p className="text-[11px] text-slate-400">Requer conversão no portal</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Cliques Registrados</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">1,840</span>
            <span className="text-xs font-bold text-emerald-600">+28%</span>
          </div>
          <p className="text-[11px] text-slate-400">Total acumulado da semana</p>
        </div>
      </div>

      {/* Grid: Pending Actions & Quick Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Ações Pendentes
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              5 itens requerem atenção
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    7 Ofertas do Mercado Livre sem link de afiliado
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cole a URL convertida para disponibilizar no gerador de textos.
                  </p>
                </div>
              </div>
              <Link
                href="/affiliate-links"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Resolver <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    2 Cupons expirando nas próximas 12 horas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cupom "FERRAMENTAS10" e "TECH100".
                  </p>
                </div>
              </div>
              <Link
                href="/coupons"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Ver Cupons <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    12 Ofertas prontas ainda não divulgadas hoje
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Air Fryer, Smart TV e Kit DeWalt prontos para disparo.
                  </p>
                </div>
              </div>
              <Link
                href="/offers"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Divulgar <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Connected Marketplaces Status */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Marketplaces
            </h2>
            <Link href="/settings" className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Gerenciar
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 flex items-center justify-center font-bold text-xs">
                  ML
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Mercado Livre</h3>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> API Conectada
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">Ativo</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                  SHP
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Shopee Affiliate</h3>
                  <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Adaptador Ativo
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600">Manual/OpenAPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
