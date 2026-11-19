const fs = require('fs');
const { parse } = require('./site-csv');
const slugs = new Set('dynamika mitsubishi imperiya-masel avtoservis-dlya-inomarok avtoholl-servis avtomarket-1-hyundai alyaska quattro60 izumrud servisnyy-centr avtomasterskaya-1'.split(' '));
let updated = 0;
for (const row of parse(fs.readFileSync('businesses.csv', 'utf8'))) {
  if (!slugs.has(row.slug)) continue;
  const file = row.slug + '/index.html';
  const address = row.address.trim();
  if (!address) throw new Error(`${row.slug}: адрес отсутствует в CSV`);
  const fullAddress = /Калининград|Псков/i.test(address) ? address : `${address}, Псков`;
  let html = fs.readFileSync(file, 'utf8');
  const iframe = `<iframe src="https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(fullAddress)}&amp;z=16" width="100%" height="400" frameborder="0" class="rounded-2xl shadow-sm" loading="lazy" title="Карта: ${row.name.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"></iframe>`;
  const section = /(<section id="contacts"[\s\S]*?<\/address>[\s\S]*?<\/div>)([\s\S]*?)(<\/div><\/section>)/;
  if (!section.test(html)) throw new Error(`${row.slug}: блок контактов не найден`);
  html = html.replace(section, (_, left, middle, end) => left + '\n      ' + iframe + '\n    ' + end);
  fs.writeFileSync(file, html, 'utf8');
  updated++;
  console.log(`OK ${row.slug}`);
}
console.log(`Карт добавлено: ${updated}`);
