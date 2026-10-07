// Floor plan shared by the generator (worker) and the director (main thread).
// Metres. x = east, z = south, y = up.

export const BOUNDS = { x0: 0, x1: 20, z0: 0, z1: 25 };
export const CELL = 0.1; // occupancy grid resolution (m)

export const AIST_C: [number, number, number] = [16, 1.35, 4];

// Moving groups: every Gaussian of a group shares one rigid transform (x, z, yaw, lift).
export const GROUP = {
  RIG: 1,
  ROBOT: 2,
  BALL: 3,
  FAN: 4,
  AMR0: 5, // 5..14
  AMR_N: 10,
  ARM0: 15, // 15..20
  ARM_N: 6,
  COUNT: 24,
} as const;

// ----------------------------------------------------------------- factory hall
// x 0..14, z 13..25. One-way lanes: an outer loop driven clockwise on the map and a cross
// aisle driven east to west, so two robots never meet head-on.

export const LOOP: [number, number][] = [
  [4.5, 16.2],
  [12.2, 16.2],
  [12.2, 23.2],
  [4.5, 23.2],
];
export const CROSS_Z = 19.7;
export const LANE_HALF = 0.47;

/** Closed routes (the last point joins the first). */
export const ROUTES: [number, number][][] = [
  LOOP,
  [[4.5, 16.2], [12.2, 16.2], [12.2, CROSS_Z], [4.5, CROSS_Z]],
];

/** Workstations: two rows of three cells between the lanes. side: which lane they are served from. */
export const CELLS: { x: number; z: number; face: 1 | -1 }[] = [
  { x: 6.35, z: 17.95, face: 1 }, { x: 8.35, z: 17.95, face: 1 }, { x: 10.35, z: 17.95, face: 1 },
  { x: 6.35, z: 21.45, face: -1 }, { x: 8.35, z: 21.45, face: -1 }, { x: 10.35, z: 21.45, face: -1 },
];

/** Where robots stop to be served: [x, z]. Painted on the floor, used by the traffic simulation. */
export const DOCKS: [number, number][] = [
  [6.35, CROSS_Z], [8.35, CROSS_Z], [10.35, CROSS_Z], // between the two rows of cells
  [6.6, 23.2], [9.8, 23.2], // along the conveyor
  [8.35, 16.2], // north lane
];

// ------------------------------------------------------------------ fil rouge room
// x 14..20, z 14.5..24. The pen (x0, z0, x1, z1) and the screen on the east wall that
// shows the camera feed of the real robot.
export const PEN = { x0: 16.3, z0: 17.5, x1: 19.5, z1: 21.7 };
export const SCREEN = { x: 19.96, z0: 19.0, z1: 21.4, y0: 0.78, y1: 2.58 };

// Track centre line in the TLSe hall
export function trackZ(x: number) {
  return 10.5 + 0.7 * Math.sin(((x - 3.5) / 9.0) * Math.PI * 2);
}

export interface Via {
  name: string;
  x: number;
  z: number;
  pin?: boolean;
}

const track: Via[] = [];
for (let x = 15.6; x >= 4.2; x -= 1.4) track.push({ name: `t${track.length}`, x, z: trackZ(x) });

export const VIAS: Via[] = [
  { name: 'start', x: 1.5, z: 4.6, pin: true },
  { name: 'lobbyDoor', x: 9, z: 4.0, pin: true },
  { name: 'vestibule', x: 10.5, z: 4.0 },
  { name: 'aistDoor', x: 12.05, z: 4.0, pin: true },
  { name: 'aist', x: AIST_C[0], z: AIST_C[2], pin: true },
  { name: 'aistExit', x: 17.0, z: 7.95, pin: true },
  { name: 'trackIn', x: 17.0, z: 9.7 },
  ...track,
  { name: 'trackOut', x: 2.7, z: 11.9 },
  { name: 'factoryDoor', x: 2.5, z: 13.0, pin: true },
  { name: 'factoryIn', x: 2.6, z: 15.0 },
  { name: 'laneNW', x: 4.5, z: 16.2 },
  { name: 'laneN', x: 8.3, z: 16.2 },
  { name: 'laneNE', x: 12.2, z: 16.2 },
  { name: 'laneE', x: 12.2, z: 19.6 },
  { name: 'pfrDoor', x: 14.0, z: 19.6, pin: true },
  { name: 'pfr', x: 15.3, z: 19.6, pin: true },
];
