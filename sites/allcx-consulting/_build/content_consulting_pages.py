# -*- coding: utf-8 -*-
"""Pages intérieures ALLCX Consulting."""

import diagram


def pages(B):
    A, TODO = B.ARROW, B.TODO
    P = []

    # =======================================================================
    # EXPERTISES
    # =======================================================================
    expertises = B.pagehead(
        "Expertises",
        "Trois façons de faire avancer votre développement commercial.",
        "Conseil, formation, apport d’affaires. Chaque intervention part d’un objectif chiffré et se termine "
        "par un dispositif que vos équipes savent faire tourner sans nous.",
        crumbs=["Expertises"],
    ) + """
<section class="section" id="conseil">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="index-num">01</p>
        <h2 class="display-md mt-2">Conseil en management et développement commercial</h2>
        <p class="body-lg muted mt-3">
          L’intervention porte sur ce qui produit du chiffre d’affaires : à qui l’on s’adresse, avec quel
          discours, à quel rythme et avec quels moyens de contrôle. Nous partons des faits — portefeuille
          réel, taux de transformation, cycle de vente observé — plutôt que des intentions.
        </p>
        <p class="body-lg muted mt-2">
          Le cabinet accompagne aussi bien la structuration d’une activité qui décolle que la reprise en
          main d’un portefeuille qui s’érode, et le lancement d’une offre sur un marché où l’entreprise
          n’a pas encore de références.
        </p>
        <h3 class="display-sm mt-6">Ce que nous traitons</h3>
        <ul class="list-check mt-3">
          <li><strong>Segmentation et ciblage.</strong> Identification des segments réellement accessibles et abandon assumé des autres.</li>
          <li><strong>Offre et tarification.</strong> Clarification de ce que l’on vend, du périmètre inclus et du niveau de prix défendable.</li>
          <li><strong>Discours commercial.</strong> Argumentaire, preuves, réponses aux objections récurrentes, supports de rendez-vous.</li>
          <li><strong>Organisation de la prospection.</strong> Canaux, cadence, répartition des comptes, rituels d’équipe.</li>
          <li><strong>Pilotage.</strong> Trois à cinq indicateurs suivis chaque semaine, plutôt qu’un tableau de bord que personne n’ouvre.</li>
          <li><strong>Structuration de l’équipe.</strong> Rôles, profils à recruter, montée en compétence, rémunération variable.</li>
        </ul>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Pour qui</p>
          <ul class="list-check mt-2">
            <li>TPE et PME sans direction commerciale constituée</li>
            <li>Entreprises lançant une offre ou une filiale</li>
            <li>Directions commerciales en réorganisation</li>
            <li>Porteurs de projets en phase d’amorçage</li>
          </ul>
        </div>
        <div class="card mt-3">
          <p class="index-num">Livrables types</p>
          <ul class="list-check mt-2">
            <li>Note de diagnostic commercial</li>
            <li>Plan d’action daté, avec responsables</li>
            <li>Argumentaire et guide d’entretien</li>
            <li>Plan de comptes et fichier de suivi</li>
            <li>Tableau d’indicateurs hebdomadaire</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt" id="formation">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="index-num">02</p>
        <h2 class="display-md mt-2">Coaching et formation commerciale</h2>
        <p class="body-lg muted mt-3">
          Former, chez ALLCX, consiste à travailler sur les situations que vos équipes rencontrent
          réellement : un rendez-vous qui n’aboutit pas, une objection prix qui revient, un portefeuille
          qui ne se renouvelle plus. Les sessions alternent apports, mises en situation filmées ou non,
          et travail sur les dossiers en cours.
        </p>
        <p class="body-lg muted mt-2">
          Le cabinet intervient auprès de conseillers clientèle — banque, assurance, immobilier,
          télécommunications — ainsi qu’auprès d’étudiants en BTS Management Commercial Opérationnel,
          en France comme à l’étranger.
        </p>
        <div class="btn-row mt-4">
          <a class="btn btn--ghost" href="formation.html"><span>Programmes et modalités</span></a>
        </div>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Formats</p>
          <ul class="list-check mt-2">
            <li>Session collective d’une demi-journée à trois jours</li>
            <li>Cycle court réparti sur plusieurs semaines</li>
            <li>Accompagnement individuel de managers</li>
            <li>Accompagnement en rendez-vous client</li>
          </ul>
        </div>
        <div class="card mt-3">
          <p class="index-num">Bon à savoir</p>
          <p>Les actions proposées relèvent de la formation professionnelle non réglementée. Elles ne
          délivrent ni titre ni certification inscrite au répertoire national.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="apport">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="index-num">03</p>
        <h2 class="display-md mt-2">Apport d’affaires et mise en relation</h2>
        <p class="body-lg muted mt-3">
          Certaines entreprises n’ont pas besoin d’un plan : elles ont besoin d’entrer en relation avec
          les bons interlocuteurs. Le cabinet mobilise son réseau pour ouvrir des comptes, présenter des
          partenaires et accompagner la relation jusqu’à la signature.
        </p>
        <p class="body-lg muted mt-2">
          Le cadre est écrit avant toute présentation : périmètre des cibles, durée d’exclusivité,
          définition de l’affaire apportée et modalités de rémunération. Aucune mise en relation n’est
          facturée si elle n’aboutit pas dans les conditions convenues.
        </p>
        <h3 class="display-sm mt-6">Déroulé</h3>
        <ul class="list-check mt-3">
          <li><strong>Qualification.</strong> Compréhension précise de l’offre, du client idéal et des critères d’exclusion.</li>
          <li><strong>Ciblage.</strong> Liste nominative de comptes et d’interlocuteurs, validée avec vous.</li>
          <li><strong>Introduction.</strong> Présentation qualifiée, préparation du rendez-vous, participation si utile.</li>
          <li><strong>Suivi.</strong> Relances, appui à la négociation, point d’avancement régulier.</li>
        </ul>
      </div>
      <div data-reveal>
        <div class="card card--dark">
          <p class="index-num">Cadre contractuel</p>
          <ul class="list-check mt-2">
            <li style="color:rgba(255,255,255,.72)">Convention d’apport d’affaires signée avant toute présentation</li>
            <li style="color:rgba(255,255,255,.72)">Cibles nominatives et durée d’exclusivité définies</li>
            <li style="color:rgba(255,255,255,.72)">Rémunération à la réussite, au forfait ou mixte</li>
            <li style="color:rgba(255,255,255,.72)">Confidentialité réciproque</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell shell--narrow">
    <div class="section-head" data-reveal>
      <div>
        <p class="eyebrow">Modalités</p>
        <h2 class="display-md">Questions fréquentes.</h2>
      </div>
    </div>
    """ + B.accordion([
        ("Comment sont fixés les honoraires ?",
         "Selon la mission : forfait pour un périmètre défini, taux journalier pour un accompagnement récurrent, "
         "ou rémunération à la réussite pour l’apport d’affaires. Le mode retenu et le montant figurent dans la "
         "proposition écrite remise avant le démarrage. Aucune facturation n’intervient avant accord signé."),
        ("Quelle est la durée d’une mission type ?",
         "Un diagnostic seul se conduit en trois à six semaines. Un accompagnement complet, diagnostic et "
         "déploiement compris, s’étale généralement sur trois à neuf mois. Les interventions ponctuelles de "
         "formation se traitent à la journée."),
        ("Intervenez-vous à distance ?",
         "Oui pour le cadrage, l’analyse et une partie du suivi. Le diagnostic et l’accompagnement en rendez-vous "
         "supposent en revanche une présence sur site, en France comme à l’international."),
        ("Travaillez-vous avec des entreprises déjà accompagnées par un autre cabinet ?",
         "Oui, à condition que les périmètres soient distincts et que la situation soit connue de tous. Nous "
         "refusons les missions qui reviendraient à défaire le travail d’un confrère sans que le client en ait "
         "mesuré les conséquences."),
        ("Signez-vous un accord de confidentialité ?",
         "Systématiquement si vous le demandez, et au plus tard au moment du cadrage. Les informations "
         "commerciales, financières et nominatives transmises restent la propriété de l’entreprise."),
    ], "faq-exp") + """
  </div>
</section>

""" + B.cta_block(
        "consulting",
        "Dites-nous ce que vous cherchez à débloquer.",
        "Un échange de trente minutes suffit généralement à déterminer si une intervention se justifie, "
        "et sous quelle forme.",
        ("contact.html", "Prendre contact"),
        ("afrique.html", "Projet en Afrique francophone"),
    )

    P.append((
        "expertises.html",
        "Expertises — Conseil, formation et apport d’affaires | ALLCX Consulting",
        "Conseil en management et développement commercial, formation des équipes de vente, apport d’affaires "
        "et mise en relation pour TPE et PME. Livrables, méthode et modalités d’intervention.",
        expertises,
    ))

    # =======================================================================
    # AFRIQUE FRANCOPHONE
    # =======================================================================
    afrique = B.pagehead(
        "Développement international",
        "Afrique francophone : préparer l’implantation avant de la financer.",
        "Étude de faisabilité commerciale, choix du mode d’entrée, constitution du réseau local et "
        "accompagnement des premiers rendez-vous. Pour les entreprises françaises comme pour les porteurs "
        "de projets issus de la diaspora.",
        crumbs=["Afrique francophone"],
        dark=True,
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">Le constat</p>
        <h2 class="display-md">La plupart des échecs se jouent avant le premier euro encaissé.</h2>
        <p class="body-lg muted mt-3">
          Les projets qui échouent en Afrique francophone butent rarement sur la qualité du produit. Ils
          butent sur un partenaire mal choisi, un prix calé sur le marché français, un circuit de décision
          mal compris ou un délai de paiement que la trésorerie ne supporte pas.
        </p>
        <p class="body-lg muted mt-2">
          Notre rôle est d’instruire ces points avant l’engagement de dépenses, puis d’accompagner
          l’entreprise sur place, avec des interlocuteurs identifiés et un calendrier réaliste.
        </p>
      </div>
      <div data-reveal>
        <div class="stats stats--2">
          <div class="stat"><span class="stat__k">1</span><span class="stat__v">Étude de faisabilité avant tout engagement structurel</span></div>
          <div class="stat"><span class="stat__k">2</span><span class="stat__v">Modes d’entrée comparés, chiffrés et datés</span></div>
          <div class="stat"><span class="stat__k">3</span><span class="stat__v">Niveaux de réseau : partenaires, prescripteurs, institutions</span></div>
          <div class="stat"><span class="stat__k">4</span><span class="stat__v">Étapes jusqu’aux premiers contrats signés</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="section-head section-head--split">
      <div data-reveal>
        <p class="eyebrow">Déroulé</p>
        <h2 class="display-lg">De l’intention au premier contrat.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Chaque étape se conclut par une décision explicite : continuer, ajuster ou renoncer.
        Renoncer tôt coûte infiniment moins cher que renoncer tard.</p>
      </div>
    </div>
    <div class="steps" data-reveal-group>
      <div class="step" data-reveal>
        <h3>Étude de faisabilité commerciale</h3>
        <p>Marché réellement adressable, concurrence locale et informelle, niveau de prix acceptable, canaux de distribution existants, contraintes réglementaires et douanières. Restitution écrite avec une recommandation tranchée.</p>
      </div>
      <div class="step" data-reveal>
        <h3>Choix du mode d’entrée</h3>
        <p>Distributeur, agent commercial, bureau de représentation, filiale, coentreprise : comparaison des options sur le coût d’entrée, le délai, le degré de contrôle et le risque supporté.</p>
      </div>
      <div class="step" data-reveal>
        <h3>Constitution du réseau</h3>
        <p>Identification et qualification des partenaires, prescripteurs et appuis institutionnels. Vérification des références, des capacités réelles et de la solidité des interlocuteurs pressentis.</p>
      </div>
      <div class="step" data-reveal>
        <h3>Premiers rendez-vous et suivi</h3>
        <p>Préparation des entretiens, accompagnement sur place, appui à la négociation, puis suivi à distance jusqu’à la signature et les premières livraisons.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="split split--wide-right split--top">
      <div data-reveal>
        <p class="eyebrow">Points de vigilance</p>
        <h2 class="display-md">Ce que nous instruisons systématiquement.</h2>
        <ul class="list-check mt-4">
          <li><strong>Sécurisation des paiements.</strong> Modalités, garanties, délais réels constatés dans le secteur.</li>
          <li><strong>Change et rapatriement.</strong> Zone monétaire, contraintes de transfert, effet sur la marge.</li>
          <li><strong>Fiscalité et formalités locales.</strong> Cadrage avec des professionnels du chiffre sur place.</li>
          <li><strong>Protection de la marque et de l’offre.</strong> Dépôt, contrats de distribution, clauses de non-concurrence.</li>
          <li><strong>Recrutement et encadrement.</strong> Profils disponibles, niveaux de rémunération, encadrement à distance.</li>
          <li><strong>Logistique et service après-vente.</strong> Acheminement, stock local, pièces, délais d’intervention.</li>
        </ul>
      </div>
      <div data-reveal>
        <p class="eyebrow">Marchés suivis</p>
        """ + diagram.network() + """
        <p class="muted mt-3" style="font-size:.8125rem">
          Marchés suivis en propre ou via le réseau de partenaires du cabinet. D’autres pays peuvent être
          couverts sur demande, après étude de faisabilité.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="split">
      <div data-reveal>
        <p class="eyebrow">Porteurs de projets</p>
        <h2 class="display-md">Explorer un marché avant de s’y engager.</h2>
        <p class="body-lg muted mt-3">
          Le cabinet accompagne également des porteurs de projets individuels — entrepreneurs, cadres en
          reconversion, membres de la diaspora — qui souhaitent tester une idée sur un marché africain
          francophone avant d’y investir leur épargne.
        </p>
        <p class="body-lg muted mt-2">
          Le format est volontairement court : cadrage de l’idée, vérification de la demande, estimation du
          budget d’amorçage et des délais, mise en relation avec les bons interlocuteurs sur place.
        </p>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Format exploration</p>
          <ul class="list-check mt-2">
            <li>Entretien de cadrage du projet</li>
            <li>Vérification de la demande sur un marché cible</li>
            <li>Estimation du budget d’amorçage et du calendrier</li>
            <li>Liste d’interlocuteurs qualifiés à rencontrer</li>
            <li>Note de synthèse et recommandation</li>
          </ul>
          <div class="card__foot"><a class="link link--reverse" href="contact.html">Demander le détail """ + A + """</a></div>
        </div>
      </div>
    </div>
  </div>
</section>

""" + B.cta_block(
        "consulting",
        "Un marché en tête ? Commençons par vérifier qu’il tient debout.",
        "Indiquez le pays visé, votre offre et l’échéance envisagée. Nous vous dirons franchement si le "
        "projet mérite une étude, et ce qu’elle représente en temps et en budget.",
        ("contact.html", "Décrire mon projet"),
    )

    P.append((
        "afrique.html",
        "Implantation en Afrique francophone | ALLCX Consulting",
        "Accompagnement à l’implantation commerciale en Afrique francophone : faisabilité, mode d’entrée, "
        "réseau local, premiers rendez-vous. Afrique de l’Ouest, Afrique centrale et Afrique du Nord.",
        afrique,
    ))

    P += _more(B)
    return P


def _more(B):
    A, TODO = B.ARROW, B.TODO
    P = []

    # =======================================================================
    # FORMATION
    # =======================================================================
    formation = B.pagehead(
        "Coaching et formation",
        "Former ceux qui vendent, à partir de ce qu’ils vivent.",
        "Formations commerciales pour salariés d’entreprise et étudiants, en France et à l’étranger. "
        "Contenus construits sur vos situations de vente réelles, pas sur un catalogue.",
        crumbs=["Formation"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">Principe</p>
        <h2 class="display-md">Une salle de formation n’a d’intérêt que si le lendemain change.</h2>
        <p class="body-lg muted mt-3">
          Nous préparons chaque session à partir de vos supports, de vos objections récurrentes et, quand
          c’est possible, de l’écoute d’entretiens réels. Les mises en situation portent sur vos dossiers
          en cours, pas sur des cas d’école.
        </p>
        <p class="body-lg muted mt-2">
          Chaque session se termine par un plan d’application individuel : trois actions à conduire dans
          les quinze jours, avec un point de contrôle prévu. Le manager reçoit une synthèse pour prolonger
          le travail en interne.
        </p>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Déroulé type d’une session</p>
          <ul class="list-check mt-2">
            <li>Cadrage préalable avec le responsable d’équipe</li>
            <li>Apports courts et outillés, alternés avec la pratique</li>
            <li>Mises en situation sur des cas réels de l’équipe</li>
            <li>Restitution collective et plan d’application individuel</li>
            <li>Point de suivi à quinze jours ou un mois</li>
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
        <p class="eyebrow">Publics</p>
        <h2 class="display-lg">Trois publics, trois pédagogies.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Le contenu ne change pas seulement de niveau : il change de nature selon
        l’expérience commerciale des participants.</p>
      </div>
    </div>
    <div class="grid grid-3" data-reveal-group>
      <div class="card" data-reveal>
        <p class="index-num">01</p>
        <h3 class="display-sm">Conseillers clientèle</h3>
        <p>Banque, assurance, immobilier, télécommunications, distribution spécialisée. Travail sur la
        découverte du besoin, le rebond commercial et la défense de la valeur.</p>
      </div>
      <div class="card" data-reveal>
        <p class="index-num">02</p>
        <h3 class="display-sm">Managers commerciaux</h3>
        <p>Animation d’équipe, entretiens individuels, accompagnement terrain, pilotage de l’activité et
        traitement des situations de sous-performance.</p>
      </div>
      <div class="card" data-reveal>
        <p class="index-num">03</p>
        <h3 class="display-sm">Étudiants</h3>
        <p>BTS Management Commercial Opérationnel, première et deuxième année, et filières commerciales.
        Préparation aux situations professionnelles et aux épreuves orales.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head" data-reveal>
      <div>
        <p class="eyebrow">Programmes</p>
        <h2 class="display-lg">Modules disponibles.</h2>
        <p class="lede mt-3">Chaque module dure d’une demi-journée à deux jours et se combine avec les
        autres pour former un cycle.</p>
      </div>
    </div>
    <div class="ledger" data-reveal-group>
      <div class="ledger__row" data-reveal><span class="ledger__num">01</span><h3 class="ledger__title">Prospection et prise de rendez-vous</h3><p class="ledger__desc">Ciblage, accroche, traitement des barrages, cadence de relance, gestion du fichier.</p><span class="muted" style="font-size:.8125rem">1 à 2 jours</span></div>
      <div class="ledger__row" data-reveal><span class="ledger__num">02</span><h3 class="ledger__title">Découverte et diagnostic du besoin</h3><p class="ledger__desc">Conduite de l’entretien, questionnement, reformulation, détection des enjeux non exprimés.</p><span class="muted" style="font-size:.8125rem">1 jour</span></div>
      <div class="ledger__row" data-reveal><span class="ledger__num">03</span><h3 class="ledger__title">Argumentation et objections</h3><p class="ledger__desc">Construction de l’argumentaire, preuves, traitement des objections prix, concurrence et délai.</p><span class="muted" style="font-size:.8125rem">1 jour</span></div>
      <div class="ledger__row" data-reveal><span class="ledger__num">04</span><h3 class="ledger__title">Négociation et conclusion</h3><p class="ledger__desc">Préparation, matrice de concessions, défense de la marge, techniques de conclusion, engagement.</p><span class="muted" style="font-size:.8125rem">1 à 2 jours</span></div>
      <div class="ledger__row" data-reveal><span class="ledger__num">05</span><h3 class="ledger__title">Fidélisation et développement du portefeuille</h3><p class="ledger__desc">Revue de portefeuille, rebond, recommandation, reconquête des comptes dormants.</p><span class="muted" style="font-size:.8125rem">1 jour</span></div>
      <div class="ledger__row" data-reveal><span class="ledger__num">06</span><h3 class="ledger__title">Manager une équipe commerciale</h3><p class="ledger__desc">Fixation d’objectifs, entretiens de suivi, accompagnement en clientèle, animation des rituels.</p><span class="muted" style="font-size:.8125rem">2 jours</span></div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Modalités pratiques</p>
        <h2 class="display-md">Conditions d’intervention.</h2>
        <ul class="list-rule mt-4">
          <li><span class="k">Effectif conseillé</span><span class="v">4 à 12 participants</span></li>
          <li><span class="k">Lieu</span><span class="v">Vos locaux, salle louée ou établissement</span></li>
          <li><span class="k">Zones</span><span class="v">France entière et international</span></li>
          <li><span class="k">Langue</span><span class="v">Français</span></li>
          <li><span class="k">Supports</span><span class="v">Remis aux participants</span></li>
          <li><span class="k">Suivi</span><span class="v">Point à 15 jours ou 1 mois</span></li>
        </ul>
      </div>
      <div data-reveal>
        <div class="card">
          <p class="index-num">Cadre réglementaire</p>
          <p>Les actions de formation proposées par ALLCX Consulting relèvent de la formation
          professionnelle non réglementée. Elles ne délivrent ni titre, ni diplôme, ni certification
          inscrite au répertoire national des certifications professionnelles.</p>
          <p class="mt-2">Numéro de déclaration d’activité de prestataire de formation : """ + TODO + """.
          Certification Qualiopi : """ + TODO + """. Ces mentions conditionnent l’accès à certains
          financements ; elles sont à renseigner avant toute mise en ligne définitive.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell shell--narrow">
    <p class="eyebrow" data-reveal>Questions fréquentes</p>
    """ + B.accordion([
        ("Pouvez-vous former une équipe déjà expérimentée ?",
         "Oui. Avec des équipes aguerries, la valeur ne vient pas des apports mais du travail sur les cas "
         "difficiles : comptes bloqués, négociations qui s’enlisent, clients historiques qui décrochent. "
         "Le format devient alors davantage un atelier qu’une formation."),
        ("Les formations sont-elles finançables ?",
         "Le financement par un opérateur de compétences suppose des références administratives précises "
         "(déclaration d’activité, certification qualité). Ces éléments sont indiqués sur cette page dès "
         "qu’ils sont disponibles ; contactez-nous pour connaître la situation à jour."),
        ("Intervenez-vous à l’étranger ?",
         "Oui, notamment en Afrique francophone. Les frais de déplacement et d’hébergement font l’objet "
         "d’une ligne distincte dans la proposition."),
        ("Peut-on combiner formation et accompagnement terrain ?",
         "C’est le format qui produit les meilleurs résultats : une session collective, puis des "
         "accompagnements individuels en rendez-vous client sur les semaines suivantes."),
    ], "faq-form") + """
  </div>
</section>

""" + B.cta_block(
        "consulting",
        "Parlons du niveau réel de votre équipe.",
        "Indiquez le nombre de participants, leur ancienneté et ce que vous cherchez à faire progresser. "
        "Nous vous proposons un programme adapté plutôt qu’un module standard.",
        ("contact.html", "Demander un programme"),
    )

    P.append((
        "formation.html",
        "Formation commerciale et coaching | ALLCX Consulting",
        "Formations commerciales sur mesure pour conseillers clientèle, managers et étudiants en BTS MCO. "
        "Prospection, découverte, négociation, management d’équipe. France et international.",
        formation,
    ))

    # =======================================================================
    # LE CABINET
    # =======================================================================
    cabinet = B.pagehead(
        "Le cabinet",
        "ALLCX Consulting.",
        "Une société de conseil indépendante, dirigée par son fondateur, qui intervient auprès des "
        "entreprises et des porteurs de projets sur leur développement commercial.",
        crumbs=["Le cabinet"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        <p class="eyebrow">Identité</p>
        <h2 class="display-md">Une structure volontairement légère.</h2>
        <p class="body-lg muted mt-3">
          ALLCX CONSULTING est une société par actions simplifiée immatriculée sous le SIRET """ + B.SIRET + """,
          exerçant une activité de conseil pour les affaires et autres conseils de gestion.
        </p>
        <p class="body-lg muted mt-2">
          Le cabinet ne cherche pas la taille. Il fonctionne avec un dirigeant impliqué sur chaque mission
          et un réseau de partenaires mobilisés selon les besoins : professionnels du chiffre, avocats,
          spécialistes sectoriels, relais locaux à l’international. Cette organisation permet d’engager une
          mission rapidement et d’en sortir sans coût de structure inutile pour le client.
        </p>
        <h3 class="display-sm mt-6">Direction</h3>
        <p class="body-lg muted mt-2">
          Le cabinet est dirigé par Fabrice Ekissi. Son activité s’organise autour de trois pratiques —
          conseil en développement commercial, formation, apport d’affaires — exercées auprès de TPE, de PME
          et d’organisations plus structurées, en France et en Afrique francophone. Il intervient également
          comme formateur auprès d’étudiants en BTS Management Commercial Opérationnel.
        </p>
        <p class="body-lg muted mt-2">
          Parcours détaillé, formations suivies et références : """ + TODO + """.
        </p>
      </div>
      <div data-reveal>
        <div class="card card--dark">
          <p class="index-num">Repères</p>
          <ul class="list-rule mt-2" style="--line:rgba(255,255,255,.16)">
            <li><span class="k" style="color:rgba(255,255,255,.6)">Forme juridique</span><span class="v" style="color:#fff">SAS</span></li>
            <li><span class="k" style="color:rgba(255,255,255,.6)">SIRET</span><span class="v" style="color:#fff">""" + B.SIRET + """</span></li>
            <li><span class="k" style="color:rgba(255,255,255,.6)">Activité</span><span class="v" style="color:#fff">Conseil de gestion</span></li>
            <li><span class="k" style="color:rgba(255,255,255,.6)">Zones</span><span class="v" style="color:#fff">France, Afrique francophone</span></li>
            <li><span class="k" style="color:rgba(255,255,255,.6)">Langue de travail</span><span class="v" style="color:#fff">Français</span></li>
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
        <p class="eyebrow">Manière de travailler</p>
        <h2 class="display-lg">Quatre engagements tenus sur chaque mission.</h2>
      </div>
      <div data-reveal>
        <p class="lede">Ils ne relèvent pas du discours : ils figurent dans la proposition écrite et
        conditionnent l’acceptation de la mission.</p>
      </div>
    </div>
    <div class="grid grid-4" data-reveal-group>
      <div class="card" data-reveal><p class="index-num">01</p><h3 class="display-sm">Franchise</h3><p>Si le sujet ne relève pas de notre champ, ou si l’intervention nous paraît prématurée, nous le disons avant de proposer quoi que ce soit.</p></div>
      <div class="card" data-reveal><p class="index-num">02</p><h3 class="display-sm">Continuité</h3><p>La personne qui cadre la mission est celle qui la conduit. Pas de passage de relais à une équipe junior après signature.</p></div>
      <div class="card" data-reveal><p class="index-num">03</p><h3 class="display-sm">Traçabilité</h3><p>Périmètre, calendrier, livrables et honoraires sont écrits avant le démarrage. Toute évolution fait l’objet d’un avenant.</p></div>
      <div class="card" data-reveal><p class="index-num">04</p><h3 class="display-sm">Autonomie du client</h3><p>Une mission réussie est une mission dont on sort. Le transfert aux équipes internes fait partie du périmètre.</p></div>
    </div>
  </div>
</section>

<section class="section section--tight section--line">
  <div class="shell">
    <div class="split">
      <div data-reveal>
        <p class="eyebrow">Zone d’intervention</p>
        <h2 class="display-sm">France entière et Afrique francophone.</h2>
        <p class="muted mt-3">Les missions en France se conduisent sur site et à distance. Les missions
        internationales comportent au moins un déplacement sur le marché visé ; les conditions
        matérielles sont précisées dans la proposition.</p>
      </div>
      <div data-reveal>
        <p class="eyebrow">Confidentialité</p>
        <h2 class="display-sm">Aucune référence citée sans accord.</h2>
        <p class="muted mt-3">Le cabinet ne publie pas le nom de ses clients ni le détail de leurs
        opérations. Des références peuvent être communiquées de vive voix, avec leur autorisation
        préalable, lors d’un entretien.</p>
      </div>
    </div>
  </div>
</section>

""" + B.cta_block(
        "consulting",
        "Travaillons ensemble.",
        "Le premier échange sert à vérifier que le sujet est bien de notre ressort. Il n’engage à rien.",
        ("contact.html", "Prendre rendez-vous"),
    )

    P.append((
        "cabinet.html",
        "Le cabinet | ALLCX Consulting",
        "ALLCX Consulting, société de conseil indépendante en développement commercial. Identité, direction, "
        "manière de travailler et zones d’intervention.",
        cabinet,
    ))

    # =======================================================================
    # CONTACT
    # =======================================================================
    contact = B.pagehead(
        "Contact",
        "Décrivez votre situation.",
        "Un formulaire, une adresse, et une réponse sous 48 heures ouvrées. Les demandes précises "
        "obtiennent les réponses utiles.",
        crumbs=["Contact"],
    ) + """
<section class="section">
  <div class="shell">
    <div class="split split--wide-left split--top">
      <div data-reveal>
        """ + B.contact_form(
        "consulting",
        "Demande — ALLCX Consulting",
        ["Conseil en développement commercial",
         "Implantation en Afrique francophone",
         "Formation ou coaching",
         "Apport d’affaires et mise en relation",
         "Autre demande"],
    ) + """
      </div>
      <div data-reveal>
        <div class="contact-aside">
          <h2 class="display-sm">Coordonnées</h2>
          <dl class="mt-3">
            <div><dt>Courriel</dt><dd><a href="mailto:""" + B.CONSULTING_MAIL + """">""" + B.CONSULTING_MAIL + """</a></dd></div>
            <div><dt>Téléphone</dt><dd>""" + TODO + """</dd></div>
            <div><dt>Adresse</dt><dd>""" + TODO + """<br>France</dd></div>
            <div><dt>Délai de réponse</dt><dd>48 heures ouvrées</dd></div>
            <div><dt>Langue</dt><dd>Français</dd></div>
          </dl>
        </div>
        <div class="card mt-3">
          <p class="index-num">Pour aller plus vite</p>
          <ul class="list-check mt-2">
            <li>Votre activité et votre marché en deux lignes</li>
            <li>La taille de l’équipe commerciale, s’il y en a une</li>
            <li>Ce que vous avez déjà tenté</li>
            <li>L’échéance que vous vous fixez</li>
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
        ("Le premier échange est-il facturé ?",
         "Non. L’entretien de découverte, d’une trentaine de minutes, permet de qualifier la demande. "
         "Il ne donne lieu à aucune facturation et n’engage aucune des deux parties."),
        ("Sous quel délai recevrai-je une proposition ?",
         "Comptez cinq jours ouvrés après l’entretien de cadrage pour une proposition écrite comportant "
         "le périmètre, le calendrier, les livrables et les honoraires."),
        ("Que deviennent les informations transmises ?",
         "Elles servent uniquement à traiter votre demande, ne sont ni cédées ni revendues, et sont "
         "conservées le temps nécessaire à l’échange commercial. Vous pouvez en demander la suppression "
         "à tout moment par courriel."),
    ], "faq-contact") + """
  </div>
</section>"""

    P.append((
        "contact.html",
        "Contact | ALLCX Consulting",
        "Contacter ALLCX Consulting : conseil en développement commercial, implantation en Afrique "
        "francophone, formation, apport d’affaires. Réponse sous 48 heures ouvrées.",
        contact,
    ))

    P.append(B.legal_page("consulting"))

    return P
