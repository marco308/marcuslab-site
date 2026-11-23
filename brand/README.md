# Marcus Lab design language

Version 0.1, November 2026. Status: in use. marcuslab.uk has run on it since 12 November 2026: the homepage, both zigbrew build logs and the 404 page.

Open [`guide.html`](guide.html) through the local server (`http://localhost:8000/brand/guide.html`) to see all of this drawn.

## What is in this folder

| Path | What it is |
|---|---|
| `tokens/marcuslab.tokens.json` | **The source of truth.** Every colour, size, duration and the logo's geometry, in the W3C Design Tokens format. |
| `tokens/tokens.css` | The same values as CSS custom properties (`--ml-…`). Generated. |
| `tokens/contrast.md` | WCAG contrast for every colour pairing that matters. Generated. |
| `logo/svg/` | The mark, icons and lockups as SVG, and project marks (`zigbrew-*`). Generated. |
| `logo/png/` | Favicons, app icons, the social card and lockups as PNG. Generated. |
| `guide.html` | The visual guide. |
| `tools/build.py` | Regenerates everything above from the tokens. |

To change anything, edit the tokens file and rebuild:

```bash
python3 brand/tools/build.py --png
```

## The idea

**Marcus Lab is a workbench.** Everything on it is real, was made by the person showing it to you, and can be picked up and taken apart.

Four rules follow from that. When a decision is unclear, these settle it.

1. **Show the real thing.** Real CAD models, real screenshots, real photos, Marcus's own words. If the real thing isn't available, leave it out. A bad stand-in is worse than a gap.
2. **Draw it in.** Nothing just appears. Lines are stroked, shapes fill, objects arrive from somewhere. If it can't be drawn or moved in, it probably shouldn't animate at all.
3. **Cut it open.** The logo is a section view. The site shows how things work, including the mistakes.
4. **Say it plainly.** Dry, specific, first person. The engineering references are real ones, used correctly.

## Logo

The mark is **Section A–A**: a capital M drawn as a half section. The left half is the solid part, the right half is the cut face with 45° hatching that falls to the right (so it crosses the M's diagonal instead of running along it), and an orange chain line (the centre line of an engineering drawing) runs between them.

### Which file

| Use | File |
|---|---|
| On dark, olive or wood | `mark-cream.svg` |
| On cream or white | `mark-ink.svg` |
| One colour only (engraving, embossing into a print, a single-ink job) | `mark-mono-*.svg` |
| Large and with room to breathe: a hero, the loader, a cover | `mark-full-*.svg`, which adds the A–A section arrows |
| 16 to 23 px, and tab icons up to 32 px | `mark-micro-*.svg` or `icon-micro-*.svg` |
| App icon, favicon, avatar | `icon-olive.svg` (default), `icon-ink.svg`, `icon-cream.svg` |
| iOS and Android icons that the system rounds itself | `icon-square-olive.svg` |
| Mark beside the name, as in a nav bar | `lockup-nameplate-*` |
| Mark above the name, as on the loader or a cover | `lockup-signature-*` |

The name in the lockups is live text in Outfit 700. Use the PNG wherever the font can't be guaranteed, and convert the text to outlines before sending an SVG lockup to print.

### Rules

- **Clear space:** keep one leg-width of the M (9 units of the 64-unit grid, about 16% of the mark's width) empty on every side.
- **Smallest size:** 24 px for the mark. Below that the hatching closes up, so use the micro mark: a solid left half, a lighter right half and the cut as a solid orange bar, one pixel wide at 16 px. Never smaller than 16 px.
- **The arrows** only appear at 96 px and above.
- **The centre line** is three long dashes and two dots, with a long dash at each end. It is orange on every ground except in the one-colour versions, where the two halves stop short of it so the cut still shows. It has low contrast on olive (2.2:1). That is accepted for the logo only: never set orange text or controls on olive.
- **Don't** redraw it, change the hatch angle, fill the hatched half, drop the outline, recolour the two halves differently, rotate it, add a shadow or glow, or put it in a terminal-style tile.

### Colourways

Olive tile with a cream mark is the default icon. Dark tile and cream tile are alternatives for when olive clashes with its surroundings.

### Project marks

A project can have its own mark. It is a different shape drawn by the same rules, so it reads as a sibling of Section A–A: the same 64-unit square, cut down the centre line, left half solid, right half hatched at 45°, the same edge weight and the orange chain line. The shape is something real from the project. Geometry lives in the `project-marks` group of the tokens file and `tools/build.py` draws the files.

**zigbrew** is the dosing ring from part two, seen from above: a ring with three lugs, one at the top.

| Use | File |
|---|---|
| On dark, olive or wood | `zigbrew-mark-cream.svg` |
| On cream or white | `zigbrew-mark-ink.svg` |
| One colour only | `zigbrew-mark-mono-cream.svg`, `zigbrew-mark-mono-ink.svg` |
| 16 to 23 px | `zigbrew-mark-micro-*.svg`, `zigbrew-icon-micro-olive.svg` |
| Favicon or icon for the project's pages | `zigbrew-icon-olive.svg` |

- The Marcus Lab mark's rules apply: 24 px smallest for the full mark, 16 px for the micro one, no rotating, stretching, recolouring, shadows or orange grounds.
- A project mark never replaces the Marcus Lab mark in the nav. It sits with the project's own name: a breadcrumb, a page's favicon, a card.
- The ring's lugs reach further out than the M does, so its file has a slightly larger canvas. At the same pixel size it reads a little smaller than the M; give it about 8% more when the two sit side by side.
- There are no zigbrew lockups yet.

**Drawer Illumination Subsystem** (the drawer lights) is the dressing-room unit from the front: the top over three columns of drawers, three shallow and one deep. Its files are `drawers-*` and follow the zigbrew table above. The small version has three rows instead of four, so every gap is at least a pixel at 16 px; use it below 24 px. Gaps in the big mark are 4 units, because the 2.6 edge closes anything narrower.

## Colour

Raw scales are in the tokens. In layouts, use the roles.

| Role | Token | Value | Use |
|---|---|---|---|
| Ground | `color.role.ground` | `#17110d` | The page. A warm near-black, never pure black. |
| Surface | `color.role.surface` | `#221812` | Panels and rows raised off the ground. |
| Text | `color.role.text` | `#ffedd7` | All text and every drawn line. Secondary text is the same cream at 75%. |
| Accent | `color.role.accent` | `#e8590c` | The one signal colour: the centre line, cut faces, the primary action, focus rings, small mono captions. |
| On accent | `color.role.on-accent` | `#17110d` | Text on orange is ink. Cream on orange fails contrast. |
| Mat | `color.role.mat` | `#46583a` | The cutting mat: the loader, feature grounds, the icon. |
| Desk | `color.wood.*` | `#693f22` to `#87572f` | Wood, as a gradient with grain. A ground for big type, not for long text. |

**Two kinds of thing** each have a colour, used as a small square or a ring beside the kind's name. Colour is never the only cue.

| Kind | Colour | What it covers |
|---|---|---|
| Software | `#62a3ea` | Apps, servers and anything else that is code |
| Build | `#f5c12e` | Things you can hold: hardware and printed parts |

There were five kinds at first (app, server, hardware, printed, odds and ends). Apps and servers overlapped too much to be worth telling apart, so they were merged.

**Status** isn't shown for things in use. Something no longer maintained says `RETIRED` in mono after its kind, dimmed. There are no status lamps: a green "live" dot on every row said nothing (removed 22 November 2026).

See [`tokens/contrast.md`](tokens/contrast.md). The pairings to avoid: cream text on orange, and orange on olive or cream for anything that must be read.

## Type

| Role | Face | Setting |
|---|---|---|
| The name, at hero size | Outfit 700 | Uppercase, tracking −0.03em, leading 0.86 |
| Headings | Outfit 700 | Uppercase, tracking −0.02em, leading 0.95 |
| Body and leads | Outfit 500 | Sentence case, 17 px, leading 1.5, at most 62 characters a line |
| Labels, specs, tags, captions | DM Mono 400/500 | Uppercase, tracking 0.08em, 11 to 12.5 px |

- Outfit is for anything Marcus says. DM Mono is for anything the bench says: labels, part numbers, drawing notes.
- Nothing is set smaller than 11 px.
- Both faces are self-hosted on the site, in `vendor/fonts/bench-fonts.css`.

## Layout

- **Spacing** steps: 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Page side padding is `clamp(18px, 4vw, 56px)`.
- **Corners:** panels, cards and rows are square, like cut sheet. Buttons and filter chips are pills. Balloons are round.
- **Lines:** a 3 px cream line is the edge of a real thing. A 1.5 px line is a rule. A 1 px dotted cream line at 45% separates rows. An orange chain line (dash 8 2 1.6 2) is a centre line and appears at most once on a screen.
- **The mat grid** is cream lines on olive: every 20 px at 8%, every 100 px at 20%.
- **Phones first-class.** Below 900 px there is no pinned scrolling. A 3D view sticks under the nav at about 40% of the screen height and content scrolls beneath it. Tap targets are at least 44 px.
- **No sideways-scrolling carousels.** If there are eight things, show eight things.

## Components

Built in `index.html`, with the 3D bench in `assets/bench/landing3d.js`. Write-ups (`projects/`) use their own plain kit, `assets/writeup/`: see the marcuslab-writeup skill. All are drawn in the guide.

- **Nav:** the mark and name on the left, links in Outfit 600 caps on the right, over a fade from the ground colour. Solid on phones.
- **Button:** a pill with a 1.5 px cream outline, Outfit 600 caps. The primary is filled orange with ink text.
- **Filter chip:** a small mono pill with the kind's colour square. The pressed chip is filled cream with ink text.
- **Projects list:** one row per thing, headed `PROJECTS`. The project's own logo (its app icon, or its project mark on olive), the name in caps, a one-line description, the kind, and `RETIRED` if it is. Rows expand in place to a short paragraph and its links, with no tech-stack tags.
- **Balloon tag:** the same number floating over an object. On hover it fills with the kind's colour and the name slides out.
- **Frosted card:** ink at 50% with a blur, for text that has to sit over the bench.
- **Figure:** on the homepage, a photo on cream with a strip of orange tape. In a write-up, a plain photo at the one figure width with an optional plain-sentence caption: no tape, tilt or figure numbers (23 November 2026).
- **Loader:** the mark draws itself on the mat, then the screen parts along the centre line. Taken off the homepage on 23 November 2026; it lives on its own at `/brand/loader/` for video intros (`?controls=0` for a clean recording, `?once` to play it once).

## Motion

**No page has a loader (23 November 2026).** **Write-ups are one plain column (23 November 2026):** readers on Reddit said the design "jumps all over the place in each section", so every write-up now uses `assets/writeup/` and nothing else for layout. **Reading pages are still (22 November 2026).** Build logs, listings and anything else people come to read open straight away: no loader, the browser's own scrolling (no smooth-scroll library), and nothing revealed or drawn in on scroll. Readers on Reddit called the loader a "bootup screen" and the smooth scroll broken. Motion on those pages is only for things that show something: an interactive demo, a video or loop of the thing working. The one exception is zigbrew part two, which keeps its scroll-driven 3D dosing ring, smooth scroll and all, because Marcus likes it. The rules below are for the homepage, where the bench and its 3D objects are the point, and for that page.

- **Everything is drawn or moved in.** Stroke lines by their length, wipe fills, write text as outlines and then ink it. No fading up from nothing as the main effect, no popping, no bounce or overshoot.
- **Overlap.** The next thing starts before the last one finishes, so something is always moving.
- **Eases, by job:** `flow` (sine in-out) for lines and wipes, `draw` (power1 in-out) for one long stroke, `move` (power3 out) for things arriving, `part` (expo in-out) for big set pieces.
- **Durations:** 200 ms for feedback, 450 ms for small moves, 900 ms for a stroke or wipe, 1.6 s for a camera move. The loader (now only at `/brand/loader/`, for video) draws for about 3.5 s, then parts in about 1.1 s.
- **Scroll:** on the homepage, scrub at about 0.8 and pin only on wide screens. Reading pages never take over scrolling.
- **Reduced motion or no JavaScript:** every word, image and link is visible and readable as a plain page.
- **It must be real.** Cross-fading still renders is not animation.

## 3D

- **Real geometry first.** Export parts from the CAD, one file per part, in assembled coordinates, so they can be exploded and sectioned.
- **Units are millimetres.** Objects on the bench are their true size against each other.
- **Light:** one warm key light with soft shadows, a hemisphere fill, a neutral room environment for reflections. ACES tone mapping at 0.92 exposure.
- **Materials** come from `color.material.*`, so printed cream, tan and orange PETG, steel, titanium, china and plywood look the same on every page.
- **A section** is a clipping plane. Cut faces are flat colour: orange for printed parts, grey for metal.
- **Stand-ins** are allowed only when they look right at the size they are shown. Otherwise remove them.
- **Pointer:** objects lift and lean when picked up. Things with moving parts move.
- **Phones:** lighter glass, smaller shadow maps, and no object left unframed.

## Voice

- First person, dry, specific. "Fortunately, this one is good." Make the joke once and don't explain it.
- British English and metric units.
- **Labels** are short capitals in mono, as on a machine or a drawing: `PARTS LIST`, `BUILD`, `RETIRED`.
- **No drawing-note gags** (23 November 2026): no `DO NOT SCALE`, `IF IN DOUBT, ASK`, `SHEET 1 OF 2` or `FIG. 2` anywhere. Marcus called them silly; readers read them as filler.
- Never invent facts, numbers or steps. Copy comes from Marcus.
- No exclamation marks, no marketing adjectives, no emoji as decoration.

## Accessibility

- Text contrast of at least 4.5:1; check new pairings against `contrast.md`.
- A visible focus ring: 2 px orange, 3 px offset.
- Colour is never the only signal. Kinds have names beside their colour.
- Decorative 3D and drawings are hidden from screen readers; the same content exists as text.
- Honour `prefers-reduced-motion`.

## Rejected, so don't bring them back

These were tried and turned down while this language was being worked out.

- A terminal prompt or any generic developer glyph as the logo.
- Simple monograms in app-icon tiles.
- Line-art "workshop manual" styling: exploded letters, numbered callout balloons on white paper.
- A dark terminal look with a mint accent.
- Sideways-scrolling project carousels.
- Still images cross-fading in place of animation.
- Elements that pop or fade in on a loader.
- On reading pages: a loader, a smooth-scroll library, and text or photos revealed on scroll (removed 22 November 2026).
- Poor stand-in renders: a pint of beer, earbuds.
- A plain, non-3D fallback as the phone experience.
- Status lamps (a green dot and `LIVE` on every row) and tech-stack tag lines (`SWIFT · IOS · MIT`) in the parts list: they added nothing.
- Numbered balloons in the homepage list (replaced by each project's logo, 23 November 2026).
- In write-ups, a different visual device in every section: olive mat and wood bands, tilted taped photos, drawing-sheet title blocks, "FIG. n" numbering, labels above headings, note cards, stat tiles, chips (removed 23 November 2026; Reddit: "the design jumps all over the place").
- Any loader, on any page (23 November 2026).

## Open questions

- **The portafilter model** in the zigbrew scenes is a published Breville model (espressoshock's BES870 portafilter on GrabCAD). Marcus checked its licence on 12 November 2026 and it is fine to use; keep the credit where the model appears. This one is closed.
- **The zigbrew mark** has no lockups, and `pf-basket.stl` in `assets/bench/models/` is a second copy of the whole portafilter head rather than the basket alone.
- **Lockup SVGs** contain live text. Outlined versions need the Outfit font file and a tool to convert it.
- **A light theme** has not been designed.
