import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { TransactionType } from '@finan/shared';
import { ArrowUpRight, ArrowDownRight, Activity, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';

const Dashboard = () => {
  const { t, baseCurrency, playUiSound } = useAppContext();
  const [stats, setStats] = useState({ total: 12450, incomes: 4200, expenses: 1240 });
  const [recent, setRecent] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Polling recent transactions for "Live Feed" feel
    let isSub = true;
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        if (isSub && data.length > 0) {
          // Check if there's a new transaction compared to local state to play a subtle sound
          if (recent.length > 0 && data[0].id !== recent[0].id) {
             playUiSound('money');
          }
          setRecent(data.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 3000);
    return () => {
      isSub = false;
      clearInterval(interval);
    };
  }, [recent, playUiSound]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <Activity className="text-primary" /> {t('dashboard')}
        </h2>
        <button 
           onClick={() => { playUiSound('click'); setShowHelp(true); }}
           className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
           title="Ayuda del Dashboard"
        >
          <HelpCircle size={22} />
        </button>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('dashboard')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
           <p>{t('helpDashboardIntro')}</p>
           <section>
              <h4 className="font-bold text-gray-800 dark:text-white">{t('helpDashboardBalanceTitle')}</h4>
              <p className="text-sm">{t('helpDashboardBalanceBody')}</p>
           </section>
           <section>
              <h4 className="font-bold text-gray-800 dark:text-white">{t('helpDashboardFeedTitle')}</h4>
              <p className="text-sm">{t('helpDashboardFeedBody')}</p>
           </section>
        </div>
      </HelpModal>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">{t('totalBalance')}</p>
          <h3 className="text-3xl font-semibold text-primary dark:text-blue-400">{baseCurrency} {stats.total.toLocaleString()}</h3>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">{t('incomes')}</p>
          <h3 className="text-3xl font-semibold text-income flex items-center gap-1"><ArrowUpRight size={24}/> {baseCurrency} {stats.incomes.toLocaleString()}</h3>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">{t('expenses')}</p>
          <h3 className="text-3xl font-semibold text-expense flex items-center gap-1"><ArrowDownRight size={24}/> {baseCurrency} {stats.expenses.toLocaleString()}</h3>
        </div>
      </div>

      {/* Live Feed Panel */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-[0_4px_24px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {t('liveFeed')}
          </h3>
        </div>
        <div className="px-6 pb-2 divide-y divide-gray-50 dark:divide-slate-700">
          {recent.length === 0 && <p className="p-4 text-center text-gray-500">{t('noTransactions')}</p>}
          {recent.map(tx => (
            <div key={tx.id} className="py-5 flex justify-between items-center group animate-in slide-in-from-left duration-300">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition ${tx.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-900/30 text-income' : 'bg-red-100 dark:bg-red-900/30 text-expense'}`}>
                    {tx.type === TransactionType.INCOME ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20}/>}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{tx.description}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{tx.category} • {tx.timestamp}</p>
                </div>
              </div>
              <div className={`text-lg font-bold ${tx.type === TransactionType.INCOME ? 'text-income' : 'text-gray-800 dark:text-gray-100'}`}>
                {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toFixed(2)} <span className="text-sm font-medium text-gray-400 ml-1">{tx.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
