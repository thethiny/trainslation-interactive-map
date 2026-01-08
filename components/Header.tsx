
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-10 py-8 border-b-4 border-[#30363d] bg-[#0d1117] relative overflow-hidden">
      <div className="flex items-center gap-8 z-10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-600 rounded-none border-4 border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
             <span className="text-white font-black text-3xl italic">M</span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white flex items-center gap-2">
            <span className="text-slate-200">TЯAIИ</span>
            <span className="text-[#0d1117] bg-slate-100 px-2 pb-1">SLATIOИ</span>
          </h1>
          <p className="text-[10px] text-red-500 font-bold tracking-[0.4em] uppercase mt-2 opacity-80">
            PATHFINDER / ПЪТЕВОДИТЕЛ
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6 z-10">
        <a 
          href="https://store.steampowered.com/app/1325910/TrainSlation/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-end transition-all"
        >
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-red-500 transition-colors">TRAINSLATION_PROTOCOL</span>
          <div className="flex items-center gap-3 bg-red-600/10 border border-red-600/30 px-4 py-1.5 group-hover:bg-red-600 group-hover:border-white/20 transition-all">
            <svg className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.654c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.009l2.83-4.087V9.02c0-2.607 2.114-4.72 4.72-4.72 2.608 0 4.721 2.113 4.721 4.72 0 2.608-2.113 4.722-4.72 4.722-.118 0-.235-.006-.352-.014l-4.102 2.846c.007.08.012.162.012.245 0 1.776-1.44 3.216-3.216 3.216-1.637 0-2.986-1.222-3.185-2.793l-5.32-2.196C1.496 19.332 6.22 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm4.113 11.136c-1.168 0-2.114-.946-2.114-2.115 0-1.167.946-2.113 2.114-2.113 1.167 0 2.113.946 2.113 2.113 0 1.169-.946 2.115-2.113 2.115z"/>
            </svg>
            <span className="text-[11px] font-black text-red-500 uppercase tracking-widest group-hover:text-white transition-colors underline decoration-red-500/30 group-hover:decoration-white/30 underline-offset-4">VIEW ON STEAM STORE</span>
          </div>
        </a>
      </div>

      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
    </header>
  );
};
