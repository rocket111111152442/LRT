# -*- coding: utf-8 -*-
"""Pages intérieures ALLCX Patrimoine."""


def pages(B):
    A, TODO = B.ARROW, B.TODO
    P = []

    # =======================================================================
    # INVESTISSEMENT
    # =======================================================================
    invest = B.pagehead(
        "Investissement",
        "Investir dans un bien qui correspond à votre fiscalité.",
        "Immobilier locatif et fonds de commerce : sélection, analyse du rendement, négociation et suivi "
        "jusqu’à l’acte authentique.",
        crumbs=["Investissement"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="index-num">01</p>
        <h2 class="display-md mt-2">Immobilier locatif</h2>
        <p class="body-lg muted mt-3">
          Le rendement affiché sur une annonce ne veut rien dire tant qu’on n’a pas retiré les charges de
          copropriété, la taxe foncière, la vacance, les travaux à venir et l’impôt. Nous raisonnons en
          rendement net, après fiscalité, sur la durée de détention que vous envisagez.
        </p>
        <p class="body-lg muted mt-2">
          Le régime applicable — location nue au réel ou au micro-foncier, location meublée, société — change
          radicalement le résultat. Nous cadrons ce point avec vous, et le faisons valider par votre conseil
          fiscal ou par l’un de nos partenaires, avant de lancer la recherche.
        </p>
        <h3 class="display-sm mt-6">Ce que nous instruisons sur chaque bien</h3>
        <ul class="list-check mt-3">
          <li><strong>Marché locatif réel.</strong> Loyers constatés, délai de relocation, profil des locataires du secteur.</li>
          <li><strong>Charges et copropriété.</strong> Procès-verbaux d’assemblée, travaux votés, appels de fonds à venir, impayés.</li>
          <li><strong>État technique.</strong> Diagnostics, performance énergétique et conséquences des obligations de rénovation.</li>
          <li><strong>Rendement net.</strong> Après charges, fiscalité et provision pour vacance et travaux.</li>
          <li><strong>Revente.</strong> Liquidité du bien et de son secteur à l’horizon envisagé.</li>
        </ul>
      </div>
      <div data-reveal>
        <figure class="figure-frame">
          <img src="../assets/img/haussmann.svg" alt="Immeuble haussmannien de centre-ville." width="1200" height="900" loading="lazy">
          <figcaption>Immeuble de rapport — illustration</figcaption>
        </figure>
        <div class="card mt-3">
          <p class="index-num">Rappel</p>
          <p>Un investissement immobilier comporte des risques : vacance locative, impayés, évolution du
          marché, travaux imprévus. Aucun rendement n’est garanti. Les simulations remises sont des
          hypothèses de travail, non des engagements.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt" id="fonds">
  <div class="shell">
    <div class="split split--wide-right split--top">
      <div data-reveal>
        <figure class="figure-frame">
          <img src="../assets/img/hotel.svg" alt="Façade d’un hôtel avec marquise." width="1200" height="900" loading="lazy">
          <figcaption>Hôtellerie — illustration</figcaption>
        </figure>
      </div>
      <div data-reveal>
        <p class="index-num">02</p>
        <h2 class="display-md mt-2">Fonds de commerce et murs commerciaux</h2>
        <p class="body-lg muted mt-3">
          Acquérir un fonds de commerce, c’est acheter une exploitation : un chiffre d’affaires, une
          clientèle, un bail, du personnel et des engagements. La valeur se lit dans les comptes et dans le
          bail, rarement dans le prix demandé.
        </p>
        <p class="body-lg muted mt-2">
          Le cabinet est intervenu, pour le compte d’un client, dans la négociation du rachat d’un hôtel
          pour un montant de 2,1 millions d’euros. Ce type d’opération mobilise, en plus de la recherche,
          une coordination étroite avec l’expert-comptable, l’avocat et le financeur.
        </p>
        <h3 class="display-sm mt-6">Points examinés</h3>
        <ul class="list-check mt-3">
          <li><strong>Comptes d’exploitation.</strong> Trois derniers exercices, saisonnalité, retraitements du dirigeant.</li>
          <li><strong>Bail commercial.</strong> Durée restante, loyer, destination, clauses de renouvellement et travaux à la charge du preneur.</li>
          <li><strong>Personnel.</strong> Contrats repris, ancienneté, masse salariale et conventions applicables.</li>
          <li><strong>Autorisations et conformité.</strong> Licences, accessibilité, sécurité, obligations sectorielles.</li>
          <li><strong>Structure de l’opération.</strong> Fonds seul, murs seuls, ou murs et fonds : chaque montage a un effet fiscal distinct.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head" data-reveal>
      <div>
        <p class="eyebrow">Déroulé</p>
        <h2 class="display-lg">Comment se conduit un dossier d’investissement.</h2>
      </div>
    </div>
    <div class="steps" data-reveal-group>
      <div class="step" data-reveal><h3>Entretien patrimonial</h3><p>Objectif, capacité d’emprunt, régime fiscal, horizon, tolérance au risque et contraintes de gestion. Restitution écrite du cadre retenu.</p></div>
      <div class="step" data-reveal><h3>Recherche ciblée</h3><p>Mandats disponibles, réseau professionnel, opportunités non diffusées. Présélection restreinte, chaque dossier étant instruit avant présentation.</p></div>
      <div class="step" data-reveal><h3>Analyse et visites</h3><p>Visites accompagnées, vérifications documentaires, chiffrage des travaux, calcul du rendement net et simulation fiscale.</p></div>
      <div class="step" data-reveal><h3>Négociation et closing</h3><p>Stratégie d’offre, négociation du prix et des conditions suspensives, coordination courtier et notaire, suivi jusqu’à l’acte authentique.</p></div>
    </div>
  </div>
</section>

<section class="section section--alt section--tight">
  <div class="shell shell--narrow">
    <p class="eyebrow" data-reveal>Questions fréquentes</p>
    """ + B.accordion([
        ("Intervenez-vous partout en France ?",
         "Oui. La recherche locative et l’acquisition de fonds de commerce se conduisent sur l’ensemble du "
         "territoire, en mobilisant selon les secteurs notre réseau de confrères et de professionnels locaux."),
        ("Travaillez-vous pour l’acheteur ou pour le vendeur ?",
         "Les deux configurations existent et sont clairement annoncées au début du dossier. Lorsque nous "
         "accompagnons un acquéreur, notre rémunération et notre mandat sont définis avec lui, et la "
         "situation est portée à la connaissance de la partie adverse."),
        ("Donnez-vous des conseils fiscaux ?",
         "Nous cadrons les enjeux fiscaux d’un projet et en tirons les conséquences sur le type de bien à "
         "rechercher. Le conseil fiscal proprement dit relève de votre expert-comptable, de votre avocat ou "
         "d’un conseiller en gestion de patrimoine, que nous pouvons vous présenter."),
        ("Quel budget minimum ?",
         "Il n’y a pas de seuil affiché : un studio bien situé peut constituer un meilleur premier "
         "investissement qu’un immeuble mal placé. Le budget est discuté lors de l’entretien patrimonial, "
         "au regard de votre capacité d’emprunt réelle."),
        ("Comment êtes-vous rémunéré ?",
         "Par des honoraires de transaction, dont le barème est affiché sur la page Honoraires. Ils sont dus "
         "uniquement en cas de réalisation effective de l’opération, sauf mandat de recherche prévoyant "
         "expressément d’autres modalités."),
    ], "faq-inv") + """
  </div>
</section>

""" + B.cta_block(
        "patrimoine",
        "Un projet d’investissement à instruire ?",
        "Indiquez votre objectif, votre budget et votre horizon. Le premier entretien sert à vérifier que "
        "le projet tient, avant d’engager la moindre recherche.",
        ("contact.html", "Décrire mon projet"),
        ("honoraires.html", "Barème d’honoraires"),
    )

    P.append((
        "investissement.html",
        "Investissement immobilier et fonds de commerce | ALLCX Patrimoine",
        "Accompagnement à l’investissement locatif et à l’acquisition de fonds de commerce : analyse du "
        "rendement net, régime fiscal, négociation et suivi jusqu’à l’acte authentique.",
        invest,
    ))

    # =======================================================================
    # ACQUISITION
    # =======================================================================
    acq = B.pagehead(
        "Acquisition",
        "Résidence principale, secondaire et immobilier de prestige.",
        "Un accompagnement à l’achat, du cadrage du projet à la remise des clés, y compris sur les biens "
        "qui ne sont jamais diffusés publiquement.",
        crumbs=["Acquisition"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">Le principe</p>
        <h2 class="display-md">Chercher moins de biens, mais les bons.</h2>
        <p class="body-lg muted mt-3">
          La difficulté d’un achat n’est plus de trouver des annonces : elles sont accessibles à tous. Elle
          est de savoir lesquelles méritent une visite, de se positionner vite quand un bien rare sort, et
          de négocier sans faire échouer le dossier.
        </p>
        <p class="body-lg muted mt-2">
          Nous prenons en charge la recherche, la sélection, l’organisation des visites, la vérification des
          éléments déterminants et la négociation. Le client se déplace pour les biens qui le méritent, pas
          pour les autres.
        </p>
        <h3 class="display-sm mt-6">Le dossier remis avant chaque visite</h3>
        <ul class="list-check mt-3">
          <li><strong>Situation réelle du bien.</strong> Environnement, nuisances, exposition, projets d’urbanisme connus.</li>
          <li><strong>Copropriété.</strong> Charges, travaux votés, santé financière du syndicat.</li>
          <li><strong>Technique.</strong> Diagnostics, performance énergétique, travaux à prévoir et ordre de grandeur du coût.</li>
          <li><strong>Prix.</strong> Comparables récents du secteur et marge de négociation estimée.</li>
        </ul>
      </div>
      <div data-reveal>
        <figure class="figure-frame">
          <img src="../assets/img/villa.svg" alt="Villa contemporaine avec piscine." width="1200" height="900" loading="lazy">
          <figcaption>Villa contemporaine — illustration</figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">Immobilier de prestige</p>
        <h2 class="display-lg">Les biens rares se traitent autrement.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Sur ce segment, une part significative des transactions se conclut sans publicité.
        L’accès passe par le réseau, et la discrétion fait partie du service.</p>
      </div>
    </div>
    <div class="grid grid-3" data-reveal-group>
      <div class="card" data-reveal><p class="index-num">01</p><h3 class="display-sm">Réseau de partenaires</h3><p>Nous travaillons avec des maisons spécialisées dans l’immobilier de luxe pour accéder aux biens présentés de manière confidentielle.</p></div>
      <div class="card" data-reveal><p class="index-num">02</p><h3 class="display-sm">Confidentialité</h3><p>Aucune information sur l’identité de l’acquéreur, ni sur le dossier, n’est communiquée sans accord écrit préalable.</p></div>
      <div class="card" data-reveal><p class="index-num">03</p><h3 class="display-sm">Coordination</h3><p>Notaire, courtier, architecte, maître d’œuvre : nous assurons la liaison entre les intervenants jusqu’à la signature.</p></div>
    </div>
  </div>
</section>

<section class="section" id="partenaires">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">Après la signature</p>
        <h2 class="display-md">Mise en relation avec les professionnels du patrimoine.</h2>
        <p class="body-lg muted mt-3">
          Un bien acquis doit être financé, assuré, parfois géré, et s’inscrire dans une stratégie
          patrimoniale plus large. Nous présentons à nos clients les professionnels adaptés à leur
          situation, en toute transparence sur la nature de la relation qui nous lie à eux.
        </p>
        <ul class="list-check mt-4">
          <li><strong>Courtiers en crédit.</strong> Montage du financement, négociation du taux et de l’assurance emprunteur.</li>
          <li><strong>Gestionnaires locatifs et régies.</strong> Mise en location, quittancement, gestion technique et contentieux.</li>
          <li><strong>Assureurs.</strong> Propriétaire non occupant, garantie loyers impayés, multirisque habitation.</li>
          <li><strong>Conseillers en gestion de patrimoine.</strong> Arbitrages, structuration, transmission.</li>
        </ul>
      </div>
      <div data-reveal>
        <div class="card card--dark">
          <p class="index-num">Transparence</p>
          <p>Lorsqu’une mise en relation donne lieu à une rémunération de notre part, le client en est
          informé avant toute présentation. Aucun partenaire n’est recommandé sur ce seul critère.</p>
        </div>
        <figure class="figure-frame mt-3">
          <img src="../assets/img/interieur.svg" alt="Intérieur haussmannien avec cheminée et parquet." width="1200" height="900" loading="lazy">
          <figcaption>Résidence principale — illustration</figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>

""" + B.cta_block(
        "patrimoine",
        "Une acquisition à préparer ?",
        "Dites-nous ce que vous cherchez, où, et dans quel délai. Nous vous répondons franchement sur la "
        "faisabilité avant d’engager quoi que ce soit.",
        ("contact.html", "Prendre contact"),
    )

    P.append((
        "acquisition.html",
        "Acquisition de résidence et immobilier de prestige | ALLCX Patrimoine",
        "Accompagnement à l’achat de résidence principale ou secondaire, y compris sur le segment de "
        "l’immobilier de prestige, et mise en relation avec les professionnels du patrimoine.",
        acq,
    ))

    # =======================================================================
    # RELOCATION
    # =======================================================================
    reloc = B.pagehead(
        "Relocation",
        "Installer une personne en mobilité, sans lui faire perdre de temps.",
        "Recherche de logement, constitution du dossier et prise en charge des démarches pour les salariés "
        "en mutation et les sportifs de haut niveau.",
        crumbs=["Relocation"],
        dark=True,
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">Le service</p>
        <h2 class="display-md">Une arrivée se prépare en amont, pas le jour J.</h2>
        <p class="body-lg muted mt-3">
          Une mobilité professionnelle se joue sur quelques semaines : il faut trouver un logement conforme
          aux attentes, monter un dossier acceptable pour le bailleur, signer, assurer, raccorder, et
          souvent scolariser des enfants — le tout à distance.
        </p>
        <p class="body-lg muted mt-2">
          Le cabinet prend en charge l’ensemble de la chaîne et regroupe les visites sur une à deux
          journées, afin que la personne concernée ne se déplace qu’une fois.
        </p>
        <h3 class="display-sm mt-6">Prestations</h3>
        <ul class="list-check mt-3">
          <li><strong>Cahier des charges.</strong> Secteur, budget, surface, meublé ou non, contraintes familiales et professionnelles.</li>
          <li><strong>Présélection et visites.</strong> Sélection restreinte, visites groupées, visites vidéo si la personne est à l’étranger.</li>
          <li><strong>Dossier locatif.</strong> Constitution, présentation au bailleur, négociation des conditions.</li>
          <li><strong>Bail et état des lieux.</strong> Relecture, signature, état des lieux d’entrée.</li>
          <li><strong>Installation.</strong> Assurances, énergie, internet, orientation vers les écoles et services du secteur.</li>
          <li><strong>Sortie.</strong> Préavis, état des lieux de sortie, restitution du dépôt de garantie.</li>
        </ul>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Pour qui</p>
          <ul class="list-check mt-2">
            <li>Sportifs professionnels et leur famille</li>
            <li>Salariés en mutation, en France ou depuis l’étranger</li>
            <li>Cadres expatriés et impatriés</li>
            <li>Entreprises et clubs organisant l’accueil de leurs recrues</li>
          </ul>
        </div>
        <div class="card mt-3">
          <p class="index-num">Repères</p>
          <ul class="list-rule mt-2">
            <li><span class="k">Depuis</span><span class="v">2021</span></li>
            <li><span class="k">Sportifs accompagnés</span><span class="v">15</span></li>
            <li><span class="k">Délai visé</span><span class="v">10 jours</span></li>
            <li><span class="k">Zone</span><span class="v">France entière</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">Sportifs de haut niveau</p>
        <h2 class="display-lg">Une pratique construite avec le monde du football professionnel.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Depuis 2021, dans le cadre d’un partenariat avec l’AS Saint-Étienne, le cabinet a
        accompagné une quinzaine de joueurs professionnels dans leur installation.</p>
      </div>
    </div>
    <div class="grid grid-4" data-reveal-group>
      <div class="card" data-reveal><p class="index-num">01</p><h3 class="display-sm">Réactivité</h3><p>La recherche démarre dès l’accord de principe, souvent avant l’officialisation du transfert.</p></div>
      <div class="card" data-reveal><p class="index-num">02</p><h3 class="display-sm">Discrétion</h3><p>Aucun nom, aucune adresse, aucune photographie n’est diffusée. Les visites sont organisées en conséquence.</p></div>
      <div class="card" data-reveal><p class="index-num">03</p><h3 class="display-sm">Famille</h3><p>Conjoint, enfants, scolarisation, activités : l’installation réussit quand toute la famille s’installe.</p></div>
      <div class="card" data-reveal><p class="index-num">04</p><h3 class="display-sm">Suite de carrière</h3><p>Quand la question se pose, nous accompagnons la constitution d’un patrimoine immobilier durable.</p></div>
    </div>
    <p class="muted mt-6" style="font-size:.8125rem" data-reveal>
      Les prestations de relocation portant sur la location de logements relèvent de l’entremise
      immobilière et sont exercées dans le cadre de la carte professionnelle mentionnée en pied de page.
    </p>
  </div>
</section>

""" + B.cta_block(
        "patrimoine",
        "Une arrivée à organiser ?",
        "Club, entreprise ou particulier : indiquez la date d’arrivée, le secteur et la composition du "
        "foyer. Nous revenons vers vous avec un calendrier réaliste.",
        ("contact.html", "Organiser une arrivée"),
    )

    P.append((
        "relocation.html",
        "Relocation et mobilité — sportifs et salariés | ALLCX Patrimoine",
        "Service de relocation : recherche de logement, dossier locatif, bail, état des lieux et "
        "installation pour les personnes en mobilité, dont les sportifs de haut niveau. Depuis 2021.",
        reloc,
    ))

    P += _more(B)
    return P


def _more(B):
    A, TODO = B.ARROW, B.TODO
    P = []

    # =======================================================================
    # LES BIENS
    # =======================================================================
    def estate(tag, img, alt, title, text, meta):
        cells = "".join(f"<span>{m}</span>" for m in meta)
        return f"""<article class="estate" data-reveal>
        <div class="estate__media">
          <span class="estate__tag">{tag}</span>
          <img src="../assets/img/{img}" alt="{alt}" width="1200" height="900" loading="lazy">
        </div>
        <div class="estate__body">
          <h3>{title}</h3>
          <p>{text}</p>
          <div class="estate__meta">{cells}</div>
        </div>
      </article>"""

    biens = B.pagehead(
        "Les biens",
        "Les typologies que nous traitons.",
        "Cette page présente les catégories de biens sur lesquelles le cabinet intervient. Les biens "
        "effectivement disponibles sont communiqués sur demande, au cas par cas.",
        crumbs=["Les biens"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="grid grid-3" data-reveal-group>
      """ + estate(
        "Immeuble de rapport", "haussmann.svg",
        "Façade d’immeuble haussmannien en pierre de taille.",
        "Haussmannien de centre-ville",
        "Appartements de rapport et lots à diviser, dans les secteurs où la demande locative reste soutenue "
        "toute l’année. Attention particulière aux charges de copropriété et aux travaux votés.",
        ["Locatif", "Centre-ville", "France entière"],
    ) + estate(
        "Résidence", "villa.svg",
        "Villa contemporaine avec piscine et terrasse.",
        "Villa et maison d’exception",
        "Résidence principale ou secondaire, en direct ou par l’intermédiaire de nos partenaires spécialisés "
        "dans l’immobilier de prestige. Accès à des biens présentés de manière confidentielle.",
        ["Acquisition", "Prestige", "Sur dossier"],
    ) + estate(
        "Fonds de commerce", "hotel.svg",
        "Façade d’un hôtel avec marquise et stores.",
        "Hôtellerie et actifs d’exploitation",
        "Reprise d’exploitation, murs seuls ou murs et fonds. Analyse du compte d’exploitation, du bail "
        "commercial et des engagements repris avant toute offre.",
        ["Investissement", "Exploitation", "Négociation"],
    ) + estate(
        "Commerce", "commerce.svg",
        "Local commercial en pied d’immeuble avec vitrine et store banne.",
        "Local et murs commerciaux",
        "Pieds d’immeuble, commerces de détail et locaux de services. Emplacement, flux de passage, "
        "destination du bail et loyer de marché constituent l’essentiel de l’analyse.",
        ["Murs", "Bail commercial", "Rendement"],
    ) + estate(
        "Résidence principale", "interieur.svg",
        "Intérieur haussmannien avec moulures, cheminée et parquet à bâtons rompus.",
        "Appartement de caractère",
        "Biens anciens à réhabiliter ou déjà rénovés. Chiffrage des travaux, contraintes de copropriété et "
        "performance énergétique instruits avant l’offre.",
        ["Acquisition", "Ancien", "Travaux"],
    ) + estate(
        "Mobilité", "residence.svg",
        "Résidence contemporaine avec balcons, illustration du parc destiné à la location.",
        "Location pour personnes en mobilité",
        "Maisons et appartements destinés à la location meublée ou nue pour des séjours professionnels, "
        "avec constitution du dossier locatif et suivi jusqu’à la remise des clés.",
        ["Relocation", "Meublé ou nu", "Court délai"],
    ) + """
    </div>
    <div class="card mt-6" data-reveal>
      <p class="index-num">Précision importante</p>
      <p>Les visuels de cette page sont des illustrations réalisées pour le site. Ils ne représentent pas des
      biens réellement proposés à la vente ou à la location et ne constituent en aucun cas une offre.
      Les biens disponibles, leurs caractéristiques et leurs prix sont communiqués individuellement,
      après entretien.</p>
    </div>
  </div>
</section>

""" + B.cta_block(
        "patrimoine",
        "Vous cherchez un bien précis ?",
        "Décrivez la typologie recherchée, le secteur et le budget. Si nous n’avons rien de pertinent, "
        "nous vous le dirons plutôt que de vous faire visiter pour visiter.",
        ("contact.html", "Décrire ma recherche"),
    )

    P.append((
        "biens.html",
        "Typologies de biens accompagnés | ALLCX Patrimoine",
        "Immeubles de rapport, villas, hôtels, murs commerciaux et appartements de caractère : les "
        "typologies de biens sur lesquelles intervient ALLCX Patrimoine.",
        biens,
    ))

    # =======================================================================
    # HONORAIRES
    # =======================================================================
    honoraires = B.pagehead(
        "Honoraires",
        "Barème d’honoraires.",
        "Affichage prévu par l’arrêté du 10 janvier 2017 relatif à l’information des consommateurs par les "
        "professionnels intervenant dans une transaction immobilière.",
        crumbs=["Honoraires"],
    ) + """
<section class="section">
  <div class="shell shell--narrow">
    <div class="card" data-reveal>
      <p class="index-num">À compléter avant mise en ligne</p>
      <p>Les montants ci-dessous doivent être renseignés par le titulaire de la carte professionnelle avant
      la publication du site. L’affichage d’un barème complet, en euros toutes taxes comprises, est
      obligatoire et contrôlé.</p>
    </div>

    <h2 class="display-md mt-6" data-reveal>Transaction — vente</h2>
    <ul class="list-rule mt-3" data-reveal>
      <li><span class="k">Tranche de prix jusqu’à 100 000 €</span><span class="v">""" + TODO + """ € TTC</span></li>
      <li><span class="k">De 100 001 € à 300 000 €</span><span class="v">""" + TODO + """ % TTC</span></li>
      <li><span class="k">De 300 001 € à 600 000 €</span><span class="v">""" + TODO + """ % TTC</span></li>
      <li><span class="k">Au-delà de 600 000 €</span><span class="v">""" + TODO + """ % TTC</span></li>
      <li><span class="k">Honoraires à la charge de</span><span class="v">""" + TODO + """</span></li>
    </ul>

    <h2 class="display-md mt-6" data-reveal>Fonds de commerce et murs commerciaux</h2>
    <ul class="list-rule mt-3" data-reveal>
      <li><span class="k">Cession de fonds de commerce</span><span class="v">""" + TODO + """ % TTC</span></li>
      <li><span class="k">Cession de murs commerciaux</span><span class="v">""" + TODO + """ % TTC</span></li>
      <li><span class="k">Honoraires minimum</span><span class="v">""" + TODO + """ € TTC</span></li>
    </ul>

    <h2 class="display-md mt-6" data-reveal>Location et relocation</h2>
    <ul class="list-rule mt-3" data-reveal>
      <li><span class="k">Visite, constitution du dossier et rédaction du bail (locataire)</span><span class="v">""" + TODO + """ € TTC / m² de surface habitable</span></li>
      <li><span class="k">État des lieux (locataire)</span><span class="v">""" + TODO + """ € TTC / m² de surface habitable</span></li>
      <li><span class="k">Entremise et négociation (bailleur)</span><span class="v">""" + TODO + """ € TTC</span></li>
      <li><span class="k">Accompagnement à l’installation (prestation distincte)</span><span class="v">""" + TODO + """ € TTC</span></li>
    </ul>

    <h2 class="display-md mt-6" data-reveal>Recherche pour le compte de l’acquéreur</h2>
    <ul class="list-rule mt-3" data-reveal>
      <li><span class="k">Mandat de recherche</span><span class="v">""" + TODO + """ % TTC du prix d’acquisition</span></li>
      <li><span class="k">Honoraires minimum</span><span class="v">""" + TODO + """ € TTC</span></li>
    </ul>

    <div class="prose mt-6" data-reveal>
      <h2>Précisions</h2>
      <ul>
        <li>Les montants indiqués s’entendent toutes taxes comprises, TVA au taux en vigueur (20 %).</li>
        <li>Les honoraires de transaction ne sont dus qu’en cas de réalisation effective de l’opération,
        constatée par la signature de l’acte authentique.</li>
        <li>Les honoraires de location sont plafonnés par la réglementation dans les zones concernées ;
        la part supportée par le locataire ne peut excéder celle supportée par le bailleur.</li>
        <li>Aucun autre frais n’est facturé au client en dehors des montants figurant au présent barème.</li>
        <li>Le barème applicable est celui en vigueur à la date de signature du mandat.</li>
      </ul>
      <p>Date d’entrée en vigueur du présent barème : """ + TODO + """.</p>
    </div>
  </div>
</section>"""

    P.append((
        "honoraires.html",
        "Barème d’honoraires | ALLCX Patrimoine",
        "Barème d’honoraires d’ALLCX Patrimoine : transaction, fonds de commerce, location et mandat de "
        "recherche. Affichage prévu par l’arrêté du 10 janvier 2017.",
        honoraires,
    ))

    # =======================================================================
    # CONTACT
    # =======================================================================
    contact = B.pagehead(
        "Contact",
        "Parlons de votre projet.",
        "Acquisition, investissement, cession de fonds de commerce ou installation : décrivez votre "
        "situation, nous revenons vers vous sous 48 heures ouvrées.",
        crumbs=["Contact"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        """ + B.contact_form(
        "patrimoine",
        "Demande — ALLCX Patrimoine",
        ["Investissement locatif",
         "Fonds de commerce ou murs commerciaux",
         "Résidence principale ou secondaire",
         "Relocation / mobilité",
         "Mise en relation avec un partenaire",
         "Autre demande"],
    ) + """
      </div>
      <div data-reveal>
        <div class="contact-aside">
          <h2 class="display-sm">Coordonnées</h2>
          <dl class="mt-3">
            <div><dt>Courriel</dt><dd><a href="mailto:""" + B.PATRIMOINE_MAIL + """">""" + B.PATRIMOINE_MAIL + """</a></dd></div>
            <div><dt>Téléphone</dt><dd>""" + TODO + """</dd></div>
            <div><dt>Adresse</dt><dd>""" + TODO + """<br>France</dd></div>
            <div><dt>Carte professionnelle</dt><dd>""" + B.CARTE_T + """</dd></div>
            <div><dt>Délai de réponse</dt><dd>48 heures ouvrées</dd></div>
          </dl>
        </div>
        <div class="card mt-3">
          <p class="index-num">Pour aller plus vite</p>
          <ul class="list-check mt-2">
            <li>Le secteur géographique visé</li>
            <li>Le budget et le mode de financement envisagé</li>
            <li>L’usage prévu : résidence, location, exploitation</li>
            <li>L’échéance souhaitée</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt section--tight">
  <div class="shell shell--narrow">
    <p class="eyebrow" data-reveal>Avant de nous écrire</p>
    """ + B.accordion([
        ("Le premier entretien est-il facturé ?",
         "Non. L’entretien de cadrage permet de comprendre votre projet et de vérifier que nous sommes en "
         "mesure de vous accompagner utilement. Aucun honoraire n’est dû à ce stade."),
        ("Quand les honoraires sont-ils dus ?",
         "En transaction, uniquement en cas de réalisation effective de l’opération, constatée par la "
         "signature de l’acte authentique. Le barème complet figure sur la page Honoraires."),
        ("Proposez-vous des biens en portefeuille ?",
         "Oui, mais ils ne sont pas publiés sur ce site. Les biens disponibles sont présentés individuellement "
         "après entretien, en fonction du projet et du budget."),
        ("Que deviennent les informations transmises ?",
         "Elles servent uniquement au traitement de votre demande, ne sont ni cédées ni revendues, et sont "
         "conservées le temps nécessaire à la relation. Vous pouvez en demander la suppression à tout moment."),
    ], "faq-contact-p") + """
  </div>
</section>"""

    P.append((
        "contact.html",
        "Contact | ALLCX Patrimoine",
        "Contacter ALLCX Patrimoine : investissement locatif, fonds de commerce, acquisition de résidence "
        "et relocation. Réponse sous 48 heures ouvrées.",
        contact,
    ))

    P.append(B.legal_page("patrimoine"))

    return P
