import React from 'react';
import { Trash2, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface BudgetItemProps {
  budget: any;
  onDelete: (id: string) => void;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ budget, onDelete }) => {
  const { formatMoney, displayCurrency, t } = useAppContext();
  
  const isOver = budget.percentage > 100;
  const isNear = budget.percentage > 80 && !isOver;

  return (
    <div className="glass-premium p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group border border-transparent hover:border-primary/10 transition-all">
       <div className="flex justify-between items-start relative z-10">
          <div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{budget.category}</h4>
             <p className="text-3xl font-manrope font-black dark:text-white">
                {formatMoney(budget.spent)} <span className="text-sm font-bold text-gray-400">/ {formatMoney(budget.limitInDisplay)}</span>
             </p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => onDelete(budget.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
               <Trash2 size={20} />
             </button>
             <div className={`p-4 rounded-2xl shadow-sm ${isOver ? 'bg-red-100 text-red-600' : isNear ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {isOver ? <AlertTriangle size={24} /> : isNear ? <TrendingDown size={24} /> : <CheckCircle2 size={24} />}
             </div>
          </div>
       </div>

       <div className="space-y-3 relative z-10">
          <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
             <span>{t('progressIn')} {displayCurrency}</span>
             <span className={isOver ? 'text-red-500' : isNear ? 'text-orange-500' : 'text-green-600'}>{budget.percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
             <div 
                className={`h-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-500' : isNear ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
             ></div>
          </div>
       </div>
       
       {isOver && (
         <div className="flex items-center gap-2 text-xs text-red-500 font-black uppercase tracking-tighter animate-bounce mt-2">
           <AlertTriangle size={14} /> {t('spendingExceeded')}!
         </div>
       )}
    </div>
  );
};

export default BudgetItem;
