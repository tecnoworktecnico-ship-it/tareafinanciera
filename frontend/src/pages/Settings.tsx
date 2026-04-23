import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Currency } from '@finan/shared';
import { Settings as SettingsIcon, Globe, Palette, Volume2, Coins, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import SettingsSection from '../components/SettingsSection';

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
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in duration-500">
      <header className="flex justify-between items-center glass p-8 rounded-[2.5rem] shadow-xl">
        <h2 className="text-4xl font-manrope font-black text-[#191c1d] dark:text-white flex items-center gap-4">
           <SettingsIcon className="text-primary w-10 h-10" /> {t('settings')}
        </h2>
        <button
          onClick={() => { handleAction(); setShowHelp(true); }}
          className="bg-white/50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 p-4 rounded-2xl shadow-sm hover:bg-white dark:hover:bg-slate-600 transition"
        >
          <HelpCircle size={24} />
        </button>
      </header>

      <div className="glass-premium p-10 rounded-[3rem] shadow-2xl space-y-2">
        
        {/* Language */}
        <SettingsSection 
          icon={<Globe size={24} />} 
          label={t('language')}
          description="Selecciona tu idioma preferido"
        >
          <select 
             value={language} 
             onChange={e => { setLanguage(e.target.value as any); handleAction(); }}
             className="bg-gray-50 dark:bg-slate-700 border-none ring-1 ring-gray-100 dark:ring-slate-600 text-lg rounded-2xl px-6 py-3 focus:ring-2 focus:ring-primary dark:text-white font-black font-manrope shadow-sm outline-none transition"
          >
             <option value="es">🇪🇸 Español</option>
             <option value="en">🇺🇸 English</option>
          </select>
        </SettingsSection>

        {/* Display Currency */}
        <SettingsSection 
          icon={<Coins size={24} />} 
          label={t('displayCurrencyLabel')}
          description={`Contabilidad base: ${baseCurrency}`}
        >
          <select 
             value={displayCurrency} 
             onChange={e => { setDisplayCurrency(e.target.value as Currency); handleAction(); }}
             className="bg-gray-50 dark:bg-slate-700 border-none ring-1 ring-gray-100 dark:ring-slate-600 text-lg rounded-2xl px-6 py-3 focus:ring-2 focus:ring-primary dark:text-white font-black font-manrope shadow-sm outline-none transition"
          >
             {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </SettingsSection>

        {/* Theme */}
        <SettingsSection 
          icon={<Palette size={24} />} 
          label={t('theme')}
          description="Personaliza la apariencia"
        >
          <div className="flex gap-3 bg-gray-50 dark:bg-slate-700 p-1.5 rounded-[1.5rem] ring-1 ring-gray-100 dark:ring-slate-600 shadow-sm">
            <button 
              onClick={() => { setTheme('light'); handleAction(); }}
              className={`px-6 py-2.5 rounded-2xl text-sm font-black font-manrope transition-all ${theme === 'light' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >{t('lightMode')}</button>
            <button 
              onClick={() => { setTheme('dark'); handleAction(); }}
              className={`px-6 py-2.5 rounded-2xl text-sm font-black font-manrope transition-all ${theme === 'dark' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-300'}`}
            >{t('darkMode')}</button>
          </div>
        </SettingsSection>

        {/* Sounds */}
        <SettingsSection 
          icon={<Volume2 size={24} />} 
          label={t('sound')}
          description="Efectos de sonido táctiles"
          showDivider={false}
        >
          <label className="relative inline-flex items-center cursor-pointer group">
            <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={e => { setSoundEnabled(e.target.checked); handleAction(); }} />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary shadow-inner"></div>
          </label>
        </SettingsSection>

      </div>

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
    </div>
  );
};

export default Settings;

