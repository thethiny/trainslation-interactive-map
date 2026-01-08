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

  /**
   * Invariant:
   * 1. The list must have at least 2 entries (A and B).
   * 2. The last entry must always be an empty string (the "+" slot) 
   *    UNLESS only the first two slots exist and are both empty.
   */
  const cleanWaypoints = (ws: string[]) => {
    // 1. Get all filled values in order
    const filled = ws.filter(w => w !== "");
    
    // 2. We always want a trailing empty slot to act as the "Add" button
    const next = [...filled, ""];
    
    // 3. Ensure we have at least A and B slots
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
      // Toggle off: Remove if it's there
      next = waypoints.filter(w => w !== id);
    } else {
      // Find the first empty slot to fill
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
    // Indices 0 and 1 (A and B) cannot be removed from the list structure, 
    // though their values can be cleared by the StationSelect.
    // However, the Sidebar logic hides the "X" for index 0 and 1.
    const nextWaypoints = waypoints.filter((_, i) => i !== idx);
    setWaypoints(cleanWaypoints(nextWaypoints));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <MetroMap 
            waypoints={waypoints}
            onSelectStation={handleStationClick}
            hoverId={hoverId}
            hoverSegmentIdx={hoverSegmentIdx}
            pathResult={pathResult}
            showLabels={showLabels}
            showHubLabels={showHubLabels}
            title="Transit Authority"
            subtitle="Real-time Network Logic"
          />
          
          {showPlanOverlay && waypoints.filter(w => w !== "").length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] z-20 pointer-events-none">
              <div className="glass-panel p-10 rounded-3xl max-w-sm space-y-6 text-center pointer-events-auto shadow-2xl animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Plan Your Route</h2>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">Select stations sequentially to build your path. A and B are your minimum journey bounds.</p>
                </div>
                <button onClick={() => setShowPlanOverlay(false)} className="w-full py-3 bg-white text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-colors">Start Exploration</button>
              </div>
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
          showLabels={showLabels} 
          onToggleLabels={() => setShowLabels(!showLabels)}
          showHubLabels={showHubLabels} 
          onToggleHubLabels={() => setShowHubLabels(!showHubLabels)}
          onOpenModal={() => setIsModalOpen(true)}
        />
      </main>

      {isModalOpen && (
        <ItineraryModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          pathResult={pathResult} waypoints={waypoints}
          onHoverSegment={setHoverSegmentIdx} hoverSegmentIdx={hoverSegmentIdx}
        />
      )}

      <div className="absolute -bottom-24 -right-24 pointer-events-none opacity-[0.03] rotate-12 select-none">
        <div className="text-[300px] font-black leading-none uppercase">Metro</div>
      </div>
    </div>
  );
};

export default App;
