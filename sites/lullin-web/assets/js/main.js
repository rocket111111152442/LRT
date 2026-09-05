(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- écran d'ouverture (accueil) ---------- */
  var intro = document.getElementById('intro');
  if (intro) {
    var reduceMotionIntro = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try { seen = sessionStorage.getItem('lullinIntroSeen') === '1'; } catch (e) {}

    if (reduceMotionIntro || seen) {
      intro.classList.add('done');
    } else {
      document.documentElement.style.overflow = 'hidden';
      var introTimer = setTimeout(finishIntro, 6900);

      intro.querySelector('.intro-skip').addEventListener('click', finishIntro);
      intro.addEventListener('click', function (e) {
        if (e.target.closest('.intro-skip')) return;
        finishIntro();
      });

      function finishIntro() {
        clearTimeout(introTimer);
        intro.classList.add('done');
        document.documentElement.style.overflow = '';
        try { sessionStorage.setItem('lullinIntroSeen', '1'); } catch (e) {}
      }
    }
  }

  /* ---------- menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- curseur personnalisé ---------- */
  var dot = document.querySelector('.cursor-dot');
  var ring = document.querySelector('.cursor-ring');
  if (dot && ring && matchMedia('(hover:hover)').matches) {
    var rx = 0, ry = 0, mx = 0, my = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, input, textarea, select, .magnetic').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
    });
  }

  /* ---------- boutons magnétiques ---------- */
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- titre : split en lignes révélées ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var html = el.innerHTML.split('<br>');
    el.innerHTML = html.map(function (line) {
      return '<span class="split-line"><span>' + line.trim() + '</span></span>';
    }).join('<br>');
    setTimeout(function () {
      el.querySelectorAll('.split-line > span').forEach(function (span, i) {
        setTimeout(function () { span.style.transform = 'translateY(0)'; span.style.opacity = '1'; }, i * 120);
      });
    }, 200);
  });

  /* ---------- scroll reveal ---------- */
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

  /* ---------- compteurs statistiques ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var done = false;
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !done) {
          done = true;
          var start = performance.now();
          var duration = 1200;
          (function tick(now) {
            var p = Math.min(1, (now - start) / duration);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        }
      });
    }, { threshold: 0.6 });
    io2.observe(el);
  });

  /* ---------- header : fond au scroll (page d'accueil uniquement) ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.background = window.scrollY > 40
        ? 'linear-gradient(to bottom, rgba(10,10,12,.92), rgba(10,10,12,.7))'
        : 'linear-gradient(to bottom, rgba(10,10,12,.75), rgba(10,10,12,0))';
    }, { passive: true });
  }

  /* ---------- "plus tu descends, plus le texte avance, puis ça s'arrête" ---------- */
  var reduceMotionPin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pins = Array.prototype.slice.call(document.querySelectorAll('[data-pin]')).map(function (section) {
    return {
      section: section,
      sticky: section.querySelector('[data-pin-sticky]'),
      track: section.querySelector('[data-pin-track]')
    };
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
      var x = reduceMotionPin ? 0 : -progress * maxShift;
      p.track.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  }
  if (pins.length) {
    updatePins();
    window.addEventListener('scroll', updatePins, { passive: true });
    window.addEventListener('resize', updatePins);
  }

  /* ---------- particules hero (canvas léger) ---------- */
  var canvas = document.getElementById('hero-canvas');
  if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = canvas.parentElement.offsetWidth;
      h = canvas.parentElement.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.round((w * h) / 14000));
      particles = new Array(count).fill(0).map(function () {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.4
        };
      });
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,245,242,0.55)';
        ctx.fill();
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = 'rgba(245,245,242,' + (0.14 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(step);
  }

  /* ---------- formulaire de devis ---------- */
  var form = document.getElementById('devis-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('.btn-submit');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      var data = Object.fromEntries(new FormData(form).entries());

      fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (result) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          if (result.ok && result.json.ok) {
            form.reset();
            status.textContent = 'Merci ! Votre demande a bien été envoyée, nous revenons vers vous sous 48 h.';
            status.className = 'form-status ok';
          } else if (result.json.erreur === 'non_configure') {
            status.textContent = 'L\'envoi automatique n\'est pas encore configuré. Écrivez-nous directement à contact@lullinweb.fr.';
            status.className = 'form-status err';
          } else {
            status.textContent = 'Merci de vérifier les champs obligatoires puis réessayer.';
            status.className = 'form-status err';
          }
        })
        .catch(function () {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          status.textContent = 'Une erreur réseau est survenue. Écrivez-nous à contact@lullinweb.fr.';
          status.className = 'form-status err';
        });
    });
  }
})();
