# marcuslab-site

Personal portfolio for Marcus Williams — showcases and links out to public
projects (YAMP, zigbrew, the pan lid rack, Podcast Manager, mDone,
ChukkaTimer, HA TickTick integration, PMaaS).

Static single-page site (`index.html`, no build step). Intended to be hosted
under **marcuslab.uk**.

- Design: the "bench" design language, defined in [`brand/`](brand/README.md) (tokens, logo
  files, guidelines and a visual guide at `/brand/guide.html`). The homepage is a live 3D
  workbench (three.js) with one object per project and a parts list beside it; the two zigbrew
  build logs under `projects/` use the same language. Scroll and loader animation is
  [GSAP](https://gsap.com/) (ScrollTrigger, SplitText) with Lenis, self-hosted in `vendor/`.
  Without JavaScript, or with reduced motion, every page is a plain readable document.
- Assets: `assets/bench/` holds the homepage scene and the dosing ring's part models (STL,
  exported from the `zigbrew-scales` CAD); `assets/zigbrew/` holds the build logs' shared
  styles and scripts. `archive/` keeps earlier design explorations.
- Not yet self-hosted: the Outfit and DM Mono fonts (Google Fonts) and three.js (jsDelivr).
  Until they are vendored the pages make third-party requests.
- Analytics: cookieless [Umami](https://umami.is), self-hosted at
  `stats.marcuslab.uk` (repo `marco308/umami`). Every page loads its tracker
  (`/m.js`) in `<head>`; the pages with outbound links also load `links.js`,
  which records clicks off-site as `outbound-link` events (URL, host, and the
  project card's title) and `mailto:` clicks as `email-click`. The tracker's
  `data-domains="marcuslab.uk"` means local previews are not counted. To keep
  your own visits out, run `localStorage.setItem('umami.disabled', 1)` in the
  console on marcuslab.uk.
- Colour: see `brand/tokens/contrast.md` for the measured contrast of every pairing.
- To preview: serve the folder (e.g. `python3 -m http.server`) and open it
  in a browser — the GSAP scripts and fonts are loaded from absolute paths.
