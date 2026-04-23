import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface BudgetFormProps {
  onClose: () => void;
  onSuccess: () => void;
  selectedMonth: string;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, onSuccess, selectedMonth }) => {
  const { t, playUiSound, baseCurrency, categories, addCategory } = useAppContext();
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: 1000
  });

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const handleCategoryChange = async (val: string) => {
    if (val === 'NEW_CAT') {
       const name = prompt(t('enterCategoryName') || "Nombre de la nueva categoría:");
       if (name) {
          const success = await addCategory(name);
          if (success) {
             setFormData(prev => ({ ...prev, category: name }));
             playUiSound('success');
          }
       }
    } else {
       setFormData(prev => ({ ...prev, category: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currency: baseCurrency,
          month: selectedMonth
        })
      });
      if (res.ok) {
        playUiSound('success');
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in duration-300">
       <div className="glass-premium p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition">
             <X size={24} />
          </button>
          
          <div className="mb-10">
             <h3 className="text-3xl font-manrope font-black dark:text-white">{t('newBudget')}</h3>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 ml-1">Establece tus límites mensuales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                 <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 ml-1">{t('categoryLabel')}</label>
                 <select 
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-3xl border-none ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition appearance-none font-bold text-lg"
                 >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="NEW_CAT" className="font-bold text-primary">+ {t('newCategory')}</option>
                 </select>
              </div>

             <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 ml-1">{t('limitAmount')} ({baseCurrency})</label>
                <input 
                   type="number" 
                   required
                   value={formData.limitAmount}
                   onChange={e => setFormData({...formData, limitAmount: Number(e.target.value)})}
                   className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-3xl border-none ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-manrope font-black text-2xl"
                   placeholder="0.00"
                />
             </div>

             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-primary font-bold italic leading-tight">
                   ℹ️ {t('budgetSaveNote') || 'Los presupuestos se guardan para el mes seleccionado.'}
                </p>
             </div>

             <button 
                type="submit" 
                className="w-full p-6 rounded-[2rem] font-manrope font-black text-lg bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
             >
                <Save size={24} /> {t('saveBtn')}
             </button>
          </form>
       </div>
    </div>
  );
};

export default BudgetForm;
