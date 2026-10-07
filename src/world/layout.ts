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

// ------------------------------------------------------------------ rooms and sight
// The building is a chain of rooms joined by doors. From inside a room the camera sees that room,
// and the next ones only through their doors: everything else is hidden by walls, so it is neither
// sorted nor drawn. Index = room id written by the generator (0 = no room: always drawn).

export interface Rect { x0: number; z0: number; x1: number; z1: number }
export const ROOMS: Rect[] = [
  { x0: 0, z0: 0, x1: 0, z1: 0 },
  { x0: 0, z0: 0, x1: 9, z1: 8 },        // 1 lobby
  { x0: 9, z0: 1.5, x1: 12, z1: 6.5 },   // 2 vestibule
  { x0: 12, z0: 0, x1: 20, z1: 8 },      // 3 AIST
  { x0: 0, z0: 8, x1: 20, z1: 13 },      // 4 TLSe hall
  { x0: 0, z0: 13, x1: 14, z1: 25 },     // 5 factory hall
  { x0: 14, z0: 14.5, x1: 20, z1: 24 },  // 6 Fil rouge room
];

/** a door between rooms a and b: its two jambs on the floor plan */
export const DOORS: { a: number; b: number; p: [number, number]; q: [number, number] }[] = [
  { a: 1, b: 2, p: [9, 3.4], q: [9, 4.6] },
  { a: 2, b: 3, p: [12, 3.4], q: [12, 4.6] },
  { a: 3, b: 4, p: [16.4, 8], q: [17.6, 8] },
  { a: 4, b: 5, p: [1.9, 13], q: [3.1, 13] },
  { a: 5, b: 6, p: [14, 19.0], q: [14, 20.2] },
];

export interface Sight {
  /** bit r: room r is drawn whole */
  full: number;
  /** bit r: room r is drawn inside its wedge only */
  part: number;
  /** per room, two half-planes a*x + b*z + c >= 0 (6 numbers, 8 per room) */
  wedges: Float32Array;
}

export const newSight = (): Sight => ({ full: 255, part: 0, wedges: new Float32Array(8 * 8) });

const NEAR_DOOR = 0.6; // standing this close to a room counts as standing in it
const JAMB = 0.45;     // doors are widened by this much: frames, and Gaussians have a size
const dirs = new Float64Array(8 * 4); // per room: the two directions that bound its wedge

/** What a camera at (x, z) can see of each room. Writes into `out` and returns it. */
export function sightFrom(x: number, z: number, out: Sight): Sight {
  let full = 0;
  for (let r = 1; r < ROOMS.length; r++) {
    const R = ROOMS[r];
    if (x > R.x0 - NEAR_DOOR && x < R.x1 + NEAR_DOOR && z > R.z0 - NEAR_DOOR && z < R.z1 + NEAR_DOOR) full |= 1 << r;
  }
  if (!full) { out.full = 255; out.part = 0; return out; }
  let part = 0;
  // the wedge from the camera through a door: two directions, counter-clockwise from the first to the second
  const through = (d: (typeof DOORS)[number], o: number) => {
    const ux = d.q[0] - d.p[0], uz = d.q[1] - d.p[1], ul = Math.hypot(ux, uz);
    let ax = d.p[0] - (ux / ul) * JAMB - x, az = d.p[1] - (uz / ul) * JAMB - z;
    let bx = d.q[0] + (ux / ul) * JAMB - x, bz = d.q[1] + (uz / ul) * JAMB - z;
    if (ax * bz - az * bx < 0) { const tx = ax, tz = az; ax = bx; az = bz; bx = tx; bz = tz; }
    dirs[o] = ax; dirs[o + 1] = az; dirs[o + 2] = bx; dirs[o + 3] = bz;
  };
  for (let pass = 0; pass < 2; pass++) {
    const from = pass === 0 ? full : part, before = part;
    for (const d of DOORS) {
      for (let k = 0; k < 2; k++) {
        const a = k ? d.b : d.a, b = k ? d.a : d.b;
        if (!((from >> a) & 1) || ((full | part) >> b) & 1) continue;
        if (pass === 1 && !((before >> a) & 1)) continue;
        const o = b * 4;
        through(d, o);
        if (pass === 1) {
          // seen through two doors: the part of this wedge that is also inside the first one
          const s = a * 4;
          if (dirs[s] * dirs[o + 1] - dirs[s + 1] * dirs[o] < 0) { dirs[o] = dirs[s]; dirs[o + 1] = dirs[s + 1]; }
          if (dirs[s + 2] * dirs[o + 3] - dirs[s + 3] * dirs[o + 2] > 0) { dirs[o + 2] = dirs[s + 2]; dirs[o + 3] = dirs[s + 3]; }
          if (dirs[o] * dirs[o + 3] - dirs[o + 1] * dirs[o + 2] <= 0) continue;
        }
        part |= 1 << b;
      }
    }
  }
  const W = out.wedges, SLACK = 0.12;
  for (let r = 1; r < ROOMS.length; r++) {
    if (!((part >> r) & 1)) continue;
    const o = r * 4, w = r * 8;
    const l1 = Math.hypot(dirs[o], dirs[o + 1]) || 1, l2 = Math.hypot(dirs[o + 2], dirs[o + 3]) || 1;
    const ax = dirs[o] / l1, az = dirs[o + 1] / l1, bx = dirs[o + 2] / l2, bz = dirs[o + 3] / l2;
    // cross(a, X - C) >= 0 and cross(X - C, b) >= 0
    W[w] = -az; W[w + 1] = ax; W[w + 2] = az * x - ax * z + SLACK;
    W[w + 3] = bz; W[w + 4] = -bx; W[w + 5] = -bz * x + bx * z + SLACK;
  }
  out.full = full; out.part = part;
  return out;
}
