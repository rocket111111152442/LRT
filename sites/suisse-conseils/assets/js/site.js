/* Suisse-Conseils Management — interactions
   Toutes les animations passent par transform / opacity : le navigateur les
   traite sur la carte graphique, sans recalcul de mise en page. Aucun filtre,
   aucun canvas. Tout s'arrête si le visiteur a demandé à réduire les animations. */
(function () {
  "use strict";

  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ menu mobile */
  var burger = document.querySelector("[data-burger]");
  var nav = document.querySelector("[data-nav]");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var ouvert = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!ouvert));
      burger.setAttribute("aria-expanded", String(!ouvert));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------- apparitions au défilement */
  var animes = document.querySelectorAll(".rise, .rise-l, .rise-r, .zoom");
  if (animes.length) {
    if (!("IntersectionObserver" in window) || calme) {
      animes.forEach(function (el) { el.classList.add("on"); });
    } else {
      var io = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("on");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      animes.forEach(function (el, i) {
        if (!el.style.transitionDelay) {
          el.style.transitionDelay = (Math.min(i % 4, 3) * 0.07).toFixed(2) + "s";
        }
        io.observe(el);
      });
    }
  }

  /* ---------------------------------------------------- compteurs chiffrés */
  var compteurs = document.querySelectorAll("[data-compteur]");
  if (compteurs.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        cio.unobserve(el);
        var cible = parseFloat(el.getAttribute("data-compteur"));
        var suffixe = el.getAttribute("data-suffixe") || "";
        if (calme) { el.textContent = cible + suffixe; return; }
        var debut = performance.now();
        (function tic(t) {
          var p = Math.min(1, (t - debut) / 1400);
          el.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3))) + suffixe;
          if (p < 1) requestAnimationFrame(tic);
        })(debut);
      });
    }, { threshold: 0.6 });
    compteurs.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------- mot qui se remplace */
  var rotor = document.querySelector("[data-rotor]");
  if (rotor && !calme) {
    var mots = rotor.getAttribute("data-rotor").split("|");
    var index = 0;
    setInterval(function () {
      rotor.classList.add("rotor--sort");
      setTimeout(function () {
        index = (index + 1) % mots.length;
        rotor.textContent = mots[index];
        rotor.classList.remove("rotor--sort");
      }, 320);
    }, 2600);
  }

  /* ------------------------------------------------------------ accordéons */
  document.querySelectorAll("[data-faq]").forEach(function (faq) {
    faq.querySelectorAll(".faq__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var volet = document.getElementById(btn.getAttribute("aria-controls"));
        var ouvert = btn.getAttribute("aria-expanded") === "true";
        faq.querySelectorAll('.faq__btn[aria-expanded="true"]').forEach(function (autre) {
          if (autre === btn) return;
          autre.setAttribute("aria-expanded", "false");
          var v = document.getElementById(autre.getAttribute("aria-controls"));
          if (v) v.setAttribute("data-open", "false");
        });
        btn.setAttribute("aria-expanded", String(!ouvert));
        if (volet) volet.setAttribute("data-open", String(!ouvert));
      });
    });
  });

  /* ------------------------------------------------------- année courante */
  var an = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = an; });

  /* =====================================================================
     Demande de contact en trois étapes
     ===================================================================== */
  var demande = document.querySelector("[data-demande]");
  if (demande) {
    var etapes = Array.prototype.slice.call(demande.querySelectorAll(".etape"));
    var jauge = demande.querySelector("[data-jauge]");
    var pastilles = Array.prototype.slice.call(demande.querySelectorAll("[data-pastille]"));
    var recap = demande.querySelector("[data-recap]");
    var choix = { profil: "", sujet: "", moment: "" };
    var courante = 0;

    var afficher = function (n) {
      courante = Math.max(0, Math.min(etapes.length - 1, n));
      etapes.forEach(function (et, i) { et.hidden = i !== courante; });
      if (jauge) jauge.style.transform = "scaleX(" + ((courante + 1) / etapes.length).toFixed(3) + ")";
      pastilles.forEach(function (p, i) {
        p.setAttribute("data-actif", String(i <= courante));
      });
      if (recap) {
        recap.textContent = [choix.profil, choix.sujet, choix.moment]
          .filter(Boolean).join(" · ");
      }
      var titre = etapes[courante].querySelector("h3, label");
      if (titre && courante > 0) titre.focus && titre.focus();
    };

    demande.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-choix]");
      if (opt) {
        var champ = opt.getAttribute("data-choix");
        choix[champ] = opt.getAttribute("data-valeur");
        var groupe = opt.closest(".options");
        if (groupe) {
          groupe.querySelectorAll("[data-choix]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b === opt));
          });
        }
        var cache = demande.querySelector('input[name="' + champ + '"]');
        if (cache) cache.value = choix[champ];
        setTimeout(function () { afficher(courante + 1); }, 180);
        return;
      }
      if (e.target.closest("[data-retour]")) {
        e.preventDefault();
        afficher(courante - 1);
      }
    });

    afficher(0);
  }

  /* ------------------------------------------- formulaires (validation) */
  document.querySelectorAll("[data-form]").forEach(function (form) {
    form.addEventListener("input", function (e) {
      var champ = e.target.closest(".field");
      if (champ) champ.removeAttribute("data-invalid");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      form.querySelectorAll(".field[data-required]").forEach(function (champ) {
        var input = champ.querySelector("input, textarea");
        if (!input) return;
        var v = input.value.trim();
        var mauvais = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
        if (mauvais) {
          champ.setAttribute("data-invalid", "");
          if (ok) input.focus();
          ok = false;
        }
      });
      if (!ok) return;

      var lire = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ""; };
      var lignes = [
        "Profil : " + lire("profil"),
        "Sujet : " + lire("sujet"),
        "Rappel souhaité : " + lire("moment"),
        "",
        "Nom : " + lire("nom"),
        "E-mail : " + lire("email"),
        "Téléphone : " + lire("telephone"),
        "",
        lire("message"),
      ].filter(function (l, i) { return l !== "" || i === 3 || i === 7; });

      window.location.href =
        "mailto:" + form.getAttribute("data-to") +
        "?subject=" + encodeURIComponent(
          "Demande depuis le site — " + (lire("sujet") || lire("profil") || "Contact")) +
        "&body=" + encodeURIComponent(lignes.join("\n"));
    });
  });
})();
