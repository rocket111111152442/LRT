/* Suisse-Conseils Management — interactions
   Menu, accordéon, apparition au défilement, formulaire.
   Rien qui tourne en continu : l'observateur se détache dès l'élément affiché. */
(function () {
  "use strict";

  /* menu mobile */
  var burger = document.querySelector("[data-burger]");
  var nav = document.querySelector("[data-nav]");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* apparition au défilement */
  var rises = document.querySelectorAll(".rise");
  if (rises.length) {
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rises.forEach(function (el) { el.classList.add("on"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("on");
          io.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

      rises.forEach(function (el, i) {
        el.style.transitionDelay = (Math.min(i % 4, 3) * 0.06).toFixed(2) + "s";
        io.observe(el);
      });
    }
  }

  /* accordéon */
  document.querySelectorAll("[data-faq]").forEach(function (faq) {
    faq.querySelectorAll(".faq__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";

        faq.querySelectorAll('.faq__btn[aria-expanded="true"]').forEach(function (other) {
          if (other === btn) return;
          other.setAttribute("aria-expanded", "false");
          var p = document.getElementById(other.getAttribute("aria-controls"));
          if (p) p.setAttribute("data-open", "false");
        });

        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.setAttribute("data-open", String(!open));
      });
    });
  });

  /* année */
  var y = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = y; });

  /* formulaire : validation puis ouverture de la messagerie */
  var form = document.querySelector("[data-form]");
  if (!form) return;

  form.addEventListener("input", function (e) {
    var field = e.target.closest(".field");
    if (field) field.removeAttribute("data-invalid");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    form.querySelectorAll(".field[data-required]").forEach(function (field) {
      var input = field.querySelector("input, textarea");
      if (!input) return;
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      if (bad) {
        field.setAttribute("data-invalid", "");
        if (ok) input.focus();
        ok = false;
      }
    });

    if (!ok) return;

    var get = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ""; };
    var body = [
      "Nom : " + get("nom"),
      "E-mail : " + get("email"),
      "Téléphone : " + get("telephone"),
      "Situation : " + get("situation"),
      "Sujet : " + get("sujet"),
      "",
      get("message")
    ].join("\n");

    window.location.href =
      "mailto:" + form.getAttribute("data-to") +
      "?subject=" + encodeURIComponent("Demande depuis le site — " + (get("sujet") || "Contact")) +
      "&body=" + encodeURIComponent(body);
  });
})();
