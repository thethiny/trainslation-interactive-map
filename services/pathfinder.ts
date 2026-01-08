
import { STATIONS, CONNECTIONS } from '../constants';
import { Station, Connection, PathResult, PathSegment, OptimizationMode, LineID } from '../types';

/**
 * Standard Dijkstra for a single pair of nodes
 */
export function findPathSegment(startId: string, endId: string, mode: OptimizationMode): PathResult | null {
  // Dijkstra setup
  const nodes = STATIONS.flatMap(s => s.line.map(l => `${s.id}|${l}`));
  const distances: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const queue = new Set(nodes);

  nodes.forEach(nodeKey => {
    distances[nodeKey] = Infinity;
    prev[nodeKey] = null;
  });

  const startStation = STATIONS.find(s => s.id === startId)!;
  startStation.line.forEach(l => {
    const key = `${startId}|${l}`;
    distances[key] = 0;
  });

  while (queue.size > 0) {
    let uKey: string | null = null;
    queue.forEach(nodeKey => {
      if (uKey === null || distances[nodeKey] < distances[uKey]) {
        uKey = nodeKey;
      }
    });

    if (!uKey || distances[uKey] === Infinity) break;

    const [uId, uLine] = uKey.split('|');
    if (uId === endId) break;

    queue.delete(uKey);

    const sameLineNeighbors = CONNECTIONS.filter(c => c.from === uId && c.line === uLine);
    for (const edge of sameLineNeighbors) {
      const vKey = `${edge.to}|${uLine}`;
      if (!queue.has(vKey)) continue;

      let weight = 0;
      if (mode === 'HOPS') weight = 1;
      else if (mode === 'DISTANCE' || mode === 'TRAVERSE_ALL_EDGES') weight = edge.weight;
      else if (mode === 'LEAST_TRANSITIONS') weight = 1;

      const alt = distances[uKey] + weight;
      if (alt < distances[vKey]) {
        distances[vKey] = alt;
        prev[vKey] = uKey;
      }
    }

    const currentStation = STATIONS.find(s => s.id === uId)!;
    for (const l of currentStation.line) {
      if (l === uLine) continue;
      const vKey = `${uId}|${l}`;
      if (!queue.has(vKey)) continue;

      const weight = (mode === 'LEAST_TRANSITIONS') ? 1000 : 0;
      const alt = distances[uKey] + weight;
      if (alt < distances[vKey]) {
        distances[vKey] = alt;
        prev[vKey] = uKey;
      }
    }
  }

  const endKeys = STATIONS.find(s => s.id === endId)!.line.map(l => `${endId}|${l}`);
  let bestEndKey = endKeys[0];
  endKeys.forEach(k => { if (distances[k] < distances[bestEndKey]) bestEndKey = k; });

  if (distances[bestEndKey] === Infinity) return null;

  const pathKeys: string[] = [];
  let curr: string | null = bestEndKey;
  while (curr !== null) {
    pathKeys.unshift(curr);
    curr = prev[curr];
  }

  const finalStationIds: string[] = [];
  const segments: PathSegment[] = [];
  let totalHops = 0;
  let totalDistance = 0;
  let totalTransitions = 0;
  let lastLine: LineID | null = null;

  pathKeys.forEach((key) => {
    const [id, lineStr] = key.split('|');
    const line = lineStr as LineID;
    
    if (finalStationIds.length === 0 || finalStationIds[finalStationIds.length - 1] !== id) {
      if (finalStationIds.length > 0) {
        totalHops++;
        const prevId = finalStationIds[finalStationIds.length - 1];
        const edge = CONNECTIONS.find(c => c.from === prevId && c.to === id && c.line === line);
        totalDistance += edge ? edge.weight : 0;
        segments.push({ from: prevId, to: id, line, legIndex: 0 });
      }
      finalStationIds.push(id);
    }
    if (lastLine && line !== lastLine) {
      totalTransitions++;
    }
    lastLine = line;
  });

  return { stations: finalStationIds, segments, totalHops, totalDistance, totalTransitions };
}

export function findPath(waypoints: string[], mode: OptimizationMode): PathResult | null {
  if (waypoints.length < 2) return null;

  if (mode === 'TRAVERSE_ALL') {
    return traverseAllWithWaypoints(waypoints, false);
  }
  if (mode === 'TRAVERSE_ALL_EDGES') {
    return traverseAllWithWaypoints(waypoints, true);
  }

  const fullStations: string[] = [waypoints[0]];
  const fullSegments: PathSegment[] = [];
  let totalHops = 0;
  let totalDistance = 0;
  let totalTransitions = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const leg = findPathSegment(waypoints[i], waypoints[i+1], mode);
    if (!leg) return null;

    leg.segments.forEach(seg => {
      fullSegments.push({ ...seg, legIndex: i });
    });
    fullStations.push(...leg.stations.slice(1));
    totalHops += leg.totalHops;
    totalDistance += leg.totalDistance;
    totalTransitions += leg.totalTransitions;
  }

  return {
    stations: fullStations,
    segments: fullSegments,
    totalHops,
    totalDistance,
    totalTransitions
  };
}

function traverseAllWithWaypoints(waypoints: string[], allEdges: boolean): PathResult {
  const fullStations: string[] = [waypoints[0]];
  const fullSegments: PathSegment[] = [];
  let totalHops = 0;
  let totalDistance = 0;
  let totalTransitions = 0;
  const visitedNodes = new Set<string>([waypoints[0]]);
  const visitedEdges = new Set<string>();

  let currentId = waypoints[0];
  const endId = waypoints[waypoints.length - 1];

  // 1. Follow waypoints sequence
  for (let i = 0; i < waypoints.length - 1; i++) {
    const leg = findPathSegment(currentId, waypoints[i+1], 'HOPS');
    if (leg) {
      leg.stations.forEach(id => visitedNodes.add(id));
      leg.segments.forEach(seg => {
        const edgeKey = [seg.from, seg.to, seg.line].sort().join('-');
        visitedEdges.add(edgeKey);
        fullSegments.push({ ...seg, legIndex: i });
      });
      fullStations.push(...leg.stations.slice(1));
      totalHops += leg.totalHops;
      totalDistance += leg.totalDistance;
      totalTransitions += leg.totalTransitions;
      currentId = waypoints[i+1];
    }
  }

  // 2. Coverage Detour
  if (allEdges) {
    // All paths logic: visit all unique segments in CONNECTIONS
    const allUniqueEdges = new Set<string>();
    CONNECTIONS.forEach(c => allUniqueEdges.add([c.from, c.to, c.line].sort().join('-')));
    
    while (visitedEdges.size < allUniqueEdges.size) {
      let targetEdge: Connection | null = null;
      let minDist = Infinity;
      let bestPathToStart: PathResult | null = null;

      for (const edge of CONNECTIONS) {
        const key = [edge.from, edge.to, edge.line].sort().join('-');
        if (!visitedEdges.has(key)) {
          const path = findPathSegment(currentId, edge.from, 'HOPS');
          if (path && path.totalHops < minDist) {
            minDist = path.totalHops;
            targetEdge = edge;
            bestPathToStart = path;
          }
        }
      }

      if (targetEdge && bestPathToStart) {
        // Navigate to start of edge
        bestPathToStart.segments.forEach(seg => fullSegments.push({ ...seg, legIndex: -1 }));
        fullStations.push(...bestPathToStart.stations.slice(1));
        totalHops += bestPathToStart.totalHops;
        totalDistance += bestPathToStart.totalDistance;
        totalTransitions += bestPathToStart.totalTransitions;
        
        // Traverse the edge
        fullSegments.push({ from: targetEdge.from, to: targetEdge.to, line: targetEdge.line, legIndex: -1 });
        fullStations.push(targetEdge.to);
        totalHops += 1;
        totalDistance += targetEdge.weight;
        visitedEdges.add([targetEdge.from, targetEdge.to, targetEdge.line].sort().join('-'));
        currentId = targetEdge.to;
      } else break;
    }
  } else {
    // All stations logic (Grand Tour)
    const mustVisit = new Set(STATIONS.map(s => s.id));
    visitedNodes.forEach(v => mustVisit.delete(v));
    mustVisit.delete(endId);

    while (mustVisit.size > 0) {
      let nearestNodeId = '';
      let minDist = Infinity;
      let bestSub: PathResult | null = null;

      for (const targetId of mustVisit) {
        const sub = findPathSegment(currentId, targetId, 'HOPS');
        if (sub && sub.totalHops < minDist) {
          minDist = sub.totalHops;
          nearestNodeId = targetId;
          bestSub = sub;
        }
      }

      if (bestSub && nearestNodeId) {
        bestSub.segments.forEach(seg => fullSegments.push({ ...seg, legIndex: -1 }));
        fullStations.push(...bestSub.stations.slice(1));
        bestSub.stations.forEach(id => mustVisit.delete(id));
        totalHops += bestSub.totalHops;
        totalDistance += bestSub.totalDistance;
        totalTransitions += bestSub.totalTransitions;
        currentId = nearestNodeId;
      } else break;
    }
  }

  // 3. Final leg to destination
  if (currentId !== endId) {
    const finalLeg = findPathSegment(currentId, endId, 'HOPS');
    if (finalLeg) {
      finalLeg.segments.forEach(seg => fullSegments.push({ ...seg, legIndex: -1 }));
      fullStations.push(...finalLeg.stations.slice(1));
      totalHops += finalLeg.totalHops;
      totalDistance += finalLeg.totalDistance;
      totalTransitions += finalLeg.totalTransitions;
    }
  }

  return { stations: fullStations, segments: fullSegments, totalHops, totalDistance, totalTransitions };
}
