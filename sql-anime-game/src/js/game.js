// Sakura Query — motor do jogo (telas, progresso, verificação de respostas).
// Layout: tela título dividida, mapa de "estações" (módulos), cenas com foto
// polaroid + caderno, e questões em formato de chat com a professora.
(function () {
  const t = (k, v) => I18N.t(k, v);
  const L = (o) => I18N.L(o);
  const { MODULES, ACHIEVEMENTS } = Content;
  const CH = Characters.CH;
  const app = document.getElementById('app');
  const SAVE_KEY = 'sakuraquery.save.v1';
  const pt = () => I18N.lang === 'pt';

  // ─────────────────────────── Save ───────────────────────────
  const defaultSave = () => ({
    lang: (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en',
    settings: { sfx: true, music: true, speed: 'normal', fullscreen: false },
    done: {}, seen: {}, hintsUsed: {}, gems: 0, ach: {}, last: null,
  });
  let save = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) save = Object.assign(defaultSave(), JSON.parse(raw));
    save.settings = Object.assign(defaultSave().settings, save.settings || {});
  } catch (e) { /* save corrompido: começa do zero */ }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignora */ } }
  I18N.lang = save.lang;
  GameAudio.setSfx(save.settings.sfx);
  GameAudio.setMusic(false);

  // ─────────────────────────── SQL ───────────────────────────
  let SQL = null, seedBytes = null;
  function runSql(query) {
    const db = new SQL.Database(seedBytes);
    try {
      const res = db.exec(query);
      const last = res.length ? res[res.length - 1] : { columns: [], values: [] };
      return { ok: true, columns: last.columns, values: last.values };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    } finally { db.close(); }
  }

  const norm = (v) => (v === null || v === undefined ? '∅' : typeof v === 'number' ? String(Math.round(v * 10000) / 10000) : String(v));
  const rowKey = (r) => r.map(norm).join('\u0001');

  // Roda SQL num banco qualquer (bytes exportados de um banco já populado).
  function runOn(bytes, query) {
    const db = new SQL.Database(bytes);
    try {
      const res = db.exec(query);
      const last = res.length ? res[res.length - 1] : { columns: [], values: [] };
      return { ok: true, columns: last.columns, values: last.values };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    } finally { db.close(); }
  }
  function makeDb(setupSql) { const db = new SQL.Database(); db.exec(setupSql); const b = db.export(); db.close(); return b; }

  // Compara dois resultados (jogador x gabarito). ordered = a ordem das linhas importa.
  function compare(got, exp, ordered) {
    if (got.columns.length !== exp.columns.length) return { ok: false, msg: t('wrongCols', { e: exp.columns.length, g: got.columns.length }), exp };
    if (got.values.length !== exp.values.length) return { ok: false, msg: t('wrongCount', { e: exp.values.length, g: got.values.length }), exp };
    const g = got.values.map(rowKey), e = exp.values.map(rowKey);
    const gs = [...g].sort(), es = [...e].sort();
    if (!gs.every((x, i) => x === es[i])) return { ok: false, msg: t('wrongValues'), exp };
    if (ordered && !g.every((x, i) => x === e[i])) return { ok: false, msg: t('wrongOrder'), exp };
    return { ok: true, exp };
  }

  // Compara o resultado do jogador com a resposta oficial (modo Academia).
  function check(challenge, got) { return compare(got, runSql(challenge.solution), challenge.ordered); }

  // ─────────────────────────── Utilidades ───────────────────────────
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const allChallenges = () => MODULES.flatMap((m) => m.challenges);
  const moduleDone = (m) => m.challenges.every((c) => save.done[c.id]);
  const moduleUnlocked = (i) => i === 0 || moduleDone(MODULES[i - 1]);
  const totalDone = () => allChallenges().filter((c) => save.done[c.id]).length;
  const sceneTime = (m) => m.time || 'day';
  const T2 = (p, e) => ({ pt: p, en: e });

  const KW = /^(SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|ASC|DESC|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|WITH|OVER|PARTITION|UNION|ALL|EXISTS|INSERT|UPDATE|DELETE|CREATE|TABLE|VALUES|INTO|SET)$/i;
  const FN = /^(COUNT|SUM|AVG|MIN|MAX|ROUND|RANK|ROW_NUMBER|DENSE_RANK|COALESCE|CAST|LOWER|UPPER|LENGTH|SUBSTR|STRFTIME|DATE|IFNULL)$/i;
  function highlight(sqlText) {
    let out = '';
    const re = /(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)|([\s\S])/g;
    let m;
    while ((m = re.exec(sqlText))) {
      if (m[1]) out += `<span class="hl-com">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="hl-str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="hl-num">${m[3]}</span>`;
      else if (m[4]) out += KW.test(m[4]) ? `<span class="hl-kw">${esc(m[4])}</span>` : FN.test(m[4]) ? `<span class="hl-fn">${esc(m[4])}</span>` : esc(m[4]);
      else out += esc(m[5]);
    }
    return out + '\n';
  }

  function leaves(n) {
    let h = '<div class="leaves" aria-hidden="true">';
    for (let i = 0; i < n; i++) {
      const left = Math.random() * 100, dur = 9 + Math.random() * 10, delay = -Math.random() * 18, size = 9 + Math.random() * 9;
      h += `<i style="left:${left}%;animation-duration:${dur}s;animation-delay:${delay}s;width:${size}px;height:${size * 0.6}px"></i>`;
    }
    return h + '</div>';
  }

  function toast(html, cls) {
    const el = document.createElement('div');
    el.className = 'toast ' + (cls || '');
    el.innerHTML = html;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3200);
  }

  function unlock(id) {
    if (save.ach[id]) return;
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    save.ach[id] = Date.now(); persist();
    GameAudio.play('achievement');
    toast(`<span class="ach-icon">${a.icon}</span><div><small>${t('achUnlocked')}</small><b>${esc(L(a.name))}</b></div>`, 'ach');
    if (window.desktop && window.desktop.unlockAchievement) window.desktop.unlockAchievement(id);
  }

  // progress: { done, total } opcional (modo história passa o próprio progresso).
  function header(crumb, progress) {
    const done = progress ? progress.done : totalDone(), total = progress ? progress.total : allChallenges().length;
    return `<header class="hdr">
      <button class="brand" data-act="menu"><span class="brand-mark">桜</span><span>Sakura <b>Query</b></span></button>
      <div class="crumb">${crumb || ''}</div>
      <div class="hdr-right">
        <span class="pill" title="${t('questionsDone', { n: done, total })}"><span class="ring" style="--p:${(done / total) * 100}"></span>${done}/${total}</span>
        <span class="pill gem" title="${t('gems')}">◆ <b>${save.gems}</b></span>
        <button class="icon-btn" data-act="ach" title="${t('achievements')}">★</button>
        <button class="icon-btn" data-act="settings" title="${t('settings')}">⚙</button>
      </div>
    </header>`;
  }
  function bindHeader(root, onHome) {
    $$('[data-act="menu"]', root).forEach((b) => b.onclick = () => { GameAudio.play('click'); (onHome || showHub)(); });
    $$('[data-act="settings"]', root).forEach((b) => b.onclick = () => { GameAudio.play('click'); showSettings(); });
    $$('[data-act="ach"]', root).forEach((b) => b.onclick = () => { GameAudio.play('click'); showAchievements(); });
  }

  // ─────────────────────────── Modais ───────────────────────────
  function modal(html, onClose) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal">${html}</div>`;
    document.body.appendChild(wrap);
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) close(); });
    $$('[data-close]', wrap).forEach((b) => b.onclick = () => { GameAudio.play('click'); close(); });
    return { el: wrap, close };
  }

  function showSettings() {
    const s = save.settings;
    const seg = (name, opts, cur) => `<div class="seg" data-name="${name}">${opts.map(([v, label]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-v="${v}">${label}</button>`).join('')}</div>`;
    const m = modal(`
      <h2>⚙ ${t('settings')}</h2>
      <div class="set-row"><span>${t('language')}</span>${seg('lang', [['pt', 'Português'], ['en', 'English']], save.lang)}</div>
      <div class="set-row"><span>${t('sound')}</span>${seg('sfx', [[true, t('on')], [false, t('off')]], s.sfx)}</div>
      <div class="set-row"><span>${t('music')}</span>${seg('music', [[true, t('on')], [false, t('off')]], s.music)}</div>
      <div class="set-row"><span>${t('textSpeed')}</span>${seg('speed', [['slow', t('slow')], ['normal', t('normal')], ['fast', t('fast')], ['instant', t('instant')]], s.speed)}</div>
      <div class="set-row"><span>${t('fullscreen')}</span>${seg('fullscreen', [[true, t('on')], [false, t('off')]], s.fullscreen)}</div>
      <p class="muted small">${t('saved')}<br>${t('shortcuts')}</p>
      <div class="modal-actions"><button class="btn danger sm" data-reset>${t('resetSave')}</button><button class="btn primary" data-close>${t('close')}</button></div>
    `, () => rerender());
    $$('.seg', m.el).forEach((segEl) => {
      $$('button', segEl).forEach((b) => b.onclick = () => {
        GameAudio.play('click');
        $$('button', segEl).forEach((x) => x.classList.remove('on')); b.classList.add('on');
        const name = segEl.dataset.name, raw = b.dataset.v, v = raw === 'true' ? true : raw === 'false' ? false : raw;
        if (name === 'lang') { save.lang = v; I18N.lang = v; persist(); m.close(); showSettings(); return; }
        s[name] = v;
        if (name === 'sfx') GameAudio.setSfx(v);
        if (name === 'music') GameAudio.setMusic(v);
        if (name === 'fullscreen') setFullscreen(v);
        persist();
      });
    });
    $('[data-reset]', m.el).onclick = () => {
      if (confirm(t('resetConfirm'))) { const lang = save.lang; save = defaultSave(); save.lang = lang; persist(); m.close(); showTitle(); }
    };
  }

  function setFullscreen(on) {
    if (window.desktop) return window.desktop.setFullscreen(on);
    try { on ? document.documentElement.requestFullscreen() : document.exitFullscreen(); } catch (e) { /* ignora */ }
  }

  function showAchievements() {
    const got = Object.keys(save.ach).length;
    modal(`<h2>★ ${t('achievements')} <small class="muted">${got}/${ACHIEVEMENTS.length}</small></h2>
      <div class="ach-grid">${ACHIEVEMENTS.map((a) => `<div class="ach-card ${save.ach[a.id] ? 'got' : ''}"><span class="ach-icon">${a.icon}</span><div><b>${esc(L(a.name))}</b><small>${esc(L(a.desc))}</small></div></div>`).join('')}</div>
      <div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
  }

  function showCredits() {
    modal(`<h2>${t('credits')}</h2>
      <div class="credit-chars">${['midori', 'sakura'].map((id) => `<div>${Characters.avatar(id, null, 'lg')}<b>${CH[id].full}</b><small>${esc(L(CH[id].title))}</small></div>`).join('')}</div>
      <p><b>Sakura Query</b> — ${t('tagline')}</p>
      <p class="muted small">Engine: Electron + SQLite (sql.js, MIT).</p>
      <div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
  }

  // ─────────────────────────── Tela título (dividida na diagonal) ───────────────────────────
  let current = null;
  function rerender() { if (current) current(); }

  function showTitle() {
    current = showTitle;
    const started = totalDone() > 0 || Object.keys(save.seen).length > 0;
    app.innerHTML = `
      <section class="screen title">
        <div class="tl-art tl-left tl-dataia">${FX.scenery('bg_vila_arquivo')}<div class="tl-cast">${FX.actor('ren_confiante', 'tl-ren')}${FX.actor('pip_feliz', 'tl-pip')}</div></div>
        <div class="tl-art tl-right" style="background-image:url('${Characters.scene('sakura', 'day')}')"></div>
        <div class="tl-seam"></div>
        ${leaves(16)}
        <div class="tl-names"><span class="nm-l" style="--c:#e8742c">⚔ ${pt() ? 'Crônicas de Dataia' : 'Chronicles of Dataia'}</span><span class="nm-r" style="--c:${CH.sakura.color}">🌸 ${pt() ? 'Academia' : 'Academy'}</span></div>
        <div class="tl-lang"><button class="${save.lang === 'pt' ? 'on' : ''}" data-lang="pt">PT-BR</button><button class="${save.lang === 'en' ? 'on' : ''}" data-lang="en">EN</button></div>
        <div class="tl-card">
          <div class="tape"></div>
          <div class="tl-logo"><span class="tl-kanji">桜</span><h1>Sakura <b>Query</b></h1></div>
          <p class="tl-tag">${t('tagline')}</p>
          <div class="tl-modes">
            <button class="mode-btn story" data-go="story"><b>⚔ ${pt() ? 'Crônicas de Dataia' : 'Chronicles of Dataia'}</b><small>${pt() ? 'Modo história · 60 fases' : 'Story mode · 60 stages'}</small></button>
            <button class="mode-btn academy" data-go="start"><b>🌸 ${pt() ? 'Academia' : 'Academy'}</b><small>${pt() ? 'Festival escolar · 37 questões' : 'School festival · 37 questions'}</small></button>
          </div>
          <div class="tl-sub">
            <button class="chip-btn" data-go="lab">⚗ ${t('playground')}</button>
            <button class="chip-btn" data-go="ach">★ ${t('achievements')}</button>
            <button class="chip-btn" data-go="settings">⚙ ${t('settings')}</button>
            <button class="chip-btn" data-go="credits">♡ ${t('credits')}</button>
            ${window.desktop ? `<button class="chip-btn" data-go="quit">⏻ ${t('quit')}</button>` : ''}
          </div>
        </div>
        <div class="version">v0.3</div>
      </section>`;
    FX.hydrate(app);
    $$('[data-lang]').forEach((b) => b.onclick = () => { save.lang = b.dataset.lang; I18N.lang = save.lang; persist(); GameAudio.play('click'); showTitle(); });
    $$('[data-go]').forEach((b) => b.onclick = () => {
      GameAudio.play('click'); GameAudio.startMusic();
      const go = b.dataset.go;
      if (go === 'start') {
        if (!save.seen.m1_intro) return playScene(MODULES[0], 'intro', () => { save.seen.m1_intro = true; persist(); playScene(MODULES[0], 'lesson', () => { save.seen.m1_lesson = true; persist(); showHub(0); }); });
        return showHub();
      }
      if (go === 'story') return Dataia.showMap();
      if (go === 'lab') return showPlayground();
      if (go === 'ach') return showAchievements();
      if (go === 'settings') return showSettings();
      if (go === 'credits') return showCredits();
      if (go === 'quit') return window.desktop.quit();
    });
  }

  // ─────────────────────────── Mapa (linha de estações) ───────────────────────────
  let hubSel = null;
  function showHub(sel) {
    current = () => showHub(hubSel);
    if (sel === undefined || sel === null) {
      sel = hubSel != null ? hubSel : MODULES.findIndex((m, i) => moduleUnlocked(i) && !moduleDone(m));
      if (sel < 0) sel = MODULES.length - 1;
    }
    hubSel = sel;
    const m = MODULES[sel], c = CH[m.char];
    const doneN = m.challenges.filter((x) => save.done[x.id]).length;
    const nextIdx = m.challenges.findIndex((x) => !save.done[x.id]);
    const unlocked = moduleUnlocked(sel);
    app.innerHTML = `
      <section class="screen hub paper-bg">
        ${header(`<span>${pt() ? 'Mapa do festival' : 'Festival map'}</span>`)}
        <nav class="route">
          <div class="route-line"></div>
          ${MODULES.map((mm, i) => {
            const d = mm.challenges.filter((x) => save.done[x.id]).length, u = moduleUnlocked(i), full = d === mm.challenges.length;
            return `<button class="station ${i === sel ? 'sel' : ''} ${u ? '' : 'locked'} ${full ? 'full' : ''}" data-mod="${i}" style="--c:${CH[mm.char].color}">
              <span class="st-dot">${full ? '✓' : u ? i + 1 : '🔒'}</span>
              <span class="st-name">${esc(L(mm.title))}</span>
              <span class="st-prog">${d}/${mm.challenges.length}</span>
            </button>`;
          }).join('')}
          <button class="station lab" data-lab><span class="st-dot">⚗</span><span class="st-name">${t('playground')}</span><span class="st-prog">∞</span></button>
        </nav>
        <div class="hub-main">
          <figure class="teacher polaroid" style="--c:${c.color}">
            <img src="${Characters.scene(m.char, sceneTime(m))}" alt="${c.name}" draggable="false">
            <figcaption><b>${c.full}</b><small>${esc(L(c.title))}</small><q>${esc(L(c.quote))}</q></figcaption>
          </figure>
          <article class="notebook">
            <div class="nb-head">
              <div>
                <div class="eyebrow" style="color:${c.color}">${t('module')} ${sel + 1} · ${pt() ? 'com' : 'with'} ${c.name}</div>
                <h2>${esc(L(m.title))}</h2>
                <p>${esc(L(m.desc))}</p>
              </div>
              <div class="big-prog" style="--p:${(doneN / m.challenges.length) * 100};--c:${c.color}"><b>${doneN}</b><small>/${m.challenges.length}</small></div>
            </div>
            ${unlocked ? `<div class="row gap">
              <button class="btn primary" data-start>${nextIdx >= 0 ? t('startQuestion', { n: nextIdx + 1 }) : t('review')} →</button>
              <button class="btn soft" data-lesson>📖 ${t('startLesson')}</button>
            </div>` : `<p class="lock-msg">🔒 ${t('locked')}</p>`}
            <ol class="q-list">
              ${m.challenges.map((x, i) => `<li><button class="q-row ${save.done[x.id] ? 'done' : ''} ${x.boss ? 'boss' : ''}" ${unlocked ? '' : 'disabled'} data-q="${i}">
                <span class="q-check">${save.done[x.id] ? '✓' : x.boss ? '★' : i + 1}</span>
                <span class="q-title">${esc(L(x.title))}</span>
                <span class="q-kws">${x.kw.slice(0, 3).map((k) => `<code>${esc(k)}</code>`).join('')}</span>
                <span class="diff ${x.diff}">${t(x.diff)}</span>
              </button></li>`).join('')}
            </ol>
          </article>
        </div>
      </section>`;
    bindHeader(app);
    $$('[data-mod]').forEach((b) => b.onclick = () => { GameAudio.play('click'); hubSel = +b.dataset.mod; showHub(hubSel); });
    $('[data-lab]').onclick = () => { GameAudio.play('click'); showPlayground(); };
    const start = (qi) => {
      const key = m.id + '_intro';
      if (!save.seen[key]) return playScene(m, 'intro', () => { save.seen[key] = true; persist(); playScene(m, 'lesson', () => { save.seen[m.id + '_lesson'] = true; persist(); showChallenge(sel, qi); }); });
      showChallenge(sel, qi);
    };
    if (unlocked) {
      $('[data-start]').onclick = () => { GameAudio.play('click'); start(nextIdx >= 0 ? nextIdx : 0); };
      $('[data-lesson]').onclick = () => { GameAudio.play('click'); playScene(m, 'lesson', () => showHub(sel)); };
      $$('[data-q]').forEach((b) => b.onclick = () => { GameAudio.play('click'); start(+b.dataset.q); });
    }
  }

  // ─────────────────────────── Cenas: foto polaroid + caderno + diálogo ───────────────────────────
  function playScene(m, kind, onDone) {
    current = null;
    const steps = m[kind] || [];
    if (!steps.length) return onDone();
    const isLesson = kind === 'lesson';
    const time = sceneTime(m);
    const firstSpeaker = (steps.find((s) => s.s) || {}).s || m.char;
    app.innerHTML = `
      <section class="screen vn ${isLesson ? 'is-lesson' : ''}">
        <div class="vn-bg" style="background-image:url('${Characters.scene(firstSpeaker, time)}')"></div>
        ${leaves(10)}
        <div class="vn-top">
          <button class="chip-btn dark" data-back>↩ ${t('back')}</button>
          <div class="vn-title">${isLesson ? '📖 ' + t('lesson') + ' · ' : ''}${esc(L(m.title))}</div>
          <div class="row gap">
            <button class="chip-btn dark" data-log>☰ ${t('log')}</button>
            <button class="chip-btn dark" data-auto>▶ ${t('auto')}</button>
            <button class="chip-btn dark" data-skip>${t('skip')} ⏭</button>
          </div>
        </div>
        <figure class="vn-photo polaroid"><img alt=""><figcaption></figcaption><span class="vn-emote"></span></figure>
        ${isLesson ? `<div class="vn-notes"><div class="nb-rings"></div><div class="notes-head">${t('module')} ${MODULES.indexOf(m) + 1} — ${esc(L(m.title))}</div><div class="notes-body"></div></div>` : ''}
        <div class="vn-dialog">
          <div class="vn-who"></div>
          <div class="vn-text"></div>
          <div class="vn-next">${t('clickToContinue')} ▸</div>
        </div>
        <div class="vn-steps">${steps.map(() => '<i></i>').join('')}</div>
      </section>`;
    const photo = $('.vn-photo'), img = $('img', photo), cap = $('figcaption', photo), emo = $('.vn-emote'), bg = $('.vn-bg');
    const who = $('.vn-who'), textEl = $('.vn-text'), notes = $('.notes-body'), dots = $$('.vn-steps i');
    let i = -1, typing = null, full = '', auto = false, autoTimer = null, lastChar = firstSpeaker;
    const log = [];
    const speed = { slow: 45, normal: 24, fast: 10, instant: 0 }[save.settings.speed] ?? 24;
    img.src = Characters.scene(firstSpeaker, time);
    cap.textContent = CH[firstSpeaker].full;
    photo.style.setProperty('--c', CH[firstSpeaker].color);

    function addNote(b) {
      if (!notes || !b) return;
      if (b === 'clear') { notes.innerHTML = ''; return; }
      let h = '';
      if (b.title) h = `<h4>${esc(L(b.title))}</h4>`;
      if (b.code) h = `<pre class="note-code">${highlight(b.code)}</pre>`;
      if (b.note) h = `<p class="note-txt">✎ ${esc(L(b.note))}</p>`;
      if (b.table) h = `<table class="note-table">${b.table.map((r, ri) => `<tr>${r.map((c) => ri ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table>`;
      const div = document.createElement('div'); div.className = 'note-item'; div.innerHTML = h;
      notes.appendChild(div);
      while (notes.scrollHeight > notes.clientHeight && notes.children.length > 1) notes.removeChild(notes.firstChild);
    }

    function setSpeaker(id, expr) {
      if (!id) { photo.classList.add('dim'); emo.innerHTML = ''; return; }
      photo.classList.remove('dim');
      if (lastChar !== id) {
        const src = Characters.scene(id, time);
        photo.classList.remove('swap'); void photo.offsetWidth; photo.classList.add('swap');
        img.src = src; bg.style.backgroundImage = `url('${src}')`;
        cap.textContent = CH[id].full;
        photo.style.setProperty('--c', CH[id].color);
        lastChar = id;
      }
      emo.innerHTML = Characters.emote(expr);
      photo.classList.toggle('shake', expr === 'angry' || expr === 'surprised');
      photo.classList.toggle('hop', expr === 'excited' || expr === 'happy');
    }

    function finishTyping() { if (typing) { clearInterval(typing); typing = null; textEl.textContent = full; } }
    function next() {
      if (typing) return finishTyping();
      i++;
      if (i >= steps.length) { cleanup(); return onDone(); }
      dots.forEach((d, k) => d.classList.toggle('on', k <= i));
      const st = steps[i];
      full = L(st.t);
      log.push([st.s ? CH[st.s].name : '', full]);
      setSpeaker(st.s, st.e);
      if (st.s) { who.textContent = CH[st.s].name; who.style.background = CH[st.s].color; who.hidden = false; }
      else who.hidden = true;
      addNote(st.board);
      textEl.classList.toggle('narration', !st.s);
      if (!speed) { textEl.textContent = full; return scheduleAuto(); }
      let k = 0; textEl.textContent = '';
      typing = setInterval(() => {
        k++; textEl.textContent = full.slice(0, k);
        if (k % 3 === 0) GameAudio.play('blip');
        if (k >= full.length) { clearInterval(typing); typing = null; scheduleAuto(); }
      }, speed);
    }
    function scheduleAuto() { clearTimeout(autoTimer); if (auto) autoTimer = setTimeout(next, 1200 + full.length * 25); }
    function cleanup() { clearInterval(typing); clearTimeout(autoTimer); document.removeEventListener('keydown', onKey); }
    function onKey(e) {
      if (document.querySelector('.modal-wrap')) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(); }
      if (e.key === 'Escape') { cleanup(); onDone(); }
    }
    document.addEventListener('keydown', onKey);
    $('.vn').onclick = (e) => { if (!e.target.closest('button')) next(); };
    $('[data-back]').onclick = () => { cleanup(); showHub(); };
    $('[data-skip]').onclick = () => { GameAudio.play('click'); cleanup(); onDone(); };
    $('[data-auto]').onclick = (e) => { auto = !auto; e.currentTarget.classList.toggle('on', auto); if (auto && !typing) scheduleAuto(); };
    $('[data-log]').onclick = () => {
      modal(`<h2>☰ ${t('log')}</h2><div class="log">${log.map(([n, x]) => `<p>${n ? `<b>${n}</b> ` : ''}${esc(x)}</p>`).join('')}</div><div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
    };
    next();
  }

  // ─────────────────────────── Peças compartilhadas da questão ───────────────────────────
  function schemaHtml() {
    return `<div class="schema">${GameDB.SCHEMA.map((tb) => `
      <div class="tbl-card">
        <div class="tbl-top"><span class="tbl-name">▦ ${tb.table}</span><button class="link" data-sample="${tb.table}">${t('sampleRows')}</button></div>
        <p class="tbl-desc">${esc(L(tb.desc))}</p>
        <table class="cols">${tb.cols.map(([n, ty, d]) => `<tr><td class="cn">${n}</td><td class="ct">${ty}</td><td class="cd">${d ? esc(L(d)) : ''}</td></tr>`).join('')}</table>
        <div class="sample-body"></div>
      </div>`).join('')}</div>`;
  }
  function bindSamples(root) {
    $$('[data-sample]', root).forEach((b) => b.onclick = () => {
      const body = $('.sample-body', b.closest('.tbl-card'));
      body.innerHTML = body.innerHTML ? '' : resultTable(runSql(`SELECT * FROM ${b.dataset.sample} LIMIT 5`));
    });
  }

  function resultTable(r) {
    if (!r.columns.length) return `<p class="muted center pad">${t('noRows')}</p>`;
    const rows = r.values.slice(0, 200);
    return `<div class="res-scroll"><table class="res"><thead><tr><th class="rn">#</th>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row, ri) => `<tr><td class="rn">${ri + 1}</td>${row.map((v) => v === null ? '<td class="null">NULL</td>' : `<td class="${typeof v === 'number' ? 'num' : ''}">${esc(typeof v === 'number' ? Math.round(v * 10000) / 10000 : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="res-count">${t('rows', { n: r.values.length })}</div>`;
  }

  function editorHtml(initial) {
    const lines = Math.max(8, initial.split('\n').length);
    return `<div class="editor"><div class="ed-gutter">${Array.from({ length: 40 }, (_, k) => `<span>${k + 1}</span>`).join('')}</div><div class="ed-area"><pre class="ed-hl" aria-hidden="true">${highlight(initial)}</pre><textarea class="ed-ta" rows="${lines}" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(initial)}</textarea></div></div>`;
  }
  function bindEditor(root, onRun, onSubmit) {
    const ta = $('.ed-ta', root), hl = $('.ed-hl', root), gut = $('.ed-gutter', root);
    const sync = () => { hl.innerHTML = highlight(ta.value); hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop; };
    ta.addEventListener('input', sync);
    ta.addEventListener('scroll', sync);
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); sync(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.shiftKey ? onSubmit && onSubmit() : onRun(); }
    });
    return ta;
  }

  const WRONG = {
    midori: [T2('Quase! Compare seu resultado com o que o problema pede.', 'Almost! Compare your result with what the problem asks.'), T2('Não desanima! Lê o enunciado de novo com calma.', "Don't give up! Read the problem again calmly."), T2('Hmm, não é bem isso. Quer uma dica?', 'Hmm, not quite. Want a hint?')],
    sakura: [T2('Não. Leia o enunciado de novo.', 'No. Read the problem again.'), T2('Incorreto. Confira as colunas e as condições.', 'Incorrect. Check the columns and the conditions.'), T2('...Hm. Perto, mas perto não conta.', '...Hm. Close, but close does not count.')],
  };
  const ERR = {
    midori: T2('Ops! O banco não entendeu. A mensagem de erro diz onde está o problema!', "Oops! The database didn't understand. The error message tells you where the problem is!"),
    sakura: T2('Erro de sintaxe. Leia a mensagem. Ela está tentando te ajudar.', 'Syntax error. Read the message. It is trying to help you.'),
  };

  function confetti() {
    const wrap = document.createElement('div'); wrap.className = 'confetti';
    const colors = ['#f07a9a', '#ffc83d', '#5fbf8f', '#f3a37f', '#9ad0f5'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%'; p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.4 + 's'; p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3200);
  }

  // ─────────────────────────── Questão: chat + editor ───────────────────────────
  function showChallenge(mi, qi) {
    const m = MODULES[mi], c = m.challenges[qi], ch = m.char, who = CH[ch];
    current = () => showChallenge(mi, qi);
    save.last = { mi, qi }; persist();
    let mode = c.guided && !save.done[c.id] ? 'guided' : 'editor';
    let editorText = save.done[c.id] && save.done[c.id].sql ? save.done[c.id].sql : '';
    let slots = [];
    let hintsShown = 0;

    app.innerHTML = `
      <section class="screen quest paper-bg">
        ${header(`<button class="crumb-link" data-act="menu">${t('module')} ${mi + 1}</button> › <span>${esc(L(c.title))}</span>`)}
        <div class="quest-body">
          <aside class="chat" style="--c:${who.color};--soft:${who.soft}">
            <div class="chat-head">
              ${Characters.avatar(ch, null, 'md')}
              <div><b>${who.full}</b><small><i class="online"></i> ${esc(L(who.title))}</small></div>
            </div>
            <div class="chat-log"></div>
            <div class="chat-actions">
              <button class="chip-btn" data-hint>💡 ${t('hint')} <small>${c.hints.length}</small></button>
              <button class="chip-btn" data-lesson>📖 ${t('lesson')}</button>
              <button class="chip-btn" data-tables>▦ ${t('tables')}</button>
            </div>
          </aside>
          <main class="work">
            <div class="q-dots">
              ${m.challenges.map((x, i) => `<button class="qd ${i === qi ? 'cur' : ''} ${save.done[x.id] ? 'done' : ''} ${x.boss ? 'boss' : ''}" data-goto="${i}" title="${esc(L(x.title))}">${x.boss ? '★' : i + 1}</button>`).join('')}
              <span class="spacer"></span>
              <span class="diff ${c.diff}">${t(c.diff)}</span>${c.boss ? `<span class="diff boss">${t('boss')}</span>` : ''}
            </div>
            <div class="card editor-card">
              <div class="card-tabs"><span class="file-tab">● query.sql</span><span class="spacer"></span><span class="muted small">${t('shortcuts')}</span></div>
              <div class="query-box"></div>
            </div>
            <div class="row gap actions">
              <button class="btn run" data-run>▶ ${t('run')}</button>
              <button class="btn primary" data-submit>✓ ${t('submit')}</button>
              <span class="feedback"></span>
            </div>
            <div class="card results">
              <div class="card-tabs">
                <button class="tab on" data-rtab="mine">${t('results')}</button>
                <button class="tab" data-rtab="exp" hidden>${t('expected')}</button>
                <button class="tab" data-rtab="schema">${t('tables')}</button>
              </div>
              <div class="res-pane" data-rpane="mine"><p class="muted center pad">${t('runToSee')}</p></div>
              <div class="res-pane" data-rpane="exp" hidden></div>
              <div class="res-pane" data-rpane="schema" hidden>${schemaHtml()}</div>
            </div>
          </main>
        </div>
      </section>`;
    bindHeader(app);
    bindSamples(app);
    const qbox = $('.query-box'), feedback = $('.feedback'), chatLog = $('.chat-log');

    // Mensagem no chat da professora (ou do jogador).
    function say(html, expr, from) {
      const mine = from === 'me';
      const div = document.createElement('div');
      div.className = 'msg ' + (mine ? 'me' : 'her');
      div.innerHTML = mine ? `<div class="bubble">${html}</div>` : `${Characters.avatar(ch, expr, 'sm')}<div class="bubble">${html}</div>`;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
      const headAv = $('.chat-head .avatar');
      headAv.outerHTML = Characters.avatar(ch, expr, 'md');
      return div;
    }
    function typingThen(fn) {
      const tdiv = document.createElement('div'); tdiv.className = 'msg her typing';
      tdiv.innerHTML = `${Characters.avatar(ch, null, 'sm')}<div class="bubble"><i></i><i></i><i></i></div>`;
      chatLog.appendChild(tdiv); chatLog.scrollTop = chatLog.scrollHeight;
      setTimeout(() => { tdiv.remove(); fn(); }, 450);
    }

    // Briefing inicial
    say(`<div class="brief-tags">${c.kw.map((k) => `<code class="kw">${esc(k)}</code>`).join('')}</div><b class="brief-title">${esc(L(c.title))}</b><span class="brief-note">${esc(L(c.note))}</span>`, null);
    say(md(L(c.text)), qi === 0 && !save.done[c.id] ? 'happy' : null);
    if (save.done[c.id]) say(pt() ? 'Você já resolveu essa! Quer tentar de outro jeito?' : 'You already solved this one! Want to try another way?', 'happy');

    $$('[data-goto]').forEach((b) => b.onclick = () => { GameAudio.play('click'); showChallenge(mi, +b.dataset.goto); });
    $$('[data-rtab]').forEach((b) => b.onclick = () => openTab(b.dataset.rtab));
    function openTab(name) {
      $$('[data-rtab]').forEach((x) => x.classList.toggle('on', x.dataset.rtab === name));
      $$('[data-rpane]').forEach((p) => p.hidden = p.dataset.rpane !== name);
    }
    $('[data-tables]').onclick = () => { GameAudio.play('click'); openTab('schema'); };

    function currentQuery() {
      if (mode === 'guided') {
        const parts = c.guided.template.split('[]');
        if (slots.some((s) => s == null)) return null;
        return parts.map((p, i) => p + (i < slots.length ? c.guided.pieces[slots[i]] : '')).join('');
      }
      return $('.ed-ta') ? $('.ed-ta').value : '';
    }

    function renderQueryBox() {
      if (mode === 'guided') {
        const parts = c.guided.template.split('[]');
        if (slots.length !== parts.length - 1) slots = new Array(parts.length - 1).fill(null);
        const used = new Set(slots.filter((s) => s != null));
        let html = '';
        parts.forEach((p, i) => {
          html += highlight(p).replace(/\n$/, '');
          if (i < slots.length) html += slots[i] == null ? `<span class="slot" data-slot="${i}">?</span>` : `<span class="slot filled" data-slot="${i}">${esc(c.guided.pieces[slots[i]])}</span>`;
        });
        qbox.innerHTML = `
          <div class="guided">
            <pre class="g-query">${html}</pre>
            <div class="g-tray">
              <span class="g-label">🧩 ${t('guidedHelp')}</span>
              <div class="g-pieces">${c.guided.pieces.map((p, i) => `<button class="piece ${used.has(i) ? 'used' : ''}" draggable="true" data-piece="${i}" ${used.has(i) ? 'disabled' : ''}>${esc(p)}</button>`).join('')}</div>
              <button class="link" data-type>⌨ ${t('typeInstead')}</button>
            </div>
          </div>`;
        $$('[data-piece]', qbox).forEach((b) => {
          b.onclick = () => { const k = slots.indexOf(null); if (k >= 0) { slots[k] = +b.dataset.piece; GameAudio.play('click'); renderQueryBox(); } };
          b.ondragstart = (e) => e.dataTransfer.setData('text/plain', b.dataset.piece);
        });
        $$('[data-slot]', qbox).forEach((s) => {
          s.onclick = () => { slots[+s.dataset.slot] = null; GameAudio.play('click'); renderQueryBox(); };
          s.ondragover = (e) => { e.preventDefault(); s.classList.add('over'); };
          s.ondragleave = () => s.classList.remove('over');
          s.ondrop = (e) => {
            e.preventDefault(); const p = +e.dataTransfer.getData('text/plain');
            const prev = slots.indexOf(p); if (prev >= 0) slots[prev] = null;
            slots[+s.dataset.slot] = p; GameAudio.play('click'); renderQueryBox();
          };
        });
        $('[data-type]', qbox).onclick = () => {
          editorText = parts.map((p, i) => p + (i < slots.length ? (slots[i] != null ? c.guided.pieces[slots[i]] : '___') : '')).join('');
          mode = 'editor'; renderQueryBox();
        };
      } else {
        qbox.innerHTML = `${editorHtml(editorText)}${c.guided ? `<div class="ed-foot"><button class="link" data-blocks>🧩 ${t('useBlocks')}</button></div>` : ''}`;
        const ta = bindEditor(qbox, doRun, doSubmit);
        ta.addEventListener('input', () => { editorText = ta.value; });
        if (c.guided) $('[data-blocks]', qbox).onclick = () => { mode = 'guided'; renderQueryBox(); };
        setTimeout(() => ta.focus(), 30);
      }
    }

    function showResult(r) {
      openTab('mine');
      $('[data-rpane="mine"]').innerHTML = r.ok ? resultTable(r) : `<div class="sql-error"><b>⚠ ${t('sqlError')}</b><pre>${esc(r.error)}</pre></div>`;
    }

    function getQueryOrWarn() {
      const q = currentQuery();
      if (q == null) { feedback.className = 'feedback warn'; feedback.textContent = t('fillBlanks'); GameAudio.play('error'); return null; }
      if (!q.trim()) { feedback.className = 'feedback warn'; feedback.textContent = t('emptyQuery'); GameAudio.play('error'); return null; }
      return q;
    }

    function doRun() {
      const q = getQueryOrWarn(); if (!q) return;
      const r = runSql(q);
      showResult(r);
      unlock('first_query');
      feedback.textContent = ''; feedback.className = 'feedback';
      if (!r.ok) { unlock('sql_error'); GameAudio.play('error'); typingThen(() => say(esc(L(ERR[ch])), 'sad')); }
      else GameAudio.play('click');
    }

    function doSubmit() {
      const q = getQueryOrWarn(); if (!q) return;
      const r = runSql(q);
      showResult(r);
      unlock('first_query');
      say(`<pre class="mini-sql">${highlight(q.trim()).replace(/\n$/, '')}</pre>`, null, 'me');
      if (!r.ok) { unlock('sql_error'); GameAudio.play('error'); feedback.className = 'feedback bad'; feedback.textContent = t('sqlError'); typingThen(() => say(esc(L(ERR[ch])), 'sad')); return; }
      const res = check(c, r);
      if (!res.ok) {
        GameAudio.play('error');
        feedback.className = 'feedback bad'; feedback.textContent = '✗ ' + res.msg;
        const pool = WRONG[ch];
        typingThen(() => say(`${esc(L(pool[Math.floor(Math.random() * pool.length)]))}<small class="why">${esc(res.msg)}</small>`, ch === 'sakura' ? 'angry' : 'thinking'));
        $('.work').classList.remove('shake'); void $('.work').offsetWidth; $('.work').classList.add('shake');
        return;
      }
      const first = !save.done[c.id];
      const hintsUsed = save.hintsUsed[c.id] || 0;
      if (first) {
        let g = c.boss ? 30 : 10; if (!hintsUsed) g += 5;
        save.gems += g;
        save.done[c.id] = { ts: Date.now(), sql: q, hints: hintsUsed };
        persist();
        $('.pill.gem b').textContent = save.gems;
        $(`[data-goto="${qi}"]`).classList.add('done');
        unlock('first_correct');
        if (c.boss && !hintsUsed) unlock('no_hints');
      } else { save.done[c.id].sql = q; persist(); }
      GameAudio.play('success');
      feedback.className = 'feedback good'; feedback.textContent = '✓ ' + t('correct');
      typingThen(() => say(`${esc(L(c.react))}${first ? `<small class="reward">+◆ ${c.boss ? 30 : 10}${!hintsUsed ? ' +5' : ''}</small>` : ''}`, c.boss ? 'excited' : 'happy'));
      confetti();
      const isLast = qi === m.challenges.length - 1;
      const modJustDone = moduleDone(m) && first;
      const actions = $('.actions');
      const old = $('[data-next]', actions); if (old) old.remove();
      const nb = document.createElement('button');
      nb.className = 'btn next glow'; nb.dataset.next = '1';
      nb.textContent = (isLast ? t('finishModule') : t('next')) + ' →';
      actions.insertBefore(nb, feedback);
      nb.onclick = () => {
        GameAudio.play('click');
        if (modJustDone || (isLast && moduleDone(m))) {
          unlock(m.id);
          const key = m.id + '_outro';
          const after = () => { hubSel = Math.min(mi + 1, MODULES.length - 1); showHub(hubSel); };
          if (!save.seen[key]) return playScene(m, 'outro', () => { save.seen[key] = true; persist(); after(); });
          return after();
        }
        const nextQ = m.challenges.findIndex((x, i) => i > qi && !save.done[x.id]);
        if (nextQ >= 0) return showChallenge(mi, nextQ);
        if (!isLast) return showChallenge(mi, qi + 1);
        showHub(mi);
      };
    }

    $('[data-run]').onclick = doRun;
    $('[data-submit]').onclick = doSubmit;
    $('[data-lesson]').onclick = () => { GameAudio.play('click'); playScene(m, 'lesson', () => showChallenge(mi, qi)); };
    $('[data-hint]').onclick = () => {
      GameAudio.play('hint');
      say(esc(pt() ? 'Me dá uma dica?' : 'Can I get a hint?'), null, 'me');
      if (hintsShown < c.hints.length) {
        hintsShown++;
        save.hintsUsed[c.id] = Math.max(save.hintsUsed[c.id] || 0, hintsShown); persist();
        const n = hintsShown;
        $('[data-hint] small').textContent = c.hints.length - n;
        typingThen(() => say(`<small class="hint-tag">💡 ${t('hintN', { n, total: c.hints.length })}</small>${md(L(c.hints[n - 1]))}`, 'thinking'));
      } else {
        typingThen(() => {
          const div = say(`${esc(t('noMoreHints'))}<br><button class="btn soft sm" data-answer>${t('showAnswer')}</button>`, 'thinking');
          $('[data-answer]', div).onclick = () => {
            mode = 'editor'; editorText = c.solution; renderQueryBox();
            const exp = runSql(c.solution);
            $('[data-rtab="exp"]').hidden = false; $('[data-rpane="exp"]').innerHTML = resultTable(exp); openTab('exp');
          };
        });
      }
    };

    renderQueryBox();
  }

  // ─────────────────────────── Laboratório livre ───────────────────────────
  function showPlayground() {
    current = showPlayground;
    app.innerHTML = `
      <section class="screen quest paper-bg">
        ${header(`<span>⚗ ${t('playground')}</span>`)}
        <div class="quest-body">
          <aside class="chat" style="--c:${CH.sakura.color};--soft:${CH.sakura.soft}">
            <div class="chat-head">${Characters.avatar('sakura', null, 'md')}<div><b>${CH.sakura.full}</b><small><i class="online"></i> ${t('playground')}</small></div></div>
            <div class="chat-log">
              <div class="msg her">${Characters.avatar('sakura', 'happy', 'sm')}<div class="bubble">${esc(t('playgroundDesc'))}</div></div>
              <div class="msg her">${Characters.avatar('sakura', null, 'sm')}<div class="bubble">${pt() ? 'O banco é recriado a cada execução, então pode testar à vontade. Até DELETE.' : 'The database is rebuilt on every run, so experiment freely. Even DELETE.'}</div></div>
            </div>
          </aside>
          <main class="work">
            <div class="card editor-card"><div class="card-tabs"><span class="file-tab">● lab.sql</span></div><div class="query-box">${editorHtml('SELECT name, price\nFROM stalls\nORDER BY price DESC;')}</div></div>
            <div class="row gap actions"><button class="btn primary" data-run>▶ ${t('run')}</button><span class="muted small">Ctrl+Enter</span></div>
            <div class="card results">
              <div class="card-tabs"><button class="tab on" data-rtab="mine">${t('results')}</button><button class="tab" data-rtab="schema">${t('tables')}</button></div>
              <div class="res-pane" data-rpane="mine"><p class="muted center pad">${t('runToSee')}</p></div>
              <div class="res-pane" data-rpane="schema" hidden>${schemaHtml()}</div>
            </div>
          </main>
        </div>
      </section>`;
    bindHeader(app); bindSamples(app);
    $$('[data-rtab]').forEach((b) => b.onclick = () => {
      $$('[data-rtab]').forEach((x) => x.classList.toggle('on', x === b));
      $$('[data-rpane]').forEach((p) => p.hidden = p.dataset.rpane !== b.dataset.rtab);
    });
    const run = () => {
      const r = runSql($('.ed-ta').value);
      $('[data-rtab="mine"]').click();
      $('[data-rpane="mine"]').innerHTML = r.ok ? resultTable(r) : `<div class="sql-error"><b>⚠ ${t('sqlError')}</b><pre>${esc(r.error)}</pre></div>`;
      GameAudio.play(r.ok ? 'click' : 'error');
      unlock('playground');
    };
    bindEditor(app, run, run);
    $('[data-run]').onclick = run;
  }

  // ─────────────────────────── Início ───────────────────────────
  // Pré-carrega as ilustrações para as trocas de cena não piscarem.
  Object.values(CH).forEach((c) => [c.portrait, ...Object.values(c.scenes)].forEach((src) => { const im = new Image(); im.src = src; }));

  initSqlJs().then((S) => {
    SQL = S;
    const db = new SQL.Database();
    db.exec(GameDB.SEED_SQL);
    seedBytes = db.export();
    db.close();
    if (save.settings.fullscreen) setFullscreen(true);
    document.addEventListener('pointerdown', () => GameAudio.startMusic(), { once: true });
    GameAudio.setMusic(save.settings.music);
    showTitle();
  }).catch((e) => {
    app.innerHTML = `<pre style="padding:24px">Falha ao iniciar o SQLite / Failed to start SQLite:\n${esc(e && e.message || e)}</pre>`;
  });

  window.__game = { runSql, check, get save() { return save; } };

  // Peças compartilhadas com o modo história (dataia.js).
  window.Core = {
    t, L, esc, md, $, $$, highlight, leaves, toast, unlock, header, bindHeader, modal, showTitle, showAchievements,
    showSettings, editorHtml, bindEditor, resultTable, confetti, runOn, makeDb, compare,
    get save() { return save; }, persist, setCurrent(fn) { current = fn; },
  };
})();
