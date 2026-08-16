/* Suisse-Conseils Management — le strict nécessaire.
   Pas de boucle d'animation, pas d'observateur, pas d'écouteur de souris. */
(function () {
  "use strict";

  // menu mobile
  var burger = document.querySelector("[data-burger]");
  var nav = document.querySelector("[data-nav]");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });
  }

  // année du copyright
  var y = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = y;
  });

  // formulaire : validation simple puis ouverture de la messagerie
  var form = document.querySelector("[data-form]");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    form.querySelectorAll(".field[data-required]").forEach(function (field) {
      var input = field.querySelector("input, textarea");
      if (!input) return;
      var value = input.value.trim();
      var bad = !value || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value));
      if (bad) {
        field.setAttribute("data-invalid", "");
        if (ok) input.focus();
        ok = false;
      } else {
        field.removeAttribute("data-invalid");
      }
    });

    if (!ok) return;

    var get = function (name) {
      return form.elements[name] ? form.elements[name].value.trim() : "";
    };

    var body = [
      "Nom : " + get("nom"),
      "E-mail : " + get("email"),
      "Téléphone : " + get("telephone"),
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
