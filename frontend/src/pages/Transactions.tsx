import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Currency, TransactionType } from '@finan/shared';
import { ArrowRightLeft, ArrowUpRight, ArrowDownRight, Plus, HelpCircle, Search, Filter, History, Loader2 } from 'lucide-react';
import HelpModal from '../components/HelpModal';

const Transactions = () => {
  const { t, baseCurrency, displayCurrency, playUiSound, convert, visualConvert, formatMoney, loadingRates, categories, addCategory } = useAppContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [newTx, setNewTx] = useState({ description: '', amount: '', category: categories[0] || 'food', type: TransactionType.EXPENSE, currency: baseCurrency, accountId: '' });
  const [showHelp, setShowHelp] = useState(false);

  // Sync category state when categories load
  useEffect(() => {
    if (categories.length > 0 && !newTx.category) {
       setNewTx(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const handleCategoryChange = async (val: string) => {
    if (val === 'NEW_CAT') {
       const name = prompt("Nombre de la nueva categoría:");
       if (name) {
          const success = await addCategory(name);
          if (success) {
             setNewTx(prev => ({ ...prev, category: name }));
             playUiSound('success');
          }
       }
    } else {
       setNewTx(prev => ({ ...prev, category: val }));
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, accRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/accounts')
        ]);
        const txs = await txRes.json();
        const accs = await accRes.json();
        setTransactions(txs);
        setAccounts(accs);
        if (accs.length > 0) setNewTx(prev => ({...prev, accountId: accs[0].id}));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const numAmountOrig = parseFloat(newTx.amount);
    if (isNaN(numAmountOrig)) return;

    // We convert everything to ARS for the database (Account Base)
    const amountARS = convert(numAmountOrig, newTx.currency);

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newTx, amount: amountARS, currency: 'ARS' })
        });
        const data = await res.json();
        if (!res.ok) {
            setFormError(data.error + (data.details ? ": " + data.details[0].message : ""));
        } else {
            setTransactions([data, ...transactions]);
            setNewTx({ ...newTx, description: '', amount: '' });
            setShowForm(false);
            playUiSound('success');
        }
    } catch(err: any) {
        setFormError(t('connectionError'));
    }
  };

  const filteredTx = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingRates) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex justify-between items-center glass p-6 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-manrope font-extrabold text-[#191c1d] dark:text-white flex items-center gap-3">
           <History className="text-primary w-8 h-8" /> {t('transactions')}
        </h2>
        <div className="flex gap-2">
           <button onClick={() => setShowHelp(true)} className="p-3 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm mr-2">
              <HelpCircle className="text-gray-500 dark:text-gray-300" />
           </button>
           <button 
             onClick={() => { playUiSound('click'); setShowForm(!showForm); }}
             className="gradient-cta flex items-center gap-2 px-6 py-3 rounded-2xl font-bold font-manrope shadow-lg hover:scale-105 transition"
           >
              <Plus size={20} /> {t('addTransaction')}
           </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
               type="text" 
               placeholder="Busca por descripción o categoría..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-4 rounded-3xl surface-card border-none outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary transition font-manrope font-medium"
            />
         </div>
      </div>

      {showForm && (
        <div className="glass-premium p-8 rounded-[2rem] space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
           <h3 className="text-xl font-bold font-manrope">Nueva Transacción Multidivisa</h3>
           {formError && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{formError}</div>}
           <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                 <label className="block text-xs font-black uppercase text-gray-400 mb-2">{t('description')}</label>
                 <input type="text" required value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-black uppercase text-gray-400 mb-2">Monto</label>
                   <input type="number" step="0.01" required value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase text-gray-400 mb-2">Divisa</label>
                   <select value={newTx.currency} onChange={e => setNewTx({...newTx, currency: e.target.value as Currency})} className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition appearance-none">
                      {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>
               <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Categoría</label>
                  <select 
                     value={newTx.category} 
                     onChange={e => handleCategoryChange(e.target.value)} 
                     className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition appearance-none font-medium"
                  >
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     <option value="NEW_CAT" className="font-bold text-primary">+ Nueva Categoría...</option>
                  </select>
               </div>
              <div>
                 <label className="block text-xs font-black uppercase text-gray-400 mb-2">Cuenta</label>
                 <select value={newTx.accountId} onChange={e => setNewTx({...newTx, accountId: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition appearance-none">
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                 </select>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Previsualización (Base ARS)</label>
                    <div className="p-4 bg-primary/5 rounded-2xl text-primary font-bold">
                       {formatMoney(convert(parseFloat(newTx.amount) || 0, newTx.currency), 'ARS')}
                    </div>
                  </div>
               </div>
               <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition">
                     Cancelar
                  </button>
                  <button type="submit" className="gradient-cta px-12 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition">
                     Confirmar {t('addTransaction')}
                  </button>
               </div>
           </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredTx.map((tx, i) => (
          <div 
            key={tx.id} 
            onClick={() => { playUiSound('click'); setSelectedTx(tx); }} 
            className="surface-card p-6 rounded-3xl flex items-center justify-between hover:translate-x-2 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${tx.type === TransactionType.INCOME ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {tx.type === TransactionType.INCOME ? <ArrowUpRight /> : <ArrowDownRight />}
               </div>
               <div>
                  <p className="text-lg font-manrope font-bold">{tx.description}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tx.category} • {tx.timestamp}</p>
               </div>
            </div>
            <div className="text-right">
                    <p className="text-2xl font-manrope font-black truncate max-w-[200px] md:max-w-none">
                       {tx.type === TransactionType.INCOME ? '+' : '-'} {formatMoney(visualConvert(tx.amount))}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400">Original: {formatMoney(tx.amount, 'ARS')}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedTx(null)}>
           <div className="glass-premium p-10 rounded-[2.5rem] w-full max-w-md" onClick={e=>e.stopPropagation()}>
               <div className="text-center mb-8">
                  <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${selectedTx.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {selectedTx.type === 'INCOME' ? <ArrowUpRight size={40} /> : <ArrowDownRight size={40}/>}
                  </div>
                  <h2 className="text-4xl font-manrope font-black mb-2">{formatMoney(selectedTx.amount, selectedTx.currency)}</h2>
                  <p className="text-primary font-bold tracking-widest uppercase text-xs">≈ {formatMoney(convert(selectedTx.amount, selectedTx.currency))}</p>
               </div>
               
               <div className="space-y-4 surface-card p-6 rounded-3xl mb-8">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400 font-bold uppercase text-[10px]">Descripción</span>
                     <span className="font-bold">{selectedTx.description}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400 font-bold uppercase text-[10px]">Categoría</span>
                     <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold">{selectedTx.category}</span>
                  </div>
               </div>

               <button onClick={() => setSelectedTx(null)} className="w-full p-4 rounded-2xl font-bold bg-gray-100 dark:bg-slate-700 transition">Cerrar</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
