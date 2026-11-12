/* zigbrew build logs: what both pages share.
   The Section A-A mark, the loader (copied from the landing page and played faster), and the ways things arrive:
   photos are uncovered, diagrams are drawn stroke by stroke, headings are set letter by letter.
   If GSAP is missing or motion is off, the "anim" class is removed and the page is a plain article. */
(function () {
  'use strict';
  const root = document.documentElement;
  const ZB = window.ZB = { anim: false, narrow: matchMedia('(max-width: 899px)').matches, lenis: null };

  /* ---------- the mark ---------- */
  const BIGM = '12,16 21,16 32,31 43,16 52,16 52,48 43,48 43,30.5 32,45.5 21,30.5 21,48 12,48';
  // hatching that falls to the right, 5.2 apart, placed as in brand/tokens (logo.hatch-offset)
  const HATCH = (() => { const step = 5.2 * Math.SQRT2; let d = ''; for (let x = 36.68 - 14 * step; x < 64; x += step) d += `M${x.toFixed(2)} 0 l64 64`; return d; })();
  document.querySelectorAll('[data-mark]').forEach((el, n) => {
    const [fg, line] = el.dataset.mark.split(','), id = 'mk' + n;
    el.innerHTML = `<svg viewBox="6 6 52 52" style="display:block;width:100%;height:auto" aria-hidden="true">
      <defs><clipPath id="${id}l"><rect x="0" y="0" width="32" height="64"/></clipPath><clipPath id="${id}r"><rect x="32" y="0" width="32" height="64"/></clipPath>
      <clipPath id="${id}o"><polygon points="${BIGM}"/></clipPath></defs>
      <polygon points="${BIGM}" fill="${fg}" clip-path="url(#${id}l)"/>
      <g clip-path="url(#${id}r)"><path d="${HATCH}" clip-path="url(#${id}o)" fill="none" stroke="${fg}" stroke-width="1.9"/></g>
      <polygon points="${BIGM}" fill="none" stroke="${fg}" stroke-width="2.6"/>
      <path d="M32 10 V54" stroke="${line}" stroke-width="2" stroke-dasharray="10 2.5 2 2.5" fill="none"/></svg>`;
  });

  const plain = () => { root.classList.remove('anim'); ZB.anim = false; };
  if (!root.classList.contains('anim')) { ZB.start = () => Promise.resolve(false); return; }
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) { plain(); ZB.start = () => Promise.resolve(false); return; }
  ZB.anim = true;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'power3.out' });

  if (window.Lenis && !ZB.narrow) {
    const lenis = ZB.lenis = new Lenis({ autoRaf: false, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- loader ---------- */
  const M = 'M12 48 V16 H21 L32 31 L43 16 H52 V48 H43 V30.5 L32 45.5 L21 30.5 V48 Z';
  const loaderSvg = cap => `<svg viewBox="0 0 64 90" fill="none">
    <defs>
      <clipPath id="ldm"><path d="${M}"/></clipPath>
      <clipPath id="ldl"><rect x="0" y="0" width="32" height="64"/></clipPath>
      <clipPath id="ldr"><rect x="32" y="0" width="32" height="64"/></clipPath>
      <clipPath id="ldw"><rect class="l-wipe" x="10" y="48" width="44" height="0"/></clipPath>
      <clipPath id="ldx"><rect class="l-cutwipe" x="32" y="3" width="32" height="64"/></clipPath>
      <clipPath id="ldc"><rect class="l-linewipe" x="29" y="3" width="6" height="0"/></clipPath>
      <clipPath id="ldt"><rect class="l-rulewipe" x="13" y="72" width="0" height="8"/></clipPath>
      <clipPath id="ldn"><rect class="l-countwipe" x="4" y="81" width="0" height="5"/></clipPath>
    </defs>
    <g class="l-guides" stroke="#ffedd7" stroke-opacity=".45" stroke-width=".3"><path class="dr" d="M32 16 H3"/><path class="dr" d="M32 16 H61"/><path class="dr" d="M32 48 H3"/><path class="dr" d="M32 48 H61"/><path class="dr" d="M12 32 V7"/><path class="dr" d="M12 32 V57"/><path class="dr" d="M52 32 V7"/><path class="dr" d="M52 32 V57"/></g>
    <g clip-path="url(#ldw)"><g clip-path="url(#ldl)"><path d="${M}" fill="#ffedd7"/></g><g clip-path="url(#ldr)"><g clip-path="url(#ldx)"><path d="${M}" fill="#ffedd7"/></g></g></g>
    <g clip-path="url(#ldr)"><g clip-path="url(#ldm)" class="ld-hatch" stroke="#ffedd7" stroke-width="1.9"></g></g>
    <path class="l-out dr" d="M12 32 V16 H21 L32 31 L43 16 H52 V48 H43 V30.5 L32 45.5 L21 30.5 V48 H12 Z" stroke="#ffedd7" stroke-width="2.6" stroke-linejoin="miter"/>
    <circle class="l-pen" r="1.1" fill="#e8590c"/>
    <g clip-path="url(#ldc)"><path d="M32 4 V60" stroke="#e8590c" stroke-width="2" stroke-dasharray="14 2.5 2 2.5"/></g>
    <g class="l-arrows" opacity="0" stroke="#e8590c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path class="dr" d="M32 4 H42"/><path class="dr" d="M39.4 1.7 L42.5 4 L39.4 6.3"/><path class="dr" d="M32 60 H42"/><path class="dr" d="M39.4 57.7 L42.5 60 L39.4 62.3"/></g>
    <text class="l-cap" x="32.9" y="69.4" text-anchor="middle" font-family="Outfit, system-ui, sans-serif" font-weight="700" font-size="4.3" letter-spacing="1.7" fill="#ffedd7" fill-opacity="0" stroke="#ffedd7" stroke-width=".22" stroke-dasharray="26" stroke-dashoffset="26">MARCUS LAB</text>
    <g class="l-foot">
      <g clip-path="url(#ldt)"><path d="M14 77 H50" stroke="#ffedd7" stroke-opacity=".7" stroke-width=".25"/><path d="M14 77 v-2.6 M17 77 v-1.3 M20 77 v-1.3 M23 77 v-2.6 M26 77 v-1.3 M29 77 v-1.3 M32 77 v-2.6 M35 77 v-1.3 M38 77 v-1.3 M41 77 v-2.6 M44 77 v-1.3 M47 77 v-1.3 M50 77 v-2.6" stroke="#ffedd7" stroke-opacity=".7" stroke-width=".25"/></g>
      <path class="l-bar" d="M14 78.5 H50" stroke="#e8590c" stroke-width=".9" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
      <text class="l-count" x="32" y="84.4" text-anchor="middle" font-family="DM Mono, ui-monospace, monospace" font-size="2" letter-spacing=".34" fill="#ffedd7" fill-opacity=".8" clip-path="url(#ldn)">${cap}</text>
    </g></svg>`;

  /* opts.caption: the line under the scale. Returns a promise that resolves once the two halves have parted. */
  ZB.start = (opts = {}) => new Promise(done => {
    if (document.documentElement.classList.contains('seen')) {      // not the first page of this visit: no loader, straight in
      Promise.resolve(opts.wait).then(v => { if (opts.before) opts.before(v); if (ZB.lenis) ZB.lenis.start(); done(v); });
      return;
    }
    document.querySelectorAll('#loader .lc').forEach(lc => { lc.innerHTML = loaderSvg(opts.caption || ''); });
    // hatching: the logo's own lines (5.2 apart, placed by logo.hatch-offset), each cut to the part that crosses the right half of the M
    const MP = [[12,16],[21,16],[32,31],[43,16],[52,16],[52,48],[43,48],[43,30.5],[32,45.5],[21,30.5],[21,48],[12,48]], hatchSegs = [];
    for (let k = 36.68, step = 5.2 * Math.SQRT2; k > -18; k -= step) {
      const xs = [];
      MP.forEach(([x1, y1], i) => { const [x2, y2] = MP[(i + 1) % MP.length], t = (k - x1 + y1) / ((x2 - x1) - (y2 - y1)); if (t >= 0 && t < 1) xs.push(x1 + t * (x2 - x1)); });
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.max(xs[i], 32), b = xs[i + 1]; if (b - a > .4) hatchSegs.push([a - 1, a - 1 - k, b + 1, b + 1 - k, a - k]); }
    }
    document.querySelectorAll('.ld-hatch').forEach(g => hatchSegs.forEach(([x1, y1, x2, y2, top]) => { g.insertAdjacentHTML('beforeend', `<path class="dr" d="M${x1} ${y1} L${x2} ${y2}"/>`); g.lastChild._top = top; }));
    document.querySelectorAll('#loader .dr').forEach(el => { const n = el.getTotalLength(); el.style.strokeDasharray = n; el.style.strokeDashoffset = n; el._len = n; });
    const outlines = [...document.querySelectorAll('.l-out')], pens = [...document.querySelectorAll('.l-pen')];
    const pen = { t: 0 };
    const movePen = () => outlines.forEach((o, i) => { const pt = o.getPointAtLength(o._len * pen.t); pens[i].setAttribute('cx', pt.x); pens[i].setAttribute('cy', pt.y); });
    movePen(); gsap.set(pens, { opacity: 0 });
    // the cut: as the centre line comes down, the solid right half is taken away above its tip and the hatching is ruled in behind it
    const cut = { y: 3 };
    const showCut = () => {
      document.querySelectorAll('.l-linewipe').forEach(r => r.setAttribute('height', cut.y - 3));
      document.querySelectorAll('.l-cutwipe').forEach(r => r.setAttribute('y', cut.y));
      document.querySelectorAll('.ld-hatch .dr').forEach(h => { const p = Math.min(1, Math.max(0, (cut.y - h._top) / 9)); h.style.strokeDashoffset = h._len * (1 - p * p * (3 - 2 * p)); });
    };
    const flow = 'sine.inOut';
    const draw = gsap.timeline({ defaults: { ease: flow } })
      .to('.l-guides .dr', { strokeDashoffset: 0, duration: 1.1, stagger: .05 }, 0)
      .to(pens, { opacity: 1, duration: .25 }, .25)
      .to('.l-out', { strokeDashoffset: 0, duration: 1.9, ease: 'power1.inOut' }, .3)
      .to(pen, { t: 1, duration: 1.9, ease: 'power1.inOut', onUpdate: movePen }, .3)
      .to('.l-cap', { strokeDashoffset: 0, duration: 1.6 }, .7)
      .to('.l-cap', { fillOpacity: 1, duration: .8 }, 1.7)
      .to('.l-rulewipe', { attr: { width: 38 }, duration: 1.3 }, .9)
      .to('.l-countwipe', { attr: { width: 56 }, duration: 1.3 }, 1.2)
      .to({ v: 1 }, { v: 0, duration: 2.2, ease: 'power1.inOut', onUpdate() { const v = this.targets()[0].v; document.querySelectorAll('.l-bar').forEach(b => { b.style.strokeDashoffset = v; }); } }, 1.1)   // set directly: GSAP rounds this to whole pixels, and the bar is one unit long
      .to('.l-wipe', { attr: { y: 14, height: 36 }, duration: 1.3, ease: 'power2.inOut' }, 1.6)
      .to(pens, { opacity: 0, duration: .35 }, 2.15)
      .to(cut, { y: 61, duration: 1.35, ease: 'power1.inOut', onUpdate: showCut }, 2.6)
      .set('.l-arrows', { opacity: 1 }, 3.6)
      .to('.l-arrows .dr', { strokeDashoffset: 0, duration: .45, stagger: .1 }, 3.6)
      .to('.l-guides', { opacity: 0, duration: .9 }, 3.4)
      .to({}, { duration: .3 });
    draw.timeScale(1.9);                       // inner pages: the same drawing in about half the time
    // opts.wait: something that must be ready before the screen opens (the 3D parts). opts.before runs while still covered.
    draw.eventCallback('onComplete', () => Promise.resolve(opts.wait).then(v => {
      if (opts.before) opts.before(v);
      gsap.timeline({ onComplete: () => { document.getElementById('loader').style.display = 'none'; try { sessionStorage.setItem('ml-seen', '1'); } catch (e) {} } })
        .to('.l-foot', { opacity: 0, duration: .3, ease: 'sine.inOut' }, 0)
        .to('.l-seam', { scaleY: 1, duration: .45, ease: 'power2.inOut' }, 0)
        .to('.lh.l', { xPercent: -101, duration: 1.0, ease: 'expo.inOut' }, .3)
        .to('.lh.r', { xPercent: 101, duration: 1.0, ease: 'expo.inOut' }, .3)
        .to('.l-seam', { opacity: 0, duration: .4, ease: 'sine.out' }, .8)
        .add(() => { if (ZB.lenis) ZB.lenis.start(); done(v); }, .55);
    }));
  });

  /* ---------- drawing an inline SVG ----------
     Stroked shapes are drawn along their own length, in document order. Dashed strokes and filled shapes are
     wiped or grown instead (a dash pattern can't also be the pen). Text is set after the lines it labels. */
  const GEOM = 'path,line,polyline,polygon,rect,circle,ellipse';
  ZB.prepDraw = svg => {
    const strokes = [], others = [], texts = [...svg.querySelectorAll('text')];
    svg.querySelectorAll(GEOM).forEach(el => {
      if (el.closest('defs,marker,clipPath,[data-nodraw]')) return;
      const cs = getComputedStyle(el), hasStroke = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0, dashed = cs.strokeDasharray && cs.strokeDasharray !== 'none';
      let len = 0; try { len = el.getTotalLength(); } catch (e) {}
      if (hasStroke && !dashed && len > 0) {
        el._len = len; el._fill = cs.fill !== 'none' && cs.fillOpacity !== '0';
        gsap.set(el, { strokeDasharray: len + 1, strokeDashoffset: len + 1 }); if (el._fill) gsap.set(el, { fillOpacity: 0 });
        strokes.push(el);
      } else others.push(el);
    });
    // text and filled shapes are uncovered left to right by one clip, the way the loader's scale is ruled in
    const vb = svg.viewBox.baseVal, id = 'zw' + (ZB._n = (ZB._n || 0) + 1);
    const cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'); cp.id = id; cp.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', vb.x - 10); r.setAttribute('y', vb.y - 10); r.setAttribute('height', vb.height + 20); r.setAttribute('width', 0);
    cp.appendChild(r); svg.appendChild(cp);
    const wiped = [...texts, ...others]; wiped.forEach(el => el.setAttribute('clip-path', `url(#${id})`));
    svg._zb = { strokes, wiped, rect: r, full: vb.width + 20 };
  };
  ZB.playDraw = (svg, speed = 1) => {
    const d = svg._zb; if (!d) return gsap.timeline();
    const n = Math.max(1, d.strokes.length), per = Math.min(.09, 1.5 / n);
    const tl = gsap.timeline();
    d.strokes.forEach((el, i) => {
      const dur = gsap.utils.clamp(.45, 1.1, el._len / 520) / speed;
      tl.to(el, { strokeDashoffset: 0, duration: dur, ease: 'sine.inOut' }, i * per / speed);
      if (el._fill) tl.to(el, { fillOpacity: 1, duration: .45, ease: 'sine.inOut' }, i * per / speed + dur * .6);
    });
    tl.to(d.rect, { attr: { width: d.full }, duration: 1.5 / speed, ease: 'sine.inOut' }, .3 / speed);
    tl.add(() => { d.strokes.forEach(el => { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; }); d.wiped.forEach(el => el.removeAttribute('clip-path')); });
    return tl;
  };

  /* the WireViz harness drawings: fetched, put inline, then boxes slide in left to right and each wire is run between them */
  function inlineHarness(img) {
    return fetch(img.getAttribute('src')).then(r => r.text()).then(txt => {
      const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
      if (svg.nodeName !== 'svg') throw new Error('not svg');
      const vb = svg.viewBox.baseVal; svg.removeAttribute('width'); svg.removeAttribute('height');
      svg.style.aspectRatio = vb.width + ' / ' + vb.height;
      svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', img.alt);
      img.replaceWith(svg);
      const nodes = [...svg.querySelectorAll('g.node')].map(g => ({ g, x: g.getBBox().x })).sort((a, b) => a.x - b.x).map(o => o.g);
      const wires = [...svg.querySelectorAll('g.edge')].map(g => ({ g, x: g.getBBox().x })).sort((a, b) => a.x - b.x).map(o => [...o.g.querySelectorAll('path')]);
      gsap.set(nodes, { clipPath: 'inset(0 0 100% 0)', y: 26 });
      wires.flat().forEach(p => { const n = p.getTotalLength(); p._len = n; gsap.set(p, { strokeDasharray: n + 1, strokeDashoffset: n + 1 }); });
      ScrollTrigger.create({ trigger: svg, start: 'top 82%', once: true, onEnter: () => {
        const tl = gsap.timeline();
        tl.to(nodes, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .7, stagger: .07, ease: 'power3.out' }, 0);
        const step = Math.min(.16, 2.2 / wires.length);
        wires.forEach((ps, i) => tl.to(ps, { strokeDashoffset: 0, duration: .9, ease: 'sine.inOut' }, .35 + i * step));
      } });
    }).catch(() => {});      // on any failure the <img> stays, which is the plain version anyway
  }

  /* ---------- everything on the page that moves in ----------
     Entrances are wipes and moves, never fades: a block is uncovered by a clip while it travels into place. */
  const HID = { up: 'inset(0 0 100% 0)', left: 'inset(0 100% 0 0)' }, SHOWN = 'inset(0 0% 0% 0)';
  const wipe = (els, o = {}) => {
    els = gsap.utils.toArray(els); if (!els.length) return;
    gsap.set(els, { clipPath: HID[o.dir || 'up'], x: o.x || 0, y: o.y == null ? 20 : o.y });
    ScrollTrigger.create({ trigger: o.trigger || els[0], start: o.start || 'top 90%', once: true, onEnter: () =>
      gsap.to(els, { clipPath: SHOWN, x: 0, y: 0, duration: o.duration || .8, stagger: o.stagger || .06, delay: o.delay || 0, ease: 'power3.out', clearProps: 'clipPath,transform' }) });
  };
  ZB.wipe = wipe;
  ZB.wire = () => { const go = () => wireNow(); (document.fonts && document.fonts.ready ? document.fonts.ready.then(go, go) : go()); };
  const wireNow = () => {
    // progress: the centre line runs along the bottom of the nav
    const bar = document.querySelector('.progress');
    if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 } });

    // headings: each letter rises out of its own mask
    document.querySelectorAll('.col h2').forEach(h => {
      const s = SplitText.create(h, { type: 'words,chars', mask: 'chars' });
      gsap.from(s.chars, { yPercent: 105, stagger: .018, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    });
    // the eyebrow's rule is ruled out from the label
    document.querySelectorAll('.eyebrow').forEach(e => wipe(e, { dir: 'left', y: 0, duration: .9, start: 'top 92%' }));

    // prose and blocks
    document.querySelectorAll('.col > p, .col > ul, .note, .turn, .small').forEach(el => wipe(el, { start: 'top 93%' }));

    // photos: the mat slides off and the picture settles
    document.querySelectorAll('.ph').forEach((ph, i) => {
      const img = ph.querySelector('img'); if (!img) return;
      let cover = ph.querySelector('.cover'); if (!cover) { cover = document.createElement('div'); cover.className = 'cover'; ph.appendChild(cover); }
      const dir = i % 2 ? -1 : 1;
      if (dir < 0) { cover.style.borderLeft = '0'; cover.style.borderRight = '2px solid var(--orange)'; }
      gsap.set(img, { scale: 1.16, xPercent: -4 * dir, transformOrigin: '50% 50%' });
      const cap = ph.parentElement.querySelector('figcaption');
      if (cap) gsap.set(cap, { clipPath: HID.left });
      const play = () => {
        gsap.to(cover, { xPercent: 102 * dir, duration: 1.0, ease: 'power3.inOut' });
        gsap.to(img, { scale: 1, xPercent: 0, duration: 1.4, ease: 'power3.out', delay: .1 });
        if (cap) gsap.to(cap, { clipPath: SHOWN, duration: .9, ease: 'sine.inOut', delay: .45, clearProps: 'clipPath' });
      };
      if (ph.closest('.print, [data-hold]')) { (ZB.held = ZB.held || []).push(play); return; }     // the hero photo waits for the loader
      ScrollTrigger.create({ trigger: ph, start: 'top 86%', once: true, onEnter: play });
    });

    // tables, steps and notes arrive row by row
    document.querySelectorAll('.tbl, .steps, .gnotes, .stats, .legend').forEach(t => {
      const rows = t.matches('.tbl') ? t.querySelectorAll('tr') : t.children;
      wipe(rows, { dir: 'left', x: 26, y: 0, trigger: t, start: 'top 88%', stagger: .055, duration: .7 });
    });
    // measured numbers count up to their value
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), dp = (el.dataset.count.split('.')[1] || '').length, o = { v: 0 };
      el.textContent = (0).toFixed(dp);
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toFixed(dp); } }) });
    });

    // diagrams drawn in SVG
    document.querySelectorAll('svg[data-draw]').forEach(svg => {
      ZB.prepDraw(svg);
      ScrollTrigger.create({ trigger: svg, start: 'top 80%', once: true, onEnter: () => { const tl = ZB.playDraw(svg); if (svg._after) tl.add(svg._after); } });
    });
    // node chains: each box is uncovered as it moves in, then its link is drawn to the next
    const isVert = ch => getComputedStyle(ch).flexDirection === 'column';
    document.querySelectorAll('.chain[data-chain]').forEach(ch => {
      const nodes = ch.querySelectorAll(':scope > .node'), links = ch.querySelectorAll('.link i'), ems = ch.querySelectorAll('.link em'), spurs = ch.querySelectorAll('.spur');
      const vert = isVert(ch);
      gsap.set(nodes, { clipPath: vert ? HID.up : HID.left, y: vert ? 14 : 0, x: vert ? 0 : -18 }); gsap.set(links, vert ? { scaleY: 0 } : { scaleX: 0 }); if (ems.length) gsap.set(ems, { clipPath: HID.left });
      ScrollTrigger.create({ trigger: ch, start: 'top 82%', once: true, onEnter: () => {
        const tl = gsap.timeline();
        nodes.forEach((n, i) => { tl.to(n, { clipPath: SHOWN, x: 0, y: 0, duration: .55, clearProps: 'clipPath,transform' }, i * .22); if (links[i]) tl.to(links[i], vert ? { scaleY: 1, duration: .35, ease: 'sine.inOut' } : { scaleX: 1, duration: .35, ease: 'sine.inOut' }, i * .22 + .2); });
        if (ems.length) tl.to(ems, { clipPath: SHOWN, duration: .5, stagger: .06, ease: 'sine.inOut' }, .5);
        if (spurs.length) tl.from(spurs, { clipPath: HID.up, duration: .6, ease: 'sine.inOut', clearProps: 'clipPath' }, '>-.2');
        if (ch._after) tl.add(ch._after);
      } });
    });
    document.querySelectorAll('.branch, .loopback, .led, .chain-note, .ctrl, .cap-note, .tb, .wk-wrap, .tl').forEach(el => wipe(el, { dir: 'left', y: 0, duration: .9, start: 'top 92%' }));

    // logs type themselves out, a line at a time
    document.querySelectorAll('pre[data-type]').forEach(pre => {
      const lines = pre.innerHTML.split('\n'); pre.style.minHeight = pre.offsetHeight + 'px'; pre.innerHTML = '';
      ScrollTrigger.create({ trigger: pre, start: 'top 85%', once: true, onEnter: () => {
        let i = 0; (function tick() { if (i >= lines.length) return; pre.innerHTML += (i ? '\n' : '') + lines[i]; const slow = /PRESS|state=<span class="on"/.test(lines[i]); i++; gsap.delayedCall(slow ? .7 : .32, tick); })();
      } });
    });

    document.querySelectorAll('img[data-inline]').forEach(inlineHarness);
    window.addEventListener('load', () => ScrollTrigger.refresh());
  };

  /* a pulse travelling along a chain's links, one after another */
  ZB.pulse = (chain, dur = .28) => {
    if (!ZB.anim) return;
    const vert = getComputedStyle(chain).flexDirection === 'column';
    chain.querySelectorAll('.link').forEach((l, i) => {
      const u = l.querySelector('u'); if (!u) return;
      const span = (vert ? l.offsetHeight : l.offsetWidth) - 14;
      gsap.fromTo(u, { opacity: 1, x: 0, y: 0 }, { [vert ? 'y' : 'x']: span, duration: dur, delay: i * dur, ease: 'none', onComplete: () => gsap.set(u, { opacity: 0 }) });
    });
  };
})();
