'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Barcode,
  Tag,
  Link as LinkIcon,
  Ticket,
  MessageSquare,
  Palette,
  Send,
  FolderTree,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Buscador de Produtos', href: '/products', icon: Search },
  { label: 'Busca por ID ML', href: '/products/search-by-id', icon: Barcode, badge: 'MLB' },
  { label: 'Central de Ofertas', href: '/offers', icon: Tag, badge: '8' },
  { label: 'Links de Afiliados', href: '/affiliate-links', icon: LinkIcon },
  { label: 'Cupons', href: '/coupons', icon: Ticket },
  { label: 'Gerador de Copys', href: '/generator', icon: MessageSquare },
  { label: 'Criador de Artes', href: '/canvas', icon: Palette },
  { label: 'Publicações', href: '/publications', icon: Send },
  { label: 'Categorias', href: '/categories', icon: FolderTree },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 border-r border-slate-800 z-30',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Brand Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none">
                Oferta<span className="text-amber-500">Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">SaaS para Afiliados</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on Collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
            <span className="font-semibold text-amber-400 block mb-0.5">Versão MVP 1.0</span>
            <span className="text-slate-400 block">Mercado Livre & Shopee Ready</span>
          </div>
        </div>
      )}
    </aside>
  );
}
