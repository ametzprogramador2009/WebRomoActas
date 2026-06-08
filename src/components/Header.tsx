/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database, RefreshCw, Layers, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshed: boolean;
  lastUpdated: string | null;
}

export default function Header({ onRefresh, isRefreshed, lastUpdated }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white py-4 px-6 relative overflow-hidden shadow-md">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left Brand Area */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg ring-1 ring-white/10 flex items-center justify-center">
            <Layers className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-teal-400 font-bold uppercase">
                LIGA VASCA JUVENIL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Rendimiento Deportivo & Estadísticas
            </h1>
          </div>
        </div>

        {/* Right Status & Sheet Actions */}
        <div className="flex flex-wrap items-center gap-3 md:self-center w-full md:w-auto mt-2 md:mt-0">
          {/* Sheet Link */}
          <a
            href="https://docs.google.com/spreadsheets/d/1nQdo8ojEXAIM2HnflujqtEmYnvWdQTf3BQAO9Nu5DLU/"
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Abrir Google Sheet original"
          >
            <Database className="h-3.5 w-3.5 text-teal-400" />
            <span>Ver Google Sheet</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Sync status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <span className="text-slate-400">Estado:</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Conectado
            </span>
          </div>

          {/* Refresh action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshed}
            className={`cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-semibold text-xs transition-all disabled:text-slate-500 disabled:cursor-not-allowed shadow-md hover:shadow-teal-500/20 active:scale-95`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshed ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="max-w-7xl mx-auto mt-2 flex justify-end">
          <p className="text-[10px] text-slate-400 font-mono">
            Última Sincronización: {lastUpdated}
          </p>
        </div>
      )}
    </header>
  );
}
