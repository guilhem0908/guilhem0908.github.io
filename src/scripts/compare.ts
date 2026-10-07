// Before / after frame (components/Compare.astro): two stills in one frame, a divider you can drag
// and a range input for the keyboard.

export interface CompareHandle {
  el: HTMLElement;
  /** move the divider (0..100, percent from the left) without it counting as the visitor's choice */
  set: (v: number) => void;
  /** the visitor has moved the divider: whoever drives it from outside should stop */
  touched: boolean;
}

export function initCompare(root: ParentNode = document): CompareHandle[] {
  const out: CompareHandle[] = [];
  root.querySelectorAll<HTMLElement>('[data-compare]').forEach((el) => {
    if (el.classList.contains('is-live')) return;
    const frame = el.querySelector<HTMLElement>('.cmp__frame')!;
    const range = el.querySelector<HTMLInputElement>('.cmp__range')!;
    el.classList.add('is-live');

    let last = -1;
    const set = (v: number) => {
      const p = Math.round(Math.max(0, Math.min(100, v)) * 10) / 10;
      if (p === last) return;
      last = p;
      el.style.setProperty('--pos', `${p}%`);
      if (Math.abs(parseFloat(range.value) - p) > 0.25) range.value = String(p);
    };
    const handle: CompareHandle = { el, set, touched: false };
    set(parseFloat(range.value));
    range.addEventListener('input', () => { handle.touched = true; set(parseFloat(range.value)); });

    let drag = false;
    const at = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      handle.touched = true;
      set(((e.clientX - r.left) / r.width) * 100);
    };
    frame.addEventListener('pointerdown', (e) => { drag = true; frame.setPointerCapture(e.pointerId); at(e); });
    frame.addEventListener('pointermove', (e) => { if (drag) at(e); });
    const end = () => { drag = false; };
    frame.addEventListener('pointerup', end);
    frame.addEventListener('pointercancel', end);
    out.push(handle);
  });
  return out;
}
