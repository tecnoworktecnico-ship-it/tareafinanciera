import { useState, useCallback, useEffect } from 'react';

export const useFinancialData = () => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (Array.isArray(data)) setAccounts(data);
    } catch (e) {
      console.error('Error fetching accounts:', e);
    }
  }, []);

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

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (Array.isArray(data)) setTransactions(data);
    } catch (e) {
      console.error('Error fetching transactions:', e);
    }
  }, []);

  const addCategory = useCallback(async (name: string) => {
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
  }, [fetchCategories]);

  useEffect(() => {
    fetchRates();
    fetchCategories();
    fetchTransactions();
    fetchAccounts();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, [fetchRates, fetchCategories, fetchTransactions]);

  return {
    rates,
    categories,
    transactions,
    accounts,
    loadingRates,
    fetchTransactions,
    fetchCategories,
    fetchAccounts,
    addCategory
  };
};
