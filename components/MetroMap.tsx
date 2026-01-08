
// Add missing React import to fix 'Cannot find namespace React' error when using React.FC
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
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHoverId = hoverId || internalHoverId;
  
  const activeHoverConnections = useMemo(() => {
    if (!activeHoverId) return [];
    return CONNECTIONS.filter(c => c.from === activeHoverId || c.to === activeHoverId);
  }, [activeHoverId]);

  const PADDING = 10;
  const SCALE = 1/8;
  const getCoords = (x: number, y: number) => ({
    x: PADDING + (x * SCALE),
    y: PADDING + (y * SCALE)
  });

  // Calculate dynamic viewBox based on scaled station coordinates
  const maxCoords = useMemo(() => {
    let maxX = 0, maxY = 0;
    STATIONS.forEach(s => {
      const { x, y } = getCoords(s.x, s.y);
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
    return { maxX: maxX + PADDING, maxY: maxY + PADDING };
  }, [STATIONS]);

  const pathVisits = useMemo(() => {
    const map = new Map<string, VisitDetail[]>();
    if (!pathResult) return map;

    pathResult.stations.forEach((sid, idx) => {
      const existing = map.get(sid) || [];
      const prevId = idx > 0 ? pathResult.stations[idx - 1] : null;
      const nextId = idx < pathResult.stations.length - 1 ? pathResult.stations[idx + 1] : null;
      const prevName = prevId ? STATIONS.find(s => s.id === prevId)?.name || null : 'ORIGIN';
      const nextName = nextId ? STATIONS.find(s => s.id === nextId)?.name || null : 'TERMINAL';

      const segIdx = idx < pathResult.segments.length ? idx : idx - 1;
      const seg = pathResult.segments[segIdx];
      const legLabel = seg && seg.legIndex !== -1 
        ? `Trip ${getAlphabetLabel(seg.legIndex)}→${getAlphabetLabel(seg.legIndex + 1)}` 
        : (seg?.legIndex === -1 ? 'Journey' : null);

      existing.push({ stopNumber: idx + 1, legIndex: seg?.legIndex ?? -1, legLabel, prevName, prevId, nextName, nextId });
      map.set(sid, existing);
    });
    return map;
  }, [pathResult]);

  // Helper to check if a segment is horizontal, vertical, or 45-degree diagonal
  const isManhattanOrDiagonal = (c1: {x: number, y: number}, c2: {x: number, y: number}) => {
    const dx = Math.abs(c1.x - c2.x);
    const dy = Math.abs(c1.y - c2.y);
    return dx === 0 || dy === 0 || dx === dy;
  };

  // Helper to create a Manhattan/diagonal path, favoring outer tracing for L-shapes
  const getGridPath = (c1: {x: number, y: number}, c2: {x: number, y: number}) => {
    if (isManhattanOrDiagonal(c1, c2)) {
      return `M${c1.x},${c1.y} L${c2.x},${c2.y}`;
    } else {
      // Map bounding box
      const minX = 0, minY = 0;
      const maxX = maxCoords.maxX;
      const maxY = maxCoords.maxY;
      // Two possible bends
      const bend1 = { x: c2.x, y: c1.y }; // horizontal then vertical
      const bend2 = { x: c1.x, y: c2.y }; // vertical then horizontal
      // Distance to nearest edge for each bend
      const edgeDist = (pt: {x: number, y: number}) => {
        return Math.min(
          Math.abs(pt.x - minX),
          Math.abs(pt.x - maxX),
          Math.abs(pt.y - minY),
          Math.abs(pt.y - maxY)
        );
      };
      const dist1 = edgeDist(bend1);
      const dist2 = edgeDist(bend2);
      // Favor the bend closer to the edge (outer tracing)
      const bend = dist1 < dist2 ? bend1 : bend2;
      // Determine which direction the L is (horizontal-then-vertical or vertical-then-horizontal)
      const isHorzThenVert = (bend === bend1);
      // Set the length of the diagonal (in SVG units, adjust as needed)
      const d = 3.5;
      let path = `M${c1.x},${c1.y} `;
      if (isHorzThenVert) {
        // Move horizontally, stop d before the bend
        const hx = bend.x - Math.sign(bend.x - c1.x) * d;
        path += `L${hx},${bend.y} `;
        // Diagonal segment (45-degree)
        const diagX = bend.x;
        const diagY = bend.y + Math.sign(c2.y - bend.y) * d;
        path += `L${diagX},${diagY} `;
        // Finish vertical to c2
        path += `L${c2.x},${c2.y}`;
      } else {
        // Move vertically, stop d before the bend
        const hy = bend.y - Math.sign(bend.y - c1.y) * d;
        path += `L${bend.x},${hy} `;
        // Diagonal segment (45-degree)
        const diagX = bend.x + Math.sign(c2.x - bend.x) * d;
        const diagY = bend.y;
        path += `L${diagX},${diagY} `;
        // Finish horizontal to c2
        path += `L${c2.x},${c2.y}`;
      }
      return path;
    }
  };

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
        linesByColor[c.line].push(getGridPath(c1, c2));
        seen.add(key);
      }
    });

    return Object.entries(linesByColor).map(([lineId, paths]) => {
      const isLineConnectedToHover = activeHoverConnections.some(c => c.line === lineId);
      const baseOpacity = filteredLegIndex !== null ? "0.01" : (activeHoverId ? (isLineConnectedToHover ? "0.8" : "0.1") : "0.3");
      
      return (
        <path
          key={lineId}
          d={paths.join(' ')}
          stroke={LINE_COLORS[lineId as LineID]}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity={baseOpacity}
          className="transition-all duration-700"
          style={{ filter: 'grayscale(30%) contrast(120%)' }}
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
      const d = getGridPath(c1, c2);

      const isHoveredSegment = hoverSegmentIdx === i;
      const isFilteredOut = filteredLegIndex !== null && seg.legIndex !== filteredLegIndex;

      if (isFilteredOut) return null;
      const shouldAnimate = hoverSegmentIdx === null ? true : isHoveredSegment;

      return (
        <g key={`path-seg-${i}`} className="transition-all duration-500">
          <path
            d={d}
            stroke={color}
            strokeWidth={isHoveredSegment ? 5 : 3.5}
            fill="none"
            opacity="0.15"
          />
          <path
            d={d}
            stroke={color}
            strokeWidth={isHoveredSegment ? 2.5 : 1.8}
            fill="none"
            strokeLinecap="round"
            className={shouldAnimate ? "path-flow" : ""}
          />
        </g>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-visible industrial-panel rounded-none border-4 border-[#30363d] ${isPreview ? 'cursor-default' : 'cursor-crosshair'}`}
    >
      <div className="absolute inset-0 paper-texture overflow-hidden">
        <svg
          viewBox={`0 0 ${maxCoords.maxX} ${maxCoords.maxY}`}
          className="w-full h-full max-w-[850px] max-h-[850px] mx-auto overflow-visible"
        >
          <defs>
            <pattern id="chalkGrid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.1" />
            </pattern>
            <filter id="inkSaturate">
                <feColorMatrix type="saturate" values="0.8" />
            </filter>
          </defs>
          <rect x="-10" y="-10" width="120" height="120" fill="url(#chalkGrid)" />

          {renderLines()}
          {renderPath()}

          {STATIONS.map(s => {
            const coords = getCoords(s.x, s.y);
            const waypointIdx = waypoints.indexOf(s.id);
            const isWaypoint = waypointIdx !== -1;
            const isHovered = s.id === activeHoverId;
            const visits = pathVisits.get(s.id) || [];
            
            const isInHoveredSegment = hoverSegmentIdx !== null && (pathResult?.segments[hoverSegmentIdx].from === s.id || pathResult?.segments[hoverSegmentIdx].to === s.id);
            const isInFilteredLeg = filteredLegIndex !== null && visits.some(v => v.legIndex === filteredLegIndex);
            
            const isInPath = visits.length > 0;
            const isFilteredOut = filteredLegIndex !== null && !isInFilteredLeg && !isWaypoint;

            if (isFilteredOut) return null;

            // Refined label logic: only show labels for relevant parts if in preview (modal)
            const labelVisible = isWaypoint || isHovered || isInHoveredSegment || 
                                (isPreview ? isInFilteredLeg : (s.isTransfer ? showHubLabels : showLabels));

            const baseRadius = s.isTransfer ? 1.4 : 0.8;
            const radius = isWaypoint ? 1.8 : (isHovered || isInHoveredSegment) ? baseRadius * 1.2 : baseRadius;

            return (
              <g 
                key={s.id} 
                className={isPreview ? "" : "group/station"}
                onClick={() => !isPreview && onSelectStation(s.id)}
                onMouseEnter={() => {
                   if (isPreview) return;
                   setInternalHoverId(s.id);
                   const v = pathVisits.get(s.id) || [];
                   if (v.length > 1 && containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setTooltip({ x: (coords.x/100)*rect.width, y: (coords.y/100)*rect.height, rawY: coords.y, visits: v });
                   }
                }}
                onMouseLeave={() => { setInternalHoverId(null); setTooltip(null); }}
              >
                <circle
                  cx={coords.x} cy={coords.y}
                  r={radius}
                  fill={isWaypoint ? '#8c2a2a' : (isHovered || isInHoveredSegment) ? '#1a1a1a' : isInPath ? '#334155' : '#4b5563'}
                  stroke={isWaypoint ? '#1a1a1a' : (isHovered || isInHoveredSegment) ? '#1a1a1a' : '#374151'}
                  strokeWidth="0.2"
                  className="transition-all duration-300"
                />
                
                {isWaypoint && (
                  <text x={coords.x} y={coords.y + 0.8} textAnchor="middle" className="text-[2.2px] font-black fill-white select-none pointer-events-none">
                    {getAlphabetLabel(waypointIdx)}
                  </text>
                )}

                <text
                  x={coords.x} y={coords.y - 2.5} textAnchor="middle"
                  className={`text-[2.2px] font-black select-none pointer-events-none transition-all duration-300 ${labelVisible ? 'opacity-100' : 'opacity-0'}`}
                  fill="#1a1a1a"
                >
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {!isPreview && (
        <div className="absolute top-10 left-10 z-10 pointer-events-none border-l-4 border-[#1a1a1a] pl-4 py-1">
          <h2 className="text-2xl font-black text-[#1a1a1a] tracking-widest uppercase leading-none">{title}</h2>
          <p className="text-slate-900 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">{subtitle}</p>
        </div>
      )}

      {!isPreview && (
        <div className="absolute top-10 right-10 z-40 flex flex-col gap-3">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-[#1a1a1a] p-3 flex flex-col gap-2 shadow-xl">
            <div 
              onClick={onToggleLabels}
              className={`radial-toggle ${showLabels ? 'active' : ''} !bg-slate-100 !border-slate-300 hover:!border-[#1a1a1a]`}
            >
              <div className="radial-circle !border-slate-400"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-800 select-none">FULL OVERLAY</span>
            </div>
            <div 
              onClick={onToggleHubLabels}
              className={`radial-toggle ${showHubLabels ? 'active' : ''} !bg-slate-100 !border-slate-300 hover:!border-[#1a1a1a]`}
            >
              <div className="radial-circle !border-slate-400"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-800 select-none">HUBS ONLY</span>
            </div>
          </div>
        </div>
      )}

      {tooltip && !isPreview && (
        <div 
          className="absolute z-[100] bg-white border-2 border-[#1a1a1a] p-4 min-w-[280px] shadow-2xl animate-in fade-in zoom-in duration-150"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y + 15}px`, transform: 'translateX(-50%)' }}
        >
          <div className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-widest mb-3 pb-2 border-b border-black/10">STATION VISIT LOG</div>
          <div className="space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar">
            {tooltip.visits.map((v, i) => (
              <div key={i} className="bg-slate-50 p-2 border border-black/5 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-[#8c2a2a]">STOP #{v.stopNumber}</span>
                  <span className="text-slate-500">{v.legLabel}</span>
                </div>
                <div className="text-[9px] text-slate-800 flex items-center gap-2">
                  <span className="truncate">{v.prevName}</span>
                  <span className="text-[#8c2a2a]">→</span>
                  <span className="truncate">{v.nextName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
