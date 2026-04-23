import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TransactionType } from '@finan/shared';

interface TransactionFormProps {
  initialData?: any;
  accounts: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, accounts, onClose, onSuccess }) => {
  const { categories, addCategory, t, playUiSound } = useAppContext();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.EXPENSE,
    category: '',
    accountId: accounts[0]?.id || '',
    targetAccountId: '',
    timestamp: new Date().toISOString().split('T')[0]
  });

  const [newCat, setNewCat] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        timestamp: new Date(initialData.timestamp).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `/api/transactions/${initialData.id}` : '/api/transactions';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });
      if (res.ok) {
        playUiSound('success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat) return;
    const ok = await addCategory(newCat);
    if (ok) {
      setFormData({ ...formData, category: newCat });
      setNewCat('');
      setShowNewCat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in">
       <div className="glass-premium p-10 rounded-[3rem] w-full max-w-xl shadow-2xl relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition">
             <X size={24} />
          </button>
          
          <div className="mb-8">
             <h3 className="text-3xl font-manrope font-black dark:text-white">
                {initialData ? t('editTransaction') || 'Editar' : t('newTransaction') || 'Nueva'}
             </h3>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Completa los detalles</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Descripción</label>
                   <input 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-medium"
                      placeholder="Ej. Almuerzo, Sueldo, etc."
                   />
                </div>
                
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Monto</label>
                   <input 
                      type="number" required step="0.01"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold text-xl"
                      placeholder="0.00"
                   />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Fecha</label>
                   <input 
                      type="date" required
                      value={formData.timestamp}
                      onChange={e => setFormData({...formData, timestamp: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Tipo</label>
                   <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold"
                   >
                      <option value={TransactionType.EXPENSE}>{t('expense')}</option>
                      <option value={TransactionType.INCOME}>{t('income')}</option>
                      <option value={TransactionType.TRANSFER}>{t('transfer')}</option>
                   </select>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Cuenta</label>
                   <select 
                      value={formData.accountId}
                      onChange={e => setFormData({...formData, accountId: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold"
                   >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                   </select>
                </div>
             </div>

             {formData.type === TransactionType.TRANSFER && (
                <div className="animate-in slide-in-from-top-2">
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Cuenta Destino</label>
                   <select 
                      required
                      value={formData.targetAccountId}
                      onChange={e => setFormData({...formData, targetAccountId: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border-none ring-2 ring-primary focus:ring-4 outline-none transition font-bold"
                   >
                      <option value="">{t('selectOption')}</option>
                      {accounts.filter(a => a.id !== formData.accountId).map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                   </select>
                </div>
             )}

             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Categoría</label>
                <div className="flex gap-2">
                   <select 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="flex-1 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold"
                   >
                      <option value="">{t('selectOption')}</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <button type="button" onClick={() => setShowNewCat(!showNewCat)} className="p-4 bg-primary text-white rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20">
                      <Plus />
                   </button>
                </div>
                {showNewCat && (
                  <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
                     <input 
                        value={newCat} onChange={e => setNewCat(e.target.value)}
                        placeholder="Nueva categoría..."
                        className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-700 ring-1 ring-primary/30 outline-none"
                     />
                     <button type="button" onClick={handleAddCategory} className="bg-primary/10 text-primary px-4 rounded-xl font-bold">OK</button>
                  </div>
                )}
             </div>

             <button 
                type="submit"
                className="w-full p-5 rounded-3xl bg-primary text-white font-manrope font-black text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
             >
                <Save size={24} /> {initialData ? t('saveChanges') || 'Guardar' : t('confirm') || 'Confirmar'}
             </button>
          </form>
       </div>
    </div>
  );
};

export default TransactionForm;
