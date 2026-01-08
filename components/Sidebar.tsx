
// Add missing React import to fix 'Cannot find namespace React' error when using React.FC
import React, { useMemo, useState } from 'react';
import { StationSelect } from './StationSelect';
import { OptimizationMode, PathResult, PathSegment } from '../types';
import { STATIONS, LINE_COLORS } from '../constants';

interface SidebarProps {
  waypoints: string[];
  onWaypointChange: (idx: number, id: string) => void;
  onRemoveWaypoint: (idx: number) => void;
  onHover: (id: string | null) => void;
  onHoverSegment: (idx: number | null) => void;
  mode: OptimizationMode;
  onModeChange: (mode: OptimizationMode) => void;
  pathResult: PathResult | null;
  onOpenModal: () => void;
}

const getAlphabetLabel = (index: number) => String.fromCharCode(65 + index);

export const Sidebar: React.FC<SidebarProps> = ({
  waypoints,
  onWaypointChange,
  onRemoveWaypoint,
  onHover,
  onHoverSegment,
  mode,
  onModeChange,
  pathResult,
  onOpenModal
}) => {
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);

  const STRATEGIES = {
    logic: [
      { 
        id: 'HOPS', 
        label: 'MIN_STOPS', 
        desc: 'Calculates the fewest number of station nodes for arrival.', 
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
      },
      { 
        id: 'DISTANCE', 
        label: 'GEODESIC', 
        desc: 'Prioritizes shortest physical track length between coordinates.',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        )
      },
      { 
        id: 'LEAST_TRANSITIONS', 
        label: 'MIN_X-FER', 
        desc: 'Reduces transit line changes to preserve route continuity.',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        )
      }
    ],
    coverage: [
      { 
        id: 'TRAVERSE_ALL', 
        label: 'NODE_TOUR', 
        desc: 'Iterates through all stations in the network exactly once.',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        )
      },
      { 
        id: 'TRAVERSE_ALL_EDGES', 
        label: 'EDGE_SCAN', 
        desc: 'Forces the path to traverse every unique track segment.',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
        )
      }
    ]
  };

  const currentDesc = hoveredStrategy 
    ? [...STRATEGIES.logic, ...STRATEGIES.coverage].find(s => s.id === hoveredStrategy)?.desc 
    : "Protocol system ready. Select a transit logic to calculate coordinates.";

  return (
    <div className="w-full lg:w-[440px] h-full flex flex-col industrial-panel p-8 gap-8 overflow-y-auto custom-scrollbar border-4 border-[#30363d]">
      <section className="space-y-6">
        <label className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 ml-1">STATION COORDINATES</label>
        <div className="space-y-4">
          {waypoints.map((wid, i) => {
            const isLast = i === waypoints.length - 1;
            const isA = i === 0;
            const isB = i === 1;
            const showPlus = isLast && !wid && !isA && !isB;
            
            return (
              <div key={`wp-${i}`} className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center text-[14px] font-black shrink-0 border-2 ${showPlus ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-red-600 border-white/20 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}>
                  {showPlus ? '+' : getAlphabetLabel(i)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <StationSelect 
                    label="" 
                    value={wid} 
                    onChange={(id) => onWaypointChange(i, id)} 
                    onHover={onHover} 
                    placeholder={showPlus ? "ADD SECTOR..." : (isA ? "ORIGIN SECTOR (A)" : (isB ? "DESTINATION (B)" : `COORDINATE ${getAlphabetLabel(i)}`))} 
                  />
                  {!isA && !isB && wid && (
                    <button 
                      onClick={() => onRemoveWaypoint(i)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-900 border-2 border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6 border-t-2 border-slate-800 pt-8">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-4 block">PATH LOGIC SEQUENCER</label>
          <div className="grid grid-cols-1 gap-2">
            {STRATEGIES.logic.map(opt => (
              <button
                key={opt.id} 
                onClick={() => onModeChange(opt.id as OptimizationMode)}
                onMouseEnter={() => setHoveredStrategy(opt.id)}
                onMouseLeave={() => setHoveredStrategy(null)}
                className={`flex items-stretch border-2 transition-all ${mode === opt.id ? 'bg-red-600 border-white/20 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                <div className={`w-12 flex items-center justify-center border-r ${mode === opt.id ? 'border-white/20' : 'border-slate-800'}`}>
                    {opt.icon}
                </div>
                <div className="flex-1 py-3 px-4 text-left">
                    <span className="font-black text-[11px] tracking-widest uppercase">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-4 block">SURVEY PROTOCOLS</label>
          <div className="grid grid-cols-1 gap-2">
            {STRATEGIES.coverage.map(opt => (
              <button
                key={opt.id} 
                onClick={() => onModeChange(opt.id as OptimizationMode)}
                onMouseEnter={() => setHoveredStrategy(opt.id)}
                onMouseLeave={() => setHoveredStrategy(null)}
                className={`flex items-stretch border-2 transition-all ${mode === opt.id ? 'bg-red-600 border-white/20 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                <div className={`w-12 flex items-center justify-center border-r ${mode === opt.id ? 'border-white/20' : 'border-slate-800'}`}>
                    {opt.icon}
                </div>
                <div className="flex-1 py-3 px-4 text-left">
                    <span className="font-black text-[11px] tracking-widest uppercase">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Diagnostic Tooltip */}
        <div className="bg-black/50 border border-slate-700 p-4 min-h-[80px]">
            <div className="text-[9px] font-black text-red-500 mb-2 uppercase tracking-widest">DIAGNOSTIC_FEED:</div>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                {currentDesc}
            </p>
        </div>
      </section>

      {pathResult && (
        <section className="mt-auto space-y-4 pt-8 border-t-2 border-slate-800">
           <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">TRANSPORT LOG</h3>
            <button 
              onClick={onOpenModal}
              className="text-[10px] font-black uppercase bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors"
            >
              FULL REPORT
            </button>
          </div>
          <div className="bg-black/40 p-4 border border-white/5 space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
             {pathResult.segments.slice(0, 5).map((seg, idx) => (
                <div key={idx} onMouseEnter={() => onHoverSegment(idx)} onMouseLeave={() => onHoverSegment(null)} className="flex items-center gap-3 text-[11px] font-bold text-slate-400 py-1 border-b border-white/5 last:border-0 hover:text-white transition-colors cursor-pointer">
                   <div className="w-1.5 h-3" style={{ backgroundColor: LINE_COLORS[seg.line] }}></div>
                   <span>{STATIONS.find(s => s.id === seg.from)?.name}</span>
                   <span className="text-red-500">→</span>
                   <span>{STATIONS.find(s => s.id === seg.to)?.name}</span>
                </div>
             ))}
             {pathResult.segments.length > 5 && <div className="text-center text-[9px] text-slate-600 font-bold pt-1">TRUNCATED DATA...</div>}
          </div>
        </section>
      )}
    </div>
  );
};
