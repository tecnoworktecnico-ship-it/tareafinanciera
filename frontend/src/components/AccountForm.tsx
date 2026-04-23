import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Currency } from '@finan/shared';

interface AccountFormProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ initialData, onClose, onSuccess }) => {
  const { t, playUiSound, baseCurrency } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    currency: baseCurrency,
    balance: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        currency: initialData.currency,
        balance: initialData.balance.toString()
      });
    }
  }, [initialData, baseCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = parseFloat(formData.balance);
    
    try {
      const url = initialData ? `/api/accounts/${initialData.id}` : '/api/accounts';
      const method = initialData ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, balance: amount || 0 })
      });
      
      if (!res.ok) throw new Error();
      
      playUiSound('success');
      onSuccess();
      onClose();
    } catch (err) {
      setError(t('invalidData') || 'Error al guardar la cuenta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in">
       <div className="glass-premium p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition">
             <X size={24} />
          </button>
          
          <div className="mb-8">
             <h3 className="text-3xl font-manrope font-black dark:text-white">
                {initialData ? t('editAccount') || 'Editar Cuenta' : t('newAccount') || 'Nueva Cuenta'}
             </h3>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Detalles de tu billetera</p>
          </div>

          {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('accountName')}</label>
                <input 
                   required
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-medium"
                   placeholder="Ej. Efectivo, Banco, etc."
                />
             </div>

             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('accountCurrency')}</label>
                <select 
                   value={formData.currency}
                   onChange={e => setFormData({...formData, currency: e.target.value as Currency})}
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold"
                >
                   {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('initialBalance')}</label>
                <input 
                   type="number" step="0.01"
                   value={formData.balance}
                   onChange={e => setFormData({...formData, balance: e.target.value})}
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold text-xl"
                   placeholder="0.00"
                />
             </div>

             <button 
                type="submit"
                className="w-full p-5 rounded-3xl bg-primary text-white font-manrope font-black text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
             >
                <Save size={24} /> {initialData ? t('saveBtn') || 'Guardar' : t('add') || 'Crear'}
             </button>
          </form>
       </div>
    </div>
  );
};

export default AccountForm;
