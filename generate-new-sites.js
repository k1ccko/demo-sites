const fs = require('fs');
const path = require('path');
const csv = fs.readFileSync('businesses.csv', 'utf8');
function parse(s) { const rows=[]; let row=[], v='', q=false; for(let i=0;i<s.length;i++){const c=s[i]; if(q){if(c==='"'&&s[i+1]==='"'){v+='"';i++}else if(c==='"')q=false;else v+=c}else if(c==='"')q=true;else if(c===','){row.push(v);v=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&s[i+1]==='\n')i++;row.push(v);v='';if(row.some(Boolean))rows.push(row);row=[]}else v+=c}if(v||row.length){row.push(v);rows.push(row)}const h=rows.shift();return rows.map(r=>Object.fromEntries(h.map((x,i)=>[x,r[i]||''])))}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const template=fs.readFileSync('dinamika-hyundai/index.html','utf8');
let created=0;
for(const b of parse(csv)){
 const slug=b.slug.trim(); if(!slug||!(/^[\w-]+$/.test(slug))||fs.existsSync(slug))continue;
 let h=template, name=esc(b.name.trim()), address=esc(b.address.trim()), city=esc((b.address.match(/Калининград|Псков/i)||[])[0]||''), phone=esc(b.phone.trim());
 const tel='tel:+'+b.phone.replace(/\D/g,'');
 h=h.replace(/Динамика Hyundai/g,name).replace(/<span>Динамика<small>HYUNDAI<\/small><\/span>/g,`<span>${name}<small></small></span>`);
 h=h.replace(/Автосервис<br>в Калининграде,/g,`${name}<br>${city ? 'в '+city : ''},`).replace(/ул\. Дзержинского, 130/g,address).replace(/Калининград<br>/g,city?city+'<br>':'').replace(/Ежедневно, 09:00–20:00/g,esc(b.hours.trim()));
 h=h.replace(/\+7 \(4012\) 79-70-18/g,phone).replace(/tel:\+74012797018/g,tel);
 h=h.replace(/https:\/\/yandex\.ru\/maps\/org\/dinamika_hyundai\/1035864357\//g,esc(b.map_url.trim()));
 const oid=(b.map_url.match(/\/(\d+)\/?$/)||[])[1]; if(oid)h=h.replace(/oid=1035864357/g,'oid='+oid);else h=h.replace(/<iframe loading="lazy"[^>]*><\/iframe>/,'');
 const services=b.services.split(/,\s*(?![^()]*\))/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/\(([^()]*)\)$/);return {title:esc(x.replace(/\s*\([^()]*\)$/,'').trim()),price:m?esc(m[1]):''}});
 let i=0;h=h.replace(/(<a class="service-card"[\s\S]*?<\/a>)/g,card=>{const s=services[i++];if(!s)return card;return card.replace(/(<h3[^>]*>)[\s\S]*?(<\/h3>)/,`$1${s.title}$2`).replace(/(<span class="[^\"]*price[^\"]*">)[\s\S]*?(<\/span>)/,`$1${s.price}$2`)});
 i=0;h=h.replace(/(<tr data-service="[^"]*"><th scope="row">)[\s\S]*?(<\/th><td>)[\s\S]*?(<\/td><\/tr>)/g,(all,a,mid,end)=>{const s=services[i++];return s?`${a}${s.title}${mid}${s.price||''}${end}`:all});
 i=0;h=h.replace(/(<select id="service-choice">[\s\S]*?<option value="" disabled selected>[^<]*<\/option>)([\s\S]*?)(<\/select>)/,(all,a,opts,z)=>{const values=[...opts.matchAll(/value="([^"]+)"/g)].map(m=>m[1]);return a+values.map((v,j)=>`\n              <option value="${v}">${services[j]?.title||'Услуга'}</option>`).join('')+z});
 fs.mkdirSync(slug);fs.copyFileSync('dinamika-hyundai/style.css',path.join(slug,'style.css'));fs.writeFileSync(path.join(slug,'index.html'),h,'utf8');created++;console.log(slug);
}
console.log('Создано папок: '+created);
