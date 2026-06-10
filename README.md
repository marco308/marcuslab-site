# marcuslab-site

Personal portfolio for Marcus Williams — showcases and links out to public
projects (mDone, ChukkaTimer, HA TickTick integration, PMaaS).

Static single-page site (`index.html`, no build step). Intended to be hosted
under **marcuslab.uk**.

- Design: dark terminal aesthetic (JetBrains Mono + Inter, mint accent),
  animated with [GSAP](https://gsap.com/) — ScrollTrigger, SplitText and
  ScrambleText, self-hosted in `vendor/gsap/`. Degrades gracefully: without
  JS the page renders fully, just without motion.
- To preview: serve the folder (e.g. `python3 -m http.server`) and open it
  in a browser — the GSAP scripts are loaded from absolute paths.
