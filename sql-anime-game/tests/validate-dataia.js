// Confere todas as fases do modo história nos dois idiomas.
// - o gabarito roda e retorna linhas;
// - PT e EN retornam o mesmo número de linhas e colunas (tradução consistente);
// - 3 dicas, falas com pt/en, sprites de personagens conhecidos, peças do modo guiado suficientes.
const path = require('path');
const initSqlJs = require(path.join(__dirname, '..', 'src', 'vendor', 'sql-asm.js'));
global.window = {};
require('../src/js/data.bundle.js');
const { elenco, arcos, fases } = window.GAME_DATA;
// Efeitos de cena válidos (iguais aos de src/js/fx.js).
const EFFECTS = ['tremor', 'flash', 'relampago', 'escuridao', 'luz', 'cristais', 'dados', 'glitch', 'impacto', 'veneno', 'corte', 'desmoronar'];

initSqlJs().then((SQL) => {
  let fails = 0, n = 0;
  const err = (...a) => { console.error('✗', ...a); fails++; };
  const dbs = {};
  for (const a of arcos) for (const l of ['pt', 'en']) {
    if (!a.tabelas.length) continue;
    try { const d = new SQL.Database(); d.exec(a.setup[l]); dbs[a.id + l] = d; } catch (e) { err(`arco ${a.id} ${l}: setup`, e.message); }
  }
  const ids = new Set();
  for (const f of fases) {
    if (ids.has(f.id)) err('fase duplicada', f.id); ids.add(f.id);
    for (const k of ['titulo', 'missao']) if (!f[k] || !f[k].pt || !f[k].en) err(`fase ${f.id}: ${k} sem pt/en`);
    for (const k of ['historia_antes', 'aula', 'historia_depois']) (f[k] || []).forEach((x, i) => {
      if (!x.pt || !x.en) err(`fase ${f.id} ${k}[${i}]: fala sem pt/en`);
      if (x.sprite && !elenco[x.sprite.split('_')[0]]) err(`fase ${f.id}: sprite desconhecido ${x.sprite}`);
      [].concat(x.entra || []).forEach((s) => { if (!elenco[s.split('_')[0]]) err(`fase ${f.id}: entra desconhecido ${s}`); });
      [].concat(x.efeito || []).forEach((e) => { if (!EFFECTS.includes(e)) err(`fase ${f.id}: efeito desconhecido ${e}`); });
    });
    f.desafios.forEach((d, di) => {
      n++;
      const tag = `fase ${f.id}.${di + 1}`;
      if (d.dicas.length !== 3) err(tag, 'precisa de 3 dicas');
      const shape = {};
      for (const l of ['pt', 'en']) {
        const arco = arcos.find((a) => a.id === f.arco);
        // Roda num banco novo: preparo → SQL → verificações (igual ao jogo).
        const run = (sql) => {
          const db = new SQL.Database(); db.exec(arco.setup[l]);
          try {
            if (d.preparo) db.exec(d.preparo[l]);
            const r = db.exec(sql);
            const checks = [].concat(d.verificar || []).map((v) => { try { const x = db.exec(v[l]); return x.length ? x[x.length - 1] : { columns: [], values: [] }; } catch (e) { return { columns: [], values: [['ERRO: ' + e.message]] }; } });
            return { r, checks };
          } finally { db.close(); }
        };
        try {
          const { r, checks } = run(d.gabarito[l]);
          checks.forEach((c) => { if (String((c.values[0] || [])[0]).startsWith('ERRO: ')) err(tag, l, 'verificação falhou no gabarito', c.values[0][0]); });
          if (d.verificar) {
            if (!checks.length) err(tag, l, 'verificar vazio');
            shape[l] = checks.map((c) => [c.columns.length, c.values.length].join('x')).join('|');
            // Não fazer nada não pode passar como resposta (a não ser que a missão exija um comando específico).
            const idle = run('SELECT 1');
            const same = JSON.stringify(idle.checks.map((c) => c.values)) === JSON.stringify(checks.map((c) => c.values));
            if (same && !(d.exige && d.exige.length)) err(tag, l, 'não fazer nada passaria como resposta');
            if (process.argv.includes('-v')) console.log(tag.padEnd(10), l, 'estado', JSON.stringify(checks[0].values.slice(0, 4)));
          } else {
            const last = r[r.length - 1];
            if (!last || !last.values.length) err(tag, l, 'gabarito sem linhas');
            else shape[l] = [last.columns.length, last.values.length].join('x');
            if (process.argv.includes('-v')) console.log(tag.padEnd(10), l, JSON.stringify(last && last.values.slice(0, 4)));
          }
          for (const kw of d.exige || []) if (!new RegExp('\\b' + kw.replace(/\s+/g, '\\s+') + '\\b', 'i').test(d.gabarito[l])) err(tag, l, 'gabarito não usa o comando exigido', kw);
        } catch (e) { err(tag, l, e.message); }
        if (f.chefe && f.chefe.hp !== f.desafios.length) err(tag, 'hp do chefe diferente do número de turnos');
        if (d.guiado) {
          const g = d.guiado[l];
          if (!g) err(tag, 'guiado sem', l);
          else if ((g.modelo.match(/\[\]/g) || []).length > g.pecas.length) err(tag, l, 'peças insuficientes');
        }
        if (!d.enunciado[l]) err(tag, 'enunciado sem', l);
      }
      if (shape.pt && shape.en && shape.pt !== shape.en) err(tag, 'PT e EN diferentes', shape.pt, shape.en);
    });
  }
  // Dicionário de comandos do Pip: cada etiqueta das fases tem explicação, e as demonstrações são válidas.
  const { comandos, tabela_demo } = window.GAME_DATA.comandos;
  const tagOk = (tg) => comandos.some((c) => c.tags.includes(tg));
  for (const f of fases) for (const tg of f.conceitos) if (!tagOk(tg)) err(`fase ${f.id}: comando sem explicação do Pip: ${tg}`);
  const nRows = tabela_demo.linhas.length, nCols = tabela_demo.colunas.length;
  for (const c of comandos) {
    for (const k of ['titulo', 'resumo', 'sintaxe', 'dica', 'apos']) if (!c[k] || !c[k].pt || !c[k].en) err(`comando ${c.id}: ${k} sem pt/en`);
    const d = c.demo;
    if (d.op === 'keep' && d.rows.some((r) => r >= nRows)) err(`comando ${c.id}: demo com linha inexistente`);
    if (d.op === 'order' && [...d.order].sort().join() !== [...Array(nRows).keys()].join()) err(`comando ${c.id}: ordem precisa ter todas as linhas`);
    if (d.op === 'hidecols' && d.cols.some((x) => x >= nCols)) err(`comando ${c.id}: coluna inexistente`);
  }
  console.log(`Dataia: ${fases.length} fases, ${n} desafios, ${comandos.length} comandos do Pip, ${fails} problema(s)`);
  process.exit(fails ? 1 : 0);
});
