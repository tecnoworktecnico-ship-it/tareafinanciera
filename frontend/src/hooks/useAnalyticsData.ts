import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { TransactionType } from '@finan/shared';

export const useAnalyticsData = () => {
  const { transactions, convert, visualConvert } = useAppContext();

  const stats = useMemo(() => {
    if (!transactions.length) return null;

    // Category Data (Normalized to ARS first)
    const catMapARS: Record<string, number> = {};
    transactions.forEach(tx => {
       if (tx.type === TransactionType.EXPENSE) {
          const valARS = convert(tx.amount, tx.currency);
          catMapARS[tx.category] = (catMapARS[tx.category] || 0) + valARS;
       }
    });
    
    // Final display conversion
    const pieData = Object.entries(catMapARS).map(([name, value]) => ({ 
       name, 
       value: Math.round(visualConvert(value)) 
    }));

    // Daily Timeline (30 days) - Normalizing to ARS
    const dailyMapARS: Record<string, { income: number, expense: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
       const d = new Date(now);
       d.setDate(d.getDate() - i);
       const key = d.toISOString().split('T')[0];
       dailyMapARS[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(tx => {
       if (dailyMapARS[tx.timestamp]) {
          const valARS = convert(tx.amount, tx.currency);
          if (tx.type === TransactionType.INCOME) dailyMapARS[tx.timestamp].income += valARS;
          else if (tx.type === TransactionType.EXPENSE) dailyMapARS[tx.timestamp].expense += valARS;
       }
    });

    const areaData = Object.entries(dailyMapARS).map(([date, vals]) => ({
       name: date.split('-').slice(1).join('/'), 
       income: Math.round(visualConvert(vals.income)),
       expense: Math.round(visualConvert(vals.expense)),
       net: Math.round(visualConvert(vals.income - vals.expense))
    }));

    return { pieData, areaData };
  }, [transactions, convert, visualConvert]);

  return { stats };
};
