// Guia do Pip: sempre que aparece um comando SQL novo, o Pip entra na tela e explica
// com uma mini-tabela animada. Depois que o jogador usa o comando pela primeira vez,
// o Pip comenta o que aconteceu com os números da consulta dele.
// Os textos e demonstrações vêm de data/comandos.json.
(function () {
  const C = () => window.Core;
  const L = (o) => I18N.L(o);
  const pt = () => I18N.lang === 'pt';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DATA = () => window.GAME_DATA.comandos;
  const cmds = () => DATA().comandos;

  function state() {
    const s = C().save;
    if (!s.pipguide) s.pipguide = { learned: {}, used: {} };
    return s.pipguide;
  }
  const byTag = (tag) => cmds().find((c) => c.tags.includes(tag));

  // Comandos (na ordem das etiquetas) que o jogador ainda não viu.
  function unlearned(tags) {
    const seen = new Set(), out = [];
    (tags || []).forEach((tg) => { const c = byTag(tg); if (c && !seen.has(c.id) && !state().learned[c.id]) { seen.add(c.id); out.push(c); } });
    return out;
  }

  // ─────────────────────────── Mini-tabela animada ───────────────────────────
  const ROW_H = 38;
  const cellV = (v) => (v === null ? null : typeof v === 'object' ? L(v) : v);
  const cellHtml = (v, ci) => `<span class="pg-cell ${v === null ? 'null' : typeof v === 'number' ? 'num' : ''}" data-col="${ci}">${v === null ? 'NULL' : esc(v)}</span>`;
  function demoTable(cmd) {
    const tb = cmd.demo.antes || DATA().tabela_demo;
    const after = cmd.demo.depois;
    const cols = tb.colunas.map(L);
    const rows = tb.linhas.map((r) => r.map(cellV));
    const maxRows = Math.max(rows.length, after ? after.linhas.length : 0);
    return `<div class="pg-table" style="height:${(maxRows + 1) * ROW_H + 8}px">
      <div class="pg-row pg-head">${cols.map((c, ci) => `<span class="pg-cell" data-col="${ci}">${esc(c)}</span>`).join('')}</div>
      ${rows.map((r, ri) => `<div class="pg-row" data-row="${ri}" style="top:${(ri + 1) * ROW_H}px">${r.map(cellHtml).join('')}</div>`).join('')}
      <div class="pg-scissor" hidden>✂</div>
    </div>`;
  }
  // "antes → depois": a tabela some e o resultado do comando aparece no lugar.
  function morphTo(box, d) {
    const table = box.querySelector('.pg-table');
    const head = table.querySelector('.pg-head');
    table.querySelectorAll('.pg-row[data-row]').forEach((r) => r.classList.add('out'));
    head.classList.add('swap');
    setTimeout(() => {
      head.innerHTML = d.depois.colunas.map((c, ci) => `<span class="pg-cell${(d.colnova || []).includes(ci) ? ' newcol' : ''}" data-col="${ci}">${esc(L(c))}</span>`).join('');
      head.classList.remove('swap');
      d.depois.linhas.forEach((r, ri) => {
        const el = document.createElement('div');
        el.className = 'pg-row pre res' + ((d.marcar || []).includes(ri) ? ' ' + (d.classe || 'nova') : '');
        el.style.top = (ri + 1) * ROW_H + 'px';
        el.innerHTML = r.map(cellV).map((v, ci) => cellHtml(v, ci).replace('pg-cell', 'pg-cell' + ((d.colnova || []).includes(ci) ? ' newcol' : ''))).join('');
        table.appendChild(el);
        setTimeout(() => el.classList.remove('pre'), 100 + ri * 140);
      });
    }, 500);
  }

  function runDemo(root, cmd) {
    const box = root.querySelector('.pg-demo-stage');
    box.innerHTML = demoTable(cmd);
    const rows = [...box.querySelectorAll('.pg-row[data-row]')];
    rows.forEach((r, i) => { r.classList.add('pre'); setTimeout(() => r.classList.remove('pre'), 120 + i * 110); });
    const d = cmd.demo, place = (list) => list.forEach((ri, k) => { rows[ri].style.top = (k + 1) * ROW_H + 'px'; });
    const t0 = 120 + rows.length * 110 + 900;
    clearTimeout(root._demoT);
    root._demoT = setTimeout(() => {
      box.classList.add('acting');
      if (d.op === 'keep') {
        rows.forEach((r, i) => r.classList.add(d.rows.includes(i) ? 'yes' : 'no'));
        setTimeout(() => { rows.forEach((r, i) => { if (!d.rows.includes(i)) r.classList.add('out'); }); place(d.rows); }, 900);
      } else if (d.op === 'hidecols') {
        box.querySelectorAll('.pg-cell').forEach((c) => { if (d.cols.includes(+c.dataset.col)) c.classList.add('gone'); });
      } else if (d.op === 'order') {
        rows.forEach((r) => r.classList.add('moving'));
        place(d.order);
        setTimeout(() => rows.forEach((r) => r.classList.remove('moving')), 900);
      } else if (d.op === 'cut') {
        const sc = box.querySelector('.pg-scissor'); sc.hidden = false; sc.style.top = (d.n + 1) * ROW_H - 2 + 'px';
        setTimeout(() => rows.forEach((r, i) => { if (i >= d.n) r.classList.add('out'); }), 700);
      } else if (d.op === 'result') {
        if (d.destacar) rows.forEach((r, i) => r.classList.add(d.destacar.includes(i) ? 'yes' : 'dimrow'));
        setTimeout(() => morphTo(box, d), d.destacar ? 900 : 0);
      } else {
        rows.forEach((r) => r.classList.add('yes'));
      }
      GameAudio.play('hint');
    }, t0);
  }

  // ─────────────────────────── Cartão "Novo comando!" ───────────────────────────
  function showIntro(list, onClose, opts) {
    if (!list || !list.length) { if (onClose) onClose(); return; }
    const core = C();
    let k = 0;
    const wrap = document.createElement('div');
    wrap.className = 'pg-wrap';
    document.body.appendChild(wrap);
    GameAudio.play('achievement');
    function render() {
      const cmd = list[k], last = k === list.length - 1;
      const exprs = ['explicando', 'feliz', 'alerta'];
      wrap.innerHTML = `
        <div class="pg-pip ${k === 0 ? 'fly' : 'hop'}">${FX.pip(exprs[k % exprs.length])}</div>
        <div class="pg-bubble">${k === 0
          ? (pt() ? `Pera aí, Ren! ${list.length > 1 ? `${list.length} comandos novos` : 'Comando novo'}! Deixa o Pip explicar!` : `Hold on, Ren! ${list.length > 1 ? `${list.length} new commands` : 'New command'}! Let Pip explain!`)
          : (pt() ? 'E tem mais!' : "And there's more!")}</div>
        <div class="pg-card" role="dialog" aria-label="${esc(L(cmd.titulo))}">
          <div class="pg-badge">✦ ${opts && opts.review ? (pt() ? 'GRIMÓRIO' : 'GRIMOIRE') : (pt() ? 'NOVO COMANDO' : 'NEW COMMAND')}${list.length > 1 ? ` · ${k + 1}/${list.length}` : ''}</div>
          <h2 class="pg-title"><code>${esc(L(cmd.titulo))}</code></h2>
          <p class="pg-sum">${esc(L(cmd.resumo))}</p>
          <pre class="pg-syntax">${core.highlight(L(cmd.sintaxe)).replace(/\n$/, '')}</pre>
          <div class="pg-demo">
            <div class="pg-demo-top"><span class="pg-live">● ${pt() ? 'AO VIVO' : 'LIVE'}</span><code class="pg-demo-code">${core.highlight(L(cmd.demo.codigo)).replace(/\n$/, '')}</code><button class="link pg-replay">↻ ${pt() ? 'ver de novo' : 'replay'}</button></div>
            <div class="pg-demo-stage"></div>
          </div>
          <p class="pg-tip">💡 ${esc(L(cmd.dica))}</p>
          <div class="pg-actions">
            ${list.length > 1 ? `<div class="pg-dots">${list.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</div>` : '<span></span>'}
            <button class="btn primary pg-next">${last ? (pt() ? 'Entendi! ✓' : 'Got it! ✓') : (pt() ? 'Próximo →' : 'Next →')}</button>
          </div>
        </div>`;
      runDemo(wrap, cmd);
      wrap.querySelector('.pg-replay').onclick = () => { GameAudio.play('click'); runDemo(wrap, cmd); };
      wrap.querySelector('.pg-next').onclick = () => {
        GameAudio.play('click');
        state().learned[cmd.id] = Date.now(); core.persist();
        if (!last) { k++; render(); return; }
        close();
      };
      setTimeout(() => { const b = wrap.querySelector('.pg-next'); if (b) b.focus(); }, 50);
    }
    function close() {
      clearTimeout(wrap._demoT);
      document.removeEventListener('keydown', onKey, true);
      wrap.classList.add('leaving');
      setTimeout(() => { wrap.remove(); if (onClose) onClose(); }, 350);
    }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); list.forEach((c) => { state().learned[c.id] = Date.now(); }); core.persist(); close(); } }
    document.addEventListener('keydown', onKey, true);
    render();
  }

  // Mostra os comandos novos destas etiquetas (se houver).
  function introFor(tags, onClose) { showIntro(unlearned(tags), onClose); }

  // ─────────────────────────── Depois de rodar pela primeira vez ───────────────────────────
  const DETECT = {
    select: /\bSELECT\b/i, from: /\bFROM\b/i, star: /\bSELECT\s+(DISTINCT\s+)?\*/i, colunas: /\bSELECT\s+(DISTINCT\s+)?(?!\*)[A-Za-z_]/i,
    where: /\bWHERE\b/i, comparadores: /(<=|>=|!=|<>|<|>)/, like: /\bLIKE\b/i, and: /\bAND\b/i, or: /\bOR\b/i,
    parenteses: /\bWHERE\b[^;]*\(/i, orderby: /\bORDER\s+BY\b/i, limit: /\bLIMIT\b/i, isnull: /\bIS\s+(NOT\s+)?NULL\b/i,
    distinct: /\bDISTINCT\b/i, count: /\bCOUNT\s*\(/i, sum: /\bSUM\s*\(/i, avg: /\bAVG\s*\(/i, minmax: /\b(MIN|MAX)\s*\(/i,
    groupby: /\bGROUP\s+BY\b/i, having: /\bHAVING\b/i, alias: /\bAS\s+[A-Za-z_]/i,
    join: /\b(INNER\s+)?JOIN\b/i, leftjoin: /\bLEFT\s+(OUTER\s+)?JOIN\b/i, rightjoin: /\bRIGHT\s+(OUTER\s+)?JOIN\b/i,
    subquery: /\(\s*SELECT\b/i, in: /\bIN\s*\(/i, notin: /\bNOT\s+IN\s*\(/i, exists: /\bEXISTS\s*\(/i, case: /\bCASE\b/i,
    union: /\bUNION\b(?!\s+ALL)/i, unionall: /\bUNION\s+ALL\b/i,
    insert: /\bINSERT\s+INTO\b/i, update: /\bUPDATE\b/i, delete: /\bDELETE\s+FROM\b/i, transacao: /\bBEGIN\b/i, rollback: /\bROLLBACK\b/i, commit: /\bCOMMIT\b/i,
    insertselect: /\bINSERT\s+INTO\b[^;]*\bSELECT\b/i, createtable: /\bCREATE\s+TABLE\b/i, altertable: /\bALTER\s+TABLE\b/i,
    createindex: /\bCREATE\s+(UNIQUE\s+)?INDEX\b/i, createview: /\bCREATE\s+VIEW\b/i, droptable: /\bDROP\s+TABLE\b/i, fk: /\b(REFERENCES|FOREIGN\s+KEY)\b/i,
  };
  // Tira textos entre aspas e comentários antes de procurar comandos.
  const clean = (q) => q.replace(/'(?:[^']|'')*'/g, "''").replace(/--[^\n]*/g, '');

  function afterRun(query, result, ctx) {
    if (!result || !result.ok) return;
    const st = state(), q = clean(query);
    const fresh = cmds().filter((c) => DETECT[c.id] && DETECT[c.id].test(q) && !st.used[c.id]);
    if (!fresh.length) return;
    fresh.forEach((c) => { st.used[c.id] = Date.now(); });
    C().persist();
    const tm = q.match(/\b(?:FROM|INTO|UPDATE|TABLE|VIEW|ON)\s+([A-Za-z_]\w*)/i), tabela = tm ? tm[1] : '?';
    let total = '?';
    if (tm && ctx && ctx.count) { const r = ctx.count(`SELECT COUNT(*) FROM ${tabela}`); if (r && r.ok && r.values[0]) total = r.values[0][0]; }
    const lm = q.match(/\bLIMIT\s+(\d+)/i), om = q.match(/\bORDER\s+BY\s+([A-Za-z_][\w.]*)/i);
    const vars = { linhas: result.values.length, colunas: result.columns.length, tabela, total, n: lm ? lm[1] : result.values.length, coluna: om ? om[1] : '?' };
    const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));
    const shown = fresh.slice(-3);
    const lines = shown.map((c) => `<li><code>${esc(L(c.titulo))}</code> ${esc(fill(L(c.apos)))}</li>`).join('');
    const title = pt() ? `Primeira vez usando ${shown.map((c) => L(c.titulo)).join(' + ')}!` : `First time using ${shown.map((c) => L(c.titulo)).join(' + ')}!`;
    popup(`<b>✦ ${esc(title)}</b><ul>${lines}</ul>`);
    if (ctx && ctx.say) ctx.say(`<b>✦ ${esc(title)}</b><ul class="pg-list">${lines}</ul>`);
  }

  function popup(html) {
    const old = document.querySelector('.pg-pop'); if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'pg-pop';
    el.innerHTML = `<div class="pg-pop-pip">${FX.pip('feliz')}</div><div class="pg-pop-bubble">${html}<small>${pt() ? 'clique para fechar' : 'click to close'}</small></div>`;
    document.body.appendChild(el);
    GameAudio.play('hint');
    const close = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 350); };
    el.onclick = close;
    setTimeout(close, 9000);
  }

  // ─────────────────────────── Grimório (comandos aprendidos) ───────────────────────────
  function grimoire() {
    const core = C(), st = state();
    const all = cmds();
    const m = core.modal(`<h2>📘 ${pt() ? 'Grimório do Pip' : "Pip's Grimoire"} <small class="muted">${Object.keys(st.learned).length}/${all.length}</small></h2>
      <p class="muted small">${pt() ? 'Todos os comandos que você já aprendeu. Clique para rever a explicação animada.' : 'Every command you have learned. Click one to replay its animated explanation.'}</p>
      <div class="grim-grid">${all.map((c) => st.learned[c.id]
        ? `<button class="grim-card" data-cmd="${c.id}"><code>${esc(L(c.titulo))}</code><small>${esc(L(c.resumo))}</small></button>`
        : `<div class="grim-card locked"><code>???</code><small>${pt() ? 'Ainda não descoberto' : 'Not discovered yet'}</small></div>`).join('')}</div>
      <div class="modal-actions"><button class="btn primary" data-close>${core.t('close')}</button></div>`);
    m.el.querySelectorAll('[data-cmd]').forEach((b) => b.onclick = () => { m.close(); showIntro([all.find((c) => c.id === b.dataset.cmd)], null, { review: true }); });
  }

  window.PipGuide = { unlearned, showIntro, introFor, afterRun, grimoire, DETECT };
})();
