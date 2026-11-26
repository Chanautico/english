// Sakura Query — motor do jogo (telas, progresso, verificação de respostas).
(function () {
  const { t, L } = { t: (k, v) => I18N.t(k, v), L: (o) => I18N.L(o) };
  const { MODULES, ACHIEVEMENTS } = Content;
  const app = document.getElementById('app');
  const SAVE_KEY = 'sakuraquery.save.v1';

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
  } catch (e) { /* save corrompido: começa do zero */ }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignora */ } }
  I18N.lang = save.lang;
  GameAudio.setSfx(save.settings.sfx);
  GameAudio.setMusic(false);

  // ─────────────────────────── SQL ───────────────────────────
  let SQL = null, seedBytes = null;
  function freshDb() { return new SQL.Database(seedBytes); }
  function runSql(query) {
    const db = freshDb();
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

  function check(challenge, got) {
    const exp = runSql(challenge.solution);
    if (got.columns.length !== exp.columns.length) return { ok: false, msg: t('wrongCols', { e: exp.columns.length, g: got.columns.length }), exp };
    if (got.values.length !== exp.values.length) return { ok: false, msg: t('wrongCount', { e: exp.values.length, g: got.values.length }), exp };
    const g = got.values.map(rowKey), e = exp.values.map(rowKey);
    const gs = [...g].sort(), es = [...e].sort();
    const sameSet = gs.every((x, i) => x === es[i]);
    if (!sameSet) return { ok: false, msg: t('wrongValues'), exp };
    if (challenge.ordered && !g.every((x, i) => x === e[i])) return { ok: false, msg: t('wrongOrder'), exp };
    return { ok: true, exp };
  }

  // ─────────────────────────── Utilidades ───────────────────────────
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const allChallenges = () => MODULES.flatMap((m) => m.challenges.map((c) => ({ ...c, module: m })));
  const moduleDone = (m) => m.challenges.every((c) => save.done[c.id]);
  const moduleUnlocked = (i) => i === 0 || moduleDone(MODULES[i - 1]);
  const totalDone = () => allChallenges().filter((c) => save.done[c.id]).length;

  const KW = /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|ASC|DESC|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|WITH|OVER|PARTITION|UNION|ALL|EXISTS|COUNT|SUM|AVG|MIN|MAX|ROUND|RANK|ROW_NUMBER|DENSE_RANK|COALESCE|CAST|INSERT|UPDATE|DELETE|CREATE|TABLE|VALUES|INTO|SET|LOWER|UPPER|LENGTH|SUBSTR|STRFTIME|DATE|IFNULL)\b/gi;
  function highlight(sqlText) {
    let out = '';
    const re = /(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)|([\s\S])/g;
    let m;
    while ((m = re.exec(sqlText))) {
      if (m[1]) out += `<span class="hl-com">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="hl-str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="hl-num">${m[3]}</span>`;
      else if (m[4]) out += KW.test(m[4]) ? `<span class="hl-kw">${esc(m[4])}</span>` : esc(m[4]);
      else out += esc(m[5]);
      KW.lastIndex = 0;
    }
    return out + '\n';
  }

  function charHtml(id, expr, extraClass) {
    return `<div class="character ${extraClass || ''}" data-id="${id}">${Characters.draw(id, expr)}</div>`;
  }
  function setExpr(el, id, expr) { if (el) el.innerHTML = Characters.draw(id, expr); }

  function petals(n) {
    let h = '<div class="petals" aria-hidden="true">';
    for (let i = 0; i < n; i++) {
      const left = Math.random() * 100, dur = 8 + Math.random() * 10, delay = -Math.random() * 18, size = 8 + Math.random() * 10;
      h += `<i style="left:${left}%;animation-duration:${dur}s;animation-delay:${delay}s;width:${size}px;height:${size * 0.8}px"></i>`;
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

  function topbar(extra) {
    return `<header class="topbar">
      <button class="logo-sm" data-act="menu">Sakura <span>Query</span></button>
      <div class="topbar-mid">${extra || ''}</div>
      <div class="topbar-right">
        <span class="gems" title="${t('gems')}">◆ ${save.gems}</span>
        <button class="btn ghost sm" data-act="settings">⚙ ${t('settings')}</button>
      </div>
    </header>`;
  }
  function bindTopbar(root) {
    $$('[data-act="menu"]', root).forEach((b) => b.onclick = () => { GameAudio.play('click'); showHub(); });
    $$('[data-act="settings"]', root).forEach((b) => b.onclick = () => { GameAudio.play('click'); showSettings(); });
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
      <h2>${t('settings')}</h2>
      <div class="set-row"><span>${t('language')}</span>${seg('lang', [['pt', 'Português'], ['en', 'English']], save.lang)}</div>
      <div class="set-row"><span>${t('sound')}</span>${seg('sfx', [[true, t('on')], [false, t('off')]], s.sfx)}</div>
      <div class="set-row"><span>${t('music')}</span>${seg('music', [[true, t('on')], [false, t('off')]], s.music)}</div>
      <div class="set-row"><span>${t('textSpeed')}</span>${seg('speed', [['slow', t('slow')], ['normal', t('normal')], ['fast', t('fast')], ['instant', t('instant')]], s.speed)}</div>
      <div class="set-row"><span>${t('fullscreen')}</span>${seg('fullscreen', [[true, t('on')], [false, t('off')]], s.fullscreen)}</div>
      <p class="muted small">${t('saved')} ${t('shortcuts')}</p>
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
    modal(`<h2>${t('achievements')} <small class="muted">${got}/${ACHIEVEMENTS.length}</small></h2>
      <div class="ach-grid">${ACHIEVEMENTS.map((a) => `<div class="ach-card ${save.ach[a.id] ? 'got' : ''}"><span class="ach-icon">${a.icon}</span><div><b>${esc(L(a.name))}</b><small>${esc(L(a.desc))}</small></div></div>`).join('')}</div>
      <div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
  }

  function showCredits() {
    modal(`<h2>${t('credits')}</h2>
      <p><b>Sakura Query</b> — ${t('tagline')}</p>
      <p class="muted small">Engine: Electron + SQLite (sql.js, MIT). ${I18N.lang === 'pt' ? 'Personagens, história e banco de dados originais.' : 'Original characters, story and database.'}</p>
      <div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
  }

  // ─────────────────────────── Tela título ───────────────────────────
  let current = null;
  function rerender() { if (current) current(); }

  function showTitle() {
    current = showTitle;
    const started = totalDone() > 0 || Object.keys(save.seen).length > 0;
    app.innerHTML = `
      <section class="screen title-screen bg-hallway">
        ${petals(24)}
        <div class="title-chars">${charHtml('rei', 'neutral', 'ch-rei')}${charHtml('hana', 'happy', 'ch-hana')}</div>
        <div class="title-logo">
          <h1>Sakura<span>Query</span></h1>
          <p>${t('tagline')}</p>
        </div>
        <div class="title-lang">
          <button class="${save.lang === 'pt' ? 'on' : ''}" data-lang="pt">PT-BR</button><button class="${save.lang === 'en' ? 'on' : ''}" data-lang="en">EN</button>
        </div>
        <div class="title-line"><b>Hana</b> ${I18N.lang === 'pt' ? 'Ei, você aí! Quer salvar o festival com SQL? Vem!' : 'Hey, you! Want to save the festival with SQL? Come on!'}</div>
        <nav class="title-menu">
          <button class="btn primary lg" data-go="start">${started ? t('continue') : t('start')}</button>
          <button class="btn ghost" data-go="lab">⚗ ${t('playground')}</button>
          <button class="btn ghost" data-go="ach">★ ${t('achievements')}</button>
          <button class="btn ghost" data-go="settings">⚙ ${t('settings')}</button>
          <button class="btn ghost" data-go="credits">${t('credits')}</button>
          ${window.desktop ? `<button class="btn ghost" data-go="quit">${t('quit')}</button>` : ''}
        </nav>
        <div class="version">v0.1</div>
      </section>`;
    $$('[data-lang]').forEach((b) => b.onclick = () => { save.lang = b.dataset.lang; I18N.lang = save.lang; persist(); GameAudio.play('click'); showTitle(); });
    $$('[data-go]').forEach((b) => b.onclick = () => {
      GameAudio.play('click'); GameAudio.startMusic();
      const go = b.dataset.go;
      if (go === 'start') {
        if (!save.seen.m1_intro) return playScene(MODULES[0], 'intro', () => { save.seen.m1_intro = true; persist(); playScene(MODULES[0], 'lesson', () => { save.seen.m1_lesson = true; persist(); showHub(0); }); });
        return showHub();
      }
      if (go === 'lab') return showPlayground();
      if (go === 'ach') return showAchievements();
      if (go === 'settings') return showSettings();
      if (go === 'credits') return showCredits();
      if (go === 'quit') return window.desktop.quit();
    });
  }

  // ─────────────────────────── Hub (mapa de módulos) ───────────────────────────
  let hubSel = null;
  function showHub(sel) {
    current = () => showHub(hubSel);
    if (sel === undefined || sel === null) {
      sel = hubSel != null ? hubSel : MODULES.findIndex((m, i) => moduleUnlocked(i) && !moduleDone(m));
      if (sel < 0) sel = MODULES.length - 1;
    }
    hubSel = sel;
    const m = MODULES[sel];
    const doneN = m.challenges.filter((c) => save.done[c.id]).length;
    const nextIdx = m.challenges.findIndex((c) => !save.done[c.id]);
    const unlocked = moduleUnlocked(sel);
    app.innerHTML = `
      <section class="screen hub bg-room">
        ${petals(10)}
        ${topbar(`<span class="muted">${t('questionsDone', { n: totalDone(), total: allChallenges().length })}</span>`)}
        <div class="hub-body">
          <aside class="mod-list">
            ${MODULES.map((mm, i) => {
              const d = mm.challenges.filter((c) => save.done[c.id]).length, u = moduleUnlocked(i);
              return `<button class="mod-item ${i === sel ? 'sel' : ''} ${u ? '' : 'locked'}" data-mod="${i}">
                <span class="mod-num">${i + 1}</span>
                <span class="mod-txt"><b>${esc(L(mm.title))}</b><small>${u ? `${d}/${mm.challenges.length}` : '🔒'}</small></span>
                <span class="mod-bar"><i style="width:${(d / mm.challenges.length) * 100}%"></i></span>
              </button>`;
            }).join('')}
            <button class="mod-item lab" data-lab><span class="mod-num">⚗</span><span class="mod-txt"><b>${t('playground')}</b><small>${t('playgroundDesc')}</small></span></button>
          </aside>
          <div class="mod-panel glass">
            <div class="mod-info">
              <div class="eyebrow">${t('module')} ${sel + 1} · ${m.challenges.length} ${I18N.lang === 'pt' ? 'questões' : 'questions'}</div>
              <h2>${esc(L(m.title))}</h2>
              <p>${esc(L(m.desc))}</p>
              <p class="muted"><b>${doneN}</b> ${t('of')} ${m.challenges.length} ${t('complete')}</p>
              ${unlocked ? `<div class="row gap">
                <button class="btn primary" data-start>${nextIdx >= 0 ? t('startQuestion', { n: nextIdx + 1 }) : t('review')}</button>
                <button class="btn ghost" data-lesson>📖 ${t('startLesson')}</button>
              </div>` : `<p class="lock-msg">🔒 ${t('locked')}</p>`}
              <div class="q-grid">
                ${m.challenges.map((c, i) => `<button class="q-tile ${save.done[c.id] ? 'done' : ''} ${c.boss ? 'boss' : ''}" ${unlocked ? '' : 'disabled'} data-q="${i}" title="${esc(L(c.title))}">
                  ${c.boss ? '★' : i + 1}<small>${esc(L(c.title))}</small></button>`).join('')}
              </div>
            </div>
            <div class="mod-char">
              <div class="name-card"><b>${Characters.CH[m.char].name}</b><small>${esc(L(Characters.CH[m.char].title))}</small></div>
              ${charHtml(m.char, unlocked ? 'happy' : 'sad', 'bob')}
            </div>
          </div>
        </div>
      </section>`;
    bindTopbar(app);
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

  // ─────────────────────────── Cenas (visual novel + lousa) ───────────────────────────
  function playScene(m, kind, onDone) {
    current = null;
    const steps = m[kind] || [];
    if (!steps.length) return onDone();
    const isLesson = kind === 'lesson';
    const bg = m.char === 'rei' && kind !== 'outro' ? 'bg-library' : 'bg-classroom';
    app.innerHTML = `
      <section class="screen scene ${bg} ${isLesson ? 'is-lesson' : ''}">
        ${petals(8)}
        <div class="scene-top">
          <button class="btn ghost sm" data-back>↩ ${t('back')}</button>
          <div class="row gap">
            <button class="btn ghost sm" data-log>☰ ${t('log')}</button>
            <button class="btn ghost sm" data-auto>${t('auto')}</button>
            <button class="btn ghost sm" data-skip>${t('skip')} ⏭</button>
          </div>
        </div>
        ${isLesson ? `<div class="chalkboard"><div class="cb-head"><small>${t('module')} ${MODULES.indexOf(m) + 1} · ${t('lesson')}</small><h3>${esc(L(m.title))}</h3></div><div class="cb-body"></div><div class="cb-tray"><i></i><i></i><i></i></div></div>` : ''}
        <div class="scene-char"></div>
        <div class="dialog">
          <div class="dialog-name"></div>
          <div class="dialog-text"></div>
          <div class="dialog-next">▼ <small>${t('clickToContinue')}</small></div>
        </div>
      </section>`;
    const charBox = $('.scene-char'), nameEl = $('.dialog-name'), textEl = $('.dialog-text'), board = $('.cb-body');
    let i = -1, typing = null, full = '', auto = false, autoTimer = null, lastChar = null;
    const log = [];
    const speed = { slow: 45, normal: 24, fast: 10, instant: 0 }[save.settings.speed] || 24;

    function addBoard(b) {
      if (!board || !b) return;
      if (b === 'clear') { board.innerHTML = ''; return; }
      let h = '';
      if (b.title) h = `<h4>${esc(L(b.title))}</h4>`;
      if (b.code) h = `<pre class="cb-code">${highlight(b.code)}</pre>`;
      if (b.note) h = `<p class="cb-note">${esc(L(b.note))}</p>`;
      if (b.table) h = `<table class="cb-table">${b.table.map((r, ri) => `<tr>${r.map((c) => ri ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table>`;
      const div = document.createElement('div'); div.className = 'cb-item'; div.innerHTML = h;
      board.appendChild(div);
      while (board.scrollHeight > board.clientHeight && board.children.length > 1) board.removeChild(board.firstChild);
    }

    function finishTyping() { if (typing) { clearInterval(typing); typing = null; textEl.textContent = full; } }
    function next() {
      if (typing) return finishTyping();
      i++;
      if (i >= steps.length) { cleanup(); return onDone(); }
      const st = steps[i];
      full = L(st.t);
      log.push([st.s ? Characters.CH[st.s].name : '', full]);
      if (st.s) {
        if (lastChar !== st.s) { charBox.innerHTML = charHtml(st.s, st.e, 'enter'); lastChar = st.s; }
        else setExpr($('.character', charBox), st.s, st.e);
        charBox.style.display = '';
        nameEl.textContent = Characters.CH[st.s].name; nameEl.style.background = Characters.CH[st.s].color; nameEl.style.display = '';
      } else {
        nameEl.style.display = 'none';
        if (!isLesson) { charBox.innerHTML = ''; lastChar = null; }
      }
      addBoard(st.board);
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
    $('.dialog').onclick = next;
    if (board) $('.chalkboard').onclick = next;
    charBox.onclick = next;
    $('[data-back]').onclick = (e) => { e.stopPropagation(); cleanup(); showHub(); };
    $('[data-skip]').onclick = (e) => { e.stopPropagation(); GameAudio.play('click'); cleanup(); onDone(); };
    $('[data-auto]').onclick = (e) => { e.stopPropagation(); auto = !auto; e.target.classList.toggle('on', auto); if (auto && !typing) scheduleAuto(); };
    $('[data-log]').onclick = (e) => {
      e.stopPropagation();
      modal(`<h2>${t('log')}</h2><div class="log">${log.map(([n, x]) => `<p>${n ? `<b>${n}</b> ` : ''}${esc(x)}</p>`).join('')}</div><div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
    };
    next();
  }

  // ─────────────────────────── Questão ───────────────────────────
  function schemaHtml() {
    return `<div class="schema">${GameDB.SCHEMA.map((tb) => `
      <details class="tbl" open>
        <summary><span class="tbl-name">${tb.table}</span></summary>
        <p class="tbl-desc">${esc(L(tb.desc))}</p>
        <table class="cols">${tb.cols.map(([n, ty, d]) => `<tr><td class="cn">${n}</td><td class="ct">${ty}</td><td class="cd">${d ? esc(L(d)) : ''}</td></tr>`).join('')}</table>
        <details class="sample"><summary>${t('sampleRows')}</summary><div class="sample-body" data-sample="${tb.table}"></div></details>
      </details>`).join('')}</div>`;
  }
  function bindSamples(root) {
    $$('.sample', root).forEach((d) => d.addEventListener('toggle', () => {
      const body = $('.sample-body', d);
      if (d.open && !body.innerHTML) body.innerHTML = resultTable(runSql(`SELECT * FROM ${body.dataset.sample} LIMIT 5`));
    }));
  }

  function resultTable(r) {
    if (!r.columns.length) return `<p class="muted center">${t('noRows')}</p>`;
    const rows = r.values.slice(0, 200);
    return `<div class="res-scroll"><table class="res"><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((v) => v === null ? '<td class="null">NULL</td>' : `<td class="${typeof v === 'number' ? 'num' : ''}">${esc(typeof v === 'number' ? Math.round(v * 10000) / 10000 : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="res-count">${t('rows', { n: r.values.length })}</div>`;
  }

  // Editor com destaque de sintaxe (textarea transparente sobre um <pre>).
  function editorHtml(initial) {
    return `<div class="editor"><pre class="ed-hl" aria-hidden="true">${highlight(initial)}</pre><textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(initial)}</textarea></div>`;
  }
  function bindEditor(root, onRun, onSubmit) {
    const ta = $('.ed-ta', root), hl = $('.ed-hl', root);
    const sync = () => { hl.innerHTML = highlight(ta.value); hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; };
    ta.addEventListener('input', sync);
    ta.addEventListener('scroll', sync);
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); sync(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.shiftKey ? onSubmit && onSubmit() : onRun(); }
    });
    return ta;
  }

  const WRONG = {
    hana: [T2('Quase! Compare seu resultado com o que o problema pede.', 'Almost! Compare your result with what the problem asks.'), T2('Não desanima! Lê o enunciado de novo com calma.', "Don't give up! Read the problem again calmly."), T2('Hmm, não é bem isso. Quer uma dica?', 'Hmm, not quite. Want a hint?')],
    rei: [T2('Não. Leia o enunciado de novo.', 'No. Read the problem again.'), T2('Incorreto. Confira as colunas e as condições.', 'Incorrect. Check the columns and the conditions.'), T2('...Hm. Perto, mas perto não conta.', '...Hm. Close, but close does not count.')],
  };
  const ERR = {
    hana: T2('Ops! O banco não entendeu. A mensagem de erro diz onde está o problema!', "Oops! The database didn't understand. The error message tells you where the problem is!"),
    rei: T2('Erro de sintaxe. Leia a mensagem. Ela está tentando te ajudar.', 'Syntax error. Read the message. It is trying to help you.'),
  };
  function T2(pt, en) { return { pt, en }; }

  function showChallenge(mi, qi) {
    const m = MODULES[mi], c = m.challenges[qi], ch = m.char;
    current = () => showChallenge(mi, qi);
    save.last = { mi, qi }; persist();
    let mode = c.guided && !save.done[c.id] ? 'guided' : 'editor';
    let editorText = save.done[c.id] && save.done[c.id].sql ? save.done[c.id].sql : '';
    let slots = [];
    let hintsShown = 0, bubbleTimer = null;

    app.innerHTML = `
      <section class="screen challenge">
        ${topbar(`<span>${t('module')} ${mi + 1} · ${t('question')} ${qi + 1} ${t('of')} ${m.challenges.length}</span>`)}
        <div class="ch-body">
          <aside class="ch-left">
            <div class="tabs"><button class="on" data-tab="problem">${t('problem')}</button><button data-tab="schema">${t('schema')}</button></div>
            <div class="tab-pane" data-pane="problem">
              <div class="row gap"><span class="badge ${c.diff}">${t(c.diff)}</span>${c.boss ? `<span class="badge boss">${t('boss')}</span>` : ''}${save.done[c.id] ? '<span class="badge ok">✓</span>' : ''}</div>
              <h2>${esc(L(c.title))}</h2>
              <div class="kw-row"><span class="muted">${t('new')}</span>${c.kw.map((k) => `<code class="kw">${esc(k)}</code>`).join('')}</div>
              <blockquote class="case-note"><b>${t('caseNote')}</b> ${esc(L(c.note))}</blockquote>
              <p class="task">${md(L(c.text))}</p>
              <div class="mini-schema">${schemaHtml()}</div>
            </div>
            <div class="tab-pane" data-pane="schema" hidden>${schemaHtml()}</div>
          </aside>
          <main class="ch-main">
            <div class="row gap toolbar">
              <button class="btn ghost sm" data-lesson>📖 ${t('lesson')}</button>
              <button class="btn ghost sm" data-hint>💡 ${t('hint')}</button>
              <span class="spacer"></span>
              <span class="muted small">${t('questionsDone', { n: m.challenges.filter((x) => save.done[x.id]).length, total: m.challenges.length })}</span>
            </div>
            <div class="query-box"></div>
            <div class="row gap actions">
              <button class="btn run" data-run>▶ ${t('run')} <kbd>Ctrl+↵</kbd></button>
              <button class="btn primary" data-submit>✓ ${t('submit')} <kbd>Ctrl+⇧+↵</kbd></button>
              <span class="feedback"></span>
            </div>
            <p class="muted small">${t('runHelp')}</p>
            <div class="results">
              <div class="tabs"><button class="on" data-rtab="mine">${t('results')}</button><button data-rtab="exp" hidden>${t('expected')}</button></div>
              <div class="res-pane" data-rpane="mine"><p class="muted center">${t('runToSee')}</p></div>
              <div class="res-pane" data-rpane="exp" hidden></div>
            </div>
          </main>
          <aside class="ch-right">
            <div class="bubble" hidden></div>
            <div class="ch-char">${charHtml(ch, 'neutral', 'bob')}</div>
          </aside>
        </div>
      </section>`;
    bindTopbar(app);
    bindSamples(app);
    const charEl = () => $('.ch-char .character');
    const qbox = $('.query-box'), feedback = $('.feedback');

    function say(text, expr, keep) {
      const b = $('.bubble');
      b.hidden = false; b.innerHTML = `<b>${Characters.CH[ch].name}</b>${md(text)}`;
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
      setExpr(charEl(), ch, expr || 'neutral');
      clearTimeout(bubbleTimer);
      if (!keep) bubbleTimer = setTimeout(() => { b.hidden = true; setExpr(charEl(), ch, 'neutral'); }, 9000);
    }

    // tabs
    $$('[data-tab]').forEach((b) => b.onclick = () => {
      $$('[data-tab]').forEach((x) => x.classList.toggle('on', x === b));
      $$('[data-pane]').forEach((p) => p.hidden = p.dataset.pane !== b.dataset.tab);
    });
    $$('[data-rtab]').forEach((b) => b.onclick = () => {
      $$('[data-rtab]').forEach((x) => x.classList.toggle('on', x === b));
      $$('[data-rpane]').forEach((p) => p.hidden = p.dataset.rpane !== b.dataset.rtab);
    });

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
          html += `<span class="g-txt">${highlight(p).replace(/\n$/, '')}</span>`;
          if (i < slots.length) html += slots[i] == null ? `<span class="slot" data-slot="${i}"></span>` : `<span class="slot filled" data-slot="${i}">${esc(c.guided.pieces[slots[i]])}</span>`;
        });
        qbox.innerHTML = `
          <div class="guided">
            <div class="g-head"><span class="badge guided">${t('guided')}</span> <span class="muted small">${t('guidedHelp')}</span></div>
            <pre class="g-query">${html}</pre>
            <div class="g-pieces">${c.guided.pieces.map((p, i) => `<button class="piece ${used.has(i) ? 'used' : ''}" draggable="true" data-piece="${i}" ${used.has(i) ? 'disabled' : ''}>⠿ ${esc(p)}</button>`).join('')}</div>
            <div class="g-foot"><button class="link" data-type>${t('typeInstead')}</button></div>
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
          const parts2 = c.guided.template.split('[]');
          editorText = parts2.map((p, i) => p + (i < slots.length ? (slots[i] != null ? c.guided.pieces[slots[i]] : '___') : '')).join('');
          mode = 'editor'; renderQueryBox();
        };
      } else {
        qbox.innerHTML = `${editorHtml(editorText)}${c.guided ? `<div class="g-foot"><button class="link" data-blocks>${t('useBlocks')}</button></div>` : ''}`;
        const ta = bindEditor(qbox, doRun, doSubmit);
        ta.addEventListener('input', () => { editorText = ta.value; });
        if (c.guided) $('[data-blocks]', qbox).onclick = () => { mode = 'guided'; renderQueryBox(); };
        setTimeout(() => ta.focus(), 30);
      }
    }

    function showResult(r) {
      $('[data-rtab="mine"]').click();
      $('[data-rpane="mine"]').innerHTML = r.ok ? resultTable(r) : `<div class="sql-error"><b>${t('sqlError')}</b><pre>${esc(r.error)}</pre></div>`;
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
      if (!r.ok) { unlock('sql_error'); GameAudio.play('error'); say(L(ERR[ch]), 'thinking'); }
      else GameAudio.play('click');
    }

    function doSubmit() {
      const q = getQueryOrWarn(); if (!q) return;
      const r = runSql(q);
      showResult(r);
      unlock('first_query');
      if (!r.ok) { unlock('sql_error'); GameAudio.play('error'); feedback.className = 'feedback bad'; feedback.textContent = t('sqlError'); say(L(ERR[ch]), 'thinking'); return; }
      const res = check(c, r);
      if (!res.ok) {
        GameAudio.play('error');
        feedback.className = 'feedback bad'; feedback.textContent = '✗ ' + res.msg;
        const pool = WRONG[ch]; say(L(pool[Math.floor(Math.random() * pool.length)]), ch === 'rei' ? 'angry' : 'thinking');
        return;
      }
      // Acertou!
      const first = !save.done[c.id];
      const hintsUsed = save.hintsUsed[c.id] || 0;
      if (first) {
        let g = c.boss ? 30 : 10; if (!hintsUsed) g += 5;
        save.gems += g;
        save.done[c.id] = { ts: Date.now(), sql: q, hints: hintsUsed };
        persist();
        $('.gems').textContent = '◆ ' + save.gems;
        unlock('first_correct');
        if (c.boss && !hintsUsed) unlock('no_hints');
      } else { save.done[c.id].sql = q; persist(); }
      GameAudio.play('success');
      feedback.className = 'feedback good'; feedback.textContent = '✓ ' + t('correct') + (first ? `  +◆` : '');
      say(L(c.react), c.boss ? 'excited' : 'happy', true);
      confetti();
      const isLast = qi === m.challenges.length - 1;
      const modJustDone = moduleDone(m) && first;
      const actions = $('.actions');
      const nb = document.createElement('button');
      nb.className = 'btn primary glow'; nb.textContent = (isLast ? t('finishModule') : t('next')) + ' →';
      actions.querySelector('[data-next]') && actions.querySelector('[data-next]').remove();
      nb.dataset.next = '1';
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
      if (hintsShown < c.hints.length) {
        hintsShown++;
        save.hintsUsed[c.id] = Math.max(save.hintsUsed[c.id] || 0, hintsShown); persist();
        say(`<i>${t('hintN', { n: hintsShown, total: c.hints.length })}</i>\n` + L(c.hints[hintsShown - 1]), 'thinking', true);
        $('.bubble').innerHTML = `<b>${Characters.CH[ch].name} · ${t('hintN', { n: hintsShown, total: c.hints.length })}</b>${md(L(c.hints[hintsShown - 1]))}`;
      } else {
        say(t('noMoreHints'), 'thinking', true);
        const b = document.createElement('button'); b.className = 'btn ghost sm'; b.textContent = t('showAnswer');
        b.onclick = () => {
          mode = 'editor'; editorText = c.solution; renderQueryBox();
          const exp = runSql(c.solution); $('[data-rtab="exp"]').hidden = false; $('[data-rpane="exp"]').innerHTML = resultTable(exp);
        };
        $('.bubble').appendChild(b);
      }
    };

    renderQueryBox();
    const intro = qi === 0 && !save.done[c.id]
      ? (ch === 'rei' ? T2('Primeira questão. Mostre o que aprendeu.', 'First question. Show me what you learned.') : T2('Vamos lá! Se travar, aperta o botão de Dica.', "Let's go! If you get stuck, press the Hint button."))
      : null;
    if (intro) setTimeout(() => say(L(intro), 'happy'), 350);
  }

  function confetti() {
    const wrap = document.createElement('div'); wrap.className = 'confetti';
    const colors = ['#ff6fa8', '#ffd84d', '#7ae0c3', '#8fa2ff', '#ffb0d0'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%'; p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.4 + 's'; p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3200);
  }

  // ─────────────────────────── Laboratório livre ───────────────────────────
  function showPlayground() {
    current = showPlayground;
    app.innerHTML = `
      <section class="screen challenge playground">
        ${topbar(`<span>⚗ ${t('playground')}</span>`)}
        <div class="ch-body">
          <aside class="ch-left"><p class="muted">${t('playgroundDesc')}</p>${schemaHtml()}</aside>
          <main class="ch-main">
            <div class="query-box">${editorHtml('SELECT *\nFROM stalls\nORDER BY price DESC;')}</div>
            <div class="row gap actions"><button class="btn run" data-run>▶ ${t('run')} <kbd>Ctrl+↵</kbd></button></div>
            <div class="results"><div class="res-pane"><p class="muted center">${t('runToSee')}</p></div></div>
          </main>
          <aside class="ch-right"><div class="ch-char">${charHtml('rei', 'happy', 'bob')}</div></aside>
        </div>
      </section>`;
    bindTopbar(app); bindSamples(app);
    const run = () => {
      const r = runSql($('.ed-ta').value);
      $('.res-pane').innerHTML = r.ok ? resultTable(r) : `<div class="sql-error"><b>${t('sqlError')}</b><pre>${esc(r.error)}</pre></div>`;
      GameAudio.play(r.ok ? 'click' : 'error');
      unlock('playground');
    };
    bindEditor(app, run, run);
    $('[data-run]').onclick = run;
  }

  // ─────────────────────────── Início ───────────────────────────
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
    app.innerHTML = `<pre style="color:#fff;padding:24px">Falha ao iniciar o SQLite / Failed to start SQLite:\n${esc(e && e.message || e)}</pre>`;
  });

  window.__game = { runSql, check, get save() { return save; } };
})();
