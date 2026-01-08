
import { Station, Connection, LineID } from './types';

export const LINE_COLORS: Record<LineID, string> = {
  green: '#1b633a',
  blue: '#1c4d8c',
  red: '#8c2a2a',
  yellow: '#b3821a'
};

const stations: Station[] = [
  // Intersections (Hubs)
  { id: 'GB1', name: 'ОБЕЛИЯ / OBELIA', line: ['green', 'blue'], x: 3, y: 3, isTransfer: true },
  { id: 'GB2', name: 'СЕРДИКА / SERDIKA', line: ['green', 'blue'], x: 7, y: 3, isTransfer: true },
  { id: 'GR1', name: 'СЛИВНИЦА / SLIVNITSA', line: ['green', 'red'], x: 7, y: 7, isTransfer: true },
  { id: 'GR2', name: 'МЛАДОСТ / MLADOST', line: ['green', 'red'], x: 3, y: 7, isTransfer: true },
  
  { id: 'BY1', name: 'ВАРДАР / VARDAR', line: ['blue', 'yellow'], x: 9, y: 5, isTransfer: true },
  { id: 'BY2', name: 'КОНСТАНТИН / K.', line: ['blue', 'yellow'], x: 5, y: 1, isTransfer: true },
  { id: 'RY1', name: 'ОПЪЛЧЕНСКА / OP.', line: ['red', 'yellow'], x: 1, y: 5, isTransfer: true },
  { id: 'RY2', name: 'ТЕАТЪР / TEATAR', line: ['red', 'yellow'], x: 5, y: 9, isTransfer: true },

  // Green normal
  { id: 'G1', name: 'КЛ. ОХРИДСКИ', line: ['green'], x: 4, y: 3, isTransfer: false },
  { id: 'G2', name: 'ВАСИЛ ЛЕВСКИ', line: ['green'], x: 5, y: 3, isTransfer: false },
  { id: 'G3', name: 'ЖОЛИО КЮРИ', line: ['green'], x: 6, y: 3, isTransfer: false },
  { id: 'G4', name: 'Г.М. ДИМИТРОВ', line: ['green'], x: 7, y: 5, isTransfer: false },
  { id: 'G5', name: 'МУСАГЕНИЦА', line: ['green'], x: 5, y: 7, isTransfer: false },
  { id: 'G6', name: 'ДЖОГИНГ / JOG.', line: ['green'], x: 3, y: 5, isTransfer: false },

  // Blue normal
  { id: 'B1', name: 'М. ЛУИЗА', line: ['blue'], x: 3, y: 2, isTransfer: false },
  { id: 'B2', name: 'ЦЕНТРАЛНА ГАРА', line: ['blue'], x: 4, y: 1, isTransfer: false },
  { id: 'B3', name: 'ЛЪВОВ МОСТ', line: ['blue'], x: 6, y: 1, isTransfer: false },
  { id: 'B4', name: 'НДК / NDK', line: ['blue'], x: 7, y: 2, isTransfer: false },
  { id: 'B5', name: 'ЕВРОПЕЙСКИ', line: ['blue'], x: 8, y: 3, isTransfer: false },
  { id: 'B6', name: 'ВИТОША / VIT.', line: ['blue'], x: 9, y: 4, isTransfer: false },
  { id: 'B7', name: 'ШЛИФЕР / SHL.', line: ['blue'], x: 5, y: 2, isTransfer: false },

  // Red normal
  { id: 'R1', name: 'ИЕЦ / IEC', line: ['red'], x: 8, y: 7, isTransfer: false },
  { id: 'R2', name: 'ЦАРИГРАДСКО', line: ['red'], x: 7, y: 8, isTransfer: false },
  { id: 'R3', name: 'ДРУЖБА / DR.', line: ['red'], x: 5, y: 8, isTransfer: false },
  { id: 'R4', name: 'ИСКЪРСКО', line: ['red'], x: 3, y: 8, isTransfer: false },
  { id: 'R5', name: 'СОФИЙСКА СВ.', line: ['red'], x: 2, y: 7, isTransfer: false },
  { id: 'R6', name: 'ЛЕТИЩЕ / AIR.', line: ['red'], x: 2, y: 6, isTransfer: false },

  // Yellow normal
  { id: 'Y1', name: 'ХАДЖИ Д.', line: ['yellow'], x: 1, y: 4, isTransfer: false },
  { id: 'Y2', name: 'ГЕРЕНА / GER.', line: ['yellow'], x: 1, y: 6, isTransfer: false },
  { id: 'Y3', name: 'КР. СЕЛО', line: ['yellow'], x: 2, y: 9, isTransfer: false },
  { id: 'Y4', name: 'БЪЛГАРИЯ', line: ['yellow'], x: 4, y: 9, isTransfer: false },
  { id: 'Y5', name: 'МЕД. УНИВ.', line: ['yellow'], x: 6, y: 9, isTransfer: false },
  { id: 'Y6', name: 'СВ. ПАТРИАРХ', line: ['yellow'], x: 8, y: 9, isTransfer: false },
  { id: 'Y7', name: 'НАВОДНЕНИЯ', line: ['yellow'], x: 9, y: 6, isTransfer: false },
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

buildPath(['GB1', 'G1', 'G2', 'G3', 'GB2', 'G4', 'GR1', 'G5', 'GR2', 'G6'], 'green');
buildPath(['GB1', 'B1', 'B2', 'BY2', 'B3', 'B4', 'GB2', 'B5', 'B6', 'BY1', 'B7'], 'blue');
buildPath(['GR1', 'R1', 'R2', 'RY2', 'R3', 'R4', 'GR2', 'R5', 'R6', 'RY1'], 'red');
buildPath(['RY1', 'Y1', 'Y2', 'RY2', 'Y3', 'Y4', 'Y5', 'Y6', 'BY1', 'Y7', 'BY2'], 'yellow');

export const CONNECTIONS = connections;
