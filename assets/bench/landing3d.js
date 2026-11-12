/* Landing prototype: the bench with one object on it for each thing Marcus has built.
   The page owns window.LAB (scroll state, hover, selection, filter); this module draws it. */
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const L = window.LAB, S = L.S;
const canvas = document.getElementById('gl'), host = canvas.parentElement;
const ORANGE = 0xe8590c, DARK = 0x17110d, CREAM = '#ffedd7';
const rad = THREE.MathUtils.degToRad;
const NARROW = document.documentElement.classList.contains('narrow');   // phones: lighter materials, tighter framing

/* ---------- renderer, lights ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(DARK);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 16 / 9, 10, 6000);
const key = new THREE.DirectionalLight(0xfff0dd, 2.3);
key.position.set(-340, 760, 300); key.castShadow = true; key.shadow.mapSize.set(NARROW ? 1024 : 2048, NARROW ? 1024 : 2048);
Object.assign(key.shadow.camera, { left: -620, right: 620, top: 620, bottom: -620, near: 50, far: 2000 });
key.shadow.bias = -0.0005; key.shadow.normalBias = 0.6; key.shadow.radius = 7;
scene.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2a1a, 0.5), key);

/* ---------- drawn textures ---------- */
function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const MONO = '"DM Mono", ui-monospace, Menlo, monospace', SANS = '"Outfit", system-ui, sans-serif';
const woodTex = tex(1024, 1024, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#6f4425'); grad.addColorStop(.45, '#87572f'); grad.addColorStop(1, '#693f22');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * h, len = 200 + Math.random() * 800, x = Math.random() * w - 200;
    g.strokeStyle = Math.random() < .5 ? `rgba(50,25,8,${.03 + Math.random() * .07})` : `rgba(255,220,170,${.02 + Math.random() * .04})`;
    g.lineWidth = .6 + Math.random() * 1.6;
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * .3, y + (Math.random() - .5) * 8, x + len * .6, y + (Math.random() - .5) * 8, x + len, y + (Math.random() - .5) * 5); g.stroke();
  }
});
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(3, 3);

/* the cutting mat, with its zones printed on it. World x,z in mm map straight onto the canvas. */
const MAT_W = 860, MAT_D = 580, PX = 2.6;
const ZONES = [
  { name: 'BUILDS', x: -400, z: -262 }, { name: 'SOFTWARE', x: -400, z: 8 },
];
const matTex = tex(MAT_W * PX, MAT_D * PX, (g, w, h) => {
  const X = x => (x + MAT_W / 2) * PX, Z = z => (z + MAT_D / 2) * PX;
  g.beginPath(); g.roundRect(0, 0, w, h, 16 * PX); g.clip();
  const rg = g.createRadialGradient(w * .42, h * .42, 40, w * .5, h * .5, w * .7);
  rg.addColorStop(0, '#3f5031'); rg.addColorStop(1, '#33422a'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
  for (let x = -410; x <= 410; x += 10) { const major = x % 50 === 0; g.strokeStyle = `rgba(255,237,215,${major ? .4 : .14})`; g.lineWidth = major ? 1.6 : 1; g.beginPath(); g.moveTo(X(x), Z(-270)); g.lineTo(X(x), Z(270)); g.stroke(); }
  for (let z = -270; z <= 270; z += 10) { const major = z % 50 === 0; g.strokeStyle = `rgba(255,237,215,${major ? .4 : .14})`; g.lineWidth = major ? 1.6 : 1; g.beginPath(); g.moveTo(X(-410), Z(z)); g.lineTo(X(410), Z(z)); g.stroke(); }
  // zone boundaries and names
  g.strokeStyle = 'rgba(255,237,215,.85)'; g.lineWidth = 3;
  g.strokeRect(X(-410), Z(-270), 820 * PX, 540 * PX);
  [[-410, 0, 410, 0]].forEach(l => { g.beginPath(); g.moveTo(X(l[0]), Z(l[1])); g.lineTo(X(l[2]), Z(l[3])); g.stroke(); });
  g.fillStyle = 'rgba(255,237,215,.85)'; g.font = `500 ${9.5 * PX}px ${MONO}`; g.textBaseline = 'top';
  ZONES.forEach(z => g.fillText(z.name, X(z.x + 6), Z(z.z + 4)));
  g.font = `${5 * PX}px ${MONO}`; g.textAlign = 'center'; g.fillStyle = 'rgba(255,237,215,.6)';
  for (let x = -400; x <= 400; x += 100) g.fillText(String(x + 400), X(x), Z(273));
});
const ruleTex = tex(1500, 130, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, '#eef0f2'); grad.addColorStop(1, '#b4bac0'); g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2f3336'; g.fillStyle = '#2f3336'; g.font = `26px ${MONO}`; g.textAlign = 'center';
  for (let mm = 0; mm <= 300; mm++) { const x = mm * 5, len = mm % 10 === 0 ? 52 : mm % 5 === 0 ? 38 : 24; g.lineWidth = mm % 10 === 0 ? 2.4 : 1.4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, len); g.stroke(); if (mm % 10 === 0 && mm > 0 && mm < 300) g.fillText(String(mm / 10), x, 88); }
});

/* ---------- the desk ---------- */
const std = o => new THREE.MeshStandardMaterial(o);
const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
const wood = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200), std({ map: woodTex, roughness: .78 }));
wood.rotation.x = -Math.PI / 2; wood.receiveShadow = true; scene.add(wood);
const mat = new THREE.Mesh(new THREE.PlaneGeometry(MAT_W, MAT_D), std({ map: matTex, roughness: .9, alphaTest: .5, transparent: true }));
mat.rotation.x = -Math.PI / 2; mat.position.y = 1.2; mat.receiveShadow = true; scene.add(mat);
const rule = sh(new THREE.Mesh(new THREE.BoxGeometry(300, 1, 26), [0, 1, 2, 3, 4, 5].map(i => std(i === 2 ? { map: ruleTex, metalness: .75, roughness: .32 } : { color: 0xb9bfc4, metalness: .8, roughness: .35 }))));
rule.position.set(-250, 1.2, 322); rule.rotation.y = rad(4); scene.add(rule);
function hexNut(x, z, rot, r = 6.4) {
  const s = new THREE.Shape(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
  s.closePath(); const hole = new THREE.Path(); hole.absarc(0, 0, r * .52, 0, Math.PI * 2, true); s.holes.push(hole);
  const m = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 5, bevelEnabled: true, bevelSize: .5, bevelThickness: .5, bevelSegments: 2, curveSegments: 24 }), std({ color: 0xc4cad0, metalness: 1, roughness: .28 })));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, 1.8, z); scene.add(m);
}
hexNut(-52, -52, .3); hexNut(-30, -34, 1.1); hexNut(-66, -26, .7, 5);

/* ---------- helpers for the stand-in objects ---------- */
function roundedRect(w, d, r) { const s = new THREE.Shape(), x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function slab(w, d, h, r, material) {            // a flat rounded block lying on the desk, top face at y = h
  const m = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(w, d, r), { depth: h, bevelEnabled: false, curveSegments: 16 }), material));
  m.rotation.x = -Math.PI / 2; return m;
}
function decal(w, d, y, texture, extra = {}) {   // a picture laid flat, facing up
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: texture, roughness: .85, ...extra }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; return m;
}

/* ---------- the eight things ---------- */
const OBJECTS = [];
function add(id, x, z, rotY, build) {
  const g = new THREE.Group(); g.position.set(x, 1.4, z); g.rotation.y = rotY;
  const inner = new THREE.Group(); g.add(inner); build(inner);
  scene.add(g);
  const o = { id, g, inner, home: g.position.clone(), rot: rotY, h: 0, pick: null, top: 40 };
  OBJECTS.push(o); return o;
}
function finish(o) {                              // an invisible box to catch the pointer, and the height its tag floats at
  o.g.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(o.inner), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const hit = new THREE.Mesh(new THREE.BoxGeometry(size.x + 16, size.y + 16, size.z + 16), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.copy(c); hit.userData.id = o.id; scene.add(hit); o.pick = hit; o.top = box.max.y + 8; o.centre = c;
}

/* shared looks */
const glassMat = () => NARROW
  ? new THREE.MeshPhysicalMaterial({ color: 0xeaf6f8, transparent: true, opacity: .22, roughness: .04, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false })
  : new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 4, ior: 1.5, roughness: .03, metalness: 0, envMapIntensity: 1.3, side: THREE.DoubleSide });
const steel = () => std({ color: 0xd3d8dd, metalness: 1, roughness: .22 });
const lathe = (pts, material, seg = 64) => sh(new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), material));
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
let watchHand = null;

// mDone: an iPhone showing the real app. Titanium band with rounded edges, black glass, a screen with
// rounded corners and the island, and the buttons where they really are
add('mdone', -305, 120, rad(14), g => {
  const PW = 70.6, PD = 146.6, PH = 8.25, R = 12;
  const band = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(PW - 2.4, PD - 2.4, R - 1.2), { depth: PH - 2.4, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 6, curveSegments: 24 }),
    std({ color: 0x8f8f8c, metalness: 1, roughness: .32 })));
  band.rotation.x = -Math.PI / 2; band.position.y = 1.2; g.add(band);
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(PW - 2.2, PD - 2.2, R - 1.1), 24), new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: .08, metalness: 0, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.4 }));
  glass.rotation.x = -Math.PI / 2; glass.position.y = PH + .02; glass.receiveShadow = true; g.add(glass);
  // the screen: the screenshot clipped to rounded corners, with the island drawn over it
  const SW = PW - 5.4, SD = PD - 5.4, c = document.createElement('canvas'); c.width = 652; c.height = Math.round(652 * SD / SW);
  const x = c.getContext('2d'), st = new THREE.CanvasTexture(c); st.colorSpace = THREE.SRGBColorSpace; st.anisotropy = 8;
  const img = new Image(); img.onload = () => {
    const k = c.width / SW; x.beginPath(); x.roundRect(0, 0, c.width, c.height, 9.6 * k); x.clip();
    x.drawImage(img, 0, 0, c.width, c.height);
    x.fillStyle = '#000'; x.beginPath(); x.roundRect(c.width / 2 - 13.4 * k, 2.6 * k, 26.8 * k, 7.6 * k, 3.8 * k); x.fill();
    st.needsUpdate = true;
  }; img.src = '/assets/bench/mdone-screen.png';
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(SW, SD), new THREE.MeshBasicMaterial({ map: st, transparent: true, toneMapped: false, color: 0xe9e9e9 }));
  scr.rotation.x = -Math.PI / 2; scr.position.y = PH + .06; g.add(scr);
  const sheen = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(SW, SD, 9.6), 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .07, roughness: 0, envMapIntensity: 3, depthWrite: false }));
  sheen.rotation.x = -Math.PI / 2; sheen.position.y = PH + .1; g.add(sheen);
  const btn = (side, z, len) => { const b = sh(new THREE.Mesh(new THREE.CapsuleGeometry(.75, len, 4, 10), std({ color: 0x8f8f8c, metalness: 1, roughness: .3 }))); b.rotation.x = Math.PI / 2; b.position.set(side * (PW / 2 + .15), PH / 2 + .4, z); g.add(b); };
  btn(-1, -44, 3.5); btn(-1, -31, 8.5); btn(-1, -18, 8.5); btn(1, -27, 14);      // action, volume up, volume down; power
});

// ChukkaTimer: a polo ball and a stopwatch set to one seven-minute chukka
const ball = add('chukkatimer', -182, 158, 0, g => {
  g.add(at(sh(new THREE.Mesh(new THREE.SphereGeometry(39, 48, 32), std({ color: 0xe6e1d5, roughness: .72 }))), 0, 39, 0));
  const w = new THREE.Group(); w.position.set(26, 0, -84); w.rotation.y = rad(-20); g.add(w);
  w.add(at(sh(new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 11, 64), steel())), 0, 5.5, 0));
  const face = tex(512, 512, (c, s) => {
    c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(256, 256, 256, 0, 7); c.fill(); c.translate(256, 256);
    for (let i = 0; i < 60; i++) { c.save(); c.rotate(i * Math.PI / 30); c.fillStyle = '#17110d'; c.fillRect(-(i % 5 ? 1.5 : 4), -236, i % 5 ? 3 : 8, i % 5 ? 16 : 34); c.restore(); }
    c.fillStyle = '#17110d'; c.textAlign = 'center'; c.font = `700 74px ${SANS}`; c.fillText('7:00', 0, 96); c.font = `500 24px ${MONO}`; c.fillStyle = '#e8590c'; c.fillText('CHUKKA', 0, -70);
  });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(24.5, 64), std({ map: face, roughness: .5 })); dial.rotation.x = -Math.PI / 2; dial.position.y = 11.2; w.add(dial);
  watchHand = new THREE.Group(); watchHand.position.y = 11.8; w.add(watchHand);
  watchHand.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.4, .8, 24), new THREE.MeshBasicMaterial({ color: ORANGE })), 0, 0, -9), new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.4, 20), new THREE.MeshBasicMaterial({ color: ORANGE })));
  const crown = at(sh(new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 10, 24), steel())), 0, 5.5, -32); crown.rotation.x = Math.PI / 2; w.add(crown);
  const loop = at(sh(new THREE.Mesh(new THREE.TorusGeometry(7.5, 1.5, 10, 32), steel())), 0, 5.5, -43); loop.rotation.x = Math.PI / 2; w.add(loop);
});

// YAMP: a shopping list on top of a recipe card, with the pencil that ticks things off
add('yamp', -48, 130, rad(-7), g => {
  const list = tex(630, 890, (c, w, h) => {
    c.fillStyle = '#fbf4e6'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#17110d'; c.font = `700 92px ${SANS}`; c.fillText('YAMP', 48, 120);
    c.font = `500 26px ${MONO}`; c.fillStyle = '#e8590c'; c.fillText('SHOPPING LIST · SORTED BY AISLE', 48, 170);
    c.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const y = 250 + i * 68; c.strokeStyle = '#17110d'; c.strokeRect(48, y - 26, 30, 30);
      if (i < 4) { c.strokeStyle = '#e8590c'; c.lineWidth = 5; c.beginPath(); c.moveTo(53, y - 12); c.lineTo(62, y - 2); c.lineTo(80, y - 30); c.stroke(); c.lineWidth = 3; }
      c.fillStyle = `rgba(23,17,13,${i < 4 ? .12 : .24})`; c.fillRect(104, y - 18, 190 + ((i * 97) % 230), 14); c.fillStyle = 'rgba(23,17,13,.12)'; c.fillRect(48, y + 20, w - 96, 2);
    }
  });
  const recipe = tex(630, 890, (c, w, h) => { c.fillStyle = '#f1e3c6'; c.fillRect(0, 0, w, h); c.fillStyle = '#17110d'; c.font = `700 60px ${SANS}`; c.fillText('FIVE DINNERS', 48, 100); c.fillStyle = 'rgba(23,17,13,.2)'; for (let i = 0; i < 12; i++) c.fillRect(48, 160 + i * 54, 300 + ((i * 131) % 220), 12); });
  const under = new THREE.Group(); under.rotation.y = rad(13); under.position.set(16, 0, -10);
  under.add(sh(new THREE.Mesh(new THREE.BoxGeometry(105, .8, 148), std({ color: 0xf1e3c6, roughness: .9 }))), decal(105, 148, .5, recipe)); g.add(under);
  const top = new THREE.Group(); top.position.y = 1;
  top.add(sh(new THREE.Mesh(new THREE.BoxGeometry(105, .8, 148), std({ color: 0xfbf4e6, roughness: .9 }))), decal(105, 148, .5, list)); g.add(top);
  const pen = new THREE.Group(); pen.position.set(44, 5.2, 34); pen.rotation.y = rad(62); pen.rotation.z = Math.PI / 2;
  pen.add(sh(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 96, 6), std({ color: 0xe3b23c, roughness: .5 }))), at(sh(new THREE.Mesh(new THREE.ConeGeometry(3.4, 13, 6), std({ color: 0xd2a871, roughness: .8 }))), 0, 54.5, 0), at(new THREE.Mesh(new THREE.ConeGeometry(1, 4, 6), std({ color: 0x151515 })), 0, 59.5, 0), at(sh(new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 7, 12), std({ color: 0xd98a8a, roughness: .8 }))), 0, -51.5, 0));
  g.add(pen);
});

// Podcast Manager: a small speaker
add('podcasts', 72, 132, 0, g => {
  const weave = tex(256, 64, (c, w, h) => { c.fillStyle = '#211e1c'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) for (let x = (y / 4 % 2) * 2; x < w; x += 4) { c.fillStyle = 'rgba(255,237,215,.07)'; c.fillRect(x, y, 2, 2); } });
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(10, 1.6);
  g.add(at(sh(new THREE.Mesh(new THREE.CylinderGeometry(40, 43, 34, 64), std({ map: weave, roughness: .95 }))), 0, 19, 0), at(sh(new THREE.Mesh(new THREE.CylinderGeometry(43.5, 43.5, 3, 64), std({ color: 0x111111, roughness: .6 }))), 0, 1.5, 0));
  const t = tex(512, 512, (c, w) => { c.fillStyle = '#1b1917'; c.fillRect(0, 0, w, w); c.fillStyle = CREAM; c.beginPath(); c.moveTo(214, 176); c.lineTo(336, 256); c.lineTo(214, 336); c.closePath(); c.fill(); });
  const top = new THREE.Mesh(new THREE.CircleGeometry(38.5, 64), std({ map: t, roughness: .5 })); top.rotation.x = -Math.PI / 2; top.position.y = 36.1; g.add(top);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(30, 1.6, 10, 80), new THREE.MeshBasicMaterial({ color: ORANGE })); ring.rotation.x = Math.PI / 2; ring.position.y = 36.4; g.add(ring);
});

// PMaaS: a beer mat, with the ring the last glass left on it
add('pmaas', 262, 130, rad(16), g => {
  const t = tex(900, 900, (c, w) => {
    c.fillStyle = '#f6ead2'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(120,90,50,${Math.random() * .05})`; c.fillRect(Math.random() * w, Math.random() * w, 2, 2); }      // pulp board
    c.strokeStyle = '#a3261c'; c.lineWidth = 24; c.beginPath(); c.arc(450, 450, 375, 0, 7); c.stroke(); c.lineWidth = 6; c.beginPath(); c.arc(450, 450, 339, 0, 7); c.stroke();
    c.fillStyle = '#a3261c'; c.textAlign = 'center'; c.font = `700 156px ${SANS}`; c.fillText('PMaaS', 450, 450);
    c.font = `500 45px ${MONO}`; c.fillStyle = '#17110d'; c.fillText('QUARTERLY', 450, 558); c.fillText('PINT REVIEW', 450, 618);
    // the stain: a wet ring, darker at its outer edge, broken where the glass sat unevenly, with a couple of drips
    c.save(); c.translate(520, 400); c.rotate(.7); c.lineCap = 'round';
    const ring = (r, wdt, a, from, to) => { c.strokeStyle = `rgba(122,74,22,${a})`; c.lineWidth = wdt; c.beginPath(); c.arc(0, 0, r, from, to); c.stroke(); };
    ring(246, 36, .12, 0, 7); ring(256, 15, .24, .2, 5.3); ring(262, 6, .5, .5, 4.9); ring(263, 4, .44, 5.6, 6.2); ring(238, 9, .14, 1.4, 3.6);
    c.fillStyle = 'rgba(122,74,22,.32)'; [[262, .9, 11], [274, 1.1, 6], [258, 3.4, 8], [270, 4.4, 5]].forEach(([r, a, s]) => { c.beginPath(); c.ellipse(Math.cos(a) * r, Math.sin(a) * r, s, s * .8, a, 0, 7); c.fill(); });
    c.restore();
  });
  g.add(slab(94, 94, 2.2, 9, std({ color: 0xe9dcc0, roughness: 1 })), decal(92.5, 92.5, 2.4, t, { roughness: 1 }));
});

// Pan lid generator: a slice of cupboard door with a glass lid hanging on its printed bar
add('lids', 262, -206, rad(-12), g => {
  g.scale.setScalar(.8);
  const ply = tex(256, 256, (c, w, h) => { c.fillStyle = '#c9a877'; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.strokeStyle = `rgba(90,55,20,${.04 + Math.random() * .08})`; c.lineWidth = 1 + Math.random() * 2; const x = Math.random() * w; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 6, h * .3, x - 6, h * .6, x + 3, h); c.stroke(); } });
  const wood = () => std({ map: ply, roughness: .8 });
  g.add(at(sh(new THREE.Mesh(new THREE.BoxGeometry(236, 262, 16), wood())), 0, 131, 0), at(sh(new THREE.Mesh(new THREE.BoxGeometry(236, 9, 84), wood())), 0, 4.5, 6));
  const petg = () => std({ color: 0xf07a2e, roughness: .62 });
  g.add(at(sh(new THREE.Mesh(new THREE.BoxGeometry(206, 16, 9), std({ color: 0xf2eee6, roughness: .7 }))), 0, 78, 12.5));
  for (const x of [-92, 92]) { const s = at(sh(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 3, 16), steel())), x, 78, 17.5); s.rotation.x = Math.PI / 2; g.add(s); }
  for (const x of [-54, 54]) g.add(at(sh(new THREE.Mesh(new THREE.BoxGeometry(20, 12, 26), petg())), x, 76, 22), at(sh(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 6), petg())), x, 84, 34));     // two cradles with lips
  g.add(at(sh(new THREE.Mesh(new THREE.BoxGeometry(18, 10, 22), petg())), 0, 240, 19), at(sh(new THREE.Mesh(new THREE.BoxGeometry(18, 18, 5), petg())), 0, 233, 30));                              // the hook over the top
  const lid = new THREE.Group(); lid.position.set(0, 150, 20); lid.rotation.x = Math.PI / 2;
  const dome = []; for (let i = 0; i <= 24; i++) { const r = i / 24 * 86; dome.push([r, 15 * (1 - (r / 86) ** 2)]); }
  const glass = lathe(dome, glassMat(), 96); glass.castShadow = false;
  const rim = sh(new THREE.Mesh(new THREE.TorusGeometry(86, 2.6, 14, 120), steel())); rim.rotation.x = Math.PI / 2;
  lid.add(glass, rim, at(sh(new THREE.Mesh(new THREE.CylinderGeometry(9, 12, 5, 32), steel())), 0, 17, 0), at(sh(new THREE.Mesh(new THREE.CylinderGeometry(17, 12, 15, 40), std({ color: 0x18181a, roughness: .4 }))), 0, 27, 0));
  g.add(lid);
});

// HA TickTick: retired. Only its outline is left on the mat, like the shadow of a missing tool
add('haticktick', 352, 122, rad(-8), g => {
  const t = tex(512, 512, (c, w) => {
    c.clearRect(0, 0, w, w); c.strokeStyle = 'rgba(255,237,215,.95)'; c.lineWidth = 7; c.setLineDash([26, 16]); c.beginPath(); c.roundRect(40, 40, w - 80, w - 80, 34); c.stroke(); c.setLineDash([]);
    c.save(); c.beginPath(); c.roundRect(44, 44, w - 88, w - 88, 30); c.clip(); c.strokeStyle = 'rgba(255,237,215,.16)'; c.lineWidth = 5; for (let k = -w; k < w; k += 30) { c.beginPath(); c.moveTo(k, w); c.lineTo(k + w, 0); c.stroke(); } c.restore();
    c.fillStyle = 'rgba(255,237,215,.95)'; c.textAlign = 'center'; c.font = `500 44px ${MONO}`; c.fillText('HA TICKTICK', w / 2, 250); c.font = `500 34px ${MONO}`; c.fillText('RETIRED', w / 2, 300);
  });
  g.add(decal(92, 92, .5, t, { transparent: true, roughness: 1 }));
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(70, 40, 70)), new THREE.LineDashedMaterial({ color: 0xffedd7, dashSize: 6, gapSize: 5, transparent: true, opacity: .5 }));
  e.computeLineDistances(); e.position.y = 21; g.add(e);
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(70, 40, 70), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })), 0, 21, 0));
});

// zigbrew: the real dosing ring and portafilter, part by part
const ZIG = [
  ['pf-body', 0xaab2bb, .95, .3, -58], ['pf-basket', 0xd0d5da, 1, .22, -30], ['pf-handle', 0x1b1b1d, .1, .5, -58], ['sleeve', 0xc9a66b, 0, .72, -8], ['screws', 0x3a3d40, .85, .45, 6],
  ['top', 0xe8e2d6, 0, .78, 34], ['cell', 0xb9c1ca, .9, .38, 66], ['carrier', 0xe8873a, 0, .7, 98], ['xiao', 0x2e7d4f, .2, .6, 122], ['hx711', 0x2f5fa8, .2, .6, 122], ['lipo', 0xd7a520, .3, .5, 146], ['lid', 0xf2eee6, 0, .78, 178],
];
const zig = add('zigbrew', -230, -130, rad(-14), () => {});
const zigAsm = new THREE.Group(); zigAsm.rotation.x = -Math.PI / 2; zig.inner.add(zigAsm);
{
  // an espresso on its saucer, behind the handle and clear of everything else, with a few beans beside it
  const china = () => new THREE.MeshPhysicalMaterial({ color: 0xf7f4ee, roughness: .16, clearcoat: .7, clearcoatRoughness: .12 });
  const smooth = (pts, n = 48) => new THREE.SplineCurve(pts.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(n).map(p => [Math.max(0, p.x), p.y]);
  const cup = new THREE.Group(); cup.position.set(166, 0, -84); cup.rotation.y = rad(35); zig.inner.add(cup);
  // saucer: a foot ring, a wide shallow dish and a raised well for the cup
  cup.add(lathe([[0, 0], [21, 0], [23, .6], [24, 2.2], ...smooth([[26, 3], [40, 5], [52, 8.4], [57, 11]], 20), [57.6, 11.8], [57, 12.5],
    ...smooth([[55, 11.4], [44, 7.6], [30, 5.2], [24, 4.4]], 20), [22.5, 4.6], [21.5, 4], [0, 4]], china(), 96));
  // cup: a small foot, a tulip body with a real wall thickness and a rounded lip
  const body = lathe([[0, 0], [13, 0], [14.6, .7], [15.2, 2.4], ...smooth([[16, 4], [21.5, 11], [26.5, 23], [29.4, 36], [30.4, 46]], 36), [30.6, 47.4], [30, 48.2], [29.2, 47.6],
    ...smooth([[28.8, 45], [27.6, 35], [24.6, 23], [19.4, 12.5], [12, 8.2], [0, 7.4]], 36)], china(), 96);
  body.position.y = 4; cup.add(body);
  const crema = tex(512, 512, (c, w) => {
    const g = c.createRadialGradient(236, 270, 20, 256, 256, 256); g.addColorStop(0, '#c98f43'); g.addColorStop(.55, '#a86a26'); g.addColorStop(.86, '#7a4516'); g.addColorStop(1, '#4a2609');
    c.fillStyle = g; c.fillRect(0, 0, w, w); c.lineCap = 'round';
    for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(${i % 2 ? '70,36,10' : '232,180,110'},${.1 + Math.random() * .16})`; c.lineWidth = 4 + Math.random() * 14; const r = 60 + Math.random() * 170, a = Math.random() * 7; c.beginPath(); c.arc(256 + Math.cos(a) * 14, 256 + Math.sin(a) * 14, r, a, a + .6 + Math.random() * 1.6); c.stroke(); }
    for (let i = 0; i < 46; i++) { const a = Math.random() * 7, r = 150 + Math.random() * 96; c.fillStyle = `rgba(245,215,165,${.25 + Math.random() * .35})`; c.beginPath(); c.arc(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, 1 + Math.random() * 3.4, 0, 7); c.fill(); }
  });
  const top = new THREE.Mesh(new THREE.CircleGeometry(28.3, 64), std({ map: crema, roughness: .32 })); top.rotation.x = -Math.PI / 2; top.position.y = 4 + 41.5; cup.add(top);
  // the handle: an ear that grows out of the wall near the lip and returns lower down
  const ear = new THREE.CatmullRomCurve3([[27.6, 41, 0], [35, 43.4, 0], [42.4, 38.6, 0], [43.6, 30, 0], [38.4, 22.6, 0], [28.6, 20.4, 0], [23.6, 21, 0]].map(p => new THREE.Vector3(...p)));
  const handle = sh(new THREE.Mesh(new THREE.TubeGeometry(ear, 40, 2.7, 14), china())); handle.scale.z = 1.5; handle.position.y = 4; cup.add(handle);
  // a teaspoon resting on the saucer
  const spoon = new THREE.Group(); spoon.position.set(3.5, 13.4, 40); spoon.rotation.set(0, rad(86), 0);
  const bowl = sh(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), steel())); bowl.scale.set(7.6, 1.5, 11); bowl.position.z = -31;
  const shaft = sh(new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 44, 4, 10), steel())); shaft.rotation.x = Math.PI / 2; shaft.scale.x = 1.9; shaft.scale.z = .5; shaft.position.z = 1;
  const grip = sh(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), steel())); grip.scale.set(4.2, .8, 9); grip.position.z = 26;
  spoon.add(bowl, shaft, grip); cup.add(spoon);

  const beanGeo = new THREE.SphereGeometry(1, 16, 12), beanMat = std({ color: 0x3a2313, roughness: .42 }), seamMat = std({ color: 0x1d1008, roughness: .6 });
  [[100, -128, .4], [113, -141, 1.9], [89, -143, 2.7], [123, -152, .9], [84, -123, 1.3], [104, -154, 2.2], [96, -112, 1.6]].forEach(([x, z, r]) => {
    const b = new THREE.Group(); b.position.set(x, 3.1, z); b.rotation.y = r;
    const body = sh(new THREE.Mesh(beanGeo, beanMat)); body.scale.set(5.4, 3.1, 3.8);
    const seam = new THREE.Mesh(new THREE.CapsuleGeometry(.5, 6.2, 3, 8), seamMat); seam.rotation.z = Math.PI / 2; seam.position.y = 2.75;     // the crease along the top
    b.add(body, seam); zig.inner.add(b); });
}
const zigParts = [];
const stl = new STLLoader();
const loadZig = ZIG.map(([id, color, metal, rough, ex]) => new Promise((res, rej) => stl.load(`/assets/bench/models/${id}.stl`, geo => {
  const m = sh(new THREE.Mesh(id === 'pf-basket' ? geo : toCreasedNormals(geo, rad(38)), std({ color, metalness: metal, roughness: rough })));
  m.userData.ex = ex; zigAsm.add(m); zigParts.push(m); L.progress(zigParts.length, ZIG.length); res();
}, undefined, rej)));

/* ---------- tags: a numbered balloon over each object, named on hover ---------- */
const tagBox = document.querySelector('.tags');
const rows = [...document.querySelectorAll('.bom .row')];
const info = id => { const r = rows.find(r => r.dataset.id === id); return r ? { no: r.querySelector('.no').textContent, name: r.querySelector('.nm').textContent, type: r.dataset.type } : { no: '', name: id, type: '' }; };
function makeTags() {
  OBJECTS.forEach(o => {
    const i = info(o.id); o.type = i.type;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tag'; b.dataset.id = o.id; b.dataset.type = i.type;
    b.innerHTML = `<b>${i.no}</b><span>${i.name}</span>`; b.setAttribute('aria-label', i.name);
    b.addEventListener('pointerenter', () => L.setHover(o.id)); b.addEventListener('pointerleave', () => L.setHover(null)); b.addEventListener('click', () => L.pick(o.id));
    tagBox.appendChild(b); o.tag = b;
  });
}

/* ---------- camera ---------- */
const v = (x, y, z) => new THREE.Vector3(x, y, z);
const K0 = { pos: v(-20, 560, 880), tgt: v(0, 0, -150) };         // across the bench
const K1 = { pos: v(0, 1500, 880), tgt: v(0, 0, 14) };          // the overview, beside the parts list
const smooth = t => t * t * (3 - 2 * t);
const camPos = v(0, 0, 0), camTgt = v(0, 0, 0), tmp = v(0, 0, 0), selPos = v(0, 0, 0), selTgt = v(0, 0, 0);
let W = 1, Hh = 1;

/* Selecting something moves the camera to it. `focus` is where the camera is looking in close-up and how far in it
   is (w: 0 = the overview, 1 = right in). Every change is an eased move: in from the overview, back out to it, or,
   between two things, pull back, travel across and push in again. It never cuts. */
const focus = { x: 0, z: 0, w: 0 };
let lastSel = null;
L.debug = { focus, camera };          // for checking camera moves from the console
function refocus() {
  if (L.selected === lastSel) return;
  const sel = OBJECTS.find(o => o.id === L.selected), g = window.gsap, already = focus.w > .05;
  lastSel = L.selected;
  if (!g) { if (sel) { focus.x = sel.home.x; focus.z = sel.home.z; } focus.w = sel ? 1 : 0; return; }
  g.killTweensOf(focus);
  if (!sel) { g.to(focus, { w: 0, duration: 1.2, ease: 'power2.inOut' }); return; }
  if (!already) { focus.x = sel.home.x; focus.z = sel.home.z; g.to(focus, { w: 1, duration: 1.4, ease: 'power2.inOut' }); return; }
  const far = Math.min(1, Math.hypot(sel.home.x - focus.x, sel.home.z - focus.z) / 500);          // further apart: pull back more, take longer
  const d = 1.1 + far * .6;
  g.to(focus, { x: sel.home.x, z: sel.home.z, duration: d, ease: 'power2.inOut' });
  g.timeline().to(focus, { w: 1 - .22 - far * .4, duration: d * .45, ease: 'sine.inOut' }).to(focus, { w: 1, duration: d * .55, ease: 'sine.inOut' });
}

/* ---------- pointer ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9);
let overCanvas = false, lastRay = null;
const toNdc = e => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
const under = () => { ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(OBJECTS.map(o => o.pick).filter(Boolean), false)[0]; return hit ? hit.object.userData.id : null; };
host.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; toNdc(e); overCanvas = e.target === canvas; }, { passive: true });
host.addEventListener('pointerleave', () => { overCanvas = false; if (lastRay) { lastRay = null; L.setHover(null); } });
canvas.addEventListener('click', e => { toNdc(e); L.pick(under()); });      // a tap needs no hover first

function resize() { W = host.clientWidth; Hh = host.clientHeight; renderer.setSize(W, Hh, false); camera.aspect = W / Hh; }
new ResizeObserver(resize).observe(host);
let visible = true; new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  if (!visible) return;
  const t = clock.getElapsedTime(), dt = Math.min(clock.getDelta ? .016 : .016, .05);

  // what the pointer is over
  if (overCanvas) {
    const id = under();
    if (id !== lastRay) { lastRay = id; L.setHover(id); canvas.style.cursor = id ? 'pointer' : ''; }
  }

  // each object: lifts when hovered or selected, half-lifts when its type is the active filter
  OBJECTS.forEach((o, n) => {
    const want = (L.hover === o.id || L.selected === o.id) ? 1 : (L.filter && L.filter === o.type ? .45 : 0);
    o.h += (want - o.h) * .12;
    o.g.position.y = o.home.y + o.h * 30 + (o.h > .01 ? Math.sin(t * 1.6 + n) * 1.5 * o.h : 0);
    o.g.rotation.y = o.rot + o.h * .22;
    o.inner.rotation.z = o.h * .05;
    o.inner.scale.setScalar(1 + o.h * .05);
    if (o.pick) o.pick.position.y = o.centre.y + o.h * 30;
  });
  ball.inner.children[0].rotation.x = ball.h * 1.4;
  if (watchHand) watchHand.rotation.y = -t * (.35 + ball.h * 5);        // the stopwatch runs; faster in your hand
  zigParts.forEach(m => { m.position.z = m.userData.ex * zig.h * .32; });     // zigbrew comes a little apart in your hand

  // camera: hero → overview, shifted left to make room for the list, then in towards whatever is selected
  const f = smooth(THREE.MathUtils.clamp(S.cam, 0, 1));
  camPos.lerpVectors(K0.pos, K1.pos, f); camTgt.lerpVectors(K0.tgt, K1.tgt, f);
  refocus();
  if (focus.w > .001) { selTgt.set(focus.x, 18, focus.z); selPos.copy(selTgt).add(tmp.set(-30, 452, 400)); camPos.lerp(selPos, focus.w * .78); camTgt.lerp(selTgt, focus.w * .9); }
  const back = Math.max(NARROW ? .8 : 1, (NARROW ? 1.16 : 1.5) / camera.aspect);
  tmp.subVectors(camPos, camTgt).multiplyScalar(back).add(camTgt);
  camera.position.copy(tmp); camera.lookAt(camTgt);
  const shift = S.shift * W;
  if (shift > .5) camera.setViewOffset(W, Hh, shift, 0, W, Hh); else camera.clearViewOffset();
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);

  // tags
  OBJECTS.forEach(o => {
    if (!o.tag) return;
    tmp.set(o.g.position.x, o.top + o.h * 30, o.g.position.z); if (o.centre) { tmp.x = o.centre.x; tmp.z = o.centre.z; }
    tmp.project(camera);
    const on = L.hover === o.id || L.selected === o.id;
    o.tag.style.transform = `translate(${(tmp.x * .5 + .5) * W}px, ${(-tmp.y * .5 + .5) * Hh}px) translate(-50%, -100%)`;
    o.tag.style.opacity = on ? 1 : S.over * (L.filter && L.filter !== o.type ? .25 : .9);
    o.tag.classList.toggle('on', on);
    o.tag.style.pointerEvents = (on || S.over > .5) ? 'auto' : 'none';
  });
}

Promise.all(loadZig).then(() => {
  // sit the ring on the mat with its middle over the group's origin (measured with the group untransformed)
  const keepPos = zig.g.position.clone(), keepRot = zig.g.rotation.y;
  zig.g.position.set(0, 0, 0); zig.g.rotation.y = 0; zig.g.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(zigAsm), c = box.getCenter(new THREE.Vector3());
  zigAsm.position.set(-c.x, -box.min.y, -c.z);
  zig.g.position.copy(keepPos); zig.g.rotation.y = keepRot;
  OBJECTS.forEach(finish);
  makeTags(); resize();
  renderer.compile(scene, camera);
  requestAnimationFrame(frame);
  L.ready();
}).catch(err => { console.error('landing3d: could not load the models', err); L.fail(err); });
