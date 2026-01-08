
import { Station, Connection, LineID } from './types';

export const LINE_COLORS: Record<LineID, string> = {
  green: '#1b633a',
  blue: '#1c4d8c',
  red: '#8c2a2a',
  yellow: '#b3821a'
};

const stations: Station[] = [
  
  { id: 'G1', name: 'G1', line: ['green'], x: 40, y: 120, isTransfer: false },
  { id: 'G2', name: 'G2', line: ['green'], x: 330, y: 10, isTransfer: false },
  { id: 'G3', name: 'G3', line: ['green'], x: 570, y: 40, isTransfer: false },
  { id: 'GB1', name: 'GB1', line: ['green', 'blue'], x: 660, y: 210, isTransfer: true },
  { id: 'G4', name: 'G4', line: ['green'], x: 710, y: 280, isTransfer: false },
  { id: 'GR1', name: 'GR1', line: ['green', 'red'], x: 610, y: 410, isTransfer: true },
  { id: 'G5', name: 'G5', line: ['green'], x: 450, y: 390, isTransfer: false },
  { id: 'G6', name: 'G6', line: ['green'], x: 320, y: 300, isTransfer: false },
  { id: 'GR2', name: 'GR2', line: ['green', 'red'], x: 240, y: 300, isTransfer: true },
  { id: 'GB2', name: 'GB2', line: ['green', 'blue'], x: 80, y: 250, isTransfer: true },

  { id: 'B1', name: 'B1', line: ['blue'], x: 210, y: 110, isTransfer: false },
  { id: 'B2', name: 'B2', line: ['blue'], x: 450, y: 80, isTransfer: false },
  { id: 'B3', name: 'B3', line: ['blue'], x: 750, y: 120, isTransfer: false },
  // GB1 here
  { id: 'B4', name: 'B4', line: ['blue'], x: 570, y: 210, isTransfer: false },
  { id: 'BY1', name: 'BY1', line: ['blue', 'yellow'], x: 480, y: 290, isTransfer: true },
  { id: 'B5', name: 'B5', line: ['blue'], x: 450, y: 320, isTransfer: false },
  { id: 'B6', name: 'B6', line: ['blue'], x: 300, y: 410, isTransfer: false },
  { id: 'BY2', name: 'BY2', line: ['blue', 'yellow'], x: 130, y: 370, isTransfer: true },
  { id: 'B7', name: 'B7', line: ['blue'], x: 90, y: 320, isTransfer: false },
  // GB2 Here

  { id: 'R1', name: 'R1', line: ['red'], x: 390, y: 130, isTransfer: false },
  { id: 'R2', name: 'R2', line: ['red'], x: 590, y: 130, isTransfer: false },
  { id: 'R3', name: 'R3', line: ['red'], x: 810, y: 270, isTransfer: false },
  // GR1 Here
  { id: 'R4', name: 'R4', line: ['red'], x: 590, y: 550, isTransfer: false },
  { id: 'R5', name: 'R5', line: ['red'], x: 370, y: 560, isTransfer: false },
  { id: 'RY1', name: 'RY1', line: ['red', 'yellow'], x: 280, y: 520, isTransfer: true },
  { id: 'R6', name: 'R6', line: ['red'], x: 240, y: 370, isTransfer: false },
  // GR2 Here
  { id: 'RY2', name: 'RY2', line: ['red', 'yellow'], x: 270, y: 200, isTransfer: true },

  // BY2 Here
  { id: 'Y1', name: 'Y1', line: ['yellow'], x: 190, y: 220, isTransfer: false },
  // RY2 Here
  { id: 'Y2', name: 'Y2', line: ['yellow'], x: 390, y: 200, isTransfer: false },
  // BY1 Here
  { id: 'Y3', name: 'Y3', line: ['yellow'], x: 530, y: 330, isTransfer: false },
  { id: 'Y4', name: 'Y4', line: ['yellow'], x: 530, y: 490, isTransfer: false },
  { id: 'Y5', name: 'Y5', line: ['yellow'], x: 390, y: 510, isTransfer: false },
  // RY1 Here
  { id: 'Y6', name: 'Y6', line: ['yellow'], x: 140, y: 510, isTransfer: false },
  { id: 'Y7', name: 'Y7', line: ['yellow'], x: 30, y: 490, isTransfer: false },
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

buildPath(['G1', 'G2', 'G3', 'GB1', 'G4', 'GR1', 'G5', 'G6', 'GR2', 'GR2', 'GB2'], 'green');
buildPath(['B1', 'B2', 'B3', 'GB1', 'B4', 'BY1', 'B5', 'B6', 'BY2', 'B7', 'GB2'], 'blue');
buildPath(['R1', 'R2', 'R3', 'GR1', 'R4', 'R5', 'RY1', 'R6', 'GR2', 'RY2'], 'red');
buildPath(['BY2', 'Y1', 'RY2', 'Y2', 'BY1', 'Y3', 'Y4', 'Y5', 'RY1', 'Y6', 'Y7'], 'yellow');

export const CONNECTIONS = connections;
