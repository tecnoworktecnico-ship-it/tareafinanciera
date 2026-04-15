import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@finan/shared';
import { Language, translations, TranslationKey } from '../i18n/translations';

interface AppContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  baseCurrency: Currency;
  setBaseCurrency: (c: Currency) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  t: (key: TranslationKey) => string;
  playUiSound: (type: 'click' | 'success' | 'money') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');
  const [baseCurrency, setBaseCurrency] = useState<Currency>(Currency.USD);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Apply theme to HTML class for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };

  const playUiSound = (type: 'click' | 'success' | 'money') => {
    if (!soundEnabled) return;
    
    // Fallback simple Web Audio API synth if no real mp3 is loaded
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'success' || type === 'money') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch(e) {
      console.warn('Audio Context not supported or blocked');
    }
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, baseCurrency, setBaseCurrency,
      theme, setTheme, soundEnabled, setSoundEnabled, t, playUiSound
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
