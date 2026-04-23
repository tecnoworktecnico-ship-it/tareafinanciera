import React from 'react';
import { X, History } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface AccountDetailModalProps {
  account: any;
  transactions: any[];
  onClose: () => void;
  showBalances: boolean;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({ account, transactions, onClose, showBalances }) => {
  const { formatMoney, visualConvert, convert, displayCurrency, t } = useAppContext();

  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
       <div className="glass-premium p-10 rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-8">
             <div>
               <h2 className="text-3xl font-manrope font-black dark:text-white">{account.name}</h2>
               <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                  Balance Actual: <span className="text-primary">{showBalances ? formatMoney(account.balance, account.currency) : '****'}</span>
               </p>
                {showBalances && account.currency !== displayCurrency && (
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      ≈ {formatMoney(visualConvert(convert(account.balance, account.currency)), displayCurrency)}
                   </p>
                )}
             </div>
             <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition">
                <X size={24} />
             </button>
          </div>

          <div className="space-y-4 surface-card p-6 rounded-[2rem] max-h-[400px] overflow-y-auto">
             <div className="flex items-center gap-2 mb-4">
                <History size={16} className="text-primary" />
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('recentHistory') || 'Historial Reciente'}</h3>
             </div>
             
             {transactions.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10 italic">No hay transacciones aún.</div>
             ) : (
                transactions.map(tx => {
                   const isOutgoing = tx.accountId === account.id && tx.type !== 'INCOME';
                   const isIncoming = tx.targetAccountId === account.id || tx.type === 'INCOME';
                   return (
                     <div key={tx.id} className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-primary/20 transition-all">
                        <div>
                           <p className="text-sm font-bold dark:text-white">{tx.description}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.timestamp).toLocaleDateString()} • {tx.type === 'TRANSFER' ? 'Transferencia' : tx.category}</p>
                        </div>
                        <div className={`text-right ${isIncoming ? 'text-green-500' : 'text-red-500'}`}>
                           <p className="font-black font-manrope">{isIncoming ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}</p>
                           {tx.currency !== displayCurrency && (
                             <p className="text-[10px] font-bold text-gray-400 opacity-60">≈ {formatMoney(visualConvert(convert(tx.amount, tx.currency)), displayCurrency)}</p>
                           )}
                        </div>
                     </div>
                   )
                })
             )}
          </div>
       </div>
    </div>
  );
};

export default AccountDetailModal;
