import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart3, TrendingUp, Loader2, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import ActivityChart from '../components/ActivityChart';
import CategoryChart from '../components/CategoryChart';

const Analytics = () => {
  const { t, playUiSound, baseCurrency, loadingRates } = useAppContext();
  const [showHelp, setShowHelp] = useState(false);
  const { stats } = useAnalyticsData();

  if (loadingRates) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-primary w-16 h-16" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-center glass p-8 rounded-[2.5rem] shadow-xl">
        <h2 className="text-4xl font-manrope font-black text-[#191c1d] dark:text-white flex items-center gap-4">
           <BarChart3 className="text-primary w-10 h-10" /> {t('analytics')}
        </h2>
        <button onClick={() => { playUiSound('click'); setShowHelp(true); }} className="p-4 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm">
           <HelpCircle className="text-gray-500 dark:text-gray-300" size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Main Flow Chart */}
        <ActivityChart data={stats?.areaData || []} />

        {/* Categories Distribution */}
        <CategoryChart data={stats?.pieData || []} />

        {/* Pro Efficiency Metric */}
        <div className="glass-premium p-10 rounded-[3rem] flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
           <h3 className="text-2xl font-manrope font-black mb-2 dark:text-white">{t('efficiencyIn')} {baseCurrency}</h3>
           <p className="text-sm text-gray-500 mb-10 font-medium uppercase tracking-widest">{t('dynamicAnalysis')}</p>
           
           <div className="flex items-center gap-12">
              <div className="relative w-40 h-40">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-gray-100 dark:text-slate-800" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="440" strokeDashoffset={440 * 0.28} className="text-primary" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center font-manrope text-3xl font-black dark:text-white">PRO</div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-primary font-black text-lg">
                    <TrendingUp size={24}/> {t('dynamicLabel')}
                 </div>
                 <p className="text-sm text-gray-500 italic font-medium leading-relaxed max-w-xs">"{t('ratesUpdateNote')}"</p>
              </div>
           </div>
        </div>

      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('analytics')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpAnalyticsIntro')}</p>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsDailyTitle')}</h4><p className="text-sm">{t('helpAnalyticsDailyBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsMonthlyTitle')}</h4><p className="text-sm">{t('helpAnalyticsMonthlyBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsCurrencyTitle')}</h4><p className="text-sm">{t('helpAnalyticsCurrencyBody')}</p></section>
          <section><h4 className="font-bold text-gray-800 dark:text-white">{t('helpAnalyticsCategoryTitle')}</h4><p className="text-sm">{t('helpAnalyticsCategoryBody')}</p></section>
        </div>
      </HelpModal>
    </div>
  );
};

export default Analytics;

