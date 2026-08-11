import React, { useState, useEffect } from 'react';
import { Smartphone, Share, X, Download } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const dismissed = localStorage.getItem('moon_app_pwa_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('moon_app_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn">
      <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3 relative text-xs">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-xl bg-white/5 text-neutral-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Instalar Moon Calendar</div>
            <div className="text-[11px] text-neutral-400">Acesso rápido na Tela Inicial como app nativo</div>
          </div>
        </div>

        {isIOS ? (
          <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-neutral-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
              <Share className="w-3.5 h-3.5 text-white" /> Passo a passo no iPhone / iPad:
            </div>
            <ol className="list-decimal list-inside text-[11px] text-neutral-400 space-y-0.5">
              <li>Toque no ícone de <strong>Compartilhar</strong> (barra inferior do Safari)</li>
              <li>Role para baixo e selecione <strong>Adicionar à Tela de Início ➕</strong></li>
            </ol>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-neutral-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
              <Download className="w-3.5 h-3.5 text-white" /> Passo a passo no Android:
            </div>
            <p className="text-[11px] text-neutral-400">
              Toque no menu do Chrome (3 pontos) e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
