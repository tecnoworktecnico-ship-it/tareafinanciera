import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TransferFormProps {
  accounts: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ accounts, onClose, onSuccess }) => {
  const { t, playUiSound } = useAppContext();
  const [formData, setFormData] = useState({
    accountId: '',
    targetAccountId: '',
    amount: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = parseFloat(formData.amount);
    
    if (formData.accountId === formData.targetAccountId) {
       return setError('Las cuentas de origen y destino deben ser diferentes');
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount,
          type: 'TRANSFER',
          category: 'Transferencia',
          description: 'Transferencia entre cuentas',
          currency: accounts.find(a => a.id === formData.accountId)?.currency || 'USD'
        })
      });
      
      if (!res.ok) throw new Error();
      
      playUiSound('success');
      onSuccess();
      onClose();
    } catch (err) {
      setError(t('transferError') || 'Error en la transferencia');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in">
       <div className="glass-premium p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition">
             <X size={24} />
          </button>
          
          <div className="mb-8">
             <h3 className="text-3xl font-manrope font-black dark:text-white">{t('transferFunds')}</h3>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Mueve capital entre cuentas</p>
          </div>

          {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('fromAccount')}</label>
                <select 
                   required
                   value={formData.accountId}
                   onChange={e => setFormData({...formData, accountId: e.target.value})}
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold"
                >
                   <option value="">{t('selectOption')}</option>
                   {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                </select>
             </div>

             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('toAccount')}</label>
                <select 
                   required
                   value={formData.targetAccountId}
                   onChange={e => setFormData({...formData, targetAccountId: e.target.value})}
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold"
                >
                   <option value="">{t('selectOption')}</option>
                   {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                </select>
             </div>

             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('amountToSend')}</label>
                <input 
                   type="number" step="0.01" required
                   value={formData.amount}
                   onChange={e => setFormData({...formData, amount: e.target.value})}
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition font-bold text-xl"
                   placeholder="0.00"
                />
             </div>

             <button 
                type="submit"
                className="w-full p-5 rounded-3xl bg-purple-500 text-white font-manrope font-black text-lg shadow-xl shadow-purple/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
             >
                <Send size={24} /> {t('confirmTransfer')}
             </button>
          </form>
       </div>
    </div>
  );
};

export default TransferForm;
