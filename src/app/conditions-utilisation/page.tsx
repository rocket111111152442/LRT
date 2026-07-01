import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";

const sections = [
  {
    title: "1. Objet du service",
    text: "Qoravo est un logiciel en ligne destine aux professionnels de la reparation d'appareils. Le service aide l'atelier a recevoir des demandes, organiser les fiches client, suivre les statuts, envoyer des emails, imprimer des recus, gerer un stock simple et conserver un historique de travail. Qoravo ne realise pas les reparations a la place de l'atelier et ne garantit pas le resultat technique d'une intervention faite par un utilisateur du logiciel.",
  },
  {
    title: "2. Acceptation des conditions",
    text: "En creant un compte, en validant un paiement, en utilisant l'espace admin ou en donnant acces au formulaire client, l'utilisateur accepte les presentes conditions d'utilisation. Si l'utilisateur agit pour une entreprise, un atelier ou une personne morale, il declare disposer du pouvoir necessaire pour engager cette structure. L'utilisation du service doit rester conforme a la loi, aux usages normaux d'un logiciel professionnel et aux obligations envers les clients finaux.",
  },
  {
    title: "3. Compte professionnel",
    text: "Le compte professionnel donne acces a un espace admin, a un identifiant public, a un QR code et aux outils de suivi associes. L'utilisateur doit fournir des informations exactes lors de l'inscription, notamment le nom de l'atelier, l'adresse email admin et les informations utiles. Qoravo peut refuser, suspendre ou supprimer un compte manifestement frauduleux, abusif, usurpe ou contraire a l'objet du service.",
  },
  {
    title: "4. Paiement et activation",
    text: "Le paiement sert a activer le compte professionnel et a limiter les creations abusives. Le compte admin definitif est cree apres confirmation du paiement ou apres validation d'un code promotionnel autorise. Si le paiement est refuse, annule ou non confirme par le prestataire de paiement, le compte peut rester inactif et l'acces aux fonctions pro peut etre refuse. Les frais lies a des options supplementaires sont presentes avant paiement.",
  },
  {
    title: "5. Demande commerciale apres paiement",
    text: "Les services numeriques peuvent commencer rapidement apres activation. Lorsqu'un utilisateur demande une assistance, configure son espace ou utilise le service, il reconnait que le service peut etre execute immediatement. Toute demande commerciale liee a une insatisfaction doit etre faite par email avec les informations du compte, le motif detaille et la preuve de paiement. Qoravo peut demander des informations complementaires pour verifier la demande.",
  },
  {
    title: "6. Donnees saisies par l'atelier",
    text: "L'atelier reste responsable des donnees qu'il saisit ou collecte avec Qoravo : noms, prenoms, numeros de telephone, emails, marques, modeles, descriptions de panne, notes internes, photos, signatures et informations de suivi. L'atelier doit informer ses clients de l'utilisation du logiciel et verifier qu'il dispose d'une base legitime pour enregistrer les informations necessaires au suivi de reparation.",
  },
  {
    title: "7. Donnees client et confidentialite",
    text: "Les donnees des clients finaux doivent etre limitees a ce qui est necessaire pour gerer une reparation. L'atelier ne doit pas enregistrer d'informations sensibles inutiles, de mots de passe complets, de donnees bancaires, de documents d'identite non necessaires ou de contenus illicites. Les notes internes doivent rester professionnelles et liees au dossier de reparation.",
  },
  {
    title: "8. Email, SMTP et notifications",
    text: "Le logiciel peut envoyer des emails de suivi, de statut, de devis, de rappel et d'avis client selon la configuration choisie. L'utilisateur est responsable des identifiants SMTP qu'il renseigne et doit utiliser une adresse autorisee. Si la configuration email est absente, incorrecte, bloquee ou limitee par un fournisseur tiers, Qoravo peut enregistrer les actions sans garantir l'envoi effectif des emails.",
  },
  {
    title: "9. Devis et acceptation client",
    text: "La fonction de devis permet a l'atelier d'indiquer un prix estime et d'envoyer au client un lien d'acceptation ou de refus. Le devis reste une information fournie par l'atelier, qui demeure seul responsable du prix, des taxes, des conditions de reparation et des eventuels changements necessaires. Qoravo fournit l'outil technique mais ne valide pas le contenu commercial du devis.",
  },
  {
    title: "10. Signatures client",
    text: "Les signatures collectees dans Qoravo servent a garder une preuve pratique de depot ou de recuperation. Elles doivent etre recueillies par le client concerne ou par une personne autorisee. L'admin ne doit pas signer a la place du client. L'atelier reste responsable de l'information donnee au client et de l'utilisation de la signature dans son propre cadre commercial.",
  },
  {
    title: "11. Photos et pieces jointes",
    text: "Les photos doivent servir a constater l'etat general de l'appareil, les dommages visibles, les accessoires remis ou d'autres elements utiles a la reparation. L'utilisateur s'engage a ne pas televerser de contenus sans rapport avec l'activite, de contenus illicites ou de fichiers qui porteraient atteinte aux droits de tiers. Les photos peuvent etre limitees en taille, en nombre et en format pour maintenir la stabilite du service.",
  },
  {
    title: "12. Stock et calculs financiers",
    text: "Les fonctions de stock, cout de piece, valeur de stock, benefice estime et statistiques servent d'aide a l'organisation. Elles ne remplacent pas une comptabilite officielle, un logiciel fiscal ou un conseil comptable. L'atelier doit verifier ses prix, marges, couts, taxes, factures et obligations comptables avec ses propres outils ou conseils professionnels.",
  },
  {
    title: "13. Disponibilite du service",
    text: "Qoravo fait ses meilleurs efforts pour fournir un service stable, mais ne garantit pas une disponibilite permanente et ininterrompue. Des interruptions peuvent venir de la maintenance, de nos prestataires techniques (hebergement, base de donnees, paiement, email), d'une panne reseau ou d'une mauvaise configuration. L'utilisateur doit conserver une organisation minimale pour pouvoir travailler en cas d'indisponibilite temporaire.",
  },
  {
    title: "14. Securite du compte",
    text: "L'utilisateur doit proteger son adresse email admin, son mot de passe, ses codes de validation, ses cles techniques et ses mots de passe d'application. Il ne doit pas partager ces informations avec des personnes non autorisees. Toute suspicion d'acces non autorise doit etre traitee rapidement par changement de mot de passe et verification des configurations.",
  },
  {
    title: "15. Usage interdit",
    text: "Il est interdit d'utiliser Qoravo pour creer de faux comptes en masse, tester frauduleusement des paiements, collecter des donnees sans motif legitime, harceler des clients, envoyer du spam, contourner les protections techniques, copier le service, perturber les serveurs, charger des contenus malveillants ou utiliser l'application pour une activite illegale.",
  },
  {
    title: "16. Responsabilite de l'atelier",
    text: "L'atelier reste responsable de sa relation client, de la reception des appareils, des diagnostics, des devis, des reparations, des garanties commerciales, de la restitution des appareils et des litiges eventuels. Qoravo n'est pas partie au contrat entre l'atelier et son client final. Les informations affichees dans Qoravo doivent etre verifiees par l'atelier avant toute decision importante.",
  },
  {
    title: "17. Responsabilite de Qoravo",
    text: "Qoravo fournit un outil logiciel en l'etat raisonnable de son developpement. Dans les limites permises par la loi, Qoravo ne pourra pas etre tenu responsable des pertes indirectes, pertes d'exploitation, erreurs de saisie, mauvaise configuration email, mauvaise utilisation du stock, litiges avec un client final ou decisions prises uniquement a partir de donnees non verifiees.",
  },
  {
    title: "18. Evolution du service",
    text: "Le logiciel peut evoluer avec de nouvelles fonctions, corrections, changements d'interface ou ajustements techniques. Certaines fonctions peuvent etre modifiees, suspendues ou remplacees si elles posent un probleme de securite, de cout, de stabilite ou de conformite. Les evolutions importantes peuvent etre signalees dans l'application ou par email.",
  },
  {
    title: "19. Suspension et fermeture",
    text: "Un compte peut etre suspendu ou ferme en cas de fraude, d'abus, de non-paiement, d'utilisation dangereuse, d'atteinte a la securite ou de non-respect des presentes conditions. L'utilisateur peut demander la fermeture de son compte et doit alors recuperer les donnees necessaires a son activite avant suppression lorsque cela est techniquement possible.",
  },
  {
    title: "20. Contact et reglement des demandes",
    text: "Les demandes liees au compte, au paiement, a l'aide d'installation, aux emails, a la suppression de donnees ou a un probleme technique doivent etre adressees au support avec le plus de details possible. L'utilisateur doit fournir l'email admin, le nom de l'atelier, la date du probleme, les captures utiles et les actions deja essayees afin de faciliter le traitement.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-8">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
        >
          Retour a l&apos;accueil
        </Link>

        <header className="grid gap-4 border-b border-slate-200 pb-8">
          <QoravoLogo />
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Qoravo
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Conditions d&apos;utilisation
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Ces conditions encadrent l&apos;utilisation du logiciel Qoravo par les
            ateliers et professionnels de la reparation. Elles doivent etre lues
            avant le paiement et avant l&apos;utilisation de l&apos;espace admin.
          </p>
          <p className="text-xs text-slate-500">
            Satisfait ou rembourse sous 10 jours maximum.
          </p>
        </header>

        <section className="grid gap-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="text-xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="text-sm leading-7 text-slate-700">{section.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
