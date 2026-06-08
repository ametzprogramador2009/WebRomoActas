/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MatchRecord, SortState } from '../types';
import { 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  FilterX,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface TableTabProps {
  records: MatchRecord[];
}

export default function TableTab({ records }: TableTabProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTemporada, setFilterTemporada] = useState('ALL');
  const [filterCampo, setFilterCampo] = useState('ALL');
  const [filterEquipo, setFilterEquipo] = useState('ALL');
  const [filterJornada, setFilterJornada] = useState('ALL');
  const [filterTitular, setFilterTitular] = useState('ALL'); // ALL, TITULAR, SUPLENTE

  // Sorting state
  const [sortState, setSortState] = useState<SortState>({
    column: 'fecha',
    direction: 'desc'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Derive filter options dynamically from records
  const uniqueTemporadas = useMemo(() => Array.from(new Set(records.map(r => r.temporada))).filter(Boolean).sort(), [records]);
  const uniqueCampos = useMemo(() => Array.from(new Set(records.map(r => r.campo))).filter(Boolean).sort(), [records]);
  const uniqueEquipos = useMemo(() => Array.from(new Set(records.map(r => r.equipo))).filter(Boolean).sort(), [records]);
  const uniqueJornadas = useMemo(() => Array.from(new Set(records.map(r => r.jornada))).filter(Boolean).sort((a,b) => {
    // Custom sort for Jornada 1, Jornada 2 etc
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  }), [records]);

  // Handle Sort Toggle
  const handleSort = (column: keyof MatchRecord) => {
    setSortState(prev => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        column,
        direction: 'desc'
      };
    });
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterTemporada('ALL');
    setFilterCampo('ALL');
    setFilterEquipo('ALL');
    setFilterJornada('ALL');
    setFilterTitular('ALL');
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // Search query: check player, stadium, match, or result
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.jugador.toLowerCase().includes(q) ||
        r.partido.toLowerCase().includes(q) ||
        r.campo.toLowerCase().includes(q) ||
        r.equipo.toLowerCase().includes(q)
      );
    }

    // Dropdown Filters
    if (filterTemporada !== 'ALL') {
      result = result.filter(r => r.temporada === filterTemporada);
    }
    if (filterCampo !== 'ALL') {
      result = result.filter(r => r.campo === filterCampo);
    }
    if (filterEquipo !== 'ALL') {
      result = result.filter(r => r.equipo === filterEquipo);
    }
    if (filterJornada !== 'ALL') {
      result = result.filter(r => r.jornada === filterJornada);
    }
    if (filterTitular !== 'ALL') {
      const isTitular = filterTitular === 'TITULAR';
      result = result.filter(r => isTitular ? r.titular : r.suplente);
    }

    // Sorting
    const { column, direction } = sortState;
    if (column) {
      result.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return direction === 'asc' 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          const numA = valA ? 1 : 0;
          const numB = valB ? 1 : 0;
          return direction === 'asc' ? numA - numB : numB - numA;
        }

        // Numbers or other comparable types
        const numA = (valA as number) || 0;
        const numB = (valB as number) || 0;
        return direction === 'asc' ? numA - numB : numB - numA;
      });
    }

    return result;
  }, [records, searchQuery, filterTemporada, filterCampo, filterEquipo, filterJornada, filterTitular, sortState]);

  // Pagination logic
  const totalRows = filteredAndSortedRecords.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRecords.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredAndSortedRecords, currentPage, rowsPerPage]);

  const startRowIndex = (currentPage - 1) * rowsPerPage + 1;
  const endRowIndex = Math.min(currentPage * rowsPerPage, totalRows);

  const renderSortIcon = (column: keyof MatchRecord) => {
    if (sortState.column !== column) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortState.direction === 'asc' 
      ? <ChevronUp className="h-3.5 w-3.5 text-teal-500 font-bold" />
      : <ChevronDown className="h-3.5 w-3.5 text-teal-500 font-bold" />;
  };

  const isCurrentFilterActive = 
    searchQuery !== '' || 
    filterTemporada !== 'ALL' || 
    filterCampo !== 'ALL' || 
    filterEquipo !== 'ALL' || 
    filterJornada !== 'ALL' || 
    filterTitular !== 'ALL';

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filters Controls card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-semibold">
          <ListFilter className="h-4 w-4 text-teal-500" />
          <span>Filtros de Búsqueda</span>
          {isCurrentFilterActive && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* General Search */}
          <div className="relative lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Buscar jugador o partido
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre, club, campo..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Temporada Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Temporada
            </label>
            <select
              value={filterTemporada}
              onChange={(e) => {
                setFilterTemporada(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="ALL">Todas</option>
              {uniqueTemporadas.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Campo Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Campo
            </label>
            <select
              value={filterCampo}
              onChange={(e) => {
                setFilterCampo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="ALL">Todos los campos</option>
              {uniqueCampos.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Equipo Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Equipo Jugador
            </label>
            <select
              value={filterEquipo}
              onChange={(e) => {
                setFilterEquipo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="ALL">Todos los equipos</option>
              {uniqueEquipos.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          {/* Jornada Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Jornada
            </label>
            <select
              value={filterJornada}
              onChange={(e) => {
                setFilterJornada(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            >
              <option value="ALL">Todas</option>
              {uniqueJornadas.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table header status bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold">
              DATOS EN VIVO
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mostrando <strong className="text-slate-900 dark:text-white">{totalRows === 0 ? 0 : startRowIndex}-{endRowIndex}</strong> de <strong className="text-slate-900 dark:text-white">{totalRows}</strong> alineaciones
            </p>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400 font-medium font-sans">
            <span>Filas por página:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Scrollable container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800/60 select-none">
                {/* Headers with actions */}
                <th 
                  onClick={() => handleSort('fecha')} 
                  className="px-5 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Fecha {renderSortIcon('fecha')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('jornada')} 
                  className="px-4 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Jornada {renderSortIcon('jornada')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('partido')} 
                  className="px-4 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 min-w-[150px]"
                >
                  <div className="flex items-center gap-1.5">
                    Partido {renderSortIcon('partido')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('jugador')} 
                  className="px-4 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 min-w-[180px]"
                >
                  <div className="flex items-center gap-1.5">
                    Jugador {renderSortIcon('jugador')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('dorsal')} 
                  className="px-3 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-center whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    Dorsal {renderSortIcon('dorsal')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('equipo')} 
                  className="px-4 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Club {renderSortIcon('equipo')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center whitespace-nowrap"
                >
                  Ruptura
                </th>
                <th 
                  onClick={() => handleSort('minutosJugados')} 
                  className="px-3 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-center whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    Minutos {renderSortIcon('minutosJugados')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('golesAnotados')} 
                  className="px-3 py-3 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-center whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    Goles {renderSortIcon('golesAnotados')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center whitespace-nowrap"
                >
                  Tarjetas
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto flex flex-col items-center gap-2">
                      <HelpCircle className="h-8 w-8 text-slate-300" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Sin alineaciones encontradas</p>
                      <p className="text-[11px]">Prueba escribiendo otra palabra de búsqueda o reseteando los filtros.</p>
                      <button 
                        onClick={resetFilters}
                        className="cursor-pointer mt-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 font-semibold transition-all border border-teal-100 dark:border-teal-900/50"
                      >
                        Reiniciar Búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, i) => {
                  return (
                    <tr 
                      key={r.id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/10 even:bg-slate-50/30 dark:even:bg-slate-900/10 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {r.fecha}
                      </td>

                      {/* Matchday */}
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {r.jornada}
                      </td>

                      {/* Match & score */}
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex flex-col">
                          <span>{r.partido}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Campo: {r.campo} | <strong className="text-teal-500 font-bold">{r.resultado}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Player */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {r.jugador}
                      </td>

                      {/* Shirt # */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                          {r.dorsal || '-'}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            r.equipo === 'ROMO F.C.' ? 'bg-teal-500 shadow-sm shadow-teal-500/50' : 
                            r.equipo === 'BEASAIN, S.D.' ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-blue-500'
                          }`} />
                          {r.equipo}
                        </span>
                      </td>

                      {/* Lineup Badge */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {r.titular ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200/40 dark:ring-emerald-900/30">
                            <CheckCircle className="h-3 w-3" />
                            Titular
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200/50 dark:ring-slate-700">
                            Suplente
                          </span>
                        )}
                      </td>

                      {/* Minutes Played */}
                      <td className="px-3 py-3 text-center font-mono font-medium text-slate-600 dark:text-slate-300">
                        {r.minutosJugados}
                      </td>

                      {/* Goals Scored */}
                      <td className="px-3 py-3 text-center">
                        {r.golesAnotados > 0 ? (
                          <span className="inline-flex items-center justify-center font-extrabold text-[12px] h-6 w-6 rounded-full bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/20" title={`${r.golesAnotados} gol(es) anotado(s)`}>
                            {r.golesAnotados}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 font-mono">-</span>
                        )}
                      </td>

                      {/* Bookings / Cards */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {r.tarjetaAmarilla > 0 && (
                            <span 
                              className="inline-block w-3.5 h-4.5 rounded-[2px] bg-amber-400 border border-amber-500 shadow-sm cursor-help"
                              title={`${r.tarjetaAmarilla} Tarjeta Amarilla`}
                            />
                          )}
                          {r.dobleAmarilla > 0 && (
                            <div className="flex gap-[1px]">
                              <span className="inline-block w-3.5 h-4.5 rounded-[2px] bg-amber-400 border border-amber-500 shadow-sm" />
                              <span className="inline-block w-3.5 h-4.5 rounded-[2px] bg-amber-400 border border-amber-500 shadow-sm" />
                            </div>
                          )}
                          {r.tarjetaRoja > 0 && (
                            <span 
                              className="inline-block w-3.5 h-4.5 rounded-[2px] bg-red-500 border border-red-600 shadow-sm cursor-help"
                              title="Tarjeta Roja Directa"
                            />
                          )}
                          {r.tarjetaAmarilla === 0 && r.dobleAmarilla === 0 && r.tarjetaRoja === 0 && (
                            <span className="text-slate-300 dark:text-slate-700 font-mono">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Paginator Controls */}
        {totalRows > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Viendo página <strong className="text-slate-800 dark:text-white">{currentPage}</strong> de <strong className="text-slate-800 dark:text-white">{totalPages}</strong> ({totalRows} alineaciones totales)
            </span>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 px-1.5 rounded text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-45 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 transition-all select-none cursor-pointer"
              >
                Primero
              </button>

              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page indicator pills */}
              <div className="hidden sm:flex items-center gap-1 px-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Guard boundary
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`cursor-pointer inline-flex items-center justify-center font-semibold text-xs rounded-lg transition-all h-7 w-7 ${
                        currentPage === pageNum
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm shadow-teal-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 px-1.5 rounded text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-45 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 transition-all select-none cursor-pointer"
              >
                Último ({totalPages})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
