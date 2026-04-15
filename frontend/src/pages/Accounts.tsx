import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { WalletCards, Plus, CreditCard, Send, X, Eye, EyeOff, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import { Currency } from '@finan/shared';

const Accounts = () => {
  const { t, baseCurrency, playUiSound } = useAppContext();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [formError, setFormError] = useState<string|null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [accountTxs, setAccountTxs] = useState<any[]>([]);
  
  // Forms
  const [newAcc, setNewAcc] = useState({ name: '', currency: baseCurrency, balance: '' });
  const [transfer, setTransfer] = useState({ accountId: '', targetAccountId: '', amount: '' });

  const fetchAccounts = () => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetch('/api/transactions')
        .then(res => res.json())
        .then(data => setAccountTxs(data.filter((t: any) => t.accountId === selectedAccount.id || t.targetAccountId === selectedAccount.id)))
        .catch(console.error);
    }
  }, [selectedAccount]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    let nBal = parseFloat(newAcc.balance);
    if(isNaN(nBal)) nBal = 0;
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: newAcc.name, currency: newAcc.currency, balance: nBal })
      });
      if (!res.ok) throw new Error('Error saving');
      setShowAddForm(false);
      setNewAcc({ name: '', currency: baseCurrency, balance: '' });
      playUiSound('success');
      fetchAccounts();
    } catch(err) {
      setFormError(t('invalidData') || 'Error');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
     e.preventDefault();
     setFormError(null);
     const amount = parseFloat(transfer.amount);
     if(isNaN(amount) || amount <= 0 || !transfer.accountId || !transfer.targetAccountId || transfer.accountId === transfer.targetAccountId) return setFormError('Error logic');
     
     try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
             accountId: transfer.accountId, 
             targetAccountId: transfer.targetAccountId, 
             amount, 
             type: 'TRANSFER', 
             category: 'Transferencia', 
             description: 'Transferencia a otra cuenta', 
             currency: accounts.find(a=>a.id===transfer.accountId)?.currency || 'USD' 
          })
        });
        if (!res.ok) throw new Error();
        setShowTransferForm(false);
        setTransfer({ accountId: '', targetAccountId: '', amount: '' });
        playUiSound('success');
        fetchAccounts();
     } catch {
        setFormError('Error de Transferencia');
     }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <WalletCards className="text-primary" /> {t('accounts')}
        </h2>
        <div className="flex gap-2">
            <button 
               onClick={() => { playUiSound('click'); setShowHelp(true); }}
               className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-slate-600 transition"
               title="Ayuda de Cuentas"
            >
              <HelpCircle size={18} />
            </button>
            <button 
               onClick={() => { playUiSound('click'); setShowBalances(!showBalances); }}
               className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg font-medium shadow hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center"
               title="Ocular/Mostrar saldos"
            >
              {showBalances ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button 
               onClick={() => { playUiSound('click'); setShowTransferForm(true); }}
               className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-purple-600 transition flex items-center gap-2"
            >
              <Send size={18} /> Transferir
            </button>
            <button 
               onClick={() => { playUiSound('click'); setShowAddForm(true); }}
               className="bg-primary text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-600 transition flex items-center gap-2"
            >
              <Plus size={18} /> {t('add')}
            </button>
        </div>
      </header>

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
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpAccHistoryTitle')}</h4>
            <p className="text-sm">{t('helpAccHistoryBody')}</p>
          </section>
        </div>
      </HelpModal>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-10">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold dark:text-white">Nueva Cuenta</h3>
                 <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-red-500"><X/></button>
              </div>
              {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
              <form onSubmit={handleAddAccount} className="space-y-4">
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                    <input type="text" required value={newAcc.name} onChange={e=>setNewAcc({...newAcc, name: e.target.value})} className="w-full bg-transparent border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white"/>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Moneda</label>
                    <select value={newAcc.currency} onChange={e=>setNewAcc({...newAcc, currency: e.target.value})} className="w-full bg-transparent border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                      {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Balance Inicial</label>
                    <input type="number" step="0.01" value={newAcc.balance} onChange={e=>setNewAcc({...newAcc, balance: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white"/>
                 </div>
                 <button type="submit" className="w-full bg-primary text-white font-semibold py-2 rounded-lg shadow hover:bg-blue-600 transition">Agregar Cuenta</button>
              </form>
           </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferForm && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-10">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold dark:text-white">Transferir Fondos</h3>
                 <button onClick={() => setShowTransferForm(false)} className="text-gray-400 hover:text-red-500"><X/></button>
              </div>
              {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
              <form onSubmit={handleTransfer} className="space-y-4">
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Desde Cuenta</label>
                    <select required value={transfer.accountId} onChange={e=>setTransfer({...transfer, accountId: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                      <option value="">Seleccione...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Hacia Cuenta</label>
                    <select required value={transfer.targetAccountId} onChange={e=>setTransfer({...transfer, targetAccountId: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                      <option value="">Seleccione...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Monto a Enviar</label>
                    <input type="number" step="0.01" required value={transfer.amount} onChange={e=>setTransfer({...transfer, amount: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white"/>
                 </div>
                 <button type="submit" className="w-full bg-purple-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-purple-600 transition">Confirmar Transferencia</button>
              </form>
           </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-10 dark:text-gray-400">No hay cuentas. Crea una para comenzar.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {accounts.map((acc, i) => (
             <div key={acc.id} onClick={() => { playUiSound('click'); setSelectedAccount(acc); }} className="cursor-pointer relative bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 shadow-xl text-white overflow-hidden group hover:-translate-y-1 transition duration-300">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition duration-500 rounded-2xl rotate-45 scale-150 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-8">
                   <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
                     <CreditCard size={24} className="opacity-80" />
                   </div>
                   <div className="w-12 h-8 bg-gray-300/30 rounded flex items-center justify-center backdrop-blur">
                      <div className="w-8 h-5 border border-gray-400 rounded-sm grid grid-cols-3 grid-rows-2">
                        <div className="border-r border-b border-gray-400"></div><div className="border-b border-gray-400"></div><div className="border-l border-b border-gray-400"></div>
                        <div className="border-r border-gray-400"></div><div></div><div className="border-l border-gray-400"></div>
                      </div>
                   </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-1">{acc.name}</p>
                  <h3 className="text-2xl font-bold tracking-tight">{acc.currency} {showBalances ? acc.balance.toLocaleString() : '****'}</h3>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedAccount(null)}>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-10" onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-2xl font-bold dark:text-white">{selectedAccount.name}</h2>
                   <p className="text-gray-500 dark:text-gray-400">Balance Actual: <span className="font-bold text-gray-800 dark:text-white">{selectedAccount.currency} {showBalances ? selectedAccount.balance.toLocaleString() : '****'}</span></p>
                 </div>
                 <button onClick={() => setSelectedAccount(null)} className="text-gray-400 hover:text-red-500"><X/></button>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl max-h-[300px] overflow-y-auto">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Historial Reciente</h3>
                 {accountTxs.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-4">No hay transacciones aún.</div>
                 ) : (
                    accountTxs.map(tx => {
                       const isOutgoing = tx.accountId === selectedAccount.id && tx.type !== 'INCOME';
                       const isIncoming = tx.targetAccountId === selectedAccount.id || tx.type === 'INCOME';
                       return (
                         <div key={tx.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div>
                               <p className="text-sm font-bold dark:text-white">{tx.description}</p>
                               <p className="text-xs text-gray-500">{tx.timestamp} • {tx.type === 'TRANSFER' ? 'Transferencia' : tx.category}</p>
                            </div>
                            <div className={`font-bold ${isIncoming ? 'text-green-500' : 'text-gray-800 dark:text-white'}`}>
                               {isIncoming ? '+' : '-'}{tx.amount} <span className="text-xs font-normal">{tx.currency}</span>
                            </div>
                         </div>
                       )
                    })
                 )}
              </div>

           </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
