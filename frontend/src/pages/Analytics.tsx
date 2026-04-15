import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, TrendingUp, BarChart3, Loader2, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import { TransactionType } from '@finan/shared';

const Analytics = () => {
  const { t, baseCurrency, playUiSound } = useAppContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, rateRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch(`/api/exchange-rates?base=${baseCurrency}`)
        ]);
        const txData = await txRes.json();
        const rateData = await rateRes.json();
        setTransactions(txData);
        setRates(rateData.rates);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseCurrency]);

  const stats = useMemo(() => {
    if (!transactions.length || !rates) return null;

    // Normalize amount helper
    const getBaseVal = (amt: number, curr: string) => {
       if (curr === baseCurrency) return amt;
       const rate = rates[curr] || 1;
       return amt * rate;
    };

    // Category Summary
    const catMap: Record<string, number> = {};
    transactions.forEach(tx => {
       if (tx.type === TransactionType.EXPENSE) {
          const val = getBaseVal(tx.amount, tx.currency);
          catMap[tx.category] = (catMap[tx.category] || 0) + val;
       }
    });
    const categories = Object.entries(catMap).map(([label, amount]) => ({
       label,
       amount: Math.round(amount),
       color: label === 'food' ? 'bg-orange-400' : label === 'transport' ? 'bg-blue-400' : label === 'subscriptions' ? 'bg-purple-400' : 'bg-pink-400'
    })).sort((a, b) => b.amount - a.amount);

    const totalExpenses = categories.reduce((a, b) => a + b.amount, 0);

    // Daily Balance (last 30 days)
    const dailyMap: Record<string, { income: number, expense: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
       const d = new Date(now);
       d.setDate(d.getDate() - i);
       const key = d.toISOString().split('T')[0];
       dailyMap[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(tx => {
       if (dailyMap[tx.timestamp]) {
          const val = getBaseVal(tx.amount, tx.currency);
          if (tx.type === TransactionType.INCOME) dailyMap[tx.timestamp].income += val;
          else if (tx.type === TransactionType.EXPENSE) dailyMap[tx.timestamp].expense += val;
       }
    });

    const dailyData = Object.entries(dailyMap).map(([date, vals]) => ({
       date: date.split('-').slice(1).join('/'), 
       ...vals,
       net: vals.income - vals.expense
    }));

    // Monthly Trend
    const monthlyMap: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(tx => {
       const monthKey = tx.timestamp.slice(0, 7); // YYYY-MM
       if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };
       const val = getBaseVal(tx.amount, tx.currency);
       if (tx.type === TransactionType.INCOME) monthlyMap[monthKey].income += val;
       else if (tx.type === TransactionType.EXPENSE) monthlyMap[monthKey].expense += val;
    });

    const monthlyData = Object.entries(monthlyMap).sort().map(([month, vals]) => ({
       month,
       ...vals,
       net: vals.income - vals.expense
    }));

    return { categories, totalExpenses, dailyData, monthlyData };
  }, [transactions, rates, baseCurrency]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  if (!stats || transactions.length === 0) return (
    <div className="p-12 text-center bg-white/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
       <PieChart className="mx-auto w-16 h-16 text-gray-300 mb-4" />
       <h3 className="text-xl font-bold dark:text-white">Sin datos suficientes</h3>
       <p className="text-gray-500 max-w-xs mx-auto mt-2">Agrega transacciones para ver tus estadísticas y gráficos analíticos detallados.</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      <header className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <BarChart3 className="text-primary" /> {t('analytics')}
        </h2>
        <div className="flex items-center gap-2">
           <button
             onClick={() => { playUiSound('click'); setShowHelp(true); }}
             className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-slate-600 transition"
             title="Ayuda de Estadísticas"
           >
             <HelpCircle size={18} />
           </button>
           <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
              Base: {baseCurrency}
           </div>
        </div>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('analytics')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpAnalyticsIntro')}</p>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsDailyTitle')}</h4>
            <p className="text-sm">{t('helpAnalyticsDailyBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsMonthlyTitle')}</h4>
            <p className="text-sm">{t('helpAnalyticsMonthlyBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsCurrencyTitle')}</h4>
            <p className="text-sm">{t('helpAnalyticsCurrencyBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsCategoryTitle')}</h4>
            <p className="text-sm">{t('helpAnalyticsCategoryBody')}</p>
          </section>
        </div>
      </HelpModal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Balance (Last 30 days) */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700 lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 Balance Diario (30 días)
              </h3>
              <div className="flex gap-4 text-xs">
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Ingresos</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Gastos</div>
              </div>
           </div>
           
           <div className="h-60 flex items-end justify-between gap-1 w-full border-b border-gray-100 dark:border-gray-700 pb-2">
              {stats.dailyData.map((d, i) => {
                const max = Math.max(...stats.dailyData.map(x => Math.max(x.income, x.expense))) || 1;
                const hInc = (d.income / max) * 100;
                const hExp = (d.expense / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                     <div className="w-full h-full flex items-end justify-center gap-[1px]">
                        <div className="w-[45%] bg-green-500/80 rounded-t-sm transition-all group-hover:bg-green-500" style={{ height: `${hInc}%` }}></div>
                        <div className="w-[45%] bg-red-400/80 rounded-t-sm transition-all group-hover:bg-red-400" style={{ height: `${hExp}%` }}></div>
                     </div>
                     
                     {/* Tooltip */}
                     <div className="absolute bottom-full mb-2 bg-slate-800 text-white p-2 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition shadow-xl z-10 pointer-events-none whitespace-nowrap border border-white/10">
                        <p className="font-bold border-b border-white/10 mb-1">{d.date}</p>
                        <p className="text-green-400">+{d.income.toFixed(0)}</p>
                        <p className="text-red-400">-{d.expense.toFixed(0)}</p>
                        <p className="font-bold pt-1">Net: {d.net.toFixed(0)}</p>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
           <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-6">{t('spendingByCategory')}</h3>
           <div className="space-y-4">
              {stats.categories.map(c => {
                const percentage = Math.round((c.amount / stats.totalExpenses) * 100);
                return (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-600 dark:text-gray-300 capitalize">{t(c.label as any) || c.label}</span>
                      <span className="font-bold text-gray-800 dark:text-white">{baseCurrency} {c.amount.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div className={`${c.color} h-2.5 rounded-full animate-in slide-in-from-left duration-1000`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('trend')} Mensual</h3>
              <TrendingUp className="text-green-500" />
           </div>
           
           <div className="space-y-4">
              {stats.monthlyData.slice(-6).map((m, i) => {
                 const isPositive = m.net >= 0;
                 return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-700">
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">{m.month}</p>
                          <div className="flex gap-2 text-[10px] mt-1">
                             <span className="text-green-500">In: {m.income.toFixed(0)}</span>
                             <span className="text-red-400">Out: {m.expense.toFixed(0)}</span>
                          </div>
                       </div>
                       <div className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          <p className="text-sm font-black">{isPositive ? '+' : ''}{m.net.toLocaleString()} {baseCurrency}</p>
                          <p className="text-[10px] opacity-70">{isPositive ? 'Ahorro' : 'Déficit'}</p>
                       </div>
                    </div>
                 )
              })}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
