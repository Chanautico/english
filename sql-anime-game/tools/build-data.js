// Monta os dados do modo história (data/*.json) em src/js/data.bundle.js,
// que o jogo carrega. Também gera docs/ASSETS.md com a lista de imagens.
// Rodado automaticamente por `npm start` e `npm test`.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const LANGS = ['pt', 'en'];

const elenco = read('data/elenco.json');
const comandos = read('data/comandos.json');
const arcos = fs.readdirSync(path.join(root, 'data/arcos')).filter((f) => f.endsWith('.json')).sort().map((f) => read('data/arcos/' + f));
const fases = fs.readdirSync(path.join(root, 'data/fases')).filter((f) => f.endsWith('.json')).sort().map((f) => read('data/fases/' + f));

const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);
const sqlVal = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");

// Gera o SQL de criação do banco de um arco num idioma.
function setupSql(arco, lang) {
  return arco.tabelas.map((tb) => {
    const name = pick(tb.nome, lang);
    const cols = tb.colunas.map((c, i) => {
      const cn = pick(c.nome, lang);
      return `  ${cn} ${c.tipo}${i === 0 && cn === 'id' ? ' PRIMARY KEY' : ''}`;
    });
    const rows = tb.linhas.map((r) => '(' + r.map((v) => sqlVal(pick(v, lang))).join(', ') + ')');
    return `CREATE TABLE ${name} (\n${cols.join(',\n')}\n);\n` + (rows.length ? `INSERT INTO ${name} VALUES\n${rows.join(',\n')};\n` : '');
  }).join('\n');
}

const bundle = {
  elenco,
  comandos,
  arcos: arcos.map((a) => ({ ...a, setup: Object.fromEntries(LANGS.map((l) => [l, setupSql(a, l)])) })),
  fases,
};
fs.writeFileSync(path.join(root, 'src/js/data.bundle.js'),
  '// ARQUIVO GERADO por tools/build-data.js a partir de data/. Não edite à mão.\nwindow.GAME_DATA = ' + JSON.stringify(bundle) + ';\n');

// ── Lista de imagens (sprites e cenários) ──
const sprites = new Set(), bgs = new Set();
for (const a of arcos) bgs.add(a.capa);
for (const f of fases) {
  bgs.add(f.cenario);
  for (const k of ['historia_antes', 'aula', 'historia_depois']) (f[k] || []).forEach((x) => x.sprite && sprites.add(x.sprite));
  if (f.chefe) sprites.add(f.chefe.sprite);
}
// Elenco completo do roteiro (mesmo os que ainda não aparecem em fases prontas).
['ren_neutro', 'ren_confiante', 'ren_surpreso', 'ren_focado', 'ren_derrotado', 'pip_feliz', 'pip_alerta', 'pip_erro', 'pip_explicando',
  'kael_neutro', 'kael_bravo', 'kael_orgulhoso', 'lyra_seria', 'lyra_arrogante', 'lyra_surpresa', 'lyra_sorrindo', 'dante_relaxado', 'dante_serio',
  'vex_sombrio', 'vex_furioso', 'malform_calmo', 'malform_transcendente'].forEach((s) => sprites.add(s));
['bg_vila_arquivo', 'bg_floresta_cristal', 'bg_estrada_capital', 'bg_portao_capital', 'bg_arena_exame', 'bg_biblioteca_grande', 'bg_porto_nevoa',
  'bg_taverna_pirata', 'bg_subterraneo_porto', 'bg_floresta_morta', 'bg_fortaleza_obsidian', 'bg_sala_espelhos', 'bg_capital_chamas',
  'bg_santuario_dados', 'bg_torre_central', 'bg_nucleo_dataia', 'bg_vazio_branco', 'bg_capital_renovada'].forEach((b) => bgs.add(b));

const has = (dir, name) => ['png', 'webp', 'jpg'].some((ext) => fs.existsSync(path.join(root, 'src/assets', dir, `${name}.${ext}`)));
const line = (dir, n) => `- [${has(dir, n) ? 'x' : ' '}] \`src/assets/${dir}/${n}.png\``;
fs.writeFileSync(path.join(root, 'docs/ASSETS.md'), `# Imagens do modo história (Crônicas de Dataia)

Coloque cada imagem na pasta indicada com **exatamente este nome** (\`.png\`, \`.webp\` ou \`.jpg\`).
O jogo troca a caixa provisória pela imagem sozinho — não precisa mexer em código.
Esta lista é gerada por \`npm run build:data\` e marca [x] o que já existe.

**Sprites** (personagem de corpo inteiro ou meio corpo, fundo transparente, ~900×1400):

${[...sprites].sort().map((s) => line('sprites', s)).join('\n')}

**Cenários** (paisagem 16:9, ~1920×1080):

${[...bgs].sort().map((b) => line('bg', b)).join('\n')}
`);

console.log(`data.bundle.js: ${arcos.length} arcos, ${fases.length} fases · ASSETS.md: ${sprites.size} sprites, ${bgs.size} cenários`);
