// The instrument panel behind ?perf=1: what the run costs on this machine, live.
// Frame time, render scale and quality level, Gaussians drawn, sort and GPU time, and the last
// long frame with the place where it happened. Loaded only when the address asks for it.

import type { Director } from '../world/director';
import type { World } from '../world/index';
import { F, perf } from '../world/perf';
import { LEVELS } from '../world/quality';
import type { SiteContent } from '../data/types';

type Labels = SiteContent['home']['run']['perf'];

export function perfOverlay(world: World, D: Director, L: Labels) {
  const box = document.createElement('aside');
  box.className = 'perf read';
  box.setAttribute('aria-label', L.title);
  const row = (label: string) => {
    const d = document.createElement('div');
    const dt = document.createElement('span'); dt.textContent = label; dt.className = 'perf__k';
    const dd = document.createElement('span'); dd.className = 'perf__v';
    d.append(dt, dd); box.append(d);
    return dd;
  };
  const head = document.createElement('p'); head.className = 'perf__h'; head.textContent = L.title; box.append(head);
  const vFrame = row(L.frame), vGpu = row(L.gpu), vScale = row(L.scale), vSplats = row(L.splats), vSort = row(L.sort), vLong = row(L.long), vDev = row(L.device);
  // a strip of the last frames: one bar per frame, red over 33 ms
  const strip = document.createElement('canvas');
  strip.width = 240; strip.height = 36; strip.className = 'perf__strip';
  box.append(strip);
  const ctl = document.createElement('p'); ctl.className = 'perf__ctl';
  const btn = (label: string, fn: () => void) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', fn); ctl.append(b); return b; };
  btn('−', () => world.setLevel(Math.min(LEVELS - 1, world.gov.level + 1)));
  btn('+', () => world.setLevel(Math.max(0, world.gov.level - 1)));
  btn(L.auto, () => world.setLevel(-1));
  box.append(ctl);
  document.body.append(box);
  vDev.textContent = world.gpuName.replace(/^ANGLE \(([^,]+), ([^,(]+).*$/, '$2').trim().slice(0, 34) || '?';

  const where = (y: number) => {
    let best = '', bp = 0, top = -Infinity;
    for (const name in D.sections) {
      const s = D.sections[name];
      if (y >= s.top - 1 && s.top > top) { best = name; top = s.top; bp = (y - s.top) / s.span; }
    }
    return best ? `${best} ${bp.toFixed(2)}` : '';
  };
  const g = strip.getContext('2d')!;
  let lastLong = '', longAt = 0, seenFrames = 0;
  const n1 = new Intl.NumberFormat(document.documentElement.lang || 'en', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const int = new Intl.NumberFormat(document.documentElement.lang || 'en');

  setInterval(() => {
    if (document.hidden) return;
    const dts: number[] = [];
    let gpu = 0, gpuN = 0, sort = 0, sortN = 0, splats = 0;
    perf.tail(120, (r) => {
      dts.push(r[F.DT]);
      if (r[F.GPU] >= 0) { gpu += r[F.GPU]; gpuN++; }
      if (r[F.SORT] > 0) { sort += r[F.SORT]; sortN++; }
      splats = r[F.SPLATS];
    });
    // long frames since the last look
    const fresh = Math.min(perf.frames - seenFrames, 600);
    seenFrames = perf.frames;
    if (fresh > 0) {
      let k = 0;
      perf.tail(fresh, (r) => {
        k++;
        if (r[F.DT] > 33 && r[F.DT] < 1000) {
          const parts: [string, number][] = [[L.device, r[F.GPU]], [L.script, r[F.JS]], [L.browser, r[F.PAINT]]];
          parts.sort((a, b) => b[1] - a[1]);
          const why = parts[0][1] > 8 ? `, ${parts[0][0]} ${n1.format(parts[0][1])}` : '';
          lastLong = `${n1.format(r[F.DT])} ms · ${where(r[F.Y])}${why}`;
          longAt = performance.now();
        }
      });
      void k;
    }
    if (!dts.length) return;
    const sorted = dts.slice().sort((a, b) => a - b);
    const avg = dts.reduce((a, b) => a + b, 0) / dts.length;
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    vFrame.textContent = `${n1.format(avg)} ms · ${Math.round(1000 / avg)} fps · p95 ${n1.format(p95)}`;
    vGpu.textContent = gpuN ? `${n1.format(gpu / gpuN)} ms` : L.none;
    const dpr = world.renderer.getPixelRatio();
    const w = Math.floor(world.canvas.clientWidth * dpr), h = Math.floor(world.canvas.clientHeight * dpr);
    vScale.textContent = `×${world.gov.scale.toFixed(2)} · ${w} × ${h} · ${L.level} ${world.gov.level}${world.gov.auto ? '' : ' ●'}${world.gov.keep < 1 ? ` · ${Math.round(world.gov.keep * 100)}%` : ''}`;
    vSplats.textContent = `${int.format(splats)} / ${int.format(world.info.count)}`;
    vSort.textContent = sortN ? `${n1.format(sort / sortN)} ms` : L.none;
    vLong.textContent = lastLong ? `${lastLong} · ${Math.round((performance.now() - longAt) / 1000)} s` : L.none;
    // strip
    g.clearRect(0, 0, strip.width, strip.height);
    const bw = strip.width / 120;
    dts.forEach((d, i) => {
      const hgt = Math.min(strip.height, (d / 50) * strip.height);
      g.fillStyle = d > 33 ? '#FF3B30' : d > 20 ? '#FFD326' : '#A9BBFF';
      g.fillRect(i * bw, strip.height - hgt, Math.max(1, bw - 0.5), hgt);
    });
    g.fillStyle = 'rgba(244,246,255,0.5)';
    g.fillRect(0, strip.height - (16.7 / 50) * strip.height, strip.width, 1);
  }, 250);
}
