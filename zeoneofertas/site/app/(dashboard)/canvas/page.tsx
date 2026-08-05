'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Download, Sparkles, Image as ImageIcon, Layers, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas Format State
  const [aspectRatio, setAspectRatio] = useState<'FEED' | 'SQUARE' | 'STORIES'>('FEED');

  // Controls State
  const [productTitle, setProductTitle] = useState('Parafusadeira DeWalt 20V MAX Li-Ion');
  const [price, setPrice] = useState('R$ 549,90');
  const [originalPrice, setOriginalPrice] = useState('R$ 799,00');
  const [discountBadge, setDiscountBadge] = useState('31% OFF');
  const [couponCode, setCouponCode] = useState('FERRAMENTA10');
  const [bgColor, setBgColor] = useState('#0F172A');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80'
  );
  const [copiedImage, setCopiedImage] = useState(false);

  // Dimensions lookup
  const getDimensions = () => {
    switch (aspectRatio) {
      case 'STORIES':
        return { width: 540, height: 960 };
      case 'SQUARE':
        return { width: 600, height: 600 };
      case 'FEED':
      default:
        return { width: 540, height: 675 };
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle Gradient Accent
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Header Logo Brand
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('OfertaHub', 30, 45);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.fillText('OFERTA ESPECIAL', 30, 65);

    // Product Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const imgWidth = width - 80;
      const imgHeight = height * 0.45;
      const imgX = 40;
      const imgY = 90;

      // Card Container behind image
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.roundRect?.(imgX, imgY, imgWidth, imgHeight, 20);
      ctx.fill();

      ctx.drawImage(img, imgX + 20, imgY + 20, imgWidth - 40, imgHeight - 40);

      // Discount Badge
      if (discountBadge) {
        ctx.fillStyle = '#10B981';
        ctx.roundRect?.(imgX + 15, imgY + 15, 90, 30, 8);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(discountBadge, imgX + 28, imgY + 35);
      }

      // Title & Price Section
      const textY = imgY + imgHeight + 40;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(productTitle.substring(0, 35), 30, textY);

      if (originalPrice) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`De: ${originalPrice}`, 30, textY + 30);
      }

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'extrabold 32px sans-serif';
      ctx.fillText(`Por: ${price}`, 30, textY + 65);

      // Coupon Box
      if (couponCode) {
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.roundRect?.(30, textY + 85, width - 60, 45, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`🎟️ Cupom: ${couponCode}`, 50, textY + 112);
      }
    };
  };

  useEffect(() => {
    drawCanvas();
  }, [aspectRatio, productTitle, price, originalPrice, discountBadge, couponCode, bgColor, imageUrl]);

  const handleCopyImageToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        try {
          navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch (err) {
          handleExportPng();
        }
      }
    });
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `arte-oferta-${aspectRatio.toLowerCase()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-amber-500" />
            Criador Visual de Artes (Canvas)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gere imagens de divulgação e copie direto para a área de transferência do WhatsApp com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleCopyImageToClipboard}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            {copiedImage ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedImage ? 'Imagem Copiada (Ctrl+V no Whats)!' : 'Copiar Imagem Rápida'}
          </button>

          <button
            onClick={handleExportPng}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Exportar PNG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Customization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Format Selector Tabs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
              1. Formato da Arte
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'FEED', label: 'Feed (4:5)' },
                { id: 'SQUARE', label: 'Quadrado (1:1)' },
                { id: 'STORIES', label: 'Stories (9:16)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAspectRatio(f.id as any)}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                    aspectRatio === f.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content Customizer */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
              2. Dados do Banner
            </label>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Título do Produto</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Preço Promocional</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Preço Anterior</label>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Badge Desconto</label>
                  <input
                    type="text"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Código do Cupom</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white uppercase font-bold"
                  />
                </div>
              </div>

              {/* Color Picker Buttons */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Cor de Fundo</label>
                <div className="flex items-center gap-2">
                  {['#0F172A', '#020617', '#1E1B4B', '#064E3B', '#78350F'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        bgColor === c ? 'scale-110 border-amber-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Canvas Render (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 mb-4 block">
            Preview em Tempo Real (Canvas HTML5)
          </span>
          <canvas
            ref={canvasRef}
            className="max-w-full rounded-2xl shadow-2xl border border-slate-800 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
