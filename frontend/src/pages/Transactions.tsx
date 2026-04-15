import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Currency, TransactionType } from '@finan/shared';
import { ArrowRightLeft, ArrowUpRight, ArrowDownRight, Plus, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';

const Transactions = () => {
  const { t, baseCurrency, playUiSound } = useAppContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [newTx, setNewTx] = useState({ description: '', amount: '', category: 'food', type: TransactionType.EXPENSE, currency: baseCurrency, accountId: '' });
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const predefinedCats = ['food', 'transport', 'subscriptions', 'shopping', 'other'];

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(console.error);
      
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        if(data.length > 0) setNewTx(prev => ({...prev, accountId: data[0].id}));
      })
      .catch(console.error);

    setNewTx(prev => ({...prev, currency: baseCurrency}));
  }, [baseCurrency]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!newTx.description.trim()) return setFormError(t('invalidData'));
    const numAmount = parseFloat(newTx.amount);
    if (isNaN(numAmount) || numAmount <= 0) return setFormError(t('invalidData'));

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newTx, amount: numAmount })
        });
        const data = await res.json();
        if (!res.ok) {
            setFormError(data.error + (data.details ? ": " + data.details[0].message : ""));
        } else {
            setTransactions([data, ...transactions]);
            setNewTx({ description: '', amount: '', category: 'food', type: TransactionType.EXPENSE, currency: baseCurrency, accountId: accounts.length > 0 ? accounts[0].id : '' });
            setShowForm(false);
            playUiSound('success');
        }
    } catch(err: any) {
        setFormError(t('connectionError'));
    }
  };

  const getAccountName = (id: string | null) => {
    if (!id) return '-';
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : id;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <ArrowRightLeft className="text-primary" /> {t('transactions')}
        </h2>
        <div className="flex gap-2">
          <button 
             onClick={() => { playUiSound('click'); setShowHelp(true); }}
             className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-slate-600 transition"
             title="Ayuda de Transacciones"
          >
            <HelpCircle size={18} />
          </button>
          <button 
             onClick={() => { playUiSound('click'); setShowForm(!showForm); }}
             className="bg-primary text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Plus size={18} /> {t('addTransaction')}
          </button>
        </div>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('transactions')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpTxIntro')}</p>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpTxAddTitle')}</h4>
            <p className="text-sm">{t('helpTxAddBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpTxAccountTitle')}</h4>
            <p className="text-sm">{t('helpTxAccountBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpTxReceiptTitle')}</h4>
            <p className="text-sm">{t('helpTxReceiptBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpTxCategoryTitle')}</h4>
            <p className="text-sm">{t('helpTxCategoryBody')}</p>
          </section>
        </div>
      </HelpModal>

      {/* Add Form (Collapsible) */}
      {showForm && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
          {formError && <div className="mb-4 text-red-500 text-sm font-medium">{formError}</div>}
          <form onSubmit={handleAddTransaction} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('description')}</label>
              <input type="text" required value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full bg-transparent border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm focus:ring-primary dark:text-white" />
            </div>
            
            <div className="w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Cuenta</label>
              <select required value={newTx.accountId} onChange={e => setNewTx({...newTx, accountId: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                 <option value="" disabled>Seleccionar</option>
                 {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>

            <div className="w-[100px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('amount')}</label>
              <input type="number" step="0.01" required value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full bg-transparent border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm focus:ring-primary dark:text-white" />
            </div>
            <div className="w-[100px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('currency')}</label>
              <select value={newTx.currency} onChange={e => setNewTx({...newTx, currency: e.target.value as Currency})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                 {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
             <div className="w-[120px] flex flex-col justify-end">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('category')}</label>
              {!isCustomCat ? (
                <select value={newTx.category} onChange={e => {
                  if(e.target.value === 'custom') { setIsCustomCat(true); setNewTx({...newTx, category: ''}); }
                  else { setNewTx({...newTx, category: e.target.value}); }
                }} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                   {predefinedCats.map(c => <option key={c} value={c}>{t(c as any) || c}</option>)}
                   <option value="custom" className="font-bold text-primary">+ Nuevo</option>
                </select>
              ) : (
                <input type="text" required autoFocus value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} onBlur={() => {!newTx.category.trim() && setIsCustomCat(false);}} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white" placeholder="Custom..." />
              )}
            </div>
            <div className="w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('type')}</label>
              <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})} className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 border rounded-lg px-3 py-2 text-sm dark:text-white">
                <option value="EXPENSE">{t('expense')}</option>
                <option value="INCOME">{t('income')}</option>
              </select>
            </div>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-600 transition shadow h-[38px]">{t('add')}</button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-[0_4px_24px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 pb-2 divide-y divide-gray-50 dark:divide-slate-700/50">
          {transactions.map(tx => (
            <div key={tx.id} onClick={() => { playUiSound('click'); setSelectedTx(tx); }} className="p-3 my-1 flex justify-between items-center group cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-700/50 rounded-xl transition duration-200">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition ${tx.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-900/30 text-income' : tx.type === 'TRANSFER' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' : 'bg-red-100 dark:bg-red-900/30 text-expense'}`}>
                   {tx.type === TransactionType.INCOME ? <ArrowUpRight size={20} /> : tx.type === 'TRANSFER' ? <ArrowRightLeft size={20} /> : <ArrowDownRight size={20}/>}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{tx.description}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{tx.category} • {getAccountName(tx.accountId)}</p>
                </div>
              </div>
              <div className={`text-lg font-bold ${tx.type === TransactionType.INCOME ? 'text-income' : tx.type === 'TRANSFER' ? 'text-purple-500' : 'text-gray-800 dark:text-gray-100'}`}>
                {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toFixed(2)} <span className="text-sm font-medium text-gray-400 ml-1">{tx.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedTx(null)}>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-10" onClick={e=>e.stopPropagation()}>
              <div className="text-center mb-6">
                 <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedTx.type === 'INCOME' ? 'bg-green-100 text-green-500' : selectedTx.type === 'TRANSFER' ? 'bg-purple-100 text-purple-500' : 'bg-red-100 text-red-500'}`}>
                    {selectedTx.type === 'INCOME' ? <ArrowUpRight size={32} /> : selectedTx.type === 'TRANSFER' ? <ArrowRightLeft size={32} /> : <ArrowDownRight size={32}/>}
                 </div>
                 <h2 className="text-3xl font-black dark:text-white mb-1">{selectedTx.type === 'INCOME' ? '+' : '-'}{selectedTx.amount} {selectedTx.currency}</h2>
                 <p className="text-gray-500 dark:text-gray-400 font-medium">{selectedTx.description}</p>
              </div>

              <div className="space-y-4 bg-gray-50 dark:bg-slate-900/50 p-5 rounded-2xl">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Categoría</span>
                   <span className="font-semibold dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">{selectedTx.category}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Fecha</span>
                   <span className="font-medium dark:text-white">{selectedTx.timestamp}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">{selectedTx.type === 'TRANSFER' ? 'Origen' : 'Cuenta'}</span>
                   <span className="font-medium dark:text-white">{getAccountName(selectedTx.accountId)}</span>
                 </div>
                 {selectedTx.type === 'TRANSFER' && selectedTx.targetAccountId && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 dark:text-gray-400">Destino</span>
                     <span className="font-medium dark:text-white">{getAccountName(selectedTx.targetAccountId)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                   <span className="text-gray-500 dark:text-gray-400">ID Transacción</span>
                   <span className="font-mono text-gray-400 text-xs">{selectedTx.id}</span>
                 </div>
              </div>

              <button onClick={() => setSelectedTx(null)} className="mt-8 w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold py-3 rounded-xl transition">
                 Cerrar recibo
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
