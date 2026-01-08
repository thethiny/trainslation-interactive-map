
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [search, setSearch] = useState('');
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

  // Visual transliteration: Cyrillic to Latin by shape
  const visualTransliterate = (str: string) => {
    const map: Record<string, string> = {
      'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X',
      'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm', 'н': 'h', 'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'у': 'y', 'х': 'x',
      'Ё': 'E', 'ё': 'e', 'З': '3', 'з': '3', 'Й': 'N', 'й': 'n', 'Л': 'L', 'л': 'l', 'П': 'N', 'п': 'n', 'Ф': 'F', 'ф': 'f', 'Ы': 'bl', 'ы': 'bl', 'Э': 'E', 'э': 'e', 'Ю': 'IO', 'ю': 'io', 'Я': 'R', 'я': 'r',
    };
    return str.split('').map(ch => map[ch] || ch).join('');
  };

  // Edit distance (Levenshtein, max 2 for speed)
  const editDistance = (a: string, b: string) => {
    if (Math.abs(a.length - b.length) > 2) return 3;
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  };

  // Fuzzy filter stations
  const filteredStations = useMemo(() => {
    if (!search.trim()) return STATIONS;
    const s = search.trim().toUpperCase();
    return STATIONS.filter(st => {
      const name = st.name.toUpperCase();
      const translit = visualTransliterate(name).toUpperCase();
      // Partial match
      if (name.includes(s) || translit.includes(s)) return true;
      // Edit distance
      if (editDistance(name, s) <= 2 || editDistance(translit, s) <= 2) return true;
      return false;
    });
  }, [search]);

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
            <div className="p-2 sticky top-0 bg-[#161b22] z-10">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search station..."
                className="w-full px-2 py-2 bg-slate-900 text-white text-xs rounded border border-slate-700 focus:outline-none"
                autoFocus
              />
            </div>
            {filteredStations.length === 0 && (
              <div className="px-4 py-3 text-slate-500 text-xs">No stations found.</div>
            )}
            {filteredStations.map(s => (
              <div
                key={s.id}
                onMouseEnter={() => onHover(s.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => {
                  onChange(s.id);
                  setIsOpen(false);
                  onHover(null);
                  setSearch('');
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
