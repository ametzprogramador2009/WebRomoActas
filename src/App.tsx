/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MatchRecord } from './types';
import { parseCSV } from './utils';
import { FALLBACK_RECORDS } from './dataMock';
import Header from './components/Header';
import StatSummary from './components/StatSummary';
import TableTab from './components/TableTab';
import ChartsTab from './components/ChartsTab';
import SheetsLinkAssistant from './components/SheetsLinkAssistant';
import { 
  BarChart3, 
  TableProperties, 
  AlertTriangle,
  Flame,
  Info,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  const [usingBackup, setUsingBackup] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Spreadsheet URL state with localStorage backup
  const DEFAULT_SPREADSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1nQdo8ojEXAIM2HnflujqtEmYnvWdQTf3BQAO9Nu5DLU/export?format=csv';
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(() => {
    return localStorage.getItem('custom_sheet_csv_url') || DEFAULT_SPREADSHEET_CSV_URL;
  });

  // Fetch logic
  const fetchSpreadsheetData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(spreadsheetUrl);
      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
      
      if (parsed.length === 0) {
        throw new Error("No se encontraron registros de fútbol válidos en la respuesta.");
      }

      setRecords(parsed);
      setUsingBackup(false);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn("Error fetching dynamic Google sheet data, using backup:", err);
      // Seamlessly fall back to preloaded database
      setRecords(FALLBACK_RECORDS);
      setUsingBackup(true);
      setError(err?.message || "Error al conectar con Google Sheets.");
      setLastSync("Backup local activo");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [spreadsheetUrl]);

  // Initial fetch on mount or sheet URL change
  useEffect(() => {
    fetchSpreadsheetData();
  }, [fetchSpreadsheetData]);

  // Test Connection helper for the Assistant
  const handleTestConnection = useCallback(async (testUrl: string) => {
    try {
      const response = await fetch(testUrl);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            message: 'Acceso No Autorizado (Error 401/403). La hoja de cálculo es de acceso privado. Asegúrate de volver a tu hoja original y cambiar el "Acceso general" a "Cualquier persona con el enlace" con el rol de "Lector" (Viewer).'
          };
        }
        return {
          success: false,
          message: `El servidor respondió con código ${response.status}: ${response.statusText}. Verifica que el enlace sea correcto.`
        };
      }
      const text = await response.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        return {
          success: false,
          message: 'Conexión establecida, pero no se encontró la cabecera o registros válidos que coincidan con la plantilla de estadísticas del equipo Romo F.C.'
        };
      }
      return {
        success: true,
        message: '¡Conexión establecida con éxito! Los datos deportivos se guardaron y se sincronizaron en tiempo real.',
        rowsCount: parsed.length
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error de Red / CORS (${err?.message || 'Fallo de conexión'}). Esto ocurre casi siempre cuando el acceso al documento de Google está restringido a tu cuenta personal y el navegador bloquea la consulta cruzada por seguridad. Cambia el acceso general a público para solucionarlo.`
      };
    }
  }, []);

  const handleUrlChange = (newUrl: string) => {
    localStorage.setItem('custom_sheet_csv_url', newUrl);
    setSpreadsheetUrl(newUrl);
  };

  // Handle reload action
  const handleReload = () => {
    fetchSpreadsheetData(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-all">
      
      {/* Top Header Panel */}
      <Header 
        onRefresh={handleReload} 
        isRefreshed={isRefreshing} 
        lastUpdated={lastSync} 
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
        
        {/* Google Sheets Link & Permission Assistant */}
        <SheetsLinkAssistant
          currentUrl={spreadsheetUrl}
          onUrlChange={handleUrlChange}
          onTestConnection={handleTestConnection}
          usingBackup={usingBackup}
          errorDetail={error}
        />

        {/* Connection status alerts in sandboxes */}
        {usingBackup && (
          <div className="bg-amber-500/10 border border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-400 p-3.5 rounded-xl text-xs flex items-center md:items-start gap-3 shadow-sm">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Aviso de Entorno Restringido (Google Sheets Privado):</span>{" "}
              Se están visualizando <span className="font-semibold underline">datos locales pregrabados</span> porque la API de Google Sheets rechazó la consulta (generalmente debido a que el documento es privado). Sigue los pasos indicados en el <strong>Asistente</strong> superior para cambiar los permisos de compartir a público en 10 segundos y activar la sincronización.
            </div>
            <button 
              onClick={handleReload} 
              className="cursor-pointer shrink-0 ml-auto bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-2.5 py-1.5 rounded-lg transition-all text-[11px]"
            >
              Forzar Reintento
            </button>
          </div>
        )}

        {/* Loading overlay panel */}
        {loading ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative">
              <span className="relative flex h-14 w-14">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-20"></span>
                <span className="relative inline-flex rounded-full h-14 w-14 bg-teal-500/10 border-2 border-teal-500 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-teal-400 animate-pulse stroke-[2.5]" />
                </span>
              </span>
            </div>
            
            <div className="max-w-xs">
              <p className="font-bold text-slate-800 dark:text-white text-sm">Sincronizando con Google Sheet...</p>
              <p className="text-xs text-slate-400 mt-1">Conectando con la API de visualización de Google para bajar alineaciones en tiempo real.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            
            {/* Top Cards Totals Strip */}
            <StatSummary records={records} />

            {/* View Switch Tab Headers */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 rounded-xl shadow-sm w-full sm:w-auto self-start">
              <div className="flex gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs transition-all w-full sm:w-auto ${
                    activeTab === 'table'
                      ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <TableProperties className="h-4 w-4" />
                  <span>Vista de Tabla</span>
                </button>
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs transition-all w-full sm:w-auto ${
                    activeTab === 'charts'
                      ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Panel de Gráficos</span>
                </button>
              </div>
            </div>

            {/* Panel Body Layout with Transitions */}
            <div className="min-h-[450px]">
              <AnimatePresence mode="wait">
                {activeTab === 'table' ? (
                  <motion.div
                    key="table-p"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <TableTab records={records} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="charts-p"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <ChartsTab records={records} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        )}
      </main>

      {/* Humble Footer Area */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/80 py-4 px-6 text-center text-slate-400 text-[10px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-mono">
            Conexión Segura de Google Sheets | Romo F.C. Analytics &copy; 2026
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Info className="h-3 w-3 shrink-0 text-teal-500" />
            <span>Datos procesados de forma local para máxima privacidad.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
