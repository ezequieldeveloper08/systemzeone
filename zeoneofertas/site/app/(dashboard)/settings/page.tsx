'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Palette,
  ShoppingBag,
  Users,
  ShieldCheck,
  CheckCircle2,
  Save,
  Key,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'brand' | 'marketplaces' | 'members'>('profile');

  // Profile Form State
  const [name, setName] = useState('Afiliado Pro');
  const [email, setEmail] = useState('admin@ofertahub.com');

  // Workspace Form State
  const [wsName, setWsName] = useState('Canal Ofertas VIP');
  const [wsSlug, setWsSlug] = useState('ofertas-vip');

  // Brand Form State
  const [brandColor, setBrandColor] = useState('#F59E0B');

  const handleSave = () => {
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-amber-500" />
          Configurações do Workspace
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gerencie seu perfil, preferências do canal, identidade visual das artes e equipe de colaboradores.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'profile', label: 'Meu Perfil', icon: User },
          { id: 'workspace', label: 'Empresa / Canal', icon: Building2 },
          { id: 'brand', label: 'Identidade Visual', icon: Palette },
          { id: 'marketplaces', label: 'Marketplaces', icon: ShoppingBag },
          { id: 'members', label: 'Equipe & Membros', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dados do Seu Perfil</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">E-mail Cadastrado</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4" /> Salvar Perfil
            </button>
          </div>
        )}

        {/* Workspace Tab */}
        {activeTab === 'workspace' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Informações do Workspace</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Nome do Canal / Projeto</label>
                <input
                  type="text"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Slug Identificador</label>
                <input
                  type="text"
                  value={wsSlug}
                  onChange={(e) => setWsSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4" /> Atualizar Workspace
            </button>
          </div>
        )}

        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Identidade Visual do Criador de Artes</h3>
            <p className="text-xs text-slate-400">
              Escolha a cor primária de destaque que será aplicada automaticamente nas suas artes geradas em Canvas.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Cor Primária de Destaque</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{brandColor}</span>
              </div>
            </div>
          </div>
        )}

        {/* Marketplaces Tab */}
        {activeTab === 'marketplaces' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Marketplaces Conectados</h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 flex items-center justify-center font-bold text-xs">
                    ML
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mercado Livre API</h4>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Conexão Ativa
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">MLB Catálogo OK</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                    SHP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Shopee Affiliate Open API</h4>
                    <span className="text-[10px] text-amber-500 font-semibold">Adaptador Manual Ativo</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs">Configurar</button>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Membros da Equipe</h3>
              <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs">
                Convidar Membro
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                    AP
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Afiliado Pro</span>
                    <span className="text-[10px] text-slate-400">admin@ofertahub.com</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px]">OWNER</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
