const fs=require('fs');
const {parse}=require('./site-csv.js');
const slugs=new Set('dynamika mitsubishi imperiya-masel avtoservis-dlya-inomarok avtoholl-servis avtomarket-1-hyundai alyaska quattro60 izumrud servisnyy-centr avtomasterskaya-1'.split(' '));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
for(const b of parse(fs.readFileSync('businesses.csv','utf8'))){
 if(!slugs.has(b.slug))continue;
 const file=b.slug+'/index.html';let h=fs.readFileSync(file,'utf8');
 const city=/Калининград/i.test(b.address)?'Калининграде':'Пскове';
 h=h.replace(/<h1 id="hero-title">[\s\S]*?<\/h1>/,`<h1 id="hero-title">Автосервис в ${city},<br><em>в который возвращаются.</em></h1>`);
 const map=b.map_url.trim()&&!/^[-—–]$/.test(b.map_url.trim())?b.map_url.trim():'https://yandex.ru/maps/?text='+encodeURIComponent(b.address.trim());
 h=h.replace(/(<a[^>]*href=")[^"]*("[^>]*>(?:Адрес на карте|Открыть на карте|Построить маршрут))/g,(_,a,z)=>a+esc(map)+z).replace(/&amp;amp;/g,'&amp;');
 const oid=(map.match(/\/org\/[^/]+\/(\d+)/)||[])[1];
 if(oid)h=h.replace(/oid=\d+/g,'oid='+oid);else h=h.replace(/<iframe loading="lazy"[^>]*><\/iframe>/,'');
 const services=b.services.split(/,\s*(?![^()]*\))/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/\(([^()]*(?:\d\s*(?:р\.?|₽))[^()]*)\)$/i);return {name:x.replace(/\s*\([^)]*\)$/,'').trim(),price:m?m[1].trim():''}});
 const keys=['to','oil','timing','suspension','body','tires','alignment','brakes'];
 const byKey=new Map();let n=0;
 h=h.replace(/<a class="service-card" data-estimate="([^"]+)"[\s\S]*?<\/a>/g,(card,key)=>{const s=services[n++];if(!s)return '';byKey.set(key,s);return card.replace(/<h3>[\s\S]*?<\/h3>/,`<h3>${esc(s.name)}</h3>`).replace(/(<\/h3><span>)[\s\S]*?(<\/span>)/,`$1${esc(s.price||'Уточняйте по телефону')}$2`)});
 h=h.replace(/<tr data-service="([^"]+)"><th scope="row">[\s\S]*?<\/th><td>[\s\S]*?<\/td><\/tr>/g,(row,key)=>{const s=byKey.get(key);return s?`<tr data-service="${key}"><th scope="row">${esc(s.name)}</th><td>${esc(s.price)}</td></tr>`:row.replace(/<td>[\s\S]*?<\/td>/,'<td></td>')});
 h=h.replace(/(<select id="service-choice">)[\s\S]*?(<\/select>)/,(_,a,z)=>a+'\n<option value="" disabled selected>Выберите услугу</option>'+[...byKey].map(([key,s])=>`\n<option value="${key}">${esc(s.name)}</option>`).join('')+z);
 h=h.replace(/const isDemoRate = isTireService \|\| key === 'oil';/,'const isDemoRate = false;').replace(/if \(isDemoRate\) \{[\s\S]*?\n      \}/,'').replace(/price \|\| 'По запросу'/g,"price || 'Стоимость по запросу'");
 fs.writeFileSync(file,h,'utf8');console.log(b.slug);
}
