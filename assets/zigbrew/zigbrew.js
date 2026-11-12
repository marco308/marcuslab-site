/* zigbrew build logs: what both pages share.
   The Section A-A mark, the loader (copied from the landing page and played faster), and the ways things arrive:
   photos are uncovered, diagrams are drawn stroke by stroke, headings are set letter by letter.
   If GSAP is missing or motion is off, the "anim" class is removed and the page is a plain article. */
(function () {
  'use strict';
  const root = document.documentElement;
  const ZB = window.ZB = { anim: false, narrow: matchMedia('(max-width: 899px)').matches, lenis: null };

  /* ---------- the mark ---------- */
  const BIGM = '12,16 21.5,16 32,31 42.5,16 52,16 52,48 43.5,48 43.5,30.5 32,46.5 20.5,30.5 20.5,48 12,48';
  document.querySelectorAll('[data-mark]').forEach((el, n) => {
    const [fg, line] = el.dataset.mark.split(','), id = 'mk' + n;
    el.innerHTML = `<svg viewBox="6 6 52 52" style="display:block;width:100%;height:auto" aria-hidden="true">
      <defs><clipPath id="${id}l"><rect x="0" y="0" width="32" height="64"/></clipPath><clipPath id="${id}r"><rect x="32" y="0" width="32" height="64"/></clipPath>
      <pattern id="${id}h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45 32 32)"><path d="M0 0 V6" stroke="${fg}" stroke-width="2.3"/></pattern></defs>
      <polygon points="${BIGM}" fill="${fg}" clip-path="url(#${id}l)"/><polygon points="${BIGM}" fill="url(#${id}h)" clip-path="url(#${id}r)"/>
      <polygon points="${BIGM}" fill="none" stroke="${fg}" stroke-width="2.6"/>
      <path d="M32 8 V56" stroke="${line}" stroke-width="2" stroke-dasharray="9 2.5 2 2.5" fill="none"/></svg>`;
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
  const M = 'M12 48 V16 H21.5 L32 31 L42.5 16 H52 V48 H43.5 V30.5 L32 46.5 L20.5 30.5 V48 Z';
  const loaderSvg = cap => `<svg viewBox="0 0 64 90" fill="none">
    <defs>
      <clipPath id="ldm"><path d="${M}"/></clipPath>
      <clipPath id="ldl"><rect x="0" y="0" width="32" height="64"/></clipPath>
      <clipPath id="ldr"><rect x="32" y="0" width="32" height="64"/></clipPath>
      <clipPath id="ldw"><rect class="l-wipe" x="10" y="48" width="24" height="0"/></clipPath>
      <clipPath id="ldc"><rect class="l-linewipe" x="29" y="3" width="6" height="0"/></clipPath>
      <clipPath id="ldt"><rect class="l-rulewipe" x="13" y="72" width="0" height="8"/></clipPath>
      <clipPath id="ldn"><rect class="l-countwipe" x="4" y="81" width="0" height="5"/></clipPath>
    </defs>
    <g class="l-guides" stroke="#ffedd7" stroke-opacity=".45" stroke-width=".3"><path class="dr" d="M32 16 H3"/><path class="dr" d="M32 16 H61"/><path class="dr" d="M32 48 H3"/><path class="dr" d="M32 48 H61"/><path class="dr" d="M12 32 V7"/><path class="dr" d="M12 32 V57"/><path class="dr" d="M52 32 V7"/><path class="dr" d="M52 32 V57"/></g>
    <g clip-path="url(#ldl)"><g clip-path="url(#ldw)"><path d="${M}" fill="#ffedd7"/></g></g>
    <g clip-path="url(#ldr)"><g clip-path="url(#ldm)" class="ld-hatch" stroke="#ffedd7" stroke-width="1.5" stroke-linecap="round"></g></g>
    <path class="l-out dr" d="${M}" stroke="#ffedd7" stroke-width="1.6" stroke-linejoin="miter"/>
    <circle class="l-pen" r="1.1" fill="#e8590c"/>
    <g clip-path="url(#ldc)"><path d="M32 4 V60" stroke="#e8590c" stroke-width="1.1" stroke-dasharray="8 2 1.6 2"/></g>
    <g class="l-arrows" stroke="#e8590c" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path class="dr" d="M32 4 H42 M39.5 1.8 L42.4 4 L39.5 6.2"/><path class="dr" d="M32 60 H42 M39.5 57.8 L42.4 60 L39.5 62.2"/></g>
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
    document.querySelectorAll('.ld-hatch').forEach(h => { for (let k = -30; k <= 30; k += 4.4) h.insertAdjacentHTML('beforeend', `<path class="dr" d="M${k} 64 L${k + 64} 0"/>`); });
    document.querySelectorAll('#loader .dr').forEach(el => { const n = el.getTotalLength(); el.style.strokeDasharray = n; el.style.strokeDashoffset = n; el._len = n; });
    const outlines = [...document.querySelectorAll('.l-out')], pens = [...document.querySelectorAll('.l-pen')];
    const pen = { t: 0 };
    const movePen = () => outlines.forEach((o, i) => { const pt = o.getPointAtLength(o._len * pen.t); pens[i].setAttribute('cx', pt.x); pens[i].setAttribute('cy', pt.y); });
    movePen(); gsap.set(pens, { opacity: 0 });
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
      .to('.l-bar', { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' }, 1.1)
      .to('.l-wipe', { attr: { y: 14, height: 36 }, duration: 1.3, ease: 'power2.inOut' }, 1.6)
      .to('.ld-hatch .dr', { strokeDashoffset: 0, duration: .9, stagger: .045, ease: 'sine.out' }, 1.8)
      .to(pens, { opacity: 0, duration: .35 }, 2.15)
      .to('.l-linewipe', { attr: { height: 58 }, duration: 1.1, ease: 'power1.inOut' }, 2.5)
      .to('.l-arrows .dr', { strokeDashoffset: 0, duration: .6, stagger: .12 }, 3.2)
      .to('.l-guides', { opacity: 0, duration: .9 }, 3.1)
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
