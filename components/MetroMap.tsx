
import React, { useMemo, useState, useRef } from 'react';
import { STATIONS, CONNECTIONS, LINE_COLORS } from '../constants';
import { Station, LineID, PathResult } from '../types';

interface MetroMapProps {
  waypoints: string[];
  onSelectStation: (id: string) => void;
  hoverId: string | null;
  hoverSegmentIdx: number | null;
  pathResult: PathResult | null;
  showLabels: boolean;
  onToggleLabels: () => void;
  showHubLabels: boolean;
  onToggleHubLabels: () => void;
  title: string;
  subtitle: string;
  isPreview?: boolean;
  filteredLegIndex?: number | null;
}

interface VisitDetail {
  stopNumber: number;
  legIndex: number;
  legLabel: string | null;
  prevName: string | null;
  prevId: string | null;
  nextName: string | null;
  nextId: string | null;
}

const getAlphabetLabel = (index: number) => String.fromCharCode(65 + index);

export const MetroMap: React.FC<MetroMapProps> = ({ 
  waypoints, 
  onSelectStation, 
  hoverId, 
  hoverSegmentIdx,
  pathResult,
  showLabels,
  onToggleLabels,
  showHubLabels,
  onToggleHubLabels,
  title,
  subtitle,
  isPreview = false,
  filteredLegIndex = null
}) => {
  const [internalHoverId, setInternalHoverId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, rawY: number, visits: VisitDetail[] } | null>(null);
  const [tooltipHoverStation, setTooltipHoverStation] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHoverId = hoverId || internalHoverId || tooltipHoverStation;
  
  const activeHoverConnections = useMemo(() => {
    if (!activeHoverId) return [];
    return CONNECTIONS.filter(c => c.from === activeHoverId || c.to === activeHoverId);
  }, [activeHoverId]);

  const PADDING = 10;
  const getCoords = (x: number, y: number) => ({
    x: PADDING + (x * 8),
    y: PADDING + (y * 8)
  });

  const pathVisits = useMemo(() => {
    const map = new Map<string, VisitDetail[]>();
    if (!pathResult) return map;

    pathResult.stations.forEach((sid, idx) => {
      const existing = map.get(sid) || [];
      const prevId = idx > 0 ? pathResult.stations[idx - 1] : null;
      const nextId = idx < pathResult.stations.length - 1 ? pathResult.stations[idx + 1] : null;
      
      const prevName = prevId ? STATIONS.find(s => s.id === prevId)?.name || null : 'Start';
      const nextName = nextId ? STATIONS.find(s => s.id === nextId)?.name || null : 'End';

      const segIdx = idx < pathResult.segments.length ? idx : idx - 1;
      const seg = pathResult.segments[segIdx];
      const legLabel = seg && seg.legIndex !== -1 
        ? `Leg ${getAlphabetLabel(seg.legIndex)}→${getAlphabetLabel(seg.legIndex + 1)}` 
        : (seg?.legIndex === -1 ? 'Coverage Detour' : null);

      existing.push({
        stopNumber: idx + 1,
        legIndex: seg?.legIndex ?? -1,
        legLabel,
        prevName,
        prevId,
        nextName,
        nextId
      });
      map.set(sid, existing);
    });
    return map;
  }, [pathResult]);

  const renderLines = () => {
    const linesByColor: Record<LineID, string[]> = { green: [], blue: [], red: [], yellow: [] };
    const seen = new Set();
    
    CONNECTIONS.forEach(c => {
      const key = [c.from, c.to, c.line].sort().join('-');
      if (!seen.has(key)) {
        const s1 = STATIONS.find(s => s.id === c.from)!;
        const s2 = STATIONS.find(s => s.id === c.to)!;
        const c1 = getCoords(s1.x, s1.y);
        const c2 = getCoords(s2.x, s2.y);
        linesByColor[c.line].push(`M${c1.x},${c1.y} L${c2.x},${c2.y}`);
        seen.add(key);
      }
    });

    return Object.entries(linesByColor).map(([lineId, paths]) => {
      const isLineConnectedToHover = activeHoverConnections.some(c => c.line === lineId);
      const baseOpacity = filteredLegIndex !== null ? "0.01" : (activeHoverId ? (isLineConnectedToHover ? "0.6" : "0.1") : "0.3");
      
      return (
        <path
          key={lineId}
          d={paths.join(' ')}
          stroke={LINE_COLORS[lineId as LineID]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={baseOpacity}
          className="transition-all duration-500"
        />
      );
    });
  };

  const renderPath = () => {
    if (!pathResult || !pathResult.segments) return null;
    
    return pathResult.segments.map((seg, i) => {
      const s1 = STATIONS.find(s => s.id === seg.from)!;
      const s2 = STATIONS.find(s => s.id === seg.to)!;
      const c1 = getCoords(s1.x, s1.y);
      const c2 = getCoords(s2.x, s2.y);
      const color = LINE_COLORS[seg.line];
      const d = `M${c1.x},${c1.y} L${c2.x},${c2.y}`;

      const isHoveredSegment = hoverSegmentIdx === i;
      const isFilteredOut = filteredLegIndex !== null && seg.legIndex !== filteredLegIndex;

      if (isFilteredOut) return null;

      return (
        <g key={`path-seg-${i}`} className="transition-all duration-500">
          <path
            d={d}
            stroke="white"
            strokeWidth={isHoveredSegment ? 6 : 4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-10"
          />
          <path
            d={d}
            stroke={color}
            strokeWidth={isHoveredSegment ? 5 : 3.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`path-flow transition-all duration-300 ${isHoveredSegment ? 'opacity-100' : 'opacity-100'}`}
            style={{ filter: isHoveredSegment ? `drop-shadow(0 0 10px ${color})` : `drop-shadow(0 0 4px ${color})` }}
          />
        </g>
      );
    });
  };

  const handleStationMouseEnter = (sid: string) => {
    if (isPreview) return;
    const s = STATIONS.find(st => st.id === sid)!;
    const coords = getCoords(s.x, s.y);
    setInternalHoverId(sid);
    
    const visits = pathVisits.get(sid) || [];
    if (visits.length > 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPercent = (coords.x / 100) * rect.width;
      const yPercent = (coords.y / 100) * rect.height;
      setTooltip({ x: xPercent, y: yPercent, rawY: coords.y, visits });
    }
  };

  const isTooltipAbove = tooltip && tooltip.rawY > 35;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-visible group/map ${isPreview ? 'cursor-default' : 'cursor-crosshair'}`}
    >
      {/* Map Content Box - clipped for background grid and rounded corners */}
      <div className="absolute inset-0 bg-[#0a0f1d] rounded-3xl border border-slate-800 shadow-inner overflow-hidden pointer-events-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-[850px] max-h-[850px] mx-auto overflow-visible">
          <defs>
            <pattern id="dotGrid" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.5" fill="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect x="-10" y="-10" width="120" height="120" fill="url(#dotGrid)" />

          {renderLines()}
          {renderPath()}

          {STATIONS.map(s => {
            const coords = getCoords(s.x, s.y);
            const waypointIdx = waypoints.indexOf(s.id);
            const isWaypoint = waypointIdx !== -1;
            const isHovered = s.id === activeHoverId;
            
            const visits = pathVisits.get(s.id) || [];
            const isInPath = visits.length > 0;
            const inHoveredSegment = hoverSegmentIdx !== null && 
              (pathResult?.segments[hoverSegmentIdx].from === s.id || pathResult?.segments[hoverSegmentIdx].to === s.id);

            const isInFilteredLeg = filteredLegIndex !== null && visits.some(v => v.legIndex === filteredLegIndex);
            const isFilteredOut = filteredLegIndex !== null && !isInFilteredLeg && !isWaypoint;

            if (isFilteredOut) return null;

            const labelVisible = isWaypoint || isHovered || (s.isTransfer ? showHubLabels : showLabels) || inHoveredSegment;

            return (
              <g 
                key={s.id} 
                className={isPreview ? "" : "cursor-pointer group/station"}
                onClick={() => !isPreview && onSelectStation(s.id)}
                onMouseEnter={() => handleStationMouseEnter(s.id)}
                onMouseLeave={() => {
                  setInternalHoverId(null);
                  setTooltip(null);
                  setTooltipHoverStation(null);
                }}
              >
                {(isHovered || isWaypoint || inHoveredSegment) && (
                  <circle cx={coords.x} cy={coords.y} r={inHoveredSegment ? 4.5 : 3.5} fill={isWaypoint ? '#818cf8' : inHoveredSegment ? '#f8fafc' : 'white'} className="animate-pulse opacity-20 transition-all" />
                )}
                <circle
                  cx={coords.x} cy={coords.y} r={isWaypoint ? 2.4 : s.isTransfer ? 2.2 : 1.4}
                  fill={isWaypoint ? '#818cf8' : inHoveredSegment ? '#f8fafc' : isInPath ? '#334155' : '#1e293b'}
                  stroke={isWaypoint ? 'white' : inHoveredSegment ? '#818cf8' : isHovered ? '#818cf8' : '#475569'}
                  strokeWidth={isWaypoint ? 0.7 : (isHovered || inHoveredSegment) ? 0.6 : 0.4}
                  className="transition-all duration-300"
                />
                {isWaypoint && (
                  <text x={coords.x} y={coords.y + 0.6} textAnchor="middle" className="text-[1.8px] font-black fill-white select-none pointer-events-none">
                    {getAlphabetLabel(waypointIdx)}
                  </text>
                )}
                {isInPath && !isWaypoint && (
                  <text x={coords.x} y={coords.y + 0.4} textAnchor="middle" className={`text-[1.3px] font-black select-none pointer-events-none transition-colors duration-300 ${inHoveredSegment || isHovered ? 'fill-indigo-600' : 'fill-slate-100'}`}>
                    {visits.length > 1 ? '+' : visits[0].stopNumber}
                  </text>
                )}
                <text
                  x={coords.x} y={coords.y - 3.5} textAnchor="middle"
                  className={`text-[2.2px] font-bold select-none pointer-events-none transition-all duration-300 ${labelVisible ? 'opacity-100' : 'opacity-0'}`}
                  fill={isWaypoint ? 'white' : inHoveredSegment ? 'white' : isHovered ? '#818cf8' : '#94a3b8'}
                >
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Overlays (Title and Controls) - Outside clipped box */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{title}</h2>
        <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mt-1 opacity-70">{subtitle}</p>
      </div>

      {!isPreview && (
        <div className="absolute top-8 right-8 z-40 flex flex-col gap-2">
          <div className="glass-panel p-1.5 rounded-2xl border border-white/10 flex flex-col gap-1">
            <button 
              onClick={onToggleLabels}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${showLabels ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <div className={`w-3.5 h-3.5 rounded border ${showLabels ? 'bg-white border-white' : 'border-slate-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">All Nodes</span>
            </button>
            <button 
              onClick={onToggleHubLabels}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${showHubLabels ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <div className={`w-3.5 h-3.5 rounded border ${showHubLabels ? 'bg-white border-white' : 'border-slate-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Hubs Only</span>
            </button>
          </div>
        </div>
      )}

      {/* Tooltip Layer - Outside clipped box for full visibility across map edges */}
      {tooltip && !isPreview && (
        <div 
          className="absolute z-[100] pointer-events-auto animate-in zoom-in fade-in duration-200"
          style={{ 
            left: `${tooltip.x}px`, 
            top: isTooltipAbove ? `${tooltip.y - 12}px` : `${tooltip.y + 12}px`, 
            transform: isTooltipAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)' 
          }}
          onMouseEnter={() => setTooltip(tooltip)}
          onMouseLeave={() => setTooltip(null)}
        >
          {!isTooltipAbove && (
            <div className="w-4 h-4 bg-[#1e293b] border-l border-t border-white/10 rotate-45 mx-auto -mb-2 relative z-10"></div>
          )}

          <div className="bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-2xl p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/30">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Visit History</span>
              <span className="text-[9px] font-bold text-slate-500">{tooltip.visits.length} Occurrences</span>
            </div>
            <div className="space-y-4 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
              {tooltip.visits.map((v, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-900/40 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        {v.stopNumber}
                      </div>
                      {v.legLabel && (
                        <span className="text-[8px] font-black uppercase text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">
                          {v.legLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] flex-1 mt-1">
                    <span 
                      className={`font-bold transition-colors cursor-help truncate max-w-[80px] ${v.prevId ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-500 italic'}`}
                      onMouseEnter={() => v.prevId && setTooltipHoverStation(v.prevId)}
                      onMouseLeave={() => setTooltipHoverStation(null)}
                    >
                      {v.prevName}
                    </span>
                    <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span 
                      className={`font-bold transition-colors cursor-help truncate max-w-[80px] ${v.nextId ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-500 italic'}`}
                      onMouseEnter={() => v.nextId && setTooltipHoverStation(v.nextId)}
                      onMouseLeave={() => setTooltipHoverStation(null)}
                    >
                      {v.nextName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isTooltipAbove && (
            <div className="w-4 h-4 bg-[#1e293b] border-r border-b border-white/10 rotate-45 mx-auto -mt-2"></div>
          )}
        </div>
      )}
    </div>
  );
};
