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
        const db = dbs[f.arco + l];
        try {
          const r = db.exec(d.gabarito[l]);
          if (!r.length || !r[0].values.length) err(tag, l, 'gabarito sem linhas');
          else shape[l] = [r[0].columns.length, r[0].values.length];
          if (process.argv.includes('-v')) console.log(tag.padEnd(10), l, JSON.stringify(r[0] && r[0].values.slice(0, 4)));
        } catch (e) { err(tag, l, e.message); }
        if (d.guiado) {
          const g = d.guiado[l];
          if (!g) err(tag, 'guiado sem', l);
          else if ((g.modelo.match(/\[\]/g) || []).length > g.pecas.length) err(tag, l, 'peças insuficientes');
        }
        if (!d.enunciado[l]) err(tag, 'enunciado sem', l);
      }
      if (shape.pt && shape.en && String(shape.pt) !== String(shape.en)) err(tag, 'PT e EN diferentes', shape.pt, shape.en);
    });
  }
  console.log(`Dataia: ${fases.length} fases, ${n} desafios, ${fails} problema(s)`);
  process.exit(fails ? 1 : 0);
});
