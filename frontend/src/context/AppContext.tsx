import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Currency } from '@finan/shared';
import { Language, translations, TranslationKey } from '../i18n/translations';

interface AppContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  baseCurrency: Currency; // ALWAYS 'ARS'
  displayCurrency: Currency; // The UI Switch
  setDisplayCurrency: (c: Currency) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  t: (key: TranslationKey) => string;
  playUiSound: (type: 'click' | 'success' | 'money') => void;
  // Live Rates (1 Target = X ARS)
  rates: Record<string, number>;
  categories: string[];
  addCategory: (name: string) => Promise<boolean>;
  convert: (amount: number, from: string) => number; // Always to ARS
  visualConvert: (amountARS: number, target?: Currency) => number; // ARS to Display
  formatMoney: (amount: number, currency?: string) => string;
  loadingRates: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(Currency.USD);
  const baseCurrency = Currency.ARS; // Hardcoded fixed base
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [rates, setRates] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  const fetchRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      const res = await fetch(`/api/exchange-rates`);
      const data = await res.json();
      setRates(data.rates);
    } catch (e) {
      console.error('Error fetching rates:', e);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  }, []);

  const addCategory = async (name: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    fetchRates();
    fetchCategories();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, [fetchRates, fetchCategories]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const t = (key: TranslationKey) => translations[language][key] || key;

  // Internal Accounting Core (Convert ANY to ARS)
  const convert = useCallback((amount: number, from: string) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 0;
    if (from === 'ARS') return numAmount;
    
    // If rates[USD] = 1050, then USD -> ARS is amount * 1050
    const rate = rates[from] || 1;
    return numAmount * rate;
  }, [rates]);

  // Visual Display Core (Convert ARS to TARGET)
  const visualConvert = useCallback((amountARS: number, target: Currency = displayCurrency) => {
    if (target === Currency.ARS) return amountARS;
    
    // If USD price is 1050, then ARS -> USD is amount / 1050
    const rate = rates[target] || 1;
    return amountARS / rate;
  }, [rates, displayCurrency]);

  const formatMoney = useCallback((amount: number, currency: string = displayCurrency) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-AR' : 'en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2
    }).format(amount);
  }, [language, displayCurrency]);

  const playUiSound = (type: 'click' | 'success' | 'money') => {
    if (!soundEnabled) return;
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
    } catch(e) {}
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, baseCurrency,
      displayCurrency, setDisplayCurrency,
      theme, setTheme, soundEnabled, setSoundEnabled, t, playUiSound,
      rates, categories, addCategory, convert, visualConvert, formatMoney, loadingRates
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
