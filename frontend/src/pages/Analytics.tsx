import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Loader2, HelpCircle } from 'lucide-react';
import HelpModal from '../components/HelpModal';
import { TransactionType } from '@finan/shared';

const COLORS = ['#0058bd', '#006e2c', '#b51b15', '#ef6719', '#7c2e00', '#4b8eff'];

const Analytics = () => {
  const { t, baseCurrency, playUiSound, convert, visualConvert, formatMoney, loadingRates, transactions } = useAppContext();
  const [showHelp, setShowHelp] = useState(false);

  const stats = useMemo(() => {
    if (!transactions.length) return null;

    // Category Data (Normalized to ARS first)
    const catMapARS: Record<string, number> = {};
    transactions.forEach(tx => {
       if (tx.type === TransactionType.EXPENSE) {
          const valARS = convert(tx.amount, tx.currency);
          catMapARS[tx.category] = (catMapARS[tx.category] || 0) + valARS;
       }
    });
    
    // Final display conversion
    const pieData = Object.entries(catMapARS).map(([name, value]) => ({ 
       name, 
       value: Math.round(visualConvert(value)) 
    }));

    // Daily Timeline (30 days) - Normalizing to ARS
    const dailyMapARS: Record<string, { income: number, expense: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
       const d = new Date(now);
       d.setDate(d.getDate() - i);
       const key = d.toISOString().split('T')[0];
       dailyMapARS[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(tx => {
       if (dailyMapARS[tx.timestamp]) {
          const valARS = convert(tx.amount, tx.currency);
          if (tx.type === TransactionType.INCOME) dailyMapARS[tx.timestamp].income += valARS;
          else if (tx.type === TransactionType.EXPENSE) dailyMapARS[tx.timestamp].expense += valARS;
       }
    });

    const areaData = Object.entries(dailyMapARS).map(([date, vals]) => ({
       name: date.split('-').slice(1).join('/'), 
       income: Math.round(visualConvert(vals.income)),
       expense: Math.round(visualConvert(vals.expense)),
       net: Math.round(visualConvert(vals.income - vals.expense))
    }));

    return { pieData, areaData };
  }, [transactions, convert, visualConvert]);

  if (loadingRates) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-primary w-16 h-16" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center glass p-6 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-manrope font-extrabold text-[#191c1d] dark:text-white flex items-center gap-3">
           <BarChart3 className="text-primary w-8 h-8" /> {t('analytics')}
        </h2>
        <button onClick={() => { playUiSound('click'); setShowHelp(true); }} className="p-3 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm">
           <HelpCircle className="text-gray-500 dark:text-gray-300" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Main Flow Chart */}
        <div className="glass-premium p-8 rounded-[2rem] lg:col-span-2">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-xl font-bold font-manrope">Flujo de Capital (30d)</h3>
                 <p className="text-sm text-gray-500">Normalizado a {baseCurrency}</p>
              </div>
              <ActivityStats data={stats?.areaData} formatMoney={formatMoney} />
           </div>
           
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.areaData}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006e2c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#006e2c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b51b15" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#b51b15" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(val: number) => formatMoney(val)}
                  />
                  <Area type="monotone" dataKey="income" stroke="#006e2c" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" stroke="#b51b15" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass-premium p-8 rounded-[2rem]">
           <h3 className="text-xl font-bold font-manrope mb-6 flex items-center gap-2">
              <PieIcon size={20} className="text-primary"/> Gastos por Categoría
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatMoney(val)} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Pro Efficiency Metric */}
        <div className="glass-premium p-8 rounded-[2rem] flex flex-col justify-center">
           <h3 className="text-xl font-bold font-manrope mb-2">Eficiencia en {baseCurrency}</h3>
           <p className="text-sm text-gray-500 mb-8">Análisis dinámico del flujo de caja.</p>
           
           <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-slate-800" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 * 0.28} className="text-primary" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center font-manrope text-2xl font-black">Pro</div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-primary font-bold"><TrendingUp size={18}/> Dinámico</div>
                 <p className="text-xs text-gray-500 italic">"Las cotizaciones se actualizan automáticamente cada 60 segundos."</p>
              </div>
           </div>
        </div>

      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Analítica Multidivisa">
        <p className="text-sm">Todos los datos históricos se convierten automáticamente a tu moneda base preferida: {baseCurrency}.</p>
      </HelpModal>
    </div>
  );
};

const ActivityStats = ({ data, formatMoney }: { data: any, formatMoney: any }) => {
   const totalInc = data?.reduce((acc: any, curr: any) => acc + curr.income, 0) || 0;
   return (
      <div className="flex gap-4">
         <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase">Volumen Total</p>
            <p className="font-manrope font-bold text-green-600">+{formatMoney(totalInc)}</p>
         </div>
      </div>
   )
}

export default Analytics;
