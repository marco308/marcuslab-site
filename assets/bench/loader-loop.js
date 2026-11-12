/* Loaded only for /?loader=loop. Controls for the looping loader (LAB.loaderLoop, built in index.html):
   pause, step a frame at a time, scrub, and slow it down. Space pauses; the arrow keys step. */
(() => {
  const tl = window.LAB && window.LAB.loaderLoop;
  if (!tl) return;
  const bar = document.createElement('div');
  bar.innerHTML = `<style>
    #ll{ position:fixed; left:50%; bottom:18px; transform:translateX(-50%); z-index:200; display:flex; align-items:center; gap:10px; padding:10px 14px; max-width:calc(100vw - 32px); box-sizing:border-box;
      background:#17110d; border:1.5px solid #ffedd7; color:#ffedd7; font:500 12px/1 "DM Mono", ui-monospace, monospace; letter-spacing:.08em; text-transform:uppercase; }
    #ll button{ font:inherit; letter-spacing:inherit; text-transform:inherit; color:inherit; background:none; border:1.5px solid #ffedd7; border-radius:999px; min-width:44px; min-height:36px; padding:0 12px; cursor:pointer; }
    #ll button.on{ background:#e8590c; border-color:#e8590c; color:#17110d; }
    #ll input{ flex:1; min-width:90px; width:34vw; max-width:420px; accent-color:#e8590c; }
    #ll output{ min-width:9ch; text-align:right; }
    @media (max-width:600px){ #ll{ flex-wrap:wrap; justify-content:center; } #ll input{ order:9; width:100%; max-width:none; flex-basis:100%; } }
  </style>
  <div id="ll"><button data-a="play">Pause</button><button data-a="back" aria-label="Back one frame">−1</button><button data-a="fwd" aria-label="Forward one frame">+1</button>
  <input type="range" min="0" max="1" step="0.0005" value="0" aria-label="Position"><output>0.00 s</output>
  <button data-s="0.25">¼×</button><button data-s="0.5">½×</button><button data-s="1" class="on">1×</button></div>`;
  document.body.appendChild(bar);
  const play = bar.querySelector('[data-a=play]'), range = bar.querySelector('input'), out = bar.querySelector('output');
  const dur = tl.duration(), frame = 1 / 60;
  const label = () => { play.textContent = tl.paused() ? 'Play' : 'Pause'; };
  const step = d => { tl.pause(); tl.time(Math.min(dur, Math.max(0, tl.time() + d))); label(); };
  const toggle = () => { tl.paused(!tl.paused()); label(); };
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'play') toggle();
    if (b.dataset.a === 'back') step(-frame);
    if (b.dataset.a === 'fwd') step(frame);
    if (b.dataset.s) { tl.timeScale(+b.dataset.s); bar.querySelectorAll('[data-s]').forEach(x => x.classList.toggle('on', x === b)); }
  });
  range.addEventListener('input', () => { tl.pause(); tl.time(range.value * dur); label(); });
  addEventListener('keydown', e => {
    if (e.target === range) return;
    if (e.key === ' ') { e.preventDefault(); toggle(); }
    if (e.key === 'ArrowLeft') step(e.shiftKey ? -10 * frame : -frame);
    if (e.key === 'ArrowRight') step(e.shiftKey ? 10 * frame : frame);
  });
  gsap.ticker.add(() => { const t = tl.time(); if (document.activeElement !== range || !tl.paused()) range.value = t / dur; out.textContent = t.toFixed(2) + ' s'; });
})();
