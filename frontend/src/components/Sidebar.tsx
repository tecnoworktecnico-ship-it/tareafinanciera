import React from 'react';
import { LayoutDashboard, WalletCards, ArrowRightLeft, PieChart, Settings } from 'lucide-react';
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
    { id: 'analytics', icon: <PieChart size={20} />, label: t('analytics') },
    { id: 'settings', icon: <Settings size={20} />, label: t('settings') },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-colors duration-300 z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary animate-pulse"></div> SmartTracker
        </h1>
      </div>
      <nav className="mt-4 flex-1">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => {
              playUiSound('click');
              setTab(item.id);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-left
              ${currentTab === item.id 
                ? 'bg-blue-50 dark:bg-blue-900/40 text-primary border-r-4 border-primary font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
