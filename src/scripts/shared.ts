// Small behaviours shared by the home run and the static pages.

/**
 * Muted looping videos play while they are on screen. Under reduced motion they get controls instead.
 * single: only the clip that is most in view plays, the others wait on their frame. The home run needs
 * it: with two or more videos playing, Chromium halves the frame rate of the whole page (measured:
 * 60 frames a second with one clip, 37 with two, 30 with three), and the world behind them stutters.
 */
export function autoplayVideos(root: ParentNode = document, opts: { single?: boolean } = {}) {
  const vids = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-autoplay]'));
  if (!vids.length) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) {
    vids.forEach((v) => { v.controls = true; });
    return;
  }
  if (!opts.single) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
        else v.pause();
      }
    }, { threshold: 0.25 });
    vids.forEach((v) => io.observe(v));
    return;
  }
  const seen = new Map<HTMLVideoElement, number>(); // share of each clip that is on screen
  let current: HTMLVideoElement | null = null;
  let hovered: HTMLVideoElement | null = null;
  const pick = () => {
    let best: HTMLVideoElement | null = null, score = 0.3;
    for (const [v, r] of seen) {
      // the clip under the pointer wins; the one playing keeps its place unless another is clearly more in view
      const s = r + (v === hovered && r > 0.2 ? 1 : 0) + (v === current ? 0.15 : 0);
      if (s > score) { best = v; score = s; }
    }
    if (best === current) return;
    current?.pause();
    current = best;
    best?.play().catch(() => { best!.controls = true; });
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) seen.set(e.target as HTMLVideoElement, e.isIntersecting ? e.intersectionRatio : 0);
    pick();
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
  vids.forEach((v) => {
    io.observe(v);
    const card = v.closest<HTMLElement>('.labcard') ?? v;
    card.addEventListener('pointerenter', () => { hovered = v; pick(); });
    card.addEventListener('pointerleave', () => { if (hovered === v) hovered = null; pick(); });
  });
}

/**
 * Shared-element transition towards a case study (cross-document view transitions, where the
 * browser supports them): the title the visitor is looking at takes the name of the page title.
 */
export function nameCaseTitleOnClick() {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-case]');
    if (!a) return;
    document.querySelectorAll<HTMLElement>('[style*="view-transition-name: case-title"]').forEach((el) => { el.style.viewTransitionName = ''; });
    const scope = a.closest<HTMLElement>('[data-case-scope]');
    const title = scope?.querySelector<HTMLElement>('[data-case-title]');
    const visible = (el: HTMLElement | null | undefined) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
    const target = visible(title) ? title! : a;
    target.style.viewTransitionName = 'case-title';
  }, { capture: true });
}
