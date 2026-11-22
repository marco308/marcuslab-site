/* Drawer lights: the effects, one tab each, on a model of the strip and the twelve drawers.
   The maths follows the firmware's effects (src/drawer-lights-zigbee-c6.yaml and drawer_fx.h in the
   project repo): 21 pixels, 7 per column, day 70% warm white, night 15% red, a 400 ms sweep out from the
   column's middle, off 1 s after the last drawer shuts. Without JavaScript the plain list stays. */
(function () {
  const host = document.querySelector('[data-fx]'); if (!host) return;
  const list = host.querySelector('.gnotes');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  /* ---------- colours (0..1, brightness already applied) ---------- */
  const WARM = [1, .84, .63], RED = [1, 0, 0], AMBER = [1, 110 / 255, 0], BLACK = [0, 0, 0];
  const rgbw = (r, g, b, w) => [Math.min(1, r / 255 + w / 255 * WARM[0]), Math.min(1, g / 255 + w / 255 * WARM[1]), Math.min(1, b / 255 + w / 255 * WARM[2])];
  const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hsv = (h, s, v) => {            // ESPHSVColor: hue, saturation and value all 0..255
    h = (h % 256 + 256) % 256 / 256 * 6; s /= 255; v /= 255;
    const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
  };
  const GOLD = rgbw(255, 150, 20, 60), CWHITE = rgbw(0, 0, 0, 255), CGREEN = [0, 190 / 255, 0];

  /* ---------- the drawing ---------- */
  const wrap = document.createElement('div'); wrap.className = 'fx';
  wrap.innerHTML = '<div class="fx-tabs" role="tablist" aria-label="Light effects"></div>' +
    '<div class="fx-stage" role="tabpanel"><div class="fx-hud"><span class="l"></span><span class="r"></span></div>' +
    '<svg viewBox="0 0 640 244"></svg><div class="fx-bar"><i></i></div></div>' +
    '<div class="fx-under"><p class="fx-desc" aria-live="polite"></p><div class="fx-ctrl"></div></div>';
  list.after(wrap); list.style.display = 'none';
  const svg = wrap.querySelector('svg'), hudL = wrap.querySelector('.fx-hud .l'), hudR = wrap.querySelector('.fx-hud .r');
  const bar = wrap.querySelector('.fx-bar i'), desc = wrap.querySelector('.fx-desc'), ctrl = wrap.querySelector('.fx-ctrl'), tabs = wrap.querySelector('.fx-tabs');
  const defs = el('defs', {}, svg);
  const COLX = [55, 235, 415], ROWS = [[50, 40], [94, 40], [138, 40], [182, 58]];
  el('rect', { class: 'fx-top', x: 30, y: 16, width: 580, height: 16 }, svg);
  const blur = el('filter', { id: 'fxblur', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs); el('feGaussianBlur', { stdDeviation: 7 }, blur);
  const glowG = el('g', { filter: 'url(#fxblur)' }, svg), pxG = el('g', {}, svg), drG = el('g', {}, svg);
  const pix = [];
  for (let i = 0; i < 21; i++) {
    const x = COLX[(i / 7) | 0] + 4 + (i % 7) * 23.6;
    const g = el('linearGradient', { id: 'fxg' + i, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    const s0 = el('stop', { offset: 0, 'stop-color': '#000', 'stop-opacity': 0 }, g); el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': 0 }, g);
    el('rect', { x: x - 2, y: 36, width: 24, height: 160, fill: 'url(#fxg' + i + ')' }, glowG);
    pix.push({ r: el('rect', { class: 'fx-px', x, y: 33, width: 20, height: 5 }, pxG), s0 });
  }
  const drawers = [];
  for (let c = 0; c < 3; c++) ROWS.forEach(([y, h], r) => {
    const g = el('g', { class: 'fx-dr', role: 'button', tabindex: 0, 'aria-label': ['Left', 'Middle', 'Right'][c] + ' column, drawer ' + (r + 1) }, drG);
    el('rect', { x: COLX[c], y, width: 170, height: h }, g);
    el('text', { x: COLX[c] + 85, y: y + h / 2 + 5, 'text-anchor': 'middle' }, g).textContent = 'Open';
    const d = c * 4 + r;
    g.addEventListener('click', () => userDrawer(d));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); userDrawer(d); } });
    drawers.push(g);
  });

  /* ---------- the strip's own logic ---------- */
  const S = { t: 0, open: new Set(), show: null, auto: true, q: [] };
  const cols = [0, 1, 2].map(() => ({ on: false, since: 0, offAt: null, fadeAt: null, color: WARM, level: .7, nudge: false }));
  let M = null;                                   // the current tab's mode
  const at = (dt, fn) => S.q.push({ at: S.t + dt, fn });
  function reset() {                             // lights and drawers only; the autoplay queue is left alone
    S.open.clear(); S.show = null;
    cols.forEach(c => Object.assign(c, { on: false, offAt: null, fadeAt: null, nudge: false }));
  }
  function openD(d) {
    if (S.open.has(d)) return;
    if (S.show) endShow();
    S.open.add(d); const c = cols[d >> 2];
    c.color = M.color ? M.color() : WARM; c.level = M.level ? M.level() : .7; c.offAt = null; c.nudge = false;
    if (!c.on) { c.on = true; c.since = S.t; c.fadeAt = null; }
    M.onOpen && M.onOpen(d);
  }
  function closeD(d) {
    if (!S.open.delete(d)) return;
    const c = d >> 2;
    if (![0, 1, 2, 3].some(r => S.open.has(c * 4 + r))) cols[c].offAt = S.t + 1.0;
    M.onClose && M.onClose(d);
  }
  function endShow() { S.show = null; M.onShowEnd && M.onShowEnd(); draw(); }
  function userDrawer(d) { S.auto = false; S.q = []; S.open.has(d) ? closeD(d) : openD(d); }
  function randomShut() { const s = [...Array(12).keys()].filter(d => !S.open.has(d)); return s[(Math.random() * s.length) | 0]; }

  function columnPixels(out) {
    cols.forEach((c, ci) => {
      if (c.offAt !== null && S.t >= c.offAt) { c.on = false; c.offAt = null; c.fadeAt = S.t; c.nudge = false; }
      for (let k = 0; k < 7; k++) {
        let v = 0;
        if (c.on) { const p = Math.min(1, (S.t - c.since) / (.4 * (M.slow || 1))); v = clamp(p * 4 - Math.abs(k - 3), 0, 1); }
        else if (c.fadeAt !== null) v = Math.max(0, 1 - (S.t - c.fadeAt) / .3);
        let col = mul(c.color, c.level * v);
        if (c.on && c.nudge) col = mul(AMBER, .7 * (.35 + .65 * (.5 + .5 * Math.sin(S.t * Math.PI))));
        out[ci * 7 + k] = col;
      }
    });
  }

  /* ---------- the effects ---------- */
  function celebrate(st) {                 // st: { t, buf, b:[{pos,hue,t}], next, last }
    const n = 21, c = 10, t = st.t, buf = st.buf;
    if (t < 2) { const r = t / 2 * (c + 1.5); for (let i = 0; i < n; i++) { const d = Math.abs(i - c); buf[i] = d <= r ? hsv(d * 20 + t * 180, 255, 255) : BLACK; } }
    else if (t < 6) {
      if (t - st.last > .4) { st.last = t; st.b[st.next] = { pos: 2 + ((Math.random() * (n - 4)) | 0), hue: (Math.random() * 256) | 0, t }; st.next = (st.next + 1) % 4; }
      for (let i = 0; i < n; i++) buf[i] = mul(buf[i], 190 / 255);
      st.b.forEach(k => { if (!k) return; const age = t - k.t; if (age < 0 || age > .9) return; const r = age * 9, v = 1 - age / .9;
        for (let i = 0; i < n; i++) if (Math.abs(Math.abs(i - k.pos) - r) < .8) buf[i] = hsv(k.hue, age < .08 ? 0 : 230, 255 * v); });
    } else if (t < 8.5) { const step = (t * 24) | 0; for (let i = 0; i < n; i++) buf[i] = (i + step) % 7 === 0 ? CWHITE : hsv(i * 12 + t * 420, 255, 255); }
    else if (t < 10) { const v = t < 8.7 ? 1 : 1 - (t - 8.7) / 1.3; buf.fill(mul(rgbw(255, 150, 30, 140), Math.max(v, 0))); }
    else buf.fill(BLACK);
  }
  const BPM = 107, BEATS = 96;
  function carol(t, out) {
    const beat = t * BPM / 60, b = beat | 0, f = beat - b;
    if (b >= BEATS) { out.fill(mul(GOLD, Math.max(0, 1 - (t - BEATS * 60 / BPM) / 2))); return; }
    const hit = (1 - f) * (1 - f), bar = (b / 4) | 0, inbar = b % 4, phase = ((bar / 4) | 0) % 3;
    for (let i = 0; i < 21; i++) {
      const sec = (i / 7) | 0; let col = BLACK;
      if (phase === 0) { if (sec === b % 3) col = mul(b % 2 ? CGREEN : RED, (60 + 195 * hit) / 255); }
      else if (phase === 1) { col = mul(b % 2 ? CGREEN : RED, (40 + 215 * hit) / 255); if (inbar === 3 && Math.abs(i - (f * 25 - 2)) < 2) col = GOLD; }
      else { const sh = (beat * 2) | 0; col = mul(((i + sh) >> 1) % 2 ? RED : CWHITE, (110 + 145 * hit) / 255); if (inbar === 0 && f < .15) col = GOLD; }
      if (f > .5 && Math.random() < 1 / 45) col = CWHITE;
      out[i] = col;
    }
  }
  const mmss = s => { s = Math.max(0, Math.round(s)); return ((s / 60) | 0) + ':' + String(s % 60).padStart(2, '0'); };
  const clock = mins => { const m = Math.floor(mins); return String((m / 60) | 0).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  /* ---------- one mode per tab ---------- */
  const MODES = [
    { key: 'night red', night: false,
      text: 'Between 22:00 and 06:30 a drawer gets dim red instead of white. Tap a drawer, or switch the time of day.',
      color() { return this.night ? RED : WARM; }, level() { return this.night ? .15 : .7; },
      setNight(v) { this.night = v; cols.forEach(c => { c.color = this.color(); c.level = this.level(); }); draw(); },
      controls() { return [{ label: 'Day', on: !this.night, fn: () => this.setNight(false) }, { label: 'Night', on: this.night, fn: () => this.setNight(true) }]; },
      enter() { this.night = false; }, loop() { const d = randomShut(); at(.6, () => openD(d)); at(3.2, () => closeD(d)); at(4.8, () => this.setNight(!this.night)); at(5.4, () => {}); },
      hud() { return [this.night ? '23:10 · night' : '14:30 · day', 'level ' + (this.night ? '15%' : '70%')]; } },

    { key: 'sweep', slow: 1,
      text: 'The light runs out from the middle of the column in 400 ms instead of snapping on. Slow it down to see it.',
      controls() { return [{ label: 'Open a drawer', fn: () => this.pulse() }, { label: 'Slow motion', on: this.slow > 1, fn: () => { this.slow = this.slow > 1 ? 1 : 8; draw(); } }]; },
      pulse() { const d = randomShut(); openD(d); at(1.2 + .5 * this.slow, () => closeD(d)); },
      enter() { this.slow = 1; }, loop() { at(.5, () => this.pulse()); at(3.2 + .5 * this.slow, () => {}); },
      hud() { return ['sweep · 400 ms', this.slow > 1 ? 'slowed ×8' : 'real speed']; } },

    { key: 'nudge', sim: 0, run: false, d: 9,
      text: 'A drawer left open breathes amber for its last 30 seconds, then the light goes off at five minutes. Shut it to stop. Time runs fast here.',
      controls() { return [{ label: 'Leave a drawer open', fn: () => this.start() }, { label: 'Shut it', fn: () => { closeD(this.d); this.run = false; } }]; },
      start() { reset(); this.sim = 0; this.run = true; openD(this.d); },
      speed() { return this.sim < 262 ? 40 : 3; },
      tick(dt) {
        if (!this.run) return;
        this.sim += dt * this.speed(); const c = cols[this.d >> 2];
        if (this.sim >= 270 && this.sim < 300) c.nudge = true;
        if (this.sim >= 300 && c.on) { c.on = false; c.nudge = false; c.fadeAt = S.t; }
        if (this.sim >= 300) this.run = false;
      },
      onClose(d) { if (d === this.d) { this.run = false; cols[d >> 2].nudge = false; } },
      enter() { this.sim = 0; this.run = false; }, loop() { at(.4, () => this.start()); at(22.5, () => {}); },
      hud() { return ['open ' + mmss(Math.min(this.sim, 300)) + (this.sim >= 300 ? ' · light off' : this.sim >= 270 ? ' · nudge' : ''), this.run ? 'time ×' + this.speed() : '']; },
      progress() { return this.sim / 300; } },

    { key: 'sunrise', sim: -900, run: false,
      text: 'Over the 15 minutes before I get up, the strip goes from deep red to warm white. Then the bedroom Echo plays birdsong. Opening a drawer ends it. Running 60 times faster here.',
      controls() { return [{ label: 'Start the sunrise', fn: () => this.start() }]; },
      start() { reset(); this.sim = -900; this.run = true; S.show = 'sunrise'; },
      tick(dt) { if (!this.run) return; this.sim += dt * 60; if (this.sim >= 300) { this.sim = 300; this.run = false; } },
      render(out) {
        if (S.show !== 'sunrise') return false;
        const f = clamp((this.sim + 900) / 900, 0, 1);
        out.fill(mul(lerp([1, .04, 0], [1, .65, .37], f), .02 + (.7 - .02) * f)); return true;
      },
      onShowEnd() { this.run = false; },
      enter() { this.sim = -900; this.run = false; }, loop() { at(.3, () => this.start()); at(23.5, () => {}); },
      hud() { const ring = this.sim >= 0 && S.show === 'sunrise';
        return [clock(6 * 60 + 45 + this.sim / 60), ring ? 'Echo · birdsong ' + Math.round(Math.min(50, this.sim / 300 * 50)) + '%' : 'alarm 06:45']; },
      progress() { return (this.sim + 900) / 1200; } },

    { key: 'celebrate', st: null,
      text: 'Ten seconds of rainbow bloom, fireworks, a rainbow chase and a gold finish. Home Assistant starts it; opening a drawer ends it.',
      controls() { return [{ label: 'Play', fn: () => this.start() }]; },
      start() { reset(); this.st = { t: 0, acc: 0, buf: Array(21).fill(BLACK), b: [], next: 0, last: 0 }; S.show = 'celebrate'; },
      tick(dt) { const st = this.st; if (!st || S.show !== 'celebrate') return;
        st.acc += dt; while (st.acc >= .025) { st.acc -= .025; st.t += .025; celebrate(st); }
        if (st.t >= 10) { S.show = null; this.st = null; } },
      render(out) { if (S.show !== 'celebrate' || !this.st) return false; this.st.buf.forEach((c, i) => out[i] = c); return true; },
      onShowEnd() { this.st = null; },
      enter() { this.st = null; }, loop() { at(.3, () => this.start()); at(12, () => {}); },
      hud() { const t = this.st ? this.st.t : 0; return [!this.st ? 'ready' : t < 2 ? 'rainbow bloom' : t < 6 ? 'fireworks' : t < 8.5 ? 'rainbow chase' : 'gold finish', this.st ? t.toFixed(1) + ' / 10 s' : '']; },
      progress() { return this.st ? this.st.t / 10 : 0; } },

    { key: 'carol', t: 0, run: false,
      text: '56 seconds in time with Last Christmas at 107 beats a minute, while the Echo plays the song. No sound here.',
      controls() { return [{ label: this.run ? 'Stop' : 'Play', fn: () => this.run ? endShow() : this.start() }]; },
      start() { reset(); this.t = 0; this.run = true; S.show = 'carol'; draw(); },
      tick(dt) { if (!this.run) return; this.t += dt; if (this.t >= BEATS * 60 / BPM + 2) { this.run = false; S.show = null; draw(); } },
      render(out) { if (S.show !== 'carol') return false; carol(this.t, out); return true; },
      onShowEnd() { this.run = false; },
      enter() { this.t = 0; this.run = false; }, loop() { at(.3, () => this.start()); at(59, () => {}); },
      hud() { const b = Math.min(BEATS, Math.floor(this.t * BPM / 60) + (this.run ? 1 : 0));
        return [this.run ? 'beat ' + b + ' / ' + BEATS : 'ready', '107 BPM']; },
      progress() { return this.t / (BEATS * 60 / BPM + 2); } },
  ];

  /* ---------- tabs and controls ---------- */
  MODES.forEach((m, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = m.key;
    b.addEventListener('click', () => select(i, true)); tabs.appendChild(b);
  });
  tabs.addEventListener('keydown', e => {
    const i = MODES.indexOf(M), k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (k) { e.preventDefault(); const n = (i + k + MODES.length) % MODES.length; select(n, true); tabs.children[n].focus(); }
  });
  function draw() {
    ctrl.innerHTML = '';
    M.controls().forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = c.label;
      if ('on' in c) b.setAttribute('aria-pressed', c.on ? 'true' : 'false');
      b.addEventListener('click', () => { S.auto = false; S.q = []; c.fn(); draw(); });
      ctrl.appendChild(b);
    });
  }
  function select(i, user) {
    M = MODES[i]; reset(); S.q = []; S.auto = !reduce;
    [...tabs.children].forEach((b, j) => { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
    desc.textContent = M.text; M.enter && M.enter(); draw();
  }

  /* ---------- the loop ---------- */
  const out = Array(21).fill(BLACK);
  let last = 0, visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(wrap);
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
    if (visible) step(dt);
  }
  if (location.search.indexOf('fxtest') >= 0) window.__fxStep = (sec, dt = 1 / 60) => { for (let t = 0; t < sec; t += dt) step(dt); };
  function step(dt) {
    S.t += dt;
    if (S.auto && !S.q.length && M.loop) M.loop();
    S.q.sort((a, b) => a.at - b.at);
    while (S.q.length && S.q[0].at <= S.t) S.q.shift().fn();
    M.tick && M.tick(dt);
    columnPixels(out);
    if (M.render) M.render(out);
    for (let i = 0; i < 21; i++) {
      const c = out[i], L = Math.max(c[0], c[1], c[2]), p = pix[i];
      if (L < .004) { p.r.style.fill = ''; p.s0.setAttribute('stop-opacity', 0); continue; }
      const a = Math.sqrt(L), n = c.map(v => v / L);
      const fill = 'rgb(' + n.map((v, j) => Math.round(v * 255 * a + [42, 33, 27][j] * (1 - a))).join(',') + ')';
      p.r.style.fill = fill; p.s0.setAttribute('stop-color', 'rgb(' + n.map(v => Math.round(v * 255)).join(',') + ')'); p.s0.setAttribute('stop-opacity', (.55 * a).toFixed(3));
    }
    drawers.forEach((g, d) => g.classList.toggle('open', S.open.has(d)));
    const [l, r] = M.hud(); hudL.textContent = l; hudR.textContent = r;
    bar.style.transform = 'scaleX(' + (M.progress ? clamp(M.progress(), 0, 1) : 0) + ')';
  }
  select(0);
  requestAnimationFrame(frame);
})();
