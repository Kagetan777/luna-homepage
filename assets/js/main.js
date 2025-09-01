// 年齢確認（Cookie 30日）
(function(){
  const key='age-verified-v1';
  const gate=document.getElementById('ageGate');
  const under=document.getElementById('btnUnder');
  const over=document.getElementById('btnOver');
  const saved=document.cookie.split('; ').find(v=>v.startsWith(key+'='));
  if(saved?.split('=')[1]==='yes'){ gate.style.display='none'; }
  if(over) over.addEventListener('click',()=>{
    const d=new Date(); d.setDate(d.getDate()+30);
    document.cookie=key+'=yes; expires='+d.toUTCString()+'; path=/';
    gate.style.display='none';
  });
  if(under) under.addEventListener('click',()=>{ window.location.href='https://www.google.co.jp'; });
})();

// SPナビ
const navBtn = document.getElementById('navOpen');
if (navBtn) {
  navBtn.addEventListener('click',()=>{
    const n=document.getElementById('spNav');
    n.classList.toggle('hidden');
  });
}

// 営業中バッジ（19:00-翌2:00）
(function(){
  const now=new Date();
  const h=now.getHours();
  const openNow = (h>=20 || h<1);
  const badge=document.getElementById('openNow');
  if (badge){
    badge.textContent=openNow?'営業中':'営業時間外';
    badge.className+=' ' + (openNow?'bg-green-600':'bg-neutral-700');
  }
})();

// 年表表記
const yearEl = document.getElementById('year');
if (yearEl){ yearEl.textContent=new Date().getFullYear(); }

// === Hero 画像ローテーション ===
// === Hero 画像ローテーション＋ゆっくりズーム ===
// === Hero：クロスフェード + Ken Burns（2レイヤー方式） ===
// === Hero：クロスフェード + Ken Burns（3レイヤー：A/B/C）＋手動操作 ===
(function(){
  const layers = ['heroA','heroB','heroC'].map(id => document.getElementById(id)).filter(Boolean);
  const dotsWrap = document.getElementById('heroDots');
  const prevBtn  = document.querySelector('.hero-prev');
  const nextBtn  = document.querySelector('.hero-next');
  if (layers.length < 3) return;

  // 回す画像（自由に増減OK）
  const slides = [
    'img/tennai.jpg',
    'img/a.jpg',
    'img/kanban.jpg'
  ];

  // プリロード
  slides.forEach(src => { const im = new Image(); im.src = src; });

  // ドット生成
  const dots = slides.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'hero-dot' + (i===0 ? ' active' : '');
    d.addEventListener('click', () => go(i));
    dotsWrap && dotsWrap.appendChild(d);
    return d;
  });

  // 設定
  const INTERVAL = 7000;  // 1枚表示時間
  const FADE     = 900;   // フェード時間（CSSと合わせる）
  let curSlide = 0;       // 現在のスライドindex
  let front    = 0;       // いま前面にいるレイヤーindex（0:A, 1:B, 2:C）
  let timer    = null;

  // 方向（左/右）をスライドindexで交互に
  function setDir(el, i){
    el.classList.remove('kb-left','kb-right');
    el.classList.add(i % 2 ? 'kb-right' : 'kb-left');
  }

  // 初期化：frontを表示、他は待機
  layers.forEach(el => el.classList.remove('show','hide','kb-in','kb-out','kb-left','kb-right'));
  layers[front].src = slides[0];
  setDir(layers[front], 0);
  layers[front].classList.add('show','kb-in');

  const back  = (front + 1) % 3;
  const idle  = (front + 2) % 3;
  layers[back].classList.add('hide','kb-out','kb-right');
  layers[idle].classList.add('hide','kb-out','kb-left');

  function step(nextIndex){
    const nextLayer = (front + 1) % 3;       // 次に表に出すレイヤー
    const idleLayer = (front + 2) % 3;       // 待機レイヤー（非表示のまま）

    const frontEl = layers[front];
    const backEl  = layers[nextLayer];
    const idleEl  = layers[idleLayer];

    // 待機レイヤーは確実に非表示へ
    idleEl.classList.remove('show','kb-in');
    idleEl.classList.add('hide','kb-out');

    // 背面レイヤーに次画像を仕込み＋方向付け
    backEl.src = slides[nextIndex];
    backEl.classList.remove('show','hide','kb-in','kb-out','kb-left','kb-right');
    setDir(backEl, nextIndex);
    backEl.classList.add('kb-out','hide');

    // クロスフェード開始
    requestAnimationFrame(() => {
      frontEl.classList.remove('kb-in','show');
      frontEl.classList.add('kb-out','hide');

      backEl.classList.remove('kb-out','hide');
      backEl.classList.add('kb-in','show');

      setTimeout(() => {
        front    = nextLayer;     // 前面レイヤーを更新
        curSlide = nextIndex;     // 現在スライドを更新
        updateDots();
      }, FADE);
    });
  }

  function updateDots(){ dots.forEach((d,i)=> d.classList.toggle('active', i===curSlide)); }
  function next(){ step( (curSlide + 1) % slides.length ); restart(); }
  function prev(){ step( (curSlide - 1 + slides.length) % slides.length ); restart(); }
  function go(i){ step(i); restart(); }

  function restart(){
    if (timer) clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);
  restart();
})();


// === スクロールで Concept 見出しを左から出す ===
(function(){
  const els = document.querySelectorAll('.reveal-left');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  els.forEach(el=> io.observe(el));
})();

// === スマホメニュー（安定版：hiddenトグル） ===
(function(){
  const header = document.querySelector('header');
  const btn = document.getElementById('navOpen');
  const panel = document.getElementById('spNav');
  if(!header || !btn || !panel) return;

  // 開閉（先頭へ飛ばない）
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    panel.classList.toggle('hidden');
  });

  // メニュー内リンク：#id はスムーズスクロール、それ以外は通常遷移
  panel.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    panel.classList.add('hidden'); // まず閉じる

    if (href.startsWith('#')){
      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if(!target) return;
      const off = (header?.offsetHeight || 56) + 8;
      const y = target.getBoundingClientRect().top + window.pageYOffset - off;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  // 画面が広がったら閉じる（状態リセット）
  const mq = window.matchMedia('(min-width:768px)');
  (mq.addEventListener ? mq.addEventListener : mq.addListener).call(mq, 'change', ()=> panel.classList.add('hidden'));
})();
// === スマホメニュー：hiddenトグルで開閉（先頭へ飛ばない & スムーススクロール） ===
(function(){
  const header = document.querySelector('header');
  const btn    = document.getElementById('navOpen');
  const panel  = document.getElementById('spNav');
  if(!btn || !panel) return;

  function close(){ panel.classList.add('hidden'); }
  function toggle(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    panel.classList.toggle('hidden');
  }

  // ボタンで開閉
  btn.addEventListener('click', toggle);

  // メニュー内リンク：#id ならスクロール、それ以外は通常遷移。いずれも閉じる
  panel.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    close();
    if(href.startsWith('#')){
      e.preventDefault();
      const id = href.slice(1);
      const t = document.getElementById(id);
      if(!t) return;
      const off = (header?.offsetHeight || 56) + 8;
      const y = t.getBoundingClientRect().top + window.pageYOffset - off;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  // 画面が広がったら閉じる（状態リセット）
  const mq = window.matchMedia('(min-width:768px)');
  (mq.addEventListener ? mq.addEventListener : mq.addListener).call(mq, 'change', ()=> close());

  // ESCで閉じる
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
})();
