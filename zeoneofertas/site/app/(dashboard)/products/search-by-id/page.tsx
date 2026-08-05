'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
  Tag,
  Truck,
  Store,
  ShieldCheck,
  BookmarkPlus,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface Offer {
  externalItemId: string;
  sellerId?: string;
  sellerName?: string;
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  freeShipping: boolean;
  productUrl: string;
}

interface MLProductResult {
  id: string;
  externalId: string;
  catalogProductId?: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  imageUrl: string;
  marketplace: string;
  offers: Offer[];
}

export default function MLProductByIdSearchPage() {
  const [productIdentifier, setProductIdentifier] = useState('MLB58353028');
  const [product, setProduct] = useState<MLProductResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedOfferId, setSavedOfferId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productIdentifier) return;

    setLoading(true);
    try {
      const data = await ApiClient.get<MLProductResult>('/marketplaces/ml/product-by-identifier', {
        id: productIdentifier.trim(),
      });
      setProduct(data);
    } catch (err) {
      console.error('Erro na chamada por ID:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyImageQuick = async (imgUrl: string, id: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 500;
      canvas.height = img.naturalHeight || img.height || 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);
              setCopiedId(id);
              setTimeout(() => setCopiedId(null), 2500);
              return;
            } catch (clipboardErr) {
              console.warn('Fallback: Clipboard Item error', clipboardErr);
            }
          }
          // Fallback to URL text copy if browser blocks binary image paste
          navigator.clipboard.writeText(imgUrl);
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        }, 'image/png');
      }
    } catch (err) {
      console.warn('Fallback imagem externa sem CORS, copiando URL:', err);
      navigator.clipboard.writeText(imgUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSaveOffer = async (offer: Offer) => {
    if (!product) return;

    try {
      await ApiClient.post('/offers/save', {
        externalProductId: product.id,
        externalItemId: offer.externalItemId,
        title: product.title,
        brand: product.brand,
        imageUrl: product.imageUrl,
        price: offer.price,
        originalPrice: offer.originalPrice,
        discountPercentage: offer.discountPercentage,
        freeShipping: offer.freeShipping,
        sellerName: offer.sellerName,
        productUrl: offer.productUrl,
      });

      setSavedOfferId(offer.externalItemId);
      setTimeout(() => setSavedOfferId(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar oferta:', err);
    }
  };

  const bestOffer = product?.offers?.[0];
  const formattedPrice = bestOffer ? `R$ ${bestOffer.price.toFixed(2)}` : 'R$ 775.90';
  const formattedOriginalPrice = bestOffer?.originalPrice ? `R$ ${bestOffer.originalPrice.toFixed(2)}` : undefined;
  const formattedDiscount = bestOffer?.discountPercentage ? `${Math.round(bestOffer.discountPercentage)}% OFF` : undefined;
  const productUrl = bestOffer?.productUrl || `https://www.mercadolivre.com.br/p/${productIdentifier}`;

  const generatorUrl = product
    ? `/generator?name=${encodeURIComponent(product.title)}&price=${encodeURIComponent(formattedPrice)}${
        formattedOriginalPrice ? `&originalPrice=${encodeURIComponent(formattedOriginalPrice)}` : ''
      }${formattedDiscount ? `&discount=${encodeURIComponent(formattedDiscount)}` : ''}&link=${encodeURIComponent(
        productUrl
      )}`
    : '/generator';

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-500" />
            Busca Direta por ID do Mercado Livre (MLB)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Insira o identificador de catálogo (ex: <code className="text-amber-500 font-mono font-bold">MLB58353028</code>) para consultar dados e salvar a oferta na Central de Ofertas.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSearch} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
          Identificador do Produto (product_identifier)
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={productIdentifier}
              onChange={(e) => setProductIdentifier(e.target.value)}
              placeholder="Ex: MLB58353028"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Consultando ML API...' : 'Buscar no Mercado Livre'}
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Test Pill */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Exemplo de ID real testável:</span>
          <button
            type="button"
            onClick={() => {
              setProductIdentifier('MLB58353028');
              setTimeout(handleSearch, 100);
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs hover:bg-amber-500/20"
          >
            MLB58353028 (Moto G06 128GB)
          </button>
        </div>
      </form>

      {/* Results Display */}
      {product && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Product Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-6">
            <div className="w-44 h-44 rounded-xl bg-slate-100 dark:bg-slate-800 p-3 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
              <img src={product.imageUrl} alt={product.title} className="max-h-full max-w-full object-contain" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 font-bold text-xs">
                  Mercado Livre Oficial
                </span>
                <span className="text-xs font-semibold text-amber-500">{product.brand}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {product.title}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {bestOffer && (
                  <button
                    onClick={() => handleSaveOffer(bestOffer)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    {savedOfferId === bestOffer.externalItemId ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                    {savedOfferId === bestOffer.externalItemId
                      ? 'Salva na Central no MySQL!'
                      : 'Salvar Oferta na Central'}
                  </button>
                )}

                <button
                  onClick={() => copyImageQuick(product.imageUrl, 'img-main')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === 'img-main' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedId === 'img-main' ? 'Imagem Copiada (Pronta p/ Ctrl+V)!' : 'Copiar Imagem'}
                </button>

                <Link
                  href={generatorUrl}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" /> ✨ Gerar Copy com Gemini IA
                </Link>
              </div>
            </div>
          </div>

          {/* Results Table from /products/{id}/items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                Anúncios e Preços Encontrados ({product.offers.length} Resultados)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                /products/{product.catalogProductId}/items
              </span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Item ID</th>
                    <th className="p-4">Vendedor</th>
                    <th className="p-4">Preço Atual</th>
                    <th className="p-4">Preço Original</th>
                    <th className="p-4">Desconto</th>
                    <th className="p-4">Frete</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {product.offers.map((offer) => {
                    const rowPriceStr = `R$ ${offer.price.toFixed(2)}`;
                    const rowOrigStr = offer.originalPrice ? `R$ ${offer.originalPrice.toFixed(2)}` : undefined;
                    const rowDiscStr = offer.discountPercentage > 0 ? `${Math.round(offer.discountPercentage)}% OFF` : undefined;
                    const rowGenUrl = `/generator?name=${encodeURIComponent(product.title)}&price=${encodeURIComponent(rowPriceStr)}${
                      rowOrigStr ? `&originalPrice=${encodeURIComponent(rowOrigStr)}` : ''
                    }${rowDiscStr ? `&discount=${encodeURIComponent(rowDiscStr)}` : ''}&link=${encodeURIComponent(
                      offer.productUrl
                    )}`;

                    const isSaved = savedOfferId === offer.externalItemId;

                    return (
                      <tr key={offer.externalItemId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {offer.externalItemId}
                        </td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          {offer.sellerName}
                        </td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                          R$ {offer.price.toFixed(2)}
                        </td>
                        <td className="p-4 text-slate-400">
                          {offer.originalPrice ? `R$ ${offer.originalPrice.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-4">
                          {offer.discountPercentage > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                              {Math.round(offer.discountPercentage)}% OFF
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-4">
                          {offer.freeShipping ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" /> Grátis
                            </span>
                          ) : (
                            <span className="text-slate-400">Padrão</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleSaveOffer(offer)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-colors ${
                              isSaved
                                ? 'bg-emerald-500 text-white'
                                : 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            {isSaved ? <CheckCircle2 className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                            {isSaved ? 'Salva!' : 'Salvar Oferta'}
                          </button>

                          <Link
                            href={rowGenUrl}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs"
                          >
                            <Sparkles className="w-3 h-3" /> Gerar Copy
                          </Link>

                          <a
                            href={offer.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1"
                          >
                            Abrir <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
