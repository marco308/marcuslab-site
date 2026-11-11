# Marcus Lab design language

Version 0.1, November 2026. Status: draft, taken from the `prototypes/` work. Nothing on the live site uses it yet.

Open [`guide.html`](guide.html) through the local server (`http://localhost:8000/brand/guide.html`) to see all of this drawn.

## What is in this folder

| Path | What it is |
|---|---|
| `tokens/marcuslab.tokens.json` | **The source of truth.** Every colour, size, duration and the logo's geometry, in the W3C Design Tokens format. |
| `tokens/tokens.css` | The same values as CSS custom properties (`--ml-…`). Generated. |
| `tokens/contrast.md` | WCAG contrast for every colour pairing that matters. Generated. |
| `logo/svg/` | The mark, icons and lockups as SVG. Generated. |
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

The mark is **Section A–A**: a capital M drawn as a half section. The left half is the solid part, the right half is the cut face with 45° hatching, and an orange chain line (the centre line of an engineering drawing) runs between them.

### Which file

| Use | File |
|---|---|
| On dark, olive or wood | `mark-cream.svg` |
| On cream or white | `mark-ink.svg` |
| One colour only (engraving, embossing into a print, a single-ink job) | `mark-mono-*.svg` |
| Large and with room to breathe: a hero, the loader, a cover | `mark-full-*.svg`, which adds the A–A section arrows |
| 16 to 23 px | `mark-micro-*.svg` or `icon-micro-*.svg` |
| App icon, favicon, avatar | `icon-olive.svg` (default), `icon-ink.svg`, `icon-cream.svg` |
| iOS and Android icons that the system rounds itself | `icon-square-olive.svg` |
| Mark beside the name, as in a nav bar | `lockup-nameplate-*` |
| Mark above the name, as on the loader or a cover | `lockup-signature-*` |

The name in the lockups is live text in Outfit 700. Use the PNG wherever the font can't be guaranteed, and convert the text to outlines before sending an SVG lockup to print.

### Rules

- **Clear space:** keep one leg-width of the M (9.5 units of the 64-unit grid, about 17% of the mark's width) empty on every side.
- **Smallest size:** 24 px for the mark. Below that the hatching closes up, so use the micro mark: a solid left half, a lighter right half and a gap for the cut. Never smaller than 16 px.
- **The arrows** only appear at 96 px and above.
- **The centre line is orange** on every ground except in the one-colour versions. It has low contrast on olive (2.2:1). That is accepted for the logo only: never set orange text or controls on olive.
- **Don't** redraw it, change the hatch angle, fill the hatched half, drop the outline, recolour the two halves differently, rotate it, add a shadow or glow, or put it in a terminal-style tile.

### Colourways

Olive tile with a cream mark is the default icon. Dark tile and cream tile are alternatives for when olive clashes with its surroundings.

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

**Kinds of project** each have a colour, used as a small square or a ring beside the kind's name. Colour is never the only cue.

| Kind | Colour |
|---|---|
| App | `#62a3ea` |
| Server | `#f08a3c` |
| Hardware | `#f5c12e` |
| Printed | `#f486a3` |
| Odds & ends | `#cfc4b0` |

**Status** is a lamp: lit green (`#4fe06a`) for live, dark (`#4a4038`) for retired. Always with the word beside it.

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
- Both faces come from Google Fonts in the prototypes. The live site makes no third-party requests, so self-host them before launch.

## Layout

- **Spacing** steps: 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Page side padding is `clamp(18px, 4vw, 56px)`.
- **Corners:** panels, cards and rows are square, like cut sheet. Buttons and filter chips are pills. Balloons and lamps are round.
- **Lines:** a 3 px cream line is the edge of a real thing. A 1.5 px line is a rule. A 1 px dotted cream line at 45% separates rows. An orange chain line (dash 8 2 1.6 2) is a centre line and appears at most once on a screen.
- **The mat grid** is cream lines on olive: every 20 px at 8%, every 100 px at 20%.
- **Phones first-class.** Below 900 px there is no pinned scrolling. A 3D view sticks under the nav at about 40% of the screen height and content scrolls beneath it. Tap targets are at least 44 px.
- **No sideways-scrolling carousels.** If there are eight things, show eight things.

## Components

Built in `prototypes/landing.html`; drawn in the guide.

- **Nav:** the mark and name on the left, links in Outfit 600 caps on the right, over a fade from the ground colour. Solid on phones.
- **Button:** a pill with a 1.5 px cream outline, Outfit 600 caps. The primary is filled orange with ink text.
- **Filter chip:** a small mono pill with the kind's colour square. The pressed chip is filled cream with ink text.
- **Parts list:** one row per thing. A numbered balloon ringed in the kind's colour, the name in caps, a one-line description, the kind, and a status lamp. Rows expand in place.
- **Balloon tag:** the same number floating over an object. On hover it fills with the kind's colour and the name slides out.
- **Lamp:** a small glowing dot with its word.
- **Frosted card:** ink at 50% with a blur, for text that has to sit over the bench.
- **Figure:** a photo on cream with a strip of orange tape, captioned in mono as `FIG. 3 · THE OPERATOR`.
- **Loader:** the mark draws itself on the mat, then the screen parts along the centre line.

## Motion

- **Everything is drawn or moved in.** Stroke lines by their length, wipe fills, write text as outlines and then ink it. No fading up from nothing as the main effect, no popping, no bounce or overshoot.
- **Overlap.** The next thing starts before the last one finishes, so something is always moving.
- **Eases, by job:** `flow` (sine in-out) for lines and wipes, `draw` (power1 in-out) for one long stroke, `move` (power3 out) for things arriving, `part` (expo in-out) for big set pieces.
- **Durations:** 200 ms for feedback, 450 ms for small moves, 900 ms for a stroke or wipe, 1.6 s for a camera move. The landing loader runs about 4.5 s; inner pages half that.
- **Scroll:** scrub at about 0.8. Pin only on wide screens and only for the main story of a page.
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

- First person, dry, specific. "Fortunately, this one is good." "Faintly ridiculous."
- British English and metric units.
- **Labels** are short capitals in mono, as on a machine or a drawing: `PARTS LIST`, `LIVE`, `RETIRED`.
- **Drawing notes** are reused where they happen to be true: `DO NOT SCALE` in a footer, `IF IN DOUBT, ASK` for contact, `FIG. 2` for captions.
- Never invent facts, numbers or steps. Copy comes from Marcus.
- No exclamation marks, no marketing adjectives, no emoji as decoration.

## Accessibility

- Text contrast of at least 4.5:1; check new pairings against `contrast.md`.
- A visible focus ring: 2 px orange, 3 px offset.
- Colour is never the only signal. Kinds have names, lamps have words.
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
- Poor stand-in renders: a pint of beer, earbuds.
- A plain, non-3D fallback as the phone experience.

## Open questions

- **Fonts** need self-hosting before launch.
- **three.js** is loaded from a CDN in the prototypes and needs vendoring.
- **The portafilter model** is a published Breville model; check its licence before it goes public.
- **Lockup SVGs** contain live text. Outlined versions need the Outfit font file and a tool to convert it.
- **A light theme** has not been designed.
- **The live site** (`index.html`, the favicon, the social image) still uses the old terminal look.
