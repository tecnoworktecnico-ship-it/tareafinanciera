import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { TransactionType } from '@finan/shared';
import { ArrowUpRight, ArrowDownRight, HelpCircle, Wallet, TrendingUp, Sparkles, Loader2, PlusCircle, ArrowRight } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import StatCard from '../components/StatCard';

const Dashboard = ({ setTab }: { setTab: (tab: string) => void }) => {
  const { t, displayCurrency, convert, visualConvert, formatMoney, loadingRates, transactions } = useAppContext();
  
  const currencyNames: Record<string, string> = {
    ARS: 'Pesos Argentinos',
    USD: 'Dólar Estadounidense',
    EUR: 'Euro',
    PEN: 'Sol Peruano'
  };
  const [showHelp, setShowHelp] = useState(false);

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

  if (loadingRates) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="relative p-12 glass-premium rounded-[3.5rem] overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full w-fit">
                 <Sparkles size={14} className="text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('totalBalance')}</span>
              </div>
              <h1 className="text-7xl font-manrope font-black tracking-tighter text-[#191c1d] dark:text-white">
                 {formatMoney(stats.total)}
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{displayCurrency} • GLOBAL BALANCE</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-6">
              <div className="p-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-sm min-w-[200px]">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('incomes')}</p>
                 <p className="text-3xl font-manrope font-bold text-green-600 flex items-center gap-2">
                    <ArrowUpRight size={24} strokeWidth={3} /> {formatMoney(stats.incomes)}
                 </p>
              </div>
              <div className="p-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-sm min-w-[200px]">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('expenses')}</p>
                 <p className="text-3xl font-manrope font-bold text-red-500 flex items-center gap-2">
                    <ArrowDownRight size={24} strokeWidth={3} /> {formatMoney(stats.expenses)}
                 </p>
              </div>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-manrope font-black flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                 {t('liveFeed')}
              </h2>
              <button onClick={() => setShowHelp(true)} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl text-gray-400 transition-all border border-transparent hover:border-gray-200">
                 <HelpCircle size={22} />
              </button>
           </div>

           <div className="space-y-4">
              {recent.map((tx, i) => (
                <div key={tx.id} 
                  className="surface-card p-6 rounded-[2rem] flex items-center justify-between group hover:translate-x-3 transition-all duration-300 border border-transparent hover:border-primary/10"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${tx.type === TransactionType.INCOME ? 'bg-green-100/50 text-green-700' : 'bg-red-50/50 text-red-700'} group-hover:scale-110 shadow-sm`}>
                        {tx.type === TransactionType.INCOME ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                    </div>
                    <div>
                      <p className="font-bold text-xl dark:text-white">{tx.description}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{tx.category} • {new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-2xl font-manrope font-black ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-[#191c1d] dark:text-white'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                     </p>
                     {tx.currency !== displayCurrency && (
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">≈ {formatMoney(visualConvert(convert(tx.amount, tx.currency)), displayCurrency)}</p>
                     )}
                  </div>
                </div>
              ))}
              
              {recent.length === 0 && (
                <div className="p-20 text-center glass rounded-[3.5rem] border-2 border-dashed border-primary/10 animate-in zoom-in duration-700">
                   <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 text-primary/40">
                      <PlusCircle size={48} />
                   </div>
                   <h3 className="text-3xl font-manrope font-black mb-4 dark:text-white">Nada por aquí aún</h3>
                   <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">Registra tus movimientos para activar el análisis inteligente en tiempo real.</p>
                   <button 
                     onClick={() => setTab('transactions')}
                     className="bg-primary text-white flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black font-manrope shadow-2xl shadow-primary/40 mx-auto hover:scale-105 active:scale-95 transition-all"
                   >
                      NUEVA TRANSACCIÓN <ArrowRight size={24} />
                   </button>
                </div>
              )}
           </div>
        </div>

        <div className="space-y-8">
           <StatCard 
              label={t('monthlyHealth') || 'Salud Mensual'}
              value="100%"
              icon={<TrendingUp size={24} className="text-primary" />}
              colorClass="bg-primary text-primary"
              subValue={`${t('activeVisualization') || 'Visualización en'} ${displayCurrency}`}
           />

           <div className="glass-premium p-8 rounded-[2rem] flex items-center gap-6 group hover:-translate-y-1 transition-all">
              <div className="p-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform"><Wallet size={28} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">DIVISA ACTIVA</p>
                 <p className="font-manrope font-black text-xl dark:text-white">{displayCurrency}</p>
                 <p className="text-[10px] font-bold text-gray-400">{currencyNames[displayCurrency] || displayCurrency}</p>
              </div>
           </div>
        </div>

      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('dashboard')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpDashboardIntro')}</p>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpDashboardBalanceTitle')}</h4><p className="text-sm">{t('helpDashboardBalanceBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpDashboardFeedTitle')}</h4><p className="text-sm">{t('helpDashboardFeedBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpDashboardCurrencyTitle')}</h4><p className="text-sm">{t('helpDashboardCurrencyBody')}</p></section>
        </div>
      </HelpModal>
    </div>
  );
};

export default Dashboard;
