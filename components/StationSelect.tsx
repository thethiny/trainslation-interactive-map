
import React, { useState, useRef, useEffect } from 'react';
import { Station } from '../types';
import { STATIONS, LINE_COLORS } from '../constants';

interface StationSelectProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
  onHover: (id: string | null) => void;
  placeholder: string;
}

export const StationSelect: React.FC<StationSelectProps> = ({ label, value, onChange, onHover, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedStation = STATIONS.find(s => s.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#0a0f1d] border-2 border-slate-800 px-4 py-3 text-left focus:outline-none transition-all hover:border-slate-600 flex items-center justify-between ${selectedStation ? 'text-white' : 'text-slate-600'}`}
        >
          <span className="font-bold text-[12px] tracking-tight truncate uppercase">
            {selectedStation ? selectedStation.name : placeholder}
          </span>
          <svg className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-1 bg-[#161b22] border-2 border-slate-700 shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
            {STATIONS.map(s => (
              <div
                key={s.id}
                onMouseEnter={() => onHover(s.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => {
                  onChange(s.id);
                  setIsOpen(false);
                  onHover(null);
                }}
                className={`px-4 py-3 cursor-pointer hover:bg-red-600/20 transition-colors flex flex-col border-b border-white/5 last:border-0 ${value === s.id ? 'bg-red-600/10 text-red-500' : 'text-slate-400'}`}
              >
                <span className="font-black text-[11px] uppercase tracking-tighter">{s.name}</span>
                <div className="flex gap-2 mt-1">
                  {s.line.map(l => (
                    <span key={l} className="text-[8px] font-black uppercase" style={{ color: LINE_COLORS[l] }}>
                      [{l[0].toUpperCase()}]
                    </span>
                  ))}
                  {s.isTransfer && <span className="text-[8px] font-black text-white bg-slate-800 px-1 ml-auto">HUB</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
