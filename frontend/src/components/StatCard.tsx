import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass, subValue }) => {
  return (
    <div className="glass-premium p-8 rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div>
        <h3 className="text-3xl font-manrope font-black dark:text-white mb-1">{value}</h3>
        {subValue && (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{subValue}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
