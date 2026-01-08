
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">MetroPath <span className="text-indigo-400">Optimizer</span></h1>
          <p className="text-xs text-slate-400 font-medium">Urban Transit Logic Engine</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Live</span>
      </div>
    </header>
  );
};
