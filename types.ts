
export type LineID = 'green' | 'blue' | 'red' | 'yellow';

export interface Station {
  id: string;
  name: string;
  line: LineID[];
  x: number;
  y: number;
  isTransfer: boolean;
}

export interface Connection {
  from: string;
  to: string;
  weight: number;
  line: LineID;
}

export type OptimizationMode = 'HOPS' | 'DISTANCE' | 'LEAST_TRANSITIONS' | 'TRAVERSE_ALL' | 'TRAVERSE_ALL_EDGES';

export interface PathSegment {
  from: string;
  to: string;
  line: LineID;
  legIndex: number;
}

export interface PathResult {
  stations: string[];
  segments: PathSegment[];
  totalHops: number;
  totalDistance: number;
  totalTransitions: number;
}
