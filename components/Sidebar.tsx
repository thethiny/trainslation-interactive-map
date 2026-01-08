
import React, { useMemo } from 'react';
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
  const legGroups = useMemo(() => {
    if (!pathResult) return [];
    const groups: { label: string; segments: { seg: PathSegment; globalIdx: number }[] }[] = [];
    pathResult.segments.forEach((seg, i) => {
      const isDetour = seg.legIndex === -1;
      const legLabel = isDetour 
        ? "Coverage Detour" 
        : `Leg ${getAlphabetLabel(seg.legIndex)} → ${getAlphabetLabel(seg.legIndex + 1)}`;
      
      if (groups.length === 0 || groups[groups.length - 1].label !== legLabel) {
        groups.push({ label: legLabel, segments: [] });
      }
      groups[groups.length - 1].segments.push({ seg, globalIdx: i });
    });
    return groups;
  }, [pathResult]);

  const STRATEGIES = {
    shortest: [
      { id: 'HOPS', label: 'Fewest Stops', icon: 'M4 6h16M4 12h16M4 18h16' },
      { id: 'DISTANCE', label: 'Shortest Way', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
      { id: 'LEAST_TRANSITIONS', label: 'Least Changes', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' }
    ],
    coverage: [
      { id: 'TRAVERSE_ALL', label: 'All Stations', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      { id: 'TRAVERSE_ALL_EDGES', label: 'All Paths', icon: 'M3 7h18M3 12h18M3 17h18' }
    ]
  };

  return (
    <div className="w-full lg:w-[440px] h-full flex flex-col glass-panel p-6 gap-6 overflow-y-auto custom-scrollbar">
      {/* Waypoints Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between ml-1">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Waypoints</label>
        </div>
        <div className="space-y-3 pb-8">
          {waypoints.map((wid, i) => {
            const isLast = i === waypoints.length - 1;
            const isA = i === 0;
            const isB = i === 1;
            const showPlus = isLast && !wid && !isA && !isB;
            
            return (
              <div key={`wp-${i}`} className="flex items-center gap-3 group/wp">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0 shadow-lg transition-all ${showPlus ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}>
                  {showPlus ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                  ) : getAlphabetLabel(i)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <StationSelect 
                    label="" 
                    value={wid} 
                    onChange={(id) => onWaypointChange(i, id)} 
                    onHover={onHover} 
                    placeholder={showPlus ? "Add stop..." : (isA ? "Starting point (A)" : (isB ? "Destination (B)" : `Waypoint ${getAlphabetLabel(i)}`))} 
                  />
                  <button 
                    onClick={() => onRemoveWaypoint(i)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded-xl transition-all shrink-0"
                    title={`Remove ${getAlphabetLabel(i)}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strategies Section */}
      <section className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Shortest Path</label>
            <div className="grid grid-cols-3 gap-2">
              {STRATEGIES.shortest.map(opt => (
                <button
                  key={opt.id} onClick={() => onModeChange(opt.id as OptimizationMode)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 text-center ${mode === opt.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800/50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={opt.icon} /></svg>
                  <span className="font-bold text-[9px] uppercase tracking-tighter leading-none">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Most Coverage</label>
            <div className="grid grid-cols-2 gap-2">
              {STRATEGIES.coverage.map(opt => (
                <button
                  key={opt.id} onClick={() => onModeChange(opt.id as OptimizationMode)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 text-center ${mode === opt.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800/50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={opt.icon} /></svg>
                  <span className="font-bold text-[9px] uppercase tracking-tighter leading-none">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Preview */}
      {pathResult && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-auto">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Itinerary</h3>
            <button 
              onClick={onOpenModal}
              className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
            >
              <span>Expand Fullscreen</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-800 pt-3">
            {legGroups.slice(0, 3).map((group, gIdx) => (
              <div key={`leg-mini-${gIdx}`} className="space-y-1">
                <div className="text-[8px] font-black text-indigo-400/70 uppercase px-2">{group.label}</div>
                {group.segments.slice(0, 3).map(({ seg, globalIdx }) => (
                  <div key={`seg-mini-${globalIdx}`} onMouseEnter={() => onHoverSegment(globalIdx)} onMouseLeave={() => onHoverSegment(null)} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: LINE_COLORS[seg.line] }}></div>
                    <span className="text-[10px] font-bold text-slate-300 truncate">{STATIONS.find(s => s.id === seg.to)?.name}</span>
                  </div>
                ))}
              </div>
            ))}
            {legGroups.length > 3 && <div className="text-center py-2 text-[9px] font-bold text-slate-600">... and more</div>}
          </div>
        </section>
      )}
    </div>
  );
};
