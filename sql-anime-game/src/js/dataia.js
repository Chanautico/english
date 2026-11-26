// Crônicas de Dataia — modo história (data-driven).
// Tudo vem de window.GAME_DATA (gerado de data/ por tools/build-data.js).
// Imagens: src/assets/sprites/<tag>.png e src/assets/bg/<tag>.png. Se o arquivo
// não existir, aparece uma caixa provisória com o nome do arquivo.
(function () {
  const C = () => window.Core;
  const D = () => window.GAME_DATA;
  const lang = () => I18N.lang;
  const L = (o) => I18N.L(o);
  const T2 = (pt, en) => ({ pt, en });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const STR = {
    story: T2('Crônicas de Dataia', 'Chronicles of Dataia'),
    arc: T2('Arco', 'Arc'), stage: T2('Fase', 'Stage'), turn: T2('Turno', 'Turn'),
    play: T2('Jogar fase', 'Play stage'), replay: T2('Rejogar', 'Replay'),
    soon: T2('Em breve — este arco está sendo escrito.', 'Coming soon — this arc is being written.'),
    lockedArc: T2('Termine o arco anterior para liberar.', 'Clear the previous arc to unlock.'),
    stagesDone: T2('fases completas', 'stages cleared'),
    restart: T2('Reiniciar fase', 'Restart stage'), tables: T2('Tabelas', 'Tables'),
    terminal: T2('Terminal Ancestral', 'Ancestral Terminal'),
    continueStory: T2('Continuar história', 'Continue story'),
    victory: T2('VITÓRIA!', 'VICTORY!'),
    mission: T2('MISSÃO', 'MISSION'),
    restored: T2('Banco de dados restaurado! Tudo de volta ao estado original. Tenta de novo!', 'Database restored! Everything is back to its original state. Try again!'),
    askHint: T2('Pip, me ajuda?', 'Pip, help me?'),
    title: T2('Título', 'Title'),
  };
  const S = (k) => L(STR[k]);

  // ─────────────────────────── Imagens com placeholder ───────────────────────────
  const EXTS = ['png', 'webp', 'jpg'];
  const Assets = {
    cache: {},
    charOf(tag) { return (tag || '').split('_')[0]; },
    color(tag) { const e = D() && D().elenco[Assets.charOf(tag)]; return e ? e.cor : '#8a7fa8'; },
    glyph(tag) { const c = Assets.charOf(tag); return c === 'pip' ? ';' : (c[0] || '?').toUpperCase(); },
    html(kind, name, extra) {
      const isBg = kind === 'bg';
      return `<div class="asset asset-${isBg ? 'bg' : 'sprite'} ${extra || ''}" data-kind="${kind}" data-name="${esc(name)}" style="--c:${isBg ? '#6b7fa8' : Assets.color(name)}" title="${esc(name)}.png">
        <div class="ph">${isBg ? '<span class="ph-ico">🖼</span>' : `<span class="ph-glyph">${esc(Assets.glyph(name))}</span>`}<code>${esc(name)}.png</code></div>
        <img alt="" draggable="false">
      </div>`;
    },
    resolve(kind, name) {
      const key = kind + ':' + name;
      if (key in Assets.cache) return Promise.resolve(Assets.cache[key]);
      const dir = kind === 'bg' ? 'bg' : 'sprites';
      return new Promise((done) => {
        let i = 0;
        const tryNext = () => {
          if (i >= EXTS.length) { Assets.cache[key] = null; return done(null); }
          const src = `assets/${dir}/${name}.${EXTS[i++]}`;
          const im = new Image();
          im.onload = () => { Assets.cache[key] = src; done(src); };
          im.onerror = tryNext;
          im.src = src;
        };
        tryNext();
      });
    },
    hydrate(root) {
      (root || document).querySelectorAll('.asset:not([data-h])').forEach((el) => {
        el.dataset.h = '1';
        Assets.resolve(el.dataset.kind, el.dataset.name).then((src) => {
          if (src) { el.querySelector('img').src = src; el.classList.add('loaded'); } else el.classList.add('missing');
        });
      });
    },
  };
  window.Assets = Assets;

  // Expressão (emote) a partir do nome do sprite.
  function emoteOf(tag) {
    const m = (tag || '').split('_').slice(1).join('_');
    if (/surpres|alerta/.test(m)) return 'surprised';
    if (/brav|furios/.test(m)) return 'angry';
    if (/confiante|orgulh|sorrindo|feliz/.test(m)) return 'happy';
    if (/erro|derrotad/.test(m)) return 'sad';
    if (/focad|explicando|seri/.test(m)) return 'thinking';
    return null;
  }
  const nameOf = (tag) => { const e = D().elenco[Assets.charOf(tag)]; return e ? L(e.nome) : tag; };

  // ─────────────────────────── Dados / progresso ───────────────────────────
  function prog() {
    const s = C().save;
    if (!s.dataia) s.dataia = { done: {}, hints: {} };
    return s.dataia;
  }
  const arcs = () => D().arcos;
  const TOTAL_FASES = 60; // fases planejadas no roteiro
  const storyProgress = () => ({ done: Object.keys(prog().done).length, total: TOTAL_FASES });
  const arcById = (id) => arcs().find((a) => a.id === id);
  const fasesOf = (id) => D().fases.filter((f) => f.arco === id).sort((a, b) => a.id - b.id);
  const faseDone = (f) => !!prog().done[f.id];
  const arcDone = (a) => { const fs = fasesOf(a.id); return fs.length > 0 && fs.every(faseDone); };
  function arcUnlocked(a) { if (a.em_breve) return false; const prev = arcById(a.id - 1); return !prev || arcDone(prev); }
  function faseUnlocked(f) { const prev = D().fases.find((x) => x.id === f.id - 1); return !prev || faseDone(prev); }

  const dbCache = {};
  function dbFor(arc) {
    const key = arc.id + ':' + lang();
    if (!dbCache[key]) dbCache[key] = C().makeDb(arc.setup[lang()]);
    return dbCache[key];
  }

  function schemaHtml(arc) {
    return `<div class="schema">${arc.tabelas.map((tb) => `
      <div class="tbl-card">
        <div class="tbl-top"><span class="tbl-name">▦ ${esc(L(tb.nome))}</span><button class="link" data-sample="${esc(L(tb.nome))}">${C().t('sampleRows')}</button></div>
        <p class="tbl-desc">${esc(L(tb.descricao))}</p>
        <table class="cols">${tb.colunas.map((c) => `<tr><td class="cn">${esc(L(c.nome))}</td><td class="ct">${c.tipo}</td><td class="cd">${c.nota ? esc(L(c.nota)) : ''}</td></tr>`).join('')}</table>
        <div class="sample-body"></div>
      </div>`).join('')}</div>`;
  }
  function bindSamples(root, arc) {
    root.querySelectorAll('[data-sample]').forEach((b) => b.onclick = () => {
      const body = b.closest('.tbl-card').querySelector('.sample-body');
      body.innerHTML = body.innerHTML ? '' : C().resultTable(C().runOn(dbFor(arc), `SELECT * FROM ${b.dataset.sample} LIMIT 5`));
    });
  }

  // ─────────────────────────── Mapa de Dataia ───────────────────────────
  let selArc = null;
  function showMap(sel) {
    const core = C(), app = document.getElementById('app');
    if (sel == null) sel = selArc != null ? selArc : (arcs().find((a) => arcUnlocked(a) && !arcDone(a)) || arcs()[0]).id;
    selArc = sel;
    core.setCurrent(() => showMap(selArc));
    const arc = arcById(sel), fs = fasesOf(sel);
    const doneN = fs.filter(faseDone).length;
    const nextF = fs.find((f) => !faseDone(f));
    const unlocked = arcUnlocked(arc);
    app.innerHTML = `
      <section class="screen hub paper-bg dataia-map">
        ${core.header(`<span>⚔ ${S('story')}</span>`, storyProgress())}
        <nav class="route">
          <div class="route-line"></div>
          ${arcs().map((a) => {
            const n = fasesOf(a.id), d = n.filter(faseDone).length, u = arcUnlocked(a), full = n.length && d === n.length;
            return `<button class="station ${a.id === sel ? 'sel' : ''} ${u ? '' : 'locked'} ${full ? 'full' : ''}" data-arc="${a.id}" style="--c:${a.cor}">
              <span class="st-dot">${full ? '✓' : u ? a.id : '🔒'}</span>
              <span class="st-name">${esc(L(a.titulo))}</span>
              <span class="st-prog">${a.em_breve ? '…' : `${d}/${n.length}`}</span>
            </button>`;
          }).join('')}
        </nav>
        <div class="hub-main">
          <figure class="teacher polaroid arc-card" style="--c:${arc.cor}">
            <div class="arc-cover">${FX.scenery(arc.capa, { few: true })}</div>
            <figcaption><b>${S('arc')} ${arc.id}</b><small>${esc(L(arc.titulo))}</small></figcaption>
          </figure>
          <article class="notebook">
            <div class="nb-head">
              <div>
                <div class="eyebrow" style="color:${arc.cor}">${S('arc')} ${arc.id}</div>
                <h2>${esc(L(arc.titulo))}</h2>
                <p>${esc(L(arc.descricao))}</p>
              </div>
              ${fs.length ? `<div class="big-prog" style="--p:${(doneN / fs.length) * 100};--c:${arc.cor}"><b>${doneN}</b><small>/${fs.length}</small></div>` : ''}
            </div>
            ${arc.em_breve ? `<p class="lock-msg">✎ ${S('soon')}</p>` : !unlocked ? `<p class="lock-msg">🔒 ${S('lockedArc')}</p>` : `
              <div class="row gap">
                <button class="btn primary" data-play="${(nextF || fs[0]).id}">${nextF ? `${S('play')} ${nextF.id}` : S('replay')} →</button>
                <button class="btn soft" data-title>↩ ${S('title')}</button>
              </div>`}
            <ol class="q-list">
              ${fs.map((f) => {
                const ok = unlocked && faseUnlocked(f);
                return `<li><button class="q-row ${faseDone(f) ? 'done' : ''} ${f.chefe ? 'boss' : ''}" ${ok ? '' : 'disabled'} data-play="${f.id}">
                  <span class="q-check">${faseDone(f) ? '✓' : f.chefe ? '★' : f.id}</span>
                  <span class="q-title">${S('stage')} ${f.id} · ${esc(L(f.titulo))}</span>
                  <span class="q-kws">${f.conceitos.slice(0, 3).map((k) => `<code>${esc(k)}</code>`).join('')}</span>
                  <span class="diff ${{ facil: 'easy', medio: 'medium', dificil: 'hard' }[f.dificuldade]}">${core.t({ facil: 'easy', medio: 'medium', dificil: 'hard' }[f.dificuldade])}</span>
                </button></li>`;
              }).join('')}
            </ol>
          </article>
        </div>
      </section>`;
    core.bindHeader(app, () => core.showTitle());
    Assets.hydrate(app); FX.hydrate(app);
    app.querySelectorAll('[data-arc]').forEach((b) => b.onclick = () => { GameAudio.play('click'); showMap(+b.dataset.arc); });
    app.querySelectorAll('[data-play]').forEach((b) => b.onclick = () => { GameAudio.play('click'); GameAudio.startMusic(); playFase(D().fases.find((f) => f.id === +b.dataset.play)); });
    const tb = app.querySelector('[data-title]'); if (tb) tb.onclick = () => { GameAudio.play('click'); core.showTitle(); };
  }

  // ─────────────────────────── Fluxo de uma fase ───────────────────────────
  function playFase(f) {
    const back = () => showMap(f.arco);
    scene(f, f.historia_antes, false, () =>
      scene(f, f.aula, true, () =>
        challenge(f, () =>
          scene(f, f.historia_depois, false, back)), back), back);
  }

  // ─────────────────────────── Cena animada (palco + elenco + caderno + diálogo) ───────────────────────────
  function scene(f, falas, isLesson, onDone, onBack) {
    if (!falas || !falas.length) return onDone();
    const core = C(), app = document.getElementById('app');
    core.setCurrent(null);
    const arc = arcById(f.arco);
    app.innerHTML = `
      <section class="screen vn cine ${isLesson ? 'is-lesson' : ''}" style="--arc:${arc.cor}">
        <div class="cine-stage">
          ${FX.scenery(f.cenario)}
          <div class="cast"></div>
          <div class="fx-layer"></div>
        </div>
        <div class="vn-top">
          <button class="chip-btn dark" data-back>↩ ${core.t('back')}</button>
          <div class="vn-title">${isLesson ? '📖 ' + core.t('lesson') + ' · ' : ''}${S('stage')} ${f.id} — ${esc(L(f.titulo))}</div>
          <div class="row gap">
            <button class="chip-btn dark" data-log>☰ ${core.t('log')}</button>
            <button class="chip-btn dark" data-auto>▶ ${core.t('auto')}</button>
            <button class="chip-btn dark" data-skip>${core.t('skip')} ⏭</button>
          </div>
        </div>
        ${isLesson ? `<div class="vn-notes"><div class="nb-rings"></div><div class="notes-head">${S('stage')} ${f.id} — ${esc(L(f.titulo))}</div><div class="notes-body"></div></div>` : ''}
        <div class="vn-dialog"><div class="vn-who"></div><div class="vn-text"></div><div class="vn-next">${core.t('clickToContinue')} ▸</div></div>
        <div class="vn-steps">${falas.map(() => '<i></i>').join('')}</div>
      </section>`;
    FX.hydrate(app);
    const q = (s) => app.querySelector(s);
    const stage = q('.cine-stage'), castEl = q('.cast');
    const who = q('.vn-who'), textEl = q('.vn-text'), notes = q('.notes-body'), dots = app.querySelectorAll('.vn-steps i');
    let i = -1, typing = null, full = '', auto = false, autoTimer = null;
    const cast = new Map(); // personagem -> elemento no palco (na ordem em que entraram)
    const log = [];
    const speed = { slow: 45, normal: 24, fast: 10, instant: 0 }[core.save.settings.speed] ?? 24;

    function addNote(b) {
      if (!notes || !b) return;
      let h = '';
      if (b.titulo) h = `<h4>${esc(L(b.titulo))}</h4>`;
      if (b.codigo) h = `<pre class="note-code">${core.highlight(L(b.codigo))}</pre>`;
      if (b.nota) h = `<p class="note-txt">✎ ${esc(L(b.nota))}</p>`;
      if (b.tabela) h = `<table class="note-table">${L(b.tabela).map((r, ri) => `<tr>${r.map((c) => ri ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table>`;
      const div = document.createElement('div'); div.className = 'note-item'; div.innerHTML = h;
      notes.appendChild(div);
      while (notes.scrollHeight > notes.clientHeight && notes.children.length > 1) notes.removeChild(notes.firstChild);
    }
    // Posiciona o elenco: Ren sempre à esquerda; o Pip flutua perto dele.
    function layoutCast() {
      const people = [...cast.entries()].filter(([c]) => c !== 'pip').sort(([a], [b]) => (a === 'ren' ? -1 : b === 'ren' ? 1 : 0));
      const slots = isLesson ? { 1: [22], 2: [12, 32], 3: [8, 22, 36] } : { 1: [50], 2: [28, 72], 3: [18, 50, 82] };
      const pos = slots[Math.min(people.length, 3)] || [];
      people.forEach(([, el], k) => { el.style.left = pos[k] + '%'; el.classList.toggle('flip', pos[k] > 55); });
      const pipEl = cast.get('pip');
      if (pipEl) { const ren = cast.get('ren'); pipEl.style.left = ((ren ? parseFloat(ren.style.left) : (isLesson ? 22 : 50)) + (isLesson ? 9 : 11)) + '%'; }
    }
    // Coloca um personagem no palco (ou só troca a expressão se já estiver lá).
    function ensureActor(tag) {
      const ch = Assets.charOf(tag);
      let el = cast.get(ch);
      if (!el) {
        const people = [...cast.keys()].filter((c) => c !== 'pip');
        if (ch !== 'pip' && people.length >= 3) { // palco cheio: sai quem entrou primeiro (menos o Ren)
          const out = people.find((c) => c !== 'ren');
          const oel = cast.get(out); oel.classList.add('exit'); setTimeout(() => oel.remove(), 400); cast.delete(out);
        }
        const d = document.createElement('div'); d.innerHTML = FX.actor(tag, 'enter' + (ch === 'pip' ? ' actor-pip' : '') + (ch === 'golem' ? ' actor-boss' : ''));
        el = d.firstElementChild; castEl.appendChild(el); cast.set(ch, el);
        FX.hydrate(castEl);
        if (ch === 'golem') FX.play(stage, 'tremor');
      } else FX.setActorTag(el, tag);
      layoutCast();
      return el;
    }
    function setSprite(tag) {
      if (!tag) { cast.forEach((el) => { el.classList.remove('speaking'); el.classList.add('dim'); }); return; }
      const ch = Assets.charOf(tag);
      const el = ensureActor(tag);
      cast.forEach((x, c) => { x.classList.toggle('speaking', c === ch); x.classList.toggle('dim', c !== ch); });
      let em = el.querySelector('.actor-emote');
      if (!em) { em = document.createElement('span'); em.className = 'actor-emote'; el.appendChild(em); }
      const e = emoteOf(tag); em.innerHTML = e ? Characters.emote(e) : '';
      el.classList.remove('talk'); void el.offsetWidth; el.classList.add('talk');
    }
    function finishTyping() { if (typing) { clearInterval(typing); typing = null; textEl.textContent = full; } }
    function next() {
      if (typing) return finishTyping();
      i++;
      if (i >= falas.length) { cleanup(); return onDone(); }
      dots.forEach((d, k) => d.classList.toggle('on', k <= i));
      const st = falas[i];
      full = st[lang()] || st.pt;
      log.push([st.sprite ? nameOf(st.sprite) : '', full]);
      [].concat(st.entra || []).forEach((tg) => ensureActor(tg).classList.add('dim'));
      [].concat(st.sai || []).forEach((c) => { const el = cast.get(c); if (el) { el.classList.add('exit'); setTimeout(() => el.remove(), 400); cast.delete(c); layoutCast(); } });
      setSprite(st.sprite || null);
      if (st.sprite) { who.textContent = nameOf(st.sprite); who.style.background = Assets.color(st.sprite); who.hidden = false; } else who.hidden = true;
      addNote(st.quadro);
      [].concat(st.efeito || []).forEach((e, k) => setTimeout(() => FX.play(stage, e), k * 250));
      textEl.classList.toggle('narration', !st.sprite);
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
    q('.vn').onclick = (e) => { if (!e.target.closest('button')) next(); };
    q('[data-back]').onclick = () => { cleanup(); (onBack || (() => showMap(f.arco)))(); };
    q('[data-skip]').onclick = () => { GameAudio.play('click'); cleanup(); onDone(); };
    q('[data-auto]').onclick = (e) => { auto = !auto; e.currentTarget.classList.toggle('on', auto); if (auto && !typing) scheduleAuto(); };
    q('[data-log]').onclick = () => core.modal(`<h2>☰ ${core.t('log')}</h2><div class="log">${log.map(([n, x]) => `<p>${n ? `<b>${esc(n)}</b> ` : ''}${esc(x)}</p>`).join('')}</div><div class="modal-actions"><button class="btn primary" data-close>${core.t('close')}</button></div>`);
    next();
  }

  // ─────────────────────────── Desafio: Terminal + chat com o Pip ───────────────────────────
  const PIP = {
    wrong: [T2('Hmm! O resultado não bate. Olha a diferença que o Terminal mostrou!', "Hmm! The result doesn't match. Look at the difference the Terminal showed!"), T2('Quase, Ren! Relê a missão com calma.', 'Almost, Ren! Read the mission again calmly.'), T2('BZZT! Não é isso! Quer uma dica?', "BZZT! That's not it! Want a hint?")],
    error: T2('ERRO DE SINTAXE! Eu senti isso nos meus pontinhos! Lê a mensagem: ela diz onde está o problema.', 'SYNTAX ERROR! I felt that in my little dots! Read the message: it tells you where the problem is.'),
    right: [T2('ISSO! Consulta perfeita!', 'YES! Perfect query!'), T2('Uhuuu! O Terminal brilhou!', 'Woohoo! The Terminal is glowing!')],
    turnOk: T2('ACERTOU EM CHEIO! Próximo turno, rápido!', 'DIRECT HIT! Next turn, quick!'),
    win: T2('O inimigo caiu! Você venceu, Ren!', 'The enemy is down! You won, Ren!'),
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function challenge(f, onWin, onBack) {
    const core = C(), app = document.getElementById('app'), arc = arcById(f.arco);
    core.setCurrent(() => challenge(f, onWin, onBack));
    const lg = lang();
    const boss = f.chefe;
    const total = f.desafios.length;
    let turn = 0, hp = boss ? boss.hp : 0, mode = 'editor', slots = [], editorText = '', hintsShown = 0;

    app.innerHTML = `
      <section class="screen quest paper-bg dataia-quest" style="--arc:${arc.cor}">
        ${core.header(`<button class="crumb-link" data-act="map">${S('arc')} ${f.arco}</button> › <span>${S('stage')} ${f.id} · ${esc(L(f.titulo))}</span>`, storyProgress())}
        <div class="quest-body">
          <aside class="chat pip-chat" style="--c:${D().elenco.pip.cor};--soft:#fff5d9">
            <div class="chat-head">
              <span class="pip-av">${FX.actor('pip_feliz', 'av-actor')}</span>
              <div><b>Pip</b><small><i class="online"></i> ${S('terminal')} · <code class="sprite-tag">pip_feliz</code></small></div>
            </div>
            <div class="chat-log"></div>
            <div class="chat-actions">
              <button class="chip-btn" data-hint>💡 ${core.t('hint')} <small>3</small></button>
              <button class="chip-btn" data-lesson ${f.aula && f.aula.length ? '' : 'disabled'}>📖 ${core.t('lesson')}</button>
              <button class="chip-btn" data-tables>▦ ${S('tables')}</button>
              <button class="chip-btn" data-grim>📘 ${lg === 'pt' ? 'Grimório' : 'Grimoire'}</button>
              <button class="chip-btn" data-restart>↺ ${S('restart')}</button>
            </div>
          </aside>
          <main class="work">
            ${boss ? `<div class="arena">
              ${FX.scenery(f.cenario, { few: true })}
              <div class="arena-cast">${FX.actor('ren_focado', 'ar-hero')}${FX.actor('pip_alerta', 'ar-pip')}${FX.actor(boss.sprite, 'ar-boss')}</div>
              <div class="fx-layer"></div>
            </div>
            <div class="bossbar">
              <div class="boss-info"><b>${esc(L(boss.nome))}</b><div class="hp"><i style="width:100%"></i></div><small class="turn-lbl"></small></div>
              <div class="turn-dots">${f.desafios.map((_, k) => `<i data-td="${k}"></i>`).join('')}</div>
            </div>` : `<div class="mission-strip"><b>${S('mission')}</b> ${esc(L(f.missao))}</div>`}
            <div class="card editor-card">
              <div class="card-tabs"><span class="file-tab">● terminal.sql</span><span class="spacer"></span><span class="muted small">${core.t('shortcuts')}</span></div>
              <div class="query-box"></div>
            </div>
            <div class="row gap actions">
              <button class="btn run" data-run>▶ ${core.t('run')}</button>
              <button class="btn primary" data-submit>✓ ${core.t('submit')}</button>
              <span class="feedback"></span>
            </div>
            <div class="card results">
              <div class="card-tabs">
                <button class="tab on" data-rtab="mine">${core.t('results')}</button>
                <button class="tab" data-rtab="exp" hidden>${core.t('expected')}</button>
                <button class="tab" data-rtab="schema">${S('tables')}</button>
              </div>
              <div class="res-pane" data-rpane="mine"><p class="muted center pad">${core.t('runToSee')}</p></div>
              <div class="res-pane" data-rpane="exp" hidden></div>
              <div class="res-pane" data-rpane="schema" hidden>${schemaHtml(arc)}</div>
            </div>
          </main>
        </div>
      </section>`;
    const q = (s) => app.querySelector(s);
    const back = onBack || (() => showMap(f.arco));
    core.bindHeader(app, back);
    q('[data-act="map"]').onclick = () => { GameAudio.play('click'); back(); };
    FX.hydrate(app);
    bindSamples(app, arc);
    const chatLog = q('.chat-log'), qbox = q('.query-box'), feedback = q('.feedback');
    const arena = q('.arena');
    // Animações da batalha: ataque do herói (acerto) ou do chefe (erro).
    function battle(kind) {
      if (!arena) return;
      const hero = arena.querySelector('.ar-hero'), foe = arena.querySelector('.ar-boss');
      const anim = (el, cls, ms) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };
      if (kind === 'hit') {
        FX.setActorTag(hero, 'ren_confiante');
        anim(hero, 'dash', 700);
        setTimeout(() => { FX.play(arena, 'corte'); FX.play(arena, 'impacto'); anim(foe, 'hurt', 600); }, 280);
      } else if (kind === 'miss') {
        anim(foe, 'lunge', 700);
        setTimeout(() => { FX.play(arena, 'tremor'); FX.setActorTag(hero, 'ren_surpreso'); anim(hero, 'hurt', 600); }, 300);
        setTimeout(() => FX.setActorTag(hero, 'ren_focado'), 1400);
      } else if (kind === 'win') {
        foe.querySelectorAll('.golem-svg').forEach((s) => s.classList.add('crumble'));
        foe.classList.add('defeated'); FX.play(arena, 'dados');
        FX.setActorTag(hero, 'ren_confiante'); anim(hero, 'cheer', 1200);
        FX.setActorTag(arena.querySelector('.ar-pip'), 'pip_feliz');
      }
    }

    function setPip(tag) {
      const el = q('.pip-av .actor');
      if (!el || !document.body.contains(chatLog)) return; // a tela já mudou
      FX.setActorTag(el, tag);
      let em = el.querySelector('.actor-emote');
      if (!em) { em = document.createElement('span'); em.className = 'actor-emote'; el.appendChild(em); }
      em.innerHTML = emoteOf(tag) ? Characters.emote(emoteOf(tag)) : '';
      q('.sprite-tag').textContent = tag;
      if (arena) FX.setActorTag(arena.querySelector('.ar-pip'), tag);
    }
    function say(html, tag, me) {
      const div = document.createElement('div');
      div.className = 'msg ' + (me ? 'me' : 'her');
      div.innerHTML = me ? `<div class="bubble">${html}</div>` : `<span class="pip-mini">;</span><div class="bubble">${html}</div>`;
      chatLog.appendChild(div); chatLog.scrollTop = chatLog.scrollHeight;
      if (!me && tag) setPip(tag);
      return div;
    }
    function typingThen(fn) {
      const t = document.createElement('div'); t.className = 'msg her typing';
      t.innerHTML = '<span class="pip-mini">;</span><div class="bubble"><i></i><i></i><i></i></div>';
      chatLog.appendChild(t); chatLog.scrollTop = chatLog.scrollHeight;
      setTimeout(() => { t.remove(); fn(); }, 420);
    }
    function openTab(name) {
      app.querySelectorAll('[data-rtab]').forEach((x) => x.classList.toggle('on', x.dataset.rtab === name));
      app.querySelectorAll('[data-rpane]').forEach((p) => p.hidden = p.dataset.rpane !== name);
    }
    app.querySelectorAll('[data-rtab]').forEach((b) => b.onclick = () => openTab(b.dataset.rtab));

    const cur = () => f.desafios[turn];
    const guide = () => cur().guiado && cur().guiado[lg];

    function loadTurn() {
      const d = cur();
      hintsShown = 0;
      q('[data-hint] small').textContent = d.dicas.length;
      mode = guide() && !faseDone(f) ? 'guided' : 'editor';
      slots = []; editorText = '';
      q('[data-rtab="exp"]').hidden = true;
      if (boss) {
        q('.turn-lbl').textContent = `${S('turn')} ${turn + 1}/${total}`;
        app.querySelectorAll('[data-td]').forEach((el, k) => { el.classList.toggle('done', k < turn); el.classList.toggle('cur', k === turn); });
      }
      say(`<div class="brief-tags">${(d.conceitos || f.conceitos).map((k) => `<code class="kw">${esc(k)}</code>`).join('')}</div>${core.md(L(d.enunciado))}`, turn === 0 ? 'pip_explicando' : 'pip_alerta');
      renderQueryBox();
    }

    function currentQuery() {
      if (mode === 'guided') {
        const g = guide(), parts = g.modelo.split('[]');
        if (slots.some((s) => s == null)) return null;
        return parts.map((p, i) => p + (i < slots.length ? g.pecas[slots[i]] : '')).join('');
      }
      const ta = q('.ed-ta'); return ta ? ta.value : '';
    }

    function renderQueryBox() {
      const g = guide();
      if (mode === 'guided' && g) {
        const parts = g.modelo.split('[]');
        if (slots.length !== parts.length - 1) slots = new Array(parts.length - 1).fill(null);
        const used = new Set(slots.filter((s) => s != null));
        let html = '';
        parts.forEach((p, i) => {
          html += core.highlight(p).replace(/\n$/, '');
          if (i < slots.length) html += slots[i] == null ? `<span class="slot" data-slot="${i}">?</span>` : `<span class="slot filled" data-slot="${i}">${esc(g.pecas[slots[i]])}</span>`;
        });
        qbox.innerHTML = `<div class="guided"><pre class="g-query">${html}</pre>
          <div class="g-tray"><span class="g-label">🧩 ${core.t('guidedHelp')}</span>
            <div class="g-pieces">${g.pecas.map((p, i) => `<button class="piece ${used.has(i) ? 'used' : ''}" draggable="true" data-piece="${i}" ${used.has(i) ? 'disabled' : ''}>${esc(p)}</button>`).join('')}</div>
            <button class="link" data-type>⌨ ${core.t('typeInstead')}</button></div></div>`;
        qbox.querySelectorAll('[data-piece]').forEach((b) => {
          b.onclick = () => { const k = slots.indexOf(null); if (k >= 0) { slots[k] = +b.dataset.piece; GameAudio.play('click'); renderQueryBox(); } };
          b.ondragstart = (e) => e.dataTransfer.setData('text/plain', b.dataset.piece);
        });
        qbox.querySelectorAll('[data-slot]').forEach((s) => {
          s.onclick = () => { slots[+s.dataset.slot] = null; GameAudio.play('click'); renderQueryBox(); };
          s.ondragover = (e) => { e.preventDefault(); s.classList.add('over'); };
          s.ondragleave = () => s.classList.remove('over');
          s.ondrop = (e) => { e.preventDefault(); const p = +e.dataTransfer.getData('text/plain'); const prev = slots.indexOf(p); if (prev >= 0) slots[prev] = null; slots[+s.dataset.slot] = p; GameAudio.play('click'); renderQueryBox(); };
        });
        qbox.querySelector('[data-type]').onclick = () => {
          editorText = parts.map((p, i) => p + (i < slots.length ? (slots[i] != null ? g.pecas[slots[i]] : '___') : '')).join('');
          mode = 'editor'; renderQueryBox();
        };
      } else {
        qbox.innerHTML = core.editorHtml(editorText) + (g ? `<div class="ed-foot"><button class="link" data-blocks>🧩 ${core.t('useBlocks')}</button></div>` : '');
        const ta = core.bindEditor(qbox, doRun, doSubmit);
        ta.addEventListener('input', () => { editorText = ta.value; });
        if (g) qbox.querySelector('[data-blocks]').onclick = () => { mode = 'guided'; renderQueryBox(); };
        setTimeout(() => ta.focus(), 30);
      }
    }

    function showResult(r) {
      openTab('mine');
      q('[data-rpane="mine"]').innerHTML = r.ok ? core.resultTable(r) : `<div class="sql-error"><b>⚠ ${core.t('sqlError')}</b><pre>${esc(r.error)}</pre></div>`;
    }
    function getQuery() {
      const v = currentQuery();
      if (v == null) { feedback.className = 'feedback warn'; feedback.textContent = core.t('fillBlanks'); GameAudio.play('error'); return null; }
      if (!v.trim()) { feedback.className = 'feedback warn'; feedback.textContent = core.t('emptyQuery'); GameAudio.play('error'); return null; }
      return v;
    }
    function doRun() {
      const v = getQuery(); if (!v) return;
      const r = core.runOn(dbFor(arc), v);
      showResult(r); core.unlock('first_query');
      feedback.textContent = ''; feedback.className = 'feedback';
      if (!r.ok) { core.unlock('sql_error'); GameAudio.play('error'); setPip('pip_erro'); typingThen(() => say(esc(L(PIP.error)), 'pip_erro')); }
      else { GameAudio.play('click'); explainRun(v, r); }
    }
    // Primeira vez usando um comando: o Pip comenta o que aconteceu.
    function explainRun(v, r) {
      PipGuide.afterRun(v, r, { count: (s) => core.runOn(dbFor(arc), s), say: (h) => say(h, 'pip_explicando') });
    }
    function doSubmit() {
      const v = getQuery(); if (!v) return;
      const r = core.runOn(dbFor(arc), v);
      showResult(r); core.unlock('first_query');
      say(`<pre class="mini-sql">${core.highlight(v.trim()).replace(/\n$/, '')}</pre>`, null, true);
      if (!r.ok) { core.unlock('sql_error'); GameAudio.play('error'); feedback.className = 'feedback bad'; feedback.textContent = core.t('sqlError'); typingThen(() => say(esc(L(PIP.error)), 'pip_erro')); return; }
      explainRun(v, r);
      const exp = core.runOn(dbFor(arc), cur().gabarito[lg]);
      const res = core.compare(r, exp, cur().ordenado);
      if (!res.ok) {
        GameAudio.play('error');
        feedback.className = 'feedback bad'; feedback.textContent = '✗ ' + res.msg;
        typingThen(() => say(`${esc(L(pick(PIP.wrong)))}<small class="why">${esc(res.msg)}</small>`, 'pip_alerta'));
        const w = q('.work'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake');
        battle('miss');
        return;
      }
      q('.results').classList.remove('rows-in'); void q('.results').offsetWidth; q('.results').classList.add('rows-in');
      GameAudio.play('success');
      feedback.className = 'feedback good'; feedback.textContent = '✓ ' + core.t('correct');
      if (boss) {
        hp--;
        q('.hp i').style.width = (hp / boss.hp) * 100 + '%';
        battle('hit');
        const foe = q('.ar-boss');
        setTimeout(() => { const dmg = document.createElement('span'); dmg.className = 'dmg'; dmg.textContent = '-1'; foe.appendChild(dmg); setTimeout(() => dmg.remove(), 900); }, 300);
        if (hp === 0) setTimeout(() => battle('win'), 800);
      }
      if (turn < total - 1) {
        typingThen(() => say(esc(L(PIP.turnOk)), 'pip_feliz'));
        turn++;
        setTimeout(() => { feedback.textContent = ''; loadTurn(); }, 1100);
        return;
      }
      win(v);
    }

    function win(v) {
      const p = prog(), first = !faseDone(f), hints = p.hints[f.id] || 0;
      if (first) {
        let g = boss ? 30 : 10; if (!hints) g += 5;
        core.save.gems += g;
        p.done[f.id] = { ts: Date.now(), sql: v, hints };
        core.persist();
        const gem = app.querySelector('.pill.gem b'); if (gem) gem.textContent = core.save.gems;
        core.unlock('dataia_start');
        if (f.id === 10) core.unlock('golem');
        if (arcDone(arc) && arc.id === 1) core.unlock('dataia_arc1');
        if (boss && !hints) core.unlock('no_hints');
      }
      core.confetti();
      typingThen(() => say(`<b>${boss ? S('victory') + ' ' : ''}</b>${esc(L(boss ? PIP.win : pick(PIP.right)))}${first ? `<small class="reward">+◆ ${boss ? 30 : 10}${!hints ? ' +5' : ''}</small>` : ''}`, 'pip_feliz'));
      const actions = q('.actions');
      const nb = document.createElement('button');
      nb.className = 'btn next glow'; nb.dataset.next = '1';
      nb.textContent = S('continueStory') + ' →';
      actions.insertBefore(nb, feedback);
      nb.onclick = () => { GameAudio.play('click'); onWin(); };
      q('[data-submit]').disabled = true;
    }

    q('[data-run]').onclick = doRun;
    q('[data-submit]').onclick = doSubmit;
    q('[data-tables]').onclick = () => { GameAudio.play('click'); openTab('schema'); };
    q('[data-grim]').onclick = () => { GameAudio.play('click'); PipGuide.grimoire(); };
    q('[data-restart]').onclick = () => {
      GameAudio.play('click');
      challenge(f, onWin, onBack);
      setTimeout(() => { const log = document.querySelector('.chat-log'); if (log) { const d = document.createElement('div'); d.className = 'msg her'; d.innerHTML = `<span class="pip-mini">;</span><div class="bubble">${esc(L(STR.restored))}</div>`; log.appendChild(d); } }, 30);
    };
    q('[data-lesson]').onclick = () => { GameAudio.play('click'); scene(f, f.aula, true, () => challenge(f, onWin, onBack), () => challenge(f, onWin, onBack)); };
    q('[data-hint]').onclick = () => {
      GameAudio.play('hint');
      const d = cur();
      say(esc(L(STR.askHint)), null, true);
      if (hintsShown < d.dicas.length) {
        hintsShown++;
        const p = prog(); p.hints[f.id] = (p.hints[f.id] || 0) + 1; core.persist();
        const n = hintsShown;
        q('[data-hint] small').textContent = d.dicas.length - n;
        typingThen(() => say(`<small class="hint-tag">💡 ${core.t('hintN', { n, total: d.dicas.length })}</small>${core.md(L(d.dicas[n - 1]))}`, 'pip_explicando'));
      } else {
        typingThen(() => {
          const div = say(`${esc(core.t('noMoreHints'))}<br><button class="btn soft sm" data-answer>${core.t('showAnswer')}</button>`, 'pip_explicando');
          div.querySelector('[data-answer]').onclick = () => {
            mode = 'editor'; editorText = d.gabarito[lg]; renderQueryBox();
            q('[data-rtab="exp"]').hidden = false;
            q('[data-rpane="exp"]').innerHTML = core.resultTable(core.runOn(dbFor(arc), d.gabarito[lg]));
            openTab('exp');
          };
        });
      }
    };

    say(`<b class="brief-title">${S('stage')} ${f.id} · ${esc(L(f.titulo))}</b><span class="brief-note">${esc(L(f.missao))}</span>`, 'pip_feliz');
    loadTurn();
    // Comandos que o jogador ainda não viu: o Pip entra na tela e explica.
    const tags = f.desafios.reduce((acc, d) => acc.concat(d.conceitos || []), [...f.conceitos]);
    setTimeout(() => PipGuide.introFor(tags, () => { const ta = q('.ed-ta'); if (ta) ta.focus(); }), 450);
  }

  window.Dataia = { showMap, playFase, Assets };
})();
