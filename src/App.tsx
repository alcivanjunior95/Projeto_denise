/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Save, Table as TableIcon, X, Layout, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { exportToExcel, downloadExcel } from './utils/excelExport.ts';
import { exportToPDF } from './utils/pdfExport.ts';
import { cn } from './utils/cn.ts';

interface Column {
  id: string;
  name: string;
}

interface Row {
  id: string;
  [key: string]: any;
}

export default function App() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'col-1', name: 'Nome' },
    { id: 'col-2', name: 'Email' },
  ]);
  const [rows, setRows] = useState<Row[]>([
    { id: 'row-1', 'col-1': 'João Silva', 'col-2': 'joao@exemplo.com' },
  ]);
  const [isSaved, setIsSaved] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);
  const [exportFileName, setExportFileName] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('grid-data');
    if (savedData) {
      try {
        const { columns: savedCols, rows: savedRows } = JSON.parse(savedData);
        setColumns(savedCols);
        setRows(savedRows);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('grid-data', JSON.stringify({ columns, rows }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const triggerFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleExport = () => {
    setExportType('excel');
    setExportFileName('meu-relatorio');
    setShowExportModal(true);
  };

  const handleExportPDF = () => {
    setExportType('pdf');
    setExportFileName('meu-relatorio');
    setShowExportModal(true);
  };

  const confirmExport = async () => {
    if (!exportFileName.trim()) return;
    
    const columnNames = columns.map(c => c.name);
    const exportData = rows.map(row => {
      const formattedRow: Record<string, any> = {};
      columns.forEach(col => {
        formattedRow[col.name] = row[col.id] || '';
      });
      return formattedRow;
    });

    const finalFileName = exportFileName.trim();

    if (exportType === 'excel') {
      const buffer = await exportToExcel(columnNames, exportData, `${finalFileName}.xlsx`);
      downloadExcel(buffer, `${finalFileName}.xlsx`);
    } else if (exportType === 'pdf') {
      exportToPDF(columnNames, exportData, `${finalFileName}.pdf`);
    }

    setShowExportModal(false);
    setShowSuccessMessage(true);
    triggerFireworks();
    setTimeout(() => setShowSuccessMessage(false), 8000);
  };

  const addColumn = () => {
    if (!newColName.trim()) return;
    const newId = `col-${Date.now()}`;
    setColumns([...columns, { id: newId, name: newColName }]);
    setNewColName('');
    setShowAddCol(false);
  };

  const deleteColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
    // Clean up row data for this column
    setRows(rows.map(row => {
      const { [id]: _, ...rest } = row;
      return rest as Row;
    }));
  };

  const addRow = () => {
    const newId = `row-${Date.now()}`;
    const newRow: Row = { id: newId };
    columns.forEach(col => {
      newRow[col.id] = '';
    });
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateCell = (rowId: string, colId: string, value: string) => {
    setRows(rows.map(row => 
      row.id === rowId ? { ...row, [colId]: value } : row
    ));
  };

  return (
    <div className="min-h-screen bg-navy p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm flex items-center justify-center p-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-aqua">
                  <path d="M21 5c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z" />
                  <path d="M3 5v14c0 1.66 4 3 9 3" />
                  <path d="M21 5v7" />
                  <path d="M3 12c0 1.66 4 3 9 3" />
                  <circle cx="18" cy="18" r="4" fill="transparent" stroke="currentColor" />
                  <path d="M18 20v-4" />
                  <path d="M16 18l2-2 2 2" />
                </svg>
              </div>
              Sistema da Denise
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                isSaved 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-sm"
              )}
            >
              {isSaved ? <span className="flex items-center gap-2">Salvo!</span> : <><Save size={18} /> Salvar</>}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-aqua text-navy rounded-lg font-medium hover:bg-aqua/90 transition-all shadow-lg shadow-aqua/20"
            >
              <Download size={18} /> Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-all shadow-lg"
            >
              <FileText size={18} /> PDF
            </button>
          </div>
        </header>

        {/* Export Filename Modal */}
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Save className="text-aqua" size={20} />
                    Nome do Arquivo
                  </h3>
                  <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-zinc-300">
                    <X size={24} />
                  </button>
                </div>
                
                <p className="text-zinc-400 text-sm mb-4">
                  Como você gostaria de nomear seu relatório {exportType === 'excel' ? 'Excel' : 'PDF'}?
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Ex: relatorio-vendas-fevereiro"
                      value={exportFileName}
                      onChange={(e) => setExportFileName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmExport()}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-aqua/20 focus:border-aqua transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
                      .{exportType === 'excel' ? 'xlsx' : 'pdf'}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmExport}
                      className="flex-1 px-4 py-3 bg-aqua text-navy rounded-xl hover:bg-aqua/90 transition-colors font-bold shadow-lg shadow-aqua/20"
                    >
                      Gerar Relatório
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-navy/80 border-2 border-aqua/50 text-aqua p-6 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(79,209,197,0.3)] backdrop-blur-xl z-50 relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-aqua/20 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={24} className="text-aqua" />
                </div>
                <p className="font-bold text-lg md:text-xl tracking-tight">
                  Obrigado Denise! O relatório foi gerado com sucesso, o mesmo encontra-se em downloads.
                </p>
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="text-aqua/60 hover:text-aqua transition-colors p-2"
              >
                <X size={24} />
              </button>
              
              {/* Subtle animated border effect */}
              <motion.div 
                className="absolute inset-0 border-2 border-aqua/20 rounded-2xl"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={() => setShowAddCol(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-md hover:border-aqua hover:text-aqua transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Nova Coluna
          </button>
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-md hover:border-aqua hover:text-aqua transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Novo Registro
          </button>
        </div>

        {/* Add Column Modal/Popover */}
        <AnimatePresence>
          {showAddCol && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900 p-4 rounded-xl border border-white/10 shadow-2xl max-w-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Nova Coluna</h3>
                <button onClick={() => setShowAddCol(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome da coluna..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-aqua/20 focus:border-aqua"
                />
                <button
                  onClick={addColumn}
                  className="px-4 py-2 bg-aqua text-navy rounded-lg hover:bg-aqua/90 transition-colors font-medium"
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Container */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 w-12"></th>
                  {columns.map((col) => (
                    <th key={col.id} className="p-4 group relative min-w-[200px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-aqua uppercase text-xs tracking-wider">
                          {col.name}
                        </span>
                        <button
                          onClick={() => deleteColumn(col.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all rounded"
                          title="Excluir coluna"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 2} className="p-12 text-center text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <TableIcon size={40} className="opacity-20" />
                          <p>Nenhum registro encontrado. Adicione um novo para começar.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-center">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-500">
                            {rows.indexOf(row) + 1}
                          </div>
                        </td>
                        {columns.map((col) => (
                          <td key={col.id} className="p-2">
                            <input
                              type="text"
                              value={row[col.id] || ''}
                              onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                              className="w-full px-3 py-2 bg-transparent border border-transparent hover:border-white/10 focus:border-aqua focus:bg-white/5 text-white rounded-lg transition-all focus:outline-none"
                              placeholder="..."
                            />
                          </td>
                        ))}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Excluir registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Footer Stats */}
          <div className="p-4 bg-black/20 border-t border-white/10 flex justify-between items-center text-xs text-zinc-500 font-medium">
            <div className="flex gap-4">
              <span className="text-aqua/70">{columns.length} Colunas</span>
              <span className="text-aqua/70">{rows.length} Registros</span>
            </div>
            <div className="opacity-50">
              Última alteração: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
