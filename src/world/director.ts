// Scroll director: the world state is a pure function of the scroll position.
// Keys are written as (section id, local progress, value); local progress 0 is
// "section top at viewport top", 1 is "section bottom at viewport bottom".

export type Ease = (t: number) => number;
export const linear: Ease = (t) => t;
export const inOut: Ease = (t) => t * t * (3 - 2 * t);
export const inOut3: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const out3: Ease = (t) => 1 - Math.pow(1 - t, 3);

export type Key = [sec: string, p: number, v: number, ease?: Ease];

interface Compiled { y: number; v: number; ease: Ease }

export class Director {
  private src: Record<string, Key[]> = {};
  private tracks: Record<string, Compiled[]> = {};
  private defaults: Record<string, Ease> = {};
  sections: Record<string, { top: number; span: number; el: HTMLElement }> = {};

  set(name: string, keys: Key[], def: Ease = inOut) {
    this.src[name] = keys;
    this.defaults[name] = def;
  }

  layout() {
    const vh = window.innerHeight;
    this.sections = {};
    document.querySelectorAll<HTMLElement>('[data-sec]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      this.sections[el.dataset.sec!] = { top, span: Math.max(1, r.height - vh), el };
    });
    for (const name in this.src) {
      const def = this.defaults[name];
      const list: Compiled[] = [];
      for (const [sec, p, v, ease] of this.src[name]) {
        const s = this.sections[sec];
        if (!s) continue;
        list.push({ y: s.top + p * s.span, v, ease: ease ?? def });
      }
      list.sort((a, b) => a.y - b.y);
      this.tracks[name] = list;
    }
  }

  progress(sec: string, y: number) {
    const s = this.sections[sec];
    if (!s) return 0;
    return (y - s.top) / s.span;
  }

  yOf(sec: string, p: number) {
    const s = this.sections[sec];
    return s ? s.top + p * s.span : 0;
  }

  eval(y: number, out: Record<string, number>) {
    for (const name in this.tracks) {
      const k = this.tracks[name];
      if (!k.length) continue;
      if (y <= k[0].y) { out[name] = k[0].v; continue; }
      const last = k[k.length - 1];
      if (y >= last.y) { out[name] = last.v; continue; }
      let i = 0;
      while (i < k.length - 2 && k[i + 1].y <= y) i++;
      const a = k[i], b = k[i + 1];
      const t = b.y > a.y ? (y - a.y) / (b.y - a.y) : 1;
      out[name] = a.v + (b.v - a.v) * b.ease(Math.max(0, Math.min(1, t)));
    }
    return out;
  }
}
