
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetroMap } from './components/MetroMap';
import { Sidebar } from './components/Sidebar';
import { ItineraryModal } from './components/ItineraryModal';
import { OptimizationMode, PathResult } from './types';
import { findPath } from './services/pathfinder';

const App: React.FC = () => {
  // Start with exactly two slots: A and B.
  const [waypoints, setWaypoints] = useState<string[]>(['', '']);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverSegmentIdx, setHoverSegmentIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<OptimizationMode>('HOPS');
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  
  const [showLabels, setShowLabels] = useState(false);
  const [showHubLabels, setShowHubLabels] = useState(true);
  const [showPlanOverlay, setShowPlanOverlay] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cleanWaypoints = (ws: string[]) => {
    const filled = ws.filter(w => w !== "");
    const next = [...filled, ""];
    while (next.length < 2) {
      next.push("");
    }
    return next;
  };

  useEffect(() => {
    const activeWaypoints = waypoints.filter(w => w !== "");
    if (activeWaypoints.length >= 2) {
      const res = findPath(activeWaypoints, mode);
      setPathResult(res);
    } else {
      setPathResult(null);
    }
  }, [waypoints, mode]);

  const handleStationClick = (id: string) => {
    const existingIdx = waypoints.indexOf(id);
    let next: string[];

    if (existingIdx !== -1) {
      next = waypoints.filter(w => w !== id);
    } else {
      const firstEmpty = waypoints.indexOf("");
      if (firstEmpty !== -1) {
        next = [...waypoints];
        next[firstEmpty] = id;
      } else {
        next = [...waypoints, id];
      }
      
      if (waypoints.filter(w => w !== "").length === 0) {
        setShowPlanOverlay(false);
      }
    }
    setWaypoints(cleanWaypoints(next));
  };

  const handleWaypointChange = (idx: number, id: string) => {
    const nextWaypoints = [...waypoints];
    nextWaypoints[idx] = id;
    setWaypoints(cleanWaypoints(nextWaypoints));
    if (id !== "") setShowPlanOverlay(false);
  };

  const handleRemoveWaypoint = (idx: number) => {
    const nextWaypoints = waypoints.filter((_, i) => i !== idx);
    setWaypoints(cleanWaypoints(nextWaypoints));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#05070a] text-slate-100 overflow-hidden font-sans selection:bg-red-500/30">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
        <div className="flex-1 relative overflow-visible flex flex-col">
          <MetroMap 
            waypoints={waypoints}
            onSelectStation={handleStationClick}
            hoverId={hoverId}
            hoverSegmentIdx={hoverSegmentIdx}
            pathResult={pathResult}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            showHubLabels={showHubLabels}
            onToggleHubLabels={() => setShowHubLabels(!showHubLabels)}
            title="КАРТА НА МЕТРОТО"
            subtitle="INDUSTRIAL TRANSIT SECTOR 04"
          />
          
          {/* Toast for first time plan route info */}
          {showPlanOverlay && waypoints.filter(w => w !== "").length === 0 && (
            <div
              className="fixed left-6 bottom-6 z-30 bg-black/90 border-2 border-[#30363d] shadow-2xl rounded-lg p-5 max-w-xs text-center animate-in fade-in duration-500 cursor-pointer select-none"
              onClick={() => setShowPlanOverlay(false)}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center shadow-xl shadow-red-600/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white mb-2">PLAN ROUTE</h2>
              <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase tracking-wide">Select your starting station and your target station to find the best routes!</p>
              <div className="mt-3 text-xs text-slate-500 font-bold">Click to dismiss</div>
            </div>
          )}
        </div>

        <Sidebar 
          waypoints={waypoints} 
          onWaypointChange={handleWaypointChange}
          onRemoveWaypoint={handleRemoveWaypoint}
          onHover={setHoverId} 
          onHoverSegment={setHoverSegmentIdx}
          mode={mode} 
          onModeChange={setMode}
          pathResult={pathResult}
          onOpenModal={() => setIsModalOpen(true)}
          onClearAllWaypoints={() => setWaypoints(['', ''])}
        />
      </main>

      {isModalOpen && (
        <ItineraryModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          pathResult={pathResult} waypoints={waypoints}
          onHoverSegment={setHoverSegmentIdx} hoverSegmentIdx={hoverSegmentIdx}
        />
      )}

      <div className="absolute -bottom-24 -right-24 pointer-events-none opacity-[0.02] rotate-12 select-none">
        <div className="text-[300px] font-black leading-none uppercase text-white">METRO</div>
      </div>
    </div>
  );
};

export default App;
