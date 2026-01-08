
import { Station, Connection, LineID } from './types';

export const LINE_COLORS: Record<LineID, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#eab308'
};

/**
 * Green: 6 normal, 4 intersections (2 blue, 2 red) = 10 total
 * Blue: 7 normal, 4 intersections (2 green, 2 yellow) = 11 total
 * Red: 6 normal, 4 intersections (2 green, 2 yellow) = 10 total
 * Yellow: 7 normal, 4 intersections (2 blue, 2 red) = 11 total
 */

const stations: Station[] = [
  // Intersections
  { id: 'GB1', name: 'Emerald Azure Hub', line: ['green', 'blue'], x: 3, y: 3, isTransfer: true },
  { id: 'GB2', name: 'Sky Forest Junction', line: ['green', 'blue'], x: 7, y: 3, isTransfer: true },
  { id: 'GR1', name: 'Crimson Leaf Station', line: ['green', 'red'], x: 7, y: 7, isTransfer: true },
  { id: 'GR2', name: 'Ruby Moss Terminal', line: ['green', 'red'], x: 3, y: 7, isTransfer: true },
  
  { id: 'BY1', name: 'Amber Sea Crossing', line: ['blue', 'yellow'], x: 9, y: 5, isTransfer: true },
  { id: 'BY2', name: 'Golden Wave Port', line: ['blue', 'yellow'], x: 5, y: 1, isTransfer: true },
  { id: 'RY1', name: 'Citrine Flame Gate', line: ['red', 'yellow'], x: 1, y: 5, isTransfer: true },
  { id: 'RY2', name: 'Topaz Fire Street', line: ['red', 'yellow'], x: 5, y: 9, isTransfer: true },

  // Green normal (6 nodes)
  { id: 'G1', name: 'Verdant North', line: ['green'], x: 4, y: 3, isTransfer: false },
  { id: 'G2', name: 'Jade Plaza', line: ['green'], x: 5, y: 3, isTransfer: false },
  { id: 'G3', name: 'Leafy Lane', line: ['green'], x: 6, y: 3, isTransfer: false },
  { id: 'G4', name: 'Forest Edge', line: ['green'], x: 7, y: 5, isTransfer: false },
  { id: 'G5', name: 'Moss Valley', line: ['green'], x: 5, y: 7, isTransfer: false },
  { id: 'G6', name: 'Olive Gardens', line: ['green'], x: 3, y: 5, isTransfer: false },

  // Blue normal (7 nodes)
  { id: 'B1', name: 'Cobalt Bay', line: ['blue'], x: 3, y: 2, isTransfer: false },
  { id: 'B2', name: 'Indigo Quay', line: ['blue'], x: 4, y: 1, isTransfer: false },
  { id: 'B3', name: 'Azure Sands', line: ['blue'], x: 6, y: 1, isTransfer: false },
  { id: 'B4', name: 'Navy Pier', line: ['blue'], x: 7, y: 2, isTransfer: false },
  { id: 'B5', name: 'Sapphire Isle', line: ['blue'], x: 8, y: 3, isTransfer: false },
  { id: 'B6', name: 'Ultramarine Port', line: ['blue'], x: 9, y: 4, isTransfer: false },
  { id: 'B7', name: 'Teal Terrace', line: ['blue'], x: 5, y: 2, isTransfer: false },

  // Red normal (6 nodes)
  { id: 'R1', name: 'Scarlet Rise', line: ['red'], x: 8, y: 7, isTransfer: false },
  { id: 'R2', name: 'Maroon Square', line: ['red'], x: 7, y: 8, isTransfer: false },
  { id: 'R3', name: 'Rose District', line: ['red'], x: 5, y: 8, isTransfer: false },
  { id: 'R4', name: 'Brick Road', line: ['red'], x: 3, y: 8, isTransfer: false },
  { id: 'R5', name: 'Cherry Hill', line: ['red'], x: 2, y: 7, isTransfer: false },
  { id: 'R6', name: 'Carmine Point', line: ['red'], x: 2, y: 6, isTransfer: false },

  // Yellow normal (7 nodes)
  { id: 'Y1', name: 'Lemon Lane', line: ['yellow'], x: 1, y: 4, isTransfer: false },
  { id: 'Y2', name: 'Saffron Street', line: ['yellow'], x: 1, y: 6, isTransfer: false },
  { id: 'Y3', name: 'Topaz Trail', line: ['yellow'], x: 2, y: 9, isTransfer: false },
  { id: 'Y4', name: 'Dandelion Drive', line: ['yellow'], x: 4, y: 9, isTransfer: false },
  { id: 'Y5', name: 'Flax Field', line: ['yellow'], x: 6, y: 9, isTransfer: false },
  { id: 'Y6', name: 'Mustard Mound', line: ['yellow'], x: 8, y: 9, isTransfer: false },
  { id: 'Y7', name: 'Bumblebee Blvd', line: ['yellow'], x: 9, y: 6, isTransfer: false },
];

export const STATIONS = stations;

const dist = (s1: Station, s2: Station) => Math.abs(s1.x - s2.x) + Math.abs(s1.y - s2.y);

const connections: Connection[] = [];

const buildPath = (ids: string[], line: LineID) => {
  for (let i = 0; i < ids.length; i++) {
    const fromId = ids[i];
    const toId = ids[(i + 1) % ids.length];
    const s1 = STATIONS.find(s => s.id === fromId)!;
    const s2 = STATIONS.find(s => s.id === toId)!;
    const d = dist(s1, s2);
    connections.push({ from: fromId, to: toId, weight: d, line });
    connections.push({ from: toId, to: fromId, weight: d, line });
  }
};

// Clean Loops
buildPath(['GB1', 'G1', 'G2', 'G3', 'GB2', 'G4', 'GR1', 'G5', 'GR2', 'G6'], 'green');
buildPath(['GB1', 'B1', 'B2', 'BY2', 'B3', 'B4', 'GB2', 'B5', 'B6', 'BY1', 'B7'], 'blue');
buildPath(['GR1', 'R1', 'R2', 'RY2', 'R3', 'R4', 'GR2', 'R5', 'R6', 'RY1'], 'red');
buildPath(['RY1', 'Y1', 'Y2', 'RY2', 'Y3', 'Y4', 'Y5', 'Y6', 'BY1', 'Y7', 'BY2'], 'yellow');

export const CONNECTIONS = connections;
