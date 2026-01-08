
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
        ? "RECONNAISSANCE" 
        : `LEG ${getAlphabetLabel(seg.legIndex)} → ${getAlphabetLabel(seg.legIndex + 1)}`;
      
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
      group.title = `${startS.name} > ${endS.name}`;

      const internalStations = segments.slice(0, -1).map(s => STATIONS.find(st => st.id === s.to)!);
      group.hubs = internalStations.filter(s => s.isTransfer).map(s => s.name);
    });

    return groups;
  }, [pathResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-[95vw] bg-[#0d1117] border-4 border-[#30363d] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="flex items-center justify-between px-8 py-6 border-b-4 border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-red-600 border-4 border-white/20 flex items-center justify-center shadow-2xl shadow-red-600/40">
              <span className="text-white font-black text-xl italic">M</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">TRANSPORT LOG REPORT</h2>
              <p className="text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">TRANSIT SYSTEM OPTIMIZATION DATA</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Focused List View */}
          <div className="w-[400px] shrink-0 overflow-y-auto custom-scrollbar p-8 border-r-4 border-[#30363d] bg-[#05070a]">
            {/* Master Sequence View */}
            <section className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NODE_CHAIN</span>
                <div className="flex-1 h-px bg-[#30363d]"></div>
              </div>
              <div className="bg-[#161b22] p-4 border-2 border-[#30363d]">
                <div className="flex flex-wrap items-center gap-2">
                  {fullJourneySequence.map((item, idx) => (
                    <React.Fragment key={`master-dot-${idx}`}>
                      <div className="relative group/node-dot">
                        <HubDot station={item.station} className="group-hover/node-dot:scale-125 transition-transform cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/node-dot:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap bg-black text-white text-[10px] font-black py-1.5 px-3 border border-red-600 shadow-2xl">
                          {item.station.name}
                        </div>
                      </div>
                      {idx < fullJourneySequence.length - 1 && (
                        <div className="w-2 h-px bg-[#30363d]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </section>

            <div className="space-y-8 pb-10">
              {legGroups.map((group, gIdx) => (
                <div 
                  key={`leg-modal-${gIdx}`} 
                  className="space-y-4 group/leg"
                  onMouseEnter={() => setHoverLegIdx(group.legIndex)}
                  onMouseLeave={() => setHoverLegIdx(null)}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 bg-red-600/10 border border-red-600/20">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-[#30363d]"></div>
                    </div>
                    
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      {group.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 pl-3 border-l-2 border-[#30363d] group-hover/leg:border-red-600/30 transition-colors">
                    {group.segments.map(({ seg, globalIdx }) => {
                      const sTo = STATIONS.find(s => s.id === seg.to)!;
                      const prevGlobalIdx = globalIdx > 0 ? globalIdx - 1 : null;
                      const isTransfer = prevGlobalIdx !== null && pathResult!.segments[prevGlobalIdx].line !== seg.line;

                      return (
                        <div 
                          key={`seg-modal-${globalIdx}`}
                          onMouseEnter={() => onHoverSegment(globalIdx)}
                          onMouseLeave={() => onHoverSegment(null)}
                          className={`group/item flex items-center gap-4 p-3 transition-all border-2 ${hoverSegmentIdx === globalIdx ? 'bg-red-600/10 border-red-600/40 translate-x-1' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: LINE_COLORS[seg.line] }}></div>
                          <div className="flex-1 flex flex-col">
                            <span className="text-[11px] font-black text-slate-300 group-hover/item:text-white transition-colors uppercase truncate">
                              {sTo.name}
                            </span>
                            {isTransfer && (
                                <span className="text-[7px] font-black text-amber-500 uppercase">TRANSIT_HUB_SWITCH</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expanded Map View */}
          <div className="flex-1 p-6 flex flex-col gap-6 bg-[#0a0f1d] relative">
            {/* Contextual Data Overlay */}
            <div className="absolute top-10 left-10 z-50 flex items-center gap-6 bg-black/80 backdrop-blur-md border border-[#30363d] p-4 shadow-2xl">
              {[
                { label: 'HOPS', value: pathResult?.totalHops },
                { label: 'TRANSITS', value: pathResult?.totalTransitions },
                { label: 'GEODESIC', value: `${pathResult?.totalDistance}km` }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center min-w-[60px] border-r last:border-0 border-[#30363d] pr-6 last:pr-0">
                  <span className="text-xl font-black text-white">{stat.value}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 border-4 border-[#30363d] shadow-inner relative overflow-hidden bg-black">
              <MetroMap 
                waypoints={waypoints} onSelectStation={() => {}} 
                hoverId={null} hoverSegmentIdx={hoverSegmentIdx} 
                pathResult={pathResult} 
                showLabels={false} 
                showHubLabels={false} 
                title="" subtitle=""
                isPreview={true}
                filteredLegIndex={hoverLegIdx}
              />
              <div className="absolute inset-0 pointer-events-none border-[1rem] border-black/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
