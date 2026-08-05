'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShoppingBag,
  Tag,
  Truck,
  TrendingDown,
  Store,
  ShieldCheck,
  Share2,
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
  availableQuantity: number;
  soldQuantity: number;
  productUrl: string;
}

interface ProductDetails {
  id: string;
  externalId: string;
  catalogProductId?: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  imageUrl: string;
  images: string[];
  marketplace: 'MERCADO_LIVRE' | 'SHOPEE' | 'MANUAL';
  offers: Offer[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedOfferId, setSavedOfferId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await ApiClient.get<ProductDetails>(`/marketplaces/products/${productId}`);
        setProduct(data);
        if (data && data.imageUrl) {
          setSelectedImage(data.imageUrl);
        }
      } catch (err) {
        console.warn('Erro ao carregar detalhes do produto, utilizando dados demonstrativos.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [productId]);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectOffer = (offer: Offer) => {
    setSavedOfferId(offer.externalItemId);
    setTimeout(() => {
      router.push('/offers');
    }, 1200);
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-400">Produto não encontrado.</p>
        <Link href="/products" className="text-xs text-amber-500 font-bold hover:underline">
          Voltar ao Buscador
        </Link>
      </div>
    );
  }

  const bestOffer = product.offers[0];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Buscador
        </Link>

        <span className="text-xs font-semibold text-slate-400">
          ID Catálogo: <code className="text-amber-500 font-mono">{product.externalId}</code>
        </span>
      </div>

      {/* Main Grid: Images Gallery & Product Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border p-1 bg-white dark:bg-slate-900 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Highlights (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                {product.marketplace}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {product.brand || 'Marca Oficial'}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Best Offer Price Highlight */}
          {bestOffer && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">Melhor Preço Encontrado</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  R$ {bestOffer.price.toFixed(2)}
                </span>
                {bestOffer.originalPrice && (
                  <span className="text-sm line-through text-slate-400">
                    R$ {bestOffer.originalPrice.toFixed(2)}
                  </span>
                )}
                {bestOffer.discountPercentage > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {Math.round(bestOffer.discountPercentage)}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                {bestOffer.freeShipping && (
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Truck className="w-4 h-4" /> Frete Grátis
                  </span>
                )}
                <span>Vendido por: <strong className="text-slate-900 dark:text-white">{bestOffer.sellerName || 'Vendedor Verificado'}</strong></span>
                <span>Vendas: <strong className="text-slate-900 dark:text-white">{bestOffer.soldQuantity} un.</strong></span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {bestOffer && (
              <button
                onClick={() => handleSelectOffer(bestOffer)}
                className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Tag className="w-4 h-4" />
                {savedOfferId === bestOffer.externalItemId ? 'Oferta Selecionada!' : 'Escolher Esta Oferta'}
              </button>
            )}

            {bestOffer && (
              <button
                onClick={() => copyLink(bestOffer.productUrl)}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Link Original'}
              </button>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Descrição do Produto</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sellers Comparison Table */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Tabela de Comparação de Vendedores ({product.offers.length} Anúncios)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Comparação em tempo real de preços e descontos</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Vendedor</th>
                <th className="p-4">Preço Atual</th>
                <th className="p-4">Preço Original</th>
                <th className="p-4">Desconto</th>
                <th className="p-4">Frete</th>
                <th className="p-4">Estoque</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {product.offers.map((offer) => (
                <tr key={offer.externalItemId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    {offer.sellerName || 'Vendedor Mercado Livre'}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    R$ {offer.price.toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-400">
                    {offer.originalPrice ? `R$ ${offer.originalPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4">
                    {offer.discountPercentage > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">
                        {Math.round(offer.discountPercentage)}% OFF
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-4">
                    {offer.freeShipping ? (
                      <span className="text-emerald-600 font-semibold">Grátis</span>
                    ) : (
                      <span className="text-slate-400">Consulte</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{offer.availableQuantity} un.</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleSelectOffer(offer)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        savedOfferId === offer.externalItemId
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                      }`}
                    >
                      {savedOfferId === offer.externalItemId ? 'Selecionado' : 'Escolher Esta Oferta'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
