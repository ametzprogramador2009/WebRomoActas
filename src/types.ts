/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MatchRecord {
  id: string; // generated client-side id
  temporada: string;
  fecha: string;
  competicion: string;
  campo: string;
  equipoLocal: string;
  equipoVisitante: string;
  jornada: string;
  partido: string;
  golesLocal: number;
  golesVisitante: number;
  resultado: string;
  equipo: string;
  dorsal: number;
  jugador: string;
  titular: boolean;
  suplente: boolean;
  minutosJugados: number;
  golesAnotados: number;
  tarjetaAmarilla: number;
  dobleAmarilla: number;
  tarjetaRoja: number;
}

export interface FilterState {
  searchQuery: string;
  temporada: string;
  campo: string;
  equipo: string;
  jornada: string;
  jugador: string;
}

export interface SortState {
  column: keyof MatchRecord | '';
  direction: 'asc' | 'desc';
}

export interface PlayerStats {
  jugador: string;
  equipo: string;
  goles: number;
  minutos: number;
  partidos: number;
  titularidades: number;
  suplencias: number;
  tarjetasAmarillas: number;
  doblesAmarillas: number;
  tarjetasRojas: number;
}
