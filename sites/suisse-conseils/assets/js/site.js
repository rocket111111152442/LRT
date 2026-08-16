/* =============================================================================
   Suisse-Conseils Management — comportements d'interface
   Vanilla JS, sans dépendance. Tout est dégradable : sans JS le site reste lisible.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* --------------------------------------------------------------- header */
  var header = document.querySelector("[data-header]");
  if (header) {
    var progress = header.querySelector(".header__progress");
    var lastY = window.scrollY;
    var ticking = false;

    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle("header--stuck", y > 24);

      // masque le header quand on descend, le rend quand on remonte
      if (y > 320 && y > lastY + 6) {
        header.classList.add("header--hidden");
      } else if (y < lastY - 6) {
        header.classList.remove("header--hidden");
      }
      lastY = y;

      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(onScroll);
        }
      },
      { passive: true }
    );
    onScroll();
  }

  /* ----------------------------------------------------------- menu mobile */
  var burger = document.querySelector("[data-burger]");
  var menu = document.querySelector("[data-menu]");
  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("data-open", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (header) header.classList.remove("header--hidden");
    };

    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------------ révélation scroll */
  var revealables = document.querySelectorAll("[data-reveal], [data-reveal-lines]");
  if (revealables.length) {
    if (!("IntersectionObserver" in window) || reduced) {
      revealables.forEach(function (el) {
        el.classList.add("is-in");
      });
    } else {
      // décalage progressif entre enfants d'un même bloc
      document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
        var step = parseFloat(group.getAttribute("data-reveal-group")) || 0.07;
        group.querySelectorAll("[data-reveal]").forEach(function (el, i) {
          el.style.setProperty("--d", (i * step).toFixed(3) + "s");
        });
      });

      document.querySelectorAll("[data-reveal-lines]").forEach(function (block) {
        Array.prototype.forEach.call(block.children, function (child, i) {
          child.style.transitionDelay = (i * 0.075).toFixed(3) + "s";
        });
      });

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );

      revealables.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------- compteurs */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          cio.unobserve(el);
          var target = parseFloat(el.getAttribute("data-count"));
          var suffix = el.getAttribute("data-suffix") || "";
          var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;

          if (reduced) {
            el.textContent = target.toFixed(decimals) + suffix;
            return;
          }
          var start = performance.now();
          var dur = 1500;
          var tick = function (now) {
            var p = Math.min(1, (now - start) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  }

  /* --------------------------------------------------------------- curseur */
  if (fine && !reduced) {
    var dot = document.createElement("div");
    dot.className = "cursor";
    document.body.appendChild(dot);

    var cx = -100, cy = -100, tx = -100, ty = -100;
    document.addEventListener(
      "mousemove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );

    var loop = function () {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      dot.style.transform = "translate3d(" + (cx - 4.5) + "px," + (cy - 4.5) + "px,0)";
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.addEventListener("mouseover", function (e) {
      var hot = e.target.closest("a, button, .card, .tab, input, textarea");
      dot.classList.toggle("cursor--lg", !!hot);
    });
  }

  /* ------------------------------------------------------ boutons magnétiques */
  if (fine && !reduced) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.28;

      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate3d(" + dx * strength + "px," + dy * strength + "px,0)";
      });

      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ----------------------------------------------- lueur suivant le curseur */
  document.querySelectorAll("[data-glow]").forEach(function (el) {
    el.addEventListener(
      "pointermove",
      function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      },
      { passive: true }
    );
  });

  /* ------------------------------------------------------ onglets « profil » */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));

    var activate = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", String(on));
        tab.setAttribute("tabindex", on ? "0" : "-1");
        if (on && focus) tab.focus();
      });
      panels.forEach(function (panel, i) {
        panel.hidden = i !== index;
        if (i === index) {
          panel.classList.remove("is-in");
          // relance l'animation d'entrée du panneau
          void panel.offsetWidth;
          panel.classList.add("is-in");
        }
      });
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        activate(i, false);
      });
      tab.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        activate((i + dir + tabs.length) % tabs.length, true);
      });
    });

    activate(0, false);
  });

  /* ------------------------------------------------------------ accordéons */
  document.querySelectorAll("[data-acc]").forEach(function (acc) {
    acc.querySelectorAll(".acc__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";

        // un seul volet ouvert à la fois
        acc.querySelectorAll('.acc__btn[aria-expanded="true"]').forEach(function (other) {
          if (other === btn) return;
          other.setAttribute("aria-expanded", "false");
          var op = document.getElementById(other.getAttribute("aria-controls"));
          if (op) op.setAttribute("data-open", "false");
        });

        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.setAttribute("data-open", String(!open));
      });
    });
  });

  /* ------------------------------------------------------- année courante */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------------------------------------------------- formulaire contact */
  var form = document.querySelector("[data-form]");
  if (form) {
    var mark = function (field, invalid) {
      field.setAttribute("data-invalid", String(invalid));
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      form.querySelectorAll(".field[data-required]").forEach(function (field) {
        var input = field.querySelector("input, textarea, select");
        if (!input) return;
        var value = input.value.trim();
        var bad = !value || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value));
        mark(field, bad);
        if (bad && ok) {
          input.focus();
          ok = false;
        }
      });

      if (!ok) return;

      var get = function (name) {
        var el = form.elements[name];
        return el ? el.value.trim() : "";
      };

      var lines = [
        "Nom : " + get("nom"),
        "E-mail : " + get("email"),
        "Téléphone : " + get("telephone"),
        "Sujet : " + get("sujet"),
        "",
        get("message"),
      ];

      var href =
        "mailto:" +
        form.getAttribute("data-to") +
        "?subject=" +
        encodeURIComponent("Demande depuis le site — " + (get("sujet") || "Contact")) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));

      var status = form.querySelector("[data-status]");
      if (status) {
        status.textContent = "Votre messagerie s'ouvre avec le message pré-rempli. Si rien ne se passe, écrivez directement à " + form.getAttribute("data-to") + ".";
      }
      window.location.href = href;
    });

    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.getAttribute("data-invalid") === "true") mark(field, false);
    });
  }

  /* ------------------------------------------- relief animé de la bannière */
  var canvas = document.querySelector("[data-relief]");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1;
    var t = 0;
    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    var running = true;

    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // relief pseudo-aléatoire : somme d'ondes déphasées, pas de bibliothèque
    var ridge = function (x, seed, time) {
      return (
        Math.sin(x * 0.0062 + seed * 1.7 + time) * 26 +
        Math.sin(x * 0.0131 + seed * 0.62 - time * 1.35) * 13 +
        Math.sin(x * 0.0031 + seed * 2.4 + time * 0.55) * 34 +
        Math.sin(x * 0.024 + seed * 3.1 - time * 0.8) * 5
      );
    };

    var draw = function () {
      ctx.clearRect(0, 0, w, h);

      var lines = w < 700 ? 26 : 40;
      var top = h * 0.3;
      var span = h * 0.78;
      var step = span / lines;
      var px = (mouse.x - 0.5) * 26;
      var py = (mouse.y - 0.5) * 16;

      for (var i = 0; i < lines; i++) {
        var p = i / (lines - 1);
        var baseY = top + i * step + py * (1 - p);
        var amp = 0.35 + Math.pow(p, 1.5) * 1.5;
        var alpha = 0.1 + Math.pow(p, 1.3) * 0.78;

        ctx.beginPath();
        var firstY = 0;
        for (var x = -40; x <= w + 40; x += 7) {
          // atténuation sur les bords : la crête retombe à plat
          var edge = Math.min(1, Math.min(x + 40, w + 40 - x) / (w * 0.34));
          var y = baseY - ridge(x + px * (1 + p), i * 0.37, t) * amp * edge * edge;
          if (x === -40) {
            firstY = y;
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // remplissage opaque sous la crête : occlusion des lignes du fond
        ctx.save();
        ctx.lineTo(w + 40, h + 60);
        ctx.lineTo(-40, h + 60);
        ctx.closePath();
        ctx.fillStyle = "rgba(5, 7, 10, 0.88)";
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = "rgba(87, 224, 180, " + alpha.toFixed(3) + ")";
        ctx.lineWidth = i === lines - 1 ? 1.4 : 1;
        ctx.stroke();

        void firstY;
      }
    };

    var frame = function () {
      if (!running) return;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      t += 0.0035;
      draw();
      requestAnimationFrame(frame);
    };

    window.addEventListener("resize", function () {
      resize();
      if (reduced) draw();
    });

    window.addEventListener(
      "pointermove",
      function (e) {
        mouse.tx = e.clientX / window.innerWidth;
        mouse.ty = Math.min(1, e.clientY / window.innerHeight);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
      } else if (!reduced) {
        running = true;
        requestAnimationFrame(frame);
      }
    });

    resize();
    if (reduced) {
      draw();
    } else {
      requestAnimationFrame(frame);
    }
  }
})();
