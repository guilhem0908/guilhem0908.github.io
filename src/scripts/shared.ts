// Small behaviours shared by the home run and the static pages.

/** Muted looping videos play while they are on screen. Under reduced motion they get controls instead. */
export function autoplayVideos(root: ParentNode = document) {
  const vids = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-autoplay]'));
  if (!vids.length) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) {
    vids.forEach((v) => { v.controls = true; });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
      else v.pause();
    }
  }, { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
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
