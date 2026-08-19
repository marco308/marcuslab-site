# marcuslab-site

Personal portfolio for Marcus Williams — showcases and links out to public
projects (YAMP, mDone, ChukkaTimer, HA TickTick integration, PMaaS).

Static single-page site (`index.html`, no build step). Intended to be hosted
under **marcuslab.uk**.

- Design: dark terminal aesthetic (JetBrains Mono + Inter, mint accent),
  animated with [GSAP](https://gsap.com/) — ScrollTrigger, SplitText and
  ScrambleText, self-hosted in `vendor/gsap/`. Degrades gracefully: without
  JS the page renders fully, just without motion.
- Between the work grid and the about section sits a pinned statement band
  (`#statement`) that scrolls one line sideways while each character drops
  into place, via ScrollTrigger's `containerAnimation`. Desktop only — under
  821px, with reduced motion, or with no JS it renders as a plain pull-quote.
- Typography: mono is for text that is literally code or machine chrome
  (`const things_ive_made`, `build()`, tags, the terminal, nav, buttons);
  Inter is for prose, headings included. Both are self-hosted variable
  fonts in `vendor/fonts/` — one `.woff2` per family covers every weight,
  so the page makes no third-party requests at all.
- Colour: every text token clears WCAG AA (4.5:1) against all four
  surfaces (`--bg`, `--bg-2`, `--panel`, `--panel-2`).
- To preview: serve the folder (e.g. `python3 -m http.server`) and open it
  in a browser — the GSAP scripts and fonts are loaded from absolute paths.
