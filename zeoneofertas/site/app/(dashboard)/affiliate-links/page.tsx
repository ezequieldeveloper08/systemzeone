'use client';

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldCheck,
  AlertCircle,
  Clock,
  Eye,
  Plus,
} from 'lucide-react';

interface AffiliateLinkItem {
  id: string;
  productTitle: string;
  marketplace: 'MERCADO_LIVRE' | 'SHOPEE';
  originalUrl: string;
  affiliateUrl?: string;
  trackingTag?: string;
  status: 'PENDING' | 'CONFIGURED' | 'VALIDATED' | 'ERROR';
  clickCount: number;
}

const INITIAL_LINKS: AffiliateLinkItem[] = [
  {
    id: 'link-01',
    productTitle: 'Parafusadeira Furadeira DeWalt 20V DCD7781D2',
    marketplace: 'MERCADO_LIVRE',
    originalUrl: 'https://www.mercadolivre.com.br/p/MLB-20984123',
    affiliateUrl: 'https://mercadolivre.com/sec/2oK8aX9',
    trackingTag: 'promos-tech',
    status: 'VALIDATED',
    clickCount: 142,
  },
  {
    id: 'link-02',
    productTitle: 'Furadeira e Parafusadeira Makita 12V CXT',
    marketplace: 'MERCADO_LIVRE',
    originalUrl: 'https://www.mercadolivre.com.br/p/MLB-20984124',
    status: 'PENDING',
    clickCount: 0,
  },
  {
    id: 'link-03',
    productTitle: 'Air Fryer Mondial Family 4L Inox',
    marketplace: 'SHOPEE',
    originalUrl: 'https://shopee.com.br/product/991241',
    affiliateUrl: 'https://shope.ee/8zK19aX',
    trackingTag: 'canal-vip',
    status: 'CONFIGURED',
    clickCount: 88,
  },
];

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLinkItem[]>(INITIAL_LINKS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAffiliateUrl = (id: string) => {
    if (!inputUrl) return;
    setLinks(
      links.map((item) =>
        item.id === id
          ? { ...item, affiliateUrl: inputUrl, status: 'VALIDATED' }
          : item
      )
    );
    setEditingId(null);
    setInputUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-amber-500" />
          Central de Links de Afiliados
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gerencie e valide suas URLs de afiliado do Mercado Livre e Shopee antes de gerar suas publicações.
        </p>
      </div>

      {/* Info Notice Box for Mercado Livre */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold block text-slate-900 dark:text-white">
            Como converter links do Mercado Livre corretamente:
          </span>
          <p className="leading-relaxed">
            1. Copie o link original do produto clicando em <strong>"Copiar Link Original"</strong>.<br />
            2. Abra a ferramenta oficial no <strong>Portal de Afiliados do Mercado Livre</strong> e converta a URL.<br />
            3. Cole a nova URL de afiliado no campo correspondente e clique em <strong>"Salvar e Validar"</strong>.
          </p>
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {item.marketplace === 'MERCADO_LIVRE' ? 'Mercado Livre' : 'Shopee'}
                    </span>
                    {item.status === 'VALIDATED' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Validado
                      </span>
                    )}
                    {item.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pendente de Link
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.productTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <strong>{item.clickCount}</strong> cliques
                  </span>
                </div>
              </div>

              {/* URL Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Original URL */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Link Original do Anúncio
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={item.originalUrl}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(item.originalUrl, `orig-${item.id}`)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 flex items-center gap-1 shrink-0"
                    >
                      {copiedId === `orig-${item.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                </div>

                {/* Affiliate URL */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Link de Afiliado (Convertido)
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Cole aqui a URL de Afiliado oficial..."
                        className="flex-1 px-3 py-2 bg-slate-900 border border-amber-500 rounded-xl text-white font-mono text-[11px] focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveAffiliateUrl(item.id)}
                        className="px-3 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 shrink-0"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : item.affiliateUrl ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={item.affiliateUrl}
                        className="flex-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px] truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(item.affiliateUrl!, `aff-${item.id}`)}
                        className="px-3 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 flex items-center gap-1 shrink-0 shadow-xs"
                      >
                        {copiedId === `aff-${item.id}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        Copiar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setInputUrl('');
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-500/50 text-amber-500 font-bold text-xs hover:bg-amber-500/10 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Link de Afiliado
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
