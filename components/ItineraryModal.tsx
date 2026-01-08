
import React, { useMemo, useState } from 'react';
import { PathResult, PathSegment, Station } from '../types';
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

const HubDot: React.FC<{ station: Station; size?: string; className?: string }> = ({ station, size = "w-3.5 h-3.5", className = "" }) => {
  const colors = station.line.map(l => LINE_COLORS[l]);
  let backgroundStyle = {};
  
  if (colors.length >= 2) {
    backgroundStyle = { background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)` };
  } else {
    backgroundStyle = { backgroundColor: colors[0] || '#1e293b' };
  }

  return (
    <div 
      className={`${size} rounded-full border border-white/20 shadow-sm ${className}`}
      style={backgroundStyle}
    />
  );
};

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  pathResult,
  waypoints,
  onHoverSegment,
  hoverSegmentIdx
}) => {
  const [hoverLegIdx, setHoverLegIdx] = useState<number | null>(null);

  const fullJourneySequence = useMemo(() => {
    if (!pathResult) return [];
    return pathResult.stations.map((sid, idx) => {
      const station = STATIONS.find(s => s.id === sid)!;
      const segIdx = idx < pathResult.segments.length ? idx : idx - 1;
      const line = pathResult.segments[segIdx]?.line || null;
      return { station, line };
    });
  }, [pathResult]);

  const legGroups = useMemo(() => {
    if (!pathResult) return [];
    const groups: { 
      label: string; 
      legIndex: number; 
      title: string;
      hubs: string[];
      segments: { seg: PathSegment; globalIdx: number }[] 
    }[] = [];

    pathResult.segments.forEach((seg, i) => {
      const isDetour = seg.legIndex === -1;
      const legLabel = isDetour 
        ? "Coverage Detour" 
        : `Leg ${getAlphabetLabel(seg.legIndex)} → ${getAlphabetLabel(seg.legIndex + 1)}`;
      
      if (groups.length === 0 || groups[groups.length - 1].label !== legLabel) {
        groups.push({ 
          label: legLabel, 
          legIndex: seg.legIndex, 
          title: "",
          hubs: [],
          segments: [] 
        });
      }
      groups[groups.length - 1].segments.push({ seg, globalIdx: i });
    });

    groups.forEach(group => {
      const segments = group.segments.map(s => s.seg);
      if (segments.length === 0) return;
      
      const startS = STATIONS.find(s => s.id === segments[0].from)!;
      const endS = STATIONS.find(s => s.id === segments[segments.length - 1].to)!;
      group.title = `${startS.name} to ${endS.name}`;

      // Extract hubs in between (excluding start/end to keep it clean)
      const internalStations = segments.slice(0, -1).map(s => STATIONS.find(st => st.id === s.to)!);
      group.hubs = internalStations.filter(s => s.isTransfer).map(s => s.name);
    });

    return groups;
  }, [pathResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-7xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="flex items-center justify-between px-10 py-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Complete Journey Itinerary</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Transit Optimization Result</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 overflow-y-auto custom-scrollbar p-10 border-r border-white/5 bg-slate-900/40">
            {/* Full Journey Master Sequence */}
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master Journey Sequence</span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
              <div className="bg-slate-950/60 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="flex flex-wrap items-center gap-3">
                  {fullJourneySequence.map((item, idx) => (
                    <React.Fragment key={`master-dot-${idx}`}>
                      <div className="relative group/node-dot">
                        <HubDot station={item.station} className="group-hover/node-dot:scale-125 transition-transform cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/node-dot:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg border border-white/10 shadow-2xl">
                          <span className="block text-slate-500 text-[8px] uppercase mb-0.5">Stop #{idx + 1}</span>
                          {item.station.name}
                        </div>
                      </div>
                      {idx < fullJourneySequence.length - 1 && (
                        <div className="w-4 h-0.5 bg-slate-800 rounded-full" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </section>

            <div className="space-y-12 pb-20">
              {legGroups.map((group, gIdx) => (
                <div 
                  key={`leg-modal-${gIdx}`} 
                  className="space-y-6 group/leg"
                  onMouseEnter={() => setHoverLegIdx(group.legIndex)}
                  onMouseLeave={() => setHoverLegIdx(null)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span className="shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-md border border-white/5">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-white/5"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                        {group.title}
                      </h3>
                      {group.hubs.length > 0 && (
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                          via <span className="text-indigo-400 font-bold">{group.hubs.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pl-4 border-l border-white/5 group-hover/leg:border-indigo-500/20 transition-colors">
                    {group.segments.map(({ seg, globalIdx }) => {
                      const sTo = STATIONS.find(s => s.id === seg.to)!;
                      const prevGlobalIdx = globalIdx > 0 ? globalIdx - 1 : null;
                      const isTransfer = prevGlobalIdx !== null && pathResult!.segments[prevGlobalIdx].line !== seg.line;

                      return (
                        <div 
                          key={`seg-modal-${globalIdx}`}
                          onMouseEnter={() => onHoverSegment(globalIdx)}
                          onMouseLeave={() => onHoverSegment(null)}
                          className={`group/item flex items-start gap-5 p-4 rounded-2xl transition-all border ${hoverSegmentIdx === globalIdx ? 'bg-indigo-600/10 border-indigo-500/40 translate-x-1' : 'bg-slate-800/10 border-transparent hover:bg-slate-800/20 hover:border-white/5'}`}
                        >
                          <div className="flex flex-col items-center gap-2 pt-1.5 shrink-0">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LINE_COLORS[seg.line] }}></div>
                            <div className="w-px h-6 bg-slate-800 rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            {isTransfer && (
                              <div className="inline-flex items-center gap-2 px-1.5 py-0.5 bg-amber-500/10 rounded mb-0.5">
                                <span className="text-[7px] font-black text-amber-500 uppercase tracking-tight">Switch Line</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-slate-300 group-hover/item:text-white transition-colors">
                                {sTo.name}
                              </span>
                              <span className="text-[8px] font-black text-slate-600 bg-slate-900/50 px-2 py-0.5 rounded border border-white/5">
                                #{globalIdx + 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-70" style={{ color: LINE_COLORS[seg.line] }}>{seg.line} Line</span>
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

          <div className="w-1/2 p-10 flex flex-col gap-6 bg-[#080c14]">
            <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 shadow-inner relative">
              <MetroMap 
                waypoints={waypoints} onSelectStation={() => {}} 
                hoverId={null} hoverSegmentIdx={hoverSegmentIdx} 
                pathResult={pathResult} showLabels={true} showHubLabels={true} 
                title="Visual Route Guide" subtitle="Leg Isolation Active"
                isPreview={true}
                filteredLegIndex={hoverLegIdx}
              />
              <div className="absolute inset-0 pointer-events-none border-[1.5rem] border-slate-950/20"></div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Total Hops', value: pathResult?.totalHops },
                { label: 'Transitions', value: pathResult?.totalTransitions },
                { label: 'Total Distance', value: pathResult?.totalDistance }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 flex flex-col gap-1 items-center justify-center transition-all hover:bg-slate-900/80 hover:border-white/10">
                  <span className="text-4xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
