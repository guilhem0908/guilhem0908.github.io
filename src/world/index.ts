// The persistent world: a hand-written 3D Gaussian splat rasteriser on top of three.js.
// Loaded lazily after first paint.

import {
  WebGLRenderer, Scene, PerspectiveCamera, InstancedBufferGeometry, InstancedBufferAttribute,
  BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, DataTexture, RGBAFormat, FloatType,
  UnsignedByteType, NearestFilter, LinearFilter, GLSL3, CustomBlending, OneFactor,
  OneMinusSrcAlphaFactor, AddEquation, DynamicDrawUsage, Vector2, Vector3, Vector4, Quaternion,
  Matrix4, Color, Texture, DoubleSide, Sphere, VideoTexture, NoColorSpace,
} from 'three';
import splatVert from './shaders/splat.vert.glsl?raw';
import splatFrag from './shaders/splat.frag.glsl?raw';
import { AIST_C, CELLS, GROUP, PEN, SCREEN, newSight, sightFrom } from './layout';
import { Traffic } from './traffic';
import { F, GpuTimer, perf } from './perf';
import { Governor, deviceTier, type Tier } from './quality';
import type { Img } from './gen/scene';

export interface WorldState {
  s: number; camH: number; pitch: number; yawOff: number; fov: number;
  head: number; headMix: number;
  /** camera boom: world-space offset from the path position (m) */
  offX: number; offZ: number;
  top: number;
  train: number; pathReveal: number;
  photo: number; repair: number; artefact: number; ceil: number;
  sensor: number;
  /** lights running forward along the planned path: the invitation to scroll */
  invite: number;
  fogNear: number; fogFar: number;
  [k: string]: number;
}

export interface SceneInfo {
  count: number;
  grid: Uint8Array; gridW: number; gridH: number;
  path: Float32Array; pathLen: number;
  marks: Record<string, number>;
  cones: Float32Array;
  genMs: number;
  expanded: number;
}

export interface Pose { x: number; z: number; y: number; yaw: number }

// display-referred sRGB triplet: the shaders write these straight to the canvas
const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

export const PALETTE = {
  void: '#1632D4',
  voidDark: '#0E229C',
  deep: '#060B3A',
  azure: '#5C7FFF',
  paper: '#F4F6FF',
  fil: '#FF3B30',
  cone: '#FFD326',
};

const DAMP: Record<string, number> = { s: 7, camH: 5, pitch: 5, yawOff: 5, fov: 5, top: 9, head: 6, headMix: 6, offX: 5, offZ: 5, invite: 3 };

function image(url: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = url;
  });
}

/** pixels of one or several images drawn side by side, each at w x h */
async function loadPixels(urls: string[], w: number, h: number): Promise<Img | null> {
  const ims = await Promise.all(urls.map(image));
  if (ims.some((im) => !im)) return null;
  try {
    const c = document.createElement('canvas');
    c.width = w * urls.length; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ims.forEach((im, i) => ctx.drawImage(im!, i * w, 0, w, h));
    const d = ctx.getImageData(0, 0, c.width, h);
    return { w: c.width, h, data: d.data };
  } catch { return null; }
}

export class World {
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  scene = new Scene();
  camera = new PerspectiveCamera(58, 1, 0.05, 200);
  worker: Worker;
  info!: SceneInfo;
  mobile: boolean;
  density: number;
  dprCap: number;
  /** what the GPU says it is, and the class the quality governor starts from */
  gpuName = '';
  tier: Tier = 'unknown';
  gov = new Governor();

  // director writes targets, the world damps towards them
  target: WorldState = {
    s: 0, camH: 1.25, pitch: -0.02, yawOff: 0, fov: 58, head: 0, headMix: 0, offX: 0, offZ: 0, top: 1,
    train: 0, pathReveal: 0, photo: 0, repair: 0, artefact: 1, ceil: 0,
    sensor: 0, invite: 0, fogNear: 7, fogFar: 19,
  };
  cur: WorldState = { ...this.target };
  pose: Pose = { x: 0, z: 0, y: 1.25, yaw: 0 };
  pathYaw = 0;
  time = 0;
  running = false;
  visibleCount = 0;
  conesSeen = 0;
  sensorRange = 6.5;
  sensorHalf = (100 / 2) * (Math.PI / 180);
  planShift = 0;
  lensMode = 1; // 1 depth, 2 ellipsoids, 0 off
  modeAll = 0;
  lensOn = false;
  pointer = new Vector2(0, 0); // -1..1
  pointerPx = new Vector2(-9999, -9999);
  pointerActive = false;
  ballTarget: [number, number] | null = null;
  inPfr = false;
  /** the camera travelled during the last frame (a change of render scale cannot be seen) */
  moving = false;

  private mat!: RawShaderMaterial;
  private geo!: InstancedBufferGeometry;
  private order!: InstancedBufferAttribute;
  private mesh!: Mesh;
  private feed!: Mesh;
  private sorting = false;
  private sortId = 0;
  private recycle: ArrayBuffer | undefined;
  private groups = new Float32Array(GROUP.COUNT * 4);
  private groupVecs: Vector4[] = [];
  private look = new Vector2(0, 0);
  private topQ = new Quaternion();
  private fpQ = new Quaternion();
  private m4 = new Matrix4();
  private v3a = new Vector3();
  private v3b = new Vector3();
  private v3c = new Vector3();
  private pa: [number, number] = [0, 0];
  private pb: [number, number] = [0, 0];
  private pp: [number, number] = [0, 0];
  private robot = { x: 17.2, z: 19.7, th: 0 };
  private ball = { x: 18.4, z: 19.3 };
  private traffic = new Traffic(GROUP.AMR_N);
  private feedMat: RawShaderMaterial | null = null;
  private feedVideo: HTMLVideoElement | null = null;
  private feedStill = false;
  private bg = new Color();
  private lost = false;
  private gpu!: GpuTimer;
  private frameNo = 0;
  private baseDpr = 1;
  private keepCur = 1;
  // depth sort: what the last request was made with
  private sortAt = 0;
  private sortView = new Float32Array(16);
  private sortKey = '';
  private viewMsg = new Float32Array(16);
  private sight = newSight();
  private camMove = 0;
  private seenPrograms = 0;
  private seenTextures = 0;
  onLost: (() => void) | null = null;
  /** called when the governor changes the level (the overlay, the recorder) */
  onQuality: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, opts: { mobile: boolean }) {
    this.canvas = canvas;
    this.mobile = opts.mobile;
    this.density = opts.mobile ? 0.5 : 1;
    this.dprCap = opts.mobile ? 1.25 : 1.5;
    this.renderer = new WebGLRenderer({
      canvas, antialias: false, alpha: false, depth: false, stencil: false,
      powerPreference: 'high-performance', premultipliedAlpha: true,
    });
    this.renderer.autoClear = true;
    this.bg.set(PALETTE.void);
    this.renderer.setClearColor(this.bg, 1);
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    this.gpuName = String((dbg && gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '');
    this.gpu = new GpuTimer(gl);
    this.worker = new Worker(new URL('./world.worker.ts', import.meta.url), { type: 'module' });
    for (let i = 0; i < GROUP.COUNT; i++) this.groupVecs.push(new Vector4());
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.lost = true;
      this.running = false;
      this.onLost?.();
    });
    // starting level: a pixel budget for the kind of GPU this is; the governor corrects it within a second
    const { tier, megapixels } = deviceTier(this.gpuName);
    this.tier = tier;
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.gov.start(w * h * dpr * dpr, megapixels * (opts.mobile ? 0.8 : 1));
    this.resize();
  }

  async init(): Promise<SceneInfo> {
    // the AIST room is made from the two stills of the before / after frame (raw | repaired)
    const [pano, input] = await Promise.all([
      loadPixels(['/media/pano-raw.jpg', '/media/pano-repaired.jpg'], 512, 234),
      loadPixels(['/media/aist-pinhole.jpg'], 320, 176),
    ]);
    const data: any = await new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => { if (e.data.type === 'scene') resolve(e.data); };
      this.worker.onerror = (e) => reject(e);
      const transfer: Transferable[] = [];
      if (pano) transfer.push(pano.data.buffer);
      if (input) transfer.push(input.data.buffer);
      this.worker.postMessage({ type: 'generate', input: { density: this.density, seed: 20261005, pano, input } }, transfer);
    });
    this.info = {
      count: data.count, grid: data.grid, gridW: data.gridW, gridH: data.gridH,
      path: data.path, pathLen: data.pathLen, marks: data.marks, cones: data.cones,
      genMs: data.ms, expanded: data.expanded,
    };
    this.build(data);
    this.worker.onmessage = (e) => { if (e.data.type === 'sorted') this.onSorted(e.data); };
    return this.info;
  }

  private build(d: any) {
    const fTex = (arr: Float32Array) => {
      const t = new DataTexture(arr, d.texW, d.texH, RGBAFormat, FloatType);
      t.minFilter = t.magFilter = NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
      return t;
    };
    const bTex = (arr: Uint8Array) => {
      const t = new DataTexture(arr, d.texW, d.texH, RGBAFormat, UnsignedByteType);
      t.minFilter = t.magFilter = NearestFilter; t.generateMipmaps = false; t.colorSpace = NoColorSpace;
      t.unpackAlignment = 1; t.needsUpdate = true;
      return t;
    };
    const geo = new InstancedBufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]), 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const order = new InstancedBufferAttribute(new Float32Array(d.count), 1);
    order.setUsage(DynamicDrawUsage);
    geo.setAttribute('aIndex', order);
    geo.instanceCount = 0;
    geo.boundingSphere = new Sphere(new Vector3(10, 2, 12.5), 40);
    this.geo = geo; this.order = order;

    this.mat = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: splatVert,
      fragmentShader: splatFrag,
      uniforms: {
        tCenter: { value: fTex(d.center) }, tScale: { value: fTex(d.scale) }, tQuat: { value: fTex(d.quat) },
        tColor: { value: bTex(d.color) }, tAlt: { value: bTex(d.alt) }, tMeta: { value: bTex(d.meta) },
        uView: { value: new Matrix4() }, uProj: { value: new Matrix4() },
        uViewport: { value: new Vector2(1, 1) },
        uTime: { value: 0 }, uTrain: { value: 0 },
        uCloudC: { value: new Vector3(10, 1.6, 12.5) }, uCloudS: { value: new Vector3(24, 5, 29) },
        uPhoto: { value: 0 }, uRepair: { value: 0 }, uArtefact: { value: 1 }, uCeil: { value: 0 },
        uPathS: { value: 0 }, uPathLen: { value: d.pathLen }, uPathReveal: { value: 0 }, uInvite: { value: 0 },
        uThin: { value: new Vector2(1, 1) },
        uFogNear: { value: 7 }, uFogFar: { value: 19 },
        uSensor: { value: 0 }, uSensorPose: { value: new Vector4() }, uSensorParams: { value: new Vector2(6.5, 0.87) },
        uDepthRange: { value: 14 },
        uGroups: { value: this.groupVecs },
        uDeep: { value: hex(PALETTE.deep) }, uVoidDark: { value: hex(PALETTE.voidDark) },
        uAzure: { value: hex(PALETTE.azure) }, uPaper: { value: hex(PALETTE.paper) },
        uFil: { value: hex(PALETTE.fil) }, uCone: { value: hex(PALETTE.cone) }, uFog: { value: hex(PALETTE.void) },
        uLens: { value: new Vector4(-9999, -9999, 150, 0) }, uModeAll: { value: 0 },
      },
      depthTest: false, depthWrite: false, transparent: true, side: DoubleSide,
      blending: CustomBlending, blendEquation: AddEquation,
      blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor,
      blendSrcAlpha: OneFactor, blendDstAlpha: OneMinusSrcAlphaFactor,
    });
    this.mesh = new Mesh(geo, this.mat);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.buildFeed();
    this.resize();
  }

  /**
   * The screen on the wall of the Fil rouge room: a plain textured quad drawn before the
   * splats (they are sorted and blended on top of it, so the pen and the robot occlude it).
   * It shows the camera feed of the real robot: a still first, the video once it plays.
   */
  private buildFeed() {
    const S = SCREEN, m = 0.05;
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array([
      S.x, S.y0 - m, S.z0 - m, S.x, S.y0 - m, S.z1 + m, S.x, S.y1 + m, S.z1 + m, S.x, S.y1 + m, S.z0 - m,
    ]), 3));
    // seen from inside the room (looking east) z grows to the right
    g.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    g.boundingSphere = new Sphere(new Vector3(S.x, 1.6, 20.2), 3);
    this.feedMat = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: `precision highp float;
uniform mat4 viewMatrix; uniform mat4 projectionMatrix;
in vec3 position; in vec2 uv; out vec2 vUv; out float vDepth;
void main() { vec4 c = viewMatrix * vec4(position, 1.0); vDepth = -c.z; vUv = uv; gl_Position = projectionMatrix * c; }`,
      fragmentShader: `precision highp float;
uniform sampler2D tFeed; uniform float uOn; uniform float uHas; uniform float uFogNear; uniform float uFogFar; uniform vec3 uFog; uniform vec3 uDeep;
in vec2 vUv; in float vDepth; out vec4 fragColor;
void main() {
  vec3 c = mix(uDeep, texture(tFeed, vUv).rgb, uHas);
  c = mix(c, uFog, smoothstep(uFogNear, uFogFar, vDepth) * 0.6);
  float a = uOn * (1.0 - smoothstep(uFogFar * 0.92, uFogFar * 1.12, vDepth));
  fragColor = vec4(c * a, a);
}`,
      uniforms: {
        tFeed: { value: null }, uOn: { value: 0 }, uHas: { value: 0 },
        uFogNear: { value: 7 }, uFogFar: { value: 19 }, uFog: { value: hex(PALETTE.void) }, uDeep: { value: hex(PALETTE.deep) },
      },
      depthTest: false, depthWrite: false, transparent: true, side: DoubleSide,
      blending: CustomBlending, blendEquation: AddEquation,
      blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor,
      blendSrcAlpha: OneFactor, blendDstAlpha: OneMinusSrcAlphaFactor,
    });
    const mesh = new Mesh(g, this.feedMat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -10;
    // visible from the first frame, with nothing to show yet: its shader is compiled while the scene
    // is still being trained, not when the last room comes into view
    mesh.visible = true;
    this.scene.add(mesh);
    this.feed = mesh;
  }

  /** The still of the camera feed, uploaded ahead of time (called when the browser is idle). */
  warmFeed() {
    if (this.feedStill || !this.feedMat || this.lost) return;
    this.feedStill = true;
    const mat = this.feedMat;
    image('/media/pfr-ball.jpg').then((still) => {
      if (!still || mat.uniforms.uHas.value > 0.5) return;
      const t = new Texture(still);
      t.minFilter = LinearFilter; t.magFilter = LinearFilter; t.generateMipmaps = false;
      t.colorSpace = NoColorSpace; t.needsUpdate = true;
      this.renderer.initTexture(t);
      mat.uniforms.tFeed.value = t; mat.uniforms.uHas.value = 1;
    });
  }

  /** The video of the camera feed: fetched when the last room is near, played only inside it. */
  private ensureFeedVideo() {
    if (this.feedVideo || !this.feedMat) return;
    this.warmFeed();
    const mat = this.feedMat;
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    v.src = '/media/pfr-ball.mp4';
    v.addEventListener('playing', () => {
      perf.event('video', 'feed playing');
      const t = new VideoTexture(v);
      t.minFilter = LinearFilter; t.magFilter = LinearFilter; t.generateMipmaps = false; t.colorSpace = NoColorSpace;
      mat.uniforms.tFeed.value = t; mat.uniforms.uHas.value = 1;
    }, { once: true });
    this.feedVideo = v;
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.baseDpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.renderer.setPixelRatio(this.baseDpr * this.gov.scale);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const dpr = this.renderer.getPixelRatio();
    if (this.mat) this.mat.uniforms.uViewport.value.set(Math.floor(w * dpr), Math.floor(h * dpr));
    this.sortKey = '';
  }

  /** the governor changed the level: a new drawing buffer, same picture */
  private applyQuality() {
    perf.event('quality', `level ${this.gov.level} (x${this.gov.scale.toFixed(2)}, keep ${this.gov.keep}): ${this.gov.reason}`);
    this.resize();
    this.onQuality?.();
  }

  /** pin the quality level (overlay, tests); -1 hands it back to the governor */
  setLevel(level: number) {
    if (level < 0) this.gov.auto = true;
    else this.gov.force(level);
    this.applyQuality();
  }

  /** x, z on the path at s metres. */
  pathAt(s: number, out: [number, number] = [0, 0]): [number, number] {
    const p = this.info.path, n = p.length / 2;
    const f = Math.max(0, Math.min(1, s / this.info.pathLen)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(f)), t = f - i;
    out[0] = p[i * 2] + (p[i * 2 + 2] - p[i * 2]) * t;
    out[1] = p[i * 2 + 1] + (p[i * 2 + 3] - p[i * 2 + 1]) * t;
    return out;
  }

  private onSorted(d: { id: number; order: Float32Array; n: number; ms?: number }) {
    const t0 = performance.now();
    this.sorting = false;
    // the worker's array becomes the attribute's array (same length): nothing is copied on this thread,
    // and the array that was drawn until now goes back to the worker for the next sort
    const prev = this.order.array as Float32Array;
    this.order.array = d.order;
    this.order.clearUpdateRanges();
    this.order.addUpdateRange(0, d.n);
    this.order.needsUpdate = true;
    this.geo.instanceCount = d.n;
    this.visibleCount = d.n;
    this.recycle = prev.buffer as ArrayBuffer;
    if (perf.on) {
      const t1 = performance.now();
      perf.set(F.SORT, d.ms ?? 0); perf.add(F.APPLY, t1 - t0); perf.set(F.LAT, t1 - this.sortAt); perf.add(F.UPLOAD, d.n * 4);
    }
  }

  /**
   * Ask the worker for a new order. The order only changes when the camera moves or when a moving
   * group moves: while the camera travels every frame asks (one request in flight at a time, the frame
   * never waits for it); at rest twenty sorts a second are plenty for the robots.
   */
  private requestSort(now: number) {
    if (this.sorting || this.lost) return;
    const cam = this.camera, c = this.cur;
    const e = cam.matrixWorldInverse.elements;
    const tanY = Math.tan((cam.fov * Math.PI) / 360);
    const far = c.fogFar * 1.14 + 1;
    const key = `${far.toFixed(2)} ${tanY.toFixed(4)} ${cam.aspect.toFixed(3)} ${this.sensorRange} ${this.sensorHalf.toFixed(3)} ${this.keepCur.toFixed(3)} ${c.top > 0.001 || c.train < 0.999 ? 1 : 0}`;
    if (key === this.sortKey && this.camMove < 0.004 && now - this.sortAt < 50) return;
    this.sortKey = key;
    this.sorting = true;
    this.sortAt = now;
    this.sortView.set(e);
    this.viewMsg.set(e);
    // from above, and while the scene is being trained, every room is in view
    const all = c.top > 0.001 || c.train < 0.999;
    const msg: any = {
      type: 'sort', id: ++this.sortId,
      view: this.viewMsg, groups: this.groups,
      fanR: this.sensorRange, fanA: this.sensorHalf,
      tanX: tanY * cam.aspect, tanY, far,
      sight: all ? null : sightFrom(cam.position.x, cam.position.z, this.sight),
      keep: this.keepCur,
    };
    if (this.recycle) {
      msg.recycle = this.recycle;
      this.worker.postMessage(msg, [this.recycle]);
      this.recycle = undefined;
    } else this.worker.postMessage(msg);
  }

  private setGroup(i: number, x: number, z: number, yaw: number, lift: number) {
    this.groups[i * 4] = x; this.groups[i * 4 + 1] = z; this.groups[i * 4 + 2] = yaw; this.groups[i * 4 + 3] = lift;
    this.groupVecs[i].set(x, z, yaw, lift);
  }

  private simulate(dt: number) {
    const t = this.time;
    this.setGroup(GROUP.RIG, 6.5, 5.75, t * 0.22, 1.52 + Math.sin(t * 0.8) * 0.02);

    // mobile robots on the one-way lanes, and the arm of each workstation
    this.traffic.step(dt);
    const bots = this.traffic.bots;
    for (let r = 0; r < bots.length; r++) this.setGroup(GROUP.AMR0 + r, bots[r].x, bots[r].z, bots[r].yaw, 0);
    for (let i = 0; i < CELLS.length; i++) {
      const c = CELLS[i];
      // slow pick-and-place swing between the part on the bed and the dock side
      const w = Math.sin(t * 0.55 + i * 1.7);
      const swing = Math.sign(w) * Math.pow(Math.abs(w), 0.45) * 1.05;
      this.setGroup(GROUP.ARM0 + i, c.x - 0.15, c.z - c.face * 0.12, c.face * Math.PI / 2 + swing, 0);
    }

    // the ball and the robot that keeps it centred
    const cx = (PEN.x0 + PEN.x1) / 2, cz = (PEN.z0 + PEN.z1) / 2;
    let tx = cx + 0.5 + 0.85 * Math.sin(t * 0.52), tz = cz + 1.45 * Math.sin(t * 0.37 + 1.0);
    if (this.ballTarget && this.inPfr) { tx = this.ballTarget[0]; tz = this.ballTarget[1]; }
    tx = Math.max(PEN.x0 + 1.25, Math.min(PEN.x1 - 0.3, tx));
    tz = Math.max(PEN.z0 + 0.3, Math.min(PEN.z1 - 0.3, tz));
    const k = 1 - Math.exp(-dt * 4);
    this.ball.x += (tx - this.ball.x) * k; this.ball.z += (tz - this.ball.z) * k;
    const R = this.robot;
    const dx = this.ball.x - R.x, dz = this.ball.z - R.z;
    const dist = Math.hypot(dx, dz);
    let e = Math.atan2(dz, dx) - R.th;
    while (e > Math.PI) e -= Math.PI * 2;
    while (e < -Math.PI) e += Math.PI * 2;
    const w = Math.max(-3, Math.min(3, 3.4 * e));
    const v = Math.max(-0.35, Math.min(1.0, 1.5 * (dist - 0.72))) * Math.max(0, Math.cos(e));
    R.th += w * dt;
    R.x += Math.cos(R.th) * v * dt; R.z += Math.sin(R.th) * v * dt;
    R.x = Math.max(PEN.x0 + 0.75, Math.min(PEN.x1 - 0.4, R.x));
    R.z = Math.max(PEN.z0 + 0.4, Math.min(PEN.z1 - 0.4, R.z));
    this.setGroup(GROUP.ROBOT, R.x, R.z, R.th, 0);
    this.setGroup(GROUP.BALL, this.ball.x, this.ball.z, t * 1.5, 0);
  }

  /** bearing of the ball in the robot frame, for the HUD (the quantity the controller regulates) */
  ballBearing() {
    let e = Math.atan2(this.ball.z - this.robot.z, this.ball.x - this.robot.x) - this.robot.th;
    while (e > Math.PI) e -= Math.PI * 2;
    while (e < -Math.PI) e += Math.PI * 2;
    return e;
  }

  frame(dtRaw: number) {
    if (!this.mat || this.lost) return;
    const now = performance.now();
    const t0 = now;
    const dt = Math.min(0.05, dtRaw);
    this.time += dt;
    this.frameNo++;
    const c = this.cur, tg = this.target;
    for (const key in tg) {
      const l = DAMP[key];
      if (l) c[key] += (tg[key] - c[key]) * (1 - Math.exp(-dt * l));
      else c[key] = tg[key];
    }

    // quality: one decision per frame, applied before anything is drawn at the new size
    if (this.gov.tick(dtRaw * 1000, this.moving || c.train < 0.999)) this.applyQuality();
    const keep = this.gov.keep;
    if (Math.abs(keep - this.keepCur) > 0.0005) this.keepCur += Math.sign(keep - this.keepCur) * Math.min(Math.abs(keep - this.keepCur), dt * 0.35);

    // pose on the path
    const info = this.info;
    const s = Math.max(0, Math.min(info.pathLen, c.s));
    const p = this.pathAt(s, this.pp);
    const a = this.pathAt(Math.max(0, s - 0.25), this.pa), b = this.pathAt(Math.min(info.pathLen, s + 1.1), this.pb);
    let yawPath = Math.atan2(b[1] - a[1], b[0] - a[0]);
    while (yawPath - this.pathYaw > Math.PI) yawPath -= Math.PI * 2;
    while (yawPath - this.pathYaw < -Math.PI) yawPath += Math.PI * 2;
    this.pathYaw += (yawPath - this.pathYaw) * (1 - Math.exp(-dt * 6));
    let hd = c.head;
    while (hd - this.pathYaw > Math.PI) hd -= Math.PI * 2;
    while (hd - this.pathYaw < -Math.PI) hd += Math.PI * 2;
    const baseYaw = this.pathYaw + (hd - this.pathYaw) * c.headMix;
    // pointer parallax
    const lk = 1 - Math.exp(-dt * 3.5);
    const amp = 1 - c.top;
    this.look.x += (this.pointer.x * 0.07 * amp - this.look.x) * lk;
    this.look.y += (this.pointer.y * 0.04 * amp - this.look.y) * lk;
    const yaw = baseYaw + c.yawOff + this.look.x;
    const pitch = c.pitch - this.look.y + Math.sin(this.time * 0.6) * 0.003;
    const bob = Math.sin(this.time * 1.1) * 0.006;
    this.pose.x = p[0]; this.pose.z = p[1]; this.pose.y = c.camH; this.pose.yaw = yaw;

    const cam = this.camera;
    const fx = Math.cos(yaw) * Math.cos(pitch), fy = Math.sin(pitch), fz = Math.sin(yaw) * Math.cos(pitch);
    const px = p[0] + c.offX, pz = p[1] + c.offZ;
    cam.position.set(px, c.camH + bob, pz);
    cam.up.set(0, 1, 0);
    cam.lookAt(px + fx, c.camH + bob + fy, pz + fz);
    this.fpQ.copy(cam.quaternion);

    if (c.top > 0.0005) {
      const landscape = cam.aspect > 1;
      // plan view: on wide screens the long axis of the building lies horizontally
      const right = landscape ? this.v3a.set(0, 0, 1) : this.v3a.set(1, 0, 0);
      const up = landscape ? this.v3b.set(1, 0, 0) : this.v3b.set(0, 0, -1);
      const back = this.v3c.set(0, 1, 0);
      this.m4.makeBasis(right, up, back);
      this.topQ.setFromRotationMatrix(this.m4);
      const tanY = Math.tan((c.fov * Math.PI) / 360);
      const spanV = landscape ? 23.5 : 30, spanH = landscape ? 30 : 23.5;
      const H = Math.max(spanV / (2 * tanY), spanH / (2 * tanY * cam.aspect));
      const e = c.top * c.top * (3 - 2 * c.top);
      // the plan sits right of centre on wide screens (the type takes the left third),
      // above centre on phones; planShift lets the intro keep it centred
      const shift = this.planShift;
      const tx = 10, tz = landscape ? 12.5 - 5.2 * shift : 12.5 + 5 * shift;
      const Hs = H * (1 + 0.16 * shift);
      cam.position.set(px + (tx - px) * e, c.camH + (Hs - c.camH) * e, pz + (tz - pz) * e);
      cam.quaternion.copy(this.fpQ).slerp(this.topQ, e);
    }
    if (Math.abs(cam.fov - c.fov) > 0.01) { cam.fov = c.fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld(true);
    cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
    // how far the view moved since the last sort was asked for
    const ve = cam.matrixWorldInverse.elements, sv = this.sortView;
    let move = 0;
    for (let i = 0; i < 16; i++) move += Math.abs(ve[i] - sv[i]);
    this.camMove = move;
    this.moving = move > 0.004;

    this.simulate(dt);
    // sensor fan rides with the camera along the path heading
    this.setGroup(GROUP.FAN, p[0], p[1], this.pathYaw, 0);

    const u = this.mat.uniforms;
    u.uView.value.copy(cam.matrixWorldInverse);
    u.uProj.value.copy(cam.projectionMatrix);
    u.uTime.value = this.time;
    u.uTrain.value = c.train;
    u.uPhoto.value = c.photo; u.uRepair.value = c.repair; u.uArtefact.value = c.artefact; u.uCeil.value = c.ceil;
    u.uPathS.value = s / info.pathLen; u.uPathReveal.value = c.pathReveal; u.uInvite.value = c.invite;
    u.uThin.value.set(this.keepCur, Math.pow(this.keepCur, -0.25));
    u.uFogNear.value = c.fogNear; u.uFogFar.value = c.fogFar;
    u.uDepthRange.value = Math.max(8, c.fogFar * 0.8);
    u.uSensor.value = c.sensor;
    u.uSensorPose.value.set(p[0], p[1], Math.cos(this.pathYaw), Math.sin(this.pathYaw));
    u.uSensorParams.value.set(this.sensorRange, this.sensorHalf);
    const dpr = this.renderer.getPixelRatio();
    const lensR = (this.mobile ? 0 : 150) * dpr;
    const lensOk = this.lensOn && this.pointerActive && c.train > 0.999;
    u.uLens.value.set(this.pointerPx.x * dpr, (this.canvas.clientHeight - this.pointerPx.y) * dpr, lensR, lensOk ? this.lensMode : 0);
    u.uModeAll.value = this.modeAll;

    // cones currently selected by the sensor model (same test as the shader)
    if (c.sensor > 0.01) {
      let seen = 0;
      const cs = Math.cos(this.pathYaw), sn = Math.sin(this.pathYaw);
      const cones = info.cones;
      for (let i = 0; i < cones.length; i += 3) {
        const rx = cones[i] - p[0], rz = cones[i + 1] - p[1];
        const d = Math.hypot(rx, rz);
        if (d > this.sensorRange || d < 1e-3) continue;
        if (Math.acos(Math.max(-1, Math.min(1, (rx * cs + rz * sn) / d))) <= this.sensorHalf) seen++;
      }
      this.conesSeen = seen;
    }

    // the screen of the Fil rouge room
    const nearPen = Math.abs(s - info.pathLen) < 9 || c.top > 0.02;
    if (nearPen && c.train > 0.999) this.ensureFeedVideo();
    if (this.feedMat) {
      const fu = this.feedMat.uniforms;
      const on = c.train > 0.999 && fu.uHas.value > 0.5 && c.top < 0.98 && nearPen ? 1 : 0;
      fu.uOn.value += (on - fu.uOn.value) * (1 - Math.exp(-dt * 5));
      fu.uFogNear.value = c.fogNear; fu.uFogFar.value = c.fogFar;
      // drawn (with nothing in it) during the first frames, so that its shader is ready long before the room
      this.feed.visible = fu.uOn.value > 0.01 || this.frameNo < 4;
    }
    if (this.feedVideo) {
      if (this.inPfr && this.feedVideo.paused) this.feedVideo.play().catch(() => {});
      else if (!this.inPfr && !this.feedVideo.paused) this.feedVideo.pause();
    }

    this.requestSort(now);
    const rec = perf.on;
    const t1 = rec ? performance.now() : 0;
    // GPU time of the frame: every frame while recording, one frame in four for the governor
    this.gpu.poll((tag, ms, level) => { if (tag >= 0) perf.late(tag, F.GPU, ms); this.gov.gpuSample(ms, level); });
    if (rec) { perf.set(F.SIM, t1 - t0); this.gpu.begin(perf.frames, this.gov.level); }
    else if ((this.frameNo & 3) === 0) this.gpu.begin(-1, this.gov.level);
    this.renderer.render(this.scene, cam);
    this.gpu.end();
    if (rec) {
      perf.set(F.DRAW, performance.now() - t1);
      perf.set(F.SPLATS, this.geo.instanceCount);
      perf.set(F.SCALE, dpr);
      // a shader program or a texture that reaches the GPU for the first time during the run
      const inf = this.renderer.info;
      const np = inf.programs?.length ?? 0, nt = inf.memory.textures;
      if (np !== this.seenPrograms) { perf.event('program', `${this.seenPrograms} -> ${np}`); this.seenPrograms = np; }
      if (nt !== this.seenTextures) { perf.event('texture', `${this.seenTextures} -> ${nt}`); this.seenTextures = nt; }
    }
  }

  /**
   * Convergence residual of the training animation, measured on a sample of Gaussians:
   * mean distance still to travel between the coarse cell a Gaussian starts in and its target.
   */
  residualSampler(n: number) {
    const c = (this.mat.uniforms.tCenter.value as DataTexture).image.data as unknown as Float32Array;
    const sc = (this.mat.uniforms.tScale.value as DataTexture).image.data as unknown as Float32Array;
    const step = Math.max(1, Math.floor(this.info.count / n));
    const d: number[] = [], birth: number[] = [];
    for (let i = 0; i < this.info.count; i += step) {
      const x = c[i * 4], y = c[i * 4 + 1], z = c[i * 4 + 2];
      const cell = (v: number) => (Math.floor(v / 1.25) + 0.5) * 1.25;
      d.push(Math.hypot(cell(x) - x, cell(y) - y, cell(z) - z));
      birth.push(sc[i * 4 + 3]);
    }
    return (t: number) => {
      let sum = 0;
      for (let k = 0; k < d.length; k++) {
        let p = Math.max(0, Math.min(1, (t - birth[k]) / 0.28));
        p = 1 - Math.pow(1 - p, 3);
        sum += (1 - p) * d[k];
      }
      return sum / d.length;
    };
  }

  /** Pointer ray onto the floor (for the ball). */
  floorHit(nx: number, ny: number): [number, number] | null {
    const cam = this.camera;
    const v = this.v3a.set(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize();
    if (v.y > -0.02) return null;
    const t = -cam.position.y / v.y;
    return [cam.position.x + v.x * t, cam.position.z + v.z * t];
  }

  dispose() {
    this.running = false;
    this.worker.terminate();
    this.feedVideo?.pause();
    this.renderer.dispose();
  }
}

export { AIST_C };
