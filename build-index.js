const fs = require('fs');
const path = require('path');

const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const folders = fs.readdirSync('.', { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && fs.existsSync(path.join(entry.name, 'index.html')))
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'ru'));
const label = slug => slug.replace(/-/g, ' ').replace(/^./, first => first.toLocaleUpperCase('ru'));
const items = folders.map(slug => `      <li><a href="${encodeURIComponent(slug)}/">${escapeHtml(label(slug))}</a></li>`).join('\n');
const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Демо-сайты автосервисов</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; }
    body { margin: 0; background: #f5f6f3; color: #202720; }
    main { max-width: 760px; margin: 0 auto; padding: 48px 20px 72px; }
    h1 { margin: 0 0 28px; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; }
    ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 12px; padding: 0; margin: 0; }
    a { display: block; padding: 18px 20px; border-radius: 14px; background: #fff; color: #174d38; text-decoration: none; box-shadow: 0 2px 12px #1b32210d; }
    a:hover, a:focus-visible { background: #e8f2eb; outline: 2px solid #27734d; outline-offset: 2px; }
  </style>
</head>
<body>
  <main>
    <h1>Демо-сайты автосервисов</h1>
    <ul>
${items}
    </ul>
  </main>
</body>
</html>
`;
fs.writeFileSync('index.html', html, 'utf8');
console.log(`Добавлено ссылок: ${folders.length}`);
