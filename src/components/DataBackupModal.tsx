import React, { useState } from 'react';
import {
  getStoredJournal,
  getStoredIntentions,
  getStoredCycleLogs,
  getStoredSettings,
  saveStoredJournal,
  saveStoredIntentions,
  saveStoredCycleLogs,
  saveStoredSettings,
} from '../utils/storage';
import { Download, Upload, X, FileText, Database } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: getStoredSettings(),
      journal: getStoredJournal(),
      intentions: getStoredIntentions(),
      cycleLogs: getStoredCycleLogs(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moon_calendar_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const journal = getStoredJournal();
    let csvContent = 'data:text/csv;charset=utf-8,ID,Data,Titulo,Fase_Lunar,Signo_Lunar,Conteudo\n';

    journal.forEach((j) => {
      const cleanContent = `"${j.content.replace(/"/g, '""')}"`;
      csvContent += `${j.id},${j.date},"${j.title}",${j.moonPhase},${j.moonSign},${cleanContent}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `diario_lunar_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.journal) saveStoredJournal(data.journal);
        if (data.intentions) saveStoredIntentions(data.intentions);
        if (data.cycleLogs) saveStoredCycleLogs(data.cycleLogs);
        if (data.settings) saveStoredSettings(data.settings);

        setImportStatus('✅ Backup restaurado com sucesso!');
        setTimeout(() => {
          onDataRestored();
          onClose();
        }, 1200);
      } catch {
        setImportStatus('❌ Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-white/10 relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Database className="w-4 h-4 text-white" />
            <h2>Backup & Exportação de Dados</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-300">
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
            <div className="font-semibold text-white">Exportar Seus Dados</div>
            <p className="text-[11px] text-neutral-400">
              Faça o download de todos os seus diários, intenções e ciclos corporais em formato seguro.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Backup JSON
              </button>

              <button
                onClick={handleExportCSV}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" /> Diário em CSV
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
            <div className="font-semibold text-white">Restaurar de Backup</div>
            <p className="text-[11px] text-neutral-400">
              Selecione um arquivo de backup `.json` gravado anteriormente para restaurar seus registros.
            </p>

            <label className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-white" /> Selecionar Arquivo JSON
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            {importStatus && (
              <div className="text-[11px] text-center font-medium text-white bg-white/5 p-2 rounded-xl border border-white/10">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/5 text-neutral-300 border border-white/10 text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
