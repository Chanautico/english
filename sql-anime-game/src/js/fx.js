// Animações do modo história: cenários animados, Pip, silhuetas dos personagens,
// Golem e efeitos de cena. Tudo em SVG/CSS — sem arquivos de imagem.
// Se existir a imagem real (src/assets/...), ela aparece por cima e as partículas continuam.
(function () {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ─────────────────────────── Cenários ───────────────────────────
  function stars(n, h) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${rnd(0, 1600).toFixed(0)}" cy="${rnd(0, h).toFixed(0)}" r="${rnd(.8, 2.2).toFixed(1)}" fill="#fff" class="twinkle" style="animation-delay:${rnd(0, 4).toFixed(1)}s"/>`;
    return s;
  }

  const SCENES = {
    bg_vila_arquivo() {
      const g = id('v');
      let houses = '', windows = '';
      const xs = [40, 230, 420, 980, 1170, 1360];
      xs.forEach((x, i) => {
        const w = 160 + (i % 2) * 30, h = 150 + (i % 3) * 40, y = 720 - h;
        houses += `<path d="M${x} 720 V${y} L${x + w / 2} ${y - 80} L${x + w} ${y} V720Z" fill="#241a33"/>`;
        windows += `<rect x="${x + 30}" y="${y + 40}" width="26" height="34" rx="3" fill="#ffcf7a" class="flicker" style="animation-delay:${i * .7}s"/>`;
        windows += `<rect x="${x + w - 60}" y="${y + 70}" width="26" height="34" rx="3" fill="#ffb86b" class="flicker" style="animation-delay:${i * .4 + 1}s"/>`;
      });
      let lanterns = '';
      for (let i = 0; i < 9; i++) { const x = 120 + i * 170, y = 470 + Math.sin(i) * 14; lanterns += `<circle cx="${x}" cy="${y}" r="9" fill="#ffb04d" class="lantern" style="animation-delay:${i * .3}s"/>`; }
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1f4d"/><stop offset=".55" stop-color="#8a4a6e"/><stop offset="1" stop-color="#f0a46a"/></linearGradient>
          <radialGradient id="${g}c" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#bff4ff"/><stop offset=".4" stop-color="#5fd0ff" stop-opacity=".8"/><stop offset="1" stop-color="#5fd0ff" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#${g}s)"/>
        ${stars(40, 380)}
        <path d="M0 600 L180 470 L330 560 L520 420 L720 560 L900 450 L1100 570 L1300 440 L1600 580 V900 H0Z" fill="#4a3358" opacity=".8"/>
        <g class="sway-slow"><rect x="735" y="250" width="130" height="470" fill="#1c1428"/><path d="M715 260 L800 160 L885 260Z" fill="#1c1428"/>
          <rect x="770" y="330" width="60" height="80" rx="30" fill="#ffd38a" class="flicker"/><rect x="770" y="450" width="60" height="80" rx="30" fill="#ffd38a" class="flicker" style="animation-delay:1.3s"/></g>
        <circle cx="800" cy="130" r="120" fill="url(#${g}c)" class="pulse"/>
        <polygon points="800,70 830,130 800,190 770,130" fill="#bff4ff" class="float-crystal"/>
        ${houses}${windows}
        <path d="M100 470 Q 900 520 1500 460" stroke="#2a1c35" stroke-width="2" fill="none"/>${lanterns}
        <rect y="720" width="1600" height="180" fill="#1d1529"/>
        <path d="M0 760 H1600" stroke="#33244a" stroke-width="3"/>
      </svg>`;
    },
    bg_floresta_cristal() {
      const g = id('f');
      let trees = '';
      [[80, 1], [300, .8], [520, 1.1], [1050, .9], [1270, 1.15], [1480, .85], [760, .6]].forEach(([x, s], i) => {
        const h = 520 * s;
        trees += `<g class="crystal-tree" style="animation-delay:${i * .6}s">
          <rect x="${x - 10}" y="${760 - h * .4}" width="20" height="${h * .4}" fill="#1d3a4a"/>
          <polygon points="${x},${760 - h} ${x + 90 * s},${760 - h * .45} ${x},${760 - h * .3} ${x - 90 * s},${760 - h * .45}" fill="url(#${g}t)" stroke="#9ff5ff" stroke-width="2"/>
          <polygon points="${x},${760 - h} ${x + 25 * s},${760 - h * .55} ${x},${760 - h * .35}" fill="#e6fdff" opacity=".55"/>
        </g>`;
      });
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06142a"/><stop offset=".7" stop-color="#0f3a4e"/><stop offset="1" stop-color="#1b5d63"/></linearGradient>
          <linearGradient id="${g}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ff0ff"/><stop offset="1" stop-color="#2a8fb0" stop-opacity=".7"/></linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#${g}s)"/>
        ${stars(50, 400)}
        <ellipse cx="1250" cy="160" rx="70" ry="70" fill="#dffaff" opacity=".85" class="pulse"/>
        ${trees}
        <rect y="760" width="1600" height="140" fill="#0b2430"/>
        <ellipse cx="800" cy="770" rx="900" ry="40" fill="#7ff0ff" opacity=".08" class="mist"/>
      </svg>`;
    },
    bg_estrada_capital() {
      const g = id('e');
      let towers = '';
      [[1180, 210], [1230, 280], [1290, 180], [1350, 240], [1410, 300]].forEach(([x, h], i) => {
        towers += `<rect x="${x}" y="${470 - h}" width="40" height="${h}" fill="#2b2440"/><rect x="${x + 14}" y="${490 - h}" width="10" height="14" fill="#ffd38a" class="flicker" style="animation-delay:${i * .5}s"/>`;
      });
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs><linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1830"/><stop offset=".6" stop-color="#4a3a5e"/><stop offset="1" stop-color="#7a5a6a"/></linearGradient></defs>
        <rect width="1600" height="900" fill="url(#${g}s)"/>
        <g class="clouds"><ellipse cx="300" cy="140" rx="320" ry="70" fill="#2a2238"/><ellipse cx="900" cy="100" rx="380" ry="80" fill="#241d33"/><ellipse cx="1500" cy="150" rx="300" ry="70" fill="#2a2238"/><ellipse cx="2000" cy="120" rx="380" ry="80" fill="#241d33"/></g>
        <path d="M0 520 L260 430 L520 500 L820 410 L1100 480 L1600 420 V900 H0Z" fill="#3a2f4a"/>
        ${towers}
        <path d="M640 900 L790 470 L810 470 L960 900Z" fill="#6a5560"/>
        <path d="M800 480 V900" stroke="#c9b48a" stroke-width="4" stroke-dasharray="30 30" class="road-lines"/>
        <path d="M0 900 L0 600 L640 900Z M1600 900 L1600 600 L960 900Z" fill="#2a2236"/>
      </svg>`;
    },
  };

  function genericScene(tag) {
    let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % 360;
    const g = id('g');
    let cubes = '';
    for (let i = 0; i < 14; i++) cubes += `<rect x="${rnd(0, 1600).toFixed(0)}" y="${rnd(100, 800).toFixed(0)}" width="${rnd(20, 60).toFixed(0)}" height="${rnd(20, 60).toFixed(0)}" rx="6" fill="hsl(${h},70%,75%)" opacity=".18" class="float-crystal" style="animation-delay:${rnd(0, 5).toFixed(1)}s"/>`;
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},45%,22%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360},50%,38%)"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#${g})"/>${stars(30, 900)}${cubes}</svg>`;
  }

  const PARTICLES = { bg_vila_arquivo: 'shard', bg_floresta_cristal: 'mote', bg_estrada_capital: 'ember' };
  function particles(kind, n) {
    let h = `<div class="pfx pfx-${kind}" aria-hidden="true">`;
    for (let i = 0; i < n; i++) h += `<i style="left:${rnd(0, 100).toFixed(1)}%;animation-delay:${(-rnd(0, 12)).toFixed(1)}s;animation-duration:${rnd(7, 14).toFixed(1)}s;--s:${rnd(.5, 1.3).toFixed(2)}"></i>`;
    return h + '</div>';
  }

  // Cenário completo: SVG animado + imagem real (se houver) + partículas + etiqueta do arquivo.
  function scenery(tag, opts) {
    const svg = (SCENES[tag] || (() => genericScene(tag)))();
    return `<div class="scenery" data-bg="${tag}">
      <div class="sc-svg">${svg}</div>
      <img class="sc-img" alt="" draggable="false">
      ${particles(PARTICLES[tag] || 'mote', opts && opts.few ? 10 : 22)}
      <code class="file-tag">${tag}.png</code>
    </div>`;
  }

  // ─────────────────────────── Pip (arte final em SVG) ───────────────────────────
  function pip(expr) {
    const g = id('p');
    let face;
    switch (expr) {
      case 'alerta': face = `<circle cx="84" cy="66" r="9" fill="#2b1d05"/><circle cx="116" cy="66" r="9" fill="#2b1d05"/><circle cx="87" cy="62" r="3" fill="#fff"/><circle cx="119" cy="62" r="3" fill="#fff"/><ellipse cx="100" cy="92" rx="7" ry="9" fill="#2b1d05"/>`; break;
      case 'erro': face = `<path d="M76 58 l16 16 M92 58 l-16 16 M108 58 l16 16 M124 58 l-16 16" stroke="#2b1d05" stroke-width="5" stroke-linecap="round"/><path d="M86 96 q14 -10 28 0" stroke="#2b1d05" stroke-width="4" fill="none" stroke-linecap="round"/>`; break;
      case 'explicando': face = `<circle cx="84" cy="68" r="8" fill="#2b1d05"/><circle cx="87" cy="65" r="2.6" fill="#fff"/><path d="M106 68 q10 -8 20 0" stroke="#2b1d05" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M88 90 q12 9 24 0" stroke="#2b1d05" stroke-width="4" fill="none" stroke-linecap="round"/>`; break;
      default: face = `<path d="M74 70 q10 -12 20 0 M106 70 q10 -12 20 0" stroke="#2b1d05" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M84 86 q16 18 32 0 Z" fill="#7a2a1a"/>`;
    }
    const tint = expr === 'erro' ? ['#ffb0a0', '#e0503a'] : ['#fff1a8', '#f0b429'];
    return `<svg viewBox="0 0 200 260" class="pip-svg pip-${expr || 'feliz'}">
      <defs><radialGradient id="${g}a" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${tint[1]}" stop-opacity=".55"/><stop offset="1" stop-color="${tint[1]}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${g}b" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${tint[0]}"/><stop offset="1" stop-color="${tint[1]}"/></radialGradient></defs>
      <circle cx="100" cy="120" r="100" fill="url(#${g}a)" class="pip-aura"/>
      <g class="pip-body">
        <circle cx="100" cy="72" r="48" fill="url(#${g}b)"/>
        <circle cx="74" cy="84" r="8" fill="#ff8f6b" opacity=".45"/><circle cx="126" cy="84" r="8" fill="#ff8f6b" opacity=".45"/>
        ${face}
        <path d="M100 140 a38 38 0 1 1 -6 75 q-14 22 -40 30 q22 -22 22 -40 a38 38 0 0 1 24 -65z" fill="url(#${g}b)"/>
        <path d="M84 40 q10 -10 22 -6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
      </g>
      <g fill="#fff8c4" class="pip-sparks"><path d="M30 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M170 150 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z"/></g>
    </svg>`;
  }

  // ─────────────────────────── Silhuetas anime ───────────────────────────
  const LOOK = {
    ren: { c: '#ff8a3d' }, kael: { c: '#5fc8ff' }, lyra: { c: '#c77dff' }, dante: { c: '#c0c7d1' },
    vex: { c: '#b14cff' }, malform: { c: '#ffffff' },
  };
  function eyes(expr, col) {
    const L = 128, R = 172, Y = 124;
    const glow = `fill="${col}" class="eye-glow"`;
    if (/feliz|sorrindo|orgulhoso|relaxado/.test(expr)) return `<path d="M${L - 9} ${Y + 3} q9 -10 18 0 M${R - 9} ${Y + 3} q9 -10 18 0" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round" class="eye-glow"/>`;
    if (/surpres|alerta/.test(expr)) return `<circle cx="${L}" cy="${Y}" r="7" ${glow}/><circle cx="${R}" cy="${Y}" r="7" ${glow}/>`;
    if (/bravo|furioso/.test(expr)) return `<path d="M${L - 11} ${Y - 6} L${L + 9} ${Y + 2} L${L - 9} ${Y + 4}Z M${R + 11} ${Y - 6} L${R - 9} ${Y + 2} L${R + 9} ${Y + 4}Z" ${glow}/>`;
    if (/derrotad/.test(expr)) return `<path d="M${L - 9} ${Y} q9 6 18 0 M${R - 9} ${Y} q9 6 18 0" stroke="${col}" stroke-width="3.5" fill="none" stroke-linecap="round" class="eye-glow"/>`;
    if (/confiante|focado|seria|arrogante|sombrio|calmo/.test(expr)) return `<path d="M${L - 11} ${Y - 2} L${L + 9} ${Y + 1} L${L + 7} ${Y + 5} L${L - 9} ${Y + 4}Z M${R + 11} ${Y - 2} L${R - 9} ${Y + 1} L${R - 7} ${Y + 5} L${R + 9} ${Y + 4}Z" ${glow}/>`;
    if (/transcendente/.test(expr)) return `<ellipse cx="${L}" cy="${Y}" rx="10" ry="6" fill="#fff" class="eye-glow strong"/><ellipse cx="${R}" cy="${Y}" rx="10" ry="6" fill="#fff" class="eye-glow strong"/>`;
    return `<ellipse cx="${L}" cy="${Y}" rx="8" ry="4.5" ${glow}/><ellipse cx="${R}" cy="${Y}" rx="8" ry="4.5" ${glow}/>`;
  }
  const BODY = 'M58 540 Q60 300 104 256 Q128 236 150 233 Q172 236 196 256 Q240 300 242 540Z';
  const HEAD = '<path d="M130 160 L170 160 L176 236 L124 236Z"/><ellipse cx="150" cy="120" rx="50" ry="60"/>';
  const HAIR = {
    ren: `<path d="M96 120 L82 66 L112 84 L104 40 L136 72 L146 26 L164 70 L190 34 L188 80 L222 62 L204 116 Q200 80 150 76 Q104 80 96 120Z"/>
          <path class="scarf" d="M112 210 Q150 232 190 210 L196 232 Q150 256 106 232Z M180 226 Q230 250 262 236 Q236 270 196 246Z" fill="var(--c)" opacity=".9"/>`,
    kael: `<path d="M98 112 Q96 60 150 56 Q206 60 202 112 Q190 86 168 84 Q150 96 128 84 Q108 88 98 112Z"/>
           <path d="M112 150 Q150 200 188 150 Q186 186 150 196 Q114 186 112 150Z"/>
           <path d="M100 108 L200 132" stroke="#0d0b14" stroke-width="7"/>
           <path d="M84 260 L60 540 M216 260 L240 540" stroke="var(--c)" stroke-width="2" opacity=".5"/>`,
    lyra: `<path d="M96 126 Q92 58 150 54 Q210 58 204 126 Q206 230 214 330 L190 330 Q196 200 186 112 Q150 96 114 112 Q104 200 110 330 L86 330 Q94 230 96 126Z"/>
           <path d="M196 70 Q252 60 262 130 Q266 190 240 230 Q246 160 218 104Z"/>
           <path d="M120 64 l8 -14 l8 14 l8 -14 l8 14" stroke="var(--c)" stroke-width="3" fill="none" class="eye-glow"/>`,
    dante: `<path d="M98 116 Q90 58 152 56 Q214 62 204 112 Q196 92 176 92 L182 76 L160 90 Q130 82 112 96 Q102 100 98 116Z"/>
            <path d="M196 112 Q226 150 214 190 Q206 160 194 140Z"/>
            <path d="M140 150 L170 160" stroke="var(--c)" stroke-width="2" opacity=".6"/>`,
    vex: `<path d="M86 160 Q80 40 150 30 Q220 40 214 160 Q230 220 250 260 Q200 230 150 228 Q100 230 50 260 Q70 220 86 160Z"/>
          <ellipse cx="150" cy="128" rx="40" ry="48" fill="#08060c" stroke="var(--c)" stroke-width="2"/>`,
    malform: `<g class="crown"><polygon points="150,-6 160,40 140,40"/><polygon points="108,8 128,48 110,52"/><polygon points="192,8 190,52 172,48"/><polygon points="76,36 104,64 88,70"/><polygon points="224,36 212,70 196,64"/></g>
              <path d="M40 540 Q70 320 110 270 L190 270 Q230 320 260 540Z"/>`,
  };

  function silhouette(charKey, tag) {
    const look = LOOK[charKey] || { c: '#c9b8ff' };
    const expr = (tag || '').split('_').slice(1).join('_');
    const fill = id('s');
    return `<svg viewBox="0 -20 300 560" class="sil" style="--c:${look.c}">
      <defs><linearGradient id="${fill}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2540"/><stop offset="1" stop-color="#110e1a"/></linearGradient></defs>
      <g fill="url(#${fill})" class="breath">
        <path d="${BODY}"/>${HEAD}${HAIR[charKey] || ''}
        ${eyes(expr, charKey === 'kael' ? '#ffffff' : look.c)}
        ${charKey === 'kael' ? '<circle cx="128" cy="124" r="10" fill="#6fd3ff" class="eye-glow strong"/>' : ''}
      </g>
    </svg>`;
  }

  // ─────────────────────────── Golem de Sucata ───────────────────────────
  function golem() {
    const blocks = [
      [150, 40, 100, 80], [120, 130, 160, 70], [100, 200, 200, 90], [130, 290, 140, 60],
      [40, 140, 70, 60], [290, 140, 70, 60], [30, 205, 60, 90], [310, 205, 60, 90], [20, 300, 70, 50], [310, 300, 70, 50],
      [130, 355, 55, 110], [215, 355, 55, 110],
    ];
    const cols = ['#7a5a3e', '#6b4f38', '#8a6648', '#5e4634'];
    return `<svg viewBox="0 0 400 480" class="golem-svg">
      <g class="g-body">
        ${blocks.map(([x, y, w, h], i) => `<rect class="blk" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${cols[i % 4]}" stroke="#2a1d14" stroke-width="4" style="--d:${(i * .06).toFixed(2)}s;--dx:${((x - 200) / 2).toFixed(0)}px;--r:${(i % 2 ? 1 : -1) * (20 + i * 7)}deg"/>`).join('')}
        <path d="M140 220 l30 20 l-10 25 l25 15 M260 210 l-25 25 l15 20" stroke="#ff9a3c" stroke-width="4" fill="none" class="crack-glow"/>
        <circle cx="200" cy="245" r="22" fill="#ff7a1a" class="core-glow"/>
        <rect x="170" y="70" width="18" height="10" rx="3" fill="#ffdd55" class="eye-glow"/><rect x="212" y="70" width="18" height="10" rx="3" fill="#ffdd55" class="eye-glow"/>
      </g>
    </svg>`;
  }

  // ─────────────────────────── Ator (personagem no palco) ───────────────────────────
  function actorArt(tag) {
    const c = (tag || '').split('_')[0];
    if (c === 'pip') return pip(tag.split('_')[1]);
    if (c === 'golem') return golem();
    return silhouette(c, tag);
  }
  function actor(tag, extra) {
    return `<div class="actor ${extra || ''}" data-char="${tag.split('_')[0]}" data-tag="${tag}">
      <div class="actor-art">${actorArt(tag)}</div>
      <img class="actor-img" alt="" draggable="false">
      <code class="file-tag">${tag}.png</code>
    </div>`;
  }
  // Troca a expressão sem recriar o ator.
  function setActorTag(el, tag) {
    if (el.dataset.tag === tag) return;
    el.dataset.tag = tag;
    el.querySelector('.actor-art').innerHTML = actorArt(tag);
    el.querySelector('.file-tag').textContent = tag + '.png';
    el.classList.remove('has-img'); el.removeAttribute('data-h');
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    hydrate(el.parentNode);
  }

  // Carrega imagens reais quando existirem.
  function hydrate(root) {
    (root || document).querySelectorAll('.scenery:not([data-h]), .actor:not([data-h])').forEach((el) => {
      el.dataset.h = '1';
      const isBg = el.classList.contains('scenery');
      const name = isBg ? el.dataset.bg : el.dataset.tag;
      window.Assets.resolve(isBg ? 'bg' : 'sprite', name).then((src) => {
        if (!src) return;
        el.querySelector(isBg ? '.sc-img' : '.actor-img').src = src;
        el.classList.add('has-img');
      });
    });
  }

  // ─────────────────────────── Efeitos ───────────────────────────
  const EFFECTS = ['tremor', 'flash', 'relampago', 'escuridao', 'luz', 'cristais', 'dados', 'glitch', 'impacto', 'veneno', 'corte', 'desmoronar'];
  function play(stage, name) {
    if (!stage || !name) return;
    const fx = stage.querySelector('.fx-layer') || stage;
    const once = (cls, ms) => { stage.classList.remove(cls); void stage.offsetWidth; stage.classList.add(cls); setTimeout(() => stage.classList.remove(cls), ms); };
    const add = (html, ms) => { const d = document.createElement('div'); d.innerHTML = html; const el = d.firstElementChild; fx.appendChild(el); setTimeout(() => el.remove(), ms); };
    switch (name) {
      case 'tremor': once('fx-shake', 600); GameAudio.play('error'); break;
      case 'flash': add('<div class="fx-flash"></div>', 700); GameAudio.play('hint'); break;
      case 'relampago': add('<div class="fx-flash bolt"></div>', 900); once('fx-shake', 500); break;
      case 'escuridao': stage.classList.add('fx-dark'); break;
      case 'luz': stage.classList.remove('fx-dark', 'fx-poison'); break;
      case 'veneno': stage.classList.add('fx-poison'); break;
      case 'glitch': once('fx-glitch', 900); break;
      case 'impacto': add('<div class="fx-impact"></div>', 700); once('fx-shake', 400); break;
      case 'corte': add('<div class="fx-slash"></div>', 600); break;
      case 'cristais': {
        let h = '<div class="fx-burst">';
        for (let i = 0; i < 26; i++) { const a = rnd(0, Math.PI * 2), d = rnd(120, 420); h += `<i style="--x:${(Math.cos(a) * d).toFixed(0)}px;--y:${(Math.sin(a) * d).toFixed(0)}px;--r:${rnd(-200, 200).toFixed(0)}deg"></i>`; }
        add(h + '</div>', 1600); once('fx-shake', 500); break;
      }
      case 'dados': {
        let h = '<div class="fx-rain">';
        const glyphs = ['0', '1', ';', 'NULL', 'SELECT', '*', 'id', '█'];
        for (let i = 0; i < 40; i++) h += `<i style="left:${rnd(0, 100).toFixed(1)}%;animation-delay:${rnd(0, 1.2).toFixed(2)}s">${glyphs[i % glyphs.length]}</i>`;
        add(h + '</div>', 3000); break;
      }
      case 'desmoronar': stage.querySelectorAll('.golem-svg').forEach((s) => s.classList.add('crumble')); play(stage, 'dados'); break;
    }
  }

  window.FX = { scenery, actor, setActorTag, hydrate, play, pip, golem, EFFECTS };
})();
