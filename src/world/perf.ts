// Frame-time recorder of the run. Off by default: it records when the overlay is open (?perf=1)
// or when a test script calls window.__perf.start() (tools/perf.py).
// One row per animation frame: where the time went, and where on the page the frame happened,
// so that a long frame can be tied to a place in the run.

export const F = {
  T: 0,       // performance.now() at the start of the frame callback (ms)
  DT: 1,      // time since the previous frame callback (ms): what the visitor feels
  Y: 2,       // scroll position (px)
  JS: 3,      // whole frame callback (ms)
  LENIS: 4,   // smooth scroll step
  SIM: 5,     // world: damping, pose, simulation, uniforms
  DRAW: 6,    // world: renderer.render() on the CPU (uniforms, buffer upload, draw calls)
  DOM: 7,     // beats, hero, marquee, instruments, minimap
  PAINT: 8,   // main thread after the callback: style, layout, paint, commit
  SORT: 9,    // depth sort in the worker, for the order applied before this frame
  APPLY: 10,  // main thread: copying a sorted order into the instance buffer
  LAT: 11,    // sort request to hand-over (ms)
  UPLOAD: 12, // bytes sent to the GPU for the order buffer
  GPU: 13,    // GPU time of the frame (EXT_disjoint_timer_query_webgl2), -1 when unknown
  SPLATS: 14, // Gaussians drawn
  SCALE: 15,  // device pixels per CSS pixel of the canvas
  TWEEN: 16,  // text and interface animations that run before the frame callback (GSAP)
  N: 17,
} as const;

export interface PerfEvent { t: number; y: number; kind: string; detail: string }

const CAP = 32768;

class Perf {
  on = false;
  frames = 0;
  events: PerfEvent[] = [];
  /** set by the page: scroll position of the current frame */
  y = 0;
  private buf: Float64Array | null = null;
  private row = new Float64Array(F.N);
  private last = 0;
  private open = false;
  private chan: MessageChannel | null = null;
  private paintFrom = 0;
  private paintRow = -1;
  private longTasks: PerformanceObserver | null = null;

  start() {
    if (!this.buf) this.buf = new Float64Array(CAP * F.N);
    this.frames = 0; this.events = []; this.last = 0; this.on = true;
    if (!this.chan) {
      this.chan = new MessageChannel();
      // posted at the end of a frame callback, handled once the browser has finished rendering that frame
      this.chan.port1.onmessage = () => {
        if (this.paintRow >= 0 && this.buf) this.buf[(this.paintRow % CAP) * F.N + F.PAINT] = performance.now() - this.paintFrom;
      };
    }
    if (!this.longTasks && typeof PerformanceObserver !== 'undefined') {
      try {
        this.longTasks = new PerformanceObserver((list) => {
          if (!this.on) return;
          for (const e of list.getEntries()) this.events.push({ t: e.startTime, y: this.y, kind: 'longtask', detail: `${e.duration.toFixed(0)} ms` });
        });
        this.longTasks.observe({ entryTypes: ['longtask'] });
      } catch { /* not supported */ }
    }
  }

  stop() { this.on = false; }

  /** start of a frame callback */
  begin(now: number, y: number) {
    this.y = y;
    if (!this.on) return;
    const r = this.row;
    // a sort handed over between two frames belongs to the frame that draws it
    const keepSort = r[F.SORT], keepApply = r[F.APPLY], keepLat = r[F.LAT], keepUp = r[F.UPLOAD];
    r.fill(0);
    r[F.SORT] = keepSort; r[F.APPLY] = keepApply; r[F.LAT] = keepLat; r[F.UPLOAD] = keepUp;
    r[F.T] = now; r[F.DT] = this.last ? now - this.last : 0; r[F.Y] = y; r[F.GPU] = -1;
    this.last = now;
    this.open = true;
  }

  set(field: number, v: number) { if (this.on) this.row[field] = v; }
  add(field: number, v: number) { if (this.on) this.row[field] += v; }

  /** end of a frame callback; returns the index of the row (for values that arrive later, like GPU time) */
  end(now: number): number {
    if (!this.on || !this.open || !this.buf) return -1;
    this.open = false;
    const r = this.row;
    r[F.JS] = now - r[F.T];
    const i = this.frames++;
    this.buf.set(r, (i % CAP) * F.N);
    r[F.SORT] = 0; r[F.APPLY] = 0; r[F.LAT] = 0; r[F.UPLOAD] = 0;
    this.paintFrom = now; this.paintRow = i;
    this.chan?.port2.postMessage(0);
    return i;
  }

  /** a value measured after the frame ended (GPU timer queries resolve a few frames later) */
  late(index: number, field: number, v: number) {
    if (!this.buf || index < 0 || index < this.frames - CAP || index >= this.frames) return;
    this.buf[(index % CAP) * F.N + field] = v;
  }

  event(kind: string, detail = '') {
    if (this.on) this.events.push({ t: performance.now(), y: this.y, kind, detail });
  }

  /** rows of the recording, oldest first, as plain arrays (for the test script) */
  dump() {
    const n = Math.min(this.frames, CAP), first = this.frames - n;
    const rows: number[][] = [];
    for (let i = first; i < this.frames; i++) {
      const o = (i % CAP) * F.N;
      rows.push(Array.from(this.buf!.subarray(o, o + F.N), (v) => Math.round(v * 100) / 100));
    }
    return { fields: Object.keys(F).filter((k) => k !== 'N'), rows, events: this.events };
  }

  /** the last k rows, newest last, without copying (for the overlay) */
  tail(k: number, fn: (row: Float64Array) => void) {
    if (!this.buf) return;
    const n = Math.min(this.frames, CAP, k);
    for (let i = this.frames - n; i < this.frames; i++) {
      const o = (i % CAP) * F.N;
      fn(this.buf.subarray(o, o + F.N));
    }
  }
}

export const perf = new Perf();

/**
 * GPU time of a stretch of GL calls, through EXT_disjoint_timer_query_webgl2 (Chromium).
 * Results arrive a few frames late; each one is reported with the tag given at begin().
 */
export class GpuTimer {
  readonly ok: boolean;
  /** last resolved measurement (ms), -1 until one arrives */
  lastMs = -1;
  private ext: any;
  private pending: { q: WebGLQuery; tag: number; aux: number }[] = [];
  private free: WebGLQuery[] = [];
  private active: WebGLQuery | null = null;

  constructor(private gl: WebGL2RenderingContext) {
    this.ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    this.ok = !!this.ext;
  }

  /** tag and aux come back with the result: the frame it belongs to, the quality level it was drawn at */
  begin(tag: number, aux = 0) {
    if (!this.ok || this.active || this.pending.length > 8) return;
    const q = this.free.pop() ?? this.gl.createQuery();
    if (!q) return;
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, q);
    this.active = q;
    this.pending.push({ q, tag, aux });
  }

  end() {
    if (!this.active) return;
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    this.active = null;
  }

  /** collect finished queries; fn(tag, ms, aux) for each */
  poll(fn?: (tag: number, ms: number, aux: number) => void) {
    if (!this.ok || !this.pending.length) return;
    const gl = this.gl;
    const disjoint = gl.getParameter(this.ext.GPU_DISJOINT_EXT);
    while (this.pending.length) {
      const p = this.pending[0];
      if (p.q === this.active) break;
      if (!gl.getQueryParameter(p.q, gl.QUERY_RESULT_AVAILABLE)) break;
      this.pending.shift();
      if (!disjoint) {
        const ms = (gl.getQueryParameter(p.q, gl.QUERY_RESULT) as number) / 1e6;
        this.lastMs = ms;
        fn?.(p.tag, ms, p.aux);
      }
      this.free.push(p.q);
    }
  }
}
