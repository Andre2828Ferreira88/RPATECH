/**
 * promo.js — Contador regressivo do card de desconto · RPAWorks
 */
(function () {
  'use strict';

  var DURATION_MS = 24 * 60 * 60 * 1000; // 24h
  var STORAGE_KEY = 'rpaw_promo_end';

  var countEl = document.getElementById('promoCountdown');
  var barEl   = document.getElementById('promoBarFill');
  var cardEl  = document.querySelector('.promo-card');

  if (!countEl || !barEl || !cardEl) return;

  // Persiste o tempo de expiração no sessionStorage
  var storedEnd = parseInt(sessionStorage.getItem(STORAGE_KEY), 10);
  var endTime;

  if (storedEnd && !isNaN(storedEnd) && storedEnd > Date.now()) {
    endTime = storedEnd;
  } else {
    endTime = Date.now() + DURATION_MS;
    sessionStorage.setItem(STORAGE_KEY, endTime);
  }

  function formatTime(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return (
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0')
    );
  }

  function handleExpiry() {
    countEl.textContent     = 'EXPIROU';
    barEl.style.width       = '0%';
    cardEl.style.transition = 'opacity .8s ease, transform .8s ease';
    cardEl.style.opacity    = '0';
    cardEl.style.transform  = 'scale(.95) rotate(-1.5deg)';
    setTimeout(function () { cardEl.style.display = 'none'; }, 850);
  }

  var rafId;

  function tick() {
    var remaining = endTime - Date.now();

    if (remaining <= 0) {
      handleExpiry();
      return;
    }

    countEl.textContent = formatTime(remaining);
    barEl.style.width   = ((remaining / DURATION_MS) * 100) + '%';
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      tick();
    }
  });

  tick();
})();
