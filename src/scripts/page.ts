// Light script of the static pages (case studies, lab): no WebGL, no animation library.

import { initCompare } from './compare';
import { autoplayVideos, nameCaseTitleOnClick } from './shared';

const html = document.documentElement;
html.classList.add('js');

initCompare();
autoplayVideos();
nameCaseTitleOnClick();

// the "Video" button scrolls to the lead frame and starts the video there
document.querySelectorAll<HTMLAnchorElement>('a[data-play-target]').forEach((a) => {
  a.addEventListener('click', () => {
    document.getElementById(a.dataset.playTarget!)?.dispatchEvent(new CustomEvent('compare:play'));
  });
});

// blocks arrive once, when they enter the viewport (same curve as everything that arrives)
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
if (calm || !('IntersectionObserver' in window)) items.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  items.forEach((el) => io.observe(el));
}
