import { useState, useEffect } from 'react';
import type { AstronomyData, NatalChart, UserSettings } from './types';
import { getStoredSettings, saveStoredSettings } from './utils/storage';
import { getAstronomyData } from './utils/astronomy';
import { Navbar } from './components/Navbar';
import { LunarDashboard } from './components/LunarDashboard';
import { CalendarView } from './components/CalendarView';
import { TransitsView } from './components/TransitsView';
import { WidgetSimulator } from './components/WidgetSimulator';
import { AstrologyChart } from './components/AstrologyChart';
import { SynastryChart } from './components/SynastryChart';
import { DailyHoroscope } from './components/DailyHoroscope';
import { LunarJournal } from './components/LunarJournal';
import { IntentionsTracker } from './components/IntentionsTracker';
import { RitualsLibrary } from './components/RitualsLibrary';
import { CycleTracker } from './components/CycleTracker';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { DayDetailsModal } from './components/DayDetailsModal';
import { DataBackupModal } from './components/DataBackupModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Moon } from 'lucide-react';

export function App() {
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  const [astroData, setAstroData] = useState<AstronomyData>(() =>
    getAstronomyData(new Date(), settings.location.lat, settings.location.lng)
  );

  useEffect(() => {
    setAstroData(getAstronomyData(new Date(), settings.location.lat, settings.location.lng));
  }, [settings.location.lat, settings.location.lng]);

  const handleSaveNatalChart = (chart: NatalChart) => {
    const updated = { ...settings, natalChart: chart };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleDataRestored = () => {
    setSettings(getStoredSettings());
    setAstroData(getAstronomyData(new Date(), settings.location.lat, settings.location.lng));
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white/20 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        astroData={astroData}
        settings={settings}
        openSettingsModal={() => setIsSettingsOpen(true)}
        openBackupModal={() => setIsBackupOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <LunarDashboard
            astroData={astroData}
            settings={settings}
            setActiveTab={setActiveTab}
            openDayDetails={(d) => setSelectedCalendarDate(d)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            settings={settings}
            openDayDetails={(d) => setSelectedCalendarDate(d)}
          />
        )}

        {activeTab === 'transits' && (
          <TransitsView settings={settings} astroData={astroData} />
        )}

        {activeTab === 'widgets' && (
          <WidgetSimulator settings={settings} astroData={astroData} />
        )}

        {activeTab === 'astrology' && (
          <AstrologyChart
            settings={settings}
            onSaveNatalChart={handleSaveNatalChart}
          />
        )}

        {activeTab === 'synastry' && (
          <SynastryChart settings={settings} astroData={astroData} />
        )}

        {activeTab === 'horoscope' && (
          <DailyHoroscope settings={settings} astroData={astroData} />
        )}

        {activeTab === 'journal' && (
          <LunarJournal settings={settings} astroData={astroData} />
        )}

        {activeTab === 'intentions' && (
          <IntentionsTracker settings={settings} astroData={astroData} />
        )}

        {activeTab === 'rituals' && (
          <RitualsLibrary settings={settings} astroData={astroData} />
        )}

        {activeTab === 'cycle' && (
          <CycleTracker settings={settings} astroData={astroData} />
        )}

        {activeTab === 'analytics' && <AnalyticsView settings={settings} />}
      </main>

      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newS) => setSettings(newS)}
      />

      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={handleDataRestored}
      />

      <DayDetailsModal
        date={selectedCalendarDate}
        settings={settings}
        onClose={() => setSelectedCalendarDate(null)}
      />

      <PWAInstallPrompt />

      <footer className="w-full border-t border-white/10 py-6 mt-12 text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">Moon Calendar</span>
            <span>•</span>
            <span>Astronomical Data & Personal Astrology</span>
          </div>

          <div className="text-neutral-500">
            Designed with Apple HIG Principles
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
