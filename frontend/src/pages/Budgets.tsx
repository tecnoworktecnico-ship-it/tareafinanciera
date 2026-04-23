import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Target, Plus, AlertTriangle, TrendingDown, CheckCircle2, HelpCircle, Loader2 } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import { Currency } from '@finan/shared';

const Budgets = () => {
  const { t, baseCurrency, displayCurrency, playUiSound, convert, visualConvert, formatMoney, loadingRates, categories, addCategory } = useAppContext();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [newBudget, setNewBudget] = useState({ category: '', limitAmount: 500 });

  useEffect(() => {
    if (categories.length > 0 && !newBudget.category) {
       setNewBudget(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const handleCategoryChange = async (val: string) => {
    if (val === 'NEW_CAT') {
       const name = prompt("Nombre de la nueva categoría:");
       if (name) {
          const success = await addCategory(name);
          if (success) {
             setNewBudget(prev => ({ ...prev, category: name }));
             playUiSound('success');
          }
       }
    } else {
       setNewBudget(prev => ({ ...prev, category: val }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budRes, txRes] = await Promise.all([
          fetch('/api/budgets'),
          fetch('/api/transactions')
        ]);
        const bData = await budRes.json();
        const tData = await txRes.json();
        setBudgets(bData);
        setTransactions(tData);
      } catch (e) {
        console.error('Error fetching budgets:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handledBudgets = useMemo(() => {
    return budgets.map(b => {
      // Calculate spent on this category in ARS
      let spentARS = 0;
      transactions.forEach(tx => {
        if (tx.category === b.category && tx.type === 'EXPENSE') {
          spentARS += convert(tx.amount, tx.currency);
        }
      });

      // Budget limit is already in ARS according to user requirement
      const limitARS = b.limitAmount; 
      const percentage = (spentARS / limitARS) * 100;

      return { 
        ...b, 
        spent: visualConvert(spentARS), 
        limitInDisplay: visualConvert(limitARS), 
        percentage 
      };
    });
  }, [budgets, transactions, convert, visualConvert]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBudget,
          currency: baseCurrency,
          month: new Date().toISOString().slice(0, 7)
        })
      });
      if (res.ok) {
        playUiSound('click');
        setShowAdd(false);
        window.location.reload();
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex justify-between items-center glass p-6 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-manrope font-extrabold text-[#191c1d] dark:text-white flex items-center gap-3">
           <Target className="text-primary w-8 h-8" /> {t('budgets') || 'Presupuestos'}
        </h2>
        <div className="flex gap-2">
           <button onClick={() => setShowHelp(true)} className="p-3 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm mr-2">
              <HelpCircle className="text-gray-500 dark:text-gray-300" />
           </button>
           <button 
             onClick={() => { playUiSound('click'); setShowAdd(true); }}
             className="gradient-cta flex items-center gap-2 px-6 py-3 rounded-2xl font-bold font-manrope shadow-lg hover:scale-105 transition"
           >
              <Plus size={20} /> Crear Límite
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {handledBudgets.map(budget => {
          const isOver = budget.percentage > 100;
          const isNear = budget.percentage > 80 && !isOver;

          return (
            <div key={budget.id} className="glass-premium p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
               <div className="flex justify-between items-start">
                  <div>
                     <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{budget.category}</h4>
                     <p className="text-2xl font-manrope font-black">
                        {formatMoney(budget.spent)} <span className="text-sm font-medium text-gray-400">/ {formatMoney(budget.limitInDisplay)}</span>
                     </p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isOver ? 'bg-red-100 text-red-600' : isNear ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                     {isOver ? <AlertTriangle /> : isNear ? <TrendingDown /> : <CheckCircle2 />}
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                     <span>Progreso en {displayCurrency}</span>
                     <span>{budget.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500' : isNear ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                     ></div>
                  </div>
               </div>
               
               {isOver && (
                 <p className="text-xs text-red-500 font-bold animate-pulse">⚠️ ¡Gasto excedido en {baseCurrency}!</p>
               )}
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="md:col-span-2 p-20 text-center glass border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem]">
             <Target className="mx-auto w-12 h-12 text-gray-300 mb-4" />
             <h3 className="text-xl font-bold font-manrope">Define tu primer presupuesto</h3>
             <p className="text-gray-500 mt-2 max-w-sm mx-auto">Tus límites se ajustarán automáticamente al cambiar de moneda.</p>
          </div>
        )}
      </div>

      {showAdd && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="glass-premium p-8 rounded-[2.5rem] w-full max-w-md animate-in zoom-in duration-300">
               <h3 className="text-2xl font-manrope font-extrabold mb-6">Nuevo Presupuesto</h3>
               <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2">Categoría</label>
                      <select 
                         value={newBudget.category}
                         onChange={e => handleCategoryChange(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary outline-none transition appearance-none font-medium"
                      >
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                         <option value="NEW_CAT" className="font-bold text-primary">+ Nueva Categoría...</option>
                      </select>
                   </div>
                  <div>
                     <label className="block text-xs font-black uppercase text-gray-400 mb-2">Monto Límite ({baseCurrency})</label>
                     <input 
                        type="number" 
                        value={newBudget.limitAmount}
                        onChange={e => setNewBudget({...newBudget, limitAmount: Number(e.target.value)})}
                        className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary outline-none transition"
                     />
                  </div>
                  <p className="text-[10px] text-gray-500 italic">* El presupuesto se guardará en {baseCurrency} pero se mostrará convertido si cambias de divisa global.</p>
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setShowAdd(false)} className="flex-1 p-4 rounded-2xl font-bold bg-gray-100 dark:bg-slate-700 transition">Cancelar</button>
                     <button onClick={handleCreate} className="flex-1 p-4 rounded-2xl font-bold gradient-cta shadow-lg shadow-primary/30 transition">Guardar</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Control Multidivisa">
         <p className="text-sm">Tus límites de gasto son dinámicos. Si registras gastos en Euros pero tu presupuesto está en Dólares, el sistema hace el cruce de cotización al vuelo.</p>
      </HelpModal>
    </div>
  );
};

export default Budgets;
