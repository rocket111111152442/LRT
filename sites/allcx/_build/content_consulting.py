# -*- coding: utf-8 -*-
"""Contenu des pages ALLCX Consulting."""

import diagram


def pages(B):
    A = B.ARROW
    TODO = B.TODO
    P = []

    # =======================================================================
    # ACCUEIL
    # =======================================================================
    accueil = """
<section class="hero hero--dark">
  <span class="hero__grid-lines" aria-hidden="true"></span>
  <div class="shell hero__inner">
    <p class="eyebrow" data-reveal>Conseil pour les affaires et autres conseils de gestion</p>
    <h1 class="display-xl hero__title" data-reveal>Ouvrir des marchés, structurer la vente, faire progresser les équipes.</h1>
    <p class="lede hero__lede" data-reveal>
      ALLCX Consulting accompagne les dirigeants de TPE et PME, les directions commerciales et les porteurs
      de projets qui veulent développer leur activité en France et s’implanter en Afrique francophone.
    </p>
    <div class="btn-row hero__actions" data-reveal>
      <a class="btn btn--light" href="contact.html"><span>Prendre rendez-vous</span></a>
      <a class="btn btn--outline-light" href="expertises.html"><span>Voir les expertises</span></a>
    </div>
    <div class="hero-meta" data-reveal>
      <div class="hero-meta__item"><span class="hero-meta__k">03</span><span class="hero-meta__v">Domaines d’intervention</span></div>
      <div class="hero-meta__item"><span class="hero-meta__k">02</span><span class="hero-meta__v">Zones couvertes</span></div>
      <div class="hero-meta__item"><span class="hero-meta__k">01</span><span class="hero-meta__v">Interlocuteur, du cadrage à l’exécution</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">01 — Positionnement</p>
        <h2 class="display-lg">Un cabinet de terrain, engagé sur l’exécution.</h2>
        <p class="lede mt-3">
          Beaucoup de missions de conseil s’arrêtent au diagnostic. Les nôtres commencent là.
        </p>
        <p class="body-lg muted mt-3 measure">
          Nous travaillons en équipes réduites, sur des cycles courts, et restons impliqués jusqu’à ce que les
          premiers effets commerciaux soient mesurables. Nos interlocuteurs sont des structures qui n’ont pas
          encore de direction commerciale constituée — TPE, PME, filiales en création — et des entreprises
          établies qui ouvrent un marché nouveau et cherchent un relais fiable sur place.
        </p>
        <ul class="list-check mt-4">
          <li><strong>Un interlocuteur unique.</strong> Celui qui cadre la mission est celui qui la conduit.</li>
          <li><strong>Des livrables utilisables.</strong> Argumentaires, plans de comptes, scripts d’entretien, tableaux de suivi — pas des présentations.</li>
          <li><strong>Un transfert de compétence.</strong> Chaque mission se termine par la formation de ceux qui reprendront le dispositif.</li>
          <li><strong>Un cadre écrit.</strong> Périmètre, calendrier et honoraires arrêtés avant le démarrage.</li>
        </ul>
      </div>
      <div data-reveal>
        <div class="card card--dark">
          <p class="index-num">Ce que nous ne faisons pas</p>
          <ul class="list-check mt-2">
            <li>Nous ne vendons pas de fichiers de prospection.</li>
            <li>Nous n’engageons pas de mission sans périmètre écrit.</li>
            <li>Nous ne garantissons pas un volume de ventes : nous nous engageons sur une méthode, un rythme et des moyens.</li>
            <li>Nous ne restons pas au-delà de l’utile — l’objectif est que l’entreprise se passe de nous.</li>
          </ul>
        </div>
        <div class="card mt-3">
          <p class="index-num">La société</p>
          <ul class="list-rule mt-2">
            <li><span class="k">Forme juridique</span><span class="v">SAS</span></li>
            <li><span class="k">SIRET</span><span class="v">""" + B.SIRET + """</span></li>
            <li><span class="k">Activité</span><span class="v">Conseil de gestion</span></li>
            <li><span class="k">Zones</span><span class="v">France, Afrique francophone</span></li>
          </ul>
          <div class="card__foot"><a class="link link--reverse" href="cabinet.html">Le cabinet """ + A + """</a></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">02 — Expertises</p>
        <h2 class="display-lg">Trois métiers, une même logique commerciale.</h2>
      </div>
      <div data-reveal>
        <p class="lede">
          Les trois interventions se combinent ou s’activent séparément, selon la maturité de l’entreprise
          et l’urgence du sujet.
        </p>
      </div>
    </div>

    <div class="ledger" data-reveal-group>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">01</span>
        <h3 class="ledger__title">Conseil en management et développement commercial</h3>
        <p class="ledger__desc">Diagnostic de la performance commerciale, construction de l’offre et du discours, organisation de la prospection, pilotage par indicateurs.</p>
        <a class="link link--reverse" href="expertises.html#conseil">Détail """ + A + """</a>
      </div>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">02</span>
        <h3 class="ledger__title">Coaching et formation commerciale</h3>
        <p class="ledger__desc">Formation de conseillers clientèle et d’équipes de vente, accompagnement individuel des managers, interventions auprès d’étudiants en BTS MCO.</p>
        <a class="link link--reverse" href="formation.html">Détail """ + A + """</a>
      </div>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">03</span>
        <h3 class="ledger__title">Apport d’affaires et mise en relation</h3>
        <p class="ledger__desc">Ouverture de comptes et de partenariats pour les TPE et PME, qualification des interlocuteurs, introduction et suivi jusqu’à la signature.</p>
        <a class="link link--reverse" href="expertises.html#apport">Détail """ + A + """</a>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:linear-gradient(160deg,var(--bordeaux-950),#1B0409);color:rgba(255,255,255,.74)">
  <div class="shell on-dark">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow" style="color:var(--gold-300)">03 — Afrique francophone</p>
        <h2 class="display-lg">S’implanter sans brûler les étapes.</h2>
        <p class="lede mt-3" style="color:rgba(255,255,255,.74)">
          Un marché africain ne s’ouvre pas depuis un tableur. Il s’ouvre en identifiant les bons
          interlocuteurs, en comprenant les circuits de décision et en sécurisant les premiers contrats.
        </p>
        <ul class="list-check mt-4">
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Étude de faisabilité commerciale</strong> — taille réelle du marché adressable, concurrence locale, niveau de prix acceptable.</li>
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Choix du mode d’entrée</strong> — distributeur, agent, filiale, coentreprise : chaque option a un coût et un délai.</li>
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Constitution du réseau</strong> — partenaires, prescripteurs, appuis institutionnels et professionnels du chiffre.</li>
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Premiers rendez-vous</strong> — préparation, accompagnement sur place et suivi post-mission.</li>
        </ul>
        <div class="btn-row mt-4">
          <a class="btn btn--light" href="afrique.html"><span>L’offre Afrique francophone</span></a>
        </div>
      </div>
      <div data-reveal>
        """ + diagram.network() + """
        <p class="mt-3" style="font-size:.8125rem;color:rgba(255,255,255,.5)">
          Marchés suivis en propre ou via le réseau de partenaires du cabinet. D’autres pays peuvent être
          couverts sur demande, après étude de faisabilité.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">04 — Méthode</p>
        <h2 class="display-lg">Quatre temps, une trajectoire lisible.</h2>
      </div>
      <div data-reveal>
        <p class="lede">
          Les durées ci-dessous sont des ordres de grandeur : elles sont arrêtées avec vous au cadrage,
          en fonction du périmètre et de la disponibilité de vos équipes.
        </p>
      </div>
    </div>
    <div class="steps" data-reveal-group>
      <div class="step" data-reveal>
        <h3>Cadrage</h3>
        <p>Entretien de direction, formalisation de l’objectif commercial, du périmètre et des critères de réussite. Proposition écrite, chiffrée et datée. <em class="muted">Une à deux semaines.</em></p>
      </div>
      <div class="step" data-reveal>
        <h3>Diagnostic</h3>
        <p>Analyse du portefeuille, écoute d’entretiens de vente, revue des supports et du parcours client, entretiens avec les équipes et quelques clients. <em class="muted">Deux à quatre semaines.</em></p>
      </div>
      <div class="step" data-reveal>
        <h3>Plan d’action et outils</h3>
        <p>Priorisation des cibles, construction de l’argumentaire, plan de prospection, outils de suivi et indicateurs. Les livrables sont remis dans vos formats. <em class="muted">Trois à six semaines.</em></p>
      </div>
      <div class="step" data-reveal>
        <h3>Déploiement et transfert</h3>
        <p>Mise en œuvre avec les équipes, accompagnement en rendez-vous, ajustements, puis formation des relais internes et point de sortie. <em class="muted">Un à six mois.</em></p>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="split">
      <div data-reveal>
        <p class="eyebrow">05 — Formation</p>
        <h2 class="display-md">Former ceux qui vendent.</h2>
        <p class="body-lg muted mt-3">
          Le cabinet conçoit et anime des formations commerciales pour des salariés d’entreprise et des
          étudiants, en France comme à l’étranger. Les contenus sont construits à partir des situations
          réelles de vente de l’organisation, pas d’un catalogue.
        </p>
        <p class="body-lg muted mt-2">
          Interventions déjà conduites auprès d’étudiants en BTS Management Commercial Opérationnel
          (1<sup>re</sup> et 2<sup>e</sup> année) et de conseillers clientèle dans la banque, l’assurance,
          l’immobilier et les télécommunications.
        </p>
        <div class="btn-row mt-4">
          <a class="btn btn--ghost" href="formation.html"><span>Programmes et modalités</span></a>
        </div>
      </div>
      <div data-reveal>
        <div class="grid grid-2" data-reveal-group>
          <div class="card" data-reveal><p class="index-num">Publics</p><h3 class="display-sm">Conseillers clientèle</h3><p>Banque, assurance, immobilier, télécoms, distribution.</p></div>
          <div class="card" data-reveal><p class="index-num">Publics</p><h3 class="display-sm">Managers</h3><p>Animation d’équipe, entretiens, pilotage de l’activité.</p></div>
          <div class="card" data-reveal><p class="index-num">Publics</p><h3 class="display-sm">Étudiants</h3><p>BTS MCO et filières commerciales, en présentiel.</p></div>
          <div class="card" data-reveal><p class="index-num">Formats</p><h3 class="display-sm">Sur mesure</h3><p>Demi-journée, journée, cycle court ou accompagnement continu.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell shell--narrow tac" data-reveal>
    <p class="quote">« Un marché ne s’ouvre pas depuis une salle de réunion. Il s’ouvre en rencontrant, un par un, ceux qui décident sur place. »</p>
    <p class="mt-3" style="font-family:var(--font-sans);font-size:.6875rem;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted)">Fabrice Ekissi — Fondateur</p>
  </div>
</section>

<section class="section section--tight section--line">
  <div class="shell">
    <p class="eyebrow" data-reveal>Secteurs d’intervention</p>
    <div class="marks mt-3" data-reveal>
      <span class="mark">Banque</span>
      <span class="mark">Assurance</span>
      <span class="mark">Immobilier</span>
      <span class="mark">Télécommunications</span>
      <span class="mark">Distribution spécialisée</span>
      <span class="mark">Services aux entreprises</span>
      <span class="mark">Hôtellerie</span>
      <span class="mark">Enseignement supérieur</span>
    </div>
  </div>
</section>

""" + B.cta_block(
        "consulting",
        "Un premier échange, sans engagement.",
        "Décrivez votre situation en quelques lignes : marché visé, taille de l’équipe commerciale, échéance. "
        "Nous revenons vers vous avec un avis franc sur la faisabilité et, si le sujet nous paraît hors de "
        "notre champ, nous vous le disons.",
        ("contact.html", "Écrire au cabinet"),
        ("expertises.html", "Voir les expertises"),
    )

    P.append((
        "index.html",
        "ALLCX Consulting — Conseil en développement commercial, France et Afrique francophone",
        "Cabinet de conseil en management et développement commercial : diagnostic, plan d’action, formation "
        "des équipes et apport d’affaires. Accompagnement à l’implantation en Afrique francophone.",
        accueil,
    ))

    return P
