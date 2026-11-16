/* ZEUS images: fills generated pages with photos.
   The model sees the catalog and asks for exact ids: <img data-img="pp-barber-beard">, data-bg="cafe".
   Free-text queries still work (matched by tags). People only ever get portraits; nothing fitting → a tasteful placeholder.
   Providers: "library" (ZEUS photo bank, ships with the site) and "stock" (Unsplash / Pexels via the ZEUS server, off in the prototype). */
(function(){
  // type: scene = place/interior/exterior (wide), product = item close-up, portrait = person (square, show ≤ 320px)
  const LIB=[
    {id:'cafe',type:'scene',d:'интерьер кофейни: деревянная стойка, кофе-дрип, выпечка, растения',t:'cafe coffee shop interior counter barista bakery кофейня кафе пекарня интерьер'},
    {id:'fd-latte',type:'product',d:'латте с рисунком в чашке, вид сверху',t:'latte cappuccino coffee cup кофе латте капучино'},
    {id:'fd-espresso',type:'product',d:'чёрный кофе в стеклянной чашке',t:'espresso black coffee americano filter эспрессо американо'},
    {id:'fd-iced',type:'product',d:'айс-латте в стакане со льдом',t:'iced coffee cold drink холодный напиток раф'},
    {id:'fd-brioche',type:'product',d:'бриошь / сдобная булочка',t:'brioche bun pastry bread булочка выпечка хлеб'},
    {id:'fd-croissant',type:'product',d:'миндальный круассан',t:'croissant pastry круассан выпечка завтрак'},
    {id:'fd-pancakes',type:'product',d:'сырники/панкейки с ягодами и сметаной',t:'pancakes breakfast berries brunch сырники блины завтрак'},
    {id:'arch',type:'scene',d:'современный тёмный дом в сосновом лесу, вечер, тёплый свет в окнах',t:'modern house cabin forest exterior architecture дом коттедж архитектура лес'},
    {id:'lake',type:'scene',d:'деревянный дом с террасой у озера, лето, берёзы',t:'house lake terrace summer nature дом озеро терраса'},
    {id:'rocks',type:'scene',d:'дом на скалах у моря, пасмурно',t:'house sea coast cliff rocks villa дом море скалы'},
    {id:'interior',type:'scene',d:'светлая гостиная с панорамными окнами, диван, камин',t:'living room interior sofa fireplace гостиная интерьер диван дизайн квартира'},
    {id:'barber',type:'scene',d:'интерьер барбершопа: кожаное кресло, зеркала в латуни, тёмная плитка',t:'barbershop interior chair mirror барбершоп интерьер кресло салон'},
    {id:'pilates',type:'scene',d:'светлая студия пилатеса с реформерами',t:'pilates yoga fitness studio пилатес йога фитнес студия зал'},
    {id:'flowers',type:'scene',d:'интерьер цветочного магазина, пионы и розы в вёдрах',t:'flower shop florist store цветочный магазин флорист'},
    {id:'bq-peony',type:'product',d:'букет розовых пионов в крафте',t:'peony bouquet pink пионы букет'},
    {id:'bq-whiterose',type:'product',d:'букет белых роз',t:'white roses bouquet wedding белые розы свадьба'},
    {id:'bq-tulip',type:'product',d:'букет разноцветных тюльпанов',t:'tulips bouquet spring тюльпаны весна'},
    {id:'bq-dried',type:'product',d:'букет сухоцветов',t:'dried flowers boho сухоцветы'},
    {id:'bq-box',type:'product',d:'цветы в розовой шляпной коробке',t:'flower box gift коробка подарок цветы'},
    {id:'bq-redrose',type:'product',d:'букет красных роз',t:'red roses bouquet красные розы'},
    {id:'shop',type:'product',d:'керамические вазы и пиалы ручной работы на льне',t:'ceramics pottery vases handmade керамика вазы посуда хендмейд'},
    {id:'pp-barber-beard',type:'portrait',d:'мужчина 30+, барбер, борода, татуировки, фартук, руки скрещены',t:'barber man beard master portrait барбер мастер мужчина'},
    {id:'pp-barber-young',type:'portrait',d:'молодой барбер 20+, улыбается, ножницы и расчёска',t:'barber young man stylist portrait барбер мастер молодой'},
    {id:'pp-stylist-woman',type:'portrait',d:'женщина 30+, парикмахер-стилист, каре, салон',t:'stylist hairdresser woman beauty portrait стилист парикмахер мастер женщина косметолог'},
    {id:'pp-trainer-woman',type:'portrait',d:'женщина, тренер пилатеса/йоги, спортивная форма',t:'trainer coach fitness yoga woman portrait тренер инструктор'},
    {id:'pp-chef-man',type:'portrait',d:'мужчина 40+, шеф/пекарь в белом кителе',t:'chef baker cook man portrait шеф повар пекарь'},
    {id:'pp-florist-woman',type:'portrait',d:'женщина-флорист с букетом пионов',t:'florist woman flowers portrait флорист'},
    {id:'pp-architect-man',type:'portrait',d:'мужчина 40+, архитектор в очках, водолазка',t:'architect designer man engineer portrait архитектор дизайнер основатель'},
    {id:'pp-manager-woman',type:'portrait',d:'женщина 30+, руководитель/владелица, светлый жакет',t:'manager owner founder business woman portrait руководитель владелец основатель менеджер'}
  ];
  const BY=Object.fromEntries(LIB.map(e=>[e.id,e]));
  const PEOPLE=/(portrait|person|people|man|woman|barber |master|team|staff|chef|trainer|coach|founder|stylist|мастер|портрет|человек|команд|сотрудник|тренер|шеф|основател|стилист|барбер\b)/i;
  const cache={};
  const words=s=>String(s||'').toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi,' ').split(/\s+/).filter(w=>w.length>2);
  function score(q,e){ const tw=e.t.split(' '); let s=0; for(const w of words(q)) for(const t of tw){ if(t===w) s+=3; else if(t.length>4&&w.length>4&&(t.startsWith(w.slice(0,5))||w.startsWith(t.slice(0,5)))) s+=1; } return s; }
  function pick(q,used){ q=String(q||'').trim();
    if(BY[q]) return BY[q];
    const wantPerson=PEOPLE.test(' '+q+' ');
    let best=null,bs=0;
    for(const e of LIB){ if(wantPerson!==(e.type==='portrait')) continue; let s=score(q,e); if(used.has(e.id)) s-=2; if(s>bs){bs=s;best=e;} }
    return best; }
  function dataUrl(path){ if(!cache[path]) cache[path]=fetch(path).then(r=>{ if(!r.ok) throw 0; return r.blob(); }).then(b=>new Promise(res=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b); })).catch(()=>null); return cache[path]; }
  // no fitting photo: soft gradient with initials/label — never a wrong picture
  function placeholder(label){ const t=String(label||'').trim(); const ini=t.split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'•';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2f3a"/><stop offset="1" stop-color="#11141b"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="165" r="62" fill="#3a4050"/><rect x="95" y="250" width="210" height="130" rx="105" fill="#3a4050"/><text x="200" y="185" text-anchor="middle" font-family="Arial" font-size="54" font-weight="700" fill="#cfd6e4">${ini.replace(/[<&]/g,'')}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); }

  const providers={
    library:{ name:'Фотобанк ZEUS', async find(q,used){ const e=pick(q,used); if(!e) return null; used.add(e.id); const src=await dataUrl('lib/'+e.id+'.webp'); return src?{src,id:e.id,type:e.type}:null; } },
    // Production: the ZEUS server proxies Unsplash / Pexels (keys stay on the server) and returns {url, author, link}.
    stock:{ name:'Unsplash / Pexels', endpoint:null, async find(q){ if(!this.endpoint||BY[q]) return null;
      try{ const r=await fetch(this.endpoint+'?q='+encodeURIComponent(q)); if(!r.ok) return null; const j=await r.json(); return j&&j.url?{src:j.url,credit:j.author?{name:j.author,link:j.link}:null}:null; }catch(e){ return null; } } }
  };
  const order=['stock','library'];
  async function find(q,used){ for(const k of order){ const r=await providers[k].find(q,used); if(r) return Object.assign({provider:k},r); } return null; }

  /* resolve(html) -> {html, count, missing}; safe on partial documents while streaming */
  async function resolve(html){
    if(!/data-(img|bg)|dataset\.(img|bg)/.test(html)) return {html,count:0,missing:0};
    const doc=new DOMParser().parseFromString(html,'text/html'), used=new Set(), memo={}; let count=0, missing=0;
    const get=q=>(memo[q]=memo[q]||find(q,used));
    for(const im of doc.querySelectorAll('img[data-img]')){ const q=im.getAttribute('data-img'); const r=await get(q);
      if(r){ im.setAttribute('src',r.src); count++; } else { im.setAttribute('src',placeholder(im.getAttribute('alt')||'')); missing++; }
      if(!/object-fit/.test(im.getAttribute('style')||'')) im.style.objectFit='cover'; }
    for(const el of doc.querySelectorAll('[data-bg]')){ const r=await get(el.getAttribute('data-bg')); if(!r){ missing++; continue; }
      const cur=el.getAttribute('style')||''; const ov=el.getAttribute('data-bg-overlay')||'linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.5))';
      el.setAttribute('style',cur+(cur&&!cur.trim().endsWith(';')?';':'')+`background-image:${ov},url("${r.src}");background-size:cover;background-position:center`); count++; }
    // pages often build cards from JS (innerHTML with data-img) after load: ship a small runtime resolver into the page
    const qs=new Set(); let m; const re=/data-(?:img|bg)\s*=\s*\\?["'`]([^"'`\\]+)/g;
    while((m=re.exec(html))) qs.add(m[1].trim());
    const re2=/(?:dataset\.(?:img|bg)|setAttribute\(\s*["']data-(?:img|bg)["']\s*,)\s*=?\s*["'`]([^"'`]+)/g; while((m=re2.exec(html))) qs.add(m[1].trim());
    for(const e of LIB) if(html.includes(e.id)) qs.add(e.id);
    const map={}; for(const q of qs){ const r=await get(q); map[q]=r?r.src:null; }
    const ph=placeholder('');
    const rt=`(function(){var M=${JSON.stringify(map)},P=${JSON.stringify(ph)},O=${JSON.stringify('linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.5))')};
function ap(){document.querySelectorAll('img[data-img]').forEach(function(i){var s=M[i.getAttribute('data-img')]||P;if(i.getAttribute('src')!==s){i.setAttribute('src',s);if(!i.style.objectFit)i.style.objectFit='cover';}});
document.querySelectorAll('[data-bg]').forEach(function(e){var s=M[e.getAttribute('data-bg')];if(s&&e.getAttribute('data-bg-done')!==e.getAttribute('data-bg')){e.style.backgroundImage=(e.getAttribute('data-bg-overlay')||O)+',url("'+s+'")';e.style.backgroundSize='cover';e.style.backgroundPosition='center';e.setAttribute('data-bg-done',e.getAttribute('data-bg'));}});}
var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(ap,0);}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-img','data-bg']});
document.addEventListener('DOMContentLoaded',ap);ap();})();`;
    const sc=doc.createElement('script'); sc.setAttribute('data-zeus','images'); sc.textContent=rt; (doc.head||doc.documentElement).insertBefore(sc,(doc.head||doc.documentElement).firstChild);
    const dt=html.match(/^\s*<!doctype[^>]*>/i);
    return { html:(dt?dt[0]+'\n':'<!DOCTYPE html>\n')+doc.documentElement.outerHTML, count:Object.values(map).filter(Boolean).length, missing };
  }
  const catalog=()=>LIB.map(e=>`${e.id} [${e.type}] — ${e.d}`).join('\n');
  window.ZImages={ resolve, providers, library:LIB, catalog };
})();
