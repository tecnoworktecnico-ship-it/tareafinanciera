import React from 'react';
import { LayoutDashboard, WalletCards, ArrowRightLeft, PieChart, Settings, Target, Calculator } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentTab: string;
  setTab: (t: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const { t, playUiSound } = useAppContext();

  const menu = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('dashboard') },
    { id: 'accounts', icon: <WalletCards size={20} />, label: t('accounts') },
    { id: 'transactions', icon: <ArrowRightLeft size={20} />, label: t('transactions') },
    { id: 'budgets', icon: <Target size={20} />, label: t('budgets') },
    { id: 'analytics', icon: <PieChart size={20} />, label: t('analytics') },
    { id: 'calculator', icon: <Calculator size={20} />, label: t('calculatorLabel') },
    { id: 'settings', icon: <Settings size={20} />, label: t('settings') },
  ];

  return (
    <aside className="w-72 glass border-r-0 shadow-none flex flex-col transition-all duration-500 z-50">
      <div className="p-10">
        <h1 className="text-2xl font-manrope font-black text-[#191c1d] dark:text-white flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg gradient-cta animate-pulse shadow-lg shadow-primary/20"></div> 
          Smart<span className="text-primary">Pro</span>
        </h1>
      </div>
      
      <nav className="mt-4 flex-1 px-4 space-y-2">
        {menu.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playUiSound('click');
                setTab(item.id);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-700 text-white shadow-xl shadow-blue-700/30 font-bold scale-[1.02]' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-primary'}
              `}
            >
              <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-primary/70'}`}>
                {item.icon}
              </span>
              <span className="font-manrope tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-8">
        <div className="p-6 rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
           <p className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 tracking-widest mb-1">Plan Actual</p>
           <p className="text-sm font-bold">Premium Enterprise</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
