/* ZEUS — demo projects: data, 3D card screenshots, and scrollable mini-sites */
(function(){
const IMG = {};
const PHOTOS = { cafe:'ex/cafe.webp', arch:'ex/arch.webp', barber:'ex/barber.webp', pilates:'ex/pilates.webp', flowers:'ex/flowers.webp', bouquets:'ex/bouquets.webp', food:'ex/food.webp', lake:'ex/lake.webp', interior:'ex/interior.webp', rocks:'ex/rocks.webp' };
window.EX_READY = Promise.all(Object.entries(PHOTOS).map(([k,src])=>new Promise(res=>{ const im=new Image(); im.onload=()=>{ IMG[k]=im; res(); }; im.onerror=res; im.src=src; })));

/* ---------- canvas helpers ---------- */
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
const F=(w,s,fam)=>`${w} ${s}px ${fam||"Onest, system-ui, sans-serif"}`;
const SERIF="Georgia, 'Times New Roman', serif";
function photo(g,k,x,y,w,h,fx=.5,fy=.5,crop){ const im=IMG[k]; g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip();
  if(!im){ g.fillStyle='#8a7a66'; g.fillRect(x,y,w,h); g.restore(); return; }
  let sx=0,sy=0,sw=im.width,sh=im.height; if(crop){ [sx,sy,sw,sh]=crop.map((v,i)=>v*(i%2?im.height:im.width)); }
  const s=Math.max(w/sw,h/sh), dw=sw*s, dh=sh*s; g.drawImage(im,sx,sy,sw,sh,x+(w-dw)*fx,y+(h-dh)*fy,dw,dh); g.restore(); }
function txt(g,t,x,y,font,color,align){ g.font=font; g.fillStyle=color; g.textAlign=align||'left'; g.fillText(t,x,y); g.textAlign='left'; }
function btn(g,x,y,w,h,label,bg,fg,r=12,size=22){ g.fillStyle=bg; rr(g,x,y,w,h,r); g.fill(); txt(g,label,x+w/2,y+h/2+size*.36,F('600',size),fg,'center'); }

/* ---------- the six demo projects ---------- */
const EX = [
{ k:'arch', feats:['6 страниц: главная, проекты, проект, калькулятор, бюро, контакты','4 дома с фото, планировкой и характеристиками','Калькулятор сметы с пакетами и сроками','Отзывы, этапы работы, заявка в Telegram'], cat:'portfolio', tag:'САЙТ · АРХБЮРО', t:'Бюро «Северный дом»', d:'Портфолио загородных домов, страницы проектов и калькулятор стоимости онлайн.', url:'sever-dom.ru',
  prompt:'Сайт архитектурного бюро «Северный дом»: портфолио загородных домов со страницами проектов, калькулятор стоимости, отзывы, заявка, тёмный строгий стиль',
  draw(g,W,H){ g.fillStyle='#111316'; g.fillRect(0,0,W,H); photo(g,'arch',0,0,W,H,.5,.5); const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'rgba(10,11,13,.75)'); gr.addColorStop(.45,'rgba(10,11,13,.1)'); gr.addColorStop(1,'rgba(10,11,13,.9)'); g.fillStyle=gr; g.fillRect(0,0,W,H);
    txt(g,'СЕВЕРНЫЙ ДОМ',48,66,F('800',26,'Unbounded, sans-serif'),'#ECE8E0'); ['Проекты','Калькулятор','Бюро'].forEach((l,i)=>txt(g,l,580+i*130,62,F('500',20),'#C9C4BA'));
    txt(g,'Дома, в которых',48,470,F('600',60),'#F2EFE9'); txt(g,'хочется жить',48,536,F('600',60),'#F2EFE9');
    txt(g,'18 домов в Ленинградской области',48,580,F('500',22),'#C9A36A'); btn(g,48,604,250,58,'Рассчитать проект','#C9A36A','#111316');
    ['lake','interior','rocks'].forEach((k,i)=>{ const x=560+i*150; g.save(); rr(g,x,610,138,104,10); g.clip(); photo(g,k,x,610,138,104); g.restore(); }); } },

{ k:'shop', feats:['Каталог букетов с фильтром по поводу и цене','Конструктор: размер, упаковка, открытка','Доставка ко времени, оплата по СБП','Статус заказа и фото букета перед отправкой'], cat:'shop', tag:'МАГАЗИН · ЦВЕТЫ', t:'Цветочная мастерская «Пудра»', d:'Каталог букетов, конструктор с открыткой и доставка к нужному часу по Москве.', url:'pudra-flowers.ru',
  prompt:'Интернет-магазин цветочной мастерской «Пудра»: каталог букетов с фильтрами, выбор размера и открытки, доставка ко времени, оплата по СБП',
  draw(g,W,H){ g.fillStyle='#FBF4F1'; g.fillRect(0,0,W,H);
    txt(g,'пудра',48,66,F('400',38,SERIF),'#3B2A2E'); ['Букеты','Поводы','Доставка'].forEach((l,i)=>txt(g,l,560+i*120,62,F('500',20),'#7A5E63')); txt(g,'Корзина · 1',920,62,F('600',19),'#3B2A2E','left');
    photo(g,'flowers',460,96,564,360,.5,.5);
    txt(g,'Букеты, которые',48,200,F('400',50,SERIF),'#3B2A2E'); txt(g,'приедут вовремя',48,256,F('400',50,SERIF),'#3B2A2E');
    txt(g,'Доставка за 2 часа по Москве',48,300,F('500',21),'#A0646F'); btn(g,48,330,240,58,'Выбрать букет','#3B2A2E','#FBF4F1');
    [[0,0,'Пионы','5 900 ₽'],[1,0,'Белые розы','4 700 ₽'],[0,1,'Сухоцветы','3 400 ₽'],[2,1,'Красные розы','6 200 ₽']].forEach((b,i)=>{ const x=48+i*240; g.fillStyle='#fff'; rr(g,x,486,222,250,16); g.fill();
      photo(g,'bouquets',x+10,496,202,160,.5,.5,[b[0]/3+.02,b[1]/2+.02,1/3-.04,.5-.04]); txt(g,b[2],x+16,690,F('600',20),'#3B2A2E'); txt(g,b[3],x+16,718,F('500',18),'#A0646F'); }); } },

{ k:'cafe', feats:['Меню с фото: кофе, выпечка, завтраки','Бронь столика с выбором дня, времени и гостей','Заказ навынос к нужной минуте','Программа лояльности и отзывы'], cat:'food', tag:'САЙТ · КОФЕЙНЯ', t:'Кофейня «Зерно и Печь»', d:'Меню с фото, бронь столика и заказ навынос к нужному времени.', url:'zernoipech.ru',
  prompt:'Сайт кофейни-пекарни «Зерно и Печь»: меню с фото, бронь столика, заказ навынос ко времени, бонусная программа, оплата по СБП, тёплый минимализм',
  draw(g,W,H){ g.fillStyle='#F4EEE4'; g.fillRect(0,0,W,H);
    txt(g,'Зерно и Печь',48,66,F('400',32,SERIF),'#2A2018'); ['Меню','Бронь','Навынос'].forEach((l,i)=>txt(g,l,600+i*112,62,F('500',20),'#5B4A3A'));
    photo(g,'cafe',540,100,484,380,.6,.5);
    txt(g,'Свежая выпечка',48,200,F('400',52,SERIF),'#2A2018'); txt(g,'и кофе к 8:00',48,262,F('400',52,SERIF),'#2A2018');
    txt(g,'Покровка, 17 · каждый день',48,306,F('500',21),'#7A6654');
    btn(g,48,336,240,58,'Заказать навынос','#2A2018','#F4EEE4'); btn(g,302,336,200,58,'Бронь стола','#E7DCCB','#2A2018');
    [[0,0,'Капучино','290 ₽'],[1,0,'Фильтр V60','340 ₽'],[0,1,'Бриошь','220 ₽'],[2,1,'Сырники','450 ₽']].forEach((it,i)=>{ const x=48+i*240;
      g.fillStyle='#fff'; rr(g,x,512,222,228,16); g.fill(); photo(g,'food',x+10,522,202,130,.5,.5,[it[0]/3+.03,it[1]/2+.04,1/3-.06,.5-.08]);
      txt(g,it[2],x+16,690,F('600',20),'#2A2018'); txt(g,it[3],x+16,718,F('500',18),'#B5652B'); }); } },

{ k:'barber', feats:['Выбор мастера, услуги, дня и окна','Цена считается сразу','Подтверждение и оплата в Telegram','Напоминание и перенос записи'], cat:'services', tag:'MINI APP · БАРБЕРШОП', t:'Барбершоп SLOT в Telegram', d:'Запись к мастеру прямо в Telegram: услуги, свободные окна и оплата в два касания.', url:'t.me/slot_barber_bot', phone:true,
  prompt:'Telegram Mini App для барбершопа: выбор мастера и услуги, свободные окна, запись и предоплата, напоминание о визите',
  draw(g,W,H){ const gr=g.createRadialGradient(W*.7,H*.25,10,W*.5,H*.5,W*.75); gr.addColorStop(0,'#2A2112'); gr.addColorStop(1,'#08080A'); g.fillStyle=gr; g.fillRect(0,0,W,H);
    const px=W/2-175, pw=350; g.fillStyle='#111'; rr(g,px,28,pw,712,48); g.fill(); g.strokeStyle='#2E2E2E'; g.lineWidth=10; g.stroke();
    g.save(); rr(g,px+10,38,pw-20,692,40); g.clip(); g.fillStyle='#17171A'; g.fillRect(px,38,pw,692); photo(g,'barber',px+10,38,pw-20,200,.4,.5);
    g.fillStyle='rgba(0,0,0,.45)'; g.fillRect(px+10,38,pw-20,200); txt(g,'SLOT',px+32,200,F('800',40,'Unbounded, sans-serif'),'#F2C14E'); txt(g,'Барбершоп · Лиговский, 50',px+32,228,F('500',17),'#ddd');
    [['Стрижка','1 800 ₽',0],['Борода и контур','1 200 ₽',1],['Комплекс','2 700 ₽',0]].forEach((s,i)=>{ const y=258+i*70; g.fillStyle=s[2]?'#F2C14E':'#232327'; rr(g,px+24,y,pw-48,58,14); g.fill(); txt(g,s[0],px+42,y+37,F('600',20),s[2]?'#111':'#EEE'); txt(g,s[1],px+pw-42,y+37,F('600',19),s[2]?'#111':'#F2C14E','right'); });
    ['12:00','13:30','15:00','17:30','19:00','20:30'].forEach((t,i)=>{ const x=px+24+(i%3)*104, y=480+Math.floor(i/3)*62; g.fillStyle=i===1?'#F2C14E':'#232327'; rr(g,x,y,94,50,12); g.fill(); txt(g,t,x+47,y+33,F('600',19),i===1?'#111':'#EEE','center'); });
    g.fillStyle='#3390EC'; g.fillRect(px+10,664,pw-20,66); txt(g,'Записаться · 1 200 ₽',W/2,705,F('700',21),'#fff','center'); g.restore(); },
  html(){ return `<div class="mx mx-tma"><div class="mx-tg-top"><span>✕ Закрыть</span><b>SLOT</b><span>⋯</span></div>
    <section class="mx-tg-hero" style="${bg('barber',.4,.5)}"><div><b>SLOT</b><small>Барбершоп · Лиговский, 50 · до 22:00</small></div></section>
    <div class="mx-tg-body"><h3>Мастер</h3><div class="mx-masters"><span class="on"><i>А</i>Алексей<small>топ-барбер</small></span><span><i>Т</i>Тимур<small>барбер</small></span><span><i>М</i>Марк<small>барбер</small></span></div>
    <h3>Услуга</h3><div class="mx-svc"><p><span>Стрижка</span><b>1 800 ₽</b></p><p class="on"><span>Борода и контур</span><b>1 200 ₽</b></p><p><span>Комплекс</span><b>2 700 ₽</b></p><p><span>Детская стрижка</span><b>1 300 ₽</b></p></div>
    <h3>Дата</h3><div class="mx-days"><span>Пт<b>20</b></span><span class="on">Сб<b>21</b></span><span>Вс<b>22</b></span><span>Пн<b>23</b></span><span>Вт<b>24</b></span></div>
    <h3>Время</h3><div class="mx-slots"><span>12:00</span><span class="on">13:30</span><span>15:00</span><span class="off">16:00</span><span>17:30</span><span>19:00</span></div>
    <p class="mx-note">Напомним о визите за 2 часа. Отменить можно за 3 часа без списания.</p></div>
    <div class="mx-tg-main">Записаться · Сб, 21 · 13:30 · 1 200 ₽</div></div>`; } },

{ k:'pilates', feats:['Расписание на две недели','Запись и лист ожидания','Покупка абонемента онлайн','Пробное занятие и тренеры'], cat:'services', tag:'САЙТ · СТУДИЯ', t:'Студия пилатеса «Баланс»', d:'Расписание с записью на занятие, абонементы с оплатой онлайн и пробный визит.', url:'balance-studio.ru',
  prompt:'Сайт студии пилатеса: расписание с записью на занятие, абонементы с онлайн-оплатой, пробное занятие, светлый спокойный стиль',
  draw(g,W,H){ g.fillStyle='#F7F5F0'; g.fillRect(0,0,W,H); txt(g,'баланс',48,66,F('600',32),'#2E3B33'); ['Расписание','Абонементы','Тренеры','Контакты'].forEach((l,i)=>txt(g,l,500+i*126,62,F('500',19),'#5F6B63'));
    photo(g,'pilates',48,98,W-96,330,.5,.5); g.fillStyle='rgba(247,245,240,.0)';
    txt(g,'Пилатес на реформерах',48,490,F('600',46),'#1F2A23'); txt(g,'Группы до 6 человек · Хамовники',48,530,F('500',21),'#6F8F7A');
    btn(g,48,556,280,58,'Пробное за 990 ₽','#6F8F7A','#fff');
    [['Пн','08:00','Реформер · база'],['Пн','19:30','Реформер · про'],['Вт','09:00','Мат + растяжка']].forEach((r,i)=>{ const y=636+i*0; const x=380+i*212; g.fillStyle='#fff'; rr(g,x,556,196,170,14); g.fill(); txt(g,r[0]+' · '+r[1],x+16,596,F('700',20),'#1F2A23'); txt(g,r[2],x+16,628,F('500',17),'#5F6B63'); btn(g,x+16,664,164,44,'Записаться','#EEF2EE','#2E3B33',10,17); }); },
  html(){ const sch=[['Пн','08:00','Реформер · база','Анна','2 места'],['Пн','19:30','Реформер · продвинутый','Ольга','Нет мест'],['Вт','09:00','Мат + растяжка','Анна','4 места'],['Ср','20:00','Реформер · база','Мария','1 место'],['Чт','08:00','Пилатес для спины','Ольга','3 места'],['Сб','11:00','Реформер · база','Мария','5 мест']];
    return `<div class="mx mx-pil"><header class="mx-nav"><b class="mx-logo mx-sans">баланс</b><nav><a>Расписание</a><a>Абонементы</a><a>Тренеры</a><a>Контакты</a></nav><a class="mx-pill">Войти</a></header>
    <section class="mx-hero mx-full" style="${bg('pilates',.5,.5)}"><div class="mx-over mx-lightover"><h1>Пилатес<br>на реформерах</h1><p>Группы до 6 человек, Хамовники. Первое занятие — пробное.</p><a class="mx-btn">Пробное за 990 ₽</a></div></section>
    <section class="mx-sec"><div class="mx-row mx-between"><h2>Расписание</h2><div class="mx-tabs"><span class="on">Эта неделя</span><span>Следующая</span></div></div>
      <div class="mx-table">${sch.map(s=>`<p><b>${s[0]} · ${s[1]}</b><span>${s[2]}</span><small>${s[3]}</small><em class="${s[4]==='Нет мест'?'off':''}">${s[4]}</em><a class="mx-add">${s[4]==='Нет мест'?'В лист ожидания':'Записаться'}</a></p>`).join('')}</div></section>
    <section class="mx-sec"><h2>Абонементы</h2><div class="mx-grid3"><article class="mx-plan"><b>Разовое</b><span class="mx-price">1 500 ₽</span><small>Любое групповое занятие</small><a class="mx-btn mx-ghost">Купить</a></article><article class="mx-plan on"><b>8 занятий</b><span class="mx-price">9 600 ₽</span><small>1 200 ₽ за занятие · 6 недель</small><a class="mx-btn">Купить</a></article><article class="mx-plan"><b>Безлимит</b><span class="mx-price">14 900 ₽</span><small>Месяц, любые группы</small><a class="mx-btn mx-ghost">Купить</a></article></div></section>
    <footer class="mx-foot">Студия «Баланс» · Москва · Собрано в ZEUS</footer></div>`; } },

{ k:'dash', feats:['Обзор с периодами 7/30/90 дней','Заказы с фильтром и сменой статуса','Остатки товаров','Каналы привлечения'], cat:'tools', tag:'ИНСТРУМЕНТ · АНАЛИТИКА', t:'Панель продаж «Пудры»', d:'Выручка, заказы, остатки букетов и каналы — внутренний инструмент для команды мастерской.', url:'admin.pudra-flowers.ru',
  prompt:'Внутренняя панель продаж для цветочного магазина: выручка по дням, заказы и статусы, каналы привлечения, фильтр по периоду',
  draw(g,W,H){ g.fillStyle='#0C1222'; g.fillRect(0,0,W,H); g.fillStyle='#0F172B'; g.fillRect(0,0,200,H); txt(g,'Пудра · admin',24,52,F('700',20),'#DCE6FF');
    ['Обзор','Заказы','Товары','Клиенты','Каналы'].forEach((l,i)=>{ if(i===0){ g.fillStyle='#1B2A4D'; rr(g,14,88,172,44,10); g.fill(); } txt(g,l,30,117+i*52,F('500',19),i?'#8EA0C8':'#fff'); });
    [['Выручка · 30 дн','1 284 300 ₽','+18 %'],['Заказы','412','+9 %'],['Средний чек','4 980 ₽','+6 %']].forEach((k,i)=>{ const x=224+i*262; g.fillStyle='#131D36'; rr(g,x,32,244,130,14); g.fill(); txt(g,k[0],x+20,70,F('500',17),'#8EA0C8'); txt(g,k[1],x+20,118,F('700',30),'#fff'); txt(g,k[2],x+20,146,F('600',16),'#4ADE80'); });
    g.fillStyle='#131D36'; rr(g,224,184,768,330,14); g.fill(); txt(g,'Выручка по дням',248,222,F('600',19),'#DCE6FF');
    const v=[.42,.5,.46,.58,.55,.7,.62,.66,.74,.69,.81,.77,.88,.84,.95]; g.beginPath(); v.forEach((y,i)=>{ const x=250+i*51, yy=490-y*240; i?g.lineTo(x,yy):g.moveTo(x,yy); }); g.strokeStyle='#6EA0FF'; g.lineWidth=4; g.stroke();
    g.lineTo(250+14*51,490); g.lineTo(250,490); g.closePath(); const lg=g.createLinearGradient(0,250,0,490); lg.addColorStop(0,'rgba(110,160,255,.35)'); lg.addColorStop(1,'rgba(110,160,255,0)'); g.fillStyle=lg; g.fill();
    g.fillStyle='#131D36'; rr(g,224,534,768,206,14); g.fill(); txt(g,'Последние заказы',248,570,F('600',19),'#DCE6FF');
    [['#4127','Пионы · 15 шт.','5 900 ₽','Оплачен','#4ADE80'],['#4126','Белые розы','4 700 ₽','В доставке','#60A5FA'],['#4125','Сухоцветы','3 400 ₽','Новый','#FBBF24']].forEach((o,i)=>{ const y=610+i*42; txt(g,o[0],248,y,F('600',17),'#8EA0C8'); txt(g,o[1],330,y,F('500',17),'#DCE6FF'); txt(g,o[2],660,y,F('600',17),'#fff'); txt(g,o[3],820,y,F('600',16),o[4]); }); },
  html(){ const orders=[['#4127','Ваза «Уголь»','Ирина К.','3 900 ₽','Оплачен','ok'],['#4126','Чаша «Графит» × 2','Павел С.','3 200 ₽','В доставке','go'],['#4125','Стакан «Мел»','Анна В.','1 200 ₽','Новый','new'],['#4124','Ваза «Песок»','Олег Д.','2 400 ₽','Оплачен','ok'],['#4123','Набор чаш','Мария Л.','3 800 ₽','Возврат','bad']];
    const bars=[42,50,46,58,55,70,62,66,74,69,81,77,88,84,95];
    return `<div class="mx mx-dash"><aside><b>Глина · admin</b><a class="on">Обзор</a><a>Заказы</a><a>Товары</a><a>Клиенты</a><a>Каналы</a></aside><main>
    <div class="mx-row mx-between"><h2>Обзор</h2><div class="mx-tabs"><span>7 дней</span><span class="on">30 дней</span><span>Квартал</span></div></div>
    <div class="mx-kpis"><p><small>Выручка</small><b>1 284 300 ₽</b><em>+18 %</em></p><p><small>Заказы</small><b>412</b><em>+9 %</em></p><p><small>Средний чек</small><b>3 117 ₽</b><em>+6 %</em></p><p><small>Конверсия</small><b>3,4 %</b><em>+0,4 п.</em></p></div>
    <div class="mx-panel"><h3>Выручка по дням</h3><div class="mx-bars">${bars.map(b=>`<i style="height:${b}%"></i>`).join('')}</div></div>
    <div class="mx-two"><div class="mx-panel"><h3>Каналы</h3>${[['Telegram',38],['ВКонтакте',24],['Поиск',21],['Прямые',17]].map(c=>`<p class="mx-ch"><span>${c[0]}</span><i><u style="width:${c[1]*2.4}%"></u></i><b>${c[1]} %</b></p>`).join('')}</div>
    <div class="mx-panel"><h3>Последние заказы</h3>${orders.map(o=>`<p class="mx-ord"><small>${o[0]}</small><span>${o[1]}<br><small>${o[2]}</small></span><b>${o[3]}</b><em class="st-${o[5]}">${o[4]}</em></p>`).join('')}</div></div>
    </main></div>`; } }
];
function bg(k,fx,fy){ return `background-image:url(${PHOTOS[k]});background-size:cover;background-position:${fx*100}% ${fy*100}%`; }
function bgCrop(k,c,A){ // show crop c=[x,y,w,h] (fractions of a 3:2 photo) covering an element of aspect A (w/h)
  A=A||4/3; const IA=1.5, S=Math.max(1/c[2], (1/c[3])*(A/IA)), imgH=S/IA, elH=1/A, cx=c[0]+c[2]/2, cy=c[1]+c[3]/2;
  const cl=v=>Math.min(100,Math.max(0,v*100)); const px=S>1?cl((cx*S-.5)/(S-1)):50, py=imgH>elH?cl((cy*imgH-elH/2)/(imgH-elH)):50;
  return `background-image:url(${PHOTOS[k]});background-size:${(S*100).toFixed(1)}% auto;background-position:${px.toFixed(1)}% ${py.toFixed(1)}%`; }
/* public API */
window.EXAMPLES = EX; window.exBg=bg; window.exBgCrop=bgCrop; window.exPhotos=PHOTOS;
window.exCanvas = function(k){ const W=1024,H=768, c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d');
  g.save(); rr(g,0,0,W,H,40); g.clip(); EX.find(e=>e.k===k).draw(g,W,H); g.restore();
  g.strokeStyle='rgba(140,185,255,.5)'; g.lineWidth=5; rr(g,2.5,2.5,W-5,H-5,38); g.stroke(); return c; };
window.exHTML = k => EX.find(e=>e.k===k).html();
})();
