/* =========================================================
   RPATECH — Portfolio Horizontal Scroll (versão final única)
   
   Técnica: CSS sticky no .portfolio-pin + scroll vertical
   convertido em translateX no .portfolio-track via rAF.
   
   Esta é a ÚNICA implementação ativa. Os dois blocos que
   existiam no script.js foram removidos pois conflitavam
   com esta via setProperty('transform', ..., 'important').
   ========================================================= */
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(function () {

    /* ── Seletores reais do projeto ── */
    var section      = document.querySelector('#portfolio.portfolio-section');
    if (!section) return;

    var pin          = section.querySelector('.portfolio-pin');
    var viewport     = section.querySelector('.portfolio-viewport');
    var track        = section.querySelector('.portfolio-track');
    var cards        = Array.prototype.slice.call(section.querySelectorAll('.portfolio-card'));
    var progressFill = section.querySelector('.portfolio-progress__fill');
    var currentEl    = section.querySelector('.portfolio-counter__current');
    var totalEl      = section.querySelector('.portfolio-counter__total');

    if (!pin || !viewport || !track || !cards.length) return;

    /* ── Estado ── */
    var total        = cards.length;
    var topbarH      = 72;
    var stickyH      = 0;
    var distance     = 0;   // pixels horizontais que o track precisa percorrer
    var scrollRange  = 1;   // pixels verticais disponíveis para o scroll
    var raf          = null;
    var resizeTimer  = null;
    var initialized  = false;

    if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

    /* ── Utils ── */
    function isMobile() {
      return window.matchMedia('(max-width: 768px)').matches;
    }

    function clamp(n, lo, hi) {
      lo = lo === undefined ? 0 : lo;
      hi = hi === undefined ? 1 : hi;
      return Math.max(lo, Math.min(hi, n));
    }

    function getTopbarHeight() {
      var el = document.querySelector('.topbar, .site-header, header');
      if (!el) return 72;
      return Math.max(0, Math.round(el.getBoundingClientRect().height || 72));
    }

    /* ── Matar qualquer ScrollTrigger que toque no portfólio ── */
    function killCompeting() {
      if (!window.ScrollTrigger) return;
      window.ScrollTrigger.getAll().forEach(function (st) {
        var bad = st.trigger === section
               || st.trigger === pin
               || st.trigger === viewport
               || st.trigger === track
               || (st.trigger && section.contains(st.trigger))
               || st.pin === section
               || st.pin === pin;

        // Verificar targets da animação
        if (!bad && st.animation) {
          try {
            var targets = st.animation.targets ? st.animation.targets() : [];
            bad = targets.indexOf(track) !== -1;
          } catch (e) {}
        }

        if (bad) st.kill(false);
      });

      // Matar tweens GSAP no track também
      if (window.gsap && typeof window.gsap.killTweensOf === 'function') {
        window.gsap.killTweensOf(track);
      }
    }

    /* ── Aplicar posição X ao track ── */
    function setTrackX(x) {
      track.style.setProperty(
        'transform',
        'translate3d(' + x + 'px, 0, 0)',
        'important'
      );
    }

    /* ── Atualizar UI (contador, barra, parallax) ── */
    function setUI(progress) {
      var p      = clamp(progress);
      var active = Math.max(0, Math.min(total - 1, Math.round(p * (total - 1))));

      if (currentEl)    currentEl.textContent = String(active + 1).padStart(2, '0');
      if (progressFill) progressFill.style.width = (p * 100).toFixed(1) + '%';

      cards.forEach(function (card, i) {
        card.classList.toggle('is-active', i === active);
      });
    }

    /* ── Medir a seção e calcular distâncias ── */
    function measure() {
      if (isMobile()) {
        // Mobile: desfaz tudo e libera scroll horizontal nativo
        section.classList.remove('portfolio-horizontal-ready');
        document.documentElement.classList.remove('rpaw-portfolio-horizontal-ready');
        section.style.removeProperty('--portfolio-scroll-height');
        section.style.removeProperty('--portfolio-sticky-top');
        section.style.removeProperty('--portfolio-sticky-height');
        section.style.removeProperty('height');
        section.style.removeProperty('min-height');
        setTrackX(0);
        setUI(0);
        return;
      }

      killCompeting();

      section.classList.add('portfolio-horizontal-ready');
      document.documentElement.classList.add('rpaw-portfolio-horizontal-ready');

      topbarH = getTopbarHeight();
      stickyH = Math.max(560, window.innerHeight - topbarH);

      section.style.setProperty('--portfolio-sticky-top',    topbarH + 'px');
      section.style.setProperty('--portfolio-sticky-height', stickyH + 'px');

      // Zerar antes de medir para não contaminar scrollWidth
      setTrackX(0);

      var trackW  = Math.ceil(track.scrollWidth);
      var viewportW = Math.ceil(viewport.clientWidth || window.innerWidth);
      distance = Math.max(0, trackW - viewportW);

      if (distance <= 0) {
        // Todos os cards cabem na tela — sem scroll horizontal necessário
        section.style.removeProperty('height');
        section.style.removeProperty('min-height');
        section.style.removeProperty('--portfolio-scroll-height');
        return;
      }

      // Altura total da section = área sticky + distância lateral + respiro
      // O "respiro" evita que a próxima section apareça antes do último card
      var breath      = Math.max(300, window.innerHeight * 0.30);
      var sectionH    = Math.ceil(stickyH + distance + breath);

      section.style.setProperty('--portfolio-scroll-height', sectionH + 'px');
      section.style.height    = sectionH + 'px';
      section.style.minHeight = sectionH + 'px';

      // scrollRange: quantos pixels de scroll vertical correspondem ao
      // deslocamento horizontal completo.
      // Início: quando o topo da section chega ao topo da viewport (- topbarH).
      // Fim: início + distance (exatamente o suficiente para mostrar tudo).
      scrollRange = Math.max(1, distance);

      initialized = true;
    }

    /* ── Frame de atualização ── */
    function update() {
      raf = null;
      if (isMobile() || !initialized) return;

      // Quanto da section já passou acima do ponto de sticky?
      // rect.top é negativo quando a section está parcialmente acima da viewport.
      // Quando rect.top === -topbarH (ou seja, o sticky pin encostou no topo da navbar),
      // começamos a mover o track.
      var rect     = section.getBoundingClientRect();
      var scrolled = -(rect.top) - topbarH;   // 0 quando ainda não chegou, cresce ao rolar
      var progress = clamp(scrolled / scrollRange);
      var x        = -(distance * progress);

      setTrackX(x);
      setUI(progress);
    }

    function scheduleUpdate() {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    }

    /* ── Setup por modo ── */
    function setup() {
      measure();
      scheduleUpdate();
    }

    /* ── Mobile: scroll horizontal nativo com contador ── */
    viewport.addEventListener('scroll', function () {
      if (!isMobile()) return;
      var max = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
      setUI(viewport.scrollLeft / max);
    }, { passive: true });

    /* ── Hover 3D / magnetic (desktop) ── */
    cards.forEach(function (card) {
      var img = card.querySelector('.portfolio-card__media img');

      card.addEventListener('pointermove', function (e) {
        if (isMobile() || !window.gsap) return;

        var rect = card.getBoundingClientRect();
        var px   = (e.clientX - rect.left) / rect.width  - 0.5;
        var py   = (e.clientY - rect.top)  / rect.height - 0.5;

        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top)  + 'px');

        window.gsap.to(card, {
          x: px * 12, y: py * 7,
          rotateY: px * 5, rotateX: py * -4,
          transformPerspective: 1200,
          duration: 0.34, ease: 'power3.out', overwrite: 'auto'
        });
        if (img) {
          window.gsap.to(img, {
            x: px * -20, y: py * -10, scale: 1.16,
            duration: 0.42, ease: 'power3.out', overwrite: 'auto'
          });
        }
      });

      card.addEventListener('pointerleave', function () {
        if (!window.gsap) return;
        window.gsap.to(card, { x:0, y:0, rotateX:0, rotateY:0, duration:.5, ease:'power3.out', overwrite:'auto' });
        if (img) window.gsap.to(img, { x:0, y:0, scale:1.12, duration:.5, ease:'power3.out', overwrite:'auto' });
      });
    });

    /* ── Listeners ── */
    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 160);
    }, { passive: true });

    // Rodar no load (depois de imagens carregadas) para medição correta
    window.addEventListener('load', function () {
      setup();
    }, { once: true });

    /* ── Init imediato ── */
    setup();
  });

})();
