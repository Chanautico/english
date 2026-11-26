// Personagens do jogo, com as ilustrações em src/assets/chars/.
// Midori (cabelo verde): presidente animada do Clube de Dados.
// Sakura (cabelo rosa): vice-presidente calma, exigente e um pouco sarcástica.
// As imagens já têm cenário, então as reações aparecem como "emotes" de anime
// (♪, ✦, veia de raiva, gota de suor...) por cima do retrato.
(function () {
  const base = 'assets/chars/';
  const CH = {
    midori: {
      name: 'Midori',
      full: 'Midori Aoba',
      title: { pt: 'Presidente do Clube de Dados', en: 'Data Club President' },
      color: '#3f8f6b',
      soft: '#e3f1e8',
      portrait: base + 'midori-portrait.webp',
      scenes: { day: base + 'midori-park.webp', night: base + 'midori-city.webp' },
      quote: { pt: 'SQL é só fazer perguntas educadas para os dados!', en: 'SQL is just asking data polite questions!' },
    },
    sakura: {
      name: 'Sakura',
      full: 'Sakura Hanamori',
      title: { pt: 'Vice-presidente e bibliotecária', en: 'Vice-president & librarian' },
      color: '#d9735a',
      soft: '#fbe8e1',
      portrait: base + 'sakura-portrait.webp',
      scenes: { day: base + 'sakura-autumn.webp', night: base + 'sakura-autumn.webp' },
      quote: { pt: 'Uma consulta bonita é uma consulta correta.', en: 'A beautiful query is a correct query.' },
    },
  };

  // Emotes desenhados em SVG (funcionam sem fontes de emoji).
  const EMOTE = {
    happy: '<svg viewBox="0 0 40 40"><path d="M14 6v20a5 5 0 1 1-3-4.6V9l18-4v17a5 5 0 1 1-3-4.6V10z" fill="#ff7aa8"/></svg>',
    excited: '<svg viewBox="0 0 40 40"><path d="M20 2l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#ffc83d"/><path d="M33 26l1.6 4.4L39 32l-4.4 1.6L33 38l-1.6-4.4L27 32l4.4-1.6z" fill="#ffc83d"/></svg>',
    angry: '<svg viewBox="0 0 40 40" fill="none" stroke="#e5484d" stroke-width="4" stroke-linecap="round"><path d="M6 15q9 0 9-9M25 6q0 9 9 9M34 25q-9 0-9 9M15 34q0-9-9-9"/></svg>',
    surprised: '<svg viewBox="0 0 40 40"><path d="M16 3h8l-2 23h-4z" fill="#ff8a3d"/><circle cx="20" cy="33" r="4" fill="#ff8a3d"/></svg>',
    thinking: '<svg viewBox="0 0 40 40" fill="#8a7fa8"><circle cx="8" cy="22" r="3.5"/><circle cx="20" cy="22" r="3.5"/><circle cx="32" cy="22" r="3.5"/></svg>',
    sad: '<svg viewBox="0 0 40 40"><path d="M20 3C14 14 10 20 10 26a10 10 0 0 0 20 0c0-6-4-12-10-23z" fill="#7cc4ff"/><path d="M15 26a5 5 0 0 0 4 5" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  };

  function emote(expr) { return EMOTE[expr] ? `<span class="emote emote-${expr}">${EMOTE[expr]}</span>` : ''; }

  // Avatar redondo (retrato).
  function avatar(id, expr, size) {
    const c = CH[id] || CH.midori;
    return `<span class="avatar ${size || ''}" style="--c:${c.color}"><img src="${c.portrait}" alt="${c.name}" draggable="false">${emote(expr)}</span>`;
  }

  // Ilustração de cena (corpo inteiro com cenário).
  function scene(id, time) {
    const c = CH[id] || CH.midori;
    return c.scenes[time] || c.scenes.day;
  }

  window.Characters = { CH, avatar, scene, emote };
})();
