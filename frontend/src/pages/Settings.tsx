import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Currency } from '@finan/shared';
import { Settings as SettingsIcon, Globe, Palette, Volume2, Coins, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';

const Settings = () => {
  const { 
    t, 
    language, setLanguage, 
    baseCurrency, 
    displayCurrency, setDisplayCurrency,
    theme, setTheme, 
    soundEnabled, setSoundEnabled,
    playUiSound
  } = useAppContext();

  const handleAction = () => playUiSound('click');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <SettingsIcon className="text-primary" /> {t('settings')}
        </h2>
        <button
          onClick={() => { handleAction(); setShowHelp(true); }}
          className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          title="Ayuda de Ajustes"
        >
          <HelpCircle size={18} />
        </button>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('settings')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpSettingsIntro')}</p>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpSettingsLangTitle')}</h4>
            <p className="text-sm">{t('helpSettingsLangBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpSettingsCurrencyTitle')}</h4>
            <p className="text-sm">{t('helpSettingsCurrencyBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpSettingsThemeTitle')}</h4>
            <p className="text-sm">{t('helpSettingsThemeBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpSettingsSoundTitle')}</h4>
            <p className="text-sm">{t('helpSettingsSoundBody')}</p>
          </section>
        </div>
      </HelpModal>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow p-6 space-y-6 border border-gray-100 dark:border-gray-700">
        
        {/* Language */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
             <Globe className="text-gray-400" />
             <span className="font-medium">{t('language')}</span>
          </div>
          <select 
             value={language} 
             onChange={e => { setLanguage(e.target.value as any); handleAction(); }}
             className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-sm rounded-lg px-4 py-2 focus:ring-primary dark:text-white font-medium"
          >
             <option value="es">🇪🇸 Español</option>
             <option value="en">🇺🇸 English</option>
          </select>
        </div>

        {/* Display Currency */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
             <Coins className="text-gray-400" />
             <div className="flex flex-col">
                <span className="font-medium">Divisa de Visualización</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Base Contable: ARS</span>
             </div>
          </div>
          <select 
             value={displayCurrency} 
             onChange={e => { setDisplayCurrency(e.target.value as Currency); handleAction(); }}
             className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-sm rounded-lg px-4 py-2 focus:ring-primary dark:text-white font-medium"
          >
             {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
             <Palette className="text-gray-400" />
             <span className="font-medium">{t('theme')}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setTheme('light'); handleAction(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${theme === 'light' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'}`}
            >{t('lightMode')}</button>
            <button 
              onClick={() => { setTheme('dark'); handleAction(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${theme === 'dark' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'}`}
            >{t('darkMode')}</button>
          </div>
        </div>

        {/* Sounds */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
             <Volume2 className="text-gray-400" />
             <span className="font-medium">{t('sound')}</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={e => { setSoundEnabled(e.target.checked); handleAction(); }} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

      </div>
    </div>
  );
};

export default Settings;
