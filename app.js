// ============================================================
//  Kanji → Slackmoji
// ============================================================

// ---------- state ----------
const state = {
  text: '',
  name: '',
  style: 'solid',
  anim: 'none',
  font: '',
  fg: '#e01e5a',
  bg: 'transparent',
  size: 86,    // % of canvas
  pad: 6,      // px padding in 128 space
  rot: 0,
  stroke: 0,
  speed: 100,  // %
};

// ---------- palettes ----------
const FG_COLORS = [
  '#1a1423', '#ffffff', '#e01e5a', '#ecb22e', '#2eb67d', '#36c5f0',
  '#4a154b', '#ff6f61', '#8a2be2', '#00c49a', '#ff8c42', '#2b6cb0',
];
const BG_COLORS = [
  'transparent', '#ffffff', '#1a1423',
  '#fff8ec', '#ffe1ec', '#e0f7ee', '#e6f2ff', '#fff4d1',
  '#ecb22e', '#2eb67d', '#e01e5a', '#4a154b',
];

// ---------- styles ----------
const STYLES = [
  { id: 'solid',     name: 'Solid' },
  { id: 'gradient',  name: 'Gradient' },
  { id: 'outline',   name: 'Outline' },
  { id: 'hanko',     name: 'Hanko' },
  { id: 'neon',      name: 'Neon' },
  { id: 'chrome',    name: 'Chrome' },
  { id: 'pixel',     name: 'Pixel' },
  { id: 'sumi',      name: 'Sumi-e' },
  { id: 'sticker',   name: 'Sticker' },
  { id: 'shadow',    name: '3D Drop' },
  { id: 'rainbow',   name: 'Rainbow' },
  { id: 'varsity',   name: 'Varsity' },
];

// ---------- animations ----------
const ANIMS = [
  { id: 'none',     name: 'None',     ico: '■' },
  { id: 'bounce',   name: 'Bounce',   ico: '↕' },
  { id: 'spin',     name: 'Spin',     ico: '↻' },
  { id: 'pulse',    name: 'Pulse',    ico: '◉' },
  { id: 'shake',    name: 'Shake',    ico: '↔' },
  { id: 'rainbow',  name: 'Rainbow',  ico: '🌈' },
  { id: 'flash',    name: 'Flash',    ico: '⚡' },
  { id: 'slide',    name: 'Slide',    ico: '➤' },
  { id: 'wiggle',   name: 'Wiggle',   ico: '〰' },
  { id: 'typewriter', name: 'Reveal', ico: '▌' },
];

// ---------- quick suggestions ----------
const QUICKS = [
  { k:'漢字', r:'kanji'}, { k:'猫', r:'neko'}, { k:'犬', r:'inu'},
  { k:'火', r:'hi'}, { k:'水', r:'mizu'}, { k:'龍', r:'ryuu'},
  { k:'愛', r:'ai'}, { k:'無', r:'mu'}, { k:'夢', r:'yume'},
  { k:'侍', r:'samurai'}, { k:'心', r:'kokoro'},
];

// ---------- helpers ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;

function setFontSize(fontTemplate, px) {
  return fontTemplate.replace('NNNpx', px + 'px');
}

// hue shift a hex
function hexToHSL(hex){
  const c = hex.replace('#','');
  const r = parseInt(c.substr(0,2),16)/255;
  const g = parseInt(c.substr(2,2),16)/255;
  const b = parseInt(c.substr(4,2),16)/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      case b: h=(r-g)/d+4; break;
    }
    h/=6;
  }
  return [h*360, s*100, l*100];
}
function hsl(h,s,l){ return `hsl(${h},${s}%,${l}%)`; }

// ---------- canvas core draw ----------
// Draws the emoji into a canvas at `size` pixels square. `frame` is animation progress 0..1.
function drawEmoji(ctx, size, frame=0, opts={}) {
  const s = { ...state, ...opts };
  const text = s.text || '字';

  // clear
  ctx.save();
  ctx.clearRect(0, 0, size, size);

  // -- background (with animation for flash etc) --
  let bg = s.bg;
  if (s.anim === 'flash') {
    // alternate bg between normal and accent every half-cycle
    const on = (frame % 1) < 0.5;
    if (!on && bg === 'transparent') bg = s.fg === '#ffffff' ? '#1a1423' : '#ffffff';
    else if (!on) bg = 'transparent';
  }
  if (bg && bg !== 'transparent') {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }

  // -- hanko special: red circle ink behind --
  if (s.style === 'hanko') {
    const r = size/2 - size*0.04;
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(size/2, size/2, r, 0, Math.PI*2);
    ctx.fill();
    // paper noise: subtle
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 40; i++) {
      const x = Math.random()*size, y = Math.random()*size, rr = Math.random()*3;
      ctx.beginPath(); ctx.arc(x,y,rr,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  if (s.style === 'sticker') {
    const r = size/2 - size*0.03;
    // outer white ring
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(size/2, size/2, r, 0, Math.PI*2); ctx.fill();
    // inner color
    ctx.fillStyle = s.bg !== 'transparent' ? s.bg : s.fg;
    ctx.beginPath(); ctx.arc(size/2, size/2, r - size*0.06, 0, Math.PI*2); ctx.fill();
  }

  // compute animation transforms
  const pad = s.pad * (size/128);
  const inner = size - pad*2;

  // char grid layout: 4 chars -> 2x2, otherwise single row
  const chars = [...text];
  const n = chars.length || 1;
  const cols = n === 4 ? 2 : n;
  const rows = n === 4 ? 2 : 1;
  const cellWidth = inner / cols;
  const cellHeight = inner / rows;
  const cellSize = Math.min(cellWidth, cellHeight);
  let baseGlyph = cellSize * (s.size/100) * 1.08;

  // translate to center
  ctx.translate(size/2, size/2);

  // animation transforms
  let scale = 1, rotExtra = 0, offX = 0, offY = 0;
  const speed = 1;
  const t = frame; // 0..1
  const TAU = Math.PI*2;

  switch (s.anim) {
    case 'bounce': {
      const yo = Math.abs(Math.sin(t * TAU)) * size * 0.09;
      offY = -yo;
      break;
    }
    case 'spin': rotExtra = t * TAU; break;
    case 'pulse': scale = 1 + Math.sin(t * TAU) * 0.12; break;
    case 'shake': offX = Math.sin(t * TAU * 3) * size * 0.04; break;
    case 'wiggle': rotExtra = Math.sin(t * TAU * 2) * 0.18; break;
    case 'slide': {
      // slide in-out: enter from left then sit, then exit right
      const tt = t;
      if (tt < 0.3) offX = lerp(-size*0.8, 0, tt/0.3);
      else if (tt < 0.7) offX = 0;
      else offX = lerp(0, size*0.8, (tt-0.7)/0.3);
      break;
    }
  }

  ctx.translate(offX, offY);
  ctx.rotate((s.rot * Math.PI/180) + rotExtra);
  ctx.scale(scale, scale);

  // typewriter: mask how many chars rendered & caret
  const tw = s.anim === 'typewriter';
  const twChars = tw ? Math.floor(t * n) + 1 : n;
  const caretOn = tw ? ((t * 4) % 1) < 0.5 : false;

  // setup font
  ctx.font = setFontSize(s.font, Math.round(baseGlyph));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // rainbow anim overrides fg hue
  let fg = s.fg;
  if (s.anim === 'rainbow' || s.style === 'rainbow') {
    const hue = ((t * 360) + (s.style==='rainbow' ? 0 : 0)) % 360;
    fg = `hsl(${hue}, 85%, 55%)`;
  }

  // per-cell layout
  const startX = -inner/2 + cellWidth/2;
  const startY = -inner/2 + cellHeight/2;

  // STYLE: outline only -> render stroke; no fill
  // STYLE: solid -> fill
  // STYLE: gradient -> linear gradient fill
  // STYLE: neon -> glow with blur
  // STYLE: chrome -> gradient plus shiny
  // STYLE: pixel -> draw to low-res then scale up
  // STYLE: sumi -> textured fill with rough edges
  // STYLE: shadow -> 3d offset drop
  // STYLE: varsity -> thick white stroke over color fill

  const renderChar = (ch, cx, cy) => {
    const x = cx, y = cy;

    if (s.style === 'pixel') {
      // offload to off-screen low-res canvas
      const low = 24;
      const lc = document.createElement('canvas');
      lc.width = low; lc.height = low;
      const l = lc.getContext('2d');
      l.font = setFontSize(s.font, Math.round(low * 0.8));
      l.textAlign = 'center'; l.textBaseline = 'middle';
      l.fillStyle = fg;
      l.fillText(ch, low/2, low/2);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      const drawSize = cellSize * 0.9;
      ctx.drawImage(lc, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
      ctx.restore();
      return;
    }

    if (s.style === 'neon') {
      ctx.save();
      ctx.shadowColor = fg;
      ctx.shadowBlur = size * 0.15;
      ctx.fillStyle = fg;
      ctx.fillText(ch, x, y);
      ctx.shadowBlur = size * 0.25;
      ctx.fillText(ch, x, y);
      ctx.shadowBlur = 0;
      // inner white core
      ctx.fillStyle = '#fff';
      ctx.font = setFontSize(s.font, Math.round(baseGlyph * 0.92));
      ctx.fillText(ch, x, y);
      ctx.restore();
      return;
    }

    if (s.style === 'chrome') {
      const g = ctx.createLinearGradient(0, -baseGlyph/2, 0, baseGlyph/2);
      g.addColorStop(0, '#fafafa');
      g.addColorStop(0.45, '#9aa4b2');
      g.addColorStop(0.5, '#cfd6e0');
      g.addColorStop(0.55, '#4a5568');
      g.addColorStop(1, '#dde3ea');
      ctx.fillStyle = g;
      ctx.fillText(ch, x, y);
      ctx.lineWidth = Math.max(2, size*0.015);
      ctx.strokeStyle = '#1a1423';
      ctx.strokeText(ch, x, y);
      return;
    }

    if (s.style === 'gradient') {
      const [h] = hexToHSL(fg);
      const g = ctx.createLinearGradient(0, -baseGlyph/2, 0, baseGlyph/2);
      g.addColorStop(0, hsl(h, 85, 65));
      g.addColorStop(1, hsl((h+40)%360, 90, 45));
      ctx.fillStyle = g;
      ctx.fillText(ch, x, y);
      return;
    }

    if (s.style === 'outline') {
      ctx.lineWidth = Math.max(3, size*0.03 + s.stroke*0.5);
      ctx.strokeStyle = fg;
      ctx.lineJoin = 'round';
      ctx.strokeText(ch, x, y);
      return;
    }

    if (s.style === 'sumi') {
      // textured ink look: draw then erase random blobs
      const tmp = document.createElement('canvas');
      tmp.width = size; tmp.height = size;
      const t2 = tmp.getContext('2d');
      t2.font = setFontSize(s.font, Math.round(baseGlyph));
      t2.textAlign = 'center'; t2.textBaseline = 'middle';
      t2.fillStyle = fg;
      t2.fillText(ch, size/2 + x, size/2 + y);
      // erase noise
      t2.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 60; i++) {
        const rx = Math.random()*size, ry = Math.random()*size;
        t2.globalAlpha = Math.random()*0.4;
        t2.beginPath(); t2.arc(rx,ry, Math.random()*size*0.04, 0, Math.PI*2); t2.fill();
      }
      t2.globalAlpha = 1;
      ctx.save();
      ctx.translate(-size/2, -size/2);
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
      return;
    }

    if (s.style === 'shadow') {
      // layered 3d drop
      const layers = 8;
      const dx = size*0.012, dy = size*0.012;
      for (let i = layers; i >= 1; i--) {
        const [h,ss,l] = hexToHSL(fg);
        ctx.fillStyle = hsl(h, Math.max(10,ss-10), Math.max(8, l-25));
        ctx.fillText(ch, x + dx*i, y + dy*i);
      }
      ctx.fillStyle = fg;
      ctx.fillText(ch, x, y);
      return;
    }

    if (s.style === 'varsity') {
      // thick white stroke + colored fill
      ctx.lineWidth = Math.max(6, size*0.06);
      ctx.strokeStyle = '#fff';
      ctx.lineJoin = 'round';
      ctx.strokeText(ch, x, y);
      ctx.lineWidth = Math.max(10, size*0.1);
      ctx.strokeStyle = '#1a1423';
      ctx.strokeText(ch, x, y);
      // redo white
      ctx.lineWidth = Math.max(6, size*0.06);
      ctx.strokeStyle = '#fff';
      ctx.strokeText(ch, x, y);
      ctx.fillStyle = fg;
      ctx.fillText(ch, x, y);
      return;
    }

    if (s.style === 'rainbow') {
      // each char a different hue (when not animating, spread; when animating, shift)
      const hue = ((360 / n) * renderChar.idx + (s.anim === 'rainbow' ? t*360 : 0)) % 360;
      ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;
      ctx.fillText(ch, x, y);
      return;
    }

    // default / solid (hanko, sticker land here too)
    ctx.fillStyle = s.style === 'hanko' ? '#fff' : fg;

    // optional user stroke
    if (s.stroke > 0 && s.style !== 'outline') {
      ctx.lineWidth = s.stroke;
      ctx.strokeStyle = s.style === 'hanko' ? '#c0392b' : '#1a1423';
      ctx.lineJoin = 'round';
      ctx.strokeText(ch, x, y);
    }
    ctx.fillText(ch, x, y);
  };

  // render chars (respect typewriter)
  const visibleCount = clamp(twChars, 0, n);
  for (let i = 0; i < visibleCount; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    renderChar.idx = i;
    renderChar(chars[i], startX + col * cellWidth, startY + row * cellHeight);
  }
  // typewriter caret
  if (tw && caretOn && visibleCount < n) {
    const col = visibleCount % cols, row = Math.floor(visibleCount / cols);
    const cx = startX + col * cellWidth - cellWidth*0.35;
    const cy = startY + row * cellHeight;
    ctx.fillStyle = s.fg;
    const w = Math.max(2, size*0.03);
    ctx.fillRect(cx, cy - baseGlyph*0.35, w, baseGlyph*0.7);
  }

  ctx.restore();
}

// ---------- name generation ----------
const ROMAJI_MAP = {'猫':'neko','犬':'inu','火':'hi','水':'mizu','龍':'ryuu','愛':'ai','夢':'yume','心':'kokoro','侍':'samurai','漢字':'kanji'};
function baseRomaji(text) {
  if (!text) return 'emoji';
  return ROMAJI_MAP[text] || 'kanji';
}
function generateName() {
  const parts = [baseRomaji(state.text)];
  if (state.style && state.style !== 'solid') parts.push(state.style);
  if (state.anim && state.anim !== 'none') parts.push(state.anim);
  return parts.join('_');
}
function applyGeneratedName() {
  const name = generateName();
  state.name = name;
  $('#nameInput').value = name;
}

// ---------- UI wiring ----------
function initUI() {
  // quick row
  const qr = $('#quickrow');
  qr.innerHTML = QUICKS.map(q => `<button class="chip" data-k="${q.k}" data-r="${q.r}">${q.k}<small>:${q.r}:</small></button>`).join('');
  qr.addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    $('#kanjiInput').value = c.dataset.k;
    state.text = c.dataset.k;
    applyGeneratedName();
    renderAll();
  });

  // style grid
  const sg = $('#styleGrid');
  sg.innerHTML = STYLES.map(st =>
    `<div class="style-tile" data-id="${st.id}">
      <canvas width="56" height="56"></canvas>
      <span class="name">${st.name}</span>
    </div>`
  ).join('');
  sg.addEventListener('click', (e) => {
    const t = e.target.closest('.style-tile'); if(!t) return;
    state.style = t.dataset.id;
    $$('.style-tile').forEach(x => x.classList.toggle('active', x.dataset.id === state.style));
    applyGeneratedName();
    renderAll();
  });

  // anim grid
  const ag = $('#animGrid');
  ag.innerHTML = ANIMS.map(a => `
    <div class="anim-tile" data-id="${a.id}">
      <span class="ico">${a.ico}</span>
      <span>${a.name}</span>
    </div>`).join('');
  ag.addEventListener('click', (e) => {
    const t = e.target.closest('.anim-tile'); if(!t) return;
    state.anim = t.dataset.id;
    $$('.anim-tile').forEach(x => x.classList.toggle('active', x.dataset.id === state.anim));
    updateLiveBadge();
    if (state.anim !== 'none') startLoop(); else stopLoop();
    applyGeneratedName();
    renderAll();
  });

  // fg / bg swatches
  const fgEl = $('#fgSwatches');
  fgEl.innerHTML = FG_COLORS.map(c => `<div class="swatch" style="background:${c}" data-c="${c}"></div>`).join('')
    + `<label class="swatch" style="background: conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red);" title="Custom"><input type="color" id="fgCustom" value="#e01e5a"></label>`;
  fgEl.addEventListener('click', (e) => {
    const s = e.target.closest('.swatch[data-c]'); if (!s) return;
    state.fg = s.dataset.c;
    $$('#fgSwatches .swatch').forEach(x => x.classList.toggle('active', x.dataset.c === state.fg));
    renderAll();
  });
  $('#fgCustom').addEventListener('input', (e) => {
    state.fg = e.target.value;
    $$('#fgSwatches .swatch').forEach(x => x.classList.remove('active'));
    renderAll();
  });

  const bgEl = $('#bgSwatches');
  bgEl.innerHTML = BG_COLORS.map(c => {
    const trans = c === 'transparent';
    return `<div class="swatch ${trans?'trans':''}" ${trans?'':`style="background:${c}"`} data-c="${c}" title="${trans?'Transparent':c}"></div>`;
  }).join('')
    + `<label class="swatch" style="background: conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red);" title="Custom"><input type="color" id="bgCustom" value="#ffffff"></label>`;
  bgEl.addEventListener('click', (e) => {
    const s = e.target.closest('.swatch[data-c]'); if (!s) return;
    state.bg = s.dataset.c;
    $$('#bgSwatches .swatch').forEach(x => x.classList.toggle('active', x.dataset.c === state.bg));
    renderAll();
  });
  $('#bgCustom').addEventListener('input', (e) => {
    state.bg = e.target.value;
    $$('#bgSwatches .swatch').forEach(x => x.classList.remove('active'));
    renderAll();
  });

  // initial active states
  const firstFg = fgEl.querySelector(`.swatch[data-c="${state.fg}"]`); if (firstFg) firstFg.classList.add('active');
  const firstBg = bgEl.querySelector(`.swatch[data-c="${state.bg}"]`); if (firstBg) firstBg.classList.add('active');
  sg.querySelector(`[data-id="${state.style}"]`).classList.add('active');
  ag.querySelector(`[data-id="${state.anim}"]`).classList.add('active');

  // font
  $('#fontSelect').addEventListener('change', (e) => { state.font = e.target.value; renderAll(); });
  state.font = $('#fontSelect').value;

  // ranges
  const rangeBind = (id, key, fmt) => {
    const el = $('#' + id);
    const valEl = $('#' + id.replace('Range','Val'));
    const upd = () => {
      state[key] = +el.value;
      valEl.textContent = fmt ? fmt(el.value) : el.value;
      renderAll();
    };
    el.addEventListener('input', upd);
    upd();
  };
  rangeBind('sizeRange',   'size',   v => v+'%');
  rangeBind('padRange',    'pad',    v => v+'px');
  rangeBind('rotRange',    'rot',    v => v+'°');
  rangeBind('strokeRange', 'stroke', v => v);
  rangeBind('speedRange',  'speed',  v => (v/100).toFixed(1) + '×');

  // inputs
  $('#kanjiInput').addEventListener('input', (e) => {
    state.text = e.target.value;
    applyGeneratedName();
    renderAll();
  });
  $('#nameInput').addEventListener('input', (e) => {
    state.name = e.target.value.replace(/[^a-z0-9_+-]/gi,'').toLowerCase();
    e.target.value = state.name;
  });

  // regenerate name from current selections (useful after manual edits)
  $('#romajiBtn').addEventListener('click', () => {
    if (!state.text) return;
    applyGeneratedName();
  });

  // download
  $('#dlPngBtn').addEventListener('click', downloadPng);
  $('#dlGifBtn').addEventListener('click', downloadGif);
  $('#copyBtn').addEventListener('click', copyPng);

  // batch
  $('#batchBtn').addEventListener('click', downloadBatchZip);

  // initial text
  $('#kanjiInput').value = '漢字';
  state.text = '漢字';
  applyGeneratedName();

  // pre-render style tiles
  renderStyleTiles();
  renderAll();
}

function renderStyleTiles() {
  $$('.style-tile').forEach(t => {
    const c = t.querySelector('canvas');
    const ctx = c.getContext('2d');
    drawEmoji(ctx, 56, 0, {
      style: t.dataset.id,
      anim: 'none',
      text: '字',
      size: 88, pad: 3, rot: 0, stroke: 0,
      fg: t.dataset.id === 'hanko' ? '#ffffff' : state.fg,
      bg: 'transparent',
      font: state.font || 'NNNpx "Noto Sans JP", sans-serif',
    });
  });
}

function updateLiveBadge() {
  const on = state.anim !== 'none';
  $('#liveBadgeL').classList.toggle('off', !on);
  $('#liveBadgeD').classList.toggle('off', !on);
}

// ---------- animation loop ----------
let rafId = null, startT = 0;
function startLoop() {
  stopLoop();
  startT = performance.now();
  const step = (now) => {
    const dur = 1400 / (state.speed/100); // ms per cycle
    const frame = ((now - startT) % dur) / dur;
    renderPreview(frame);
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
}
function stopLoop() { if (rafId) cancelAnimationFrame(rafId); rafId = null; }

function renderPreview(frame = 0) {
  const l = $('#previewLight').getContext('2d');
  const d = $('#previewDark').getContext('2d');
  drawEmoji(l, 128, frame);
  drawEmoji(d, 128, frame);

  // mini sizes
  [['s22L',22,'#fafafa'], ['s32L',32,'#fafafa'], ['s64L',64,'#fafafa'],
   ['s22D',22,'#222529'], ['s32D',32,'#222529'], ['s64D',64,'#222529']]
  .forEach(([id, sz]) => {
    const cv = document.getElementById(id);
    const cx = cv.getContext('2d');
    cx.clearRect(0,0,sz,sz);
    drawEmoji(cx, sz, frame);
  });

  // inline reaction images from light preview
  const dataL = $('#previewLight').toDataURL('image/png');
  $('#inlineL').src = dataL;
  $('#reactL').src = dataL;
  const dataD = $('#previewDark').toDataURL('image/png');
  $('#inlineD').src = dataD;
  $('#reactD').src = dataD;
}

function renderAll() {
  if (state.anim === 'none') {
    stopLoop();
    renderPreview(0);
  } else {
    if (!rafId) startLoop();
  }
  renderStyleTiles();
  updateLiveBadge();
}

// ---------- download PNG ----------
function fileName(ext) {
  const n = (state.name || 'kanji').replace(/[^a-z0-9_-]/gi,'') || 'kanji';
  return `${n}.${ext}`;
}
function downloadPng() {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 128;
  drawEmoji(cv.getContext('2d'), 128, 0);
  cv.toBlob((blob) => saveBlob(blob, fileName('png')), 'image/png');
}
async function copyPng() {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 128;
  drawEmoji(cv.getContext('2d'), 128, 0);
  cv.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
      flashBtn('#copyBtn', '✅ Copied!');
    } catch (e) {
      flashBtn('#copyBtn', '❌ Failed');
    }
  });
}
function flashBtn(sel, msg){
  const b = $(sel); const orig = b.innerHTML;
  b.innerHTML = msg;
  setTimeout(() => b.innerHTML = orig, 1400);
}
function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- download GIF ----------
function encodeGif({text, name, style, anim, fg, bg, font, size, pad, rot, stroke, speed, onProgress} = state) {
  return new Promise((resolve, reject) => {
    // gif.js requires a worker script (the same gif.js CDN has worker file)
    const gif = new GIF({
      workers: 2,
      quality: 8,
      width: 128,
      height: 128,
      transparent: bg === 'transparent' ? 0x00000000 : null,
      workerScript: 'vendor/gif.worker.js',
    });
    const frames = 24;
    const frameDelay = Math.round((1400 / (speed/100)) / frames);

    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 128;
    const ctx = cv.getContext('2d');

    for (let i = 0; i < frames; i++) {
      ctx.clearRect(0,0,128,128);
      drawEmoji(ctx, 128, i/frames, {text, style, anim, fg, bg, font, size, pad, rot, stroke});
      gif.addFrame(ctx, {copy: true, delay: frameDelay});
    }
    gif.on('progress', p => onProgress && onProgress(p));
    gif.on('finished', blob => resolve(blob));
    gif.on('abort', () => reject(new Error('aborted')));
    gif.render();
  });
}

async function downloadGif() {
  if (state.anim === 'none') {
    alert('Pick an animation first (or use Download PNG).');
    return;
  }
  const prog = $('#gifProgress'); const bar = prog.querySelector('.bar > div'); const pct = $('#gifPct');
  const btn = $('#dlGifBtn'); btn.disabled = true;
  prog.classList.add('on');
  try {
    const blob = await encodeGif({ ...state, onProgress: (p) => {
      bar.style.width = Math.round(p*100) + '%';
      pct.textContent = Math.round(p*100) + '%';
    }});
    saveBlob(blob, fileName('gif'));
  } catch (e) {
    alert('GIF encoding failed: ' + e.message);
  } finally {
    btn.disabled = false;
    prog.classList.remove('on');
    bar.style.width = '0%';
    pct.textContent = '0%';
  }
}

// ---------- batch zip ----------
async function downloadBatchZip() {
  const raw = $('#batchInput').value.trim();
  if (!raw) { alert('Paste some kanji in the batch box first.'); return; }
  const tokens = raw.split(/[\s\n、,，]+/).filter(Boolean);
  if (!tokens.length) return;

  const prog = $('#batchProgress'); const bar = prog.querySelector('.bar > div'); const pct = $('#batchPct');
  prog.classList.add('on');
  const btn = $('#batchBtn'); btn.disabled = true;

  const zip = new JSZip();
  const animated = state.anim !== 'none';

  try {
    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];
      const base = `kanji_${String(i+1).padStart(2,'0')}`;
      if (animated) {
        const blob = await encodeGif({ ...state, text: tk, onProgress: () => {} });
        zip.file(`${base}.gif`, blob);
      } else {
        const cv = document.createElement('canvas');
        cv.width = 128; cv.height = 128;
        drawEmoji(cv.getContext('2d'), 128, 0, { text: tk });
        const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
        zip.file(`${base}.png`, blob);
      }
      const p = (i+1) / tokens.length;
      bar.style.width = Math.round(p*100) + '%';
      pct.textContent = Math.round(p*100) + '%';
    }
    const blob = await zip.generateAsync({type:'blob'});
    saveBlob(blob, 'slackmoji_batch.zip');
  } catch (e) {
    alert('Batch failed: ' + e.message);
  } finally {
    btn.disabled = false;
    prog.classList.remove('on');
    bar.style.width = '0%'; pct.textContent = '0%';
  }
}

// ---------- font loading wait ----------
async function waitFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch {}
  }
}

// boot
(async () => {
  await waitFonts();
  initUI();
})();

