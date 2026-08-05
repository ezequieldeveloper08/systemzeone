'use client';

import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Play,
  CheckCircle2,
  Tag,
  Search,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  keywords: string[];
  externalDomainId?: string;
  minimumDiscount: number;
  active: boolean;
  lastRunAt?: string;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-01',
    name: 'Parafusadeiras & Furadeiras',
    slug: 'parafusadeiras',
    keywords: ['parafusadeira', 'furadeira parafusadeira', 'parafusadeira de impacto'],
    externalDomainId: 'MLB-ELECTRIC_SCREWDRIVERS_AND_IMPACT_WRENCHES',
    minimumDiscount: 15,
    active: true,
    lastRunAt: 'Hoje às 10:45',
  },
  {
    id: 'cat-02',
    name: 'Smart TVs & Áudio',
    slug: 'smart-tvs',
    keywords: ['smart tv 4k', 'soundbar', 'home theater'],
    externalDomainId: 'MLB-TELEVISIONS',
    minimumDiscount: 20,
    active: true,
    lastRunAt: 'Hoje às 09:30',
  },
  {
    id: 'cat-03',
    name: 'Eletroportáteis & Air Fryer',
    slug: 'eletroportateis',
    keywords: ['air fryer', 'fritadeira sem oleo', 'cafeteira'],
    externalDomainId: 'MLB-AIR_FRYERS',
    minimumDiscount: 25,
    active: true,
    lastRunAt: 'Ontem às 18:20',
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleRunNow = (id: string) => {
    setRunningId(id);
    setTimeout(() => {
      setRunningId(null);
      alert('Busca automática executada! 8 novas ofertas encontradas e salvas na Central de Ofertas.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-amber-500" />
            Categorias Internas & Buscas Salvas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure palavras-chave, domain IDs do Mercado Livre e regras de desconto mínimo por segmento.
          </p>
        </div>

        <button
          onClick={() => alert('Nova categoria criada')}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 self-start"
        >
          <Plus className="w-4 h-4" /> Nova Categoria / Fonte
        </button>
      </div>

      {/* Categories Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                  {cat.minimumDiscount}% Desconto Mínimo
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {cat.externalDomainId || 'Sem Domain ID'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {cat.name}
                </h3>
                <span className="text-xs font-mono text-slate-400">/{cat.slug}</span>
              </div>

              {/* Keywords Tag Cloud */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Palavras-chave Monitoradas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Última execução: {cat.lastRunAt}
              </span>

              <button
                onClick={() => handleRunNow(cat.id)}
                disabled={runningId === cat.id}
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {runningId === cat.id ? 'Buscando...' : 'Executar Agora'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
