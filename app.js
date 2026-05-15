/* ============================================================
   STUDIOS AVENIDA II — app.js
   ============================================================ */

(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Register GSAP plugin if available
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     Lenis smooth scroll
     ---------------------------------------------------------- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  /* ----------------------------------------------------------
     Split helper for .split-animate
     ---------------------------------------------------------- */
  function splitWords(el) {
    if (el.dataset.split === '1') return;
    const text = el.textContent;
    el.textContent = '';
    text.split(/(\s+)/).forEach((piece) => {
      if (!piece.trim()) {
        el.appendChild(document.createTextNode(piece));
        return;
      }
      const wrap = document.createElement('span');
      wrap.className = 'word-wrap';
      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.textContent = piece;
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
    el.dataset.split = '1';
  }

  $$('.split-animate').forEach(splitWords);

  /* ----------------------------------------------------------
     Preloader
     ---------------------------------------------------------- */
  const loader = $('#loader');
  const loaderBar = $('.loader-bar', loader);
  const loaderPct = $('#loaderPct');

  function runLoader(onDone) {
    let pct = 0;
    const start = performance.now();
    const minDuration = 1400;

    const tick = () => {
      const elapsed = performance.now() - start;
      const target = Math.min(100, (elapsed / minDuration) * 100);
      pct += (target - pct) * 0.2;
      const display = Math.floor(pct).toString().padStart(3, '0');
      if (loaderPct) loaderPct.textContent = display;
      if (loaderBar) loaderBar.style.inset = `0 ${100 - pct}% 0 0`;

      if (pct < 99.5) {
        requestAnimationFrame(tick);
      } else {
        if (loaderPct) loaderPct.textContent = '100';
        if (loaderBar) loaderBar.style.inset = '0 0 0 0';
        setTimeout(onDone, 320);
      }
    };
    requestAnimationFrame(tick);
  }

  function endLoader() {
    if (!loader) return;
    loader.classList.add('is-done');
    document.body.classList.add('is-ready');
    initAnimations();
    setTimeout(() => loader.remove(), 900);
  }

  /* ----------------------------------------------------------
     Initial animations
     ---------------------------------------------------------- */
  function initAnimations() {
    if (!window.gsap) return;

    // Hero title words slide up
    gsap.set('.hero-title .word', { yPercent: 110 });
    gsap.set('.hero-pre, .hero-place', { opacity: 0, y: 12 });
    const tl = gsap.timeline();
    tl.to('.hero-pre', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, 0)
      .to('.hero-title .word', { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.12 }, 0.05)
      .to('.hero-place', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, 0.5);

    // Hero parallax on scroll
    if (window.ScrollTrigger) {
      gsap.to('.hero-video', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // Reveal split-animate elements when scrolled in
      $$('.split-animate').forEach((el) => {
        const inners = el.querySelectorAll('.word-inner');
        gsap.to(inners, {
          yPercent: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.02,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });
      });

      // Generic fade-in for headings & blocks
      const fadeTargets = [
        '.manifesto-text .line',
        '.section-eyebrow',
        '.num-cell',
        '.obra-h',
        '.obra-p',
        '.stage-row',
        '.tri',
        '.studios-h',
        '.sf-kicker', '.sf-h', '.sf-list li', '.sf-link',
        '.fp-eyebrow', '.fp-h', '.fp-p', '.fp-spec > div',
        '.strip-gallery figure',
        '.lazer-h', '.lazer-p',
        '.stack-card',
        '.extras-list li',
        '.cidade-h', '.cidade-p', '.c-item', '.orient-row',
        '.reasons-h', '.reason',
        '.contato-h', '.contato-p', '.ci-block',
        '.contato-form'
      ];
      fadeTargets.forEach((sel) => {
        $$(sel).forEach((el) => {
          gsap.fromTo(el, { y: 28, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      });

      // Obra stage scale on scroll
      gsap.fromTo('.obra-stage-bg', { scale: 1.15 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.obra-stage',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // Cidade bg subtle parallax
      gsap.fromTo('.cidade-bg', { y: '-6%' }, {
        y: '6%', ease: 'none',
        scrollTrigger: { trigger: '.cidade', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ----------------------------------------------------------
     Hero "video" — crossfade between frames (Ken Burns loop)
     ---------------------------------------------------------- */
  (function heroCrossfade() {
    const frames = $$('.hero-frame');
    if (frames.length < 2) return;
    let idx = 0;
    setInterval(() => {
      frames[idx].classList.remove('is-active');
      idx = (idx + 1) % frames.length;
      frames[idx].classList.add('is-active');
    }, 5200);
  })();

  /* ----------------------------------------------------------
     Hero "REC" clock
     ---------------------------------------------------------- */
  (function heroClock() {
    const el = $('#heroClock');
    if (!el) return;
    const start = performance.now();
    const update = () => {
      const t = (performance.now() - start) / 1000;
      const m = Math.floor(t / 60).toString().padStart(2, '0');
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      el.textContent = `${m}:${s}`;
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  })();

  /* ----------------------------------------------------------
     Nav state on scroll
     ---------------------------------------------------------- */
  (function navScroll() {
    const nav = $('#siteNav');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 80) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ----------------------------------------------------------
     Smooth anchor scrolling via Lenis
     ---------------------------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis && lenis.scrollTo) {
        lenis.scrollTo(target, { offset: -40, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----------------------------------------------------------
     Video modal
     ---------------------------------------------------------- */
  const modal = $('#videoModal');
  const playPill = $('#playPill');
  const vmClose = $('#vmClose');
  function openModal() { if (modal) modal.hidden = false; }
  function closeModal() { if (modal) modal.hidden = true; }
  if (playPill) playPill.addEventListener('click', openModal);
  if (vmClose) vmClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ----------------------------------------------------------
     Lead form (fake submit)
     ---------------------------------------------------------- */
  const form = $('#leadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submit = $('.cf-submit', form);
      const success = $('#cfSuccess');
      if (submit) {
        submit.disabled = true;
        submit.innerHTML = '<span>Enviando…</span>';
      }
      setTimeout(() => {
        if (success) success.hidden = false;
        // Hide field rows for clarity
        $$('.field, .field-row, .check, .cf-fine, .cf-submit', form).forEach((el) => el.style.display = 'none');
      }, 700);
    });
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  window.addEventListener('load', () => {
    runLoader(endLoader);
  });
  // safety: if 'load' is delayed, kick off shortly after DOM
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (loader && !loader.classList.contains('is-done')) {
        runLoader(endLoader);
      }
    }, 50);
  });

})();
