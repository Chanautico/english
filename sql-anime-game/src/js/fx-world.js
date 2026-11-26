// Cenários animados dos Arcos 2 a 6 e arte dos chefes/personagens novos.
// Tudo em SVG gerado por código; se a imagem real existir em src/assets, ela aparece por cima.
(function () {
  const { id, rnd, stars } = FX;
  const W = 1600, H = 900;
  const svg = (body, defs) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs || ''}</defs>${body}</svg>`;
  const sky = (g, a, b, c) => `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

  const scenes = {
    // ── Arco 2: Capital ──
    bg_portao_capital() {
      const g = id('pc');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>${stars(25, 300)}
        ${rep(6, (i) => `<rect x="${80 + i * 260}" y="${320 - (i % 3) * 60}" width="90" height="${600}" fill="#3a3352"/><polygon points="${80 + i * 260},${320 - (i % 3) * 60} ${125 + i * 260},${240 - (i % 3) * 60} ${170 + i * 260},${320 - (i % 3) * 60}" fill="#2c2742"/>`)}
        <rect x="520" y="300" width="560" height="460" fill="#4a4266"/><path d="M600 760 V470 Q800 330 1000 470 V760Z" fill="#1d1830"/>
        <path d="M640 760 V490 Q800 370 960 490 V760" stroke="#e0b44a" stroke-width="6" fill="none" class="flicker"/>
        ${rep(4, (i) => `<path d="M${560 + i * 140} 310 v120 l25 -18 l25 18 v-120Z" fill="${['#c4452f', '#3f6fc4', '#c4452f', '#3f6fc4'][i]}" class="banner" style="animation-delay:${i * .4}s"/>`)}
        <rect y="760" width="${W}" height="140" fill="#2a2438"/>`, sky(g, '#2b3a6b', '#6a7fb8', '#e8c48a'));
    },
    bg_arena_exame() {
      const g = id('ar');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        <ellipse cx="800" cy="900" rx="1000" ry="520" fill="#5a4636"/>
        ${rep(13, (i) => `<path d="M${-40 + i * 130} 520 v-150 q65 -70 130 0 v150Z" fill="#7a6048" stroke="#4a3828" stroke-width="6"/>`)}
        ${rep(90, () => `<circle cx="${rnd(0, W).toFixed(0)}" cy="${rnd(400, 520).toFixed(0)}" r="7" fill="hsl(${rnd(0, 360).toFixed(0)},50%,60%)" class="crowd" style="animation-delay:${rnd(0, 1).toFixed(2)}s"/>`)}
        <ellipse cx="800" cy="760" rx="620" ry="120" fill="#c9a874"/><ellipse cx="800" cy="760" rx="200" ry="40" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>`, sky(g, '#3c6fb0', '#8fb8e0', '#f2d9a8'));
    },
    bg_biblioteca_grande() {
      const g = id('bl');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        ${rep(7, (i) => `<rect x="${i * 240}" y="80" width="210" height="700" fill="#3a2418"/>${rep(6, (j) => rep(9, (k) => `<rect x="${i * 240 + 10 + k * 22}" y="${100 + j * 110}" width="18" height="${80 + (k % 3) * 8}" fill="hsl(${(i * 40 + k * 25) % 360},45%,${35 + (k % 3) * 8}%)"/>`))}`)}
        <ellipse cx="800" cy="120" rx="300" ry="80" fill="#ffe3a0" opacity=".25" class="pulse"/>
        ${rep(6, (i) => `<g class="float-crystal" style="animation-delay:${i * .7}s"><rect x="${200 + i * 230}" y="${300 + (i % 2) * 120}" width="60" height="44" rx="4" fill="#f2e2c4" transform="rotate(${-10 + i * 5} ${230 + i * 230} 320)"/></g>`)}
        <rect y="780" width="${W}" height="120" fill="#24160f"/>`, sky(g, '#2a1a14', '#4a2e20', '#5a3a24'));
    },
    // ── Arco 3: Porto ──
    bg_porto_nevoa() {
      const g = id('pn');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        <rect x="1300" y="260" width="60" height="320" fill="#d8d2c8"/><polygon points="1290,260 1330,200 1370,260" fill="#b04a3a"/><circle cx="1330" cy="230" r="70" fill="#fff6c0" opacity=".35" class="pulse"/>
        ${rep(4, (i) => `<g class="bob" style="animation-delay:${i * .6}s"><path d="M${120 + i * 280} 600 h220 l-30 50 h-160Z" fill="#3a2a22"/><rect x="${225 + i * 280}" y="${400 + (i % 2) * 30}" width="8" height="${200 - (i % 2) * 30}" fill="#2a1e18"/><path d="M${233 + i * 280} ${410 + (i % 2) * 30} l90 70 l-90 30Z" fill="#e8e2d0" opacity=".85"/></g>`)}
        <rect y="620" width="${W}" height="280" fill="#2c4a5a"/>
        ${rep(6, (i) => `<path d="M0 ${660 + i * 40} q200 -14 400 0 t400 0 t400 0 t400 0" stroke="#7fb2c4" stroke-opacity=".35" stroke-width="3" fill="none" class="wave" style="animation-delay:${i * .3}s"/>`)}
        <ellipse cx="800" cy="560" rx="1000" ry="90" fill="#e6eef2" opacity=".35" class="mist"/>`, sky(g, '#5c6f7c', '#9bb0ba', '#c8d4d8'));
    },
    bg_taverna_pirata() {
      const g = id('tp');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        ${rep(9, (i) => `<rect x="${i * 180}" y="0" width="170" height="900" fill="#4a2e1e" opacity="${.5 + (i % 2) * .2}"/>`)}
        <rect y="140" width="${W}" height="30" fill="#2a1a10"/>
        ${rep(5, (i) => `<g class="lantern"><line x1="${200 + i * 300}" y1="170" x2="${200 + i * 300}" y2="250" stroke="#1a100a" stroke-width="4"/><circle cx="${200 + i * 300}" cy="270" r="22" fill="#ffb04d"/></g>`)}
        ${rep(4, (i) => `<g><ellipse cx="${160 + i * 420}" cy="700" rx="90" ry="20" fill="#2a1a10"/><rect x="${70 + i * 420}" y="590" width="180" height="110" rx="20" fill="#6a4228"/><rect x="${70 + i * 420}" y="620" width="180" height="10" fill="#3a2414"/><rect x="${70 + i * 420}" y="660" width="180" height="10" fill="#3a2414"/></g>`)}
        <rect y="760" width="${W}" height="140" fill="#2a1a10"/>`, sky(g, '#3a2216', '#5a3420', '#7a4a28'));
    },
    bg_subterraneo_porto() {
      const g = id('sp');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        <path d="M0 0 H${W} V160 Q1300 260 1100 180 Q900 300 700 190 Q450 280 250 170 Q100 240 0 180Z" fill="#0d1418"/>
        ${rep(8, (i) => `<rect x="${100 + i * 190}" y="560" width="${100 + (i % 3) * 20}" height="${90 + (i % 2) * 40}" fill="#4a3a2a" stroke="#2a2018" stroke-width="5"/>`)}
        <rect y="700" width="${W}" height="200" fill="#11303a"/>
        ${rep(14, (i) => `<rect x="${rnd(0, W).toFixed(0)}" y="200" width="3" height="14" fill="#9fd8e8" class="drip" style="animation-delay:${rnd(0, 3).toFixed(1)}s"/>`)}
        <circle cx="300" cy="420" r="60" fill="#5fd0ff" opacity=".12" class="pulse"/>`, sky(g, '#0f1a1e', '#16262c', '#1d343c'));
    },
    // ── Arco 4: Null-Void ──
    bg_floresta_morta() {
      const g = id('fm');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>${stars(30, 300)}
        <circle cx="1200" cy="180" r="80" fill="#d9c8ff" opacity=".7"/>
        ${rep(9, (i) => { const x = 60 + i * 190, h = 380 + (i % 3) * 90; return `<path d="M${x} 800 L${x + 8} ${800 - h} M${x + 6} ${800 - h * .6} L${x - 60} ${800 - h * .85} M${x + 6} ${800 - h * .75} L${x + 70} ${800 - h * .95} M${x + 4} ${800 - h * .4} L${x + 50} ${800 - h * .55}" stroke="#1a1424" stroke-width="${14 - (i % 3) * 3}" stroke-linecap="round" fill="none"/>`; })}
        <rect y="780" width="${W}" height="120" fill="#140f1c"/>
        <ellipse cx="800" cy="760" rx="1000" ry="100" fill="#9a5cff" opacity=".18" class="mist"/>`, sky(g, '#140c24', '#3a2050', '#5a3070'));
    },
    bg_fortaleza_obsidian() {
      const g = id('fo');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        <path d="M300 820 L420 300 L480 420 L560 160 L640 420 L720 220 L800 60 L880 220 L960 420 L1040 160 L1120 420 L1180 300 L1300 820Z" fill="#0c0a12" stroke="#b14cff" stroke-width="3" stroke-opacity=".6"/>
        ${rep(6, (i) => `<rect x="${600 + i * 70}" y="${420 + (i % 2) * 60}" width="20" height="40" fill="#ff3b5c" class="flicker" style="animation-delay:${i * .5}s"/>`)}
        <g class="clouds">${rep(5, (i) => `<ellipse cx="${i * 500}" cy="${100 + (i % 2) * 60}" rx="300" ry="50" fill="#3a0f1e" opacity=".8"/>`)}</g>
        <rect y="820" width="${W}" height="80" fill="#0a0810"/>`, sky(g, '#2a0612', '#6a1424', '#a8302a'));
    },
    bg_sala_espelhos() {
      const g = id('se');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        ${rep(7, (i) => `<g><rect x="${40 + i * 225}" y="120" width="190" height="600" rx="95" fill="#b8c4e8" opacity=".18" stroke="#d8e0ff" stroke-width="5"/><rect x="${70 + i * 225}" y="150" width="40" height="540" rx="20" fill="#fff" opacity=".18" class="shine" style="animation-delay:${i * .4}s"/></g>`)}
        <rect y="760" width="${W}" height="140" fill="#1c1a2e"/><path d="M0 760 H${W}" stroke="#d8e0ff" stroke-opacity=".3" stroke-width="4"/>`, sky(g, '#1c1a3a', '#34306a', '#4a4488'));
    },
    // ── Arco 5: Restauração ──
    bg_capital_chamas() {
      const g = id('cc');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        ${rep(11, (i) => { const h = 200 + ((i * 37) % 5) * 70; return `<rect x="${i * 150}" y="${760 - h}" width="130" height="${h}" fill="#1e1418"/>`; })}
        ${rep(9, (i) => `<path d="M${80 + i * 175} 760 q-40 -120 20 -200 q10 80 50 60 q20 -70 -10 -140 q90 90 40 280Z" fill="#ff7a2a" opacity=".85" class="fire" style="animation-delay:${i * .25}s"/>`)}
        <rect y="760" width="${W}" height="140" fill="#140c0e"/>`, sky(g, '#1a0a0a', '#6a1a10', '#e0602a'));
    },
    bg_santuario_dados() {
      const g = id('sd');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        ${rep(6, (i) => `<rect x="${120 + i * 250}" y="200" width="70" height="560" fill="#e8e4f4"/><rect x="${105 + i * 250}" y="180" width="100" height="30" fill="#d8d2ea"/>`)}
        <polygon points="800,180 860,300 800,420 740,300" fill="#9ff5ff" class="float-crystal"/>
        <circle cx="800" cy="300" r="160" fill="#9ff5ff" opacity=".18" class="pulse"/>
        ${rep(20, () => `<text x="${rnd(0, W).toFixed(0)}" y="${rnd(100, 700).toFixed(0)}" font-family="monospace" font-size="22" fill="#9ff5ff" opacity=".35" class="float-crystal">${['01', 'id', ';', '{}', 'PK'][Math.floor(rnd(0, 5))]}</text>`)}
        <rect y="760" width="${W}" height="140" fill="#c8c2dc"/>`, sky(g, '#6a7ab8', '#a8b4e0', '#e8ecff'));
    },
    bg_torre_central() {
      const g = id('tc');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        <rect x="600" y="0" width="400" height="${H}" fill="#14182a"/>
        ${rep(8, (i) => `<rect x="560" y="${i * 120}" width="480" height="14" fill="#2a3456"/>`)}
        <g class="elevator"><rect x="700" y="420" width="200" height="220" rx="10" fill="#3a4a7a" stroke="#9fd8ff" stroke-width="4"/><rect x="730" y="450" width="140" height="160" fill="#9fd8ff" opacity=".25"/></g>
        ${rep(5, (i) => `<ellipse cx="800" cy="${120 + i * 170}" rx="${330 + i * 10}" ry="30" fill="none" stroke="#5fd0ff" stroke-opacity=".35" stroke-width="3" class="ring" style="animation-delay:${i * .5}s"/>`)}`, sky(g, '#0a0e1e', '#1a2244', '#2a3466'));
    },
    // ── Arco 6: Núcleo ──
    bg_nucleo_dataia() {
      const g = id('nd');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>${stars(60, 900)}
        ${rep(3, (i) => `<ellipse cx="800" cy="450" rx="${260 + i * 120}" ry="${80 + i * 40}" fill="none" stroke="#9ff5ff" stroke-opacity="${.5 - i * .12}" stroke-width="3" class="spin" style="animation-duration:${10 + i * 6}s"/>`)}
        <circle cx="800" cy="450" r="220" fill="#7ff0ff" opacity=".15" class="pulse"/>
        <polygon points="800,200 900,450 800,700 700,450" fill="#bff8ff" stroke="#fff" stroke-width="4" class="float-crystal"/>`, sky(g, '#020610', '#0a1a3a', '#10284a'));
    },
    bg_vazio_branco() {
      const g = id('vb');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        ${rep(17, (i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="${H}" stroke="#c8c8d8" stroke-opacity=".35"/>`)}${rep(10, (i) => `<line x1="0" y1="${i * 100}" x2="${W}" y2="${i * 100}" stroke="#c8c8d8" stroke-opacity=".35"/>`)}
        ${rep(12, () => `<rect x="${rnd(0, W).toFixed(0)}" y="${rnd(0, H).toFixed(0)}" width="40" height="40" fill="#d8d8e8" class="float-crystal" style="animation-delay:${rnd(0, 5).toFixed(1)}s"/>`)}`, sky(g, '#ffffff', '#f2f2f8', '#e4e4ee'));
    },
    bg_capital_renovada() {
      const g = id('cr');
      return svg(`<rect width="${W}" height="${H}" fill="url(#${g})"/>
        <circle cx="800" cy="560" r="160" fill="#ffe08a" class="pulse"/>
        ${rep(11, (i) => { const h = 180 + ((i * 53) % 6) * 60; return `<rect x="${i * 150}" y="${760 - h}" width="130" height="${h}" fill="#5a6a9a"/>${rep(3, (j) => `<rect x="${i * 150 + 20 + j * 35}" y="${790 - h}" width="18" height="24" fill="#ffe8a8" class="flicker"/>`)}`; })}
        ${rep(6, (i) => `<path d="M${200 + i * 220} ${200 + (i % 3) * 50} q15 -12 30 0 q15 -12 30 0" stroke="#3a3a5a" stroke-width="4" fill="none" class="bird" style="animation-delay:${i * .6}s"/>`)}
        <rect y="760" width="${W}" height="140" fill="#3a4a6a"/>`, sky(g, '#6aa8e8', '#f8c8a0', '#ffe8b8'));
    },
  };

  const particles = {
    bg_portao_capital: 'mote', bg_arena_exame: 'ember', bg_biblioteca_grande: 'mote', bg_porto_nevoa: 'mote', bg_taverna_pirata: 'ember',
    bg_subterraneo_porto: 'mote', bg_floresta_morta: 'void', bg_fortaleza_obsidian: 'ember', bg_sala_espelhos: 'shard', bg_capital_chamas: 'ember',
    bg_santuario_dados: 'shard', bg_torre_central: 'mote', bg_nucleo_dataia: 'shard', bg_vazio_branco: 'void', bg_capital_renovada: 'mote',
  };

  // ── Chefes ──
  function juiz() {
    return `<svg viewBox="0 0 400 480" class="boss-svg juiz-svg"><g class="g-body">
      ${[90, 200, 310].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="120" stroke="#c9b8ff" stroke-width="2" class="eye-glow"/>`).join('')}
      <rect x="140" y="40" width="120" height="110" rx="20" fill="#5a5a72" stroke="#2a2a3a" stroke-width="5"/>
      <rect x="160" y="85" width="80" height="14" fill="#ffdd55" class="eye-glow"/>
      <path d="M90 170 h220 l30 170 h-280Z" fill="#6a6a86" stroke="#2a2a3a" stroke-width="5"/>
      <path d="M170 170 v170 M230 170 v170" stroke="#3a3a4e" stroke-width="5"/>
      <circle cx="200" cy="240" r="22" fill="#c9b8ff" class="core-glow"/>
      <rect x="40" y="180" width="48" height="140" rx="14" fill="#5a5a72" stroke="#2a2a3a" stroke-width="5"/><rect x="312" y="180" width="48" height="140" rx="14" fill="#5a5a72" stroke="#2a2a3a" stroke-width="5"/>
      <path d="M330 320 l10 120 h20 l10 -120Z" fill="#a89a6a"/><rect x="300" y="300" width="90" height="26" rx="6" fill="#c9b87a"/>
      <rect x="130" y="340" width="55" height="130" fill="#4a4a60"/><rect x="215" y="340" width="55" height="130" fill="#4a4a60"/></g></svg>`;
  }
  function hydra() {
    const necks = [[60, 120], [130, 60], [200, 30], [270, 60], [340, 120]];
    return `<svg viewBox="0 0 400 480" class="boss-svg hydra-svg"><g class="g-body">
      <ellipse cx="200" cy="420" rx="170" ry="70" fill="#1f5a5a" stroke="#0c2a2a" stroke-width="5"/>
      ${necks.map(([x, y], i) => `<g class="neck" style="animation-delay:${i * .25}s"><path d="M200 400 Q${(200 + x) / 2} ${y + 180} ${x} ${y + 40}" stroke="#2a7a72" stroke-width="34" fill="none" stroke-linecap="round"/>
        <ellipse cx="${x}" cy="${y + 30}" rx="34" ry="26" fill="#2f8a80" stroke="#0c2a2a" stroke-width="4"/><circle cx="${x + 12}" cy="${y + 24}" r="6" fill="#ffdd55" class="eye-glow"/><path d="M${x - 30} ${y + 40} l-14 8" stroke="#fff" stroke-width="4"/></g>`).join('')}
      <circle cx="200" cy="410" r="20" fill="#7ff0ff" class="core-glow"/></g></svg>`;
  }
  function leviata() {
    return `<svg viewBox="0 0 400 480" class="boss-svg leviata-svg"><g class="g-body">
      <path d="M40 460 Q20 320 120 300 Q220 280 200 200 Q180 110 280 90 Q360 80 370 150" stroke="#3a2a5a" stroke-width="70" fill="none" stroke-linecap="round"/>
      <path d="M40 460 Q20 320 120 300 Q220 280 200 200 Q180 110 280 90 Q360 80 370 150" stroke="#6a4aa0" stroke-width="40" fill="none" stroke-linecap="round" stroke-dasharray="10 26"/>
      <path d="M330 120 l60 -10 l-20 40 l30 20 l-70 10Z" fill="#4a3a7a"/><circle cx="350" cy="120" r="9" fill="#ff3b5c" class="eye-glow"/>
      <text x="90" y="330" font-family="monospace" font-weight="900" font-size="34" fill="#ff3b5c" class="eye-glow">DROP</text>
      <circle cx="200" cy="210" r="24" fill="#ff3b5c" class="core-glow"/></g></svg>`;
  }

  const looks = { pai: { c: '#ffb36b' }, guardiao: { c: '#ff3b5c' }, clone: { c: '#b14cff' }, lyra: { c: '#c77dff' } };
  const hair = {
    pai: `<path d="M98 118 L86 70 L118 86 L114 48 L144 76 L156 40 L170 78 L196 50 L192 88 L216 76 L204 118 Q196 86 150 82 Q106 86 98 118Z"/>
          <path d="M112 150 Q150 196 188 150 Q184 180 150 190 Q116 180 112 150Z"/>`,
    guardiao: `<path d="M90 160 Q86 50 150 44 Q214 50 210 160 L196 170 L196 110 L104 110 L104 170Z"/><path d="M150 44 L150 0 L170 30Z"/>
               <path d="M60 260 Q40 240 70 220 L110 250 M240 260 Q260 240 230 220 L190 250" stroke="var(--c)" stroke-width="3" fill="none"/>`,
    clone: `<path d="M96 120 L82 66 L112 84 L104 40 L136 72 L146 26 L164 70 L190 34 L188 80 L222 62 L204 116 Q200 80 150 76 Q104 80 96 120Z"/>
            <path class="scarf" d="M112 210 Q150 232 190 210 L196 232 Q150 256 106 232Z M180 226 Q230 250 262 236 Q236 270 196 246Z" fill="var(--c)" opacity=".9"/>`,
  };
  const art = {
    juiz: () => juiz(), hydra: () => hydra(), leviata: () => leviata(),
    clone: (tag) => `<div class="clone-wrap">${FX.silhouette('clone', tag.replace('clone', 'ren'))}</div>`,
  };

  FX.extend({ scenes, particles, art, looks, hair });
})();
