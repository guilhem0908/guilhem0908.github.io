// Entry of the home run. Small on purpose: the world (three.js, shaders, worker) is imported after first paint.
// Every string shown by this script comes from the language file, serialised in #run-i18n.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { Director, inOut, inOut3, linear, type Key } from '../world/director';
import type { World, WorldState } from '../world/index';
import { F, perf } from '../world/perf';
import type { SiteContent } from '../data/types';
import { Minimap } from './minimap';
import { autoplayVideos, nameCaseTitleOnClick } from './shared';

type RunStrings = SiteContent['home']['run'] & { locale: string };

const html = document.documentElement;
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const T9: RunStrings = JSON.parse($('#run-i18n').textContent || '{}');
const fmt = new Intl.NumberFormat(T9.locale || 'en');
// readouts with a fixed number of decimals use the decimal sign of the page language (6.5 m, 6,5 m)
const fixedFmt = (digits: number) => new Intl.NumberFormat(T9.locale || 'en', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
const f1 = fixedFmt(1), f3 = fixedFmt(3);

nameCaseTitleOnClick();

function staticPage() {
  // no WebGL or reduced motion: the default CSS is already a complete page
  $$<HTMLVideoElement>('video[data-feed]').forEach((v) => { v.controls = true; });
  autoplayVideos();
  initCompare();
  const b = document.querySelector<HTMLButtonElement>('[data-start3d]');
  b?.addEventListener('click', () => {
    try { sessionStorage.setItem('navrun-3d', '1'); } catch { /* private mode */ }
    location.reload();
  });
}

/** the before / after slider of the static page (same markup as on the case-study pages) */
function initCompare() {
  import('./compare').then((m) => m.initCompare()).catch(() => {});
}

if (!html.classList.contains('gl')) staticPage();
else run().catch((err) => {
  console.warn('[navrun] falling back to the static page:', err);
  html.classList.remove('gl', 'booting', 'small');
  staticPage();
});

async function run() {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('converge', '0.16,1,0.3,1');
  CustomEase.create('plan', '0.77,0,0.175,1');
  CustomEase.create('snap', '0.23,1,0.32,1');

  const small = html.classList.contains('small');
  const startY = window.scrollY;
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);

  // ---------------------------------------------------------- intro DOM
  const iStatus = $('[data-i="status"]'), iIter = $('[data-i="iter"]'), iCount = $('[data-i="count"]');
  const iRes = $('[data-i="res"]'), iGrid = $('[data-i="grid"]'), iPath = $('[data-i="path"]');

  // first paint, then the heavy code
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  const { World } = await import('../world/index');
  const canvas = $<HTMLCanvasElement>('#world');
  const world: World = new World(canvas, { mobile: small });
  const info = await world.init();
  (window as any).__world = world;
  await (document.fonts?.ready ?? Promise.resolve());

  // ------------------------------------------------------------ director
  const m = info.marks, L = info.pathLen;
  const D = new Director();
  const mid = (a: string, b: string, t = 0.5) => m[a] + (m[b] - m[a]) * t;
  D.set('s', [
    ['hero', 0, 0], ['hero', 1, 3.2],
    ['aist', 0.09, m.lobbyDoor - 0.7], ['aist', 0.15, m.vestibule + 0.1], ['aist', 0.2, m.vestibule + 0.45],
    ['aist', 0.265, m.aist, inOut], ['aist', 0.93, m.aist], ['aist', 1, m.aistExit - 0.7, inOut],
    ['svlr', 1, m.trackIn + 0.5],
    ['tlse', 0.93, m.trackOut], ['tlse', 1, m.factoryDoor - 0.4],
    ['usine', 0.18, m.laneNW - 0.2], ['usine', 0.76, m.laneNE - 0.5], ['usine', 0.9, m.laneE], ['usine', 1, m.pfrDoor - 0.5],
    ['pfr', 0.2, L, inOut], ['pfr', 1, L],
  ] as Key[], linear);
  D.set('yawOff', [
    ['aist', 0.1, 0], ['aist', 0.15, -1.22], ['aist', 0.195, -1.22], ['aist', 0.235, 0],
    ['svlr', 0.1, 0], ['svlr', 0.75, 0.75], ['tlse', 0.06, 0],
  ]);
  // absolute heading, used where the camera must look somewhere else than along the path
  const penYaw = small ? 0.16 : 0.0;
  D.set('head', [
    ['aist', 0.84, 0], ['aist', 0.92, 1.32],
    ['usine', 0.1, 1.2], ['usine', 0.2, 0.92], ['usine', 0.76, 2.22], ['usine', 0.86, 1.57], ['usine', 0.96, 0],
    ['pfr', 0.01, penYaw],
  ]);
  D.set('headMix', [
    ['aist', 0.215, 0], ['aist', 0.265, 1], ['aist', 0.94, 1], ['aist', 1, 0],
    ['usine', 0.13, 0], ['usine', 0.24, 1], ['usine', 0.95, 1], ['usine', 1, 0],
    ['pfr', 0.06, 0], ['pfr', 0.18, 1],
  ]);
  // the crane over the factory hall: the camera leaves the lane sideways and climbs
  D.set('offZ', [['usine', 0.16, 0], ['usine', 0.42, -2.25], ['usine', 0.76, -2.25], ['usine', 0.9, 0]]);
  D.set('offX', [['usine', 0.16, 0], ['usine', 0.3, 0]]);
  D.set('camH', [
    ['aist', 0.2, 1.25], ['aist', 0.265, 1.35], ['aist', 0.93, 1.35], ['aist', 1, 1.25],
    ['tlse', 0, 1.25], ['tlse', 0.08, 1.05], ['tlse', 0.9, 1.05], ['tlse', 1, 1.25],
    ['usine', 0.14, 1.25], ['usine', 0.42, 5.3], ['usine', 0.76, 5.3], ['usine', 0.95, 1.3],
    ['pfr', 0.05, 1.3], ['pfr', 0.2, 1.62],
  ]);
  D.set('pitch', [
    ['hero', 0, 0.0], ['hero', 1, -0.03],
    ['aist', 0.12, -0.03], ['aist', 0.16, 0.04], ['aist', 0.22, -0.02],
    ['tlse', 0, -0.03], ['tlse', 0.08, -0.13], ['tlse', 0.9, -0.13], ['tlse', 1, -0.03],
    ['usine', 0.14, -0.03], ['usine', 0.42, -0.84], ['usine', 0.76, -0.8], ['usine', 0.95, -0.03],
    ['pfr', 0.05, -0.03], ['pfr', 0.2, small ? -0.2 : -0.27],
  ]);
  D.set('fov', [
    ['hero', 0, small ? 74 : 60], ['hero', 1, small ? 72 : 58],
    ['aist', 0.22, small ? 72 : 58], ['aist', 0.3, small ? 82 : 68],
    // on a phone the panorama seen from inside is a narrow, heavily magnified slice: pull back while it is on screen
    ...(small ? [['aist', 0.33, 82], ['aist', 0.4, 98], ['aist', 0.84, 98]] as Key[] : []),
    ['aist', 0.92, small ? 82 : 68], ['aist', 1, small ? 72 : 58],
    ['usine', 0.14, small ? 72 : 58], ['usine', 0.42, small ? 84 : 66], ['usine', 0.76, small ? 84 : 66], ['usine', 0.95, small ? 72 : 58],
    ['pfr', 0.2, small ? 70 : 60],
  ]);
  D.set('top', [['lab', 0.02, 0], ['lab', 0.62, 1, inOut3], ['contact', 0, 1]]);
  D.set('fogNear', [['hero', 0, 7], ['tlse', 1, 7], ['usine', 0.3, 11], ['usine', 0.9, 11], ['pfr', 0.1, 6]]);
  D.set('fogFar', [['hero', 0, 20], ['tlse', 1, 20], ['usine', 0.3, 30], ['usine', 0.9, 30], ['pfr', 0.1, 17]]);
  D.set('photo', [['aist', 0.105, 0], ['aist', 0.15, 1], ['svlr', 0.3, 1], ['svlr', 0.9, 0]]);
  D.set('artefact', [['aist', 0.5, 1], ['aist', 0.6, 0]]);
  D.set('repair', [['aist', 0.5, 0], ['aist', 0.6, 1]]);
  D.set('ceil', [['aist', 0.2, 0], ['aist', 0.25, 1], ['aist', 0.97, 1], ['svlr', 0.2, 0]]);
  D.set('pano', [['aist', 0.33, 0], ['aist', 0.395, 1], ['aist', 0.84, 1], ['aist', 0.905, 0]]);
  D.set('unwrap', [['aist', 0.41, 0], ['aist', 0.5, 1], ['aist', 0.76, 1], ['aist', 0.84, 0]]);
  D.set('wipe', [['aist', 0.545, 0], ['aist', 0.675, 1]], linear);
  D.set('sensor', [['tlse', 0.03, 0], ['tlse', 0.09, 1], ['tlse', 0.9, 1], ['tlse', 0.96, 0]]);
  D.layout();

  // --------------------------------------------------------------- beats
  interface Beat { el: HTMLElement; sec: string; a: number; b: number; on: boolean; conv: HTMLElement[]; feed: HTMLVideoElement | null }
  const splits = new Map<HTMLElement, HTMLElement[]>();
  const charsOf = (el: HTMLElement) => {
    let c = splits.get(el);
    if (!c) {
      const s = SplitText.create(el, { type: 'words,chars', charsClass: 'cv-char', wordsClass: 'cv-word', aria: 'auto' });
      c = s.chars as HTMLElement[];
      splits.set(el, c);
    }
    return c;
  };
  const converge = (el: HTMLElement, delay = 0) => {
    const chars = charsOf(el);
    const big = el.classList.contains('d-xl') || el.classList.contains('d-l');
    gsap.killTweensOf(chars);
    gsap.fromTo(chars, {
      opacity: 0,
      x: () => gsap.utils.random(-70, 70) * (big ? 1.6 : 1),
      y: () => gsap.utils.random(-46, 46) * (big ? 1.6 : 1),
      scale: () => gsap.utils.random(1.3, 2.1),
      rotation: () => gsap.utils.random(-14, 14),
      filter: 'blur(14px)',
    }, {
      opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, filter: 'blur(0px)',
      duration: big ? 1.35 : 1.05, ease: 'converge', delay,
      stagger: { each: big ? 0.028 : 0.014, from: 'random' },
      clearProps: 'filter',
    });
  };
  const beats: Beat[] = $$('.beat[data-in]').map((el) => ({
    el, sec: el.closest<HTMLElement>('[data-sec]')!.dataset.sec!,
    a: parseFloat(el.dataset.in!), b: parseFloat(el.dataset.out!), on: false,
    conv: $$('[data-converge]', el), feed: el.querySelector<HTMLVideoElement>('video[data-feed]'),
  }));
  const setBeat = (bt: Beat, on: boolean) => {
    if (bt.on === on) return;
    bt.on = on;
    bt.el.classList.toggle('is-on', on);
    if (on) perf.event('beat', `${bt.sec} ${bt.a}`);
    if (on) bt.conv.forEach((c) => converge(c, 0.05));
    if (bt.feed) { if (on) bt.feed.play().catch(() => {}); else bt.feed.pause(); }
  };

  const marquee = $('[data-marquee]'), track = $('.marquee__track');
  const giant = $('[data-giant]');
  const heroName = $('.hero__name'), heroSide = $('.hero__side');
  const usineTitle = $('.usine__title');
  const capRaw = $('[data-raw]'), capFix = $('[data-fix]');
  let marqueeW = 1;
  const measure = () => {
    marqueeW = track.scrollWidth / 2;
    // the unwrapped panorama band, shared with the shader
    const vw = window.innerWidth, vh = window.innerHeight;
    // on wide screens the band stays clear of the instruments in the bottom right corner
    const pad = Math.max(16, Math.min(48, vw * 0.033));
    const band = small ? 0.94 : Math.min(0.62, (0.94 * vh) / vw, 1 - (2 * (176 + pad + 16)) / vw);
    const bandY = small ? 0.34 : 0.16;
    world.setBand(band, bandY);
    const cx = vw / 2, cy = vh * (0.5 - bandY / 2), bw = band * vw, bh = bw / 2;
    const st = $('.sec--aist .stage').style;
    st.setProperty('--band-l', `${cx - bw / 2}px`);
    st.setProperty('--band-b', `${cy + bh / 2}px`);
    // the top 9.4% of the panorama is hidden by the label bar of the video: the band starts below it (pano.frag.glsl)
    st.setProperty('--band-t', `${cy - bh / 2 + 0.094 * bh}px`);
  };

  // ----------------------------------------------------------------- HUD
  const map = new Minimap($<HTMLCanvasElement>('#map'), info);
  const rWp = $('[data-r="wp"]'), rPose = $('[data-r="pose"]'), rRun = $('[data-r="run"]'), rCount = $('[data-r="count"]');
  const Z = T9.zones;
  const zones: [number, string][] = [
    [m.lobbyDoor, Z.lobby], [m.aistDoor, Z.vestibule], [m.aistExit, Z.aist],
    [m.factoryDoor, Z.track], [m.pfrDoor, Z.factory], [Infinity, Z.pen],
  ];
  const wpAt: Record<string, number> = { hero: 0, aist: m.aist, tlse: mid('trackIn', 'trackOut'), usine: m.laneN, pfr: L };
  const wpLinks = $$<HTMLAnchorElement>('.map__wps a');
  const placeWps = () => {
    wpLinks.forEach((a) => {
      const s = wpAt[a.dataset.wp!];
      if (s === undefined) { a.parentElement!.style.display = 'none'; return; }
      const [x, z] = world.pathAt(s);
      const [px, py] = map.toPx(x, z);
      a.style.left = `${px}px`; a.style.top = `${py}px`;
    });
  };
  // where each anchor lands (a moment that reads well, not the section edge)
  const landing: Record<string, [string, number]> = {
    hero: ['hero', 0], aist: ['aist', 0.03], svlr: ['svlr', 0.2], tlse: ['tlse', 0.12], usine: ['usine', 0.5],
    pfr: ['pfr', 0.3], lab: ['lab', 0.06], work: ['index', 0], contact: ['contact', 0],
  };
  const yFor = (id: string) => {
    const l = landing[id];
    if (!l) return null;
    if (id === 'contact') return document.documentElement.scrollHeight - window.innerHeight;
    if (id === 'work') return Math.max(0, D.yOf('index', 0) - window.innerHeight * 0.12);
    return D.yOf(l[0], l[1]);
  };
  const goTo = (id: string) => {
    const y = yFor(id);
    if (y === null) return;
    const dist = Math.abs(y - window.scrollY);
    lenis.scrollTo(y, { duration: clamp(dist / 5200, 1.1, 3.4), easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), lock: false });
  };
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    if (!landing[id]) return;
    e.preventDefault();
    goTo(id);
    history.replaceState(null, '', `#${id}`);
  });

  const modeBtn = $<HTMLButtonElement>('[data-mode]');
  const modeNames = [T9.view.colour, T9.view.depth, T9.view.ellipsoids];
  modeBtn.addEventListener('click', () => {
    world.modeAll = (world.modeAll + 1) % 3;
    modeBtn.textContent = `${T9.view.prefix} ${modeNames[world.modeAll]}`;
  });
  const lens = $('.lens'), lensLabel = $('.lens__label');
  const lensText = () => { lensLabel.textContent = world.lensMode === 1 ? T9.lens.depth : T9.lens.ellipsoids; };
  lensText();
  const toggleLens = () => { world.lensMode = world.lensMode === 1 ? 2 : 1; lensText(); };
  const fine = window.matchMedia('(pointer: fine)').matches && !small;

  // sensor model controls (the configurable part of his simulator)
  const oRange = $('[data-o="range"]'), oAngle = $('[data-o="angle"]'), oSeen = $('[data-o="seen"]'), oBearing = $('[data-o="bearing"]');
  $$<HTMLInputElement>('[data-sensor]').forEach((inp) => {
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      if (inp.dataset.sensor === 'range') { world.sensorRange = v; oRange.textContent = `${f1.format(v)} m`; }
      else { world.sensorHalf = (v / 2) * (Math.PI / 180); oAngle.textContent = `${v}°`; }
      inp.setAttribute('aria-valuetext', (inp.dataset.sensor === 'range' ? oRange : oAngle).textContent || '');
    });
  });

  // ------------------------------------------------------------- pointer
  let pfrP = 0;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const w = window.innerWidth, h = window.innerHeight;
    world.pointer.set((e.clientX / w) * 2 - 1, (e.clientY / h) * 2 - 1);
    world.pointerPx.set(e.clientX, e.clientY);
    world.pointerActive = true;
    lens.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    if (pfrP > 0.16 && pfrP < 1.05) world.ballTarget = world.floorHit((e.clientX / w) * 2 - 1, -((e.clientY / h) * 2 - 1));
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { world.pointerActive = false; });
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey && !(e.target as HTMLElement).closest('input')) toggleLens();
  });
  window.addEventListener('click', (e) => {
    if (!fine || (e.target as HTMLElement).closest('a,button,input,label,video,.labcard,.irow')) return;
    toggleLens();
  });

  // --------------------------------------------------------------- intro
  const I = { train: 0, top: 1, pathReveal: 0, active: true };
  const aliveFrac = (t: number) => (t <= 0 ? 0.05 : 0.05 + 0.95 * clamp(Math.pow(clamp((t - 0.05) / 0.65), 1 / 1.15)));
  const residual = world.residualSampler(2400);
  const introDone = () => {
    if (!I.active) return;
    I.active = false; I.train = 1; I.top = 0; I.pathReveal = 1;
    perf.event('intro-done');
    html.classList.remove('booting');
    html.classList.add('intro-done');
    lenis.start();
    world.lensOn = fine;
    try { sessionStorage.setItem('navrun-seen', '1'); } catch { /* private mode */ }
  };
  let heroShown = false;
  const heroIn = () => {
    heroShown = true;
    perf.event('hero-in');
    html.classList.remove('booting');
    $$('.hero__name .ln').forEach((ln, i) => converge(ln, i * 0.12));
    const w = { v: 75 };
    gsap.to(w, { v: 125, duration: 1.5, ease: 'converge', onUpdate: () => { heroName.style.fontStretch = `${w.v}%`; }, onComplete: () => { heroName.style.fontStretch = ''; } });
    gsap.from([heroSide.children, '.hud'], { opacity: 0, y: 18, duration: 0.9, ease: 'converge', stagger: 0.07, delay: 0.25, clearProps: 'all' });
  };

  let seen = false;
  try { seen = sessionStorage.getItem('navrun-seen') === '1'; } catch { /* private mode */ }
  const q = new URLSearchParams(location.search);
  const hashId = location.hash.slice(1);
  if (startY > 40 || q.has('nointro') || landing[hashId]) {
    heroIn(); introDone();
    gsap.set('.intro', { display: 'none' });
    // arriving on an anchor (from the header of another page, or the skip link)
    if (landing[hashId] && hashId !== 'hero') requestAnimationFrame(() => { const y = yFor(hashId); if (y !== null) lenis.scrollTo(y, { immediate: true, force: true }); });
  } else {
    lenis.stop();
    window.scrollTo(0, 0);
    iStatus.textContent = T9.intro.training;
    iGrid.textContent = T9.intro.pending; iPath.textContent = T9.intro.pending;
    const tl = gsap.timeline({ onComplete: introDone });
    (window as any).__intro = tl;
    tl.to(I, { train: 0.84, duration: 2.7, ease: 'power1.inOut' }, 0)
      .to(I, { train: 1, duration: 1.5, ease: 'power2.out' }, 2.7)
      .to(I, { top: 0, duration: 2.4, ease: 'plan' }, 1.85)
      .add(() => { iStatus.textContent = T9.intro.slicing; iGrid.textContent = `${info.gridW} × ${info.gridH} ${T9.intro.cells}`; }, 2.5)
      .add(() => { iStatus.textContent = T9.intro.planning; iPath.textContent = `${f1.format(L)} m`; }, 3.15)
      .to(I, { pathReveal: 1, duration: 1.5, ease: 'power2.inOut' }, 3.15)
      .to('.intro', { opacity: 0, duration: 0.5, ease: 'snap' }, 3.55)
      .add(heroIn, 3.6)
      .add(() => {}, 4.7);
    if (seen) tl.timeScale(1.8);
    const skip = () => { if (I.active) tl.timeScale(6); };
    ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach((ev) => window.addEventListener(ev, skip, { once: true, passive: true }));
    window.dispatchEvent(new CustomEvent('navrun:intro'));
    (window as any).__introStart = performance.now();
  }

  // ----------------------------------------------------- scroll triggers
  $$('[data-rise]').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 36 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 1.0, ease: 'converge', clearProps: 'transform' });
        $$('[data-converge]', el).forEach((c) => converge(c, 0.05));
      },
    });
  });
  $$('[data-on-view]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 92%', onEnter: () => converge(el), onEnterBack: () => converge(el) });
  });
  autoplayVideos($('main'));

  // ---------------------------------------------------------------- loop
  const T: Record<string, number> = {};
  const tgt = world.target as WorldState;
  let hudTick = 0;
  let lastY = -1;
  const hud = $('.hud');
  // on phones the instruments sit at the bottom of the screen, where the lab enters: they step aside just before it does
  const labHead = $('.labhome');
  let hudAwayY = Infinity;
  const measureHud = () => {
    hudAwayY = labHead.getBoundingClientRect().top + window.scrollY - window.innerHeight - 40;
  };
  const frame = (time: number, deltaMs: number) => {
    const rec = perf.on;
    const p0 = rec ? performance.now() : 0;
    perf.begin(p0, lastY < 0 ? 0 : lastY);
    lenis.raf(time * 1000);
    const y = window.scrollY;
    const p1 = rec ? performance.now() : 0;
    if (rec) { perf.set(F.LENIS, p1 - p0); perf.set(F.Y, y); perf.y = y; }
    // lab and index are plain flow: the header gets a ground, the map steps aside on phones
    const flow = !I.active && D.progress('lab', y) > -0.02 && y < D.yOf('contact', 0) - window.innerHeight * 0.45;
    html.classList.toggle('in-flow', flow);
    hud.classList.toggle('is-away', small && !I.active && y > hudAwayY && y < D.yOf('contact', 0) - window.innerHeight * 0.45);
    D.eval(y, T);
    for (const k in T) tgt[k] = T[k];
    if (I.active) { tgt.train = I.train; tgt.top = I.top; tgt.pathReveal = I.pathReveal; tgt.s = 0; }
    else { tgt.train = 1; tgt.pathReveal = 1; }
    const te = tgt.top;
    tgt.fogNear = T.fogNear + (80 - T.fogNear) * te;
    tgt.fogFar = T.fogFar + (120 - T.fogFar) * te;
    tgt.fov = T.fov + (40 - T.fov) * sstep(0, 1, te);
    world.planShift = I.active ? 0 : 1;
    pfrP = D.progress('pfr', y);
    world.inPfr = pfrP > 0.02 && D.progress('lab', y) < 0.7;
    world.frame(deltaMs / 1000);
    const p2 = rec ? performance.now() : 0;

    // beats
    for (const bt of beats) {
      const p = D.progress(bt.sec, y);
      setBeat(bt, !I.active && p >= bt.a && p < bt.b);
    }
    // hero leaves as the run starts
    const hp = D.progress('hero', y);
    if (hp < 1.6 && heroShown) {
      const o = 1 - sstep(0.18, 0.75, hp);
      heroName.style.opacity = String(o); heroSide.style.opacity = String(1 - sstep(0.05, 0.5, hp));
      heroName.style.transform = `translate3d(0, ${-hp * 90}px, 0)`;
      heroSide.style.visibility = hp > 0.55 ? 'hidden' : 'visible';
      heroName.style.visibility = hp > 0.8 ? 'hidden' : 'visible';
    }
    // 360 figure grows as the vestibule approaches
    const ap = D.progress('aist', y);
    const go = sstep(-0.03, 0.01, ap) * (1 - sstep(0.075, 0.105, ap));
    giant.style.opacity = String(go * 0.9);
    if (go > 0) giant.style.transform = `translate3d(${(-ap * 900).toFixed(1)}px, 0, 0) scale(${(0.82 + ap * 3.4).toFixed(3)})`;
    // captions follow the repair front
    const wv = world.cur.wipe;
    capRaw.style.opacity = String(1 - sstep(0.75, 0.98, wv));
    capFix.style.opacity = String(sstep(0.04, 0.3, wv));
    // marquee
    const tp = D.progress('tlse', y);
    const mOn = tp > 0.02 && tp < 0.95 && !I.active;
    marquee.classList.toggle('is-on', mOn);
    if (mOn) {
      const x = -(((tp * 2600 + time * 42) % marqueeW) + marqueeW) % marqueeW;
      const sk = clamp(lenis.velocity * -0.22, -9, 9);
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${sk.toFixed(2)}deg)`;
    }
    // Usine title scales with the crane
    const up = D.progress('usine', y);
    if (up > -0.1 && up < 1.1) usineTitle.style.transform = `scale(${(1 - 0.5 * sstep(0.16, 0.44, up)).toFixed(3)})`;

    // instruments, a few times per second
    if (time - hudTick > 0.09 || y !== lastY) {
      hudTick = time; lastY = y;
      const pose = world.pose, s = clamp(world.cur.s, 0, L);
      if (I.active) {
        const t = world.cur.train;
        iIter.textContent = fmt.format(Math.round(t * 30000));
        iCount.textContent = fmt.format(Math.round(aliveFrac(t) * info.count));
        iRes.textContent = `${f3.format(residual(t))} m`;
      }
      let zone = zones[zones.length - 1][1];
      for (const [lim, name] of zones) if (s < lim) { zone = name; break; }
      rWp.textContent = world.cur.top > 0.5 ? T9.hud.planView : zone;
      const deg = ((Math.round((pose.yaw * 180) / Math.PI) % 360) + 360) % 360;
      rPose.textContent = `x ${f1.format(pose.x).padStart(4, '0')} z ${f1.format(pose.z).padStart(4, '0')} ${String(deg).padStart(3, '0')}°`;
      rRun.textContent = `${f1.format(s)} / ${f1.format(L)} m`;
      rCount.textContent = `${fmt.format(world.visibleCount)} / ${fmt.format(info.count)}`;
      oSeen.textContent = String(world.conesSeen);
      if (pfrP > 0.1) {
        const b = (world.ballBearing() * 180) / Math.PI;
        oBearing.textContent = `${T9.bearing} ${b >= 0 ? '+' : '−'}${f1.format(Math.abs(b)).padStart(4, '0')}°`;
      }
      map.draw(pose, s, world.cur.sensor, world.sensorRange, world.sensorHalf, world.cur.top);
      lens.classList.toggle('is-on', world.lensOn && world.pointerActive && world.cur.pano < 0.5 && world.modeAll === 0 && world.cur.top < 0.5);
      const here = world.cur.top > 0.5 ? '' : s < m.lobbyDoor ? 'hero' : s < m.aistExit ? 'aist' : s < m.factoryDoor ? 'tlse' : s < m.pfrDoor ? 'usine' : 'pfr';
      wpLinks.forEach((a) => a.classList.toggle('is-here', a.dataset.wp === here));
    }
    if (rec) { const p3 = performance.now(); perf.set(F.DOM, p3 - p2); perf.end(p3); }
  };
  // ?perf records the frames from the first one (tools/perf.py reads them)
  if (q.has('perf')) perf.start();
  gsap.ticker.add(frame);

  const onResize = () => {
    world.resize();
    map.resize();
    D.layout();
    measure();
    measureHud();
    placeWps();
    ScrollTrigger.refresh();
  };
  let rz = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(onResize); });
  onResize();
  // media that loads late changes the height of the flow sections: lay the keys out again
  window.addEventListener('load', () => { D.layout(); measureHud(); ScrollTrigger.refresh(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) gsap.ticker.sleep(); else gsap.ticker.wake(); });
  world.onLost = () => {
    gsap.ticker.remove(frame);
    lenis.destroy();
    html.classList.remove('gl', 'booting', 'small');
    staticPage();
  };

  // test hooks (screenshots, video capture)
  (window as any).__perf = perf;
  (window as any).__navrun = {
    lenis, D, world, info,
    jump: (yy: number) => { lenis.scrollTo(yy, { immediate: true, force: true }); },
    max: () => document.documentElement.scrollHeight - window.innerHeight,
  };
}
