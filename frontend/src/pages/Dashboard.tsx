import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { TransactionType } from '@finan/shared';
import { ArrowUpRight, ArrowDownRight, Activity, HelpCircle, Wallet, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import HelpModal from '../components/HelpModal';

const Dashboard = () => {
  const { t, baseCurrency, displayCurrency, playUiSound, convert, visualConvert, formatMoney, loadingRates } = useAppContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let isSub = true;
    const fetchData = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        if (isSub) {
          if (transactions.length > 0 && data.length > 0 && data[0].id !== transactions[0].id) {
             playUiSound('money');
          }
          setTransactions(data);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      isSub = false;
      clearInterval(interval);
    };
  }, [transactions.length, playUiSound]);

  const stats = useMemo(() => {
    let totalARS = 0;
    let incomesARS = 0;
    let expensesARS = 0;

    transactions.forEach(tx => {
      // Internal: all transactions are considered relative to literal ARS pivot
      const valARS = convert(tx.amount, tx.currency);
      if (tx.type === TransactionType.INCOME) {
        incomesARS += valARS;
        totalARS += valARS;
      } else if (tx.type === TransactionType.EXPENSE) {
        expensesARS += valARS;
        totalARS -= valARS;
      }
    });

    return { 
      total: visualConvert(totalARS), 
      incomes: visualConvert(incomesARS), 
      expenses: visualConvert(expensesARS) 
    };
  }, [transactions, convert, visualConvert]);

  const recent = transactions.slice(0, 5);

  if (loading || loadingRates) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Hero Section - Dynamic Conversion */}
      <section className="relative px-8 py-12 glass-premium rounded-[2.5rem] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                 <Sparkles size={16} /> {t('totalBalance')} ({baseCurrency})
              </h3>
              <div className="flex items-start gap-4">
                 <h1 className="text-hero text-[#191c1d] dark:text-white">
                    {formatMoney(stats.total)}
                 </h1>
              </div>
           </div>
           
           <div className="flex gap-12">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('incomes')}</p>
                 <p className="text-2xl font-manrope font-bold text-green-600 flex items-center gap-1">
                    <ArrowUpRight size={20} strokeWidth={3} /> {formatMoney(stats.incomes)}
                 </p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('expenses')}</p>
                 <p className="text-2xl font-manrope font-bold text-[#b51b15] flex items-center gap-1">
                    <ArrowDownRight size={20} strokeWidth={3} /> {formatMoney(stats.expenses)}
                 </p>
              </div>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-manrope flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 {t('liveFeed')}
              </h3>
              <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 transition">
                 <HelpCircle size={20} />
              </button>
           </div>

           <div className="space-y-4">
              {recent.map((tx, i) => (
                <div key={tx.id} 
                  className="surface-card p-6 rounded-3xl flex items-center justify-between hover:translate-x-2 transition-all"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${tx.type === TransactionType.INCOME ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {tx.type === TransactionType.INCOME ? <ArrowUpRight /> : <ArrowDownRight />}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{tx.description}</p>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">{tx.category} • {tx.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-xl font-manrope font-black ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-[#191c1d] dark:text-white'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'} {formatMoney(tx.amount, tx.currency)}
                     </p>
                     <p className="text-[10px] font-bold text-gray-400">≈ {formatMoney(convert(tx.amount, tx.currency))}</p>
                  </div>
                </div>
              ))}
              {recent.length === 0 && <div className="p-12 text-center text-gray-400">Iniciando feed de datos...</div>}
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass-premium p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="font-bold flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-primary"/> Salud Mensual</h3>
                 <p className="text-xs text-gray-500 mb-6 font-manrope">Visualización activa en **{displayCurrency}**. Respaldo contable en ARS.</p>
                 <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[100%]"></div>
                 </div>
              </div>
           </div>

           <div className="glass p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-primary text-white rounded-2xl"><Wallet /></div>
              <div>
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Base de Datos</p>
                 <p className="font-bold">ARS - Pesos Argentinos</p>
              </div>
           </div>
        </div>

      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Dashboard Pro">
        <p className="text-sm">El sistema convierte automáticamente todas tus transacciones a {baseCurrency} usando cotizaciones en tiempo real.</p>
      </HelpModal>
    </div>
  );
};

export default Dashboard;
