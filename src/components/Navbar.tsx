import React, { useState, useRef, useEffect } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { t } from '../utils/i18n';
import {
  Moon,
  Calendar,
  Sparkles,
  Sun,
  BookOpen,
  Settings,
  MapPin,
  ChevronDown,
  Compass,
  LayoutGrid,
  HeartHandshake,
  Target,
  Flame,
  HeartPulse,
  BarChart3,
  Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Primary top-level navigation tabs
  const mainNavItems = [
    { id: 'dashboard', label: t('tabDashboard', lang), icon: Moon },
    { id: 'calendar', label: t('tabCalendar', lang), icon: Calendar },
    { id: 'astrology', label: t('tabAstrology', lang), icon: Sparkles },
    { id: 'horoscope', label: t('tabHoroscope', lang), icon: Sun },
    { id: 'journal', label: t('tabJournal', lang), icon: BookOpen },
  ];

  // Secondary tools in the "Mais" dropdown
  const secondaryNavItems = [
    { id: 'transits', label: 'Trânsitos Planetários', icon: Compass, category: 'Astrologia' },
    { id: 'synastry', label: 'Sinastria de Casal', icon: HeartHandshake, category: 'Astrologia' },
    { id: 'intentions', label: t('tabIntentions', lang), icon: Target, category: 'Práticas' },
    { id: 'rituals', label: t('tabRituals', lang), icon: Flame, category: 'Práticas' },
    { id: 'cycle', label: t('tabCycle', lang), icon: HeartPulse, category: 'Práticas' },
    { id: 'analytics', label: t('tabAnalytics', lang), icon: BarChart3, category: 'Ferramentas' },
    { id: 'widgets', label: 'Simulador de Widgets', icon: LayoutGrid, category: 'Ferramentas' },
  ];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);
  const activeSecondaryItem = secondaryNavItems.find((item) => item.id === activeTab);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
              <Moon className="w-4 h-4 fill-white/90" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Moon Calendar
            </span>
          </motion.div>

          {/* Primary Clean Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all text-neutral-300 hover:text-white"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 font-semibold" style={{ color: isActive ? '#000000' : undefined }}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Dropdown "Mais Ferramentas" */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all text-neutral-300 hover:text-white"
              >
                {isSecondaryActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 font-semibold" style={{ color: isSecondaryActive ? '#000000' : undefined }}>
                  <span>{activeSecondaryItem ? activeSecondaryItem.label : 'Mais'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-56 bg-[#1c1c1e] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-3xl"
                  >
                    <div className="text-[10px] font-bold text-neutral-400 px-3 py-1 uppercase tracking-wider">
                      Outros Módulos
                    </div>
                    <div className="space-y-0.5">
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMoreOpen(false);
                            }}
                            whileHover={{ x: 3 }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-white text-black font-semibold'
                                : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                            <span>{item.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Lunar Status Badge & Quick Controls */}
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-semibold text-white">
                {astroData.illumination}%
              </span>
              <span className="text-neutral-500">•</span>
              <span>{astroData.zodiacSymbol} {astroData.zodiacSign}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openBackupModal}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
              title="Backup & Exportação"
            >
              <Database className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openSettingsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span className="max-w-[80px] truncate text-[11px]">
                {settings.location.name}
              </span>
              <Settings className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar (Super Clean) */}
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-white/5 text-xs">
          {[...mainNavItems, ...secondaryNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold'
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
