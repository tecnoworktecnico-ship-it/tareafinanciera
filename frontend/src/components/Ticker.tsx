import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Ticker = () => {
  const { rates } = useAppContext();
  const [prevRates, setPrevRates] = useState<Record<string, number>>({});

  useEffect(() => {
    // When rates update, we keep the previous ones for comparison until the next tick
    const timeout = setTimeout(() => {
      setPrevRates(rates);
    }, 1000); // Give it a second to show the indicator
    return () => clearTimeout(timeout);
  }, [rates]);

  return (
    <div className="bg-slate-900 text-white dark:bg-black py-2 px-4 shadow-inner text-sm flex items-center overflow-hidden whitespace-nowrap z-10 w-full relative">
      <div className="font-bold tracking-widest text-[#FBBC05] mr-4 shrink-0 uppercase flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> 
        COTIZACIONES (1 UNIDAD = X ARS):
      </div>
      <div className="flex animate-marquee min-w-full">
        {Object.entries(rates).filter(([curr]) => curr !== 'ARS').map(([curr, rate]) => {
          const prev = prevRates[curr] || rate;
          const isUp = rate > prev;
          const isDown = rate < prev;
          const isBase = false; // Filtered out ARS above

          return (
            <div key={curr} className={`inline-flex items-center mx-4 gap-1 ${isBase ? 'opacity-50' : ''}`}>
               <span className="font-black text-white">{curr}</span>
               <span className="font-mono font-bold text-primary">{rate.toLocaleString('es-AR')}</span>
               {!isBase && isUp && <TrendingUp size={14} className="text-income animate-pulse" />}
               {!isBase && isDown && <TrendingDown size={14} className="text-expense" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ticker;
