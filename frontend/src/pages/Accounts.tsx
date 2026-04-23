import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { WalletCards, Plus, CreditCard, Send, Eye, EyeOff, HelpCircle, Trash2, Pencil } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import AccountForm from '../components/AccountForm';
import AccountDetailModal from '../components/AccountDetailModal';
import TransferForm from '../components/TransferForm';

const Accounts = () => {
  const { t, playUiSound, displayCurrency, convert, visualConvert, formatMoney, transactions } = useAppContext();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  
  const fetchAccounts = () => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const accountTxs = useMemo(() => {
    if (!selectedAccount) return [];
    return transactions.filter((t: any) => t.accountId === selectedAccount.id || t.targetAccountId === selectedAccount.id)
                       .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedAccount, transactions]);

  const handleDeleteAccount = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('confirmDelete') || '¿Eliminar esta cuenta?')) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      playUiSound('click');
      fetchAccounts();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <header className="flex justify-between items-center glass p-6 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-manrope font-extrabold text-[#191c1d] dark:text-white flex items-center gap-3">
           <WalletCards className="text-primary w-8 h-8" /> {t('accounts')}
        </h2>
        <div className="flex gap-2">
            <button 
               onClick={() => { playUiSound('click'); setShowHelp(true); }}
               className="p-3 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm mr-2"
            >
              <HelpCircle className="text-gray-500 dark:text-gray-300" />
            </button>
            <button 
               onClick={() => { playUiSound('click'); setShowBalances(!showBalances); }}
               className="p-3 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm mr-2"
            >
              {showBalances ? <EyeOff className="text-gray-500" /> : <Eye className="text-gray-500" />}
            </button>
            <button 
               onClick={() => { playUiSound('click'); setShowTransferForm(true); }}
               className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-purple/20 hover:shadow-purple/40 transition-all"
            >
              <Send size={18} /> {t('transferFunds')}
            </button>
            <button 
               onClick={() => { playUiSound('click'); setShowAddForm(true); }}
               className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all ml-2"
            >
              <Plus size={18} /> {t('add')}
            </button>
        </div>
      </header>

      {accounts.length === 0 ? (
        <div className="text-center py-20 glass rounded-[3rem]">
           <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <WalletCards size={40} />
           </div>
           <h3 className="text-xl font-bold text-gray-500">No hay cuentas aún</h3>
           <p className="text-gray-400 text-sm mt-1">Crea una para comenzar a registrar movimientos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {accounts.map((acc) => (
             <div key={acc.id} onClick={() => { playUiSound('click'); setSelectedAccount(acc); }} className="cursor-pointer relative bg-gradient-to-br from-[#191c1d] to-slate-900 dark:from-slate-800 dark:to-slate-950 rounded-[2.5rem] p-8 shadow-2xl text-white overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                   <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                     <CreditCard size={28} className="text-primary-light" />
                   </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); setEditingAccount(acc); setShowAddForm(true); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition backdrop-blur-md">
                          <Pencil size={18} />
                       </button>
                       <button onClick={(e) => handleDeleteAccount(acc.id, e)} className="p-3 bg-white/10 hover:bg-red-500/80 rounded-xl transition backdrop-blur-md">
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </div>

                <div className="relative z-10">
                  <p className="text-gray-400 text-[10px] font-black tracking-[0.2em] uppercase mb-2">{acc.name}</p>
                  <h3 className="text-3xl font-manrope font-black tracking-tight mb-2">
                    {showBalances ? formatMoney(acc.balance, acc.currency) : '••••••'}
                  </h3>
                  {showBalances && acc.currency !== displayCurrency && (
                    <p className="text-xs font-bold text-gray-400 opacity-60 uppercase tracking-widest">
                       ≈ {formatMoney(visualConvert(convert(acc.balance, acc.currency)), displayCurrency)}
                    </p>
                  )}
                </div>
             </div>
           ))}
        </div>
      )}

      {showAddForm && (
        <AccountForm 
           initialData={editingAccount}
           onClose={() => { setShowAddForm(false); setEditingAccount(null); }}
           onSuccess={fetchAccounts}
        />
      )}

      {showTransferForm && (
        <TransferForm 
           accounts={accounts}
           onClose={() => setShowTransferForm(false)}
           onSuccess={fetchAccounts}
        />
      )}

      {selectedAccount && (
        <AccountDetailModal 
           account={selectedAccount}
           transactions={accountTxs}
           showBalances={showBalances}
           onClose={() => setSelectedAccount(null)}
        />
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('accounts')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpAccIntro')}</p>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAccCreateTitle')}</h4>
            <p className="text-sm">{t('helpAccCreateBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAccTransferTitle')}</h4>
            <p className="text-sm">{t('helpAccTransferBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAccPrivacyTitle')}</h4>
            <p className="text-sm">{t('helpAccPrivacyBody')}</p>
          </section>
        </div>
      </HelpModal>
    </div>
  );
};

export default Accounts;

