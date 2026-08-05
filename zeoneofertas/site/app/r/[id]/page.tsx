'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExternalLink, Sparkles } from 'lucide-react';

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;

  useEffect(() => {
    // Simulate telemetry click event registration
    const timer = setTimeout(() => {
      // Destination URL fallback
      window.location.href = 'https://www.mercadolivre.com.br/p/MLB-20984123';
    }, 1200);

    return () => clearTimeout(timer);
  }, [linkId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold animate-pulse shadow-xl shadow-amber-500/20">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold">Redirecionando para a Oferta...</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Aguarde um instante. Você está sendo direcionado com segurança para a página oficial do parceiro.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-amber-500 text-xs font-semibold">
        <ExternalLink className="w-4 h-4 animate-bounce" />
        OfertaHub Redirection Engine
      </div>
    </div>
  );
}
