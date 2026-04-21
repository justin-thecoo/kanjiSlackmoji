# Kanji -> Slackmoji - Design

A single-page client-side tool that converts kanji into Slack-ready 128x128 PNG/GIF emoji. Implements the `Kanji to Slackmoji.html` handoff from Claude Design.

## Goals

- Recreate the prototype pixel-faithfully as a deployable static site.
- Zero build step. Zero server.
- Deploy to GitHub Pages.

## Non-goals

- AI-powered romaji suggestion (dropped per decision A - see "Changes from prototype").
- Authentication, persistence, analytics, backend of any kind.
- Framework migration (React/Vue/etc.) - the app is one screen with one global state object.

## Stack

- **Language:** vanilla HTML/CSS/JS.
- **Runtime deps (CDN):**
  - `gif.js@0.2.0` - animated GIF encoder.
  - `jszip@3.10.1` - batch ZIP export.
  - Google Fonts - Noto Sans/Serif JP, Zen Maru Gothic, Klee One, RocknRoll One, Yuji Syuku, Hachi Maru Pop, Reenie Beanie, DotGothic16, Dela Gothic One, Inter, JetBrains Mono.
- **Build step:** none.
- **Package manager:** none.

## File layout

```
/
  index.html       # markup only (head + body from prototype)
  styles.css       # extracted from prototype <style>
  app.js           # extracted from prototype <script>
  README.md        # short usage + deployment notes
  docs/superpowers/specs/  # this doc
```

Flat, three source files. `index.html` links `styles.css` and `app.js`.

## Features (from prototype)

All features ship as-is except the romaji AI call:

- Kanji input (up to 4 chars) with quick-pick chips.
- 12 style presets: Solid, Gradient, Outline, Hanko, Neon, Chrome, Pixel, Sumi-e, Sticker, 3D Drop, Rainbow, Varsity.
- 10 animations: None, Bounce, Spin, Pulse, Shake, Rainbow, Flash, Slide, Wiggle, Typewriter.
- Tweaks: font, fg/bg color (incl. transparent + custom picker), size %, padding, rotation, stroke, animation speed.
- Live dual preview (light + dark Slack backgrounds) with 22/32/64px actual-size samples and mock Slack message/reaction rows.
- Downloads: PNG (128x128), GIF (animated), copy-to-clipboard.
- Batch mode: paste multiple kanji -> ZIP of PNGs or GIFs.

## Changes from prototype

1. **Split into three files.** The prototype inlines CSS and JS into one HTML. Production layout separates them.
2. **Drop `window.claude.complete()` call.** The `✨ Suggest` button now uses only the existing hardcoded fallback map (`neko`, `inu`, `hi`, etc.). For unknown kanji, it falls back to `kanji`. The button itself stays; its title updates to reflect local-only behavior.
3. **Fix mangled-`$$` bug mentioned in chat transcript.** The prototype's chat log indicates `$$` got flattened to `$` during a save. Verify `$` and `$$` declarations on lines 537-538 of the handoff; re-check all `document.querySelectorAll` usages.

No visual, layout, or behavioral changes beyond these.

## Deployment

- **GitHub Pages, `main` branch, root.** Plain static hosting; no workflow needed.
- HTTPS is required for `navigator.clipboard.write` (Copy PNG). GH Pages provides this.
- First-time setup (user runs): `git init`, create repo, push, enable Pages in repo settings.

## Risks

- **Font loading delay.** `document.fonts.ready` is awaited before first render (prototype already does this).
- **GIF worker CORS.** `gif.worker.js` is loaded cross-origin from jsdelivr; already working in the prototype.
- **Clipboard API availability.** Not on `file://`. Copy PNG silently fails locally - acceptable; users deploy to GH Pages for the real experience.
