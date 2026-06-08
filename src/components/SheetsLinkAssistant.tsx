/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Settings,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SheetsLinkAssistantProps {
  currentUrl: string;
  onUrlChange: (newUrl: string) => void;
  onTestConnection: (testUrl: string) => Promise<{ success: boolean; message: string; rowsCount?: number }>;
  usingBackup: boolean;
  errorDetail: string | null;
}

export default function SheetsLinkAssistant({
  currentUrl,
  onUrlChange,
  onTestConnection,
  usingBackup,
  errorDetail
}: SheetsLinkAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowsCount?: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'diagnose'>('methods');

  // Extracts spreadsheet ID if user pastes entire URL
  const extractSpreadsheetId = (url: string) => {
    const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : url;
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    // Clean or build correct CSV export URL if just raw editor link is provided
    let urlToTest = inputValue.trim();
    if (urlToTest.includes('docs.google.com/spreadsheets')) {
      const id = extractSpreadsheetId(urlToTest);
      urlToTest = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
    }

    try {
      const res = await onTestConnection(urlToTest);
      setTestResult(res);
      if (res.success) {
        onUrlChange(urlToTest);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Error desconocido al probar la conexión.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="sheets-assistant-container" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Header section toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 md:p-5 cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center ${usingBackup ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm md:text-base text-slate-800 dark:text-white">
                Asistente de Vinculación de Google Sheets
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                usingBackup 
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400' 
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400'
              }`}>
                {usingBackup ? 'Privada / Desconectada' : '¡Vinculada con Éxito!'}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {usingBackup 
                ? 'La hoja de cálculo está privada. Configura los permisos para solucionar el error.' 
                : 'La aplicación está leyendo datos en tiempo real de tu Google Sheet.'}
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all p-1">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-4 md:p-6 flex flex-col gap-5">
              
              {/* Form Input for testing links */}
              <form onSubmit={handleTest} className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Enlace de tu Hoja de Cálculo de Google:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-mono"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1nQdo..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      {usingBackup ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isTesting || !inputValue}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white dark:text-slate-950 font-bold text-xs transition-all tracking-wide disabled:cursor-not-allowed shrink-0 shadow-sm"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Probando...</span>
                      </>
                    ) : (
                      <>
                        <Settings className="h-3.5 w-3.5" />
                        <span>Probar y Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Dynamic feedback test results */}
              {testResult && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                    testResult.success 
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/60' 
                      : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/60'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold mb-0.5">
                      {testResult.success ? '¡Conexión Exitosa!' : 'Error de Conexión Detectado'}
                    </p>
                    <p className="leading-relaxed opacity-90">{testResult.message}</p>
                    {testResult.rowsCount && (
                      <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                        {`✓ Se han importado correctamente ${testResult.rowsCount} registros de rendimiento (líneas de datos).`}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step tabs to configure correctly */}
              {usingBackup && !testResult?.success && (
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-4 pb-1">
                    <button
                      onClick={() => setActiveTab('methods')}
                      className={`pb-2.5 font-bold text-xs select-none relative ${
                        activeTab === 'methods' 
                          ? 'text-teal-600 dark:text-teal-400' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span>Método 1: Cambiar Permisos (Recomendado)</span>
                      {activeTab === 'methods' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500" />}
                    </button>
                    <button
                      onClick={() => setActiveTab('diagnose')}
                      className={`pb-2.5 font-bold text-xs select-none relative ${
                        activeTab === 'diagnose' 
                          ? 'text-teal-600 dark:text-teal-400' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span>Método 2: Publicar en la Web</span>
                      {activeTab === 'diagnose' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500" />}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'methods' ? (
                      <motion.div
                        key="methods-panel"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-3"
                      >
                        <p className="leading-relaxed">
                          Google no permite leer la hoja porque está configurada como <strong className="text-amber-500">Privada</strong> en tu cuenta. Para permitir que la Web App extraiga los datos, sigue estos pasos:
                        </p>
                        
                        <div className="flex flex-col gap-2.5 mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">1</span>
                            <span>Haz clic en <a href="https://docs.google.com/spreadsheets/d/1nQdo8ojEXAIM2HnflujqtEmYnvWdQTf3BQAO9Nu5DLU/" target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 underline font-semibold flex items-center gap-1 inline-flex hover:text-teal-500">Abrir Google Sheet original <ExternalLink className="h-3 w-3 inline" /></a>.</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">2</span>
                            <span>Pulsa el botón azul de la esquina superior derecha que dice <strong className="text-slate-800 dark:text-white">Compartir (Share)</strong>.</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">3</span>
                            <span>Bajo la sección <strong className="text-slate-800 dark:text-white">"Acceso General"</strong> (General Access), cambia de <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Restringido</span> a <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Cualquier persona con el enlace</span> (Anyone with the link).</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">4</span>
                            <span>Asegúrate de que el rol de la derecha esté configurado como <strong className="text-slate-800 dark:text-white">Lector (Viewer)</strong> (para mantener tu hoja protegida contra cambios externos).</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">5</span>
                            <span>Haz clic en <strong className="text-slate-800 dark:text-white">Hecho (Done)</strong> para guardar los cambios de privacidad.</span>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 p-2 px-3 border border-indigo-200 dark:border-indigo-950/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 rounded-lg">
                          <Sparkles className="h-4.5 w-4.5 shrink-0 text-indigo-500" />
                          <span>Una vez hecho, vuelve a pulsar el gran botón de <strong>"Probar y Guardar"</strong> arriba para verificar la conexión en tiempo real.</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="diagnose-panel"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-3"
                      >
                        <p className="leading-relaxed">
                          Otra alternativa ágil es publicar el documento en formato web para que Google exponga un enlace CSV público para el tablero:
                        </p>

                        <div className="flex flex-col gap-2.5 mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">1</span>
                            <span>Abre tu hoja de cálculo e ingresa al menú superior: <strong className="text-slate-800 dark:text-white">Archivo (File) &gt; Compartir (Share) &gt; Publicar en la Web (Publish to the web)</strong>.</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">2</span>
                            <span>En la pestaña de publicación, selecciona <strong className="text-slate-800 dark:text-white">Valores separados por comas (.csv)</strong> como formato de exportación.</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">3</span>
                            <span>Haz clic en el botón verde <strong className="text-slate-800 dark:text-white">Publicar (Publish)</strong> y confirma el cuadro de diálogo.</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 items-center justify-center font-bold text-[10px]">4</span>
                            <span>Copia el enlace generado de tipo <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">https://docs.google.com/spreadsheets/d/e/.../pub?output=csv</code>, pégalo arriba, y haz clic en <strong>Probar y Guardar</strong>.</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
