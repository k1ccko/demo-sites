const fs = require('fs');
const path = require('path');
const { parse } = require('./site-csv');

const newSlugs = new Set('kuzov-pro mekhanik-luga avtomaks-luga remservis-luga avtotehtsentr-luga lav-luga arkadis-luga novoe-zaklinye att-servis-vn avtoelektrik53-vn garage-vn svoy-mekhanik-vn nanino-volhovets professional-vn mayak-vn iks-avto gs-servis'.split(' '));
const names = new Map(parse(fs.readFileSync('businesses.csv', 'utf8')).map(row => [row.slug, row.name]));
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const folders = fs.readdirSync('.', { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && fs.existsSync(path.join(entry.name, 'index.html')))
  .map(entry => entry.name);
const sort = items => items.sort((a, b) => (names.get(a) || a).localeCompare(names.get(b) || b, 'ru'));
const groups = [
  ['Новые сайты', sort(folders.filter(slug => newSlugs.has(slug)))],
  ['Старые сайты', sort(folders.filter(slug => !newSlugs.has(slug)))],
];
const section = ([title, slugs]) => `    <section aria-label="${title}">
      <h2>${title} <span>${slugs.length}</span></h2>
      <ul>
${slugs.map(slug => `        <li><a href="${encodeURIComponent(slug)}/">${escapeHtml(names.get(slug) || slug.replace(/-/g, ' '))}</a></li>`).join('\n')}
      </ul>
    </section>`;

const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Демо-сайты автосервисов</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f5f6f3; color: #202720; }
    main { max-width: 860px; margin: 0 auto; padding: 48px 20px 72px; }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; }
    .intro { margin: 0 0 36px; color: #536256; }
    section + section { margin-top: 40px; }
    h2 { display: flex; align-items: baseline; gap: 12px; margin: 0 0 16px; font-size: 1.35rem; }
    h2 span { color: #64746a; font-size: .9rem; font-weight: 500; }
    ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 12px; padding: 0; margin: 0; }
    a { display: block; height: 100%; padding: 18px 20px; border-radius: 14px; background: #fff; color: #174d38; text-decoration: none; box-shadow: 0 2px 12px #1b32210d; }
    a:hover, a:focus-visible { background: #e8f2eb; outline: 2px solid #27734d; outline-offset: 2px; }
  </style>
</head>
<body>
  <main>
    <h1>Демо-сайты автосервисов</h1>
    <p class="intro">Демо-концепт, не официальный сайт</p>
${groups.map(section).join('\n')}
  </main>
</body>
</html>
`;
fs.writeFileSync('index.html', html, 'utf8');
console.log(`Добавлено ссылок: ${folders.length} (новые: ${groups[0][1].length}, старые: ${groups[1][1].length})`);
