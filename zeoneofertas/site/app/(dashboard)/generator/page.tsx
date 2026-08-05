'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Copy,
  CheckCircle2,
  Send,
  Sparkles,
  Flame,
  Smile,
  Briefcase,
  Zap,
  Wand2,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface SelectedProduct {
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  coupon?: string;
  shipping?: string;
  affiliateLink: string;
}

function GeneratorContent() {
  const searchParams = useSearchParams();

  const queryName = searchParams.get('name');
  const queryPrice = searchParams.get('price');
  const queryOriginalPrice = searchParams.get('originalPrice');
  const queryDiscount = searchParams.get('discount');
  const queryLink = searchParams.get('link');
  const queryCoupon = searchParams.get('coupon');

  const [product, setProduct] = useState<SelectedProduct>({
    name: queryName || 'Parafusadeira Furadeira de Impacto DeWalt 20V DCD7781D2 com 2 Baterias e Maleta',
    price: queryPrice || 'R$ 549,90',
    originalPrice: queryOriginalPrice || 'R$ 799,00',
    discount: queryDiscount || '31% OFF',
    coupon: queryCoupon || 'FERRAMENTA10',
    shipping: 'Frete Grátis 📦',
    affiliateLink: queryLink || 'https://mercadolivre.com/sec/2oK8aX9',
  });

  const [network, setNetwork] = useState<'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM' | 'X'>('WHATSAPP');
  const [tone, setTone] = useState<'URGENT' | 'CASUAL' | 'PROFESSIONAL' | 'MINIMAL'>('URGENT');
  const [useEmojis, setUseEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);

  // Sync state if search params change
  useEffect(() => {
    if (queryName && queryPrice) {
      const newProduct: SelectedProduct = {
        name: queryName,
        price: queryPrice,
        originalPrice: queryOriginalPrice || undefined,
        discount: queryDiscount || undefined,
        coupon: queryCoupon || undefined,
        shipping: 'Frete Grátis 📦',
        affiliateLink: queryLink || 'https://www.mercadolivre.com.br/p/MLB58353028',
      };
      setProduct(newProduct);
      handleGenerateGemini(newProduct);
    }
  }, [queryName, queryPrice, queryLink]);

  const generateStandardCopy = () => {
    const emojiFire = useEmojis ? '🔥 ' : '';
    const emojiTicket = useEmojis ? '🎟️ ' : '';
    const emojiBox = useEmojis ? '📦 ' : '';
    const emojiArrow = useEmojis ? '👉 ' : '';
    const emojiWarning = useEmojis ? '⚠️ ' : '';

    if (tone === 'URGENT') {
      let copy = `${emojiFire}OFERTA IMPERDÍVEL! PREÇO BAIXOU!\n\n`;
      copy += `${product.name}\n\n`;
      if (product.originalPrice) copy += `De: ${product.originalPrice}\n`;
      copy += `Por apenas: ${product.price} ${product.discount ? `(${product.discount})` : ''}\n\n`;
      if (product.coupon) copy += `${emojiTicket}Cupom de Desconto: ${product.coupon}\n`;
      copy += `${emojiBox}${product.shipping}\n\n`;
      copy += `${emojiArrow}Compre com desconto aqui: ${product.affiliateLink}\n\n`;
      copy += `${emojiWarning}Atenção: Estoque limitado e preço sujeito a alteração a qualquer momento.`;
      if (includeHashtags) copy += `\n\n#Oferta #Promoção #MercadoLivre`;
      return copy;
    }

    if (tone === 'CASUAL') {
      let copy = `${useEmojis ? '😍 ' : ''}Olha esse achado incrível que encontrei pra você!\n\n`;
      copy += `${product.name}\n\n`;
      copy += `Tá saindo por só ${product.price} ${product.originalPrice ? `(era ${product.originalPrice})` : ''}\n`;
      if (product.coupon) copy += `E ainda tem cupom extra: ${product.coupon}\n`;
      copy += `E o melhor: ${product.shipping}\n\n`;
      copy += `Garanta o seu no link: ${product.affiliateLink}`;
      return copy;
    }

    if (tone === 'PROFESSIONAL') {
      let copy = `Recomendação de Oferta - Excelente Custo-Benefício\n\n`;
      copy += `Produto: ${product.name}\n`;
      copy += `Valor promocional: ${product.price}\n`;
      if (product.coupon) copy += `Cupom aplicável no checkout: ${product.coupon}\n`;
      copy += `Condição de Frete: ${product.shipping}\n\n`;
      copy += `Acesse a oferta oficial: ${product.affiliateLink}`;
      return copy;
    }

    return `${product.name}\nPor: ${product.price}\nCompre aqui: ${product.affiliateLink}`;
  };

  const handleGenerateGemini = async (overrideProduct?: SelectedProduct) => {
    const targetProduct = overrideProduct || product;
    setAiLoading(true);
    try {
      const res = await ApiClient.post<{ copy: string; aiPowered: boolean }>('/generator/gemini-copy', {
        productName: targetProduct.name,
        price: targetProduct.price,
        originalPrice: targetProduct.originalPrice,
        discount: targetProduct.discount,
        coupon: targetProduct.coupon,
        affiliateLink: targetProduct.affiliateLink,
        tone,
        network,
      });

      if (res && res.copy) {
        setAiText(res.copy);
      }
    } catch (err) {
      console.warn('Erro ao chamar Gemini, fallback ativado.', err);
    } finally {
      setAiLoading(false);
    }
  };

  const finalCopy = aiText || generateStandardCopy();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(finalCopy);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            Gerador de Textos Promocionais com Gemini IA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {queryName
              ? `Gerando copy automática para o produto retornado da API oficial do Mercado Livre.`
              : `Gere mensagens promocionais de alta conversão adaptadas para WhatsApp, Telegram e Instagram.`}
          </p>
        </div>

        <button
          onClick={() => handleGenerateGemini()}
          disabled={aiLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all self-start disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" />
          {aiLoading ? 'Criando Copy com Gemini IA...' : '✨ Gerar Copy com Gemini IA'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Options Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Network Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
              1. Selecione a Rede Social
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
                { id: 'TELEGRAM', label: 'Telegram', icon: '✈️' },
                { id: 'INSTAGRAM', label: 'Instagram', icon: '📸' },
                { id: 'X', label: 'X / Twitter', icon: '🐦' },
              ].map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setNetwork(n.id as any);
                    setAiText(null);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    network === n.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
              2. Tom de Comunicação
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'URGENT', label: 'Urgente / Fogo', icon: Flame },
                { id: 'CASUAL', label: 'Descontraído', icon: Smile },
                { id: 'PROFESSIONAL', label: 'Profissional', icon: Briefcase },
                { id: 'MINIMAL', label: 'Minimalista', icon: Zap },
              ].map((t) => {
                const Icon = t.icon;
                const active = tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTone(t.id as any);
                      setAiText(null);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      active
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-500" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
              3. Opções Visuais
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Usar Emojis Ilustrativos</span>
                <input
                  type="checkbox"
                  checked={useEmojis}
                  onChange={(e) => {
                    setUseEmojis(e.target.checked);
                    setAiText(null);
                  }}
                  className="rounded border-slate-300 text-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Incluir Hashtags Relevantes</span>
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => {
                    setIncludeHashtags(e.target.checked);
                    setAiText(null);
                  }}
                  className="rounded border-slate-300 text-amber-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Live Copy Preview & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {aiText ? '✨ Texto Gerado com Gemini IA' : 'Preview do Texto Promocional'}
              </span>
              {aiText && (
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                  Gemini Powered
                </span>
              )}
            </div>

            <textarea
              value={finalCopy}
              onChange={(e) => setAiText(e.target.value)}
              rows={12}
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none resize-none"
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => copyToClipboard(finalCopy)}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto'}
              </button>

              <button
                onClick={openWhatsApp}
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
                Abrir no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-400">Carregando Gerador de Copys...</div>}>
      <GeneratorContent />
    </Suspense>
  );
}
