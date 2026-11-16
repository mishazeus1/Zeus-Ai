/* ZEUS studio: opens from the chat, builds the project live in a preview.
   Live generation uses the page's `sample` capability (Claude); without it a demo build of the closest example runs. */
(function(){
  const KIND={site:'Сайт',shop:'Интернет-магазин',tma:'Telegram Mini App',dash:'Дашборд',app:'Мобильное приложение',deck:'Презентация',redo:'Редизайн существующего сайта'};
  const SUGG={app:['Добавь экран профиля','Сделай тёмную тему','Добавь онбординг'],deck:['Добавь слайд с цифрами','Сделай стиль строже','Сократи до 8 слайдов'],redo:['Сделай ещё смелее','Верни фирменные цвета','Добавь онлайн-запись'],site:['Сделай тёмную тему','Добавь блок отзывов','Сделай акцент на бронь'],shop:['Добавь фильтр по цене','Сделай карточку товара подробнее','Поменяй палитру на пастельную'],tma:['Сделай интерфейс как в Telegram','Добавь выбор мастера','Добавь экран оплаты'],dash:['Добавь график по дням','Сделай тёмную тему','Добавь таблицу заказов']};
  const PHASES=['Разбираю задачу…','Продумываю структуру и тексты…','Подбираю шрифты и палитру…','Пишу первый экран…'];
  const $=(s,r=document)=>r.querySelector(s);
  let el, st=null, sampleP=null;

  function getSample(){ if(!sampleP) sampleP = (window.claude&&window.claude.use) ? window.claude.use('sample').catch(()=>null) : Promise.resolve(null); return sampleP; }

  function build(){
    el=document.createElement('div'); el.className='st'; el.id='studio'; el.dataset.tab='pv'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Студия ZEUS');
    el.innerHTML=`
    <div class="st-top">
      <button class="st-back" type="button" aria-label="Закрыть студию">←</button>
      <span class="st-brand"><img src="mark.webp" alt="">ZEUS</span>
      <span class="st-name" id="stName">Новый проект</span>
      <span class="st-sp"></span>
      <div class="st-seg view" role="group" aria-label="Вид"><button type="button" data-view="pv" aria-pressed="true">Превью</button><button type="button" data-view="code" aria-pressed="false">Код</button></div>
      <div class="st-seg dev" role="group" aria-label="Устройство"><button type="button" data-dev="d" aria-pressed="true">ПК</button><button type="button" data-dev="m" aria-pressed="false">Телефон</button></div>
      <button class="st-pub" type="button" id="stPub" disabled>Опубликовать</button>
    </div>
    <div class="st-main">
      <div class="st-tabs" role="group"><button type="button" data-tab="chat" aria-pressed="false">Чат</button><button type="button" data-tab="pv" aria-pressed="true">Превью</button></div>
      <aside class="st-chat">
        <div class="st-log" id="stLog" aria-live="polite"></div>
        <form class="st-form" id="stForm" autocomplete="off">
          <label class="sr" for="stIn">Что изменить</label>
          <textarea id="stIn" rows="2" placeholder="Что изменить? Например: сделай кнопки зелёными"></textarea>
          <div class="row"><span>Enter — отправить</span><button type="button" class="st-stop" id="stStop">Стоп</button><button type="submit" class="st-send" id="stSend">Отправить</button></div>
        </form>
      </aside>
      <section class="st-pv" data-dev="d" data-view="pv">
        <div class="st-stage"><div class="st-dev">
          <div class="st-url"><i></i><i></i><i></i><span id="stUrl">project.zeus.site</span></div>
          <iframe class="st-fr" title="Превью проекта" sandbox="allow-scripts allow-forms allow-modals"></iframe>
          <iframe class="st-fr" title="Превью проекта" sandbox="allow-scripts allow-forms allow-modals"></iframe>
          <div class="st-demo exm-view" id="stDemo"></div>
          <div class="st-build" id="stBuild"><div class="st-core"><div class="st-ring"></div><div><div class="st-phase" id="stPhase">Разбираю задачу…</div></div><div class="st-bar"><i id="stBar"></i></div><div class="st-code" id="stCode"></div></div></div>
        </div></div>
        <pre class="st-src" id="stSrc"></pre>
      </section>
    </div>`;
    document.body.appendChild(el);
    $('.st-back',el).addEventListener('click',close);
    el.querySelectorAll('[data-dev]').forEach(b=>b.addEventListener('click',()=>{ el.querySelectorAll('[data-dev]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); $('.st-pv',el).dataset.dev=b.dataset.dev; }));
    el.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{ el.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); $('.st-pv',el).dataset.view=b.dataset.view; }));
    el.querySelectorAll('.st-tabs [data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
    $('#stPub',el).addEventListener('click',()=>{ say('a','Чтобы опубликовать проект на своём адресе <b>'+esc($('#stUrl',el).textContent)+'</b>, войдите — проект сохранится в вашем кабинете.'); window.zeusAuth&&window.zeusAuth(); });
    const ta=$('#stIn',el);
    ta.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); $('#stForm',el).requestSubmit(); } });
    $('#stForm',el).addEventListener('submit',e=>{ e.preventDefault(); const v=ta.value.trim(); if(!v||!st||st.busy) return; ta.value=''; edit(v); });
    $('#stStop',el).addEventListener('click',()=>{ st&&st.ctrl&&st.ctrl.abort(); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&el.classList.contains('on')&&!document.getElementById('auth')?.classList.contains('on')) close(); });
  }
  addEventListener('message',e=>{ if(!el||!st||!e.data||typeof e.data.zeusScroll!=='number') return; const ok=[...el.querySelectorAll('.st-fr')].some(f=>f.contentWindow===e.source); if(ok) st.scrollY=e.data.zeusScroll; });
  function tab(t){ el.dataset.tab=t; el.querySelectorAll('.st-tabs [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab===t))); }
  function close(){ st&&st.ctrl&&st.ctrl.abort(); el.classList.remove('on'); document.documentElement.style.overflow=''; window.__lenis&&window.__lenis.start(); }
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function say(who,html){ const d=document.createElement('div'); d.className='st-msg '+who; d.innerHTML= who==='a'?'<span class="av"></span><div class="bd">'+html+'</div>':html; const log=$('#stLog',el); log.appendChild(d); log.scrollTop=log.scrollHeight; return d; }
  const TR={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'};
  const slug=s=>(s||'project').toLowerCase().split('').map(c=>TR[c]??c).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,28)||'project';

  /* preview: two iframes, the hidden one loads, then they swap — no white flash between updates */
  let showN=0;
  async function show(html){ const n=++showN; let out=html, cnt=0;
    if(window.ZImages){ try{ const r=await window.ZImages.resolve(html); out=r.html; cnt=r.count; }catch(e){} }
    if(n!==showN) return cnt; // a newer update already started
    // keep the viewer's scroll position across preview refreshes (the page reports it via postMessage)
    const keep=`<script>(function(){var y=${Math.round(st.scrollY||0)};function go(){if(y)scrollTo(0,y);}document.addEventListener('DOMContentLoaded',go);addEventListener('load',go);var t;addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){parent.postMessage({zeusScroll:scrollY},'*');},60);},{passive:true});})();<\/script>`;
    out=/<head[^>]*>/i.test(out)?out.replace(/<head[^>]*>/i,m=>m+keep):keep+out;
    const fr=el.querySelectorAll('.st-fr'), cur=st.fi||0, nx=1-cur, f=fr[nx];
    f.onload=()=>{ f.classList.add('vis'); fr[cur].classList.remove('vis'); st.fi=nx; };
    f.srcdoc=out; return cnt; }

  const NICHE=`ПРИМЕРЫ ПРАВИЛЬНОЙ СТРУКТУРЫ (адаптируй под задачу, не копируй слепо):
- Барбершоп/салон: шапка с логотипом и «Записаться» → первый экран (оффер, рейтинг, адрес) → услуги с ценами и длительностью → мастера (портреты, стаж, специализация, «записаться к мастеру») → работы/интерьер → отзывы → онлайн-запись (услуга → мастер → дата/время → подтверждение) → контакты, часы, как добраться → подвал.
- Кофейня/ресторан: первый экран с атмосферой → меню по категориям с ценами → фирменное/акции → бронь стола или заказ навынос → бонусная программа → интерьер/о нас → контакты.
- Магазин: первый экран с хитом → каталог с фильтрами и карточками (фото, цена, «в корзину») → корзина с суммой → доставка и оплата → гарантии/отзывы → FAQ → контакты.
- Студия/фитнес: оффер и пробное занятие → направления → расписание → тренеры → абонементы с ценами → отзывы → запись → контакты.
- Услуги/бюро: оффер → кейсы/портфолио → услуги и этапы → калькулятор или заявка → команда → отзывы → контакты.
- Telegram Mini App: интерфейс приложения (экраны, нижняя навигация, крупные кнопки), а не лендинг.
- Дашборд: боковое меню, KPI-карточки, графики (SVG), таблица, фильтры периода.
- Мобильное приложение: 4–6 экранов настоящего приложения (онбординг/главная, каталог или услуги, карточка, оформление, профиль/история), нижний таб-бар, переходы между экранами на JS, системные отступы, крупные зоны нажатия. Секции = экраны.
- Презентация: 8–12 слайдов 16:9 с одной мыслью на слайд — обложка, проблема, решение, продукт, рынок (цифры), модель, конкуренты, трекшн, команда, план/раунд, контакты. Крупные цифры, графики на SVG, минимум текста. Секции = слайды.
- Редизайн: сохрани суть бизнеса, контент и узнаваемые элементы бренда старого сайта (по скриншотам и описанию), но перепридумай подачу: структуру, иерархию, типографику, первый экран, путь клиента и мобильную версию. В брифе в goal отметь, что улучшено относительно старого.`;

  function briefPrompt(task,kind,nImg){
    return `Ты — арт-директор и продуктовый дизайнер ZEUS. Перед вёрсткой продумай проект целиком.${nImg?`\nКлиент приложил ${nImg} изображ. (скриншоты/макеты/референсы) — внимательно изучи их и опирайся на них.`:''}
Тип продукта: «${KIND[kind]||'Сайт'}». Запрос клиента: «${task}»

${NICHE}

ФОТОБАНК (других фото НЕТ; бери только подходящие по смыслу id):
${window.ZImages?window.ZImages.catalog():''}
Правила фото: людей (мастера, команда, тренер, шеф) — ТОЛЬКО id с [portrait]; интерьер/место — [scene]; товары и блюда — [product]. Если подходящего фото нет — оставь images пустым, будет иллюстрация. Никогда не ставь интерьер вместо человека.

Верни ТОЛЬКО JSON без пояснений:
{"name":"название бренда (придумай, если не дано)","tagline":"слоган до 8 слов","audience":"кто клиенты","tone":"характер бренда в 3–5 словах",
"palette":{"bg":"#hex","surface":"#hex","text":"#hex","muted":"#hex","accent":"#hex","accent2":"#hex"},
"fonts":{"display":"Google Font с кириллицей","body":"Google Font с кириллицей"},
"logo":{"idea":"какой знак и почему он про этот бренд","kind":"monogram|symbol|wordmark"},
"sections":[{"id":"latin-id","t":"название блока","goal":"зачем блок клиенту","content":"что конкретно в нём: пункты, цифры, имена, цены","images":["id из фотобанка"]}],
"conversion":"главное действие и как оно работает на странице шаг за шагом"}
Секций 7–10, в порядке страницы, первая — "hero", последняя — "footer". Контент конкретный и правдоподобный для России (₽, СБП, адреса, часы, имена).`;
  }
  const LAYOUT={deck:`ФОРМАТ ПРЕЗЕНТАЦИИ: каждый слайд — <section data-s="id" class="slide">, слайд 16:9 вписан в окно (масштабируется под ширину), показывается один слайд за раз. Навигация: стрелки ←/→ и пробел, кнопки «назад/вперёд», счётчик «3 / 10», клик по краю слайда, свайп на телефоне. Без шапки сайта и подвала — только слайды. Анимация появления элементов на слайде.`,
    app:`ФОРМАТ ПРИЛОЖЕНИЯ: это интерфейс мобильного приложения, а не лендинг. Каждый экран — <section data-s="id" class="screen">, одновременно виден один экран, переключение через нижний таб-бар и кнопки внутри экранов (JS, с анимацией перехода). Ширина интерфейса до 430px по центру, на ПК — по центру на фоне. Статус-бар, заголовки экранов, карточки, нижняя навигация с иконками SVG.`,
    tma:`ФОРМАТ TELEGRAM MINI APP: интерфейс в стиле Telegram (светлая/тёмная тема, нижняя главная кнопка MainButton на всю ширину), экраны переключаются на JS, ширина до 430px по центру.`};
  function buildPrompt(task,kind,brief){
    return `Ты — ведущий фронтенд-разработчик ZEUS. Сверстай проект СТРОГО по утверждённому брифу.${LAYOUT[kind]?'\n'+LAYOUT[kind]:''}
Тип: «${KIND[kind]||'Сайт'}». Исходный запрос: «${task}»
БРИФ:
${JSON.stringify(brief)}

ФОТО: только id из брифа и фотобанка. Вставляй как <img data-img="id" alt="описание"> БЕЗ src; фон блока — атрибут data-bg="id" на элементе. Портреты ([portrait]) показывай не крупнее 320px по ширине (карточки мастеров, аватары отзывов — круг/квадрат, aspect-ratio:1). Сцены — первый экран, галерея, «о нас». Задавай размеры в CSS (aspect-ratio + object-fit:cover). Где фото нет — рисуй иллюстрацию на inline SVG/CSS. data-img работает и в карточках, которые ты создаёшь из JS (innerHTML). Для нескольких людей ставь РАЗНЫЕ портреты, подходящие по полу и роли (например, мастера салона: pp-stylist-woman, pp-manager-woman, pp-florist-woman, pp-trainer-woman); у каждой карточки человека — своё фото.
ФОТОБАНК: ${window.ZImages?window.ZImages.library.map(e=>e.id+'['+e.type+']').join(', '):''}

ЛОГОТИП: нарисуй собственный знак на inline SVG по идее из брифа (brief.logo) в цветах палитры: знак + название шрифтом display. Один и тот же логотип в шапке и подвале. Добавь в <head> favicon: <link rel="icon" href="data:image/svg+xml,…"> с этим знаком.

ВЁРСТКА:
- Ответ — ТОЛЬКО HTML-документ, начиная с <!DOCTYPE html>. Без markdown и пояснений.
- Один файл: CSS в одном <style> (переменные из палитры брифа в :root), JS в одном <script> в конце. Шрифты из брифа через один <link> Google Fonts. Никаких внешних скриптов и картинок по ссылкам.
- Каждая секция — <section data-s="id"> (id и порядок как в брифе), в шапке навигация якорями на ключевые секции.
- Тексты на русском, конкретные, из брифа; никакого «Lorem ipsum».
- Главное действие (brief.conversion) работает целиком на JS: шаги, выбор, состояние, итог, подтверждение внутри страницы (не alert). Остальные кнопки ведут к нужным секциям.
- Адаптив: идеально на 390px (бургер-меню, кнопки во всю ширину, плотные отступы) и на десктопе.
- Дизайн уровня сильной студии 2026: выразительная типографика, сетка, ритм, микроанимации появления (IntersectionObserver), hover-состояния.
- Объём до ~550 строк, без повторов.`;
  }

  function parse(t){
    const out={};
    const i=t.search(/<!doctype html|<html/i); if(i>=0){ let h=t.slice(i); h=h.replace(/```\s*$/,''); out.html=h; }
    return out;
  }
  function parseJSON(t){ const a=t.indexOf('{'), b=t.lastIndexOf('}'); if(a<0||b<a) return null; try{ return JSON.parse(t.slice(a,b+1)); }catch(e){ return null; } }

  function renderPlan(plan,box){ box.innerHTML='<b>ПЛАН ПРОЕКТА</b><ul style="margin:0;padding:0">'+plan.sections.map(s=>'<li data-id="'+esc(s.id)+'"><i></i>'+esc(s.t)+'</li>').join('')+'</ul>'; }
  function renderBrief(br,box){
    const pal=br.palette||{}, sw=['bg','surface','text','accent','accent2'].filter(k=>pal[k]).map(k=>'<i style="background:'+esc(pal[k])+'" title="'+k+' '+esc(pal[k])+'"></i>').join('');
    box.innerHTML='<b>БРИФ ПРОЕКТА</b><div class="st-bn">'+esc(br.name||'')+'</div><div class="st-bt">'+esc(br.tagline||'')+'</div>'
      +'<div class="st-sw">'+sw+'</div>'
      +(br.fonts?'<div class="st-kv"><span>Шрифты</span>'+esc((br.fonts.display||'')+' / '+(br.fonts.body||''))+'</div>':'')
      +(br.logo?'<div class="st-kv"><span>Логотип</span>'+esc(br.logo.idea||'')+'</div>':'')
      +(br.audience?'<div class="st-kv"><span>Для кого</span>'+esc(br.audience)+'</div>':'')
      +'<b style="margin-top:10px">СТРУКТУРА</b><ul style="margin:0;padding:0">'+(br.sections||[]).map(s=>'<li data-id="'+esc(s.id)+'"><i></i><span>'+esc(s.t)+(s.goal?'<small>'+esc(s.goal)+'</small>':'')+'</span></li>').join('')+'</ul>';
  }
  function tickPlan(sections,box,html,done){
    const lis=[...box.querySelectorAll('li[data-id]')]; let go=false, n=0;
    lis.forEach((li,i)=>{ const has=html.includes('data-s="'+li.dataset.id+'"'), nextHas=i+1<lis.length?html.includes('data-s="'+lis[i+1].dataset.id+'"'):done;
      if(has) n++; li.className= has&&(nextHas||done)?'ok':(has&&!go?(go=true,'go'):''); });
    return lis.length?n/lis.length:0; }

  async function usableImages(sample){ const fs=(st.images||[]).slice(0,4); if(!fs.length) return []; try{ const l=sample.limits?await sample.limits():null; return l&&l.images?fs:[]; }catch(e){ return []; } }
  async function makeBrief(sample,task,kind,ctrl,msg){
    const stEl=msg.querySelector('.st-st');
    stEl.textContent='Продумываю проект: структура, бренд, логотип, фото…';
    const imgs=await usableImages(sample); const r=await sample([{role:'user',content:briefPrompt(task,kind,imgs.length)}],Object.assign({signal:ctrl.signal,modelTier:'complex',cache:false},imgs.length?{images:imgs}:{}));
    const br=parseJSON(r.text||'');
    if(!br||!Array.isArray(br.sections)||!br.sections.length) throw {code:'brief',message:'не удалось составить бриф'};
    return br;
  }

  async function run(messages,{edit=false}={}){
    const sample=await getSample();
    if(!sample) return demo(st.task,st.kind);
    st.busy=true; el.classList.add('busy'); const t0=Date.now(); const ctrl=new AbortController(); st.ctrl=ctrl;
    const B=$('#stBuild',el); B.className='st-build'+(edit?' thin':''); $('#stBar',el).style.width='4%';
    const msg=say('a','<div class="muted st-st">'+(edit?'Вношу правку…':'Начинаю. Сначала продумаю проект, потом сверстаю — обычно 1–2 минуты.')+'</div><div class="st-plan" hidden></div>');
    const planBox=msg.querySelector('.st-plan'), stEl=msg.querySelector('.st-st');
    const BPH=['Изучаю нишу и конкурентов…','Собираю структуру страницы…','Придумываю бренд и логотип…','Подбираю палитру и шрифты…','Выбираю фото под каждый блок…'];
    let ph=0, phase='brief'; const phT=setInterval(()=>{ if(phase==='brief') $('#stPhase',el).textContent=BPH[Math.min(++ph,BPH.length-1)]; else if(!st.gotHtml) $('#stPhase',el).textContent='Начинаю вёрстку…'; },3000);
    $('#stPhase',el).textContent=edit?'Вношу правку…':BPH[0];
    try{
      if(!edit){
        st.brief=await makeBrief(sample,st.task,st.kind,ctrl,msg);
        renderBrief(st.brief,planBox); planBox.hidden=false;
        if(st.brief.name){ $('#stName',el).textContent=st.brief.name; $('#stUrl',el).textContent=slug(st.brief.name)+'.zeus.site'; }
        stEl.textContent='Бриф готов — верстаю по нему.'; $('#stBar',el).style.width='14%';
        messages=[{role:'user',content:buildPrompt(st.task,st.kind,st.brief)}];
      } else if(st.brief){ renderBrief(st.brief,planBox); planBox.hidden=false; }
      phase='build'; st.gotHtml=false; let lastShow=0, raw='';
      const upd=(t,done)=>{ raw=t; const p=parse(t); if(!p.html) return; st.gotHtml=true;
        const frac=tickPlan(st.brief&&st.brief.sections,planBox,p.html,done);
        $('#stBar',el).style.width=Math.round(14+frac*82+(done?4:0))+'%';
        const cur=planBox.querySelector('li.go span'); $('#stPhase',el).textContent= done?'Готово':(cur?'Верстаю: '+cur.firstChild.textContent:'Пишу код…');
        $('#stCode',el).textContent=p.html.split('\n').slice(-9).join('\n');
        $('#stSrc',el).textContent=p.html;
        const now=Date.now();
        if(/<body/i.test(p.html)&&(done||now-lastShow>1700)){ lastShow=now; let h=p.html; if(!done){ const k=h.lastIndexOf('>'); h=h.slice(0,k+1); }
          show(h); if(!edit&&!done&&p.html.length>2500) B.className='st-build thin'; }
      };
      const imgs=st.kind==='redo'?await usableImages(sample):[]; const r=await sample(messages,{ ...(imgs.length?{images:imgs}:{}), signal:ctrl.signal, modelTier:'default', cache:false, onText:({text})=>{ if(text&&text.includes('<')) upd(text,false); } });
      const full=r.text||raw; upd(full,true);
      const p=parse(full); if(!p.html) throw {code:'empty',message:'пустой ответ'};
      st.raw=full; st.html=p.html; const nImg=await show(p.html);
      const sec=Math.round((Date.now()-t0)/1000);
      stEl.innerHTML=(edit?'Правка готова':'Готово')+' за '+sec+' с'+(nImg?' · фото: '+nImg:'')+(r.truncated?' · <span style="color:#FFC94A">ответ обрезан, напишите «допиши страницу»</span>':'')+'.';
      B.className='st-build gone'; $('#stPub',el).disabled=false;
      const sg=document.createElement('div'); sg.className='st-sugg'; sg.innerHTML=(SUGG[st.kind]||SUGG.site).map(s=>'<button type="button">'+esc(s)+'</button>').join(''); msg.querySelector('.bd').appendChild(sg);
      sg.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ if(!st.busy) edit(b.textContent); }));
      if(!edit) say('a','Проект собран по брифу. Пройдите главный сценарий в превью — он живой. Напишите, что изменить, или переключите «Телефон».');
    }catch(e){
      const code=e&&e.code; B.className='st-build gone';
      if(code==='not_granted'){ stEl.textContent='Генерация не разрешена — показываю демо-сборку.'; finish(); return demo(st.task,st.kind,true); }
      if(ctrl.signal.aborted){ stEl.textContent='Остановлено.'; if(st.html) show(st.html); }
      else if(code==='rate_limited'){ stEl.innerHTML='Слишком много запросов подряд. Подождите минуту и отправьте ещё раз.'; }
      else { stEl.innerHTML='Не получилось собрать: '+esc((e&&e.message)||'ошибка')+'. Попробуйте ещё раз или уточните запрос.'; if(st.html) show(st.html); }
    }finally{ clearInterval(phT); finish(); }
    function finish(){ st.busy=false; el.classList.remove('busy'); }
  }

  function edit(text){
    say('u',esc(text));
    if(st.mode==='demo'){ say('a','<span class="muted">В демо-режиме правки не применяются. Живая сборка включится, когда генерация будет доступна на этой странице.</span>'); return; }
    if(!st.raw){ return start(text,st.kind); }
    run([{role:'user',content:buildPrompt(st.task,st.kind,st.brief||{})},{role:'assistant',content:st.raw},
         {role:'user',content:'Правка от клиента: «'+text+'». Верни ПОЛНЫЙ обновлённый HTML-документ (только код, с <!DOCTYPE html>). Всё, о чём не просили, сохрани как было; фото — только data-img/data-bg с id из фотобанка.'}],{edit:true});
  }

  /* demo build: no live generation available — assemble the closest ready example step by step */
  function pick(task,kind){ const t=task.toLowerCase();
    if(/архит|дом|коттедж|строит/.test(t)) return 'arch'; if(/цвет|букет|флор/.test(t)) return 'shop'; if(/пилат|йог|фитнес|студи/.test(t)) return 'pilates';
    if(/барбер|стриж|салон|запис/.test(t)) return 'barber'; if(/дашборд|продаж|аналит|выручк/.test(t)) return 'dash'; if(/коф|кафе|ресторан|пекар|еда/.test(t)) return 'cafe';
    return {site:'cafe',shop:'shop',tma:'barber',dash:'dash'}[kind]||'cafe'; }
  function demo(task,kind,quiet){
    st.mode='demo'; const k=pick(task,kind), ex=(window.EXAMPLES||[]).find(x=>x.k===k)||{t:'Проект',feats:[]};
    const steps=['Первый экран и навигация','Каталог и карточки','Ключевое действие клиента','Оплата по СБП','Версия для телефона'];
    const B=$('#stBuild',el); B.className='st-build'; $('#stName',el).textContent=ex.t; $('#stUrl',el).textContent=(ex.url||slug(ex.t)+'.zeus.site');
    const msg=say('a',(quiet?'':'<div class="muted">Демо-сборка: на этой странице нет доступа к генерации, поэтому собираю ближайший готовый пример.</div>')+'<div class="st-plan"></div>');
    const box=msg.querySelector('.st-plan'); renderPlan({sections:steps.map((t,i)=>({id:'d'+i,t}))},box); const lis=[...box.querySelectorAll('li')];
    let i=0; st.busy=true; el.classList.add('busy');
    (function step(){ lis.forEach((li,j)=>li.className=j<i?'ok':(j===i?'go':'')); $('#stBar',el).style.width=Math.round(8+i/steps.length*92)+'%'; $('#stPhase',el).textContent=i<steps.length?'Собираю: '+steps[i]:'Готово';
      $('#stCode',el).textContent=['<section data-s="hero">','  <h1>'+esc(ex.t)+'</h1>','  <button data-a="cta">…</button>','</section>','<script> cart.add(item); sbp.pay(order) </script>'].slice(0,2+i).join('\n');
      if(i++<steps.length){ setTimeout(step,900); return; }
      const d=$('#stDemo',el); d.classList.add('vis'); el.querySelectorAll('.st-fr').forEach(f=>f.classList.remove('vis'));
      if(window.exMount) window.exMount(k,d); B.className='st-build gone'; $('#stPub',el).disabled=false; st.busy=false; el.classList.remove('busy');
      say('a','Готово: «'+esc(ex.t)+'». Превью живое — пройдите путь клиента. Нажмите «Опубликовать», чтобы забрать проект.'); })();
  }

  function start(task,kind,opt){
    if(!el) build();
    st={task,kind,fi:0,images:(opt&&opt.images)||[]}; el.classList.remove('busy');
    $('#stLog',el).innerHTML=''; $('#stSrc',el).textContent=''; $('#stCode',el).textContent=''; $('#stDemo',el).classList.remove('vis'); $('#stDemo',el).innerHTML='';
    el.querySelectorAll('.st-fr').forEach(f=>{ f.classList.remove('vis'); f.removeAttribute('srcdoc'); });
    $('#stPub',el).disabled=true; $('#stName',el).textContent='Новый проект'; $('#stUrl',el).textContent='project.zeus.site';
    el.classList.add('on'); tab('pv'); document.documentElement.style.overflow='hidden'; window.__lenis&&window.__lenis.stop();
    say('u','<span class="muted" style="font-size:12px;display:block;margin-bottom:2px">'+esc(KIND[kind]||'Сайт')+'</span>'+esc(task));
    if(st.images.length) say('a','<span class="muted">Изображений приложено: '+st.images.length+'. Учту их в брифе.</span>');
    if(kind==='redo'){ const u=(task.match(/https?:\/\/\S+|[a-z0-9-]+\.(ru|рф|com|net|site|online|shop)\S*/i)||[])[0];
      say('a','<span class="muted">'+(u?'Адрес старого сайта: <b>'+esc(u)+'</b>. ':'')+(st.images.length?'Опираюсь на скриншоты и ваше описание.':'Чтобы редизайн был точным, приложите скриншоты старого сайта (скрепка в чате). Пока опираюсь на описание.')+' Загрузку сайта по ссылке ZEUS будет делать на сервере в рабочей версии.</span>'); }
    const dev=(kind==='app'||kind==='tma')?'m':'d'; el.querySelectorAll('[data-dev]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.dev===dev))); $('.st-pv',el).dataset.dev=dev;
    run([]);
  }
  window.ZStudio={ open:start, warm:getSample };
})();
