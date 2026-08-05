'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building2,
  ShoppingBag,
  Share2,
  Layers,
  Users,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [userName, setUserName] = useState('');
  const [projectName, setProjectName] = useState('Canal Ofertas VIP');
  const [marketplaces, setMarketplaces] = useState<string[]>(['MERCADO_LIVRE', 'SHOPEE']);
  const [socialNetworks, setSocialNetworks] = useState<string[]>(['WHATSAPP', 'INSTAGRAM', 'TELEGRAM']);
  const [categories, setCategories] = useState<string[]>(['Eletrônicos', 'Informática', 'Ferramentas']);
  const [workStructure, setWorkStructure] = useState<'SOLO' | 'TEAM'>('SOLO');

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);

    try {
      const response = await ApiClient.post<{ id: string; name: string; slug: string }>('/workspaces/onboarding', {
        name: projectName,
        marketplaces,
        socialNetworks,
        categories,
        workStructure,
      });

      if (response && response.id) {
        localStorage.setItem('ofertahub_workspace_id', response.id);
      }
    } catch (err) {
      console.warn('API indisponível no onboarding, utilizando workspace demonstrativo.', err);
    } finally {
      setLoading(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12">
      {/* Top Header Step Indicator */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 text-white font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-white block">Configuração Inicial</span>
            <span className="text-xs text-slate-400">Passo {step} de 5</span>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-amber-500'
                  : s < step
                  ? 'w-4 bg-emerald-500'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center Step Content */}
      <div className="max-w-xl mx-auto w-full py-8 space-y-6">
        {/* Step 1: User Name & Project Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" /> Passo 1: Identificação
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Como devemos chamar seu projeto?
              </h1>
              <p className="text-xs text-slate-400">
                Esses dados serão usados para personalizar seus relatórios e modelos de artes.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Seu Nome Completo</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Nome do Projeto ou Canal de Ofertas</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Canal Promos Tech, Ofertas VIP"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Marketplaces */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <ShoppingBag className="w-3.5 h-3.5" /> Passo 2: Marketplaces
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Quais marketplaces você utiliza?
              </h1>
              <p className="text-xs text-slate-400">
                Selecione onde costuma buscar produtos e ofertas para afiliados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'MERCADO_LIVRE', label: 'Mercado Livre', icon: '🟡', desc: 'API Nativa Catálogo' },
                { id: 'SHOPEE', label: 'Shopee', icon: '🟠', desc: 'Affiliate Open API / Adaptador' },
                { id: 'AMAZON', label: 'Amazon', icon: '📦', desc: 'Cadastro Manual' },
                { id: 'MAGALU', label: 'Magalu', icon: '🔵', desc: 'Cadastro Manual' },
              ].map((m) => {
                const selected = marketplaces.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleArrayItem(marketplaces, m.id, setMarketplaces)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-lg">{m.icon}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{m.label}</span>
                      <span className="text-[10px] text-slate-400">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Social Networks */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <Share2 className="w-3.5 h-3.5" /> Passo 3: Canais de Divulgação
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Onde você compartilha suas ofertas?
              </h1>
              <p className="text-xs text-slate-400">
                O OfertaHub criará modelos de texto e formatos de arte específicos para estes canais.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'WHATSAPP', label: 'WhatsApp (Grupos/Canais)', icon: '💬' },
                { id: 'TELEGRAM', label: 'Telegram', icon: '✈️' },
                { id: 'INSTAGRAM', label: 'Instagram (Feed & Stories)', icon: '📸' },
                { id: 'FACEBOOK', label: 'Facebook Groups', icon: '👥' },
                { id: 'X', label: 'X / Twitter', icon: '🐦' },
              ].map((sn) => {
                const selected = socialNetworks.includes(sn.id);
                return (
                  <button
                    key={sn.id}
                    type="button"
                    onClick={() => toggleArrayItem(socialNetworks, sn.id, setSocialNetworks)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{sn.icon}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <span className="text-xs font-bold text-white block">{sn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Categories */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" /> Passo 4: Categorias Prioritárias
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Quais segmentos mais interessam?
              </h1>
              <p className="text-xs text-slate-400">
                Selecione as categorias principais para personalizar seus alertas e filtros.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Eletrônicos',
                'Informática',
                'Ferramentas',
                'Casa e Cozinha',
                'Eletrodomésticos',
                'Automotivo',
                'Games',
                'Beleza',
                'Infantil',
                'Esportes',
              ].map((cat) => {
                const selected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleArrayItem(categories, cat, setCategories)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Work Structure */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" /> Passo 5: Estrutura de Trabalho
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Como é a sua operação hoje?
              </h1>
              <p className="text-xs text-slate-400">
                Você trabalha sozinho ou com uma equipe de curadores e administradores?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setWorkStructure('SOLO')}
                className={`p-6 rounded-2xl border text-left transition-all space-y-3 ${
                  workStructure === 'SOLO'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Trabalho Sozinho</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sou o único responsável por buscar produtos, converter links e disparar mensagens.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWorkStructure('TEAM')}
                className={`p-6 rounded-2xl border text-left transition-all space-y-3 ${
                  workStructure === 'TEAM'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Trabalho em Equipe</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Possuo sócios, atendentes ou moderadores que ajudam na curadoria e publicações.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-t border-slate-800 pt-6">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Criando Workspace...' : 'Concluir e Ir para o Dashboard'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
