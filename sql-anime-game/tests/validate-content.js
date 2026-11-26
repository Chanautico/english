// Roda todas as soluções contra o banco e confere que funcionam e retornam linhas.
// Uso: npm test
const path = require('path');
const initSqlJs = require(path.join(__dirname, '..', 'src', 'vendor', 'sql-asm.js'));
global.window = {};
require('../src/js/db.js');
require('../src/js/content.js');

initSqlJs().then((SQL) => {
  const db = new SQL.Database();
  db.exec(window.GameDB.SEED_SQL);
  let fails = 0, count = 0;
  const ids = new Set();
  for (const m of window.Content.MODULES) {
    for (const c of m.challenges) {
      count++;
      if (ids.has(c.id)) { console.error('DUPLICATE id', c.id); fails++; }
      ids.add(c.id);
      try {
        const res = db.exec(c.solution);
        const rows = res[0] ? res[0].values.length : 0;
        if (!rows) { console.error('EMPTY', c.id); fails++; }
        if (process.argv.includes('-v')) console.log(c.id.padEnd(8), String(rows).padStart(3), 'rows |', JSON.stringify(res[0].values.slice(0, 6)));
        if (c.guided) {
          const blanks = (c.guided.template.match(/\[\]/g) || []).length;
          if (blanks > c.guided.pieces.length) { console.error('GUIDED too few pieces', c.id); fails++; }
        }
        if (c.hints.length !== 3) { console.error('HINTS != 3', c.id); fails++; }
      } catch (e) {
        console.error('ERROR', c.id, e.message); fails++;
      }
    }
  }
  console.log(`${count} challenges, ${fails} problem(s)`);
  process.exit(fails ? 1 : 0);
});
