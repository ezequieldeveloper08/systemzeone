'use client';

import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  marketplace: 'MERCADO_LIVRE' | 'SHOPEE' | 'AMAZON';
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumPurchase: number;
  expiresAt: string;
  isExpiringSoon?: boolean;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
}

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: 'coup-01',
    code: 'FERRAMENTA10',
    marketplace: 'MERCADO_LIVRE',
    title: '10% OFF em Ferramentas e Furadeiras',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumPurchase: 200,
    expiresAt: '2026-07-22T23:59:59Z',
    isExpiringSoon: true,
    status: 'EXPIRING_SOON',
  },
  {
    id: 'coup-02',
    code: 'TECH100',
    marketplace: 'MERCADO_LIVRE',
    title: 'R$ 100 OFF em Smart TVs e Áudio',
    discountType: 'FIXED',
    discountValue: 100,
    minimumPurchase: 1500,
    expiresAt: '2026-07-31T23:59:59Z',
    status: 'ACTIVE',
  },
  {
    id: 'coup-03',
    code: 'AIRFRYER20',
    marketplace: 'SHOPEE',
    title: 'R$ 20 OFF em Eletroportáteis Mondial',
    discountType: 'FIXED',
    discountValue: 20,
    minimumPurchase: 150,
    expiresAt: '2026-07-28T23:59:59Z',
    status: 'ACTIVE',
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [marketplace, setMarketplace] = useState<'MERCADO_LIVRE' | 'SHOPEE'>('MERCADO_LIVRE');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minimumPurchase, setMinimumPurchase] = useState<number>(100);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;

    const newCoupon: CouponItem = {
      id: `coup-${Date.now()}`,
      code: code.toUpperCase(),
      marketplace,
      title,
      discountType,
      discountValue,
      minimumPurchase,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
    };

    setCoupons([newCoupon, ...coupons]);
    setShowAddForm(false);
    setCode('');
    setTitle('');
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const expiringCount = coupons.filter((c) => c.status === 'EXPIRING_SOON' || c.isExpiringSoon).length;

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-amber-500" />
            Central de Cupons Gerais
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cadastre cupons de desconto, importe via CSV e associe cupons às suas ofertas salvas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exportando cupons para CSV...')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" /> CSV
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Cadastrar Cupom
          </button>
        </div>
      </div>

      {/* Expiring Soon Banner Alert */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-slate-900 dark:text-white">
                Atenção: {expiringCount} cupom(ns) vence(m) em menos de 24 horas!
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                Verifique se o cupom FERRAMENTA10 ainda está valendo antes de publicar novas ofertas.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal Form */}
      {showAddForm && (
        <form onSubmit={handleAddCoupon} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cadastrar Novo Cupom</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Código do Cupom</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CUPOM10"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white uppercase font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Marketplace</label>
              <select
                value={marketplace}
                onChange={(e: any) => setMarketplace(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="MERCADO_LIVRE">Mercado Livre</option>
                <option value="SHOPEE">Shopee</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Título do Cupom</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 10% OFF em Ferramentas"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20"
            >
              Salvar Cupom
            </button>
          </div>
        </form>
      )}

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-4 ${
              item.status === 'EXPIRING_SOON'
                ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {item.marketplace === 'MERCADO_LIVRE' ? 'Mercado Livre' : 'Shopee'}
              </span>
              {item.status === 'EXPIRING_SOON' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Vence em breve
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Compra mínima: R$ {item.minimumPurchase.toFixed(2)}
              </p>
            </div>

            {/* Code Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">
                {item.code}
              </span>
              <button
                onClick={() => copyCode(item.code)}
                className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                title="Copiar Código"
              >
                {copiedCode === item.code ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
