/* ALLCX — comportements d'interface. Vanilla JS, sans dépendance. */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     En-tête : état « collé » au défilement
     --------------------------------------------------------------------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Menu mobile
     --------------------------------------------------------------------- */
  var burger = document.querySelector('[data-burger]');
  var drawer = document.querySelector('[data-drawer]');
  if (burger && drawer) {
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('no-scroll', open);
    };
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setDrawer(false);
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992 && burger.getAttribute('aria-expanded') === 'true') setDrawer(false);
    });
  }

  /* ---------------------------------------------------------------------
     Apparition au défilement
     --------------------------------------------------------------------- */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

      revealables.forEach(function (el, i) {
        var group = el.closest('[data-reveal-group]');
        if (group && !el.style.getPropertyValue('--reveal-delay')) {
          var siblings = Array.prototype.slice.call(group.querySelectorAll('[data-reveal]'));
          el.style.setProperty('--reveal-delay', Math.min(siblings.indexOf(el), 5) * 90 + 'ms');
        }
        io.observe(el);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Compteurs chiffrés
     --------------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var format = function (value, decimals) {
      return value.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countObserver.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        var decimals = (el.getAttribute('data-decimals') | 0);
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        var duration = 1300;
        var tick = function (now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + format(target * eased, decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Accordéons
     --------------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion]').forEach(function (root) {
    root.querySelectorAll('.accordion__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (root.hasAttribute('data-accordion-single') && !open) {
          root.querySelectorAll('.accordion__btn[aria-expanded="true"]').forEach(function (other) {
            other.setAttribute('aria-expanded', 'false');
            var op = document.getElementById(other.getAttribute('aria-controls'));
            if (op) op.setAttribute('data-open', 'false');
          });
        }
        btn.setAttribute('aria-expanded', String(!open));
        if (panel) panel.setAttribute('data-open', String(!open));
      });
    });
  });

  /* ---------------------------------------------------------------------
     Formulaires : validation, envoi par l'API, repli « mailto »
     --------------------------------------------------------------------- */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    var actions = form.querySelector('[data-form-actions]');
    var submit = form.querySelector('button[type="submit"]');

    var dire = function (texte) {
      if (!status) return;
      status.textContent = texte;
      status.setAttribute('data-visible', 'true');
    };

    var messageFor = function (input) {
      if (input.validity.valueMissing) {
        return input.type === 'checkbox' ? 'Merci de cocher cette case.' : 'Ce champ est obligatoire.';
      }
      if (input.validity.typeMismatch && input.type === 'email') return 'Adresse e-mail invalide.';
      if (input.validity.tooShort) return 'Message trop court.';
      return 'Valeur invalide.';
    };

    var setFieldError = function (input, message) {
      var field = input.closest('.field') || input.closest('.consent');
      if (!field) return;
      field.setAttribute('data-invalid', message ? 'true' : 'false');
      var slot = field.querySelector('.error');
      if (slot) slot.textContent = message || '';
    };

    var champs = function () {
      return Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
        .filter(function (el) { return el.type !== 'hidden' && !el.classList.contains('hp'); });
    };

    champs().forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value) setFieldError(input, input.checkValidity() ? '' : messageFor(input));
      });
      input.addEventListener('input', function () {
        if (input.checkValidity()) setFieldError(input, '');
      });
    });

    var donnees = function () {
      var out = {};
      form.querySelectorAll('input, select, textarea').forEach(function (input) {
        if (!input.name) return;
        out[input.name] = input.type === 'checkbox' ? (input.checked ? 'oui' : '') : input.value;
      });
      return out;
    };

    var replisMailto = function () {
      var lignes = [];
      champs().forEach(function (input) {
        if (input.type === 'checkbox') return;
        var label = form.querySelector('label[for="' + input.id + '"]');
        lignes.push((label ? label.textContent.replace('*', '').trim() : input.name) + ' : ' + input.value);
      });
      window.location.href = 'mailto:' + form.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'Demande depuis le site') +
        '&body=' + encodeURIComponent(lignes.join('\n'));
      dire('L’envoi automatique n’est pas disponible : votre messagerie s’ouvre avec la demande préremplie. Il ne reste qu’à l’envoyer.');
    };

    form.addEventListener('submit', function (e) {
      var premierInvalide = null;
      champs().forEach(function (input) {
        var ok = input.checkValidity();
        setFieldError(input, ok ? '' : messageFor(input));
        if (!ok && !premierInvalide) premierInvalide = input;
      });

      if (premierInvalide) {
        e.preventDefault();
        premierInvalide.focus();
        dire('Merci de compléter les champs signalés avant l’envoi.');
        return;
      }

      var mode = form.getAttribute('data-form');
      if (mode === 'mailto') {
        e.preventDefault();
        replisMailto();
        return;
      }
      if (mode !== 'api' || typeof window.fetch !== 'function') return;

      e.preventDefault();
      if (submit) {
        submit.disabled = true;
        submit.querySelector('span').textContent = 'Envoi en cours…';
      }
      dire('Envoi en cours…');

      fetch(form.getAttribute('data-endpoint') || form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(donnees())
      }).then(function (reponse) {
        if (reponse.ok) {
          form.reset();
          if (actions) actions.hidden = true;
          dire('Merci, votre demande est bien partie. Vous recevrez une réponse sous 48 heures ouvrées.');
          return;
        }
        throw new Error('statut ' + reponse.status);
      }).catch(function () {
        replisMailto();
      }).then(function () {
        if (submit) {
          submit.disabled = false;
          submit.querySelector('span').textContent = 'Envoyer la demande';
        }
      });
    });

    /* Retour d'un envoi sans JavaScript (redirection ?envoi=…) */
    var etat = new URLSearchParams(window.location.search).get('envoi');
    if (etat === 'ok') {
      dire('Merci, votre demande est bien partie. Vous recevrez une réponse sous 48 heures ouvrées.');
    } else if (etat === 'erreur') {
      dire('L’envoi n’a pas abouti. Vous pouvez écrire directement à ' + form.getAttribute('data-mailto') + '.');
    }
  });

  /* ---------------------------------------------------------------------
     Année courante dans les pieds de page
     --------------------------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
})();
