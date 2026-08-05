'use client';

import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Share2,
  Copy,
  CheckCircle2,
  Calendar,
  Eye,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface PublicationItem {
  id: string;
  offerTitle: string;
  network: 'WHATSAPP' | 'TELEGRAM' | 'INSTAGRAM' | 'FACEBOOK';
  content: string;
  affiliateUrl: string;
  status: 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'ERROR';
  publishedAt: string;
  clickCount: number;
}

const INITIAL_PUBLICATIONS: PublicationItem[] = [
  {
    id: 'pub-01',
    offerTitle: 'Parafusadeira Furadeira DeWalt 20V DCD7781D2',
    network: 'WHATSAPP',
    content:
      '🔥 OFERTA IMPERDÍVEL! PREÇO BAIXOU!\n\nParafusadeira DeWalt 20V DCD7781D2\nDe: R$ 799,00\nPor: R$ 549,90 (31% OFF)\n\n🎟️ Cupom: FERRAMENTA10\n📦 Frete Grátis\n\n👉 Compre aqui: https://mercadolivre.com/sec/2oK8aX9',
    affiliateUrl: 'https://mercadolivre.com/sec/2oK8aX9',
    status: 'PUBLISHED',
    publishedAt: '2026-07-21 10:30',
    clickCount: 142,
  },
  {
    id: 'pub-02',
    offerTitle: 'Air Fryer Mondial Family 4L Inox',
    network: 'TELEGRAM',
    content:
      '😍 Olha esse achado incrível!\n\nAir Fryer Mondial 4L Inox por apenas R$ 249,90\n\n🎟️ Cupom: AIRFRYER20\n👉 Link: https://shope.ee/8zK19aX',
    affiliateUrl: 'https://shope.ee/8zK19aX',
    status: 'PUBLISHED',
    publishedAt: '2026-07-21 09:15',
    clickCount: 88,
  },
  {
    id: 'pub-03',
    offerTitle: 'Smart TV 55" 4K Samsung 55CU7700',
    network: 'INSTAGRAM',
    content:
      'Smart TV 55 UHD 4K Samsung com R$ 1.100 de Desconto!\nPor apenas R$ 2.199,00 com Frete Grátis!\nLink na Bio ou solicite via Direct.',
    affiliateUrl: 'https://mercadolivre.com/sec/2oK8aX9',
    status: 'SCHEDULED',
    publishedAt: '2026-07-21 16:00',
    clickCount: 0,
  },
];

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationItem[]>(INITIAL_PUBLICATIONS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openWhatsApp = (content: string) => {
    const encoded = encodeURIComponent(content);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const openTelegram = (link: string, text: string) => {
    const encodedText = encodeURIComponent(text);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodedText}`, '_blank');
  };

  const toggleStatus = (id: string) => {
    setPublications(
      publications.map((p) =>
        p.id === id ? { ...p, status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-amber-500" />
            Histórico de Publicações
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o status dos disparos em grupos, atalhos para WhatsApp/Telegram e estatísticas de cliques.
          </p>
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  {pub.network === 'WHATSAPP' && '💬 WhatsApp'}
                  {pub.network === 'TELEGRAM' && '✈️ Telegram'}
                  {pub.network === 'INSTAGRAM' && '📸 Instagram'}
                  {pub.network === 'FACEBOOK' && '👥 Facebook'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {pub.offerTitle}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Disparado em: {pub.publishedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <strong>{pub.clickCount}</strong> cliques
                </span>

                <button
                  onClick={() => toggleStatus(pub.id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    pub.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {pub.status === 'PUBLISHED' ? 'Publicada' : 'Agendada / Rascunho'}
                </button>
              </div>
            </div>

            {/* Content Preview Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {pub.content}
              </pre>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {pub.network === 'WHATSAPP' && (
                <button
                  onClick={() => openWhatsApp(pub.content)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar no WhatsApp (wa.me)
                </button>
              )}

              {pub.network === 'TELEGRAM' && (
                <button
                  onClick={() => openTelegram(pub.affiliateUrl, pub.content)}
                  className="py-2 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar no Telegram
                </button>
              )}

              <button
                onClick={() => copyToClipboard(pub.content, pub.id)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                {copiedId === pub.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar Legenda
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
