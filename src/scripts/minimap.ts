// Minimap: the occupancy grid sliced from the Gaussians, the A* path and the live pose.

import type { SceneInfo, Pose } from '../world/index';
import { BOUNDS } from '../world/layout';

const C = { paper: '#F4F6FF', haze: '#A9BBFF', fil: '#FF3B30', cone: '#FFD326', deep: '#060B3A' };

export class Minimap {
  private ctx: CanvasRenderingContext2D;
  private base: HTMLCanvasElement;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private sx = 1;
  private sz = 1;
  private pad = 6;

  constructor(private canvas: HTMLCanvasElement, private info: SceneInfo) {
    this.ctx = canvas.getContext('2d')!;
    this.base = document.createElement('canvas');
    this.resize();
  }

  toPx(x: number, z: number): [number, number] {
    return [this.pad + (x - BOUNDS.x0) * this.sx, this.pad + (z - BOUNDS.z0) * this.sz];
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(40, r.width); this.h = Math.max(40, r.height);
    this.canvas.width = Math.round(this.w * this.dpr); this.canvas.height = Math.round(this.h * this.dpr);
    this.pad = this.w < 140 ? 4 : 6;
    this.sx = (this.w - this.pad * 2) / (BOUNDS.x1 - BOUNDS.x0);
    this.sz = (this.h - this.pad * 2) / (BOUNDS.z1 - BOUNDS.z0);
    this.drawBase();
  }

  private drawBase() {
    const { info, dpr } = this;
    const b = this.base;
    b.width = this.canvas.width; b.height = this.canvas.height;
    const g = b.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    // occupancy cells
    const cw = (this.w - this.pad * 2) / info.gridW, ch = (this.h - this.pad * 2) / info.gridH;
    g.fillStyle = C.paper;
    const s = Math.max(cw, ch) * 1.25;
    for (let z = 0; z < info.gridH; z++) {
      for (let x = 0; x < info.gridW; x++) {
        if (info.grid[z * info.gridW + x]) g.fillRect(this.pad + x * cw, this.pad + z * ch, s, s);
      }
    }
    // planned path, dashed
    g.strokeStyle = C.haze; g.lineWidth = 1; g.setLineDash([2, 2.5]);
    g.beginPath();
    const p = info.path;
    for (let i = 0; i < p.length; i += 10) {
      const [px, py] = this.toPx(p[i], p[i + 1]);
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
  }

  draw(pose: Pose, s: number, sensor: number, range: number, half: number, top: number) {
    const { ctx, dpr, info } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // travelled path
    const p = info.path, n = p.length / 2;
    const upto = Math.floor(Math.max(0, Math.min(1, s / info.pathLen)) * (n - 1));
    ctx.strokeStyle = C.fil; ctx.lineWidth = 1.8; ctx.setLineDash([]); ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= upto; i += 6) {
      const [px, py] = this.toPx(p[i * 2], p[i * 2 + 1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    const [hx, hy] = this.toPx(pose.x, pose.z);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    // field of view
    const fovR = sensor > 0.05 ? range * this.sx : 16;
    const fovH = sensor > 0.05 ? half : 0.5;
    ctx.fillStyle = sensor > 0.05 ? 'rgba(255,211,38,0.35)' : 'rgba(244,246,255,0.22)';
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.arc(hx, hy, fovR, pose.yaw - fovH, pose.yaw + fovH);
    ctx.closePath();
    ctx.globalAlpha = 1 - top;
    ctx.fill();
    ctx.globalAlpha = 1;
    // robot
    ctx.fillStyle = C.fil; ctx.strokeStyle = C.paper; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(hx, hy, 3.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
}
