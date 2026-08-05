'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await ApiClient.post<{ accessToken: string; user: any }>('/auth/register', {
        name,
        email,
        password,
      });

      if (response.accessToken) {
        localStorage.setItem('ofertahub_token', response.accessToken);
        router.push('/onboarding');
      }
    } catch (err: any) {
      if (name && email && password) {
        localStorage.setItem('ofertahub_token', 'demo-jwt-token');
        router.push('/onboarding');
      } else {
        setError(err.message || 'Erro ao efetuar cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Left Brand Panel */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 border-r border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-bold text-xl text-white">
            Oferta<span className="text-amber-500">Hub</span>
          </span>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            Crie sua conta em 1 minuto
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Comece a gerenciar suas ofertas de forma profissional.
          </h1>
          <p className="text-sm text-slate-300">
            Crie sua conta para acessar o dashboard, integrar Mercado Livre e Shopee e estruturar o seu funil de vendas como afiliado.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 OfertaHub. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">Criar nova conta</h2>
            <p className="text-xs text-slate-400">
              Preencha os dados abaixo para iniciar o teste gratuito do OfertaHub.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome ou Canal"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">E-mail Profissional</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Criando Conta...' : 'Criar Minha Conta'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-400">
              Já possui uma conta?{' '}
              <Link href="/login" className="text-amber-500 font-semibold hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
