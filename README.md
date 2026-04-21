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
