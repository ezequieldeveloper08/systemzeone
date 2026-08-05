'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Kanban as KanbanIcon,
  List,
  Grid,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Link as LinkIcon,
  Send,
  Download,
  Filter,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export interface SavedOfferItem {
  id: string;
  title: string;
  marketplace: 'MERCADO_LIVRE' | 'SHOPEE';
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  score: number;
  status:
    | 'FOUND'
    | 'IN_ANALYSIS'
    | 'APPROVED'
    | 'WAITING_AFFILIATE_LINK'
    | 'READY_TO_SHARE'
    | 'PUBLISHED'
    | 'EXPIRED'
    | 'IGNORED';
  hasAffiliateLink: boolean;
  couponCode?: string;
}

const INITIAL_OFFERS: SavedOfferItem[] = [
  {
    id: 'off-01',
    title: 'Parafusadeira Furadeira DeWalt 20V DCD7781D2',
    marketplace: 'MERCADO_LIVRE',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80',
    price: 549.9,
    originalPrice: 799.0,
    discountPercentage: 31,
    score: 88,
    status: 'READY_TO_SHARE',
    hasAffiliateLink: true,
    couponCode: 'FERRAMENTA10',
  },
  {
    id: 'off-02',
    title: 'Furadeira e Parafusadeira Makita 12V CXT',
    marketplace: 'MERCADO_LIVRE',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&auto=format&fit=crop&q=80',
    price: 349.9,
    originalPrice: 499.0,
    discountPercentage: 29,
    score: 75,
    status: 'FOUND',
    hasAffiliateLink: false,
  },
];

const SWIMLANES = [
  { id: 'FOUND', title: 'Encontrada', color: 'border-blue-500/40 text-blue-500' },
  { id: 'IN_ANALYSIS', title: 'Em análise', color: 'border-yellow-500/40 text-yellow-500' },
  { id: 'APPROVED', title: 'Aprovada', color: 'border-emerald-500/40 text-emerald-500' },
  { id: 'WAITING_AFFILIATE_LINK', title: 'Aguardando Link', color: 'border-amber-500/40 text-amber-500' },
  { id: 'READY_TO_SHARE', title: 'Pronta p/ Divulgar', color: 'border-purple-500/40 text-purple-500' },
  { id: 'PUBLISHED', title: 'Publicada', color: 'border-teal-500/40 text-teal-500' },
  { id: 'EXPIRED', title: 'Expirada', color: 'border-slate-500/40 text-slate-400' },
  { id: 'IGNORED', title: 'Ignorada', color: 'border-red-500/40 text-red-500' },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<SavedOfferItem[]>(INITIAL_OFFERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  useEffect(() => {
    async function loadOffersFromApi() {
      try {
        const apiData = await ApiClient.get<any[]>('/offers');
        if (apiData && apiData.length > 0) {
          const mapped: SavedOfferItem[] = apiData.map((item) => {
            const offer = item.marketplaceOffer;
            const product = offer?.catalogProduct;
            return {
              id: item.id,
              title: product?.title || 'Oferta Salva do Mercado Livre',
              marketplace: offer?.marketplace || 'MERCADO_LIVRE',
              imageUrl: product?.imageUrl || 'https://http2.mlstatic.com/D_NQ_NP_657060-MLA104761778541_012026-F.jpg',
              price: Number(offer?.price || 0),
              originalPrice: offer?.originalPrice ? Number(offer.originalPrice) : undefined,
              discountPercentage: Math.round(Number(offer?.discountPercentage || 0)),
              score: item.score || 80,
              status: item.status || 'FOUND',
              hasAffiliateLink: false,
            };
          });

          setOffers((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newOnly = mapped.filter((m) => !existingIds.has(m.id));
            return [...newOnly, ...prev];
          });
        }
      } catch (err) {
        console.error('Erro ao carregar ofertas da API:', err);
      }
    }

    loadOffersFromApi();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkAction = (newStatus: SavedOfferItem['status']) => {
    setOffers(offers.map((off) => (selectedIds.includes(off.id) ? { ...off, status: newStatus } : off)));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Central de Ofertas (Deals Funnel)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie o funil de ofertas encontradas nas buscas em tempo real no MySQL.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" /> Kanban (8 Etapas)
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Tabela Completa
          </button>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 p-4 rounded-2xl bg-amber-500 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <span className="text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {selectedIds.length} oferta(s) selecionada(s)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('APPROVED')}
              className="px-3 py-1.5 rounded-xl bg-white text-amber-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Aprovar Oferta(s)
            </button>
            <button
              onClick={() => handleBulkAction('EXPIRED')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
            >
              Marcar como Expirada
            </button>
            <button
              onClick={() => handleBulkAction('IGNORED')}
              className="px-3 py-1.5 rounded-xl bg-red-700 text-white font-bold text-xs hover:bg-red-800 transition-colors"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 overflow-x-auto pb-4">
          {SWIMLANES.map((lane) => {
            const laneOffers = offers.filter((o) => o.status === lane.id);
            return (
              <div
                key={lane.id}
                className="flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3 min-w-[200px] h-[650px]"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${lane.color}`}>
                    {lane.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {laneOffers.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {laneOffers.map((off) => (
                    <div
                      key={off.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 hover:border-amber-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(off.id)}
                          onChange={() => toggleSelect(off.id)}
                          className="mt-1 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            off.score >= 80
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : off.score >= 60
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          Score: {off.score}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img src={off.imageUrl} alt={off.title} className="w-10 h-10 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 p-1" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {off.title}
                        </h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          R$ {Number(off.price || 0).toFixed(2)}
                        </span>
                        {off.discountPercentage > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            {off.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
