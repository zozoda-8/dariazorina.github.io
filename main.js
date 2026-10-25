
const themeToggle=document.querySelector('.theme-debug-toggle');
const syncThemeControl=()=>{
 const dark=document.documentElement.dataset.theme==='dark';
 themeToggle.setAttribute('aria-pressed',String(dark));
 themeToggle.querySelector('.theme-icon-sun').toggleAttribute('hidden',dark);
 themeToggle.querySelector('.theme-icon-moon').toggleAttribute('hidden',!dark);
 const label=dark?'Тёмная тема. Включить светлую':'Светлая тема. Включить тёмную';
 themeToggle.setAttribute('aria-label',label);
 themeToggle.title=label;
 document.querySelector('meta[name="theme-color"]').content=getComputedStyle(document.documentElement).getPropertyValue('--color-bg-page').trim();
};
themeToggle.addEventListener('click',()=>{
 const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
 document.documentElement.dataset.theme=theme;
 try{localStorage.setItem('darya-theme',theme)}catch{}
 syncThemeControl();
});
syncThemeControl();
// Shared scroll reveal for the help grid and lesson-format list.
const initializeScrollReveal=(container,itemSelector)=>{
 const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(!container || !('IntersectionObserver' in window) || motionPreference.matches)return;
 const observer=new IntersectionObserver(entries=>{
  entries.sort((a,b)=>a.target.offsetTop-b.target.offsetTop||a.target.offsetLeft-b.target.offsetLeft).forEach((entry,index)=>{
   // Reverse at the lower viewport edge; keep content revealed after it passes above.
   const revealEdge=entry.rootBounds?.bottom ?? window.innerHeight-48;
   const revealed=entry.boundingClientRect.top<=revealEdge-entry.boundingClientRect.height*.2;
   entry.target.style.setProperty('--reveal-delay',revealed?`${index*140}ms`:'0ms');
   entry.target.classList.toggle('is-revealed',revealed);
  });
 },{threshold:.2,rootMargin:'0px 0px -48px 0px'});
 container.classList.add('is-reveal-ready');
 container.querySelectorAll(itemSelector).forEach(item=>observer.observe(item));
 motionPreference.addEventListener('change',()=>{
  if(motionPreference.matches){observer.disconnect();container.classList.remove('is-reveal-ready')}
 });
};
initializeScrollReveal(document.querySelector('.goals'),'.goal');
initializeScrollReveal(document.querySelector('.format-details'),'.format-row');
// Reveal the photos from a compact stack into the original spread, reversibly.
const photoStack=document.querySelector('.photo-stack');
const photoMotionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
let photoScrollFrame=0;
const updatePhotoUnfold=()=>{
 photoScrollFrame=0;
 const top=photoStack.getBoundingClientRect().top;
 const viewport=window.innerHeight;
 const progress=photoMotionPreference.matches?1:Math.max(0,Math.min(1,(viewport*.9-top)/(viewport*.65)));
 const eased=progress*progress*(3-2*progress);
 photoStack.style.setProperty('--photo-open',(.5+.5*eased).toFixed(4));
 photoStack.classList.toggle('is-open',progress===1);
};
const schedulePhotoUnfold=()=>{if(!photoScrollFrame)photoScrollFrame=requestAnimationFrame(updatePhotoUnfold)};
window.addEventListener('scroll',schedulePhotoUnfold,{passive:true});
window.addEventListener('resize',schedulePhotoUnfold);
window.addEventListener('pageshow',schedulePhotoUnfold);
photoMotionPreference.addEventListener('change',schedulePhotoUnfold);
updatePhotoUnfold();
// Animate to the actual capsule radius, so rounding uses the full duration.
const updateButtonRadius=button=>button.style.setProperty('--radius-control-hover',`${button.getBoundingClientRect().height/2}px`);
const buttonRadiusObserver=new ResizeObserver(entries=>entries.forEach(entry=>updateButtonRadius(entry.target)));
document.querySelectorAll('.btn,.price-card button').forEach(button=>{updateButtonRadius(button);buttonRadiusObserver.observe(button)});

// The footer fills the viewport; its reveal and header theme reverse on scroll.
const closingSection=document.querySelector('.closing');
const siteHeader=document.querySelector('header');
const heroSection=document.querySelector('.hero-section');
let footerFrame=0;
const updateFooterReveal=()=>{
 footerFrame=0;
 const headerRect=siteHeader.getBoundingClientRect();
 const headerTop=headerRect.top;
 document.documentElement.style.setProperty('--site-header-height',`${headerRect.height}px`);
 const heroRect=heroSection.getBoundingClientRect();
 siteHeader.classList.toggle('is-hero-overlap',heroRect.top<=headerRect.bottom && heroRect.bottom>headerRect.bottom);
 const viewportHeight=window.innerHeight;
 const footerTop=closingSection.getBoundingClientRect().top;
 const progress=Math.max(0,Math.min(1,(viewportHeight-footerTop)/Math.max(1,viewportHeight)));
 closingSection.style.setProperty('--footer-reveal',String(progress));
 siteHeader.classList.toggle('is-footer-joined',footerTop<=headerTop+0.5);
};
const scheduleFooterReveal=()=>{if(!footerFrame)footerFrame=requestAnimationFrame(updateFooterReveal)};
window.addEventListener('scroll',scheduleFooterReveal,{passive:true});
window.addEventListener('resize',scheduleFooterReveal);
window.addEventListener('pageshow',scheduleFooterReveal);
new ResizeObserver(scheduleFooterReveal).observe(siteHeader);
updateFooterReveal();

// Calendar-year experience: eight years in 2026 means a 2018 start.
const updateExperience=()=>{const year=new Date().getFullYear();document.querySelectorAll('[data-experience-start]').forEach(el=>{el.textContent=String(Math.max(0,year-Number(el.dataset.experienceStart)))})};
updateExperience();
window.addEventListener('pageshow',updateExperience);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateExperience()});

document.querySelectorAll('.price-card').forEach(card=>card.addEventListener('click',event=>{if(!event.target.closest('button,a'))card.querySelector('button.book').click()}));
const dialog=document.getElementById('booking');document.querySelectorAll('.book').forEach(b=>b.addEventListener('click',()=>{document.getElementById('dialog-title').textContent=b.dataset.plan||'Ознакомительная встреча';document.getElementById('plan-note').textContent=b.dataset.plan?'Обсудим детали и удобное время лично.':'Бесплатно · 45–60 минут · онлайн';dialog.showModal()}));document.querySelectorAll('.close,.close-bottom').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
