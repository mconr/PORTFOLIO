// Navigation hamburger (classe .open)
(() => {
  const menu = document.querySelector('.menu-link');
  const nav = document.querySelector('header nav');
  if (!menu || !nav) return;

  const list = nav.querySelector('ul'); // compat CSS existante (ul.active)
  const toggle = () => {
    const isOpen = nav.classList.toggle('open');
    if (list) list.classList.toggle('active', isOpen); // garde l’ancien style si utilisé
    menu.setAttribute('aria-expanded', String(isOpen));
  };
  menu.addEventListener('click', toggle);
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    if (list) list.classList.remove('active');
    menu.setAttribute('aria-expanded','false');
  }));
})();

// Smooth scroll avec offset header
(() => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

// Morphing text sécurisé (ne tourne que si #text1/#text2 existent)
(() => {
  const t1 = document.getElementById('text1');
  const t2 = document.getElementById('text2');
  if (!t1 || !t2) return;

  const texts = [
    "Développeur Logiciel",
    "Full‑stack Java & Python",
    "Spring Boot • React",
    "Django • Tailwind CSS",
    "SQL • Git • Docker"
  ];
  const morphTime = 1.2, cooldownTime = 0.6;
  let textIndex = 0, time = new Date(), morph = 0, cooldown = cooldownTime;

  t1.textContent = texts[textIndex % texts.length];
  t2.textContent = texts[(textIndex + 1) % texts.length];

  function setMorph(fraction) {
    t2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    t2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    fraction = 1 - fraction;
    t1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    t1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    t1.textContent = texts[textIndex % texts.length];
    t2.textContent = texts[(textIndex + 1) % texts.length];
  }
  function doMorph() { morph -= cooldown; cooldown = 0; let f = morph / morphTime; if (f > 1) { cooldown = cooldownTime; f = 1; } setMorph(f); }
  function doCooldown() { morph = 0; t2.style.filter = ""; t2.style.opacity = "100%"; t1.style.filter = ""; t1.style.opacity = "0%"; }

  (function animate() {
    requestAnimationFrame(animate);
    const newTime = new Date(); const dt = (newTime - time) / 1000; time = newTime;
    cooldown -= dt;
    if (cooldown <= 0) { if (cooldown < 0) textIndex++; doMorph(); } else { doCooldown(); }
  })();
})();

// Reveal on scroll
(() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.section .card, .section .item, .section .list li').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(12px)';
    obs.observe(el);
  });
  const style = document.createElement('style');
  style.textContent = `.section .in { opacity: 1 !important; transform: none !important; transition: all .5s ease; }`;
  document.head.appendChild(style);
})();

// ---- Modal projets (avec bouton “Détails” + image) ----
(() => {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const titleEl = modal.querySelector('.modal-title');
  const descEl  = modal.querySelector('.modal-desc');
  const stackEl = modal.querySelector('.modal-meta .stack');
  const ghBtn   = modal.querySelector('#modal-github');
  const mediaEl = modal.querySelector('.modal-media');
  const imgEl   = modal.querySelector('.modal-image');
  const closeBtn= modal.querySelector('.modal-close');
  let lastFocus = null;

  function slugify(str=''){
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  function addCaseVariants(path){
    const out = [path];
    if (path.startsWith('/media/')) out.push(path.replace('/media/','/Media/'));
    if (path.startsWith('/Media/')) out.push(path.replace('/Media/','/media/'));
    return out;
  }

  function loadImageCandidates(candidates){
    if (!mediaEl || !imgEl){ return; }
    const list = Array.from(new Set(
      (candidates || []).flatMap(addCaseVariants)
    )).filter(Boolean);

    if (!list.length){ mediaEl.hidden = true; return; }

    let i = 0;
    mediaEl.hidden = true;

    const tryNext = () => {
      if (i >= list.length){ mediaEl.hidden = true; return; }
      const raw = list[i++];

      // encode les espaces/accents mais conserve les /
      const src = encodeURI(raw);
      imgEl.onload = () => { mediaEl.hidden = false; imgEl.onload = null; imgEl.onerror = null; };
      imgEl.onerror = tryNext;
      imgEl.src = src;
    };
    tryNext();
  }

  function openModal(data){
    titleEl.textContent = data.title || '';
    descEl.textContent  = data.desc || '';
    stackEl.textContent = data.stack || '';
    imgEl.alt = data.title ? `Illustration du projet ${data.title}` : 'Illustration du projet';

    if (data.github && data.github !== '#') {
      ghBtn.href = data.github; ghBtn.classList.remove('is-disabled'); ghBtn.setAttribute('aria-disabled','false');
    } else {
      ghBtn.href = '#'; ghBtn.classList.add('is-disabled'); ghBtn.setAttribute('aria-disabled','true');
    }

    const cands = [];
    if (data.img) cands.push(data.img);
    const s = slugify(data.title || '');
    if (s) {
      cands.push(`/Media/img/projets/${s}.webp`, `/Media/img/projets/${s}.jpg`, `/Media/img/projets/${s}.png`);
    }
    loadImageCandidates(cands);

    lastFocus = document.activeElement;
    modal.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    closeBtn.focus();

    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal(){
    modal.setAttribute('hidden','');
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();

    modal.removeEventListener('keydown', trapFocus);
  }

  function trapFocus(e){
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const list = Array.from(focusables).filter(el => el.offsetParent !== null);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  document.querySelectorAll('.cards .card').forEach(card => {
    if (!card.querySelector('.card-hover')){
      const hover = document.createElement('div');
      hover.className = 'card-hover';
      hover.innerHTML = '<button type="button" class="btn btn-sm btn-details">Détails</button>';
      card.appendChild(hover);
      hover.querySelector('.btn-details').addEventListener('click', (e) => { e.stopPropagation(); open(); });
    }
    const open = () => openModal({
      title: card.dataset.title,
      desc:  card.dataset.desc,
      stack: card.dataset.stack,
      github: card.dataset.github,
      img:   card.dataset.img
    });
    card.addEventListener('click', open);
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal(); });
})();

// ---- Contact (copie + chips + mailto) ----
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const subjectInput = document.getElementById('subject-input');
  const toast = document.getElementById('copy-toast');
  const to = 'MonirChelh05@gmail.com';

  document.querySelectorAll('.chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (subjectInput) subjectInput.value = chip.dataset.subject || '';
    });
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const txt = btn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(txt);
        if (toast) { toast.textContent = 'Copié: ' + txt; toast.removeAttribute('hidden'); setTimeout(() => toast.setAttribute('hidden',''), 1400); }
      } catch { /* fallback simple */ }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name')||'').trim();
    const email= String(fd.get('email')||'').trim();
    const subject=String(fd.get('subject')||'').trim();
    const message=String(fd.get('message')||'').trim();
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk || !subject || !message){ status.textContent='Veuillez compléter correctement tous les champs.'; return; }
    const mailto=`mailto:${to}?subject=${encodeURIComponent(subject+' — '+name)}&body=${encodeURIComponent(message+'\n\n— '+name+' <'+email+'>')}`;
    status.textContent='Ouverture de votre client e‑mail…';
    window.location.href=mailto;
    setTimeout(()=>{ form.reset(); status.textContent='Message prêt dans votre client e‑mail.'; },1200);
  });
})();