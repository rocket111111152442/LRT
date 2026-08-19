# -*- coding: utf-8 -*-
"""Page d'accueil : portail de choix entre les deux univers ALLCX."""


def pages(B):
    body = """<div class="portal">
  <div class="portal__head">
    <div class="portal__brand">
      %s
      <span>
        <span class="portal__wordmark">ALLCX</span>
        <span class="portal__tag" style="display:block">Société par actions simplifiée</span>
      </span>
    </div>
  </div>

  <div class="portal__choices">
    <a class="choice choice--consulting" href="consulting/index.html">
      <span class="choice__bg"></span>
      <svg class="choice__art" viewBox="0 0 320 320" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">
        <circle cx="160" cy="160" r="150"/><circle cx="160" cy="160" r="106"/><circle cx="160" cy="160" r="62"/>
        <path d="M10 160h300M160 10v300"/>
        <path d="M54 266 118 190l52 34 96-120" stroke-width="2.4"/>
        <circle cx="118" cy="190" r="7" fill="currentColor" stroke="none"/>
        <circle cx="170" cy="224" r="7" fill="currentColor" stroke="none"/>
        <circle cx="266" cy="104" r="7" fill="currentColor" stroke="none"/>
      </svg>
      <span class="choice__label">Conseil aux entreprises</span>
      <span class="choice__title">ALLCX Consulting</span>
      <span class="choice__desc">Conseil en management et développement commercial, formation des équipes commerciales, apport d’affaires. Pour les entreprises et les porteurs de projets, en France et en Afrique francophone.</span>
      <span class="choice__enter">Entrer %s</span>
    </a>

    <a class="choice choice--patrimoine" href="patrimoine/index.html">
      <span class="choice__bg"></span>
      <svg class="choice__art" viewBox="0 0 320 320" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M40 292V150a120 120 0 0 1 240 0v142"/>
        <path d="M80 292V158a80 80 0 0 1 160 0v134"/>
        <path d="M120 292V166a40 40 0 0 1 80 0v126"/>
        <path d="M160 30v262"/>
        <path d="M12 300h296" stroke-width="2.4"/>
        <path d="M146 22h28l-6 34h-16z" fill="currentColor" stroke="none"/>
      </svg>
      <span class="choice__label">Transactions sur immeubles et fonds de commerce</span>
      <span class="choice__title">ALLCX Patrimoine</span>
      <span class="choice__desc">Conseil en investissement immobilier, acquisition de résidence principale ou secondaire, fonds de commerce et relocation. Activité réglementée, exercée sous carte professionnelle.</span>
      <span class="choice__enter">Entrer %s</span>
    </a>
  </div>

  <div class="portal__foot">
    <span>SIRET %s — Activité réglementée exercée sous carte professionnelle n° %s</span>
    <span>
      <a href="consulting/mentions-legales.html">Mentions légales — Consulting</a>
      &nbsp;·&nbsp;
      <a href="patrimoine/mentions-legales.html">Mentions légales — Patrimoine</a>
    </span>
  </div>
</div>""" % (
        B.MARK_PORTAL.replace('class="logo__mark"', 'class="logo__mark"'),
        B.ARROW, B.ARROW, B.SIRET, B.CARTE_T,
    )

    return [(
        "index.html",
        "ALLCX — Conseil aux entreprises et transactions immobilières",
        "ALLCX : deux pôles d’activité. ALLCX Consulting pour le conseil en management, le développement "
        "commercial et la formation ; ALLCX Patrimoine pour les transactions sur immeubles et fonds de commerce.",
        body,
    )]
