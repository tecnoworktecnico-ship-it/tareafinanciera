import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAppContext } from '../context/AppContext';

interface ActivityChartProps {
  data: any[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const { t, formatMoney, baseCurrency } = useAppContext();

  const totalInc = data?.reduce((acc: any, curr: any) => acc + curr.income, 0) || 0;

  return (
    <div className="glass-premium p-8 rounded-[2rem] lg:col-span-2">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h3 className="text-xl font-bold font-manrope">{t('capitalFlow')}</h3>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('normalizedTo')} {baseCurrency}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t('totalVolume')}</p>
             <p className="font-manrope font-black text-2xl text-green-600">+{formatMoney(totalInc)}</p>
          </div>
       </div>
       
       <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                itemStyle={{ fontWeight: 'black', fontFamily: 'Manrope' }}
                formatter={(val: number) => formatMoney(val)}
              />
              <Area type="monotone" dataKey="income" stroke="#006e2c" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
              <Area type="monotone" dataKey="expense" stroke="#b51b15" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
            </AreaChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

export default ActivityChart;
