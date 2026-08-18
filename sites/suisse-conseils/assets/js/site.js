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
     Parcours de devis : choix de l'assurance, questions de la branche
     correspondante, puis coordonnées. Le nombre d'étapes dépend donc de
     l'assurance choisie, et la jauge se recalcule à chaque fois.
     ===================================================================== */
  document.querySelectorAll("[data-parcours]").forEach(function (parcours) {
    var form = parcours.querySelector("form");
    var toutes = Array.prototype.slice.call(parcours.querySelectorAll(".etape"));
    var etapeType = parcours.querySelector('.etape[data-etape="type"]');
    var etapeContact = parcours.querySelector('.etape[data-etape="contact"]');
    var jauge = parcours.querySelector("[data-jauge]");
    var fil = parcours.querySelector("[data-fil]");
    var branche = "";
    var position = 0;

    var suite = function () {
      var propres = toutes.filter(function (e) { return e.dataset.branche === branche; });
      return [etapeType].concat(propres).concat([etapeContact]);
    };

    /* le fil d'étapes prend les noms de la branche choisie */
    var dessinerFil = function (liste) {
      if (!fil) return;
      fil.textContent = "";
      liste.forEach(function (etape, i) {
        var p = document.createElement("span");
        p.className = "demande__pastille";
        p.setAttribute("data-actif", String(i <= position));
        var n = document.createElement("b");
        n.textContent = String(i + 1);
        p.appendChild(n);
        p.appendChild(document.createTextNode(" " + (etape.dataset.nom || "")));
        fil.appendChild(p);
      });
    };

    var recapTexte = function () {
      var valeurs = [];
      form.querySelectorAll('input[type="hidden"]').forEach(function (i) {
        if (i.value) valeurs.push(i.value);
      });
      return valeurs.join(" · ");
    };

    var afficher = function (n) {
      var liste = suite();
      position = Math.max(0, Math.min(liste.length - 1, n));
      toutes.forEach(function (e) { e.hidden = true; });
      liste[position].hidden = false;

      if (jauge) {
        jauge.style.transform = "scaleX(" + ((position + 1) / liste.length).toFixed(3) + ")";
      }
      dessinerFil(liste);
      parcours.querySelectorAll("[data-recap]").forEach(function (r) {
        r.textContent = recapTexte();
      });

      var titre = liste[position].querySelector("h3");
      if (titre && position > 0) {
        titre.setAttribute("tabindex", "-1");
        titre.focus({ preventScroll: true });
      }
    };

    parcours.addEventListener("click", function (e) {
      var option = e.target.closest("[data-choix]");
      if (option) {
        if (option.hasAttribute("data-branche")) branche = option.getAttribute("data-branche");
        var champ = option.getAttribute("data-choix");
        var cache = form.querySelector('input[type="hidden"][name="' + champ + '"]');
        var groupe = option.closest(".options");

        if (option.hasAttribute("data-cumul")) {
          /* choix multiple : on bascule l'option et on recompose la liste */
          option.setAttribute(
            "aria-pressed",
            option.getAttribute("aria-pressed") === "true" ? "false" : "true"
          );
          if (cache && groupe) {
            var retenues = [];
            groupe.querySelectorAll('[aria-pressed="true"]').forEach(function (b) {
              retenues.push(b.getAttribute("data-valeur"));
            });
            cache.value = retenues.join(", ");
          }
          return; /* on n'avance pas : plusieurs réponses sont possibles */
        }

        if (cache) cache.value = option.getAttribute("data-valeur");
        if (groupe) {
          groupe.querySelectorAll("[data-choix]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b === option));
          });
        }

        /* une étape qui ne contient qu'une question avance toute seule */
        var etape = option.closest(".etape");
        if (etape && etape.querySelectorAll(".options").length === 1 &&
            !etape.querySelector("[data-suivant]")) {
          setTimeout(function () { afficher(position + 1); }, 170);
        }
        return;
      }
      if (e.target.closest("[data-suivant]")) {
        e.preventDefault();
        afficher(position + 1);
        return;
      }
      if (e.target.closest("[data-retour]")) {
        e.preventDefault();
        afficher(position - 1);
      }
    });

    afficher(0);
  });

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

      /* On reprend tous les champs remplis, avec l'intitulé affiché à l'écran
         quand il existe : le message reçu se lit comme le formulaire. */
      var lignes = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === "submit" || el.type === "button") return;
        var valeur = (el.value || "").trim();
        if (!valeur) return;
        var etiquette = "";
        var label = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
        if (label) etiquette = label.textContent.trim();
        else etiquette = el.name.charAt(0).toUpperCase() + el.name.slice(1).replace(/_/g, " ");
        lignes.push(etiquette + " : " + valeur);
      });

      var objet = form.elements.assurance && form.elements.assurance.value
        ? form.elements.assurance.value
        : (form.elements.sujet && form.elements.sujet.value) || "Contact";

      window.location.href =
        "mailto:" + form.getAttribute("data-to") +
        "?subject=" + encodeURIComponent("Demande depuis le site — " + objet) +
        "&body=" + encodeURIComponent(lignes.join("\n"));
    });
  });
})();
