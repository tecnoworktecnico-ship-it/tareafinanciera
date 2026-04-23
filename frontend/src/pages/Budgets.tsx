import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Target, Plus, HelpCircle, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import HelpModal from '../components/HelpModal';
import BudgetItem from '../components/BudgetItem';
import BudgetForm from '../components/BudgetForm';
import { useBudgetData } from '../hooks/useBudgetData';

const Budgets = () => {
  const { t, playUiSound, formatMoney, loadingRates } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const { handledBudgets, loading, refreshBudgets } = useBudgetData(selectedMonth);

  const chartData = useMemo(() => {
    return handledBudgets.map(b => ({
      name: b.category,
      value: b.spent,
      limit: b.limitInDisplay
    }));
  }, [handledBudgets]);

  const COLORS = ['#0058bd', '#006e2c', '#b51b15', '#FBBC05', '#7C3AED', '#EC4899'];

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete') || '¿Eliminar este presupuesto?')) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        playUiSound('click');
        refreshBudgets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || loadingRates) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 glass p-8 rounded-[2.5rem] shadow-xl">
        <h2 className="text-4xl font-manrope font-black text-[#191c1d] dark:text-white flex items-center gap-4">
           <Target className="text-primary w-10 h-10" /> {t('budgets')}
        </h2>
        <div className="flex items-center gap-4">
           <input 
             type="month" 
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="bg-white/50 dark:bg-slate-800 p-4 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-slate-700 font-black font-manrope outline-none transition focus:ring-2 focus:ring-primary shadow-sm"
           />
           <div className="flex gap-2">
              <button onClick={() => setShowHelp(true)} className="p-4 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm">
                 <HelpCircle className="text-gray-500 dark:text-gray-300" size={24} />
              </button>
              <button 
                onClick={() => { playUiSound('click'); setShowAdd(true); }}
                className="bg-primary text-white flex items-center gap-3 px-8 py-4 rounded-2xl font-black font-manrope shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
              >
                 <Plus size={24} /> {t('createLimit')}
              </button>
           </div>
        </div>
      </header>

      {handledBudgets.length === 0 ? (
        <div className="py-20 text-center glass rounded-[3.5rem] border-2 border-dashed border-primary/10">
           <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
              <Target size={48} />
           </div>
           <h3 className="text-3xl font-manrope font-black dark:text-white">Sin límites para {selectedMonth}</h3>
           <p className="text-gray-400 font-medium max-w-sm mx-auto mt-4">Establece objetivos de ahorro por categoría para mantener tus finanzas bajo control.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {handledBudgets.map(budget => (
            <BudgetItem key={budget.id} budget={budget} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {handledBudgets.length > 0 && (
        <section className="glass-premium p-10 rounded-[3.5rem] space-y-10 border border-white/20">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-3xl font-manrope font-black dark:text-white">{t('spendingDistribution')}</h3>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 ml-1">Análisis por categorías</p>
              </div>
           </div>
           <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={chartData}
                       cx="50%"
                       cy="50%"
                       innerRadius={100}
                       outerRadius={160}
                       paddingAngle={10}
                       dataKey="value"
                       stroke="none"
                    >
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1.5rem' }}
                       itemStyle={{ fontWeight: 'black', fontFamily: 'Manrope' }}
                       formatter={(value: any) => formatMoney(value)}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '40px', fontWeight: 'bold' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </section>
      )}

      {showAdd && (
        <BudgetForm 
           onClose={() => setShowAdd(false)}
           onSuccess={refreshBudgets}
           selectedMonth={selectedMonth}
        />
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('budgets')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpBudgetsIntro')}</p>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpBudgetsCreateTitle')}</h4><p className="text-sm">{t('helpBudgetsCreateBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpBudgetsProgressTitle')}</h4><p className="text-sm">{t('helpBudgetsProgressBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpBudgetsMonthTitle')}</h4><p className="text-sm">{t('helpBudgetsMonthBody')}</p></section>
        </div>
      </HelpModal>
    </div>
  );
};

export default Budgets;

