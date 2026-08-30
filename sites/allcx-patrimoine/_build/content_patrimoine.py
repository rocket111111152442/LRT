# -*- coding: utf-8 -*-
"""Page d'accueil ALLCX Patrimoine."""


def pages(B):
    A, TODO = B.ARROW, B.TODO

    accueil = """
<section class="hero hero--frame">
  <div class="shell hero__inner">
    <div class="split split--wide-left" style="align-items:stretch">
      <div style="align-self:center">
        <p class="eyebrow" data-reveal>Transactions sur immeubles et fonds de commerce</p>
        <h1 class="display-lg hero__title" data-reveal>L’immobilier traité comme un dossier, pas comme une annonce.</h1>
        <p class="lede hero__lede" data-reveal>
          ALLCX Patrimoine accompagne particuliers, investisseurs et sportifs professionnels dans
          l’acquisition de biens immobiliers et de fonds de commerce, ainsi que dans leur installation
          en France. Activité réglementée, exercée sous carte professionnelle.
        </p>
        <div class="btn-row hero__actions" data-reveal>
          <a class="btn" href="contact.html"><span>Nous confier un projet</span></a>
          <a class="btn btn--ghost" href="investissement.html"><span>Investir</span></a>
        </div>
      </div>
      <div data-reveal>
        <figure class="hero-figure hero-figure--fill">
          <img src="assets/img/haussmann.svg" alt="Façade haussmannienne : pierre de taille, balcons en fer forgé et toiture en zinc." width="1200" height="900" loading="eager">
        </figure>
      </div>
    </div>
    <div class="hero-meta hero-meta--light" data-reveal>
      <div class="hero-meta__item"><span class="hero-meta__k">+2,1 M€</span><span class="hero-meta__v">Volume de transactions réalisées</span></div>
      <div class="hero-meta__item"><span class="hero-meta__k">+20</span><span class="hero-meta__v">Projets réalisés</span></div>
      <div class="hero-meta__item"><span class="hero-meta__k">+5</span><span class="hero-meta__v">Années d’expertise</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">01 — Le métier</p>
        <h2 class="display-lg">Un cabinet de transaction, pas un portail d’annonces.</h2>
        <p class="lede mt-3">
          Un bien ne vaut rien en soi. Il vaut par rapport à un projet, à une fiscalité et à un horizon.
        </p>
        <p class="body-lg muted mt-3 measure">
          Nous commençons par la situation du client — objectif, capacité d’emprunt, régime fiscal,
          durée de détention envisagée — avant de parler de biens. La recherche vient ensuite, et elle
          est restreinte : mieux vaut trois dossiers instruits qu’une liste de trente annonces.
        </p>
        <p class="body-lg muted mt-2 measure">
          L’accompagnement va jusqu’à la signature chez le notaire, et se prolonge par la mise en relation
          avec les professionnels qui prendront le relais : courtage, gestion locative, assurance, gestion
          de patrimoine.
        </p>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Cadre d’exercice</p>
          <ul class="list-rule mt-2">
            <li><span class="k">Carte professionnelle</span><span class="v">""" + B.CARTE_T + """</span></li>
            <li><span class="k">Mention</span><span class="v">Transactions sur immeubles<br>et fonds de commerce</span></li>
            <li><span class="k">Délivrée par</span><span class="v">""" + B.CARTE_T_CCI + """</span></li>
            <li><span class="k">Zone</span><span class="v">France entière</span></li>
          </ul>
          <div class="card__foot"><a class="link link--reverse" href="honoraires.html">Barème d’honoraires """ + A + """</a></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">02 — Services</p>
        <h2 class="display-lg">Cinq accompagnements distincts.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Ils se combinent souvent : un investisseur qui acquiert un fonds de commerce
        cherche presque toujours, ensuite, un gestionnaire et une assurance.</p>
      </div>
    </div>
    <div class="ledger" data-reveal-group>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">01</span>
        <h3 class="ledger__title">Investissement immobilier locatif</h3>
        <p class="ledger__desc">Sélection de biens destinés à la location, analyse du rendement et du régime fiscal applicable à la situation du client. France entière.</p>
        <a class="link link--reverse" href="investissement.html">Détail """ + A + """</a>
      </div>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">02</span>
        <h3 class="ledger__title">Fonds de commerce et murs commerciaux</h3>
        <p class="ledger__desc">Recherche, analyse d’exploitation et négociation pour le compte de l’acquéreur. Hôtellerie, restauration, commerce de détail, services.</p>
        <a class="link link--reverse" href="investissement.html#fonds">Détail """ + A + """</a>
      </div>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">03</span>
        <h3 class="ledger__title">Résidence principale et secondaire</h3>
        <p class="ledger__desc">Accompagnement à l’acquisition, y compris sur le segment de l’immobilier de prestige, avec des partenaires spécialisés.</p>
        <a class="link link--reverse" href="acquisition.html">Détail """ + A + """</a>
      </div>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">04</span>
        <h3 class="ledger__title">Relocation et mobilité</h3>
        <p class="ledger__desc">Recherche de logement pour les personnes en mobilité professionnelle, dont les sportifs de haut niveau et leur famille.</p>
        <a class="link link--reverse" href="relocation.html">Détail """ + A + """</a>
      </div>
      <div class="ledger__row" data-reveal>
        <span class="ledger__num">05</span>
        <h3 class="ledger__title">Mise en relation avec les professionnels du patrimoine</h3>
        <p class="ledger__desc">Courtiers en crédit, gestionnaires locatifs, régies immobilières, assureurs et conseillers en gestion de patrimoine.</p>
        <a class="link link--reverse" href="acquisition.html#partenaires">Détail """ + A + """</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">03 — Les biens</p>
        <h2 class="display-lg">Les typologies que nous traitons.</h2>
      </div>
      <div data-reveal>
        <p class="lede">De l’appartement de rapport en centre-ville à l’actif d’exploitation.
        Les biens disponibles sont communiqués sur demande, au cas par cas.</p>
      </div>
    </div>
    <div class="grid grid-3" data-reveal-group>
      <article class="estate" data-reveal>
        <div class="estate__media">
          <span class="estate__tag">Immeuble de rapport</span>
          <img src="assets/img/haussmann.svg" alt="Façade d’immeuble haussmannien." width="1200" height="900" loading="lazy">
        </div>
        <div class="estate__body">
          <h3>Haussmannien de centre-ville</h3>
          <p>Appartements et lots à diviser, dans les quartiers où la demande locative reste tendue toute l’année.</p>
          <div class="estate__meta"><span>Locatif</span><span>Centre-ville</span><span>France entière</span></div>
        </div>
      </article>
      <article class="estate" data-reveal>
        <div class="estate__media">
          <span class="estate__tag">Résidence</span>
          <img src="assets/img/villa.svg" alt="Villa contemporaine avec piscine et terrasse." width="1200" height="900" loading="lazy">
        </div>
        <div class="estate__body">
          <h3>Villa et maison d’exception</h3>
          <p>Résidence principale ou secondaire, en direct ou via nos partenaires de l’immobilier de prestige.</p>
          <div class="estate__meta"><span>Acquisition</span><span>Prestige</span><span>Sur dossier</span></div>
        </div>
      </article>
      <article class="estate" data-reveal>
        <div class="estate__media">
          <span class="estate__tag">Fonds de commerce</span>
          <img src="assets/img/hotel.svg" alt="Façade d’un hôtel avec marquise et stores." width="1200" height="900" loading="lazy">
        </div>
        <div class="estate__body">
          <h3>Hôtellerie et actifs d’exploitation</h3>
          <p>Reprise d’exploitation, murs et fonds, avec analyse du compte d’exploitation et du bail.</p>
          <div class="estate__meta"><span>Investissement</span><span>Exploitation</span><span>Négociation</span></div>
        </div>
      </article>
    </div>
    <div class="btn-row mt-6" data-reveal>
      <a class="btn btn--ghost" href="biens.html"><span>Voir toutes les typologies</span></a>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">04 — Méthode</p>
        <h2 class="display-lg">Quatre étapes, jusqu’à l’acte authentique.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Le client sait à tout moment où en est son dossier, ce qui reste à faire et
        qui en a la charge.</p>
      </div>
    </div>
    <div class="steps" data-reveal-group>
      <div class="step" data-reveal>
        <h3>Cadrage du projet</h3>
        <p>Objectif poursuivi, budget et capacité d’emprunt, régime fiscal, horizon de détention, contraintes personnelles. C’est cette étape qui détermine tout le reste.</p>
      </div>
      <div class="step" data-reveal>
        <h3>Recherche et présélection</h3>
        <p>Mobilisation du réseau, des mandats disponibles et des opportunités hors marché. Nous présentons peu de biens, mais chacun est instruit : diagnostic, charges, travaux, environnement locatif.</p>
      </div>
      <div class="step" data-reveal>
        <h3>Visites et analyse</h3>
        <p>Visites accompagnées, vérification des éléments déterminants, estimation des travaux, calcul du rendement net et simulation fiscale lorsque le projet est locatif.</p>
      </div>
      <div class="step" data-reveal>
        <h3>Négociation et signature</h3>
        <p>Stratégie d’offre, négociation du prix et des conditions, coordination avec le courtier et le notaire, suivi jusqu’à la signature de l’acte authentique.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:linear-gradient(155deg,var(--bordeaux-900),var(--bordeaux-950));color:rgba(255,255,255,.74)">
  <div class="shell on-dark">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow" style="color:var(--gold-300)">05 — Sportifs de haut niveau</p>
        <h2 class="display-lg">Un club recrute, la famille doit être installée en trente jours.</h2>
        <p class="lede mt-3" style="color:rgba(255,255,255,.74)">
          ALLCX Patrimoine accompagne des joueurs professionnels dans leur installation :
          recherche de logement, visites groupées, constitution du dossier, remise des clés — et, lorsque
          la carrière se projette, acquisition d’un patrimoine.
        </p>
        <ul class="list-check mt-4">
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Délais courts.</strong> Recherche lancée dès la signature du joueur, visites regroupées sur une à deux journées.</li>
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Discrétion.</strong> Aucune communication sur les dossiers, ni sur les personnes accompagnées.</li>
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Prise en charge complète.</strong> Bail, état des lieux, assurances, ouverture des contrats, écoles et services.</li>
          <li style="color:rgba(255,255,255,.72)"><strong style="color:#fff">Continuité.</strong> Le même interlocuteur au fil des mutations et des fins de contrat.</li>
        </ul>
        <div class="btn-row mt-4">
          <a class="btn btn--light" href="relocation.html"><span>Relocation et mobilité</span></a>
        </div>
      </div>
      <div data-reveal>
        <div class="stats stats--2 stats--dark">
          <div class="stat"><span class="stat__k">30 j</span><span class="stat__v">Délai visé entre la demande et la remise des clés</span></div>
          <div class="stat"><span class="stat__k">1</span><span class="stat__v">Interlocuteur unique pour le joueur et sa famille</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">06 — Après l’acquisition</p>
        <h2 class="display-md">Le bon professionnel, au bon moment.</h2>
        <p class="body-lg muted mt-3">
          Une acquisition ne s’arrête pas à la signature. Nous mettons nos clients en relation avec les
          professionnels qui prennent le relais, choisis pour leur sérieux et non pour une rétrocession.
        </p>
        <div class="marks mt-4">
          <span class="mark">Courtiers en crédit</span>
          <span class="mark">Gestionnaires locatifs</span>
          <span class="mark">Régies immobilières</span>
          <span class="mark">Assureurs</span>
          <span class="mark">Conseillers en gestion de patrimoine</span>
        </div>
      </div>
      <div data-reveal>
        <figure class="figure-frame">
          <img src="assets/img/interieur.svg" alt="Intérieur haussmannien : moulures, cheminée en marbre et parquet à bâtons rompus." width="1200" height="900" loading="lazy">
        </figure>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight section--alt">
  <div class="shell shell--narrow tac" data-reveal>
    <p class="quote">« Un bien ne vaut rien en soi. Il vaut par rapport à un projet, à une fiscalité et à un horizon. »</p>
    <p class="mt-3" style="font-family:var(--font-sans);font-size:.6875rem;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted)">Fabrice Ekissi — ALLCX Patrimoine</p>
  </div>
</section>

""" + B.cta_block(
        "patrimoine",
        "Parlons de votre projet avant de parler de biens.",
        "Décrivez votre objectif, votre budget et votre échéance. Nous vous dirons ce qui est atteignable, "
        "ce qui ne l’est pas, et par quoi commencer.",
        ("contact.html", "Nous écrire"),
        ("honoraires.html", "Consulter les honoraires"),
    )

    return [(
        "index.html",
        "ALLCX Patrimoine — Transactions sur immeubles et fonds de commerce",
        "Conseil en investissement immobilier, acquisition de résidence, fonds de commerce et relocation. "
        "Activité réglementée exercée sous carte professionnelle. France entière.",
        accueil,
    )]
