import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator as CalcIcon, ArrowLeftRight, Repeat, LayoutGrid, TrendingUp, HelpCircle } from 'lucide-react';
import { Currency } from '@finan/shared';
import HelpModal from '../components/HelpModal';

const Calculator = () => {
  const { t, rates, convert, visualConvert, formatMoney, displayCurrency } = useAppContext();
  const [activeTab, setActiveTab] = useState<'convert' | 'spread' | 'compare'>('convert');
  const [showHelp, setShowHelp] = useState(false);
  
  // Tab 1: Simple Conversion State
  const [convAmount, setConvAmount] = useState('1000');
  const [convFrom, setConvFrom] = useState<string>('ARS');
  const [convTo, setConvTo] = useState<string>('USD');
  const [convResult, setConvResult] = useState(0);

  // Tab 2: Spread State
  const [spreadAmount, setSpreadAmount] = useState('100');
  const [spreadCurrency, setSpreadCurrency] = useState<string>('USD');
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);

  // Initialize spread prices from context
  useEffect(() => {
    if (rates[spreadCurrency]) {
        const rate = 1 / rates[spreadCurrency]; // Rates are in 1 USD = X ARS? Let's check AppContext
        // Wait, AppContext rates are normally 1 ARS = X USD. 
        // So 1 USD = 1 / rates['USD'] ARS.
        setBuyPrice(Number((rate * 0.98).toFixed(2))); // Pre-fill with a small fake spread
        setSellPrice(Number((rate * 1.02).toFixed(2)));
    }
  }, [spreadCurrency, rates]);

  // Handle Tab 1 logic
  useEffect(() => {
    const amount = parseFloat(convAmount) || 0;
    // convert(amount, from) -> ARS
    // visualConvert(ars, to) -> target
    const amountInArs = convert(amount, convFrom as Currency);
    const finalResult = visualConvert(amountInArs, convTo as Currency);
    setConvResult(finalResult);
  }, [convAmount, convFrom, convTo, convert, visualConvert]);

  const handleSwap = () => {
    const temp = convFrom;
    setConvFrom(convTo);
    setConvTo(temp);
  };

  const calculateSpread = () => {
    if (buyPrice === 0) return 0;
    return ((sellPrice - buyPrice) / buyPrice) * 100;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex justify-between items-center glass p-6 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-manrope font-extrabold text-[#191c1d] dark:text-white flex items-center gap-3">
           <CalcIcon className="text-primary w-8 h-8" /> {t('financialCalculator')}
        </h2>
        <button onClick={() => setShowHelp(true)} aria-label="Ayuda de calculadora"
          className="p-3 bg-white/50 dark:bg-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition shadow-sm">
          <HelpCircle className="text-gray-500 dark:text-gray-300" />
        </button>
      </header>

      {/* Mode Tabs */}
      <div className="flex p-1 bg-gray-100/50 dark:bg-slate-800/50 rounded-2xl w-fit mx-auto shadow-inner">
        <button 
          onClick={() => setActiveTab('convert')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'convert' ? 'bg-white dark:bg-slate-700 shadow-md text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          {t('simpleConversion')}
        </button>
        <button 
          onClick={() => setActiveTab('spread')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'spread' ? 'bg-white dark:bg-slate-700 shadow-md text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          {t('buySell')}
        </button>
        <button 
          onClick={() => setActiveTab('compare')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'compare' ? 'bg-white dark:bg-slate-700 shadow-md text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          {t('compare')}
        </button>
      </div>

      {activeTab === 'convert' && (
        <div className="glass-premium p-10 rounded-[2.5rem] space-y-8">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                 <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">{t('iHave')}</label>
                 <div className="flex gap-2">
                    <input 
                       type="number" 
                       value={convAmount}
                       onChange={e => setConvAmount(e.target.value)}
                       className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition text-xl font-bold"
                    />
                    <select 
                      value={convFrom} 
                      onChange={e => setConvFrom(e.target.value)}
                      className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none appearance-none font-bold min-w-[100px]"
                    >
                       {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <button 
                onClick={handleSwap}
                aria-label="Intercambiar divisas"
                className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition active:scale-95 text-primary"
              >
                 <ArrowLeftRight size={24} />
              </button>

              <div className="flex-1 w-full">
                 <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">{t('iReceive')}</label>
                 <div className="flex gap-2">
                    <input 
                       type="text" 
                       readOnly 
                       value={convResult.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                       className="w-full bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none text-xl font-bold text-gray-500"
                    />
                    <select 
                      value={convTo} 
                      onChange={e => setConvTo(e.target.value)}
                      className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none appearance-none font-bold min-w-[100px]"
                    >
                       {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           <div className="surface-card p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-5xl font-manrope font-black text-primary mb-2">
                    {formatMoney(convResult, convTo as Currency)}
                 </p>
                 <p className="text-gray-400 font-bold">
                    {formatMoney(Number(convAmount), convFrom as Currency)} {t('atOfficialRate')}
                 </p>
              </div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                 <div className="bg-primary/5 text-primary px-4 py-2 rounded-full font-black text-sm border border-primary/10">
                    1 {convTo} = {formatMoney(visualConvert(convert(1, convTo as Currency), convFrom as Currency), convFrom as Currency)}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'spread' && (
        <div className="glass-premium p-10 rounded-[2.5rem] space-y-8">
           <div className="text-center">
              <p className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] mb-4">{t('spreadMode')}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="block text-xs font-black uppercase text-gray-400 mb-2">{t('amountToOperate')}</label>
                 <div className="flex gap-2">
                    <input 
                       type="number" 
                       value={spreadAmount}
                       onChange={e => setSpreadAmount(e.target.value)}
                       className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition text-xl font-bold"
                    />
                    <select 
                      value={spreadCurrency} 
                      onChange={e => setSpreadCurrency(e.target.value)}
                      className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none appearance-none font-bold min-w-[100px]"
                    >
                       {Object.values(Currency).filter(c => c !== 'ARS').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Precio Compra (ARS)</label>
                    <input 
                       type="number" 
                       value={buyPrice}
                       onChange={e => setBuyPrice(Number(e.target.value))}
                       className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition font-bold"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Precio Venta (ARS)</label>
                    <input 
                       type="number" 
                       value={sellPrice}
                       onChange={e => setSellPrice(Number(e.target.value))}
                       className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition font-bold"
                    />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="surface-card p-6 rounded-3xl text-center">
                 <p className="text-2xl font-black text-green-500 mb-1">
                    {formatMoney(Number(spreadAmount) * buyPrice, 'ARS')}
                 </p>
                 <p className="text-xs font-bold text-gray-400 uppercase">Si vendes tus {spreadCurrency}</p>
              </div>
              <div className="surface-card p-6 rounded-3xl text-center">
                 <p className="text-2xl font-black text-primary mb-1">
                    {formatMoney(Number(spreadAmount) * sellPrice, 'ARS')}
                 </p>
                 <p className="text-xs font-bold text-gray-400 uppercase">Si compras {spreadCurrency}</p>
              </div>
              <div className="surface-card p-6 rounded-3xl text-center border-l-4 border-l-orange-400">
                 <p className="text-2xl font-black text-orange-500 mb-1">
                    {calculateSpread().toFixed(2)}%
                 </p>
                 <p className="text-xs font-bold text-gray-400 uppercase">Spread de Mercado</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="glass-premium p-10 rounded-[2.5rem] space-y-8">
           <div className="max-w-md mx-auto">
              <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest text-center">{t('amountToCompare')}</label>
              <div className="flex gap-2">
                 <input 
                    type="number" 
                    value={convAmount}
                    onChange={e => setConvAmount(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-primary transition text-2xl font-black text-center"
                 />
                 <select 
                   value={convFrom} 
                   onChange={e => setConvFrom(e.target.value)}
                   className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border-none ring-1 ring-gray-100 outline-none appearance-none font-bold min-w-[100px]"
                 >
                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(Currency).map(curr => {
                 const amountInArs = convert(parseFloat(convAmount) || 0, convFrom as Currency);
                 const val = visualConvert(amountInArs, curr);
                 return (
                    <div key={curr} className="surface-card p-6 rounded-3xl hover:scale-105 transition-all cursor-default group border border-transparent hover:border-primary/20">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 group-hover:text-primary transition">{curr}</p>
                       <p className="text-2xl font-manrope font-black truncate">{formatMoney(val, curr)}</p>
                       <p className="text-[10px] font-bold text-gray-400 mt-2">Valuación en {curr}</p>
                    </div>
                 );
              })}
           </div>
        </div>
      )}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={t('financialCalculator')}>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>{t('helpCalcIntro')}</p>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpCalcConvertTitle')}</h4>
            <p className="text-sm">{t('helpCalcConvertBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpCalcSpreadTitle')}</h4>
            <p className="text-sm">{t('helpCalcSpreadBody')}</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 dark:text-white">{t('helpCalcCompareTitle')}</h4>
            <p className="text-sm">{t('helpCalcCompareBody')}</p>
          </section>
        </div>
      </HelpModal>
    </div>
  );
};

export default Calculator;
