'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid,
  List,
  Tag,
  Copy,
  ExternalLink,
  Check,
  TrendingDown,
  Truck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface Offer {
  externalItemId: string;
  sellerName?: string;
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  freeShipping: boolean;
  soldQuantity: number;
  productUrl: string;
}

interface Product {
  id: string;
  externalId: string;
  catalogProductId?: string;
  title: string;
  brand?: string;
  model?: string;
  imageUrl: string;
  marketplace: 'MERCADO_LIVRE' | 'SHOPEE' | 'MANUAL';
  offers: Offer[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters State
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState<string>('ALL');
  const [minDiscount, setMinDiscount] = useState<string>('0');
  const [freeShipping, setFreeShipping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedOffers, setSavedOffers] = useState<string[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.get<Product[]>('/marketplaces/search', {
        query,
        minDiscount: minDiscount !== '0' ? minDiscount : undefined,
        freeShipping: freeShipping ? 'true' : undefined,
      });

      let filtered = data;
      if (marketplace !== 'ALL') {
        filtered = data.filter((p) => p.marketplace === marketplace);
      }

      setProducts(filtered);
    } catch (err) {
      console.warn('Erro ao carregar produtos do servidor, exibindo demonstração.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query, marketplace, minDiscount, freeShipping]);

  const copyOriginalLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveOffer = (productId: string) => {
    if (!savedOffers.includes(productId)) {
      setSavedOffers([...savedOffers, productId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-500" />
            Buscador de Produtos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Encontre produtos de catálogo no Mercado Livre e Shopee, verifique descontos e escolha as melhores ofertas.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" /> Tabela
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Query input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome, marca ou modelo (ex: parafusadeira DeWalt)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Marketplace Selector */}
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todos Marketplaces</option>
            <option value="MERCADO_LIVRE">Mercado Livre</option>
            <option value="SHOPEE">Shopee</option>
          </select>

          {/* Min Discount Selector */}
          <select
            value={minDiscount}
            onChange={(e) => setMinDiscount(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="0">Qualquer Desconto</option>
            <option value="15">Mínimo 15% OFF</option>
            <option value="25">Mínimo 25% OFF</option>
            <option value="35">Mínimo 35% OFF</option>
          </select>

          {/* Free Shipping Toggle */}
          <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={freeShipping}
              onChange={(e) => setFreeShipping(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500/20"
            />
            Frete Grátis
          </label>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tente buscar com outros termos ou remova alguns dos filtros selecionados.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setMarketplace('ALL');
              setMinDiscount('0');
              setFreeShipping(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
          >
            Limpar Filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const mainOffer = product.offers[0];
            const isSaved = savedOffers.includes(product.id);

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-amber-500/30 transition-all"
              >
                <div className="space-y-3">
                  {/* Image & Badge Overlay */}
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                      {product.marketplace === 'MERCADO_LIVRE' ? 'Mercado Livre' : 'Shopee'}
                    </div>

                    {mainOffer?.freeShipping && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Frete Grátis
                      </div>
                    )}
                  </div>

                  {/* Title & Brand */}
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      {product.brand || 'Marca Destaque'}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                  </div>

                  {/* Pricing Block */}
                  {mainOffer && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                      <div>
                        {mainOffer.originalPrice && (
                          <span className="text-xs line-through text-slate-400 block">
                            R$ {mainOffer.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                          R$ {mainOffer.price.toFixed(2)}
                        </span>
                      </div>

                      {mainOffer.discountPercentage > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {Math.round(mainOffer.discountPercentage)}% OFF
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-colors"
                  >
                    Ver Detalhes
                  </Link>

                  <button
                    onClick={() => handleSaveOffer(product.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      isSaved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {isSaved ? 'Salva' : 'Salvar'}
                  </button>

                  {mainOffer && (
                    <button
                      onClick={() => copyOriginalLink(mainOffer.productUrl, product.id)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Copiar Link Original"
                    >
                      {copiedId === product.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Produto</th>
                <th className="p-4">Marketplace</th>
                <th className="p-4">Preço Atual</th>
                <th className="p-4">Desconto</th>
                <th className="p-4">Vendas</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {products.map((product) => {
                const mainOffer = product.offers[0];
                return (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {product.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{product.brand || 'Geral'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-300">
                        {product.marketplace}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      R$ {mainOffer?.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {mainOffer?.discountPercentage > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">
                          {Math.round(mainOffer.discountPercentage)}% OFF
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{mainOffer?.soldQuantity || 0} un.</td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 inline-block"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
