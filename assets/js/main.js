/* BS Barbearia — interações. Sem dependências. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WHATS = '5585987363821';
  const wa = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
  const online = /^https?:$/.test(location.protocol);

  /* ---------- Horário (edite aqui) — 0 = domingo ... 6 = sábado ---------- */
  const HOURS = {
    0: null,
    1: [8.5, 19.5], 2: [8.5, 19.5], 3: [8.5, 19.5], 4: [8.5, 19.5], 5: [8.5, 19.5],
    6: [8.5, 18],
  };
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const fmt = (h) => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`; };

  (function status() {
    const d = new Date();
    const now = new Date(d.getTime() + d.getTimezoneOffset() * 60000 - 3 * 3600000); // Fortaleza, UTC-3
    const day = now.getDay(), t = now.getHours() + now.getMinutes() / 60;
    document.querySelector(`.hours tr[data-day="${day}"]`)?.classList.add('is-today');

    const txt = document.querySelector('[data-status]');
    const dot = document.querySelector('[data-status-dot]');
    if (!txt) return;
    const today = HOURS[day];
    if (today && t >= today[0] && t < today[1]) {
      dot?.classList.add('is-open');
      txt.textContent = `Aberto agora · até ${fmt(today[1])}`;
      return;
    }
    for (let i = 0; i < 8; i++) {
      const dd = (day + i) % 7, h = HOURS[dd];
      if (!h || (i === 0 && t >= h[0])) continue;
      const quando = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : DIAS[dd];
      txt.textContent = `Fechado · abre ${quando} às ${fmt(h[0])}`;
      return;
    }
  })();

  /* ---------- Cortes -> WhatsApp com mensagem pronta ---------- */
  document.querySelectorAll('.cut[data-cut]').forEach((a) => {
    let msg = `Olá! Vi no site o corte *${a.dataset.cut}* e quero fazer igual. Tem horário disponível?`;
    if (online && a.dataset.img) msg += `\n\nFoto de referência: ${new URL(a.dataset.img, location.href).href}`;
    a.href = wa(msg);
  });
  const custom = document.querySelector('[data-cut-custom]');
  if (custom) custom.href = wa('Olá! Tenho uma foto de referência de corte. Posso mandar pra vocês verem se combina comigo?');

  /* ---------- Serviços -> WhatsApp ---------- */
  document.querySelectorAll('[data-svc]').forEach((a) => {
    a.href = wa(`Olá! Quero agendar *${a.dataset.svc}*. Quanto fica e qual o próximo horário livre?`);
  });

  /* ---------- Header ---------- */
  const header = document.querySelector('.header');
  const mobileCta = document.querySelector('.mobile-cta');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-solid', y > 30);
    if (!document.body.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 420);
    mobileCta?.classList.toggle('is-visible', y > innerHeight * 0.6);
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('menu');
  const toggle = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => toggle(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });

  /* ---------- Revelar ao rolar ---------- */
  const els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Nota: contador de 0,0 até 4,9 ---------- */
  const score = document.querySelector('[data-count]');
  if (score && 'IntersectionObserver' in window && !reduceMotion) {
    const target = parseFloat(score.dataset.count);
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        score.textContent = (target * e).toFixed(1).replace('.', ',');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(score);
  }

  /* ---------- Mapa só carrega quando pedido ---------- */
  const mapBtn = document.querySelector('[data-map-src]');
  mapBtn?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = mapBtn.dataset.mapSrc;
    f.title = 'Localização da BS Barbearia no mapa';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    mapBtn.replaceWith(f);
  });

  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
