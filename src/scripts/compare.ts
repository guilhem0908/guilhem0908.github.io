// Before / after frame (components/Compare.astro): a divider you can drag, a range input for
// the keyboard, and a button that swaps the two stills for the real side-by-side video.

export function initCompare(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-compare]').forEach((el) => {
    if (el.classList.contains('is-live')) return;
    const frame = el.querySelector<HTMLElement>('.cmp__frame')!;
    const range = el.querySelector<HTMLInputElement>('.cmp__range')!;
    const btn = el.querySelector<HTMLButtonElement>('.cmp__play');
    el.classList.add('is-live');

    const set = (v: number) => {
      const p = Math.max(0, Math.min(100, v));
      el.style.setProperty('--pos', `${p}%`);
      if (Math.abs(parseFloat(range.value) - p) > 0.25) range.value = String(p);
    };
    set(parseFloat(range.value));
    range.addEventListener('input', () => set(parseFloat(range.value)));

    let drag = false;
    const at = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    frame.addEventListener('pointerdown', (e) => { drag = true; frame.setPointerCapture(e.pointerId); at(e); });
    frame.addEventListener('pointermove', (e) => { if (drag) at(e); });
    const end = () => { drag = false; };
    frame.addEventListener('pointerup', end);
    frame.addEventListener('pointercancel', end);

    // the video: one file, shown twice (left half in the "before" layer, right half in the "after" layer)
    const mp4 = el.dataset.videoMp4, webm = el.dataset.videoWebm;
    if (!btn || !mp4) return;
    let vids: HTMLVideoElement[] = [];
    const make = (layer: string) => {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.setAttribute('aria-hidden', 'true');
      v.className = 'cmp__video';
      if (webm) { const s = document.createElement('source'); s.src = webm; s.type = 'video/webm'; v.appendChild(s); }
      const s = document.createElement('source'); s.src = mp4; s.type = 'video/mp4'; v.appendChild(s);
      el.querySelector(layer)!.appendChild(v);
      return v;
    };
    const play = () => {
      if (!vids.length) {
        vids = [make('.cmp__layer--after'), make('.cmp__layer--before')];
        // keep the second copy on the clock of the first
        vids[0].addEventListener('timeupdate', () => {
          if (Math.abs(vids[1].currentTime - vids[0].currentTime) > 0.12) vids[1].currentTime = vids[0].currentTime;
        });
        vids[0].addEventListener('playing', () => el.classList.add('has-video'), { once: true });
      }
      vids.forEach((v) => v.play().catch(() => {}));
      btn.textContent = btn.dataset.pause || '';
      btn.setAttribute('aria-pressed', 'true');
    };
    const pause = () => {
      vids.forEach((v) => v.pause());
      btn.textContent = btn.dataset.play || '';
      btn.setAttribute('aria-pressed', 'false');
    };
    btn.addEventListener('click', () => (btn.getAttribute('aria-pressed') === 'true' ? pause() : play()));
    el.addEventListener('compare:play', play);
  });
}
