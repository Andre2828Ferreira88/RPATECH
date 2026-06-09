/* =========================================================
   SCROLL STORY — Canvas + GSAP ScrollTrigger
   RPAWorks · 768px breakpoint · mobile: 1 painel por vez
   ========================================================= */
(function () {

  /* ── 1. Canvas ─────────────────────────────────────────── */
  function initCanvas() {
    const canvas = document.getElementById('storyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, rafId, frame = 0;

    const PALETTES = [
      [{ r:255,g:106,b:0 }, { r:255,g:138,b:42  }],
      [{ r:255,g:106,b:0 }, { r:82, g:95, b:255 }],
      [{ r:255,g:106,b:0 }, { r:11, g:200,b:140 }],
      [{ r:255,g:80, b:0 }, { r:180,g:50, b:255 }],
      [{ r:255,g:106,b:0 }, { r:255,g:210,b:80  }],
    ];
    let currentPalette = 0, blendT = 1;

    function lerpC(a, b, t) {
      return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t),
      };
    }

    const isMob = () => window.innerWidth <= 768;

    const orbs = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      r: .22 + Math.random() * .18,
      speed: .00012 + Math.random() * .00014,
      phase: Math.random() * Math.PI * 2,
      colorIdx: i % 2,
    }));

    let parts = [];
    function buildParts() {
      const n = isMob() ? 22 : 55;
      parts = Array.from({ length: n }, () => ({
        x: Math.random(), y: Math.random(),
        vy: -(.0004 + Math.random() * .0006),
        vx: (Math.random() - .5) * .0002,
        size: .6 + Math.random() * 1.2,
        alpha: .15 + Math.random() * .35,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      buildParts();
    }

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    resize();

    window.storySetPalette = idx => {
      if (idx === currentPalette) return;
      currentPalette = idx; blendT = 0;
    };

    let _lastFrameTime = 0;
    function draw(timestamp) {
      const fpsInterval = isMob() ? 1000/28 : 1000/50;
      if (timestamp - _lastFrameTime < fpsInterval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      _lastFrameTime = timestamp;

      if (blendT < 1) blendT = Math.min(1, blendT + .018);
      const pal = PALETTES[currentPalette] || PALETTES[0];
      frame++;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W, H);

      orbs.forEach(o => {
        o.x += Math.sin(frame * o.speed + o.phase) * .0003;
        o.y += Math.cos(frame * o.speed + o.phase * 1.3) * .0003;
        if (o.x < 0) o.x = 1; if (o.x > 1) o.x = 0;
        if (o.y < 0) o.y = 1; if (o.y > 1) o.y = 0;
        const col = lerpC(pal[0], pal[1], o.colorIdx === 0 ? 0 : 1);
        const alpha = .13 + .06 * Math.sin(frame * .018 + o.phase);
        const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r * Math.min(W, H));
        g.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });

      ctx.strokeStyle = 'rgba(16,24,40,.045)';
      ctx.lineWidth = .5;
      const step = isMob() ? 48 : 72;
      for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      const pCol = lerpC(pal[0], pal[1], .5);
      parts.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < -.01) { p.y = 1.01; p.x = Math.random(); }
        if (p.x < -.01 || p.x > 1.01) p.x = Math.random();
        const a = p.alpha * (.6 + .4 * Math.sin(frame * .04 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pCol.r},${pCol.g},${pCol.b},${a})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }

    const section = document.querySelector('.scroll-story');
    if (section && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { if (!rafId) draw(); }
          else { cancelAnimationFrame(rafId); rafId = null; }
        });
      }, { threshold: 0 });
      io.observe(section);
    } else { draw(); }
  }

  /* ── 2. GSAP ────────────────────────────────────────────── */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!document.querySelector('.scroll-story')) return;

    gsap.registerPlugin(ScrollTrigger);


    function enhanceStoryCenter() {
      const center = document.querySelector('.story-center');
      const title = center ? center.querySelector('h2') : null;
      if (!center || !title) return;

      if (!center.querySelector('.story-center__impact')) {
        const impact = document.createElement('div');
        impact.className = 'story-center__impact';
        impact.setAttribute('aria-hidden', 'true');
        impact.innerHTML = '<span class="story-impact-ring"></span><span class="story-impact-ring"></span><span class="story-impact-ring"></span><span class="story-impact-sparks"></span>';
        center.prepend(impact);
      }

      if (!title.dataset.storySplit) {
        const words = title.textContent.trim().split(/\s+/);
        title.innerHTML = words.map(word => `<span class="story-title-word">${word}</span>`).join(' ');
        title.dataset.storySplit = 'true';
      }
    }

    enhanceStoryCenter();

    // Detectar mobile DEPOIS do DOM estar pronto (innerWidth mais confiável)
    const isMobile = window.innerWidth <= 768;

    function trackPalette(p) {
      if (!window.storySetPalette) return;
      if      (p < .15) window.storySetPalette(0);
      else if (p < .38) window.storySetPalette(1);
      else if (p < .58) window.storySetPalette(2);
      else if (p < .78) window.storySetPalette(3);
      else               window.storySetPalette(4);
    }

    /*
      Segurança responsiva:
      Quando o site é testado no DevTools alternando mobile/desktop sem refresh,
      o mobile deixa transform/opacity inline nos painéis. No desktop isso desloca
      o card para cima. Antes da timeline desktop, limpamos somente esses estilos.
    */
    function resetStoryInlineState() {
      const targets = document.querySelectorAll('.story-center, .story-panel');
      targets.forEach(el => {
        el.classList.remove('sp-visible');
        el.style.removeProperty('opacity');
        el.style.removeProperty('visibility');
        el.style.removeProperty('transition');
        el.style.removeProperty('transform');
      });
    }

    // Se o usuário mudar de mobile para desktop no DevTools, força refresh limpo.
    let lastMode = isMobile ? 'mobile' : 'desktop';
    let modeResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(modeResizeTimer);
      modeResizeTimer = setTimeout(() => {
        const currentMode = window.innerWidth <= 768 ? 'mobile' : 'desktop';
        if (currentMode !== lastMode) {
          window.location.reload();
        }
      }, 220);
    });

    /* ══════════════════════════════════════════════════════
       MOBILE ≤768px — onUpdate troca 1 painel por vez
    ══════════════════════════════════════════════════════ */
    if (isMobile) {

      const center = document.querySelector('.story-center');
      const panels = [
        document.querySelector('.story-panel--1'),
        document.querySelector('.story-panel--2'),
        document.querySelector('.story-panel--3'),
        document.querySelector('.story-panel--4'),
      ];
      const fill  = document.querySelector('.story-progress__fill');
      const label = document.querySelector('.story-progress__label');

      // Faixas: [inicio, fim] para cada elemento
      // index 0 = center, 1..4 = painéis
      const RANGES = [
        [0.00, 0.13],  // copy central
        [0.15, 0.37],  // painel 1
        [0.39, 0.57],  // painel 2
        [0.59, 0.77],  // painel 3
        [0.79, 1.00],  // painel 4
      ];
      const ELEMENTS = [center, ...panels];

      function hideEl(el, isCenter, animated = false) {
        if (!el) return;
        el.classList.remove('sp-visible');
        el.style.transition = animated ? 'opacity .35s ease, transform .35s ease' : 'none';
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.transform = isCenter ? 'translateX(-50%) translateY(-18px) scale(.96)' : 'translateY(calc(-50% - 20px))';
      }

      function prepEl(el, isCenter) {
        if (!el) return;
        el.classList.remove('sp-visible');
        el.style.transition = 'none';
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.transform = isCenter ? 'translateX(-50%) translateY(22px) scale(.94)' : 'translateY(calc(-50% + 20px))';
      }

      function animateMobileCenter(el) {
        if (!el || typeof gsap === 'undefined') return;

        const eyebrow = el.querySelector('.story-eyebrow');
        const words = el.querySelectorAll('.story-title-word');
        const rings = el.querySelectorAll('.story-impact-ring');
        const sparks = el.querySelector('.story-impact-sparks');

        gsap.killTweensOf([eyebrow, words, rings, sparks]);

        const mtl = gsap.timeline();
        mtl.fromTo(eyebrow,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: .38, ease: 'power3.out' },
          0
        )
        .fromTo(words,
          { yPercent: 92, opacity: 0, rotateX: 58, scale: .92 },
          { yPercent: 0, opacity: 1, rotateX: 0, scale: 1, stagger: .045, duration: .62, ease: 'back.out(1.45)' },
          .08
        )
        .fromTo(rings,
          { opacity: 0, scale: .88, rotate: -5 },
          { opacity: 1, scale: 1, rotate: 0, stagger: .06, duration: .55, ease: 'power3.out' },
          .05
        )
        .fromTo(sparks,
          { opacity: 0, scale: .85 },
          { opacity: 1, scale: 1, duration: .45, ease: 'power2.out' },
          .18
        );
      }

      function showEl(el, isCenter) {
        if (!el) return;
        el.classList.add('sp-visible');
        el.style.transition = isCenter ? 'opacity .45s ease' : 'opacity .40s ease, transform .40s ease';
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.transform = isCenter ? 'translateX(-50%) translateY(0) scale(1)' : 'translateY(-50%)';

        if (isCenter) animateMobileCenter(el);
      }

      // Estado inicial: esconde tudo sem depender da ordem do CSS.
      ELEMENTS.forEach((el, i) => hideEl(el, i === 0, false));

      let visibleIdx = -1;

      function showIdx(idx) {
        if (idx === visibleIdx) return;

        // Esconder o anterior
        if (visibleIdx >= 0 && ELEMENTS[visibleIdx]) {
          const prev = ELEMENTS[visibleIdx];
          const wasCenter = visibleIdx === 0;
          prev.classList.remove('sp-visible');
          prev.style.transition = 'opacity .35s ease, transform .35s ease';
          prev.style.setProperty('opacity', '0', 'important');
          prev.style.transform = wasCenter
            ? 'translateX(-50%) translateY(-18px) scale(.96)'
            : 'translateY(calc(-50% - 20px))';
          setTimeout(() => {
            if (visibleIdx !== idx) {
              prev.style.setProperty('visibility', 'hidden', 'important');
            }
          }, 360);
        }

        visibleIdx = idx;

        // Mostrar o novo
        if (idx >= 0 && ELEMENTS[idx]) {
          const el = ELEMENTS[idx];
          const isCenterEl = idx === 0;

          prepEl(el, isCenterEl);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => showEl(el, isCenterEl));
          });
        }
      }

      function getIdx(p) {
        for (let i = 0; i < RANGES.length; i++) {
          if (p >= RANGES[i][0] && p <= RANGES[i][1]) return i;
        }
        return -1; // entre faixas: nada visível (pequena pausa)
      }

      ScrollTrigger.create({
        trigger: '.scroll-story',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => {
          const p = self.progress;
          if (fill)  fill.style.width  = Math.round(p * 100) + '%';
          if (label) label.textContent = Math.round(p * 100) + '%';
          trackPalette(p);
          showIdx(getIdx(p));
        },
        onLeave: () => showIdx(-1),
        onLeaveBack: () => showIdx(-1),
      });

      // Scan line
      gsap.to('.story-scan', {
        yPercent: 500, ease: 'none',
        scrollTrigger: {
          trigger: '.scroll-story',
          start: 'top top', end: 'bottom bottom', scrub: true
        }
      });

      window.addEventListener('orientationchange', () => {
        setTimeout(() => ScrollTrigger.refresh(), 300);
      });
      return;
    }

    /* ══════════════════════════════════════════════════════
       DESKTOP >768px — timeline lateral com scrub
    ══════════════════════════════════════════════════════ */
    resetStoryInlineState();

    // Estado base desktop explícito para não herdar translateY(-50%) do mobile.
    gsap.set('.story-panel--1, .story-panel--2, .story-panel--3', {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 0,
      clearProps: 'visibility,transition'
    });
    gsap.set('.story-panel--4', {
      xPercent: -50,
      x: 0,
      y: 0,
      opacity: 0,
      rotate: 0,
      clearProps: 'visibility,transition'
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-story',
        start: 'top top', end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: self => {
          const fill  = document.querySelector('.story-progress__fill');
          const label = document.querySelector('.story-progress__label');
          if (fill)  fill.style.width  = Math.round(self.progress * 100) + '%';
          if (label) label.textContent = Math.round(self.progress * 100) + '%';
          trackPalette(self.progress);
        }
      }
    });

    tl.fromTo('.story-frame',
      { scale: .72, rotateX: 12, filter: 'brightness(.98) saturate(.92)' },
      { scale: 1,   rotateX: 0,  filter: 'brightness(1.03) saturate(1.05)', duration: 1.2, ease: 'power2.out' }
    )
    .fromTo('.story-center',
      { y: 120, opacity: 0, scale: .84 },
      { y: 0,   opacity: 1, scale: 1,   duration: .42, ease: 'power3.out' }, .12
    )
    .fromTo('.story-center .story-eyebrow',
      { y: 32, opacity: 0, letterSpacing: '.42em' },
      { y: 0,  opacity: 1, letterSpacing: '.22em', duration: .52, ease: 'power3.out' }, .18
    )
    .fromTo('.story-center .story-title-word',
      { yPercent: 135, opacity: 0, rotateX: 78 },
      { yPercent: 0,   opacity: 1, rotateX: 0, stagger: .045, duration: .82, ease: 'back.out(1.55)' }, .24
    )
    .fromTo('.story-impact-ring',
      { scale: .15, opacity: 0, rotate: -35 },
      { scale: 1,   opacity: 1, rotate: 0,   stagger: .08, duration: .78, ease: 'power3.out' }, .2
    )
    .fromTo('.story-impact-sparks',
      { scale: .55, opacity: 0, rotate: -18 },
      { scale: 1,   opacity: 1, rotate: 0,   duration: .7, ease: 'power3.out' }, .34
    )
    .to('.story-center h2',
      { textShadow: '0 0 18px rgba(255,106,0,.16), 0 22px 58px rgba(16,24,40,.14)', duration: .6, ease: 'power2.out' }, .42
    )
    .to('.story-center .story-title-word',
      { yPercent: -95, opacity: 0, rotateX: -68, stagger: { each: .035, from: 'end' }, duration: .65, ease: 'power3.inOut' }, 1.05
    )
    .to('.story-impact-ring, .story-impact-sparks',
      { scale: 1.28, opacity: 0, duration: .58, ease: 'power2.inOut' }, 1.08
    )
    .to('.story-center',
      { y: -120, opacity: 0, scale: 1.08, duration: .62, ease: 'power3.inOut' }, 1.15
    )
    .fromTo('.story-panel--1',
      { x: -200, y: 0, opacity: 0, rotate: -3 },
      { x: 0,    y: 0, opacity: 1, rotate:  0, duration: .8, ease: 'power3.out' }, .7
    )
    .fromTo('.story-panel--2',
      { x: 200,  y: 0, opacity: 0, rotate:  3 },
      { x: 0,    y: 0, opacity: 1, rotate:  0, duration: .8, ease: 'power3.out' }, 1.15
    )
    .fromTo('.story-panel--3',
      { x: -160, y: 80, opacity: 0 },
      { x: 0,    y: 0,  opacity: 1,      duration: .8, ease: 'power3.out' }, 1.6
    )
    .to('.story-scan', { yPercent: 680, duration: 2.8, ease: 'none' }, 0)
    .to('.story-frame',
      { scale: 1.1, filter: 'brightness(.96) contrast(1.02)', duration: 1.1, ease: 'power2.inOut' }, 1.95
    )
    .fromTo('.story-panel--4',
      { xPercent: -50, y: 130, opacity: 0 },
      { xPercent: -50, y: 0,   opacity: 1, duration: .8, ease: 'power3.out' }, 2.1
    )
    .to(['.story-panel--1', '.story-panel--2', '.story-panel--3'],
      { y: -70, opacity: 0, stagger: .07, duration: .6, ease: 'power2.inOut' }, 2.55
    );
  }

  /* ── 3. Barras de métrica (desktop) ─────────────────────── */
  function initMetricBars() {
    if (window.innerWidth <= 768) return;
    const panels = document.querySelectorAll('.story-panel');
    if (!panels.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        e.target.classList.toggle('sp-visible', e.isIntersecting);
      });
    }, { threshold: .3 });
    panels.forEach(p => io.observe(p));
  }

  /* ── Init ── */
  function init() { initCanvas(); initGSAP(); initMetricBars(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
