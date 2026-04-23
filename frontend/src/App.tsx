import React, { Suspense, lazy, useState } from 'react';
import Sidebar from './components/Sidebar';
import Ticker from './components/Ticker';
import AnimatedBackground from './components/AnimatedBackground';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Settings = lazy(() => import('./pages/Settings'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Calculator = lazy(() => import('./pages/Calculator'));

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard setTab={setCurrentTab} />;
      case 'transactions': return <Transactions />;
      case 'accounts': return <Accounts />;
      case 'budgets': return <Budgets />;
      case 'analytics': return <Analytics />;
      case 'calculator': return <Calculator />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      <AnimatedBackground />
      <Ticker />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
        
        <main className="flex-1 p-8 overflow-y-auto z-10 transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={
              <div className="flex h-96 items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
