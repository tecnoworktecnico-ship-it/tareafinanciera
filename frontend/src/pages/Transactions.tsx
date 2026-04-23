import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { History, Plus, HelpCircle, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-center'; // wait, it's lucide-react
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'; // actually let's just use lucide-react for all
import HelpModal from '../components/HelpModal';
import TransactionForm from '../components/TransactionForm';
import TransactionDetailModal from '../components/TransactionDetailModal';

// I need to make sure I import lucide-react correctly
import * as Lucide from 'lucide-react';

const Transactions = () => {
  const { t, playUiSound, loadingRates, transactions, fetchTransactions, displayCurrency, visualConvert, convert, formatMoney, accounts } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const filteredTx = React.useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      const matchesDateFrom = !filterDateFrom || tx.timestamp >= filterDateFrom;
      const matchesDateTo = !filterDateTo || tx.timestamp <= filterDateTo;
      
      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [transactions, searchTerm, filterType, filterDateFrom, filterDateTo]);

  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const paginatedTx = filteredTx.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loadingRates) return (
    <div className="flex h-96 items-center justify-center">
      <Lucide.Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <header className="flex justify-between items-center glass p-8 rounded-[2.5rem] shadow-xl">
        <h2 className="text-4xl font-manrope font-black text-[#191c1d] dark:text-white flex items-center gap-4">
           <Lucide.History className="text-primary w-10 h-10" /> {t('transactions')}
        </h2>
        <div className="flex gap-3">
           <button onClick={() => setShowHelp(true)} className="p-4 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm">
              <Lucide.HelpCircle className="text-gray-500 dark:text-gray-300" size={24} />
           </button>
           <button 
             onClick={() => { playUiSound('click'); setShowForm(true); }}
             className="bg-primary text-white flex items-center gap-3 px-8 py-4 rounded-2xl font-black font-manrope shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
           >
              <Lucide.Plus size={24} /> {t('addTransaction')}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-2 relative">
            <Lucide.Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
               type="text" 
               placeholder={t('searchPlaceholder')} 
               value={searchTerm}
               onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
               className="w-full pl-14 pr-6 py-5 rounded-[2rem] glass border-none outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary transition font-manrope font-bold text-lg"
            />
         </div>
         <select 
           value={filterType} 
           onChange={e => { setFilterType(e.target.value); setPage(1); }}
           className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] ring-1 ring-gray-100 font-black font-manrope outline-none appearance-none shadow-sm"
         >
            <option value="ALL">{t('allTypes')}</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Gastos</option>
            <option value="TRANSFER">Transferencias</option>
         </select>
         <div className="flex gap-2">
            <input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl ring-1 ring-gray-100 font-bold outline-none" />
            <input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl ring-1 ring-gray-100 font-bold outline-none" />
         </div>
      </div>

      <div className="space-y-4">
         {paginatedTx.map(tx => (
            <div 
               key={tx.id} 
               onClick={() => setSelectedTx(tx)}
               className="group glass-premium p-6 rounded-[2rem] flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-transparent hover:border-primary/10 shadow-sm hover:shadow-md"
            >
               <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                     tx.type === 'INCOME' ? 'bg-green-100 text-green-600' : 
                     tx.type === 'TRANSFER' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                  }`}>
                     {tx.type === 'INCOME' ? <Lucide.Plus size={24} /> : <Lucide.History size={24} />}
                  </div>
                  <div>
                     <p className="font-manrope font-black text-lg dark:text-white leading-tight">{tx.description}</p>
                     <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">{tx.category}</span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>
               
               <div className="text-right">
                  <p className={`text-xl font-manrope font-black ${
                     tx.type === 'INCOME' ? 'text-green-600' : tx.type === 'TRANSFER' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                     {tx.type === 'INCOME' ? '+' : tx.type === 'TRANSFER' ? '' : '-'}{formatMoney(tx.amount, tx.currency)}
                  </p>
                  {tx.currency !== displayCurrency && (
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">
                        ≈ {formatMoney(visualConvert(convert(tx.amount, tx.currency)), displayCurrency)}
                     </p>
                  )}
               </div>
            </div>
         ))}

         {filteredTx.length === 0 && (
           <div className="text-center py-20 glass rounded-[3.5rem] border-2 border-dashed border-primary/10">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/20">
                 <Lucide.History size={48} />
              </div>
              <h3 className="text-2xl font-manrope font-black dark:text-white">No se encontraron movimientos</h3>
              <p className="text-gray-400 font-medium mt-2">Intenta ajustar los filtros o la búsqueda</p>
           </div>
         )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-12 pb-10">
           <button 
              disabled={page === 1}
              onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
              className="p-4 glass rounded-2xl disabled:opacity-30 hover:bg-white transition-all shadow-sm active:scale-90"
           >
              <Lucide.ChevronLeft size={24} />
           </button>
           <div className="flex items-center gap-2">
              <span className="font-manrope font-black text-xl text-primary">{page}</span>
              <span className="font-manrope font-bold text-gray-400">/ {totalPages}</span>
           </div>
           <button 
              disabled={page === totalPages}
              onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages, p + 1)); }}
              className="p-4 glass rounded-2xl disabled:opacity-30 hover:bg-white transition-all shadow-sm active:scale-90"
           >
              <Lucide.ChevronRight size={24} />
           </button>
        </div>
      )}

      {showForm && (
        <TransactionForm 
           initialData={editingTx}
           accounts={accounts}
           onClose={() => { setShowForm(false); setEditingTx(null); }}
           onSuccess={() => { fetchTransactions(); setShowForm(false); setEditingTx(null); }}
        />
      )}

      {selectedTx && (
        <TransactionDetailModal 
           transaction={selectedTx}
           onClose={() => setSelectedTx(null)}
           onEdit={() => { 
             setEditingTx(selectedTx); 
             setSelectedTx(null); 
             setShowForm(true); 
           }}
           onDeleteSuccess={() => {
             fetchTransactions();
             setSelectedTx(null);
           }}
        />
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('transactions')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
           <p>{t('helpTxIntro')}</p>
           <section>
              <h4 className="font-bold text-gray-800 dark:text-white">{t('helpTxFilterTitle')}</h4>
              <p className="text-sm">{t('helpTxFilterBody')}</p>
           </section>
           <section>
              <h4 className="font-bold text-gray-800 dark:text-white">{t('helpTxDetailsTitle')}</h4>
              <p className="text-sm">{t('helpTxDetailsBody')}</p>
           </section>
        </div>
      </HelpModal>
    </div>
  );
};

export default Transactions;
