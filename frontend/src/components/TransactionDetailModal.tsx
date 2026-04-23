import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
  const { formatMoney, visualConvert, convert, displayCurrency, t } = useAppContext();

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
       <div className="glass-premium p-10 rounded-[2.5rem] w-full max-w-md" onClick={e => e.stopPropagation()}>
           <div className="text-center mb-8">
              <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${transaction.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                 {transaction.type === 'INCOME' ? <ArrowUpRight size={40} /> : <ArrowDownRight size={40}/>}
              </div>
              <h2 className="text-4xl font-manrope font-black mb-2">{formatMoney(transaction.amount, transaction.currency)}</h2>
              {transaction.currency !== displayCurrency && (
                <p className="text-primary font-bold tracking-widest uppercase text-xs">
                   ≈ {formatMoney(visualConvert(convert(transaction.amount, transaction.currency)), displayCurrency)}
                </p>
              )}
           </div>
           
           <div className="space-y-4 surface-card p-6 rounded-3xl mb-8">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-400 font-bold uppercase text-[10px]">{t('description')}</span>
                 <span className="font-bold">{transaction.description}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-400 font-bold uppercase text-[10px]">{t('category')}</span>
                 <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold">{transaction.category}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-400 font-bold uppercase text-[10px]">{t('date')}</span>
                 <span className="font-bold">{new Date(transaction.timestamp).toLocaleDateString()}</span>
              </div>
           </div>

           <button onClick={onClose} className="w-full p-4 rounded-2xl font-bold bg-gray-100 dark:bg-slate-700 transition">{t('close') || 'Cerrar'}</button>
       </div>
    </div>
  );
};

export default TransactionDetailModal;
