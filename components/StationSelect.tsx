
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
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-left text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all hover:bg-slate-700/50 flex items-center justify-between"
        >
          <span className={selectedStation ? "text-slate-100" : "text-slate-500"}>
            {selectedStation ? selectedStation.name : placeholder}
          </span>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
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
                className={`px-4 py-3 cursor-pointer hover:bg-indigo-600/30 transition-colors flex items-center justify-between group ${value === s.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300'}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{s.name}</span>
                  <div className="flex gap-1 mt-0.5">
                    {s.line.map(l => (
                      <span key={l} className="text-[7px] font-black uppercase" style={{ color: LINE_COLORS[l] }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                {s.isTransfer && (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 group-hover:border-indigo-500/50">
                    HUB
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
