/* ================= Views ================= */
const views = {home:home, message:message, story:story};
const gift = document.getElementById('gift');
const bgm  = document.getElementById('bgm');
const musicBtn = document.getElementById('music');

function show(name){
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
  views[name].scrollTop = 0;
  document.body.dataset.view = name;
  if(name === 'home') gift.classList.remove('open');   // so she can open it again
}

/* ================= Open button + music ================= */
document.getElementById('open').addEventListener('click', () => {
  gift.classList.add('open');
  for(let i=0;i<24;i++) setTimeout(heart, i*40);
  document.body.classList.add('opened');
  playMusic();                                           // browsers need a tap to start audio
  setTimeout(() => show('message'), 1000);
});

function playMusic(){
  const p = bgm.play();
  if(p && p.then) p.then(() => musicBtn.textContent='🎵').catch(() => musicBtn.textContent='🔇');
}
musicBtn.addEventListener('click', () => {
  if(bgm.paused){ playMusic(); } else { bgm.pause(); musicBtn.textContent='🔇'; }
});

document.getElementById('more').addEventListener('click', () => show('story'));
document.getElementById('backMsg').addEventListener('click', () => show('message'));
document.getElementById('close').addEventListener('click', () => show('home'));

/* ================= Floating hearts ================= */
const hs = document.getElementById('hearts'), EMOJI = ['💜','💗','💛','🖤','💖'];
function heart(){
  const h = document.createElement('span');
  h.className = 'h';
  h.textContent = EMOJI[Math.random()*EMOJI.length|0];
  h.style.left = Math.random()*100 + '%';
  h.style.fontSize = (14 + Math.random()*22) + 'px';
  h.style.animationDuration = (5 + Math.random()*5) + 's';
  hs.appendChild(h);
  setTimeout(() => h.remove(), 10500);
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(heart, 700);

/* ================= Water ripple (tap/click anywhere) ================= */
const cv = document.getElementById('ripple'), ctx = cv.getContext('2d');
let dpr = 1, ripples = [], running = false, n = 0;
const COLORS = ['255,79,163','176,110,255','255,210,63'];     // pink, purple, yellow

function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width  = innerWidth  * dpr;
  cv.height = innerHeight * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();
addEventListener('resize', resize);

addEventListener('pointerdown', e => {
  ripples.push({x:e.clientX, y:e.clientY, t:performance.now(), c:COLORS[n++ % COLORS.length]});
  if(!running){ running = true; requestAnimationFrame(draw); }
}, {passive:true});

const ease = p => 1 - Math.pow(1 - p, 3);

function draw(now){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  const maxR = Math.min(300, Math.max(innerWidth, innerHeight) * .32);
  ripples = ripples.filter(r => (now - r.t) < 2200);
  for(const r of ripples){
    const age = (now - r.t) / 2000;
    // soft water glow under the rings
    const gp = ease(Math.min(age*1.2,1));
    const g = ctx.createRadialGradient(r.x,r.y,0,r.x,r.y,maxR*gp+1);
    g.addColorStop(0,`rgba(${r.c},0)`);
    g.addColorStop(.7,`rgba(${r.c},${.12*(1-age)})`);
    g.addColorStop(1,`rgba(${r.c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(r.x,r.y,maxR*gp+1,0,Math.PI*2); ctx.fill();
    // 4 expanding rings
    for(let i=0;i<4;i++){
      const a = age - i*.1;
      if(a <= 0 || a >= 1) continue;
      const rad = ease(a) * maxR;
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, Math.PI*2);
      ctx.lineWidth = Math.max(.5, 4*(1-a));
      ctx.strokeStyle = `rgba(${r.c},${.85*(1-a)})`;
      ctx.stroke();
    }
  }
  if(ripples.length) requestAnimationFrame(draw);
  else { running = false; ctx.clearRect(0,0,innerWidth,innerHeight); }
}
