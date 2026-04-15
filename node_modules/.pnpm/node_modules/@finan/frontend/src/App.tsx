import React, { useState, useEffect } from 'react';
import { Currency, TransactionType } from '@finan/shared';

function App() {
  const [baseCurrency, setBaseCurrency] = useState<Currency>(Currency.USD);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // States para el form
  const [formError, setFormError] = useState<string | null>(null);
  const [newTx, setNewTx] = useState({ description: '', amount: '', category: '', type: TransactionType.EXPENSE, currency: Currency.USD });

  useEffect(() => {
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(console.error);
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!newTx.description.trim()) return setFormError("La descripción es obligatoria.");
    if (!newTx.category.trim()) return setFormError("La categoría es obligatoria.");
    const numAmount = parseFloat(newTx.amount);
    if (isNaN(numAmount) || numAmount <= 0) return setFormError("El monto debe ser numérico y mayor que cero.");
    if (!['USD', 'EUR', 'ARS', 'PEN'].includes(newTx.currency)) return setFormError("Moneda inválida.");

    try {
        const res = await fetch('http://localhost:3001/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newTx, amount: numAmount, accountId: 'a1' })
        });
        const data = await res.json();
        if (!res.ok) {
            setFormError(data.error + (data.details ? ": " + data.details[0].message : ""));
        } else {
            setTransactions([data, ...transactions]);
            setNewTx({ description: '', amount: '', category: '', type: TransactionType.EXPENSE, currency: Currency.USD });
        }
    } catch(err: any) {
        setFormError("Error de red conectando al backend.");
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-primary selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
			<div className="w-4 h-4 rounded bg-primary"></div> SmartTracker
		  </h1>
        </div>
        <nav className="mt-4">
          <a href="#" className="flex items-center px-6 py-3 bg-blue-50 text-primary border-r-4 border-primary font-medium">Dashboard</a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors">Accounts</a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors">Settings</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-background">
        
        {/* Header con Moneda Base */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
          <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Base Currency</span>
              <select 
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                className="bg-gray-50 border-gray-200 text-sm rounded-lg px-4 py-2 focus:ring-primary focus:border-primary drop-shadow-sm transition font-medium"
              >
                {Object.values(Currency).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
          </div>
        </header>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
            <p className="text-gray-500 text-sm mb-1 font-medium">Total Balance</p>
            <h3 className="text-3xl font-semibold text-primary">$ 12,450.00</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
            <p className="text-gray-500 text-sm mb-1 font-medium">Incomes</p>
            <h3 className="text-3xl font-semibold text-income">$ 4,200.00</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
            <p className="text-gray-500 text-sm mb-1 font-medium">Expenses</p>
            <h3 className="text-3xl font-semibold text-expense">$ -1,240.00</h3>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Add Transaction</h3>
          
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleAddTransaction} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
              <input type="text" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary" placeholder="e.g. Lunch" />
            </div>
            <div className="w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Amount</label>
              <input type="text" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary" placeholder="0.00" />
            </div>
            <div className="w-[100px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Currency</label>
              <select value={newTx.currency} onChange={e => setNewTx({...newTx, currency: e.target.value as Currency})} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
                <option value="PEN">PEN</option>
              </select>
            </div>
             <div className="w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <input type="text" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm" placeholder="Food" />
            </div>
            <div className="w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
              <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-600 transition shadow-sm leading-tight h-[38px]">
              Add
            </button>
          </form>
        </div>

        {/* Recent Transactions Panel */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          </div>
          <div className="px-6 pb-2 divide-y divide-gray-50">
            {transactions.map(tx => (
              <div key={tx.id} className="py-5 flex justify-between items-center group">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition ${tx.type === TransactionType.INCOME ? 'bg-[#e7f6ec] text-income group-hover:bg-[#cbf0d7]' : 'bg-[#fdeadc] text-expense group-hover:bg-[#facdaf]'}`}>
                     {tx.type === TransactionType.INCOME ? 
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg> 
                     : 
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                     }
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{tx.category} • {tx.timestamp}</p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${tx.type === TransactionType.INCOME ? 'text-income' : 'text-gray-800'}`}>
                  {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toFixed(2)} <span className="text-sm font-medium text-gray-400 ml-1">{tx.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
