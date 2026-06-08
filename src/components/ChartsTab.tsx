/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MatchRecord } from '../types';
import { calculatePlayerStats } from '../utils';
import { 
  BarChart3, 
  Goal, 
  Clock, 
  ShieldAlert, 
  Award, 
  Flame, 
  HelpCircle,
  TrendingUp,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChartsTabProps {
  records: MatchRecord[];
}

export default function ChartsTab({ records }: ChartsTabProps) {
  // Aggregate stats
  const playerStats = useMemo(() => calculatePlayerStats(records), [records]);

  // 1. Top Scorers (Goleadores) - sorted by goals desc
  const topScorers = useMemo(() => {
    return [...playerStats]
      .filter(p => p.goles > 0)
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 10);
  }, [playerStats]);

  // 2. Top Minutes Players (Involucración) - sorted by minutes played desc
  const topMinutesPlayers = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => b.minutos - a.minutos)
      .slice(0, 10);
  }, [playerStats]);

  // Max minutes/goals for scaling charts
  const maxGoals = useMemo(() => {
    if (topScorers.length === 0) return 1;
    return Math.max(...topScorers.map(p => p.goles));
  }, [topScorers]);

  const maxMinutes = useMemo(() => {
    if (topMinutesPlayers.length === 0) return 1;
    return Math.max(...topMinutesPlayers.map(p => p.minutos));
  }, [topMinutesPlayers]);

  // 3. Card calculations
  const cardsByTeam = useMemo(() => {
    const teamsList = Array.from(new Set(records.map(r => r.equipo)));
    return teamsList.map(team => {
      const teamRecords = records.filter(r => r.equipo === team);
      const yellows = teamRecords.reduce((acc, r) => acc + r.tarjetaAmarilla, 0);
      const doubleYellows = teamRecords.reduce((acc, r) => acc + r.dobleAmarilla, 0);
      const reds = teamRecords.reduce((acc, r) => acc + r.tarjetaRoja, 0);
      return {
        team,
        yellows,
        doubleYellows,
        reds,
        total: yellows + doubleYellows + reds
      };
    }).sort((a,b) => b.total - a.total);
  }, [records]);

  // Total Card Totals
  const globalCards = useMemo(() => {
    const yellows = records.reduce((acc, r) => acc + r.tarjetaAmarilla, 0);
    const doubleYellows = records.reduce((acc, r) => acc + r.dobleAmarilla, 0);
    const reds = records.reduce((acc, r) => acc + r.tarjetaRoja, 0);
    return { yellows, doubleYellows, reds, total: yellows + doubleYellows + reds };
  }, [records]);

  // 4. Match details and team performance
  const matchPerformance = useMemo(() => {
    // Unique matches
    const matchesList = Array.from(new Set(records.map(r => r.partido)));
    
    return matchesList.map(matchName => {
      const matchRecords = records.filter(r => r.partido === matchName);
      const first = matchRecords[0];
      
      return {
        partido: matchName,
        fecha: first?.fecha || '',
        campo: first?.campo || '',
        resultado: first?.resultado || '',
        golesLocal: first?.golesLocal || 0,
        golesVisitante: first?.golesVisitante || 0,
        jornada: first?.jornada || '',
      };
    }).sort((a,b) => b.fecha.localeCompare(a.fecha));
  }, [records]);

  // Interactive Hovering States for details
  const [hoveredScorer, setHoveredScorer] = useState<string | null>(null);
  const [hoveredMinutero, setHoveredMinutero] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SECTION 1: TOP SCORERS & MINUTES (LEFT 8 SPANS) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* CHART 1: TOP GOLEADORES (Horizontal Bar) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start gap-4 mb-5">
            <div>
              <div className="flex items-center gap-1.5 text-teal-500 font-semibold text-xs tracking-wider uppercase mb-1">
                <Goal className="h-4 w-4" />
                <span>Pichichi Joven</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">
                Máximos Goleadores (Top 10)
              </h3>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg text-slate-400 font-mono text-[10px] hidden sm:block">
              Máx: {maxGoals} goles
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {topScorers.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">No hay goles registrados</p>
            ) : (
              topScorers.map((player, idx) => {
                const percent = (player.goles / maxGoals) * 100;
                const isHovered = hoveredScorer === player.jugador;
                
                return (
                  <div 
                    key={player.jugador}
                    onMouseEnter={() => setHoveredScorer(player.jugador)}
                    onMouseLeave={() => setHoveredScorer(null)}
                    className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 border border-transparent hover:border-slate-100/80 dark:hover:border-slate-850/50 transition-all cursor-crosshair"
                  >
                    {/* Position and Athlete Info */}
                    <div className="flex items-center gap-3 sm:w-1/3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-950' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white truncate text-xs">
                          {player.jugador}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium inline-flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            player.equipo === 'ROMO F.C.' ? 'bg-teal-500' :
                            player.equipo === 'BEASAIN, S.D.' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          {player.equipo}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Area */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-7 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850 rounded-lg overflow-hidden relative">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-r-md shadow-md"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        
                        {/* Inline information */}
                        <div className="absolute inset-y-0 right-3 flex items-center font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {player.goles} {player.goles === 1 ? 'Gol' : 'Goles'}
                        </div>
                      </div>

                      {/* Display goals/min summary on hover */}
                      <div className="w-16 text-right font-mono text-[10px] text-slate-400">
                        {Math.round(player.minutos / (player.goles || 1))} min/g
                      </div>
                    </div>

                    {/* Hover Stats Card */}
                    {isHovered && (
                      <div className="absolute bottom-4 right-4 bg-slate-900 border border-teal-500/30 text-white text-[11px] p-3 rounded-xl shadow-xl z-10 w-52 pointer-events-none animate-fade-in font-sans">
                        <p className="font-bold border-b border-slate-800 pb-1 mb-1.5 text-teal-400 uppercase tracking-wide">
                          Detalles Técnicos
                        </p>
                        <div className="grid grid-cols-2 gap-y-1 text-slate-300 font-mono">
                          <span>Minutos:</span>
                          <span className="text-right text-white font-bold">{player.minutos} min</span>
                          <span>Partidos:</span>
                          <span className="text-right text-white font-bold">{player.partidos}</span>
                          <span>Promedio:</span>
                          <span className="text-right text-white font-bold">{((player.goles / player.minutos) * 90).toFixed(1)} g/90</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHART 2: MINUTES PLAYED (Custom SVG Column Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col relative">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-blue-500 font-semibold text-xs tracking-wider uppercase mb-1">
                <Clock className="h-4 w-4" />
                <span>Minutero Activo</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">
                Jugadores de Mayor Impacto Físico
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Minutos acumulados en juego (Top 10). Pasa el cursor para ver titularidades y suplencias.
              </p>
            </div>
          </div>

          {topMinutesPlayers.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10">No hay minutos registrados</p>
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              {/* Responsive SVG Chart container */}
              <div className="w-full h-64 md:h-72 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl p-4 border border-slate-100/50 dark:border-slate-850 flex flex-col items-center justify-center relative">
                
                {/* SVG Graphics */}
                <svg className="w-full h-full" viewBox="0 0 540 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = 180 - ratio * 150;
                    const value = Math.round(maxMinutes * ratio);
                    return (
                      <g key={ratio}>
                        <line 
                          x1="45" 
                          y1={y} 
                          x2="530" 
                          y2={y} 
                          stroke="#E2E8F0" 
                          strokeWidth="1" 
                          strokeDasharray="4"
                          className="dark:stroke-slate-800/80"
                        />
                        <text 
                          x="5" 
                          y={y + 4} 
                          className="fill-slate-400 font-mono text-[9px] font-bold"
                        >
                          {value}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Columns */}
                  {topMinutesPlayers.map((player, idx) => {
                    const colWidth = 32;
                    const spacing = 47;
                    const x = 55 + idx * spacing;
                    const colHeight = (player.minutos / maxMinutes) * 150;
                    const y = 180 - colHeight;
                    const isHovered = hoveredMinutero === player.jugador;

                    return (
                      <g 
                        key={player.jugador}
                        onMouseEnter={() => setHoveredMinutero(player.jugador)}
                        onMouseLeave={() => setHoveredMinutero(null)}
                        className="cursor-pointer transition-all"
                      >
                        {/* Animated Column Bar */}
                        <motion.rect
                          x={x}
                          y={y}
                          width={colWidth}
                          height={colHeight}
                          rx="4"
                          fill={isHovered ? "url(#blueGlowGrad)" : "url(#blueColGrad)"}
                          initial={{ height: 0, y: 180 }}
                          animate={{ height: colHeight, y }}
                          transition={{ duration: 0.6 + idx * 0.05, ease: "easeOut" }}
                          className="transition-all"
                        />

                        {/* Text under column (Initials / Short name) */}
                        <text
                          x={x + colWidth / 2}
                          y="196"
                          textAnchor="middle"
                          className={`fill-slate-500 dark:fill-slate-400 font-mono text-[9px] font-bold ${isHovered ? 'fill-blue-500 dark:fill-blue-400' : ''}`}
                        >
                          {player.jugador.slice(0, 3)}..
                        </text>

                        {/* Small number count on top of bar */}
                        {colHeight > 20 && (
                          <text
                            x={x + colWidth / 2}
                            y={y + 14}
                            textAnchor="middle"
                            className="fill-white font-mono text-[9px] font-extrabold shadow-sm"
                          >
                            {player.minutos}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Axis Line */}
                  <line x1="45" y1="180" x2="530" y2="180" stroke="#CBD5E1" strokeWidth="1.5" className="dark:stroke-slate-800" />

                  {/* SVG Gradients definitions */}
                  <defs>
                    <linearGradient id="blueColGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="blueGlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Hovering Context Tooltip inside Card */}
                {hoveredMinutero && (
                  <div className="absolute top-4 right-4 bg-slate-900 border border-blue-500/30 text-white p-3 rounded-xl shadow-xl z-10 w-60 animate-fade-in text-[11px]">
                    {(() => {
                      const player = topMinutesPlayers.find(p => p.jugador === hoveredMinutero);
                      if (!player) return null;
                      return (
                        <>
                          <p className="font-bold text-sm text-blue-400 truncate border-b border-slate-800 pb-1 mb-1.5">{player.jugador}</p>
                          <div className="grid grid-cols-2 gap-y-1 font-mono text-slate-300">
                            <span>Suma Minutos:</span>
                            <span className="text-right text-white font-bold">{player.minutos}m</span>
                            <span>Min/Partido:</span>
                            <span className="text-right text-white font-bold">{Math.round(player.minutos / player.partidos)}m</span>
                            <span>Titularidades:</span>
                            <span className="text-right text-white font-bold text-emerald-400">🏟️ {player.titularidades}</span>
                            <span>Suplencias:</span>
                            <span className="text-right text-white font-bold text-amber-500">🔄 {player.suplencias}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Player Index Labels Legend at the bottom */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {topMinutesPlayers.map((player, idx) => (
                  <div key={player.jugador} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg p-2 flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-slate-400 font-bold">({player.jugador.slice(0,3)})</span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate flex-1">{player.jugador}</span>
                    <span className="text-[10px] font-mono text-blue-500 font-bold">{player.minutos}′</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 2: DISCIPLINE & MATCH TRENDS (RIGHT 4 SPANS) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* DISCIPLINE OVERVIEW CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>Feria de Tarjetas</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans mb-4">
            Disciplina Deportiva
          </h3>

          {/* Cards counter widget split */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 mb-5 text-center">
            <div className="flex flex-col items-center">
              <span className="w-5 h-7 rounded-[3px] bg-amber-400 border border-amber-500 shadow-sm inline-block mb-1.5" />
              <span className="text-lg font-extrabold text-slate-800 dark:text-white font-mono">{globalCards.yellows}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Amarillas</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-[2px] mb-1.5">
                <span className="w-4 h-7 rounded-[3px] bg-amber-400 border border-amber-500 shadow-sm inline-block" />
                <span className="w-4 h-7 rounded-[3px] bg-amber-400 border border-amber-500 shadow-sm inline-block" />
              </div>
              <span className="text-lg font-extrabold text-slate-800 dark:text-white font-mono">{globalCards.doubleYellows}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dobles Yell.</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-7 rounded-[3px] bg-red-500 border border-red-600 shadow-sm inline-block mb-1.5" />
              <span className="text-lg font-extrabold text-slate-800 dark:text-white font-mono">{globalCards.reds}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rojas Dir.</span>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Sanciones por Club
          </p>

          {/* Breakdown bars per team */}
          <div className="flex flex-col gap-3">
            {cardsByTeam.map((ct) => {
              const maxTotal = Math.max(...cardsByTeam.map(c => c.total)) || 1;
              const barPercent = (ct.total / maxTotal) * 100;
              return (
                <div key={ct.team} className="bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-3 border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-white truncate">{ct.team}</span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white">🛑 {ct.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-end gap-2.5 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{ct.yellows}🟨</span>
                    <span>{ct.doubleYellows}🟨🟨</span>
                    <span>{ct.reds}🟥</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT MATCH ANALYTICS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-1.5 text-blue-500 font-semibold text-xs tracking-wider uppercase mb-1">
            <Activity className="h-4 w-4" />
            <span>Resultados de Liga</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans mb-4">
            Análisis de Encuentros
          </h3>

          <div className="flex flex-col gap-3">
            {matchPerformance.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">No hay partidos registrados</p>
            ) : (
              matchPerformance.map((matchData) => {
                const totalScored = matchData.golesLocal + matchData.golesVisitante;
                return (
                  <div 
                    key={matchData.partido} 
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-mono">
                      <span>{matchData.jornada}</span>
                      <span>{matchData.fecha}</span>
                    </div>

                    <div className="font-bold text-xs text-slate-800 dark:text-white truncate mb-1.5">
                      {matchData.partido}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/50 dark:border-slate-850/50 pt-2 text-[11px]">
                      <div className="font-mono text-slate-500 truncate mr-2">
                        🏟️ {matchData.campo}
                      </div>
                      <div className="inline-flex items-center gap-1.5 font-bold font-mono px-2 py-0.5 rounded-full bg-teal-500 text-slate-950">
                        {matchData.resultado}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 font-mono text-right">
                      Goles totales producidos: {totalScored}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
