'use client';

import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, Building2, ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from '../providers/workspace-provider';
import { useTheme } from 'next-themes';

export function Header() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Workspace Selector */}
      <div className="relative">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-800 dark:text-slate-200"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold leading-none">{activeWorkspace?.name || 'Selecione Workspace'}</span>
            <span className="text-[10px] text-slate-400 leading-tight">Workspace Ativo</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        {/* Dropdown Menu */}
        {workspaceOpen && (
          <div
            className="absolute left-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            onClick={() => setWorkspaceOpen(false)}
          >
            <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Seus Workspaces
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={`flex items-center w-full px-2.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  ws.id === activeWorkspace?.id
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                {ws.name}
              </button>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
            <button className="flex items-center w-full px-2.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Workspace
            </button>
          </div>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative hidden md:flex items-center w-96">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar ofertas, produtos, cupons... (Ctrl + K)"
          className="w-full pl-10 pr-12 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
        />
        <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Alternar Tema"
        >
          <Sun className="w-4 h-4 hidden dark:block text-amber-400" />
          <Moon className="w-4 h-4 block dark:hidden text-slate-700" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-amber-500/20">
            OF
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Afiliado Pro</span>
            <span className="text-[10px] text-slate-400">admin@ofertahub.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
