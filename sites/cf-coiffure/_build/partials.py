HEAD = '''<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600&family=Bebas+Neue&family=Yellowtail&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script>if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('anim');</script>
  <script src="/assets/vendor/gsap.min.js" defer></script>
  <script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
  <script src="/assets/vendor/lenis.min.js" defer></script>
  <script src="/assets/js/main.js" defer></script>'''

HEADER = '''<div class="grain" aria-hidden="true"></div>
<div class="curtain" aria-hidden="true"><i></i><i></i><i></i><div class="curtain-logo">CF</div></div>
<div class="cursor" aria-hidden="true"></div><div class="cursor-ring" aria-hidden="true"><span></span></div>
<div class="topbar">
  <div class="wrap">
    <span>Du mardi au samedi · <span class="hide-sm">273 av. Joseph Raynaud, </span>Six-Fours-les-Plages</span>
    <a class="hide-sm" href="https://www.google.com/maps/search/?api=1&amp;query=CF+Coiffure+Six-Fours-les-Plages" target="_blank" rel="noopener"><span class="stars">★★★★★</span> 4,9 sur Google</a>
  </div>
</div>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="/" aria-label="CF Coiffure, accueil"><b>CF</b><span>Coiffure</span></a>
    <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span></button>
    <nav class="nav" id="nav">
      <a href="/le-salon.html">Le salon</a>
      <a href="/tarifs.html">Tarifs</a>
      <a href="/infos.html">Infos pratiques</a>
      <a class="btn small" href="/reserver.html" data-magnetic data-cursor="Go">Réserver</a>
    </nav>
  </div>
</header>'''

FOOTER = '''<div class="martini-line" aria-hidden="true"></div>
<footer class="site-footer">
  <div class="footer-big" aria-hidden="true">CF Coiffure</div>
  <div class="wrap footer-grid">
    <div>
      <a class="logo" href="/"><b>CF</b><span>Coiffure</span></a>
      <p>Salon de coiffure femmes, hommes et enfants à Six-Fours-les-Plages, dans une ambiance de garage américain.</p>
      <p>273 avenue Joseph Raynaud<br>83140 Six-Fours-les-Plages</p>
    </div>
    <div>
      <h4>Le site</h4>
      <ul>
        <li><a href="/le-salon.html">Le salon</a></li>
        <li><a href="/tarifs.html">Tarifs</a></li>
        <li><a href="/infos.html">Horaires et accès</a></li>
        <li><a href="/reserver.html">Prendre rendez-vous</a></li>
      </ul>
    </div>
    <div>
      <h4>Horaires</h4>
      <ul data-hours-short></ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© <span data-year></span> CF Coiffure</span>
    <span><a href="/mentions-legales.html">Mentions légales et crédits photos</a> · <a href="/admin.html">Espace salon</a></span>
  </div>
</footer>'''
