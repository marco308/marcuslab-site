/* Marcus Lab write-ups: the little that every page shares.
   - draws the Section A–A mark into [data-mark="fg,line"]
   - video.auto plays muted on a loop; video.loop plays only while it is on screen; with reduced motion both wait for a press
   Nothing on a write-up is revealed, drawn in or moved on scroll. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const BIGM = '12,16 21,16 32,31 43,16 52,16 52,48 43,48 43,30.5 32,45.5 21,30.5 21,48 12,48';
  const HATCH = (() => { const step = 5.2 * Math.SQRT2; let d = ''; for (let x = 36.68 - 14 * step; x < 64; x += step) d += `M${x.toFixed(2)} 0 l64 64`; return d; })();
  document.querySelectorAll('[data-mark]').forEach((el, n) => {
    const [fg, line] = el.dataset.mark.split(','), id = 'wm' + n;
    el.innerHTML = `<svg viewBox="6 6 52 52" style="display:block;width:100%;height:auto" aria-hidden="true">
      <defs><clipPath id="${id}l"><rect x="0" y="0" width="32" height="64"/></clipPath><clipPath id="${id}r"><rect x="32" y="0" width="32" height="64"/></clipPath>
      <clipPath id="${id}o"><polygon points="${BIGM}"/></clipPath></defs>
      <polygon points="${BIGM}" fill="${fg}" clip-path="url(#${id}l)"/>
      <g clip-path="url(#${id}r)"><path d="${HATCH}" clip-path="url(#${id}o)" fill="none" stroke="${fg}" stroke-width="1.9"/></g>
      <polygon points="${BIGM}" fill="none" stroke="${fg}" stroke-width="2.6"/>
      <path d="M32 10 V54" stroke="${line}" stroke-width="2" stroke-dasharray="10 2.5 2 2.5" fill="none"/></svg>`;
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const manual = v => { v.pause(); v.removeAttribute('autoplay'); v.controls = true; v.removeAttribute('aria-hidden'); };
  document.querySelectorAll('video.auto').forEach(v => { if (reduce) manual(v); });
  document.querySelectorAll('video.loop').forEach(v => {
    if (reduce) return manual(v);
    new IntersectionObserver(es => es[0].isIntersecting ? v.play().catch(() => {}) : v.pause(), { threshold: .25 }).observe(v);
  });
})();
