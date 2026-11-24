import React, { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Keep dismissed by default so it never blocks or annoys the user
    const dismissed = localStorage.getItem('moon_app_pwa_dismissed');
    if (!dismissed) {
      localStorage.setItem('moon_app_pwa_dismissed', 'true');
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('moon_app_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn">
      <div className="bg-[#121214]/95 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 relative text-xs">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-neutral-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/[0.04] text-[#E6CA65] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white text-xs">Instalar Moon Calendar</div>
            <div className="text-[11px] text-neutral-400">Acesso rápido na Tela Inicial</div>
          </div>
        </div>
      </div>
    </div>
  );
};
