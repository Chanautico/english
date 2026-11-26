// Personagens originais desenhados em SVG (arte provisória — troque por arte
// encomendada antes de lançar na Steam; veja docs/STEAM.md).
// Hana Hoshino: presidente animada do Clube de Dados (cabelo laranja curto).
// Rei Kurogane: bibliotecária calma e sarcástica (cabelo azul-escuro longo, óculos).
(function () {
  const CH = {
    hana: {
      name: 'Hana',
      title: { pt: 'Presidente do Clube de Dados', en: 'Data Club President' },
      color: '#ff8a3d',
      hair: '#ff9a4d', hairDark: '#d9652a', hairLight: '#ffc58a',
      eye: '#2bb3a3', eyeDark: '#136b62',
      uniform: '#2d3a6b', uniformDark: '#1e2850', accent: '#ff4f7b',
      skin: '#ffe3d1', skinShade: '#f5c4a8',
      glasses: false, style: 'short',
    },
    rei: {
      name: 'Rei',
      title: { pt: 'Bibliotecária e vice-presidente', en: 'Librarian & vice-president' },
      color: '#7a8cff',
      hair: '#2c3570', hairDark: '#1a1f47', hairLight: '#5563b0',
      eye: '#a35cff', eyeDark: '#5a2a99',
      uniform: '#2d3a6b', uniformDark: '#1e2850', accent: '#7a8cff',
      skin: '#fde6d8', skinShade: '#efc6b0',
      glasses: true, style: 'long',
    },
  };

  function mouth(expr, c) {
    switch (expr) {
      case 'happy': return `<path d="M182 262 Q200 282 218 262 Q200 272 182 262Z" fill="#b33a4a"/><path d="M190 268 Q200 276 210 268" fill="#ff8fa0"/>`;
      case 'excited': return `<path d="M180 258 Q200 292 220 258 Z" fill="#b33a4a"/><path d="M188 274 Q200 286 212 274 Q200 278 188 274Z" fill="#ff8fa0"/>`;
      case 'angry': return `<path d="M186 270 Q200 260 214 270" stroke="#8a2a36" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      case 'surprised': return `<ellipse cx="200" cy="268" rx="8" ry="10" fill="#b33a4a"/>`;
      case 'thinking': return `<path d="M188 268 L210 264" stroke="#8a2a36" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'sad': return `<path d="M188 270 Q200 262 212 270" stroke="#8a2a36" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      default: return `<path d="M188 264 Q200 272 212 264" stroke="#8a2a36" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    }
  }

  function brows(expr, c) {
    const col = c.hairDark;
    if (expr === 'angry') return `<path d="M142 180 L182 192" stroke="${col}" stroke-width="5" stroke-linecap="round"/><path d="M258 180 L218 192" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`;
    if (expr === 'sad') return `<path d="M144 188 L180 178" stroke="${col}" stroke-width="4.5" stroke-linecap="round"/><path d="M256 188 L220 178" stroke="${col}" stroke-width="4.5" stroke-linecap="round"/>`;
    if (expr === 'surprised' || expr === 'excited') return `<path d="M144 172 Q162 162 182 170" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M256 172 Q238 162 218 170" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    if (expr === 'thinking') return `<path d="M144 182 Q162 176 182 182" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M256 172 Q238 166 218 174" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    return `<path d="M144 180 Q162 172 182 178" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M256 180 Q238 172 218 178" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }

  function eye(cx, c, expr, flip) {
    if (expr === 'happy' || expr === 'excited') {
      // olhos fechados sorrindo (^ ^)
      return `<path d="M${cx - 20} 222 Q${cx} 198 ${cx + 20} 222" stroke="${c.eyeDark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    const ry = expr === 'surprised' ? 26 : 23;
    const lidY = expr === 'angry' ? 206 : expr === 'thinking' ? 210 : 200;
    return `
      <g class="eye">
        <ellipse cx="${cx}" cy="222" rx="19" ry="${ry}" fill="#fff"/>
        <ellipse cx="${cx}" cy="226" rx="15" ry="${ry - 4}" fill="${c.eye}"/>
        <ellipse cx="${cx}" cy="232" rx="13" ry="${ry - 10}" fill="${c.eyeDark}" opacity=".55"/>
        <ellipse cx="${cx}" cy="228" rx="7" ry="${ry - 12}" fill="#120a1e"/>
        <circle cx="${cx + (flip ? -6 : 6)}" cy="214" r="6" fill="#fff"/>
        <circle cx="${cx + (flip ? 6 : -6)}" cy="238" r="3" fill="#fff" opacity=".85"/>
        <path d="M${cx - 22} ${lidY + 4} Q${cx} ${lidY - 8} ${cx + 22} ${lidY + 4}" stroke="#2a1830" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M${flip ? cx - 22 : cx + 22} ${lidY + 4} l${flip ? -6 : 6} -5" stroke="#2a1830" stroke-width="3.5" stroke-linecap="round"/>
      </g>`;
  }

  function hairBack(c) {
    if (c.style === 'long') {
      return `<path d="M108 170 Q96 330 120 520 L280 520 Q304 330 292 170 Q200 90 108 170Z" fill="${c.hairDark}"/>
              <path d="M120 180 Q110 330 136 500 L264 500 Q290 330 280 180Z" fill="${c.hair}"/>`;
    }
    return `<path d="M112 180 Q100 270 128 320 L272 320 Q300 270 288 180 Q200 100 112 180Z" fill="${c.hairDark}"/>`;
  }

  function hairFront(c) {
    const shine = `<path d="M150 128 Q200 108 246 126" stroke="${c.hairLight}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`;
    if (c.style === 'long') {
      return `
        <path d="M116 200 Q110 110 200 96 Q290 110 284 200 Q270 160 250 150 L244 196 L228 150 Q214 170 206 200 L198 148 Q180 170 172 196 L168 150 Q150 160 140 196 Z" fill="${c.hair}"/>
        <path d="M116 200 Q108 280 126 330 Q132 260 140 196Z" fill="${c.hair}"/>
        <path d="M284 200 Q292 280 274 330 Q268 260 260 196Z" fill="${c.hair}"/>
        ${shine}`;
    }
    return `
      <path d="M112 214 Q100 112 200 98 Q300 112 288 214 Q276 168 256 154 L252 204 L232 152 Q218 176 210 206 L200 150 Q184 176 176 202 L170 152 Q148 166 140 210 Z" fill="${c.hair}"/>
      <path d="M112 214 Q104 270 124 300 Q128 250 138 210Z" fill="${c.hair}"/>
      <path d="M288 214 Q296 270 276 300 Q272 250 262 210Z" fill="${c.hair}"/>
      <path d="M200 98 Q214 70 236 76 Q218 84 214 100Z" fill="${c.hair}"/>
      <g transform="translate(250 140) rotate(18)"><path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4Z" fill="#ffd84d" stroke="#e0a800" stroke-width="1.5"/></g>
      ${shine}`;
  }

  function body(c) {
    return `
      <path d="M182 290 L218 290 L222 330 L178 330Z" fill="${c.skinShade}"/>
      <path d="M70 600 Q76 380 150 340 L250 340 Q324 380 330 600Z" fill="${c.uniform}"/>
      <path d="M150 340 L200 420 L250 340 L280 356 L200 470 L120 356Z" fill="#f4f1ff"/>
      <path d="M128 360 L200 470 L272 360" stroke="${c.accent}" stroke-width="5" fill="none"/>
      <path d="M200 420 L176 470 L200 460 L224 470 Z" fill="${c.accent}"/>
      <circle cx="200" cy="424" r="9" fill="${c.accent}"/>
      <path d="M70 600 Q74 470 112 400" stroke="${c.uniformDark}" stroke-width="10" fill="none"/>
      <path d="M330 600 Q326 470 288 400" stroke="${c.uniformDark}" stroke-width="10" fill="none"/>`;
  }

  function glasses(c) {
    if (!c.glasses) return '';
    return `<g fill="none" stroke="#4a3d6b" stroke-width="3.5">
      <rect x="138" y="198" width="48" height="46" rx="12"/><rect x="214" y="198" width="48" height="46" rx="12"/>
      <path d="M186 218 Q200 210 214 218"/></g>
      <path d="M146 206 L160 206" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M222 206 L236 206" stroke="#fff" stroke-width="3" opacity=".6"/>`;
  }

  // Desenha a personagem. expr: neutral | happy | excited | angry | surprised | thinking | sad
  function draw(id, expr) {
    const c = CH[id] || CH.hana;
    expr = expr || 'neutral';
    const blush = ['happy', 'excited', 'angry', 'surprised'].includes(expr) ? '.75' : '.35';
    return `
    <svg viewBox="40 60 320 540" xmlns="http://www.w3.org/2000/svg" class="char-svg" data-char="${id}" data-expr="${expr}">
      ${hairBack(c)}
      ${body(c)}
      <path d="M132 190 Q130 290 200 304 Q270 290 268 190 Q200 130 132 190Z" fill="${c.skin}"/>
      <path d="M134 230 Q140 286 200 302 Q160 280 150 240Z" fill="${c.skinShade}" opacity=".5"/>
      <ellipse cx="128" cy="230" rx="10" ry="16" fill="${c.skin}"/><ellipse cx="272" cy="230" rx="10" ry="16" fill="${c.skin}"/>
      <ellipse cx="156" cy="256" rx="16" ry="8" fill="#ff7a9a" opacity="${blush}"/>
      <ellipse cx="244" cy="256" rx="16" ry="8" fill="#ff7a9a" opacity="${blush}"/>
      ${eye(162, c, expr, false)}
      ${eye(238, c, expr, true)}
      ${brows(expr, c)}
      <path d="M199 244 L196 252 L202 252" stroke="${c.skinShade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${mouth(expr, c)}
      ${glasses(c)}
      ${hairFront(c)}
      ${expr === 'angry' ? '<g fill="#ff3b5c" transform="translate(286 128)"><path d="M0 0 l10 10 M20 0 l-10 10 M0 20 l10 -10 M20 20 l-10 -10" stroke="#ff3b5c" stroke-width="4" stroke-linecap="round"/></g>' : ''}
      ${expr === 'thinking' ? '<g fill="#cfd6ff" opacity=".9"><circle cx="300" cy="120" r="6"/><circle cx="318" cy="98" r="9"/><circle cx="340" cy="72" r="12"/></g>' : ''}
      ${expr === 'excited' ? '<g fill="#ffd84d"><path d="M88 120 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z"/><path d="M318 160 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z"/></g>' : ''}
      ${expr === 'sad' ? '<path d="M262 236 q6 14 0 20 q-6 -6 0 -20z" fill="#8fd3ff"/>' : ''}
    </svg>`;
  }

  window.Characters = { CH, draw };
})();
