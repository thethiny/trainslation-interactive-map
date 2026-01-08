
import React, { useMemo } from 'react';
import { PathResult, PathSegment } from '../types';
// Add CONNECTIONS to imports from constants
import { STATIONS, LINE_COLORS, CONNECTIONS } from '../constants';
import { MetroMap } from './MetroMap';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathResult: PathResult | null;
  waypoints: string[];
  onHoverSegment: (idx: number | null) => void;
  hoverSegmentIdx: number | null;
}

const getAlphabetLabel = (index: number) => String.fromCharCode(65 + index);

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  pathResult,
  waypoints,
  onHoverSegment,
  hoverSegmentIdx
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
  }, [pathResult, waypoints]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-7xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <header className="flex items-center justify-between px-10 py-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Complete Journey Itinerary</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Optimization Result Details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Detailed Breakdown */}
          <div className="w-1/2 overflow-y-auto custom-scrollbar p-10 border-r border-white/5 bg-slate-900/40">
            <div className="space-y-12">
              {legGroups.map((group, gIdx) => (
                <div key={`leg-modal-${gIdx}`} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-indigo-400 uppercase tracking-widest px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">{group.label}</span>
                    <div className="flex-1 h-px bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {group.segments.map(({ seg, globalIdx }, i) => {
                      const sTo = STATIONS.find(s => s.id === seg.to)!;
                      const prevGlobalIdx = globalIdx > 0 ? globalIdx - 1 : null;
                      const isTransfer = prevGlobalIdx !== null && pathResult!.segments[prevGlobalIdx].line !== seg.line;

                      return (
                        <div 
                          key={`seg-modal-${globalIdx}`}
                          onMouseEnter={() => onHoverSegment(globalIdx)}
                          onMouseLeave={() => onHoverSegment(null)}
                          className={`group flex items-start gap-5 p-5 rounded-2xl transition-all border ${hoverSegmentIdx === globalIdx ? 'bg-indigo-600/10 border-indigo-500/40 scale-[1.02]' : 'bg-slate-800/30 border-transparent hover:bg-slate-800/50 hover:border-white/5'}`}
                        >
                          <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LINE_COLORS[seg.line] }}></div>
                            <div className="w-0.5 h-full min-h-[20px] bg-slate-700/50 rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            {isTransfer && (
                              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-amber-500/10 rounded-md mb-2">
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Transfer Point</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">
                                {globalIdx + 1}. {sTo.name}
                              </span>
                              <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-3 py-1 rounded-lg border border-white/5 group-hover:border-white/10">
                                STOP #{globalIdx + 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: LINE_COLORS[seg.line] }}>{seg.line} Line</span>
                              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                              <span className="text-[9px] font-medium text-slate-500">Distance Weight: {CONNECTIONS.find(c => c.from === seg.from && c.to === seg.to && c.line === seg.line)?.weight} Units</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Preview Map */}
          <div className="w-1/2 p-10 flex flex-col gap-6 bg-[#080c14]">
            <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 shadow-inner relative">
              <MetroMap 
                waypoints={waypoints} onSelectStation={() => {}} 
                hoverId={null} hoverSegmentIdx={hoverSegmentIdx} 
                pathResult={pathResult} showLabels={true} showHubLabels={true} 
                title="Preview Mode" subtitle="Visualization Reference"
                isPreview={true}
              />
              <div className="absolute inset-0 pointer-events-none border-[1.5rem] border-slate-950/20"></div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 flex flex-col gap-1 items-center justify-center">
                <span className="text-4xl font-black text-white">{pathResult?.totalHops}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Hops</span>
              </div>
              <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 flex flex-col gap-1 items-center justify-center">
                <span className="text-4xl font-black text-white">{pathResult?.totalTransitions}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transitions</span>
              </div>
              <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 flex flex-col gap-1 items-center justify-center">
                <span className="text-4xl font-black text-white">{pathResult?.totalDistance}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distance Units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
