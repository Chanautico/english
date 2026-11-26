// Banco de dados de treino: o Festival Escolar da Academia Hoshizora.
// Tudo é determinístico (mesmos dados em toda execução) para que as respostas
// possam ser verificadas comparando com a consulta de referência.
(function () {
  const clubs = [
    [1, 'Computer Club', 'R-301', 12000],
    [2, 'Cooking Club', 'Kitchen', 9000],
    [3, 'Light Music Club', 'Music Room', 15000],
    [4, 'Art Club', 'R-204', 7000],
    [5, 'Drama Club', 'Auditorium', 11000],
    [6, 'Tea Ceremony Club', 'Tatami Room', 5000],
    [7, 'Astronomy Club', 'Rooftop', 6000],
    [8, 'Photography Club', 'R-105', 4000],
  ];

  // student_id, name, class, year, club_id, email, birthday
  const students = [
    [1, 'Aoi Tanaka', '1-A', 1, 1, 'aoi.t@hoshizora.edu', '2010-04-12'],
    [2, 'Ren Sato', '1-A', 1, 3, 'ren.s@hoshizora.edu', '2010-07-02'],
    [3, 'Yui Nakamura', '1-B', 1, 2, 'yui.n@hoshizora.edu', '2010-11-23'],
    [4, 'Haruto Ito', '1-B', 1, null, null, '2010-01-30'],
    [5, 'Mei Kobayashi', '1-A', 1, 4, 'mei.k@hoshizora.edu', '2010-09-09'],
    [6, 'Sora Watanabe', '2-A', 2, 1, 'sora.w@hoshizora.edu', '2009-05-17'],
    [7, 'Riku Yamamoto', '2-A', 2, 5, 'riku.y@hoshizora.edu', '2009-12-01'],
    [8, 'Hina Suzuki', '2-B', 2, 3, 'hina.s@hoshizora.edu', '2009-03-14'],
    [9, 'Kaito Kato', '2-B', 2, 7, null, '2009-08-21'],
    [10, 'Saki Yoshida', '2-A', 2, 6, 'saki.y@hoshizora.edu', '2009-04-01'],
    [11, 'Yuto Yamada', '3-A', 3, 5, 'yuto.y@hoshizora.edu', '2008-06-06'],
    [12, 'Akari Sasaki', '3-A', 3, 2, 'akari.s@hoshizora.edu', '2008-02-28'],
    [13, 'Sota Yamaguchi', '3-B', 3, 1, 'sota.y@hoshizora.edu', '2008-10-10'],
    [14, 'Koharu Matsumoto', '3-B', 3, 4, 'koharu.m@hoshizora.edu', '2008-12-24'],
    [15, 'Minato Inoue', '1-B', 1, 3, 'minato.i@hoshizora.edu', '2010-03-03'],
    [16, 'Tsumugi Kimura', '2-B', 2, 2, 'tsumugi.k@hoshizora.edu', '2009-01-19'],
    [17, 'Itsuki Hayashi', '3-A', 3, null, 'itsuki.h@hoshizora.edu', '2008-07-07'],
    [18, 'Rin Shimizu', '1-A', 1, 7, 'rin.s@hoshizora.edu', '2010-08-15'],
    [19, 'Daiki Yamazaki', '2-A', 2, 5, null, '2009-11-11'],
    [20, 'Hinata Mori', '3-B', 3, 6, 'hinata.m@hoshizora.edu', '2008-05-05'],
    [21, 'Kenta Abe', '1-B', 1, 1, 'kenta.a@hoshizora.edu', '2010-02-14'],
    [22, 'Mio Ikeda', '2-B', 2, 4, 'mio.i@hoshizora.edu', '2009-09-30'],
    [23, 'Takumi Hashimoto', '3-A', 3, 3, 'takumi.h@hoshizora.edu', '2008-01-08'],
    [24, 'Ema Ishikawa', '1-A', 1, 2, 'ema.i@hoshizora.edu', '2010-06-20'],
    [25, 'Shota Ogawa', '2-A', 2, null, null, '2009-10-31'],
    [26, 'Nanami Okada', '3-B', 3, 5, 'nanami.o@hoshizora.edu', '2008-03-21'],
    [27, 'Yuma Goto', '1-B', 1, 7, 'yuma.g@hoshizora.edu', '2010-12-12'],
    [28, 'Chihiro Hasegawa', '2-B', 2, 1, 'chihiro.h@hoshizora.edu', '2009-07-25'],
    [29, 'Kanon Murakami', '3-A', 3, 6, 'kanon.m@hoshizora.edu', '2008-09-18'],
    [30, 'Asahi Kondo', '1-A', 1, 3, 'asahi.k@hoshizora.edu', '2010-05-29'],
  ];

  // stall_id, name, club_id, category, price
  const stalls = [
    [1, 'Takoyaki Stand', 2, 'food', 6.5],
    [2, 'Maid Cafe', 2, 'food', 12.0],
    [3, 'Retro Arcade', 1, 'game', 3.0],
    [4, 'Robot Battle', 1, 'game', 4.5],
    [5, 'Live Concert', 3, 'show', 8.0],
    [6, 'Acoustic Corner', 3, 'show', 5.0],
    [7, 'Gallery of Dreams', 4, 'art', 2.0],
    [8, 'Haunted House', 5, 'game', 5.5],
    [9, 'Romeo and Juliet Remix', 5, 'show', 7.0],
    [10, 'Matcha House', 6, 'food', 9.0],
    [11, 'Planetarium', 7, 'show', 6.0],
    [12, 'Crepe Cart', null, 'food', 7.5],
  ];

  // Gerador pseudoaleatório com semente fixa (mulberry32).
  let seed = 20261017;
  function rand() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const sellingStalls = stalls.filter((s) => s[0] !== 7); // a galeria não vendeu nada :(
  const weights = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 4, 6: 1, 8: 4, 9: 2, 10: 2, 11: 3, 12: 3 };
  const bag = [];
  sellingStalls.forEach((s) => { for (let i = 0; i < weights[s[0]]; i++) bag.push(s); });

  const sales = [];
  for (let id = 1; id <= 90; id++) {
    const st = bag[Math.floor(rand() * bag.length)];
    const qty = 1 + Math.floor(rand() * 4);
    const visitor = rand() < 0.3;
    const studentId = visitor ? null : 1 + Math.floor(rand() * 30);
    const day = rand() < 0.45 ? '2026-10-17' : '2026-10-18';
    const total = Math.round(qty * st[4] * 100) / 100;
    sales.push([id, st[0], studentId, qty, total, day]);
  }

  const q = (v) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");
  const rows = (arr) => arr.map((r) => '(' + r.map(q).join(', ') + ')').join(',\n');

  const SEED_SQL = `
CREATE TABLE clubs (
  club_id INTEGER PRIMARY KEY,
  name    VARCHAR NOT NULL,
  room    VARCHAR,
  budget  INTEGER
);
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  name       VARCHAR NOT NULL,
  class      VARCHAR,
  year       INTEGER,
  club_id    INTEGER REFERENCES clubs(club_id),
  email      VARCHAR,
  birthday   DATE
);
CREATE TABLE stalls (
  stall_id INTEGER PRIMARY KEY,
  name     VARCHAR NOT NULL,
  club_id  INTEGER REFERENCES clubs(club_id),
  category VARCHAR,
  price    DOUBLE
);
CREATE TABLE sales (
  sale_id    INTEGER PRIMARY KEY,
  stall_id   INTEGER REFERENCES stalls(stall_id),
  student_id INTEGER REFERENCES students(student_id),
  qty        INTEGER,
  total      DOUBLE,
  sold_on    DATE
);
INSERT INTO clubs VALUES
${rows(clubs)};
INSERT INTO students VALUES
${rows(students)};
INSERT INTO stalls VALUES
${rows(stalls)};
INSERT INTO sales VALUES
${rows(sales)};
`;

  // Descrição do esquema para o painel lateral (texto em PT e EN).
  const SCHEMA = [
    {
      table: 'students',
      desc: { pt: 'Um aluno por linha. club_id NULL = não entrou em nenhum clube. Alguns não têm e-mail.', en: 'One student per row. club_id NULL = not in any club. Some have no email.' },
      cols: [
        ['student_id', 'INTEGER', { pt: 'chave primária', en: 'primary key' }],
        ['name', 'VARCHAR', null],
        ['class', 'VARCHAR', { pt: "'1-A', '1-B', '2-A'...", en: "'1-A', '1-B', '2-A'..." }],
        ['year', 'INTEGER', { pt: '1, 2 ou 3', en: '1, 2 or 3' }],
        ['club_id', 'INTEGER', { pt: '→ clubs (pode ser NULL)', en: '→ clubs (may be NULL)' }],
        ['email', 'VARCHAR', { pt: 'pode ser NULL', en: 'may be NULL' }],
        ['birthday', 'DATE', null],
      ],
    },
    {
      table: 'clubs',
      desc: { pt: 'Os clubes da escola e o orçamento de cada um para o festival.', en: 'School clubs and their festival budget.' },
      cols: [
        ['club_id', 'INTEGER', { pt: 'chave primária', en: 'primary key' }],
        ['name', 'VARCHAR', null],
        ['room', 'VARCHAR', null],
        ['budget', 'INTEGER', { pt: 'orçamento em ¥ (mil)', en: 'budget in ¥ (thousands)' }],
      ],
    },
    {
      table: 'stalls',
      desc: { pt: 'Barracas do festival. club_id NULL = patrocinador externo.', en: 'Festival stalls. club_id NULL = outside sponsor.' },
      cols: [
        ['stall_id', 'INTEGER', { pt: 'chave primária', en: 'primary key' }],
        ['name', 'VARCHAR', null],
        ['club_id', 'INTEGER', { pt: '→ clubs (pode ser NULL)', en: '→ clubs (may be NULL)' }],
        ['category', 'VARCHAR', { pt: "'food' | 'game' | 'show' | 'art'", en: "'food' | 'game' | 'show' | 'art'" }],
        ['price', 'DOUBLE', { pt: 'preço do ingresso/item', en: 'ticket/item price' }],
      ],
    },
    {
      table: 'sales',
      desc: { pt: 'Cada venda feita nos 2 dias de festival. student_id NULL = visitante de fora.', en: 'Every sale over the 2 festival days. student_id NULL = outside visitor.' },
      cols: [
        ['sale_id', 'INTEGER', { pt: 'chave primária', en: 'primary key' }],
        ['stall_id', 'INTEGER', { pt: '→ stalls', en: '→ stalls' }],
        ['student_id', 'INTEGER', { pt: '→ students (pode ser NULL)', en: '→ students (may be NULL)' }],
        ['qty', 'INTEGER', { pt: 'quantidade', en: 'quantity' }],
        ['total', 'DOUBLE', { pt: 'qty × price', en: 'qty × price' }],
        ['sold_on', 'DATE', { pt: "'2026-10-17' ou '2026-10-18'", en: "'2026-10-17' or '2026-10-18'" }],
      ],
    },
  ];

  window.GameDB = { SEED_SQL, SCHEMA };
})();
