
import { Station, Connection, LineID } from './types';

export const LINE_COLORS: Record<LineID, string> = {
  green: '#1b633a',
  blue: '#1c4d8c',
  red: '#8c2a2a',
  yellow: '#b3821a'
};

const stations: Station[] = [
  
  { id: 'G1', name: 'ТОПЕНЕ', line: ['green'], x: 40, y: 120, isTransfer: false },
  { id: 'G2', name: 'ПОЛЕН', line: ['green'], x: 330, y: 10, isTransfer: false },
  { id: 'G3', name: 'ЛИВАДА', line: ['green'], x: 570, y: 40, isTransfer: false },
  { id: 'GB1', name: 'НАВОДНЕНИЯ', line: ['green', 'blue'], x: 680, y: 210, isTransfer: true },
  { id: 'G4', name: 'ДЪГА', line: ['green'], x: 710, y: 280, isTransfer: false },
  { id: 'GR1', name: 'ПРЕЗРЯЛО', line: ['green', 'red'], x: 610, y: 420, isTransfer: true },
  { id: 'G5', name: 'ПАПЕ', line: ['green'], x: 450, y: 390, isTransfer: false },
  { id: 'G6', name: 'ПРЯСНО', line: ['green'], x: 320, y: 260, isTransfer: false },
  { id: 'GR2', name: 'ВОДОРАСЛИ', line: ['green', 'red'], x: 240, y: 260, isTransfer: true },
  { id: 'GB2', name: 'ДЖОГИНГ', line: ['green', 'blue'], x: 80, y: 230, isTransfer: true },

  { id: 'B1', name: 'ВЪЛНА', line: ['blue'], x: 210, y: 110, isTransfer: false },
  { id: 'B2', name: 'ШЕЙНА', line: ['blue'], x: 450, y: 80, isTransfer: false },
  { id: 'B3', name: 'ТОПЕНЕ', line: ['blue'], x: 750, y: 120, isTransfer: false },
  // GB1 here
  { id: 'B4', name: 'КАМИНА', line: ['blue'], x: 560, y: 210, isTransfer: false },
  { id: 'BY1', name: 'ШПИФЕР', line: ['blue', 'yellow'], x: 480, y: 290, isTransfer: true },
  { id: 'B5', name: 'СКИ', line: ['blue'], x: 450, y: 320, isTransfer: false },
  { id: 'B6', name: 'ПОЛЮС', line: ['blue'], x: 350, y: 420, isTransfer: false },
  { id: 'BY2', name: 'РАЗЛАГАНЕ', line: ['blue', 'yellow'], x: 130, y: 370, isTransfer: true },
  { id: 'B7', name: 'ВИЕЛИЦА', line: ['blue'], x: 80, y: 320, isTransfer: false },
  // GB2 Here

  { id: 'R1', name: 'ТОПЛО', line: ['red'], x: 390, y: 130, isTransfer: false },
  { id: 'R2', name: 'СЯНКА', line: ['red'], x: 590, y: 130, isTransfer: false },
  { id: 'R3', name: 'ЖЕГА', line: ['red'], x: 810, y: 270, isTransfer: false },
  // GR1 Here
  { id: 'R4', name: 'СЛЪНЦЕ', line: ['red'], x: 590, y: 540, isTransfer: false },
  { id: 'R5', name: 'САНДАЛИ', line: ['red'], x: 370, y: 560, isTransfer: false },
  { id: 'RY1', name: 'СВЕТУЛКА', line: ['red', 'yellow'], x: 280, y: 520, isTransfer: true },
  { id: 'R6', name: 'БАСЕЙН', line: ['red'], x: 240, y: 370, isTransfer: false },
  // GR2 Here
  { id: 'RY2', name: 'СЛЪНЧОГЛЕД', line: ['red', 'yellow'], x: 270, y: 200, isTransfer: true },

  // BY2 Here
  { id: 'Y1', name: 'КАНЕЛА', line: ['yellow'], x: 190, y: 230, isTransfer: false },
  // RY2 Here
  { id: 'Y2', name: 'ОРАНЖЕВ', line: ['yellow'], x: 390, y: 200, isTransfer: false },
  // BY1 Here
  { id: 'Y3', name: 'ШУМА', line: ['yellow'], x: 530, y: 340, isTransfer: false },
  { id: 'Y4', name: 'ПОРОЙ', line: ['yellow'], x: 530, y: 490, isTransfer: false },
  { id: 'Y5', name: 'ЖИТО', line: ['yellow'], x: 390, y: 520, isTransfer: false },
  // RY1 Here
  { id: 'Y6', name: 'КРАТУНА', line: ['yellow'], x: 140, y: 520, isTransfer: false },
  { id: 'Y7', name: 'РЕКОЛТА', line: ['yellow'], x: 30, y: 490, isTransfer: false },
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
