import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Currency } from '@finan/shared';
import { Language, translations, TranslationKey } from '../i18n/translations';
import { useSound } from '../hooks/useSound';
import { useFinancialData } from '../hooks/useFinancialData';

interface AppContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  baseCurrency: Currency;
  displayCurrency: Currency;
  setDisplayCurrency: (c: Currency) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  t: (key: TranslationKey) => string;
  playUiSound: (type: 'click' | 'success' | 'money') => void;
  rates: Record<string, number>;
  categories: string[];
  addCategory: (name: string) => Promise<boolean>;
  convert: (amount: number, from: string) => number;
  visualConvert: (amountARS: number, target?: Currency) => number;
  formatMoney: (amount: number, currency?: string) => string;
  loadingRates: boolean;
  transactions: any[];
  accounts: any[];
  fetchTransactions: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'es'
  );
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(
    () => (localStorage.getItem('displayCurrency') as Currency) || Currency.USD
  );
  const baseCurrency = Currency.ARS;
  
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { playUiSound } = useSound(soundEnabled);
  const { 
    rates, categories, transactions, accounts, loadingRates, 
    fetchTransactions, fetchCategories, fetchAccounts, addCategory 
  } = useFinancialData();

  useEffect(() => { localStorage.setItem('displayCurrency', displayCurrency); }, [displayCurrency]);
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const t = (key: TranslationKey) => translations[language][key] || key;

  const convert = useCallback((amount: number, from: string) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 0;
    if (from === 'ARS') return numAmount;
    const rate = rates[from] || 1;
    return numAmount * rate;
  }, [rates]);

  const visualConvert = useCallback((amountARS: number, target: Currency = displayCurrency) => {
    if (target === Currency.ARS) return amountARS;
    if (!rates[target] || loadingRates) return amountARS;
    const rate = rates[target];
    return amountARS / rate;
  }, [rates, displayCurrency, loadingRates]);

  const formatMoney = useCallback((amount: number, currency: string = displayCurrency) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-AR' : 'en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2
    }).format(amount);
  }, [language, displayCurrency]);

  return (
    <AppContext.Provider value={{
      language, setLanguage, baseCurrency,
      displayCurrency, setDisplayCurrency,
      theme, setTheme, soundEnabled, setSoundEnabled, t, playUiSound,
      rates, categories, addCategory, convert, visualConvert, formatMoney, loadingRates,
      transactions, fetchTransactions, accounts, fetchAccounts
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

