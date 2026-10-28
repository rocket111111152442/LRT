import { ArrowUpRight } from "lucide-react";

// Identité légale de l’éditeur. Les champs vides ne sont pas affichés :
// renseignez-les (nom, statut, SIREN, adresse) pour des mentions légales complètes.
export const legal = {
  brand: "Lullin Web",
  owner: "", // Prénom et nom du responsable de la publication
  status: "", // ex. « Entrepreneur individuel (micro-entreprise) »
  siren: "", // ex. « SIREN 123 456 789 »
  address: "", // adresse postale du siège
  vat: "", // ex. « TVA non applicable, article 293 B du CGI »
  email: "contact@lullin-web.com",
  phone: "07 53 30 54 52",
  phoneHref: "tel:+33753305452",
  mediator: "", // nom et site du médiateur de la consommation auquel Lullin Web adhère
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    url: "https://vercel.com",
  },
  updated: "20 septembre 2026",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span>01 /</span>
      {children}
    </p>
  );
}

export function MentionsLegales() {
  const identity = [legal.status, legal.siren, legal.address, legal.vat].filter(
    Boolean,
  );
  return (
    <section className="wrap legal">
      <Label>MENTIONS LÉGALES</Label>
      <h1>
        Qui est derrière
        <br />
        <em>ce site.</em>
      </h1>
      <p>Dernière mise à jour : {legal.updated}.</p>
      <h2>Éditeur du site</h2>
      <p>
        Le site www.lullin-web.com est édité par <strong>{legal.brand}</strong>
        {legal.owner ? `, représenté par ${legal.owner}` : ""}
        {identity.length ? ` — ${identity.join(" · ")}` : ""}.
      </p>
      <p>
        Contact : <a href={`mailto:${legal.email}`}>{legal.email}</a> ·{" "}
        <a href={legal.phoneHref}>{legal.phone}</a>
      </p>
      <h2>Directeur de la publication</h2>
      <p>{legal.owner || `Le responsable de ${legal.brand}`}, joignable aux coordonnées ci-dessus.</p>
      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par {legal.host.name}, {legal.host.address} —{" "}
        <a href={legal.host.url} target="_blank" rel="noreferrer">
          {legal.host.url.replace("https://", "")}
        </a>
        . Les données sont servies depuis des centres de données situés en Europe
        et aux États-Unis.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble du site (textes, visuels, logo, structure, code) est la
        propriété de {legal.brand}, sauf mention contraire. Toute reproduction,
        représentation ou adaptation, totale ou partielle, sans autorisation
        écrite préalable est interdite. Les marques et visuels des réalisations
        présentées appartiennent à leurs clients respectifs.
      </p>
      <h2>Données personnelles et cookies</h2>
      <p>
        Les informations transmises par le formulaire de contact servent
        uniquement à répondre à votre demande. Le site n’utilise aucun cookie
        nécessitant votre consentement. Le détail figure dans notre{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>
      <h2>Conditions de vente</h2>
      <p>
        Les prestations de {legal.brand} sont régies par nos{" "}
        <a href="/cgv">conditions générales de vente</a>. Un devis détaillé est
        établi et accepté avant toute prestation.
      </p>
      <h2>Responsabilité</h2>
      <p>
        {legal.brand} s’efforce de maintenir des informations exactes et à jour,
        mais ne peut garantir l’absence d’erreur ni la disponibilité permanente
        du site. Les liens vers des sites externes sont fournis à titre
        d’information ; {legal.brand} n’est pas responsable de leur contenu.
      </p>
      <a className="text-link" href="/contact">
        Nous contacter <ArrowUpRight size={17} />
      </a>
    </section>
  );
}

export function CGV() {
  const seller = legal.owner ? `${legal.brand} (${legal.owner})` : legal.brand;
  const identity = [legal.status, legal.siren, legal.address].filter(Boolean);
  return (
    <section className="wrap legal">
      <Label>CONDITIONS GÉNÉRALES DE VENTE</Label>
      <h1>
        Les règles
        <br />
        <em>du jeu.</em>
      </h1>
      <p>
        Version en vigueur au {legal.updated}. Ces conditions s’appliquent à
        toute prestation commandée à {seller}
        {identity.length ? ` — ${identity.join(" · ")}` : ""}, ci-après « le
        Prestataire », par un client professionnel ou particulier, ci-après « le
        Client ».
      </p>

      <h2>1. Objet</h2>
      <p>
        Le Prestataire conçoit des sites internet (formules Essentiel, Vitrine,
        Business, Premium ou projet personnalisé), propose des options à la
        carte et des abonnements de maintenance décrits sur la page{" "}
        <a href="/offres">Offres</a>. Les présentes conditions définissent les
        droits et obligations des parties pour ces prestations.
      </p>

      <h2>2. Devis et commande</h2>
      <p>
        Toute prestation fait l’objet d’un devis gratuit, détaillé et
        personnalisé, valable 30 jours. La commande est ferme à réception du
        devis accepté (signature ou accord écrit par e-mail) et, le cas échéant,
        de l’acompte prévu. Aucune prestation ne démarre avant cette acceptation.
        Les prix indiqués sur le site sont des prix « à partir de » : seul le
        devis fait foi.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont exprimés en euros{legal.vat ? ` (${legal.vat})` : ""}. Le
        prix d’une création est un prix forfaitaire fixé au devis pour le
        périmètre décrit (nombre de pages, fonctionnalités, options). Toute
        demande hors périmètre fait l’objet d’un devis complémentaire. Le nom de
        domaine est inclus pendant la première année dans les formules de
        création ; son renouvellement est ensuite compris dans les abonnements
        de maintenance ou à la charge du Client.
      </p>

      <h2>4. Paiement</h2>
      <p>
        Sauf mention contraire au devis, la création est réglée en deux fois :
        un acompte de 30 % à la commande, le solde à la validation du site avant
        sa mise en ligne. Les abonnements de maintenance sont facturés
        mensuellement, d’avance. Moyens de paiement acceptés : virement bancaire
        (et tout autre moyen indiqué sur le devis). Pour les professionnels,
        tout retard de paiement entraîne de plein droit des pénalités égales à
        trois fois le taux d’intérêt légal et une indemnité forfaitaire de
        recouvrement de 40 € (articles L. 441-10 et D. 441-5 du Code de
        commerce).
      </p>

      <h2>5. Délais</h2>
      <p>
        Une estimation de délai est communiquée avant le lancement de la
        création. Elle court à compter de la réception de l’acompte et de
        l’ensemble des éléments nécessaires (textes, images, accès, validations).
        Les délais dépendent de la réactivité du Client et sont donnés à titre
        indicatif ; un retard ne peut donner lieu à annulation ou indemnité, sauf
        accord exprès.
      </p>

      <h2>6. Obligations du Client</h2>
      <p>
        Le Client fournit les contenus nécessaires (textes, images, logo,
        informations légales) et garantit détenir les droits permettant leur
        utilisation. Il valide les étapes dans un délai raisonnable. Il est seul
        responsable des informations publiées sur son site et de leur conformité
        à la réglementation applicable à son activité.
      </p>

      <h2>7. Réalisation, validation et mise en ligne</h2>
      <p>
        Le Client découvre son site sur un aperçu privé et peut demander les
        ajustements prévus par sa formule. La mise en ligne intervient après
        validation écrite et paiement du solde. Passé un délai de 15 jours sans
        retour du Client après présentation de l’aperçu, le site est réputé
        validé.
      </p>

      <h2>8. Hébergement, domaine et adresses mail</h2>
      <p>
        L’hébergement, la surveillance, les sauvegardes, le renouvellement du
        nom de domaine et la gestion des adresses mail professionnelles sont
        assurés dans le cadre des abonnements de maintenance. Sans abonnement,
        le site et ses accès sont remis au Client, qui assure lui-même (ou par
        le prestataire de son choix) l’hébergement et les renouvellements. Le
        nom de domaine est enregistré pour le compte du Client, qui en est le
        titulaire.
      </p>

      <h2>9. Maintenance</h2>
      <p>
        Les abonnements Essentielle, Business et Visibilité sont souscrits pour
        une durée d’un mois renouvelable tacitement. Chaque partie peut y mettre
        fin à tout moment par écrit, avec un préavis d’un mois. Le contenu de
        chaque abonnement (modifications incluses, suivi, optimisation) est
        décrit sur la page Offres ; les demandes dépassant ce cadre (nouvelles
        pages, refonte, fonctionnalités) font l’objet d’un devis.
      </p>

      <h2>10. Propriété intellectuelle</h2>
      <p>
        Après paiement intégral, le Client devient propriétaire de son site :
        design, contenus et développements spécifiques réalisés pour lui. Les
        éléments tiers (polices, images sous licence, bibliothèques open source,
        services externes) restent soumis à leurs licences respectives. Le
        Prestataire est autorisé à mentionner la réalisation dans ses
        références et son portfolio, sauf opposition écrite du Client.
      </p>

      <h2>11. Responsabilité</h2>
      <p>
        Le Prestataire est tenu à une obligation de moyens. Il ne peut être tenu
        responsable des contenus fournis par le Client, des interruptions ou
        défaillances imputables à des tiers (hébergeur, registrar, moteurs de
        recherche, fournisseurs de services), ni des conséquences d’une
        utilisation non conforme du site. En tout état de cause, sa
        responsabilité est limitée au montant effectivement payé pour la
        prestation concernée.
      </p>

      <h2>12. Droit de rétractation (clients particuliers)</h2>
      <p>
        Conformément aux articles L. 221-18 et suivants du Code de la
        consommation, le Client consommateur dispose d’un délai de 14 jours à
        compter de l’acceptation du devis pour se rétracter, sans motif, par
        courrier ou e-mail. S’il demande expressément que la prestation commence
        avant la fin de ce délai, il reste redevable du travail déjà réalisé ;
        une prestation pleinement exécutée avec son accord n’est plus soumise à
        rétractation.
      </p>

      <h2>13. Données personnelles</h2>
      <p>
        Les données traitées pour l’exécution des prestations sont décrites dans
        la <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>14. Médiation et litiges</h2>
      <p>
        En cas de difficulté, le Client est invité à contacter le Prestataire à{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a> pour rechercher une
        solution amiable.{" "}
        {legal.mediator
          ? `Conformément aux articles L. 612-1 et suivants du Code de la consommation, le Client consommateur peut recourir gratuitement au médiateur suivant : ${legal.mediator}.`
          : "Conformément aux articles L. 612-1 et suivants du Code de la consommation, le Client consommateur peut recourir gratuitement à un médiateur de la consommation ; ses coordonnées sont indiquées sur le devis."}{" "}
        À défaut d’accord, les litiges relèvent des tribunaux français
        compétents. Les présentes conditions sont soumises au droit français.
      </p>
      <a className="text-link" href="/contact">
        Demander un devis <ArrowUpRight size={17} />
      </a>
    </section>
  );
}

export function Privacy() {
  return (
    <section className="wrap legal">
      <Label>CONFIDENTIALITÉ</Label>
      <h1>
        Votre projet.
        <br />
        <em>Vos données.</em>
      </h1>
      <p>Dernière mise à jour : {legal.updated}.</p>

      <h2>Qui est responsable</h2>
      <p>
        Le responsable du traitement est {legal.brand}
        {legal.owner ? ` (${legal.owner})` : ""}, joignable à{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a> ou au{" "}
        <a href={legal.phoneHref}>{legal.phone}</a>.
      </p>

      <h2>Ce que nous collectons, et pourquoi</h2>
      <p>
        Lorsque vous remplissez le formulaire de contact, nous recevons : votre
        nom et prénom, votre adresse e-mail, votre entreprise et votre téléphone
        si vous les renseignez, le type de site souhaité, l’existence d’un site
        actuel, votre budget envisagé, les options et l’abonnement de maintenance
        qui vous intéressent, et votre message. Ces données servent uniquement à
        étudier votre demande, préparer un devis et vous répondre. Elles ne sont
        ni vendues, ni louées, ni utilisées à des fins publicitaires.
      </p>
      <p>
        Base légale : les mesures précontractuelles prises à votre demande
        (article 6.1.b du RGPD) et votre consentement, exprimé en cochant la case
        d’accord de contact.
      </p>

      <h2>Combien de temps</h2>
      <p>
        Les demandes qui n’aboutissent pas à une prestation sont conservées
        3 ans après notre dernier échange. Pour les clients, les données sont
        conservées pendant la durée de la relation, puis archivées selon les
        obligations légales (10 ans pour les pièces comptables).
      </p>

      <h2>Qui y a accès</h2>
      <p>
        {legal.brand} uniquement, ainsi que deux prestataires techniques
        strictement nécessaires : Resend (acheminement des e-mails du
        formulaire) et Vercel (hébergement du site et de son formulaire). Ces
        sociétés sont établies aux États-Unis et traitent les données sous
        clauses contractuelles types de la Commission européenne ; elles ne les
        utilisent pas pour leur propre compte.
      </p>

      <h2>Cookies et mesure d’audience</h2>
      <p>
        Le site n’utilise aucun cookie publicitaire ni de suivi, et n’affiche
        donc pas de bandeau de consentement. Un stockage temporaire dans votre
        navigateur mémorise uniquement le passage de l’introduction et votre
        choix de mettre les animations en pause ; il disparaît à la fermeture du
        navigateur. La fréquentation est mesurée avec Vercel Web Analytics, un
        outil sans cookie qui ne conserve aucune donnée permettant de vous
        identifier.
      </p>

      <h2>Sécurité</h2>
      <p>
        Le site est servi intégralement en HTTPS. Le formulaire est protégé
        contre les envois automatisés et ses données sont validées et
        transmises côté serveur ; aucune information n’est stockée dans le
        navigateur après l’envoi.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez à tout moment demander l’accès à vos données, leur
        rectification, leur effacement, la limitation ou l’opposition à leur
        traitement, ainsi que leur portabilité, en écrivant à{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>. Nous répondons
        sous un mois. Vous pouvez également introduire une réclamation auprès de
        la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
          cnil.fr
        </a>
        ).
      </p>
      <a className="text-link" href="/contact">
        Parler de mon projet <ArrowUpRight size={17} />
      </a>
    </section>
  );
}
