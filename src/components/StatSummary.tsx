/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Trophy, Goal, ShieldAlert } from 'lucide-react';
import { MatchRecord } from '../types';

interface StatSummaryProps {
  records: MatchRecord[];
}

export default function StatSummary({ records }: StatSummaryProps) {
  // Compute analytics
  const uniquePlayers = new Set(records.map((r) => r.jugador)).size;
  
  // Clean count of matches. Since each row is a player appearance, unique match id can be formed by Date and Match Name
  const uniqueMatches = new Set(records.map((r) => `${r.fecha}_${r.partido}`)).size;
  
  const totalGoals = records.reduce((acc, r) => acc + r.golesAnotados, 0);
  
  const yellowCards = records.reduce((acc, r) => acc + r.tarjetaAmarilla, 0);
  const doubleYellows = records.reduce((acc, r) => acc + r.dobleAmarilla, 0);
  const redCards = records.reduce((acc, r) => acc + r.tarjetaRoja, 0);
  const totalCards = yellowCards + doubleYellows + redCards;

  const stats = [
    {
      label: 'Jugadores Registrados',
      value: uniquePlayers,
      sub: 'En plantilla y alineaciones',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-100 dark:border-blue-950',
      icon: Users,
    },
    {
      label: 'Partidos Analizados',
      value: uniqueMatches,
      sub: 'Encuentros en la base de datos',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-100 dark:border-emerald-950',
      icon: Trophy,
    },
    {
      label: 'Goles Anotados',
      value: totalGoals,
      sub: 'Suma de goles a favor',
      color: 'from-teal-500 to-emerald-500',
      textColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/20',
      borderColor: 'border-teal-100 dark:border-teal-950',
      icon: Goal,
    },
    {
      label: 'Tarjetas Mostradas',
      value: totalCards,
      sub: `${yellowCards} 🟨 | ${doubleYellows} 🟨🟨 | ${redCards} 🟥`,
      color: 'from-amber-500 to-red-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-100 dark:border-amber-950',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={`bg-white dark:bg-slate-900 border ${stat.borderColor} rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider uppercase">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.textColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
                {stat.value}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
              {stat.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
