(function () {
  'use strict';

  /* ---------- reveal au scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- "plus tu descends, plus le texte avance, puis ça s'arrête" ----------
     Section haute (data-pin) contenant un wrapper collant (data-pin-sticky) et un
     rail interne (data-pin-track). Tant qu'on scrolle dans la hauteur de la section,
     le rail se translate horizontalement ; une fois la section dépassée, il s'arrête
     net (le wrapper n'est plus sticky, la section suivante prend le relais). */
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pins = Array.prototype.slice.call(document.querySelectorAll('[data-pin]')).map(function (section) {
    var sticky = section.querySelector('[data-pin-sticky]');
    var track = section.querySelector('[data-pin-track]');
    return { section: section, sticky: sticky, track: track };
  });

  function updatePins() {
    var vh = window.innerHeight;
    pins.forEach(function (p) {
      var rect = p.section.getBoundingClientRect();
      var total = rect.height - vh;
      if (total <= 0) return;
      var progress = Math.min(1, Math.max(0, -rect.top / total));
      var maxShift = p.track.scrollWidth - p.sticky.clientWidth;
      if (maxShift <= 0) return;
      var x = reduceMotion ? 0 : -progress * maxShift;
      p.track.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  }

  if (pins.length) {
    updatePins();
    window.addEventListener('scroll', updatePins, { passive: true });
    window.addEventListener('resize', updatePins);
  }

  /* ---------- curseur + petites interactions magnétiques (facultatif par thème) ---------- */
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.22 + 'px,' + y * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
