/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchRecord, PlayerStats } from './types';

/**
 * Parses double-quoted CSV line format.
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Converts a raw Google Sheet CSV string into structured MatchRecord objects.
 */
export function parseCSV(text: string): MatchRecord[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const rawHeaders = splitCSVLine(lines[0]);
  const headers = rawHeaders.map(h => h.trim().replace(/^"|"$/g, ''));

  const records: MatchRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = splitCSVLine(line).map(c => c.trim().replace(/^"|"$/g, ''));
    if (cells.length < headers.length) continue;

    const getVal = (headerName: string) => {
      const idx = headers.indexOf(headerName);
      return idx !== -1 ? cells[idx] : '';
    };

    const getNum = (headerName: string) => {
      const val = getVal(headerName);
      return parseInt(val) || 0;
    };

    const jugador = getVal('Jugador');
    if (!jugador) continue; // Skip entries without a player name

    records.push({
      id: `${i}-${jugador}-${getVal('Fecha')}`,
      temporada: getVal('Temporada'),
      fecha: getVal('Fecha'),
      competicion: getVal('Competición') || getVal('Competición') || 'LIGA VASCA',
      campo: getVal('Campo'),
      equipoLocal: getVal('Equipo Local'),
      equipoVisitante: getVal('Equipo Visitante'),
      jornada: getVal('Jornada'),
      partido: getVal('Partido'),
      golesLocal: getNum('Goles Local'),
      golesVisitante: getNum('Goles Visitante'),
      resultado: getVal('Resultado'),
      equipo: getVal('Equipo'),
      dorsal: getNum('Dorsal'),
      jugador,
      titular: getNum('Titular') === 1,
      suplente: getNum('Suplente') === 1,
      minutosJugados: getNum('Minutos Jugados'),
      golesAnotados: getNum('Goles Anotados'),
      tarjetaAmarilla: getNum('Tarjeta Amarilla'),
      dobleAmarilla: getNum('Doble Amarilla'),
      tarjetaRoja: getNum('Tarjeta Roja'),
    });
  }

  return records;
}

/**
 * Aggregates individual match records into player-level seasonal statistics.
 */
export function calculatePlayerStats(records: MatchRecord[]): PlayerStats[] {
  const playerMap = new Map<string, PlayerStats>();

  records.forEach(r => {
    const key = `${r.jugador} (${r.equipo})`;
    let stat = playerMap.get(key);
    if (!stat) {
      stat = {
        jugador: r.jugador,
        equipo: r.equipo,
        goles: 0,
        minutos: 0,
        partidos: 0,
        titularidades: 0,
        suplencias: 0,
        tarjetasAmarillas: 0,
        doblesAmarillas: 0,
        tarjetasRojas: 0,
      };
      playerMap.set(key, stat);
    }

    stat.goles += r.golesAnotados;
    stat.minutos += r.minutosJugados;
    stat.partidos += r.minutosJugados > 0 ? 1 : 0;
    stat.titularidades += r.titular ? 1 : 0;
    stat.suplencias += r.suplente ? 1 : 0;
    stat.tarjetasAmarillas += r.tarjetaAmarilla;
    stat.doblesAmarillas += r.dobleAmarilla;
    stat.tarjetasRojas += r.tarjetaRoja;
  });

  return Array.from(playerMap.values());
}
