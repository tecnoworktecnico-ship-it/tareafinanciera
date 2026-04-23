import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export const useBudgetData = (selectedMonth: string) => {
  const { transactions, convert, visualConvert } = useAppContext();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const budRes = await fetch('/api/budgets');
      const bData = await budRes.json();
      setBudgets(Array.isArray(bData) ? bData : []);
    } catch (e) {
      console.error('Error fetching budgets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handledBudgets = useMemo(() => {
    return budgets
      .filter(b => b.month === selectedMonth)
      .map(b => {
        let spentARS = 0;
        transactions.forEach(tx => {
          if (tx.category === b.category && tx.type === 'EXPENSE' && tx.timestamp.startsWith(selectedMonth)) {
            spentARS += convert(tx.amount, tx.currency);
          }
        });

        const limitARS = b.limitAmount; 
        const percentage = (spentARS / limitARS) * 100;

        return { 
          ...b, 
          spent: visualConvert(spentARS), 
          limitInDisplay: visualConvert(limitARS), 
          percentage 
        };
      });
  }, [budgets, transactions, convert, visualConvert, selectedMonth]);

  return { budgets, handledBudgets, loading, refreshBudgets: fetchData };
};
