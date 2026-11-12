/* Bench prototype: the live 3D scene.
   Loads the dosing ring's real parts (exported from the zigbrew-scales CAD into ./models/) and
   renders them on a desk. The page's scroll timeline drives the plain state object window.BENCH.S;
   this module reads it every frame. Nothing here is pre-rendered. */
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const B = window.BENCH;
const S = B.S;
const canvas = document.getElementById('gl');
const host = canvas.parentElement;

const ORANGE = 0xe8590c, DARK = 0x17110d;

/* id, colour, metalness, roughness, how far it lifts in the exploded view (mm, along the ring's axis),
   and the flat colour of its cut face in the section */
const PARTS = [
  { id: 'pf-body',   color: 0xaab2bb, metal: .95, rough: .30, ex: -58, cut: 0x59616a },
  { id: 'pf-basket', color: 0xd0d5da, metal: 1.0, rough: .22, ex: -30, cut: 0x7b838b },
  { id: 'pf-handle', color: 0x1b1b1d, metal: .10, rough: .50, ex: -58, cut: 0x0c0c0d },
  { id: 'sleeve',    color: 0xc9a66b, metal: 0,   rough: .72, ex: -8,  cut: 0xc24a08 },
  { id: 'screws',    color: 0x3a3d40, metal: .85, rough: .45, ex: 6,   cut: 0x1f2123 },
  { id: 'top',       color: 0xe8e2d6, metal: 0,   rough: .78, ex: 34,  cut: ORANGE },
  { id: 'cell',      color: 0xb9c1ca, metal: .9,  rough: .38, ex: 66,  cut: 0x8d96a0 },
  { id: 'carrier',   color: 0xe8873a, metal: 0,   rough: .7,  ex: 98,  cut: 0xb35e1c },
  { id: 'xiao',      color: 0x2e7d4f, metal: .2,  rough: .6,  ex: 122, cut: 0x1d5133 },
  { id: 'hx711',     color: 0x2f5fa8, metal: .2,  rough: .6,  ex: 122, cut: 0x1e3f73 },
  { id: 'lipo',      color: 0xd7a520, metal: .3,  rough: .5,  ex: 146, cut: 0x9c7614 },
  { id: 'lid',       color: 0xf2eee6, metal: 0,   rough: .78, ex: 178, cut: 0xf07a2e },
];
const LABELS = [
  { part: 'lid',     text: 'LID', side: 1 },
  { part: 'lipo',    text: 'BATTERY', side: -1 },
  { part: 'xiao',    text: 'XIAO + HX711', side: 1 },
  { part: 'cell',    text: 'LOAD CELL · 1 KG', side: -1 },
  { part: 'top',     text: 'TOP RING · PRINTED', side: 1 },
  { part: 'sleeve',  text: 'SLEEVE · PRINTED', side: -1 },
  { part: 'pf-body', text: 'PORTAFILTER', side: 1 },
];

/* ---------- renderer, scene, lights ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(DARK);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 16 / 9, 10, 5000);

const hemi = new THREE.HemisphereLight(0xfff1dc, 0x3a2a1a, 0.5);
const key = new THREE.DirectionalLight(0xfff0dd, 2.3);
key.position.set(-260, 620, 240);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -460, right: 460, top: 460, bottom: -460, near: 50, far: 1600 });
key.shadow.bias = -0.0005; key.shadow.normalBias = 0.6; key.shadow.radius = 7;
const rim = new THREE.DirectionalLight(0xff8a3c, 0);      // comes up as the desk goes dark
rim.position.set(320, 160, -420);
scene.add(hemi, key, rim);

/* ---------- textures drawn on the fly ---------- */
function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const woodTex = tex(1024, 1024, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#6f4425'); grad.addColorStop(.45, '#87572f'); grad.addColorStop(1, '#693f22');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {                       // grain: long faint streaks
    const y = Math.random() * h, len = 200 + Math.random() * 800, x = Math.random() * w - 200;
    g.strokeStyle = Math.random() < .5 ? `rgba(50,25,8,${.03 + Math.random() * .07})` : `rgba(255,220,170,${.02 + Math.random() * .04})`;
    g.lineWidth = .6 + Math.random() * 1.6;
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * .3, y + (Math.random() - .5) * 8, x + len * .6, y + (Math.random() - .5) * 8, x + len, y + (Math.random() - .5) * 5); g.stroke();
  }
});
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(3, 3);

const MAT_W = 640, MAT_D = 440, PX = 3.2;                // cutting mat, mm and px per mm
const matTex = tex(MAT_W * PX, MAT_D * PX, (g, w, h) => {
  const r = 14 * PX;
  g.beginPath(); g.roundRect(0, 0, w, h, r); g.clip();
  const rg = g.createRadialGradient(w * .42, h * .42, 40, w * .5, h * .5, w * .7);
  rg.addColorStop(0, '#3f5031'); rg.addColorStop(1, '#33422a');
  g.fillStyle = rg; g.fillRect(0, 0, w, h);
  const m = 20 * PX;                                     // margin before the grid starts
  for (let mm = 0; mm <= MAT_W - 40; mm += 10) {
    const x = m + mm * PX, major = mm % 50 === 0;
    g.strokeStyle = `rgba(255,237,215,${major ? .55 : .2})`; g.lineWidth = major ? 2 : 1;
    g.beginPath(); g.moveTo(x, m); g.lineTo(x, h - m); g.stroke();
  }
  for (let mm = 0; mm <= MAT_D - 40; mm += 10) {
    const y = h - m - mm * PX, major = mm % 50 === 0;
    g.strokeStyle = `rgba(255,237,215,${major ? .55 : .2})`; g.lineWidth = major ? 2 : 1;
    g.beginPath(); g.moveTo(m, y); g.lineTo(w - m, y); g.stroke();
  }
  g.fillStyle = 'rgba(255,237,215,.8)'; g.font = `${5.2 * PX}px "DM Mono", monospace`; g.textAlign = 'center';
  for (let mm = 0; mm <= MAT_W - 40; mm += 50) g.fillText(String(mm), m + mm * PX, h - 6 * PX);
  g.textAlign = 'right';
  for (let mm = 50; mm <= MAT_D - 40; mm += 50) g.fillText(String(mm), m - 3 * PX, h - m - mm * PX + 2 * PX);
});
const ruleTex = tex(1500, 130, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#eef0f2'); grad.addColorStop(1, '#b4bac0');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2f3336'; g.fillStyle = '#2f3336'; g.font = '26px "DM Mono", monospace'; g.textAlign = 'center';
  for (let mm = 0; mm <= 300; mm++) {
    const x = mm * 5, len = mm % 10 === 0 ? 52 : mm % 5 === 0 ? 38 : 24;
    g.lineWidth = mm % 10 === 0 ? 2.4 : 1.4;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, len); g.stroke();
    if (mm % 10 === 0 && mm > 0 && mm < 300) g.fillText(String(mm / 10), x, 88);
  }
});

/* ---------- the desk and what's lying on it ---------- */
const deskMats = [];
const fade = m => { m.transparent = true; deskMats.push(m); return m; };
const desk = new THREE.Group(); scene.add(desk);

const wood = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600), fade(new THREE.MeshStandardMaterial({ map: woodTex, roughness: .78 })));
wood.rotation.x = -Math.PI / 2; wood.receiveShadow = true; desk.add(wood);

const mat = new THREE.Mesh(new THREE.PlaneGeometry(MAT_W, MAT_D), fade(new THREE.MeshStandardMaterial({ map: matTex, roughness: .9, alphaTest: .5 })));
mat.rotation.x = -Math.PI / 2; mat.rotation.z = THREE.MathUtils.degToRad(-4); mat.position.set(118, 1.2, -14); mat.receiveShadow = true; desk.add(mat);

const rule = new THREE.Mesh(new THREE.BoxGeometry(300, 1, 26), [0, 1, 2, 3, 4, 5].map(i =>
  fade(new THREE.MeshStandardMaterial(i === 2 ? { map: ruleTex, metalness: .75, roughness: .32 } : { color: 0xb9bfc4, metalness: .8, roughness: .35 }))));
rule.position.set(196, 2.4, -92); rule.rotation.y = THREE.MathUtils.degToRad(62); rule.castShadow = true; rule.receiveShadow = true; desk.add(rule);

const pencil = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 160, 6), fade(new THREE.MeshStandardMaterial({ color: 0x1e1e20, roughness: .45 })));
const tipWood = new THREE.Mesh(new THREE.ConeGeometry(3.6, 15, 6), fade(new THREE.MeshStandardMaterial({ color: 0xd2a871, roughness: .8 })));
const tipLead = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4.6, 6), fade(new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .4, metalness: .4 })));
tipWood.position.y = 87.5; tipLead.position.y = 92.8;
pencil.add(body, tipWood, tipLead); pencil.children.forEach(m => { m.castShadow = true; });
pencil.rotation.z = Math.PI / 2; pencil.rotation.y = THREE.MathUtils.degToRad(24); pencil.position.set(-262, 4.3, 92); desk.add(pencil);

function nut(x, z, rot, r = 6.4) {
  const sh = new THREE.Shape();
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
  sh.closePath(); const hole = new THREE.Path(); hole.absarc(0, 0, r * .52, 0, Math.PI * 2, true); sh.holes.push(hole);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: true, bevelSize: .5, bevelThickness: .5, bevelSegments: 2, curveSegments: 24 }),
    fade(new THREE.MeshStandardMaterial({ color: 0xc4cad0, metalness: 1, roughness: .28 })));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, 1.8, z); m.castShadow = true; m.receiveShadow = true; desk.add(m); return m;
}
const props = [rule, pencil, nut(-128, 112, .3), nut(-102, 136, 1.1), nut(-150, 142, .7, 5)];
props.forEach(p => { p.userData.home = p.position.clone(); });

/* ---------- the part itself ---------- */
const pivot = new THREE.Group();        // spins and lifts
const asm = new THREE.Group();          // CAD coordinates (Z up) turned to Y up
asm.rotation.x = -Math.PI / 2;
pivot.add(asm); scene.add(pivot);

const localPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 80);   // CAD y = 0 is the centre line; keeps y >= -constant
const clip = new THREE.Plane();
const meshes = {};
const dim = new THREE.Color(0x241a13);

const frame = (() => {                  // the cutting plane's outline, in CAD coordinates
  const pts = [[-60, 0, -95], [250, 0, -95], [250, 0, 70], [-60, 0, 70], [-60, 0, -95]].map(p => new THREE.Vector3(...p));
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: ORANGE, dashSize: 12, gapSize: 5, transparent: true, opacity: 0 }));
  l.computeLineDistances(); asm.add(l); return l;
})();

const loader = new STLLoader();
const loadPart = p => new Promise((res, rej) => loader.load(`/assets/bench/models/${p.id}.stl`, g => {
  // smooth shading across shallow edges; the perforated basket is too fine to be worth the work
  const geo = p.id === 'pf-basket' ? g : toCreasedNormals(g, THREE.MathUtils.degToRad(38));
  geo.computeBoundingBox();
  const material = new THREE.MeshStandardMaterial({ color: p.color, metalness: p.metal, roughness: p.rough, clippingPlanes: [clip], clipShadows: true });
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true; mesh.receiveShadow = true;
  // the inside faces, drawn flat in the cut colour, read as a solid section face once the plane passes through
  const cap = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: p.cut, side: THREE.BackSide, clippingPlanes: [clip] }));
  mesh.add(cap);
  mesh.userData = { p, base: new THREE.Color(p.color), capBase: new THREE.Color(p.cut), cap, centre: geo.boundingBox.getCenter(new THREE.Vector3()) };
  asm.add(mesh); meshes[p.id] = mesh; res();
}, undefined, rej));

/* ---------- labels for the exploded view ---------- */
const labelBox = document.querySelector('.labels');
const svgNS = 'http://www.w3.org/2000/svg';
const labelSvg = document.createElementNS(svgNS, 'svg'); labelBox.appendChild(labelSvg);
const labelEls = LABELS.map(l => {
  const el = document.createElement('span'); el.className = 'lab' + (l.side < 0 ? ' l' : ''); el.textContent = l.text; labelBox.appendChild(el);
  const line = document.createElementNS(svgNS, 'line'); const dot = document.createElementNS(svgNS, 'circle'); dot.setAttribute('r', 2.5);
  labelSvg.append(line, dot);
  return { ...l, el, line, dot };
});

/* ---------- camera path ---------- */
let KEYS = [], H = 100, baseY = 50, W = 1, Hh = 1;
const v = (x, y, z) => new THREE.Vector3(x, y, z);
function buildKeys() {
  const cy = baseY + 95;
  const cell = meshes.cell ? meshes.cell.userData.centre.clone() : v(0, 0, 0);
  const cl = asm.localToWorld(cell.clone());            // rough: taken at the pose current when called
  KEYS = [
    { pos: v(-72, 430, 205), tgt: v(-72, 0, 16) },      // 0 looking down at the desk
    { pos: v(0, cy + 120, 600), tgt: v(0, cy, 0) },     // 1 lifted
    { pos: v(0, cy + 190, 930), tgt: v(0, cy + 60, 0) },// 2 exploded
    { pos: v(-60, cy + 130, 500), tgt: v(-25, cy + 4, 0) }, // 3 section
    { pos: v(-10, cy + 70, 330), tgt: v(0, cy + 6, 0), cell: cl }, // 4 close on the load cell
  ];
}
const smooth = t => t * t * (3 - 2 * t);
const camPos = v(0, 0, 0), camTgt = v(0, 0, 0);

/* ---------- pointer ---------- */
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', e => { ptr.tx = (e.clientX / window.innerWidth) * 2 - 1; ptr.ty = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });

function resize() {
  W = host.clientWidth; Hh = host.clientHeight;
  renderer.setSize(W, Hh, false);
  camera.aspect = W / Hh; camera.updateProjectionMatrix();
  labelSvg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
}
new ResizeObserver(resize).observe(host);

let visible = true;
new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);

const tmp = v(0, 0, 0), clock = new THREE.Clock();
function frame_() {
  requestAnimationFrame(frame_);
  if (!visible || !KEYS.length) return;
  const t = clock.getElapsedTime();
  ptr.x += (ptr.tx - ptr.x) * .06; ptr.y += (ptr.ty - ptr.y) * .06;

  // desk: fades out and its props slide away as the lights go down
  const deskA = 1 - smooth(THREE.MathUtils.clamp(S.dark * 1.15, 0, 1));
  desk.visible = deskA > .002;
  deskMats.forEach(m => { m.opacity = deskA; });
  props.forEach((p, i) => { const h = p.userData.home, dir = h.x < 0 ? -1 : 1; p.position.x = h.x + dir * S.dark * (160 + i * 40); p.position.z = h.z + S.dark * 60; });
  key.intensity = 2.3 - .5 * S.dark; hemi.intensity = .5 - .12 * S.dark; rim.intensity = 1.7 * S.dark;

  // the part: lift, spin, lean with the pointer, a slow bob once it's off the desk
  pivot.position.y = baseY + 95 * S.lift + Math.sin(t * .9) * 3 * S.lift;
  pivot.rotation.y = S.rot + ptr.x * .28 + Math.sin(t * .35) * .05 * S.lift;
  pivot.rotation.x = .16 * S.lift * (1 - S.focus * .4) + ptr.y * .12;
  pivot.rotation.z = Math.sin(t * .5) * .015 * S.lift;

  // exploded view
  for (const id in meshes) { const m = meshes[id]; m.position.z = m.userData.p.ex * S.explode; }

  // section: the plane sweeps in from the near side to the centre line
  localPlane.constant = 80 * (1 - S.cut) + 0.01;
  frame.position.y = -localPlane.constant;
  frame.material.opacity = Math.sin(Math.min(1, S.cut * 1.02) * Math.PI) * .9 + (S.cut > .98 ? .35 : 0);
  asm.updateWorldMatrix(true, false);
  clip.copy(localPlane).applyMatrix4(asm.matrixWorld);

  // focus: everything but the load cell falls back
  for (const id in meshes) {
    const m = meshes[id], u = m.userData, hero = id === 'cell';
    const k = hero ? 0 : S.focus * .5;
    m.material.color.copy(u.base).lerp(dim, k);
    u.cap.material.color.copy(u.capBase).lerp(dim, k);
    if (hero) { m.material.emissive.setHex(ORANGE); m.material.emissiveIntensity = S.focus * (.55 + Math.sin(t * 3) * .2); }
  }

  // camera along its keyframes; pulled back on tall, narrow screens. The last key follows the load cell itself
  if (meshes.cell) { const k4 = KEYS[4]; k4.tgt.copy(meshes.cell.userData.centre); meshes.cell.localToWorld(k4.tgt); k4.pos.copy(k4.tgt).add(tmp.set(-30, 62, 255)); }
  const c = THREE.MathUtils.clamp(S.cam, 0, KEYS.length - 1), i = Math.min(Math.floor(c), KEYS.length - 2), f = smooth(c - i);
  camPos.lerpVectors(KEYS[i].pos, KEYS[i + 1].pos, f); camTgt.lerpVectors(KEYS[i].tgt, KEYS[i + 1].tgt, f);
  const back = Math.max(1, 1.55 / camera.aspect);
  tmp.subVectors(camPos, camTgt).multiplyScalar(back).add(camTgt);
  camera.position.copy(tmp); camera.lookAt(camTgt);

  renderer.render(scene, camera);

  // labels, projected from each part's centre
  const la = S.labels;
  labelBox.style.opacity = la;
  if (la > .01) {
    labelEls.forEach((l, n) => {
      const m = meshes[l.part]; if (!m) return;
      tmp.copy(m.userData.centre); m.localToWorld(tmp); tmp.project(camera);
      const x = (tmp.x * .5 + .5) * W, y = (-tmp.y * .5 + .5) * Hh, reach = Math.min(W * .2, 250) + (n % 2) * 26, lx = x + l.side * reach;
      l.el.style.transform = `translate(${lx + l.side * 8}px, ${y}px) translate(${l.side < 0 ? '-100%' : '0'}, -50%)`;
      l.line.setAttribute('x1', x); l.line.setAttribute('y1', y); l.line.setAttribute('x2', lx); l.line.setAttribute('y2', y);
      l.dot.setAttribute('cx', x); l.dot.setAttribute('cy', y);
    });
  }
}

Promise.all(PARTS.map(loadPart)).then(() => {
  // centre the assembly on the pivot so it spins about its middle and sits on the mat
  asm.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(asm), c = box.getCenter(new THREE.Vector3());
  asm.position.sub(c); H = box.max.y - box.min.y; baseY = H / 2 + 2.4;
  pivot.position.set(0, baseY, 0);
  resize(); buildKeys();
  renderer.compile(scene, camera);
  requestAnimationFrame(frame_);
  B.loadedAt = Math.round(performance.now());
  B.ready({ parts: PARTS.length, triangles: Object.values(meshes).reduce((n, m) => n + m.geometry.attributes.position.count / 3, 0) });
}).catch(err => { console.error('bench3d: could not load the models', err); B.fail(err); });
