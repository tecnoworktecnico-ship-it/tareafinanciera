import React from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer 
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const COLORS = ['#0058bd', '#006e2c', '#b51b15', '#ef6719', '#7c2e00', '#4b8eff'];

interface CategoryChartProps {
  data: any[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const { t, formatMoney } = useAppContext();

  return (
    <div className="glass-premium p-8 rounded-[2rem]">
       <h3 className="text-xl font-bold font-manrope mb-8 flex items-center gap-3">
          <PieIcon size={24} className="text-primary"/> {t('spendingByCategory')}
       </h3>
       <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                 formatter={(val: number) => formatMoney(val)} 
              />
              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: 'bold', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

export default CategoryChart;
