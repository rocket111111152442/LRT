import type { Metadata } from "next";

export type SeoResource = {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  image: string;
  imageAlt: string;
  problemTitle: string;
  problemParagraphs: string[];
  situationTitle: string;
  situationIntro: string;
  workflow: Array<{ title: string; text: string }>;
  benefits: Array<{ title: string; text: string }>;
  checklistTitle: string;
  checklist: string[];
  faq: Array<{ question: string; answer: string }>;
};

const workshopImage =
  "https://images.unsplash.com/photo-1581993192008-63e896f4f744?auto=format&fit=crop&w=1600&q=82";
const partsImage =
  "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1600&q=82";
const counterImage =
  "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1600&q=82";

export const seoResources: Record<string, SeoResource> = {
  "logiciel-reparateur-telephone": {
    slug: "logiciel-reparateur-telephone",
    navLabel: "Réparateur téléphone",
    title: "Logiciel pour réparateur de téléphone : organiser l'atelier sans papier",
    description:
      "Découvrez comment un logiciel pour réparateur de téléphone centralise les tickets, devis, statuts, pièces et échanges clients dans un atelier.",
    eyebrow: "Gestion d'atelier smartphone",
    lead:
      "Un atelier de réparation téléphone doit suivre plusieurs appareils, clients, pièces et délais à la fois. Une organisation claire évite les oublis sans ajouter une nouvelle contrainte au comptoir.",
    image: workshopImage,
    imageAlt: "Technicien réparant un smartphone sur un établi",
    problemTitle: "Pourquoi les informations se perdent vite dans un atelier téléphone",
    problemParagraphs: [
      "Une réparation commence souvent par un échange rapide au comptoir. Le nom du client est sur une feuille, la panne dans un message et la pièce commandée dans un autre outil. Dès que plusieurs appareils se ressemblent, retrouver la bonne information prend du temps.",
      "Le problème ne vient pas du nombre de réparations, mais du manque de lien entre le client, l'appareil, le devis, la pièce et le statut. Un logiciel d'atelier doit réunir ces éléments dans une seule fiche consultable par l'équipe.",
    ],
    situationTitle: "Exemple : un iPhone déposé pour un écran cassé",
    situationIntro:
      "Avec Qoravo, le parcours reste lisible depuis le dépôt jusqu'à la récupération, sans demander au client d'installer une application.",
    workflow: [
      { title: "Dépôt identifié", text: "Le client remplit ses coordonnées, décrit la panne et reçoit un numéro de ticket." },
      { title: "Diagnostic et devis", text: "L'atelier ajoute son diagnostic, son prix et conserve la réponse du client dans la fiche." },
      { title: "Réparation suivie", text: "Le statut, les pièces utilisées, les photos et les notes restent rattachés au même appareil." },
      { title: "Récupération tracée", text: "Le client est prévenu, suit son dossier puis confirme la récupération avec sa signature." },
    ],
    benefits: [
      { title: "Moins de recherches", text: "Le ticket retrouve immédiatement le client, l'appareil et les décisions prises." },
      { title: "Communication claire", text: "Le magasin choisit ses messages et les envoie depuis sa propre adresse email." },
      { title: "Historique utile", text: "Une nouvelle intervention peut être rapprochée des réparations précédentes du client." },
    ],
    checklistTitle: "Les fonctions réellement utiles au comptoir",
    checklist: [
      "Un numéro de ticket court et unique",
      "La marque, le modèle, l'IMEI ou le numéro de série",
      "Des statuts compréhensibles par le client",
      "Les photos avant et après intervention",
      "Le devis, l'acompte et le reste à payer",
      "Une recherche rapide par nom, téléphone ou modèle",
    ],
    faq: [
      { question: "Le client doit-il créer un compte ?", answer: "Non. Il utilise son ticket et le lien sécurisé transmis par l'atelier." },
      { question: "Peut-on gérer autre chose que les smartphones ?", answer: "Oui. La même fiche convient aux tablettes, montres, consoles, ordinateurs et autres appareils électroniques." },
      { question: "Faut-il installer Qoravo ?", answer: "Non. Qoravo fonctionne dans le navigateur sur ordinateur, tablette et téléphone." },
    ],
  },
  "logiciel-gestion-reparations": {
    slug: "logiciel-gestion-reparations",
    navLabel: "Gestion des réparations",
    title: "Logiciel de gestion des réparations : suivre chaque dossier de bout en bout",
    description:
      "Méthode pratique pour centraliser les réparations, attribuer les dossiers, suivre les délais et conserver un historique d'atelier fiable.",
    eyebrow: "Organisation des interventions",
    lead:
      "La gestion d'une réparation ne se limite pas à changer un statut. Il faut savoir ce qui a été promis, qui intervient, quelle pièce manque et quand le client doit revenir.",
    image: workshopImage,
    imageAlt: "Établi organisé dans un atelier de réparation électronique",
    problemTitle: "Une liste de dossiers ne suffit pas pour piloter l'atelier",
    problemParagraphs: [
      "Quand les réparations sont réparties entre des feuilles, un agenda et plusieurs conversations, personne ne dispose de la même version de l'information. Les retards sont découverts trop tard et les clients rappellent pour obtenir une réponse.",
      "Un logiciel de gestion des réparations doit rendre visibles les prochaines actions : diagnostic à faire, devis en attente, pièce commandée, appareil prêt ou récupération prévue.",
    ],
    situationTitle: "Exemple : répartir la journée entre plusieurs techniciens",
    situationIntro:
      "Qoravo associe les informations opérationnelles à chaque fiche afin que l'équipe sache quoi traiter en priorité.",
    workflow: [
      { title: "Trier", text: "La recherche et les filtres isolent les urgences, les devis et les appareils en attente de pièce." },
      { title: "Attribuer", text: "Un technicien et une date prévue peuvent être associés au dossier." },
      { title: "Documenter", text: "La checklist, les notes et les photos conservent le détail de l'intervention." },
      { title: "Informer", text: "Un changement important peut déclencher un email depuis le compte du magasin." },
    ],
    benefits: [
      { title: "Vision commune", text: "L'équipe travaille à partir des mêmes informations et des mêmes priorités." },
      { title: "Délais visibles", text: "L'agenda et la date prévue permettent d'anticiper la charge de travail." },
      { title: "Décisions conservées", text: "L'historique indique quand un statut, un devis ou une note a changé." },
    ],
    checklistTitle: "Une fiche de réparation complète doit contenir",
    checklist: [
      "L'identité et les coordonnées du client",
      "L'appareil et son identifiant technique",
      "La panne déclarée et le diagnostic atelier",
      "Le responsable et la date prévue",
      "Les pièces et le temps consacrés",
      "Les documents, paiements et signatures associés",
    ],
    faq: [
      { question: "Comment retrouver une ancienne réparation ?", answer: "La recherche peut utiliser le ticket, le client, le téléphone, l'email, la marque ou le modèle." },
      { question: "Les dossiers terminés encombrent-ils la liste ?", answer: "Ils peuvent être archivés tout en restant disponibles dans l'historique de l'atelier." },
      { question: "Peut-on signaler une réparation urgente ?", answer: "Oui. Une priorité et un mode express permettent de la distinguer dans l'admin." },
    ],
  },
  "suivi-reparation-client": {
    slug: "suivi-reparation-client",
    navLabel: "Suivi client",
    title: "Suivi de réparation client : informer sans multiplier les appels",
    description:
      "Mettez en place un suivi de réparation client clair avec ticket sécurisé, statuts compréhensibles et emails envoyés par le magasin.",
    eyebrow: "Expérience client",
    lead:
      "Le client veut surtout savoir si son appareil a été reçu, si une pièce manque et quand il pourra le récupérer. Un suivi simple répond à ces questions sans interrompre l'atelier.",
    image: counterImage,
    imageAlt: "Client échangeant avec un professionnel au comptoir",
    problemTitle: "Pourquoi les clients rappellent même après le dépôt",
    problemParagraphs: [
      "Un délai annoncé oralement est vite oublié ou mal compris. Sans point de suivi, le client ne sait pas si l'atelier a commencé le diagnostic ni si le délai initial reste valable.",
      "Une bonne page de suivi ne doit pas exposer les notes internes. Elle montre uniquement les informations nécessaires et protège l'accès avec le ticket et un lien sécurisé.",
    ],
    situationTitle: "Exemple : rassurer un client pendant une attente de pièce",
    situationIntro:
      "Qoravo transforme les événements de la fiche en étapes lisibles pour le client.",
    workflow: [
      { title: "Ticket envoyé", text: "Après l'enregistrement, le client reçoit son numéro et son lien de suivi." },
      { title: "Statut actualisé", text: "L'atelier indique que l'appareil est en diagnostic, en réparation ou en attente de pièce." },
      { title: "Retard expliqué", text: "Une nouvelle date estimée peut être envoyée lorsque l'intervention prend du retard." },
      { title: "Appareil prêt", text: "Le magasin prévient le client depuis sa propre boîte email quand la récupération est possible." },
    ],
    benefits: [
      { title: "Moins d'interruptions", text: "Le client peut consulter l'avancement avant d'appeler l'atelier." },
      { title: "Message cohérent", text: "Le statut affiché correspond à celui enregistré par le réparateur." },
      { title: "Accès limité", text: "Les informations internes et celles des autres clients restent invisibles." },
    ],
    checklistTitle: "Ce qu'un bon suivi client doit afficher",
    checklist: [
      "Le numéro du ticket et l'appareil concerné",
      "Le statut expliqué avec des mots simples",
      "La date prévue lorsqu'elle est connue",
      "Le devis et la décision du client",
      "Les documents disponibles pour ce dossier",
      "Les coordonnées du magasin en cas de question",
    ],
    faq: [
      { question: "Le lien de suivi est-il public ?", answer: "La page existe en ligne, mais l'accès au dossier repose sur un ticket et un jeton sécurisé lié à la réparation." },
      { question: "Qui envoie les emails de suivi ?", answer: "Les emails de réparation partent uniquement de l'adresse configurée par le magasin." },
      { question: "Le client voit-il les notes internes ?", answer: "Non. Les notes internes restent réservées à l'espace administrateur." },
    ],
  },
  "gestion-stock-pieces-detachees": {
    slug: "gestion-stock-pieces-detachees",
    navLabel: "Stock de pièces",
    title: "Gestion du stock de pièces détachées pour un atelier de réparation",
    description:
      "Organisez batteries, écrans et connecteurs, suivez leur coût d'achat et évitez les ruptures avec un stock relié aux réparations.",
    eyebrow: "Pièces détachées",
    lead:
      "Un stock utile ne se contente pas d'indiquer une quantité. Il doit aider l'atelier à savoir ce qui peut être utilisé, ce qui doit être commandé et combien une réparation rapporte réellement.",
    image: partsImage,
    imageAlt: "Composants et pièces détachées électroniques dans un atelier",
    problemTitle: "Les petites erreurs de stock coûtent du temps et de la marge",
    problemParagraphs: [
      "Une pièce présente dans un tiroir mais déjà réservée à une réparation n'est pas vraiment disponible. À l'inverse, commander une batterie déjà en stock immobilise inutilement de l'argent.",
      "Associer les pièces aux réparations permet de mettre à jour la quantité et de calculer le coût réel sans ressaisir les mêmes informations dans plusieurs tableaux.",
    ],
    situationTitle: "Exemple : utiliser un écran déjà enregistré en stock",
    situationIntro:
      "Qoravo relie la pièce à la fiche de réparation et conserve son coût d'achat dans le calcul de marge.",
    workflow: [
      { title: "Référencer", text: "L'atelier enregistre le nom, la quantité, le prix d'achat et le seuil d'alerte." },
      { title: "Affecter", text: "La pièce utilisée est sélectionnée directement depuis la réparation concernée." },
      { title: "Décrémenter", text: "La quantité disponible diminue sans double saisie." },
      { title: "Mesurer", text: "Le coût des pièces est déduit du prix client pour estimer le bénéfice réel." },
    ],
    benefits: [
      { title: "Ruptures anticipées", text: "Une alerte apparaît lorsque la quantité atteint le seuil choisi." },
      { title: "Valeur connue", text: "Le tableau calcule la valeur d'achat du stock disponible." },
      { title: "Marge plus juste", text: "Le coût des composants utilisés est rattaché à chaque intervention." },
    ],
    checklistTitle: "Les données à conserver pour chaque référence",
    checklist: [
      "Un nom précis incluant le modèle compatible",
      "La quantité réellement disponible",
      "Le prix d'achat unitaire",
      "Le fournisseur ou la commande associée",
      "Un seuil de stock bas adapté à la demande",
      "Les réparations dans lesquelles la pièce a été utilisée",
    ],
    faq: [
      { question: "Peut-on ajouter plusieurs exemplaires d'une même pièce ?", answer: "Oui. La quantité d'une référence existante peut être augmentée ou diminuée sans créer de doublon." },
      { question: "Le stock calcule-t-il la marge ?", answer: "Le coût des pièces affectées peut être comparé au prix de vente enregistré sur la réparation." },
      { question: "Peut-on exporter le stock ?", answer: "Les données de l'atelier peuvent être exportées afin de conserver une sauvegarde ou préparer un traitement externe." },
    ],
  },
  "logiciel-devis-reparation": {
    slug: "logiciel-devis-reparation",
    navLabel: "Devis de réparation",
    title: "Logiciel de devis de réparation : envoyer, accepter et conserver la décision",
    description:
      "Créez un devis de réparation lié au ticket, laissez le client accepter ou refuser en ligne et conservez une preuve de sa décision.",
    eyebrow: "Accord client",
    lead:
      "Un devis utile doit être compréhensible par le client et rester rattaché à l'appareil. L'accord ne devrait pas se perdre dans une conversation téléphonique ou un message isolé.",
    image: counterImage,
    imageAlt: "Professionnel préparant un devis avec son client",
    problemTitle: "Un prix annoncé oralement laisse trop de place au doute",
    problemParagraphs: [
      "Lorsque le diagnostic révèle une intervention différente de celle imaginée au dépôt, le réparateur doit proposer un prix avant de continuer. Sans trace claire, il devient difficile de savoir quand et sur quelle base le client a accepté.",
      "Le devis doit reprendre l'appareil, le ticket et le montant, puis proposer une action simple. La réponse doit ensuite apparaître dans la fiche utilisée par l'atelier.",
    ],
    situationTitle: "Exemple : demander l'accord avant de remplacer une carte de charge",
    situationIntro:
      "Qoravo génère un lien propre à la réparation pour éviter les réponses ambiguës.",
    workflow: [
      { title: "Chiffrer", text: "Le réparateur saisit le prix estimé dans la fiche après son diagnostic." },
      { title: "Envoyer", text: "Le devis part depuis l'adresse email configurée par le magasin." },
      { title: "Décider", text: "Le client ouvre le lien puis accepte ou refuse sans créer de compte." },
      { title: "Tracer", text: "La décision et sa date sont enregistrées dans l'historique du dossier." },
    ],
    benefits: [
      { title: "Moins d'ambiguïté", text: "Le client voit le montant et l'appareil concernés avant de répondre." },
      { title: "Réponse rapide", text: "Deux actions simples remplacent plusieurs échanges de messages." },
      { title: "Historique conservé", text: "L'équipe sait si elle peut commencer l'intervention et pourquoi." },
    ],
    checklistTitle: "Avant d'envoyer un devis de réparation",
    checklist: [
      "Vérifier le modèle et l'identifiant de l'appareil",
      "Décrire précisément l'intervention proposée",
      "Indiquer un prix TTC compréhensible",
      "Préciser les limites éventuelles du diagnostic",
      "Ne commencer qu'après l'accord lorsque celui-ci est requis",
      "Conserver la réponse avec le dossier client",
    ],
    faq: [
      { question: "Le client peut-il refuser le devis ?", answer: "Oui. Le lien propose une acceptation et un refus, tous deux enregistrés sur la fiche." },
      { question: "Le devis crée-t-il automatiquement une réparation ?", answer: "Lorsqu'une demande est acceptée, elle peut rejoindre la liste des réparations de l'atelier avec son ticket." },
      { question: "Peut-on modifier le prix après envoi ?", answer: "L'atelier peut corriger sa fiche, mais un nouveau prix important doit être présenté clairement au client avant intervention." },
    ],
  },
  "logiciel-reparateur-informatique": {
    slug: "logiciel-reparateur-informatique",
    navLabel: "Réparateur informatique",
    title: "Logiciel pour réparateur informatique : suivre PC, diagnostics et interventions",
    description:
      "Organisez les réparations d'ordinateurs, diagnostics, pièces, sauvegardes et échanges clients dans une fiche d'intervention structurée.",
    eyebrow: "Atelier informatique",
    lead:
      "Une réparation informatique peut inclure plusieurs symptômes, des tests longs, une sauvegarde et des composants différents. La fiche doit conserver ce contexte sans exposer de données inutiles.",
    image: partsImage,
    imageAlt: "Technicien intervenant sur les composants d'un ordinateur",
    problemTitle: "Un ordinateur demande souvent plus qu'un simple changement de pièce",
    problemParagraphs: [
      "Un PC peut arriver pour un démarrage lent et révéler un disque défaillant, une surchauffe ou un système corrompu. Le diagnostic évolue et chaque décision doit rester compréhensible pour le technicien comme pour le client.",
      "Le suivi doit distinguer la panne déclarée, les tests réalisés, les données à préserver, les composants installés et le prix accepté.",
    ],
    situationTitle: "Exemple : diagnostiquer un ordinateur qui ne démarre plus",
    situationIntro:
      "Qoravo rassemble les informations techniques et commerciales sans transformer la fiche en document illisible.",
    workflow: [
      { title: "Identifier", text: "La fiche enregistre le modèle, le numéro de série, les accessoires et le symptôme initial." },
      { title: "Diagnostiquer", text: "Le technicien documente ses tests et utilise une checklist adaptée à l'intervention." },
      { title: "Faire valider", text: "Le client reçoit le devis lorsque la solution et le coût sont connus." },
      { title: "Restituer", text: "Les tests finaux, la facture et la signature de récupération restent associés au ticket." },
    ],
    benefits: [
      { title: "Diagnostic lisible", text: "La panne déclarée reste distincte des conclusions du technicien." },
      { title: "Accessoires tracés", text: "Chargeur, sacoche ou périphériques peuvent être mentionnés dès le dépôt." },
      { title: "Retour sous garantie", text: "L'historique aide à reconnaître une intervention précédente et sa garantie." },
    ],
    checklistTitle: "Informations utiles pour une réparation informatique",
    checklist: [
      "Marque, modèle et numéro de série",
      "Motif du dépôt et symptômes observés",
      "Accessoires laissés avec l'ordinateur",
      "Accord concernant les données et sauvegardes",
      "Tests de diagnostic et tests finaux",
      "Composants remplacés et garantie associée",
    ],
    faq: [
      { question: "Faut-il enregistrer le mot de passe du client ?", answer: "Il faut éviter les mots de passe complets inutiles. Une note ou un code temporaire ne doit être conservé que si l'intervention l'exige et avec l'accord du client." },
      { question: "Qoravo gère-t-il aussi les consoles ?", answer: "Oui. Les champs génériques permettent de suivre ordinateurs, consoles et autres appareils électroniques." },
      { question: "Peut-on suivre le temps passé ?", answer: "La fiche permet d'enregistrer le temps consacré afin d'analyser la charge et la rentabilité." },
    ],
  },
  "alternative-cahier-reparation": {
    slug: "alternative-cahier-reparation",
    navLabel: "Remplacer le cahier",
    title: "Alternative au cahier de réparation : passer au suivi numérique sans désorganiser l'atelier",
    description:
      "Comparez le cahier papier et une gestion numérique des réparations, puis préparez une transition simple sans perdre l'historique utile.",
    eyebrow: "Passage du papier au numérique",
    lead:
      "Le cahier fonctionne tant qu'une seule personne connaît son organisation. Il devient plus difficile à utiliser lorsque l'équipe grandit, que le client rappelle ou qu'il faut retrouver une intervention ancienne.",
    image: counterImage,
    imageAlt: "Comptoir professionnel organisé pour accueillir des clients",
    problemTitle: "Le cahier conserve une trace, mais ne relie pas les informations",
    problemParagraphs: [
      "Une ligne manuscrite peut indiquer un nom et une panne, mais elle ne prévient pas le client, ne réserve pas une pièce et ne signale pas un devis en attente. La recherche dépend de la date ou de la mémoire de la personne qui a reçu l'appareil.",
      "Remplacer le cahier ne signifie pas numériser chaque ancienne page. La meilleure transition consiste à enregistrer les nouveaux dossiers, puis à conserver les anciens documents le temps nécessaire.",
    ],
    situationTitle: "Exemple : commencer sans interrompre le fonctionnement du magasin",
    situationIntro:
      "Qoravo peut être introduit progressivement au comptoir avec une méthode simple et répétable.",
    workflow: [
      { title: "Préparer", text: "L'atelier configure ses statuts, son adresse email et son QR code avant le premier dépôt." },
      { title: "Commencer aujourd'hui", text: "Seules les nouvelles réparations sont saisies dans le logiciel." },
      { title: "Standardiser", text: "Toute l'équipe utilise la même fiche et le même numéro de ticket." },
      { title: "Mesurer", text: "Après quelques semaines, les recherches, retards et appels évités deviennent visibles." },
    ],
    benefits: [
      { title: "Recherche immédiate", text: "Un nom, un téléphone ou un ticket remplace le feuilletage du cahier." },
      { title: "Sauvegarde exportable", text: "Les données peuvent être exportées au lieu de dépendre d'un exemplaire papier unique." },
      { title: "Travail partagé", text: "Chaque personne autorisée consulte la même version du dossier." },
    ],
    checklistTitle: "Plan de transition en une journée",
    checklist: [
      "Créer le compte et les accès de l'équipe",
      "Renseigner les coordonnées et horaires du magasin",
      "Configurer l'adresse d'envoi des emails",
      "Imprimer le QR code du comptoir",
      "Créer une fiche de test complète",
      "Décider d'une date unique de démarrage",
    ],
    faq: [
      { question: "Doit-on ressaisir tout l'ancien cahier ?", answer: "Non. Il est généralement plus simple de démarrer avec les nouveaux dossiers et de consulter l'ancien cahier seulement lorsque nécessaire." },
      { question: "Que se passe-t-il sans Internet ?", answer: "Les fonctions en ligne nécessitent une connexion. Une sauvegarde locale exportable peut compléter le stockage cloud pour conserver une copie des données." },
      { question: "Peut-on revenir au papier ?", answer: "Les reçus, tickets et documents restent imprimables lorsque l'atelier ou le client en a besoin." },
    ],
  },
  "modele-fiche-reparation": {
    slug: "modele-fiche-reparation",
    navLabel: "Modèle de fiche",
    title: "Modèle de fiche de réparation : les informations à ne pas oublier",
    description:
      "Consultez un modèle de fiche de réparation complet : client, appareil, panne, diagnostic, devis, pièces, paiements et signatures.",
    eyebrow: "Méthode et modèle",
    lead:
      "Une bonne fiche de réparation protège autant l'atelier que le client. Elle identifie l'appareil, sépare la demande du diagnostic et conserve les décisions prises pendant l'intervention.",
    image: workshopImage,
    imageAlt: "Appareil électronique en cours de diagnostic dans un atelier",
    problemTitle: "Les oublis commencent souvent dès la réception de l'appareil",
    problemParagraphs: [
      "Sans modèle commun, chaque personne note des informations différentes. Le numéro de série manque sur une fiche, les accessoires sur une autre et le prix accepté reste dans un message privé.",
      "Le modèle doit guider la réception sans ralentir le comptoir. Les informations techniques peuvent être complétées ensuite par le technicien, tandis que les éléments client et l'état visuel sont enregistrés dès le dépôt.",
    ],
    situationTitle: "Exemple de structure d'une fiche dans Qoravo",
    situationIntro:
      "La fiche évolue avec la réparation : elle commence au dépôt et se termine avec les documents et la récupération.",
    workflow: [
      { title: "Réception", text: "Client, appareil, IMEI ou série, accessoires, panne déclarée, photos et signature." },
      { title: "Diagnostic", text: "Constat du technicien, checklist, priorité, délai et pièces nécessaires." },
      { title: "Accord", text: "Prix estimé, devis envoyé, décision du client et éventuel acompte." },
      { title: "Clôture", text: "Tests finaux, montant payé, facture, garantie et signature de récupération." },
    ],
    benefits: [
      { title: "Réception constante", text: "Chaque appareil est enregistré avec le même niveau d'information." },
      { title: "Preuves regroupées", text: "Photos, signatures et décisions restent associées au bon ticket." },
      { title: "Transmission facile", text: "Un autre technicien comprend le dossier sans refaire tout l'entretien." },
    ],
    checklistTitle: "Checklist d'une fiche de réparation complète",
    checklist: [
      "Nom, téléphone et email du client",
      "Type, marque, modèle, IMEI ou numéro de série",
      "État visuel, accessoires et photos de dépôt",
      "Panne déclarée et diagnostic technique séparés",
      "Devis, accord, acompte et reste à payer",
      "Pièces utilisées, temps passé et technicien",
      "Statut, dates prévues et historique des actions",
      "Signatures de dépôt et de récupération",
    ],
    faq: [
      { question: "La signature est-elle obligatoire ?", answer: "Cela dépend du fonctionnement et des obligations de l'atelier. Qoravo permet au client de signer lui-même au dépôt et à la récupération." },
      { question: "Qui peut modifier la signature client ?", answer: "L'administrateur peut la consulter, mais seul le client doit pouvoir la produire." },
      { question: "La fiche peut-elle servir de reçu ?", answer: "Les informations enregistrées permettent de générer un reçu de dépôt séparé et imprimable." },
    ],
  },
};

export const seoResourceLinks = Object.values(seoResources).map((resource) => ({
  href: `/${resource.slug}`,
  label: resource.navLabel,
  description: resource.description,
}));

export function createSeoResourceMetadata(resource: SeoResource): Metadata {
  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `/${resource.slug}` },
    openGraph: {
      type: "article",
      url: `https://www.qoravo.fr/${resource.slug}`,
      title: resource.title,
      description: resource.description,
      images: [{ url: resource.image, alt: resource.imageAlt }],
    },
  };
}
