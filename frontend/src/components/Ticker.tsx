import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Ticker = () => {
  const { baseCurrency, t } = useAppContext();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [lastRates, setLastRates] = useState<Record<string, number>>({});

  useEffect(() => {
    // Polling simulation every 5s for the live ticker
    let isSubscribed = true;
    const fetchRates = async () => {
      try {
        const res = await fetch(`/api/exchange-rates?base=${baseCurrency}`);
        const data = await res.json();
        if (isSubscribed) {
          setLastRates(rates); // Keep track to show red/green indicators
          setRates(data.rates);
        }
      } catch (err) {
        console.error("Rates fetch error", err);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // 1 hour refresh
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [baseCurrency]);

  return (
    <div className="bg-slate-900 text-white dark:bg-black py-2 px-4 shadow-inner text-sm flex items-center overflow-hidden whitespace-nowrap z-10 w-full relative">
      <div className="font-bold tracking-widest text-[#FBBC05] mr-4 shrink-0 uppercase flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> 
        {t('rates')} (x1 {baseCurrency}):
      </div>
      <div className="flex animate-marquee min-w-full">
        {Object.entries(rates).map(([curr, rate]) => {
          if (curr === baseCurrency) return null;
          const prev = lastRates[curr] || rate;
          const isUp = rate > prev;
          const isDown = rate < prev;

          return (
            <div key={curr} className="inline-flex items-center mx-4 gap-1">
               <span className="font-semibold text-gray-300">{curr}</span>
               <span className="font-mono">{rate.toFixed(4)}</span>
               {isUp && <TrendingUp size={14} className="text-income animate-pulse" />}
               {isDown && <TrendingDown size={14} className="text-expense" />}
               {!isUp && !isDown && <span className="w-3.5 h-3.5 inline-block opacity-0">-</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ticker;
