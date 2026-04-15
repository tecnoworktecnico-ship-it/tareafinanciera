import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-8 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-transparent">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <HelpCircle className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Guía de Ayuda</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
