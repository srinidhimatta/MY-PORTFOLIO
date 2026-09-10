const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];
let mouse = {x: -9999, y: -9999};

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  particles = Array.from({length: Math.min(95, Math.floor(innerWidth / 15))}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*1.4+.2,
    vx: (Math.random()-.5)*.18,
    vy: (Math.random()-.5)*.18
  }));
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
    if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
    const d = Math.hypot(p.x-mouse.x,p.y-mouse.y);
    const alpha = d < 180 ? .7 : .3;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(165,210,255,${alpha})`;ctx.fill();
  }
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<105){
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(118,164,255,${(1-d/105)*.11})`;ctx.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
}
addEventListener("resize",resize);
addEventListener("pointermove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
resize();draw();

const reveal = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.animate(
        [{opacity:0,transform:"translateY(28px)"},{opacity:1,transform:"translateY(0)"}],
        {duration:800,easing:"cubic-bezier(.2,.7,.2,1)",fill:"forwards"}
      );
      reveal.unobserve(entry.target);
    }
  });
},{threshold:.12});
document.querySelectorAll(".section > *, .project-card, .stat, .timeline-item").forEach(el=>{
  el.style.opacity="0"; reveal.observe(el);
});

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",e=>{
    const target=document.querySelector(a.getAttribute("href"));
    if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"});}
  });
});

/* ==========================================================
   HERO V2 INTERACTIONS — first screen only
   ========================================================== */
(() => {
  const stage = document.getElementById('heroStage');
  const portraitWrap = document.getElementById('portrait');
  const orbitParticles = document.getElementById('orbitParticles');
  if (!stage || !portraitWrap) return;

  /* Small luminous particles orbit BEHIND the portrait image. */
  if (orbitParticles) {
    const count = window.matchMedia('(max-width: 540px)').matches ? 16 : 30;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('i');
      dot.className = 'orbit-particle';
      const radius = 150 + Math.random() * 155;
      const size = .55 + Math.random() * 1.5;
      const duration = 9 + Math.random() * 16;
      const delay = -Math.random() * duration;
      const start = Math.random() * 360;
      dot.style.setProperty('--r', `${radius}px`);
      dot.style.setProperty('--s', size.toFixed(2));
      dot.style.animationDuration = `${duration}s`;
      dot.style.animationDelay = `${delay}s`;
      dot.style.transform = `rotate(${start}deg) translateX(${radius}px) scale(${size})`;
      dot.style.opacity = (.28 + Math.random() * .65).toFixed(2);
      orbitParticles.appendChild(dot);
    }
  }

  /* Mouse parallax: portrait and UI cards move at different depths. */
  const floaters = [...stage.querySelectorAll('[data-depth]')];
  let targetX = 0, targetY = 0, smoothX = 0, smoothY = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      targetX = (e.clientX / innerWidth - .5);
      targetY = (e.clientY / innerHeight - .5);
    }, { passive: true });

    const animateHero = () => {
      smoothX += (targetX - smoothX) * .055;
      smoothY += (targetY - smoothY) * .055;

      /* Keep the portrait movement subtle. */
      const px = smoothX * 8;
      const py = smoothY * -6;
      portraitWrap.style.transform = `translate(-50%,-50%) rotateX(${py}deg) rotateY(${px}deg)`;

      const t = performance.now() * 0.001;
      floaters.forEach((el, index) => {
        const d = Number(el.dataset.depth || 8);
        const baseRot = el.classList.contains('dream-card') ? -8 :
                        el.classList.contains('code-card') ? -7 :
                        el.classList.contains('goals-card') ? -7 :
                        el.classList.contains('travel-card') ? -4 :
                        el.classList.contains('scribble-right') ? -7 :
                        el.classList.contains('scribble-bottom') ? -10 : 0;
        const driftX = Math.sin(t * (0.55 + index * 0.035) + index) * 2.2;
        const driftY = Math.cos(t * (0.48 + index * 0.03) + index * 0.8) * 3.0;
        const x = smoothX * d + driftX;
        const y = smoothY * d * .72 + driftY;
        el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${baseRot}deg)`;
      });
      requestAnimationFrame(animateHero);
    };
    animateHero();
  }
})();
