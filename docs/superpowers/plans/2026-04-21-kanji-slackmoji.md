# Kanji -> Slackmoji Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `Kanji to Slackmoji.html` Claude Design handoff into a deployable three-file static site and publish on GitHub Pages.

**Architecture:** Vanilla HTML/CSS/JS, zero build step. Split the single-file prototype into `index.html` (markup), `styles.css` (extracted `<style>`), `app.js` (extracted `<script>` with one change: drop the `window.claude.complete()` call). External deps via CDN.

**Tech Stack:** HTML5 + CSS3 + ES2020 JS. CDN: `gif.js@0.2.0`, `jszip@3.10.1`, Google Fonts. No package manager, no bundler.

**Source of truth:** The prototype HTML lives at `/tmp/kanji-bundle/kanji-to-slackmoji/project/Kanji to Slackmoji.html`. All extracted content in this plan comes from that file.

**Verification approach:** No test framework. Each task ends with a manual browser check — open the file, observe expected behavior. "Tests fail" = "feature broken in browser"; "tests pass" = "feature works as described".

---

### Task 1: Initialize repo and .gitignore

**Files:**
- Create: `/Users/justin/Projects/kanjiSlackmoji/.gitignore`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/justin/Projects/kanjiSlackmoji && git init -b main
```

Expected: `Initialized empty Git repository in /Users/justin/Projects/kanjiSlackmoji/.git/`

- [ ] **Step 2: Write .gitignore**

```
.DS_Store
node_modules/
*.log
.vscode/
.idea/
```

- [ ] **Step 3: Commit**

```bash
cd /Users/justin/Projects/kanjiSlackmoji && git add .gitignore docs/ && git commit -m "chore: init repo with design spec and plan"
```

---

### Task 2: Create index.html (markup only, links external CSS/JS)

**Files:**
- Create: `/Users/justin/Projects/kanjiSlackmoji/index.html`

- [ ] **Step 1: Write index.html**

Copy the full markup from the prototype, but:
- Replace inline `<style>...</style>` with `<link rel="stylesheet" href="styles.css">`
- Replace inline `<script>...</script>` with `<script src="app.js" defer></script>`
- Keep all `<link>` tags for Google Fonts and CDN `<script>` tags for `gif.js` and `jszip` as-is
- Keep all `<body>` markup exactly as in the prototype

Final file:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Kanji -> Slackmoji</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;700;900&family=Zen+Maru+Gothic:wght@500;700;900&family=Klee+One:wght@400;600&family=RocknRoll+One&family=Yuji+Syuku&family=Hachi+Maru+Pop&family=Reenie+Beanie&family=DotGothic16&family=Dela+Gothic+One&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>

<link rel="stylesheet" href="styles.css">
<script src="app.js" defer></script>
</head>
<body>
<div class="wrap">
  <!-- BODY MARKUP -->
</div>
</body>
</html>
```

Replace `<!-- BODY MARKUP -->` with the exact contents of `<div class="wrap">...</div>` from the prototype (lines 292-464 of the handoff file). Do not modify or re-order any element, attribute, id, or class.

- [ ] **Step 2: Manual check**

Open in browser: `open /Users/justin/Projects/kanjiSlackmoji/index.html`

Expected: Page loads, but is unstyled (no CSS yet) and non-interactive (no JS yet). The heading "Kanji -> Slackmoji" is visible, input fields exist, canvas elements exist. Console may warn about missing `styles.css` and `app.js` — that's expected until the next tasks.

- [ ] **Step 3: Commit**

```bash
cd /Users/justin/Projects/kanjiSlackmoji && git add index.html && git commit -m "feat: add index.html markup"
```

---

### Task 3: Extract styles.css

**Files:**
- Create: `/Users/justin/Projects/kanjiSlackmoji/styles.css`

- [ ] **Step 1: Write styles.css**

Copy the exact contents between `<style>` and `</style>` from the prototype (lines 18-288 of the handoff file) into `styles.css`. No edits.

- [ ] **Step 2: Manual check**

Reload `index.html` in the browser.

Expected:
- Cream/tan radial-gradient background.
- Two-column grid: controls card on the left, preview card on the right (collapses to one column under 980px).
- Aubergine-colored headings with numbered square badges.
- Cream-colored large kanji input placeholder `漢字`.
- Google Fonts loaded (Inter for UI, Noto Sans JP for kanji input).

- [ ] **Step 3: Commit**

```bash
cd /Users/justin/Projects/kanjiSlackmoji && git add styles.css && git commit -m "feat: add styles.css"
```

---

### Task 4: Extract app.js and drop the AI call

**Files:**
- Create: `/Users/justin/Projects/kanjiSlackmoji/app.js`

- [ ] **Step 1: Write app.js**

Copy the contents between `<script>` and `</script>` from the prototype (lines 467-1250 of the handoff file) into `app.js`. Then apply the one required change: replace the `suggestRomaji` function with a local-only version that skips the `window.claude.complete()` call.

Replace this block in the copied code:

```js
async function suggestRomaji(text) {
  try {
    const resp = await window.claude.complete(
      `Give a short English or romaji slack-emoji name for this Japanese: "${text}". Reply with ONLY the name, lowercase, a-z 0-9 and underscores only, max 20 chars, no colons, no quotes. If you don't know, give a short romaji transliteration.`
    );
    let s = String(resp).trim().toLowerCase();
    s = s.replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g,'').slice(0, 20);
    return s || null;
  } catch (e) {
    // fallback: very basic map for common chars
    const fallback = {'猫':'neko','犬':'inu','火':'hi','水':'mizu','龍':'ryuu','愛':'ai','夢':'yume','心':'kokoro','侍':'samurai','漢字':'kanji'};
    return fallback[text] || 'kanji';
  }
}
```

With this (local map only):

```js
async function suggestRomaji(text) {
  const fallback = {'猫':'neko','犬':'inu','火':'hi','水':'mizu','龍':'ryuu','愛':'ai','夢':'yume','心':'kokoro','侍':'samurai','漢字':'kanji'};
  return fallback[text] || 'kanji';
}
```

Keep everything else identical, including the `$` / `$$` helper definitions on their respective lines and all call sites.

- [ ] **Step 2: Verify `$` and `$$` helpers are both defined**

Run:

```bash
grep -n "^const \$" /Users/justin/Projects/kanjiSlackmoji/app.js
```

Expected output (two lines):

```
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
```

If only one line appears, the `$$` definition is missing and must be added. The chat transcript notes a past save mangled `$$` to `$`; verify it did not reappear during copy.

- [ ] **Step 3: Manual check — core rendering**

Reload `index.html`. Open DevTools console.

Expected:
- No console errors.
- Kanji input pre-filled with `漢字`, name input with `kanji`.
- Both preview canvases (light + dark) show the characters rendered in the Solid style, hot-pink (`#e01e5a`) on transparent.
- 12 style tiles render previews of `字` in each style.
- 10 animation tiles render.
- Slack-line mocks show the rendered emoji inline + as a reaction count.

- [ ] **Step 4: Manual check — interactions**

In the same tab:
- Type `猫` in the kanji input. Both previews update; 22/32/64px mini-previews update.
- Click the `犬<:inu:>` chip. Input flips to `犬`, name to `inu`, previews update.
- Click the **Gradient** style tile. Style becomes gradient. Tile gets an aubergine border.
- Click the **Bounce** animation tile. The previews begin animating vertically; a red `LIVE` badge appears on each preview stage.
- Drag the Size slider. Glyph size changes in real time. The value label updates (e.g. `86%` -> `64%`).
- Click a Foreground color swatch. Glyph color updates.

- [ ] **Step 5: Manual check — downloads**

- Click **Download PNG**. A file named `inu.png` (or matching name input) downloads. Open it — 128x128 transparent-bg PNG with the rendered emoji.
- Click **Download GIF** while Bounce is active. Progress bar fills; a GIF downloads. Open it — animated 128x128 with bounce motion.
- Set animation to **None**, click **Download GIF**. An alert says "Pick an animation first (or use Download PNG)."
- Click **Copy PNG**. Button flashes `Copied!`. Paste into a chat/image viewer — the 128x128 image is in the clipboard. (This only works on `https://` or `localhost`, not `file://`; if the button flashes `Failed`, defer this check to post-deploy.)

- [ ] **Step 6: Manual check — batch ZIP**

Paste `猫 犬 鳥 魚` into the batch textarea. Click **Download batch ZIP**. Progress bar fills; `slackmoji_batch.zip` downloads. Unzip — contains `kanji_01.png`, `kanji_02.png`, `kanji_03.png`, `kanji_04.png` (or `.gif` if an animation is selected).

- [ ] **Step 7: Manual check — Suggest button (local-only)**

Clear the name input. Type `猫` in the kanji input. Click **✨ Suggest**. Name input fills with `neko`. Try `漢字` — fills with `kanji`. Try an uncommon char not in the fallback map (e.g. `鬱`) — fills with `kanji` (the default fallback).

- [ ] **Step 8: Commit**

```bash
cd /Users/justin/Projects/kanjiSlackmoji && git add app.js && git commit -m "feat: add app.js (local-only romaji fallback)"
```

---

### Task 5: Write README

**Files:**
- Create: `/Users/justin/Projects/kanjiSlackmoji/README.md`

- [ ] **Step 1: Write README.md**

```markdown
# Kanji -> Slackmoji

Type a kanji, get a Slack-ready emoji. 128x128 PNG or animated GIF, downloadable or copy-to-clipboard. Runs entirely in the browser.

## Run locally

```bash
open index.html
```

Clipboard copy requires `https://` or `localhost`; most other features work off `file://`.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo -> Settings -> Pages -> Source: **Deploy from a branch**, Branch: **main** / **/ (root)**.
3. Visit `https://<user>.github.io/<repo>/`.

## Styles

Solid, Gradient, Outline, Hanko, Neon, Chrome, Pixel, Sumi-e, Sticker, 3D Drop, Rainbow, Varsity.

## Animations

None, Bounce, Spin, Pulse, Shake, Rainbow, Flash, Slide, Wiggle, Typewriter. Animated outputs are exported as GIF; static styles export as PNG.

## Upload to Slack

Slack -> Preferences -> Customize -> Add Custom Emoji. Wrap the name in colons.

## Credits

Canvas renderer with [gif.js](https://github.com/jnordberg/gif.js) and [JSZip](https://stuk.github.io/jszip/).
```

- [ ] **Step 2: Commit**

```bash
cd /Users/justin/Projects/kanjiSlackmoji && git add README.md && git commit -m "docs: add README with deploy notes"
```

---

### Task 6: Deploy to GitHub Pages (user action)

This task requires GitHub account credentials and is handed back to the user. The agent does not run these steps.

- [ ] **Step 1: Create remote repo**

User runs (e.g. via `gh`):

```bash
cd /Users/justin/Projects/kanjiSlackmoji && gh repo create kanjiSlackmoji --public --source=. --push
```

- [ ] **Step 2: Enable Pages**

Via GitHub web UI: Repo -> Settings -> Pages -> Source: Deploy from a branch, Branch: `main` / `/ (root)`. Save.

- [ ] **Step 3: Verify live URL**

Wait ~60s. Visit `https://<user>.github.io/kanjiSlackmoji/`. All features from Task 4 manual checks should work, including **Copy PNG** (which needed `https://`).

---

## Self-review

- **Spec coverage:** Stack (Task 2-4), file layout (Task 2-4), drop AI call (Task 4 Step 1), fix-mangled-`$$` verification (Task 4 Step 2), deployment (Tasks 5-6), features (verified in Task 4 Steps 3-7). All spec items covered.
- **Placeholders:** None. Every code block is complete.
- **Type consistency:** N/A (no type system). Helper names `$`/`$$`, state key names (`text`, `name`, `style`, etc.) match the prototype exactly since we copy verbatim.
