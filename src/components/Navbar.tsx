import React from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { t } from '../utils/i18n';
import {
  Moon,
  Calendar,
  Sparkles,
  Sun,
  BookOpen,
  Target,
  Flame,
  HeartPulse,
  HeartHandshake,
  LayoutGrid,
  Compass,
  BarChart3,
  Settings,
  MapPin,
  Database,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  astroData: AstronomyData;
  settings: UserSettings;
  openSettingsModal: () => void;
  openBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  astroData,
  settings,
  openSettingsModal,
  openBackupModal,
}) => {
  const lang = settings.language;

  const navItems = [
    { id: 'dashboard', label: t('tabDashboard', lang), icon: Moon },
    { id: 'calendar', label: t('tabCalendar', lang), icon: Calendar },
    { id: 'transits', label: 'Trânsitos', icon: Compass },
    { id: 'widgets', label: 'Widgets', icon: LayoutGrid },
    { id: 'astrology', label: t('tabAstrology', lang), icon: Sparkles },
    { id: 'synastry', label: 'Sinastria', icon: HeartHandshake },
    { id: 'horoscope', label: t('tabHoroscope', lang), icon: Sun },
    { id: 'journal', label: t('tabJournal', lang), icon: BookOpen },
    { id: 'intentions', label: t('tabIntentions', lang), icon: Target },
    { id: 'rituals', label: t('tabRituals', lang), icon: Flame },
    { id: 'cycle', label: t('tabCycle', lang), icon: HeartPulse },
    { id: 'analytics', label: t('tabAnalytics', lang), icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-black/70 border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Moon className="w-3.5 h-3.5 fill-white/80" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Moon Calendar
            </span>
          </div>

          {/* Lunar Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="font-medium text-white">
              {t(astroData.phaseName, lang)} ({astroData.illumination}%)
            </span>
            <span className="text-neutral-600">•</span>
            <span>{astroData.zodiacSymbol} {astroData.zodiacSign}</span>
          </div>

          {/* Settings Actions */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={openBackupModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Backup & Exportar"
            >
              <Database className="w-3 h-3 text-neutral-400" />
              <span className="hidden sm:inline text-[11px]">Backup</span>
            </button>

            <button
              onClick={openSettingsModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span className="hidden sm:inline max-w-[90px] truncate text-[11px]">
                {settings.location.name}
              </span>
            </button>

            <button
              onClick={openSettingsModal}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Segmented Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar text-xs border-t border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
