/* =========================================================
   CAILLOUX — Base d'exercices
   ~160 mouvements de base × équipements × variantes
   => plus de 5 000 exercices générés.
   ========================================================= */
(function () {

const EQUIP = {
  pdc: "Poids du corps", barre: "Barre", halt: "Haltères", kb: "Kettlebell",
  mach: "Machine", poulie: "Poulie", elas: "Élastique", smith: "Machine Smith",
  trx: "TRX / anneaux", mb: "Médecine-ball", sb: "Swiss ball", banc: "Banc",
  box: "Box pliométrique", roue: "Roue abdominale", sled: "Traîneau",
  rope: "Battle ropes", sac: "Sandbag", corde: "Corde à sauter",
  tapis: "Tapis de course", velo: "Vélo", ellip: "Elliptique",
  rameur: "Rameur", ski: "SkiErg", abike: "Air bike", piscine: "Piscine"
};

const MUSCLES = [
  "Pectoraux", "Dos", "Trapèzes", "Lombaires", "Épaules", "Biceps", "Triceps",
  "Avant-bras", "Abdominaux", "Quadriceps", "Ischio-jambiers", "Fessiers",
  "Adducteurs", "Mollets", "Corps entier", "Cardio", "Mobilité"
];

const CATS = { muscu: "Musculation", fonctionnel: "Fonctionnel", cardio: "Cardio", mobilite: "Mobilité & étirements" };

/* Mouvements de base.
   n=nom, m=muscles principaux, s=secondaires, eq=équipements, cat=catégorie,
   d=difficulté de base (1-4), desc=consigne d'exécution,
   flags: uni (version unilatérale), grip (variantes de prise),
          elev (surélevé/déficit), lest (peut être lesté). */
const BASES = [
  /* ---------- PECTORAUX ---------- */
  { n: "Développé couché", m: ["Pectoraux"], s: ["Triceps", "Épaules"], eq: ["barre", "halt", "smith", "mach", "elas"], cat: "muscu", d: 2, grip: 1, desc: "Allongé sur un banc, descends la charge au niveau de la poitrine puis pousse vers le haut sans verrouiller brutalement les coudes." },
  { n: "Développé incliné", m: ["Pectoraux"], s: ["Épaules", "Triceps"], eq: ["barre", "halt", "smith", "mach", "elas"], cat: "muscu", d: 2, grip: 1, desc: "Sur un banc incliné à 30-45°, pousse la charge au-dessus du haut de la poitrine pour cibler les faisceaux supérieurs." },
  { n: "Développé décliné", m: ["Pectoraux"], s: ["Triceps"], eq: ["barre", "halt", "smith"], cat: "muscu", d: 2, grip: 1, desc: "Sur un banc décliné, descends la charge vers le bas de la poitrine puis repousse : accent sur le bas des pectoraux." },
  { n: "Écarté couché", m: ["Pectoraux"], s: ["Épaules"], eq: ["halt", "poulie", "mach", "elas"], cat: "muscu", d: 2, desc: "Bras légèrement fléchis, ouvre grand les bras vers l'extérieur puis referme comme pour enlacer un tronc d'arbre." },
  { n: "Écarté incliné", m: ["Pectoraux"], s: ["Épaules"], eq: ["halt", "poulie", "elas"], cat: "muscu", d: 2, desc: "Même mouvement que l'écarté couché mais sur banc incliné pour insister sur le haut des pectoraux." },
  { n: "Pec deck", m: ["Pectoraux"], s: [], eq: ["mach"], cat: "muscu", d: 1, desc: "Assis sur la machine, rapproche les bras devant toi en contractant fort les pectoraux, puis reviens lentement." },
  { n: "Écarté à la poulie vis-à-vis", m: ["Pectoraux"], s: ["Épaules"], eq: ["poulie", "elas"], cat: "muscu", d: 2, desc: "Debout entre deux poulies hautes, ramène les poignées devant les hanches en croisant légèrement les mains." },
  { n: "Pompes", m: ["Pectoraux"], s: ["Triceps", "Épaules", "Abdominaux"], eq: ["pdc"], cat: "muscu", d: 1, grip: 1, elev: 1, lest: 1, desc: "Corps gainé en planche, descends la poitrine près du sol puis repousse en gardant les coudes à ~45° du buste." },
  { n: "Pompes archer", m: ["Pectoraux"], s: ["Triceps", "Épaules"], eq: ["pdc"], cat: "muscu", d: 3, desc: "Pompes très larges où tu descends d'un côté, un bras plié et l'autre tendu, pour surcharger un pectoral à la fois." },
  { n: "Dips", m: ["Pectoraux"], s: ["Triceps", "Épaules"], eq: ["pdc", "trx"], cat: "muscu", d: 3, lest: 1, desc: "Entre deux barres parallèles, buste légèrement penché, descends jusqu'à ce que les épaules passent sous les coudes puis remonte." },
  { n: "Pull-over", m: ["Pectoraux"], s: ["Dos", "Triceps"], eq: ["halt", "poulie", "barre"], cat: "muscu", d: 2, desc: "Allongé perpendiculaire au banc, descends la charge derrière la tête bras quasi tendus puis ramène au-dessus de la poitrine." },
  { n: "Développé assis à la machine", m: ["Pectoraux"], s: ["Triceps", "Épaules"], eq: ["mach", "elas"], cat: "muscu", d: 1, desc: "Assis dos calé, pousse les poignées vers l'avant sans décoller les omoplates du dossier, reviens lentement." },

  /* ---------- DOS ---------- */
  { n: "Tractions pronation", m: ["Dos"], s: ["Biceps", "Avant-bras"], eq: ["pdc", "elas"], cat: "muscu", d: 3, grip: 1, lest: 1, desc: "Suspendu à la barre paumes vers l'avant, tire la poitrine vers la barre en descendant les omoplates, puis contrôle la descente." },
  { n: "Tractions supination", m: ["Dos"], s: ["Biceps"], eq: ["pdc", "elas"], cat: "muscu", d: 3, lest: 1, desc: "Suspendu paumes vers toi, monte le menton au-dessus de la barre en engageant dos et biceps." },
  { n: "Rowing barre buste penché", m: ["Dos"], s: ["Biceps", "Lombaires"], eq: ["barre", "smith", "elas"], cat: "muscu", d: 2, grip: 1, desc: "Buste penché à ~45°, dos plat, tire la barre vers le nombril en serrant les omoplates." },
  { n: "Rowing haltère un bras", m: ["Dos"], s: ["Biceps"], eq: ["halt", "kb"], cat: "muscu", d: 2, desc: "Un genou et une main sur le banc, tire l'haltère vers la hanche en gardant le dos neutre." },
  { n: "Rowing T-bar", m: ["Dos"], s: ["Biceps", "Lombaires"], eq: ["barre", "mach"], cat: "muscu", d: 2, desc: "À califourchon au-dessus de la barre, tire la charge vers la poitrine en serrant le haut du dos." },
  { n: "Tirage vertical poulie", m: ["Dos"], s: ["Biceps"], eq: ["poulie", "mach", "elas"], cat: "muscu", d: 1, grip: 1, desc: "Assis face à la poulie haute, tire la barre vers le haut de la poitrine en descendant les coudes vers les poches." },
  { n: "Tirage horizontal assis", m: ["Dos"], s: ["Biceps"], eq: ["poulie", "mach", "elas"], cat: "muscu", d: 1, grip: 1, desc: "Assis face à la poulie basse, tire la poignée vers le ventre en gardant le buste droit et la poitrine sortie." },
  { n: "Pull-over bras tendus à la poulie", m: ["Dos"], s: ["Triceps"], eq: ["poulie", "elas"], cat: "muscu", d: 2, desc: "Debout face à la poulie haute, bras tendus, ramène la barre vers les cuisses en contractant les dorsaux." },
  { n: "Rowing inversé", m: ["Dos"], s: ["Biceps", "Abdominaux"], eq: ["pdc", "trx"], cat: "muscu", d: 2, elev: 1, lest: 1, desc: "Suspendu sous une barre basse, corps gainé, tire la poitrine vers la barre puis redescends lentement." },
  { n: "Face pull", m: ["Épaules", "Dos"], s: ["Trapèzes"], eq: ["poulie", "elas"], cat: "muscu", d: 1, desc: "Tire la corde vers ton visage coudes hauts, en écartant les mains de chaque côté de la tête : excellent pour la posture." },
  { n: "Shrugs", m: ["Trapèzes"], s: ["Avant-bras"], eq: ["barre", "halt", "smith", "mach"], cat: "muscu", d: 1, desc: "Debout charge en mains, hausse les épaules le plus haut possible, marque une pause puis redescends lentement." },
  { n: "Soulevé de terre", m: ["Dos", "Ischio-jambiers", "Fessiers"], s: ["Lombaires", "Trapèzes", "Avant-bras"], eq: ["barre", "halt", "kb"], cat: "muscu", d: 3, desc: "Pieds sous la barre, dos plat, pousse le sol avec les jambes puis redresse-toi en verrouillant les hanches." },
  { n: "Rack pull", m: ["Dos", "Trapèzes"], s: ["Lombaires", "Avant-bras"], eq: ["barre", "smith"], cat: "muscu", d: 2, desc: "Soulevé de terre partiel depuis des supports à hauteur de genoux : permet de charger lourd en sécurité." },
  { n: "Hyperextensions", m: ["Lombaires"], s: ["Fessiers", "Ischio-jambiers"], eq: ["banc", "pdc"], cat: "muscu", d: 1, lest: 1, desc: "Sur le banc à lombaires, descends le buste puis remonte à l'horizontale sans hyper-étendre le dos." },

  /* ---------- ÉPAULES ---------- */
  { n: "Développé militaire debout", m: ["Épaules"], s: ["Triceps", "Abdominaux"], eq: ["barre", "halt", "kb", "elas", "smith"], cat: "muscu", d: 2, desc: "Debout, gainé, pousse la charge au-dessus de la tête jusqu'à l'extension complète, sans cambrer." },
  { n: "Développé assis haltères", m: ["Épaules"], s: ["Triceps"], eq: ["halt", "mach", "smith"], cat: "muscu", d: 2, desc: "Assis dos calé, pousse les haltères au-dessus de la tête puis redescends jusqu'aux oreilles." },
  { n: "Développé Arnold", m: ["Épaules"], s: ["Triceps"], eq: ["halt"], cat: "muscu", d: 2, desc: "Paumes vers toi en bas, fais pivoter les poignets pendant la montée pour finir paumes vers l'avant." },
  { n: "Élévations latérales", m: ["Épaules"], s: ["Trapèzes"], eq: ["halt", "poulie", "elas", "kb", "mach"], cat: "muscu", d: 1, uni: 1, desc: "Bras quasi tendus, monte les charges sur les côtés jusqu'à l'horizontale, comme pour verser de l'eau." },
  { n: "Élévations frontales", m: ["Épaules"], s: [], eq: ["halt", "barre", "poulie", "elas", "mb"], cat: "muscu", d: 1, uni: 1, desc: "Monte la charge devant toi bras tendus jusqu'à hauteur d'yeux, redescends en contrôlant." },
  { n: "Oiseau buste penché", m: ["Épaules"], s: ["Dos", "Trapèzes"], eq: ["halt", "poulie", "elas"], cat: "muscu", d: 2, uni: 1, desc: "Buste penché dos plat, ouvre les bras sur les côtés en serrant l'arrière des épaules." },
  { n: "Rowing menton", m: ["Épaules", "Trapèzes"], s: ["Biceps"], eq: ["barre", "halt", "poulie", "elas", "smith"], cat: "muscu", d: 2, grip: 1, desc: "Tire la charge le long du corps jusqu'au sternum, coudes au-dessus des mains." },
  { n: "Handstand push-up", m: ["Épaules"], s: ["Triceps", "Abdominaux"], eq: ["pdc"], cat: "muscu", d: 4, desc: "En équilibre contre un mur tête en bas, plie les bras jusqu'à effleurer le sol avec la tête puis repousse." },
  { n: "Pompes piquées", m: ["Épaules"], s: ["Triceps"], eq: ["pdc"], cat: "muscu", d: 2, elev: 1, desc: "En V inversé, hanches hautes, plie les bras pour amener le sommet du crâne vers le sol puis repousse." },
  { n: "Tour du monde", m: ["Épaules"], s: ["Pectoraux", "Trapèzes"], eq: ["halt"], cat: "muscu", d: 2, desc: "Haltères devant les cuisses, fais un grand cercle complet par les côtés jusqu'au-dessus de la tête." },

  /* ---------- BICEPS ---------- */
  { n: "Curl biceps", m: ["Biceps"], s: ["Avant-bras"], eq: ["barre", "halt", "poulie", "elas", "mach"], cat: "muscu", d: 1, uni: 1, grip: 1, desc: "Coudes collés au corps, monte la charge vers les épaules sans balancer le buste, redescends lentement." },
  { n: "Curl marteau", m: ["Biceps"], s: ["Avant-bras"], eq: ["halt", "poulie", "elas"], cat: "muscu", d: 1, uni: 1, desc: "Paumes face à face pendant tout le mouvement : cible le brachial et les avant-bras." },
  { n: "Curl incliné", m: ["Biceps"], s: [], eq: ["halt"], cat: "muscu", d: 2, uni: 1, desc: "Assis sur banc incliné, bras pendants derrière le corps : étirement maximal du biceps à chaque répétition." },
  { n: "Curl concentré", m: ["Biceps"], s: [], eq: ["halt"], cat: "muscu", d: 1, desc: "Assis, coude calé contre l'intérieur de la cuisse, monte l'haltère en isolant totalement le biceps." },
  { n: "Curl au pupitre", m: ["Biceps"], s: ["Avant-bras"], eq: ["barre", "halt", "mach"], cat: "muscu", d: 2, uni: 1, desc: "Bras posés sur le pupitre, monte la charge sans décoller les coudes : impossible de tricher." },
  { n: "Curl araignée", m: ["Biceps"], s: [], eq: ["halt", "barre"], cat: "muscu", d: 2, desc: "Allongé à plat ventre sur banc incliné, bras pendants à la verticale, curl strict avec pic de contraction." },
  { n: "Curl Zottman", m: ["Biceps"], s: ["Avant-bras"], eq: ["halt"], cat: "muscu", d: 2, desc: "Monte en supination, tourne les paumes vers le bas en haut, puis descends en pronation." },
  { n: "Curl à la poulie vis-à-vis", m: ["Biceps"], s: [], eq: ["poulie"], cat: "muscu", d: 2, desc: "Debout entre deux poulies hautes, bras en croix, curl des deux mains vers la tête en double contraction." },

  /* ---------- TRICEPS ---------- */
  { n: "Extension triceps à la poulie", m: ["Triceps"], s: [], eq: ["poulie", "elas"], cat: "muscu", d: 1, uni: 1, grip: 1, desc: "Coudes collés au corps, pousse la poignée vers le bas jusqu'à l'extension complète des bras." },
  { n: "Barre au front", m: ["Triceps"], s: [], eq: ["barre", "halt"], cat: "muscu", d: 2, desc: "Allongé, descends la charge vers le front en pliant uniquement les coudes puis tends les bras." },
  { n: "Extension nuque", m: ["Triceps"], s: [], eq: ["halt", "poulie", "elas", "kb"], cat: "muscu", d: 2, uni: 1, desc: "Charge derrière la tête coudes au ciel, tends les bras vers le haut sans écarter les coudes." },
  { n: "Kickback triceps", m: ["Triceps"], s: [], eq: ["halt", "poulie", "elas"], cat: "muscu", d: 1, desc: "Buste penché, bras le long du corps, tends l'avant-bras vers l'arrière et serre fort en haut." },
  { n: "Dips entre bancs", m: ["Triceps"], s: ["Épaules", "Pectoraux"], eq: ["banc", "pdc"], cat: "muscu", d: 1, elev: 1, lest: 1, desc: "Mains sur un banc derrière toi, plie les bras pour descendre les fesses vers le sol puis repousse." },
  { n: "Pompes diamant", m: ["Triceps"], s: ["Pectoraux"], eq: ["pdc"], cat: "muscu", d: 2, elev: 1, lest: 1, desc: "Pompes mains jointes en losange sous la poitrine : la flexion des coudes cible les triceps." },
  { n: "Développé couché prise serrée", m: ["Triceps"], s: ["Pectoraux", "Épaules"], eq: ["barre", "smith", "halt"], cat: "muscu", d: 2, desc: "Développé couché mains écartées de la largeur des épaules, coudes près du corps." },
  { n: "Extensions triceps au poids du corps", m: ["Triceps"], s: ["Abdominaux"], eq: ["pdc", "trx", "barre"], cat: "muscu", d: 3, desc: "Corps gainé incliné, mains sur une barre basse, plie les coudes pour passer la tête sous la barre puis repousse." },

  /* ---------- AVANT-BRAS ---------- */
  { n: "Curl poignets", m: ["Avant-bras"], s: [], eq: ["barre", "halt"], cat: "muscu", d: 1, desc: "Avant-bras posés sur les cuisses paumes vers le haut, enroule les poignets vers toi." },
  { n: "Extension poignets", m: ["Avant-bras"], s: [], eq: ["barre", "halt"], cat: "muscu", d: 1, desc: "Avant-bras posés paumes vers le bas, relève le dos des mains vers toi." },
  { n: "Marche du fermier", m: ["Avant-bras", "Trapèzes"], s: ["Abdominaux", "Corps entier"], eq: ["halt", "kb", "sac"], cat: "muscu", d: 2, desc: "Une charge lourde dans chaque main, marche droit et gainé sur une distance donnée sans poser." },
  { n: "Suspension à la barre", m: ["Avant-bras"], s: ["Dos", "Épaules"], eq: ["pdc"], cat: "muscu", d: 2, lest: 1, desc: "Suspends-toi à la barre bras tendus le plus longtemps possible : grip, épaules et patience." },

  /* ---------- QUADRICEPS ---------- */
  { n: "Squat", m: ["Quadriceps", "Fessiers"], s: ["Ischio-jambiers", "Lombaires", "Abdominaux"], eq: ["pdc", "barre", "halt", "kb", "smith", "sac"], cat: "muscu", d: 2, lest: 1, desc: "Pieds largeur d'épaules, descends comme pour t'asseoir en gardant le dos droit, cuisses au moins parallèles au sol, puis remonte." },
  { n: "Squat avant", m: ["Quadriceps"], s: ["Fessiers", "Abdominaux"], eq: ["barre", "kb", "halt"], cat: "muscu", d: 3, desc: "Barre posée sur l'avant des épaules coudes hauts : squat très droit qui cible les quadriceps." },
  { n: "Goblet squat", m: ["Quadriceps", "Fessiers"], s: ["Abdominaux"], eq: ["halt", "kb", "mb"], cat: "muscu", d: 1, desc: "Charge tenue contre la poitrine, squat profond en gardant les coudes entre les genoux." },
  { n: "Presse à cuisses", m: ["Quadriceps", "Fessiers"], s: ["Ischio-jambiers"], eq: ["mach"], cat: "muscu", d: 1, uni: 1, desc: "Dos plaqué au dossier, pousse la plateforme sans jamais verrouiller complètement les genoux." },
  { n: "Hack squat", m: ["Quadriceps"], s: ["Fessiers"], eq: ["mach", "barre"], cat: "muscu", d: 2, desc: "Sur la machine inclinée (ou barre derrière les jambes), descends bas puis pousse dans les talons." },
  { n: "Fentes", m: ["Quadriceps", "Fessiers"], s: ["Ischio-jambiers"], eq: ["pdc", "halt", "barre", "kb", "smith", "elas"], cat: "muscu", d: 2, elev: 1, desc: "Grand pas en avant, descends le genou arrière vers le sol puis repousse pour revenir debout." },
  { n: "Fentes marchées", m: ["Quadriceps", "Fessiers"], s: ["Ischio-jambiers", "Abdominaux"], eq: ["pdc", "halt", "barre", "kb"], cat: "muscu", d: 2, desc: "Enchaîne les fentes en avançant à chaque pas, buste droit et regard loin devant." },
  { n: "Squat bulgare", m: ["Quadriceps", "Fessiers"], s: ["Ischio-jambiers"], eq: ["pdc", "halt", "barre", "kb"], cat: "muscu", d: 3, desc: "Pied arrière posé sur un banc, descends sur la jambe avant : brutal et terriblement efficace." },
  { n: "Leg extension", m: ["Quadriceps"], s: [], eq: ["mach", "elas"], cat: "muscu", d: 1, uni: 1, desc: "Assis sur la machine, tends les jambes jusqu'à la contraction complète des quadriceps, redescends lentement." },
  { n: "Pistol squat", m: ["Quadriceps", "Fessiers"], s: ["Abdominaux"], eq: ["pdc", "kb", "box"], cat: "muscu", d: 4, desc: "Squat complet sur une jambe, l'autre tendue devant : équilibre, force et mobilité réunis." },
  { n: "Montées sur box", m: ["Quadriceps", "Fessiers"], s: ["Mollets"], eq: ["box", "banc", "halt", "barre", "kb"], cat: "muscu", d: 1, desc: "Monte sur la box en poussant uniquement avec la jambe d'appui, redescends en contrôlant." },
  { n: "Chaise au mur", m: ["Quadriceps"], s: ["Fessiers"], eq: ["pdc"], cat: "muscu", d: 1, lest: 1, desc: "Dos contre le mur, cuisses parallèles au sol, tiens la position : simple, mais ça brûle." },

  /* ---------- ISCHIO-JAMBIERS ---------- */
  { n: "Soulevé de terre roumain", m: ["Ischio-jambiers", "Fessiers"], s: ["Lombaires"], eq: ["barre", "halt", "kb", "elas", "smith"], cat: "muscu", d: 2, uni: 1, desc: "Jambes quasi tendues, pousse les hanches vers l'arrière en descendant la charge le long des jambes, dos plat." },
  { n: "Soulevé de terre jambes tendues", m: ["Ischio-jambiers"], s: ["Lombaires", "Fessiers"], eq: ["barre", "halt"], cat: "muscu", d: 3, desc: "Variante jambes tendues du soulevé : étirement maximal des ischios, à charger progressivement." },
  { n: "Leg curl allongé", m: ["Ischio-jambiers"], s: [], eq: ["mach", "elas"], cat: "muscu", d: 1, uni: 1, desc: "À plat ventre sur la machine, ramène les talons vers les fesses puis freine le retour." },
  { n: "Leg curl assis", m: ["Ischio-jambiers"], s: [], eq: ["mach"], cat: "muscu", d: 1, uni: 1, desc: "Assis, jambes tendues sur le boudin, fléchis les genoux vers l'arrière en contraction complète." },
  { n: "Leg curl au Swiss ball", m: ["Ischio-jambiers", "Fessiers"], s: ["Abdominaux"], eq: ["sb", "trx"], cat: "muscu", d: 2, desc: "Allongé sur le dos, talons sur le ballon, monte les hanches puis ramène le ballon vers toi." },
  { n: "Good morning", m: ["Ischio-jambiers", "Lombaires"], s: ["Fessiers"], eq: ["barre", "elas", "smith"], cat: "muscu", d: 2, desc: "Barre sur les épaules, penche le buste vers l'avant en poussant les hanches en arrière, dos verrouillé." },
  { n: "Nordic curl", m: ["Ischio-jambiers"], s: [], eq: ["pdc"], cat: "muscu", d: 4, desc: "Genoux au sol, chevilles bloquées, laisse-toi tomber vers l'avant le plus lentement possible en freinant avec les ischios." },

  /* ---------- FESSIERS ---------- */
  { n: "Hip thrust", m: ["Fessiers"], s: ["Ischio-jambiers"], eq: ["barre", "pdc", "halt", "smith", "elas", "mach"], cat: "muscu", d: 2, uni: 1, desc: "Dos en appui sur un banc, charge sur les hanches, monte le bassin jusqu'à l'alignement complet et serre fort en haut." },
  { n: "Pont fessier", m: ["Fessiers"], s: ["Ischio-jambiers", "Lombaires"], eq: ["pdc", "elas", "halt"], cat: "muscu", d: 1, uni: 1, elev: 1, desc: "Allongé au sol genoux pliés, décolle le bassin vers le ciel et contracte les fessiers 2 secondes en haut." },
  { n: "Kickback fessier", m: ["Fessiers"], s: ["Ischio-jambiers"], eq: ["poulie", "elas", "pdc", "mach"], cat: "muscu", d: 1, desc: "À quatre pattes ou debout à la poulie, tends la jambe vers l'arrière et le haut en serrant le fessier." },
  { n: "Abductions de hanche", m: ["Fessiers"], s: [], eq: ["mach", "elas", "poulie", "pdc"], cat: "muscu", d: 1, desc: "Écarte la jambe (ou les deux genoux sur machine) contre la résistance : moyen fessier au rendez-vous." },
  { n: "Fire hydrant", m: ["Fessiers"], s: [], eq: ["pdc", "elas"], cat: "muscu", d: 1, desc: "À quatre pattes, lève le genou sur le côté comme un chien devant une borne, sans tourner le bassin." },
  { n: "Clamshell", m: ["Fessiers"], s: ["Adducteurs"], eq: ["pdc", "elas"], cat: "muscu", d: 1, desc: "Allongé sur le côté genoux pliés, ouvre le genou du dessus comme une coquille sans bouger le bassin." },
  { n: "Soulevé de terre sumo", m: ["Fessiers", "Adducteurs"], s: ["Quadriceps", "Dos"], eq: ["barre", "kb", "halt"], cat: "muscu", d: 3, desc: "Pieds très écartés pointes ouvertes, prise étroite : soulève en poussant le sol vers l'extérieur." },

  /* ---------- ADDUCTEURS ---------- */
  { n: "Adduction à la machine", m: ["Adducteurs"], s: [], eq: ["mach", "elas", "poulie"], cat: "muscu", d: 1, desc: "Assis sur la machine jambes écartées, resserre les genoux contre la résistance puis reviens lentement." },
  { n: "Squat sumo", m: ["Adducteurs", "Fessiers"], s: ["Quadriceps"], eq: ["halt", "kb", "barre", "pdc"], cat: "muscu", d: 2, desc: "Squat pieds très écartés pointes vers l'extérieur : l'intérieur des cuisses travaille dur." },
  { n: "Copenhagen plank", m: ["Adducteurs"], s: ["Abdominaux"], eq: ["banc", "pdc"], cat: "muscu", d: 3, desc: "Planche latérale avec le pied du dessus posé sur un banc, la jambe du bas dans le vide : adducteurs en acier." },

  /* ---------- MOLLETS ---------- */
  { n: "Extensions mollets debout", m: ["Mollets"], s: [], eq: ["pdc", "halt", "barre", "mach", "smith"], cat: "muscu", d: 1, uni: 1, elev: 1, desc: "Monte sur la pointe des pieds le plus haut possible, pause en haut, puis redescends lentement." },
  { n: "Extensions mollets assis", m: ["Mollets"], s: [], eq: ["mach", "halt", "barre"], cat: "muscu", d: 1, desc: "Assis charge sur les genoux, monte sur les pointes : cible le soléaire sous le jumeau." },
  { n: "Mollets à la presse", m: ["Mollets"], s: [], eq: ["mach"], cat: "muscu", d: 1, uni: 1, desc: "Sur la presse à cuisses, pousse la plateforme uniquement avec les pointes de pieds." },
  { n: "Mollets donkey", m: ["Mollets"], s: [], eq: ["pdc", "mach"], cat: "muscu", d: 2, lest: 1, desc: "Buste penché en appui, extension des mollets avec un grand étirement en bas du mouvement." },

  /* ---------- ABDOS / CORE ---------- */
  { n: "Crunch", m: ["Abdominaux"], s: [], eq: ["pdc", "poulie", "mach", "sb"], cat: "muscu", d: 1, lest: 1, desc: "Allongé genoux pliés, enroule le buste pour décoller les omoplates, souffle en montant." },
  { n: "Sit-up", m: ["Abdominaux"], s: [], eq: ["pdc", "mb"], cat: "muscu", d: 1, lest: 1, desc: "Allongé, remonte le buste complet jusqu'à la position assise puis redescends vertèbre par vertèbre." },
  { n: "Crunch bicyclette", m: ["Abdominaux"], s: [], eq: ["pdc"], cat: "muscu", d: 1, desc: "Coude vers le genou opposé en pédalant : les obliques adorent, la nuque reste détendue." },
  { n: "Relevé de genoux suspendu", m: ["Abdominaux"], s: ["Avant-bras"], eq: ["pdc"], cat: "muscu", d: 2, desc: "Suspendu à la barre, ramène les genoux vers la poitrine sans balancer." },
  { n: "Relevé de jambes suspendu", m: ["Abdominaux"], s: ["Avant-bras"], eq: ["pdc"], cat: "muscu", d: 3, lest: 1, desc: "Suspendu à la barre, monte les jambes tendues à l'horizontale ou plus haut, en contrôlant la descente." },
  { n: "Toes to bar", m: ["Abdominaux"], s: ["Dos", "Avant-bras"], eq: ["pdc"], cat: "muscu", d: 4, desc: "Suspendu à la barre, amène les pointes de pieds jusqu'à toucher la barre." },
  { n: "Planche", m: ["Abdominaux"], s: ["Lombaires", "Épaules"], eq: ["pdc", "sb"], cat: "muscu", d: 1, lest: 1, elev: 1, desc: "En appui sur les avant-bras et les pointes de pieds, corps parfaitement aligné : ne laisse pas tomber les hanches." },
  { n: "Planche latérale", m: ["Abdominaux"], s: ["Fessiers"], eq: ["pdc"], cat: "muscu", d: 2, lest: 1, elev: 1, desc: "En appui sur un avant-bras, corps de profil aligné des pieds à la tête : les obliques tiennent la baraque." },
  { n: "Planche avec touches d'épaules", m: ["Abdominaux"], s: ["Épaules"], eq: ["pdc"], cat: "muscu", d: 2, desc: "En planche haute, touche l'épaule opposée avec une main sans balancer les hanches." },
  { n: "Mountain climbers", m: ["Abdominaux"], s: ["Épaules", "Cardio"], eq: ["pdc", "trx", "sb"], cat: "muscu", d: 1, desc: "En planche haute, ramène les genoux vers la poitrine en alternance rapide, hanches basses." },
  { n: "Russian twist", m: ["Abdominaux"], s: [], eq: ["pdc", "mb", "halt", "kb"], cat: "muscu", d: 2, desc: "Assis en équilibre buste incliné, tourne le buste d'un côté à l'autre, pieds décollés pour les braves." },
  { n: "Roue abdominale", m: ["Abdominaux"], s: ["Lombaires", "Épaules"], eq: ["roue", "sb", "trx"], cat: "muscu", d: 3, desc: "À genoux, roule vers l'avant le plus loin possible sans creuser le dos, puis reviens par la force des abdos." },
  { n: "Hollow hold", m: ["Abdominaux"], s: [], eq: ["pdc"], cat: "muscu", d: 2, desc: "Allongé sur le dos, bras et jambes tendus décollés, bas du dos plaqué au sol : position de gymnaste." },
  { n: "Dead bug", m: ["Abdominaux"], s: [], eq: ["pdc", "elas"], cat: "muscu", d: 1, desc: "Sur le dos, étends lentement bras et jambe opposés sans décoller les lombaires du sol." },
  { n: "Bird dog", m: ["Abdominaux", "Lombaires"], s: ["Fessiers"], eq: ["pdc", "elas"], cat: "muscu", d: 1, desc: "À quatre pattes, tends bras et jambe opposés à l'horizontale, marque une pause, reviens sans te déséquilibrer." },
  { n: "V-up", m: ["Abdominaux"], s: [], eq: ["pdc", "mb"], cat: "muscu", d: 3, desc: "Allongé bras derrière la tête, monte simultanément buste et jambes tendues pour former un V." },
  { n: "Dragon flag", m: ["Abdominaux"], s: ["Lombaires", "Dos"], eq: ["pdc"], cat: "muscu", d: 4, desc: "Épaules en appui sur le banc, corps tendu comme une planche, monte et descends sans casser l'alignement. Signé Bruce Lee." },
  { n: "Superman", m: ["Lombaires"], s: ["Fessiers", "Dos"], eq: ["pdc"], cat: "muscu", d: 1, desc: "À plat ventre, décolle simultanément bras et jambes du sol, tiens 2 secondes puis relâche." },

  /* ---------- CARDIO ---------- */
  { n: "Course à pied", m: ["Cardio"], s: ["Quadriceps", "Mollets", "Ischio-jambiers"], eq: ["pdc", "tapis"], cat: "cardio", d: 2, desc: "Course en extérieur ou sur tapis : cadence régulière, épaules relâchées, regarde loin devant." },
  { n: "Marche rapide", m: ["Cardio"], s: ["Quadriceps", "Mollets"], eq: ["pdc", "tapis"], cat: "cardio", d: 1, desc: "Marche soutenue bras actifs : le cardio accessible à tous, tous les jours." },
  { n: "Marche en pente", m: ["Cardio"], s: ["Fessiers", "Mollets"], eq: ["tapis", "pdc"], cat: "cardio", d: 2, desc: "Tapis incliné à 10-15 % ou côte en extérieur : le cardio qui muscle les jambes sans impact." },
  { n: "Vélo", m: ["Cardio"], s: ["Quadriceps", "Mollets"], eq: ["velo"], cat: "cardio", d: 1, desc: "Pédale à cadence régulière (80-90 tr/min), résistance adaptée à ta zone de travail." },
  { n: "Elliptique", m: ["Cardio"], s: ["Corps entier"], eq: ["ellip"], cat: "cardio", d: 1, desc: "Mouvement complet sans impact : pousse aussi avec les bras pour engager tout le corps." },
  { n: "Rameur", m: ["Cardio"], s: ["Dos", "Quadriceps", "Biceps"], eq: ["rameur"], cat: "cardio", d: 2, desc: "Ordre du coup de rame : jambes, puis buste, puis bras — et l'inverse au retour." },
  { n: "Air bike", m: ["Cardio"], s: ["Corps entier"], eq: ["abike"], cat: "cardio", d: 3, desc: "Bras et jambes en même temps : la machine la plus honnête de la salle, elle rend chaque watt." },
  { n: "SkiErg", m: ["Cardio"], s: ["Dos", "Triceps", "Abdominaux"], eq: ["ski"], cat: "cardio", d: 2, desc: "Tire les poignées vers le bas comme un skieur de fond, en engageant les abdos à chaque coup." },
  { n: "Corde à sauter", m: ["Cardio"], s: ["Mollets", "Épaules"], eq: ["corde"], cat: "cardio", d: 2, desc: "Petits sauts sur la pointe des pieds, coudes près du corps, la corde tourne avec les poignets." },
  { n: "Burpees", m: ["Cardio", "Corps entier"], s: ["Pectoraux", "Quadriceps"], eq: ["pdc"], cat: "cardio", d: 3, desc: "Squat, planche, pompe, saut : le 4-en-1 le plus détesté et le plus efficace du monde." },
  { n: "Jumping jacks", m: ["Cardio"], s: ["Épaules", "Mollets"], eq: ["pdc"], cat: "cardio", d: 1, desc: "Saute en écartant bras et jambes puis referme : l'échauffement classique qui monte le cœur en douceur." },
  { n: "Montées de genoux", m: ["Cardio"], s: ["Abdominaux", "Quadriceps"], eq: ["pdc"], cat: "cardio", d: 1, desc: "Cours sur place en montant les genoux à hauteur de hanches, bras dynamiques." },
  { n: "Sprint", m: ["Cardio"], s: ["Quadriceps", "Ischio-jambiers", "Fessiers"], eq: ["pdc", "tapis"], cat: "cardio", d: 3, desc: "Effort maximal sur 10 à 30 secondes : échauffe-toi sérieusement avant." },
  { n: "Montées d'escaliers", m: ["Cardio"], s: ["Quadriceps", "Fessiers", "Mollets"], eq: ["pdc", "mach"], cat: "cardio", d: 2, desc: "Monte les marches en poussant dans les talons ; deux par deux pour les fessiers." },
  { n: "Natation", m: ["Cardio", "Corps entier"], s: ["Dos", "Épaules"], eq: ["piscine"], cat: "cardio", d: 2, desc: "Crawl, brasse ou dos : le cardio le plus complet et le plus doux pour les articulations." },
  { n: "Shadow boxing", m: ["Cardio"], s: ["Épaules", "Abdominaux"], eq: ["pdc", "halt"], cat: "cardio", d: 1, desc: "Enchaîne jabs, crochets et esquives dans le vide, léger sur les appuis, garde en place." },

  /* ---------- FONCTIONNEL / CORPS ENTIER ---------- */
  { n: "Swing kettlebell", m: ["Fessiers", "Ischio-jambiers"], s: ["Lombaires", "Épaules", "Cardio"], eq: ["kb", "halt"], cat: "fonctionnel", d: 2, uni: 1, desc: "Balance la kettlebell entre les jambes puis projette-la à hauteur de poitrine par une extension explosive des hanches." },
  { n: "Clean & press", m: ["Corps entier"], s: ["Épaules", "Quadriceps", "Dos"], eq: ["barre", "halt", "kb", "sac"], cat: "fonctionnel", d: 3, uni: 1, desc: "Amène la charge du sol aux épaules d'un mouvement explosif, puis pousse-la au-dessus de la tête." },
  { n: "Snatch", m: ["Corps entier"], s: ["Épaules", "Fessiers", "Dos"], eq: ["kb", "halt", "barre"], cat: "fonctionnel", d: 4, desc: "Du sol au-dessus de la tête en un seul mouvement explosif : technique d'abord, charge ensuite." },
  { n: "Thruster", m: ["Corps entier"], s: ["Quadriceps", "Épaules"], eq: ["barre", "halt", "kb"], cat: "fonctionnel", d: 3, desc: "Squat avant enchaîné directement avec un développé au-dessus de la tête : le combo qui essouffle." },
  { n: "Turkish get-up", m: ["Corps entier"], s: ["Épaules", "Abdominaux"], eq: ["kb", "halt"], cat: "fonctionnel", d: 4, desc: "Du sol à debout en gardant la charge au-dessus de la tête bras tendu : lentement, étape par étape." },
  { n: "Wall ball", m: ["Corps entier"], s: ["Quadriceps", "Épaules"], eq: ["mb"], cat: "fonctionnel", d: 2, desc: "Squat puis lance le ballon contre le mur au-dessus d'une cible, rattrape-le et enchaîne." },
  { n: "Man maker", m: ["Corps entier"], s: ["Pectoraux", "Dos", "Épaules"], eq: ["halt"], cat: "fonctionnel", d: 4, desc: "Pompe sur haltères + rowing de chaque bras + clean + développé : une répétition qui vaut une séance." },
  { n: "Devil press", m: ["Corps entier"], s: ["Épaules", "Cardio"], eq: ["halt"], cat: "fonctionnel", d: 4, desc: "Burpee sur haltères puis snatch double directement au-dessus de la tête. Diaboliquement efficace." },
  { n: "Box jump", m: ["Quadriceps", "Fessiers"], s: ["Mollets", "Cardio"], eq: ["box"], cat: "fonctionnel", d: 2, desc: "Saute pieds joints sur la box, réception souple genoux fléchis, redescends en marchant." },
  { n: "Bear crawl", m: ["Corps entier"], s: ["Épaules", "Abdominaux"], eq: ["pdc"], cat: "fonctionnel", d: 2, desc: "Marche à quatre pattes genoux décollés à 2 cm du sol, dos plat, en avant puis en arrière." },
  { n: "Poussée de traîneau", m: ["Corps entier"], s: ["Quadriceps", "Fessiers", "Cardio"], eq: ["sled"], cat: "fonctionnel", d: 3, desc: "Pousse le traîneau chargé bras tendus, pas puissants, buste incliné vers l'avant." },
  { n: "Battle ropes", m: ["Épaules", "Cardio"], s: ["Abdominaux", "Avant-bras"], eq: ["rope"], cat: "fonctionnel", d: 2, desc: "Fais onduler les cordes en vagues alternées ou simultanées, genoux fléchis, gainage constant." },
  { n: "Portés de sandbag", m: ["Corps entier"], s: ["Dos", "Avant-bras"], eq: ["sac"], cat: "fonctionnel", d: 2, desc: "Porte le sac contre la poitrine ou sur l'épaule sur une distance donnée : force utile dans la vraie vie." },
  { n: "Wall walk", m: ["Épaules", "Abdominaux"], s: ["Pectoraux"], eq: ["pdc"], cat: "fonctionnel", d: 3, desc: "Depuis la planche pieds au mur, marche avec les mains vers le mur jusqu'à la verticale, puis reviens." },

  /* ---------- MOBILITÉ / ÉTIREMENTS ---------- */
  { n: "Étirement des ischio-jambiers debout", m: ["Mobilité"], s: ["Ischio-jambiers"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Talon posé devant toi jambe tendue, penche le buste dos plat jusqu'à sentir l'arrière de la cuisse." },
  { n: "Étirement du quadriceps debout", m: ["Mobilité"], s: ["Quadriceps"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Debout, attrape ta cheville derrière toi et amène le talon vers la fesse, genoux serrés." },
  { n: "Figure 4 allongé", m: ["Mobilité"], s: ["Fessiers"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Sur le dos, cheville posée sur le genou opposé, ramène la cuisse vers toi : le piriforme dit merci." },
  { n: "Papillon", m: ["Mobilité"], s: ["Adducteurs"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Assis plantes de pieds l'une contre l'autre, laisse descendre les genoux vers le sol, dos long." },
  { n: "Fente basse du psoas", m: ["Mobilité"], s: ["Quadriceps", "Fessiers"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "En fente genou arrière au sol, avance le bassin vers l'avant jusqu'à l'étirement du pli de la hanche." },
  { n: "Chat-vache", m: ["Mobilité"], s: ["Lombaires", "Dos"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "À quatre pattes, alterne dos rond (chat) et dos creux (vache) au rythme de la respiration." },
  { n: "Cobra", m: ["Mobilité"], s: ["Abdominaux", "Lombaires"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "À plat ventre, pousse sur les mains pour redresser le buste, hanches au sol, regard vers l'avant." },
  { n: "Chien tête en bas", m: ["Mobilité"], s: ["Ischio-jambiers", "Mollets", "Épaules"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "En V inversé, pousse le sol avec les mains, talons vers le sol, dos long : tout l'arrière du corps s'étire." },
  { n: "Pigeon", m: ["Mobilité"], s: ["Fessiers"], eq: ["pdc"], cat: "mobilite", d: 2, desc: "Une jambe pliée devant, l'autre tendue derrière, penche le buste vers l'avant sur la jambe avant." },
  { n: "Étirement des pectoraux au mur", m: ["Mobilité"], s: ["Pectoraux", "Épaules"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Avant-bras contre le cadre de porte coude à 90°, tourne doucement le buste du côté opposé." },
  { n: "Étirement d'épaule croisé", m: ["Mobilité"], s: ["Épaules"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Amène un bras tendu devant la poitrine et plaque-le contre toi avec l'autre bras." },
  { n: "Étirement du triceps nuque", m: ["Mobilité"], s: ["Triceps"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Coude au ciel, main derrière la nuque, pousse doucement le coude avec l'autre main." },
  { n: "Rotations thoraciques", m: ["Mobilité"], s: ["Dos"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "À quatre pattes, main derrière la tête, ouvre le coude vers le ciel en suivant du regard." },
  { n: "Cercles de bras", m: ["Mobilité"], s: ["Épaules"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Grands cercles de bras vers l'avant puis vers l'arrière, en augmentant l'amplitude progressivement." },
  { n: "Cercles de hanches", m: ["Mobilité"], s: ["Fessiers", "Adducteurs"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Mains sur les hanches, dessine de grands cercles avec le bassin dans les deux sens." },
  { n: "Balancements de jambes", m: ["Mobilité"], s: ["Ischio-jambiers", "Adducteurs"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "En appui sur un support, balance la jambe d'avant en arrière puis de gauche à droite, de plus en plus haut." },
  { n: "World's greatest stretch", m: ["Mobilité"], s: ["Corps entier"], eq: ["pdc"], cat: "mobilite", d: 2, desc: "Grande fente, main au sol, rotation du buste bras vers le ciel : le meilleur étirement du monde porte bien son nom." },
  { n: "Squat profond maintenu", m: ["Mobilité"], s: ["Fessiers", "Adducteurs", "Mollets"], eq: ["pdc"], cat: "mobilite", d: 2, desc: "Descends en squat complet talons au sol et reste en bas, coudes qui poussent les genoux vers l'extérieur." },
  { n: "Étirement des mollets au mur", m: ["Mobilité"], s: ["Mollets"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Mains au mur, jambe arrière tendue talon au sol, avance le bassin jusqu'à l'étirement du mollet." },
  { n: "Posture de l'enfant", m: ["Mobilité"], s: ["Dos", "Lombaires"], eq: ["pdc"], cat: "mobilite", d: 1, desc: "Assis sur les talons, front au sol, bras allongés devant : respire profondément et relâche tout." }
];

/* Variantes universelles (musculation & fonctionnel) */
const MODS_FORCE = [
  { n: "", note: "Exécution standard, contrôlée sur toute l'amplitude.", d: 0 },
  { n: "Tempo 3-0-3", note: "3 s de descente, 3 s de montée : plus de temps sous tension, moins de charge.", d: 1 },
  { n: "Tempo 4-0-1", note: "Descente très lente en 4 s puis montée dynamique en 1 s.", d: 1 },
  { n: "Excentrique 5 s", note: "Freine la phase de descente pendant 5 s complètes : les courbatures sont incluses.", d: 1 },
  { n: "Pause 2 s", note: "Marque une pause stricte de 2 s au point le plus difficile du mouvement.", d: 1 },
  { n: "Explosif", note: "Phase de poussée la plus rapide possible, descente toujours contrôlée.", d: 1 },
  { n: "Isométrique", note: "Tiens la position intermédiaire 20 à 40 s sans bouger d'un millimètre.", d: 1 },
  { n: "1,5 répétition", note: "Une répétition complète + une demi-répétition = une seule rep. Oui, c'est long.", d: 1 },
  { n: "Partiel bas", note: "Travaille uniquement la moitié basse de l'amplitude, là où c'est le plus dur.", d: 0 },
  { n: "Partiel haut", note: "Travaille uniquement la moitié haute de l'amplitude, idéal pour surcharger.", d: 0 },
  { n: "Séries 21", note: "7 reps en bas + 7 reps en haut + 7 reps complètes, sans reposer la charge.", d: 1 },
  { n: "Drop set", note: "À l'échec, réduis la charge d'environ 20 % et continue immédiatement.", d: 2 },
  { n: "Rest-pause", note: "À l'échec, 15 s de repos, puis repars. Répète 2 à 3 fois.", d: 2 },
  { n: "Myo-reps", note: "Série d'activation proche de l'échec, puis mini-séries de 3 à 5 reps avec 5 respirations de repos.", d: 2 },
  { n: "Cluster set", note: "Découpe ta série en mini-blocs de 2-3 reps avec 15 s de repos entre chaque : plus de reps lourdes.", d: 2 },
  { n: "Pic de contraction", note: "Serre le muscle 1 à 2 s au sommet de chaque répétition, comme pour une photo.", d: 0 }
];

/* Variantes conditionnelles */
const MOD_UNI = { n: "Unilatéral", note: "Travaille un seul côté à la fois pour corriger les déséquilibres gauche/droite.", d: 1 };
const MODS_GRIP = [
  { n: "Prise serrée", note: "Mains rapprochées : l'accent se déplace vers le centre / les bras.", d: 0 },
  { n: "Prise large", note: "Mains très écartées : amplitude réduite mais étirement accru.", d: 0 },
  { n: "Prise neutre", note: "Paumes face à face : souvent plus confortable pour les épaules et les coudes.", d: 0 },
  { n: "Prise inversée", note: "Paumes retournées : change complètement le recrutement musculaire.", d: 1 }
];
const MODS_ELEV = [
  { n: "Surélevé", note: "Pieds ou appuis surélevés pour augmenter la difficulté et changer l'angle.", d: 1 },
  { n: "Déficit", note: "Appui surélevé sous les mains/pieds pour augmenter l'amplitude du mouvement.", d: 1 }
];
const MOD_LEST = { n: "Lesté", note: "Ajoute un gilet lesté, une chaîne ou un disque pour augmenter la résistance.", d: 1 };

/* Variantes cardio */
const MODS_CARDIO = [
  { n: "", note: "Allure régulière et confortable, tu dois pouvoir parler en phrases courtes.", d: 0 },
  { n: "Intervalles 30/30", note: "30 s rapide / 30 s lent, à répéter 8 à 16 fois.", d: 1 },
  { n: "Intervalles 20/40", note: "20 s très rapide / 40 s de récupération active.", d: 1 },
  { n: "Pyramide", note: "Efforts de 30 s, 1 min, 2 min, 1 min, 30 s avec récupération égale.", d: 1 },
  { n: "Sprints courts", note: "Efforts maximaux de 10 à 20 s, récupération complète entre chaque.", d: 2 },
  { n: "Endurance zone 2", note: "Longue durée à intensité faible (60-70 % FC max) : la base de tout cardio.", d: 0 },
  { n: "Fartlek", note: "Jeu d'allures libre : accélère à un lampadaire, ralentis au suivant.", d: 1 },
  { n: "Résistance / côtes", note: "Ajoute de la pente ou de la résistance pour muscler l'effort.", d: 1 }
];

/* Variantes mobilité */
const MODS_MOB = [
  { n: "", note: "Maintiens 20 à 30 s en respirant calmement, sans à-coups.", d: 0 },
  { n: "Maintien 60 s", note: "Tiens la position une minute complète : l'étirement commence vraiment après 30 s.", d: 1 },
  { n: "PNF contracté-relâché", note: "Contracte le muscle 5 s contre résistance, relâche, puis gagne en amplitude.", d: 1 },
  { n: "Version dynamique", note: "Entre et sors doucement de la position 10 à 15 fois au lieu de tenir.", d: 0 },
  { n: "Amplitude progressive", note: "3 paliers de 20 s en allant chaque fois un peu plus loin.", d: 0 }
];

/* Génération de la base complète */
function buildExercises() {
  const out = [];
  let id = 0;
  for (const b of BASES) {
    let mods;
    if (b.cat === "cardio") mods = MODS_CARDIO;
    else if (b.cat === "mobilite") mods = MODS_MOB;
    else {
      mods = MODS_FORCE.slice();
      if (b.uni) mods.push(MOD_UNI);
      if (b.grip) mods = mods.concat(MODS_GRIP);
      if (b.elev) mods = mods.concat(MODS_ELEV);
    }
    for (const eq of b.eq) {
      let emods = mods;
      if (b.lest && eq === "pdc" && b.cat !== "cardio" && b.cat !== "mobilite") emods = mods.concat([MOD_LEST]);
      for (const mod of emods) {
        const eqLabel = b.eq.length > 1 ? " (" + EQUIP[eq].toLowerCase() + ")" : "";
        out.push({
          id: id++,
          n: b.n + eqLabel + (mod.n ? " · " + mod.n : ""),
          base: b.n,
          m: b.m,
          s: b.s || [],
          eq: eq,
          cat: b.cat,
          d: Math.min(5, Math.max(1, b.d + mod.d)),
          desc: b.desc,
          note: mod.note
        });
      }
    }
  }
  return out;
}

const CX_DB = {
  EQUIP: EQUIP,
  MUSCLES: MUSCLES,
  CATS: CATS,
  BASES: BASES,
  EXOS: buildExercises()
};

if (typeof window !== "undefined") window.CX_DB = CX_DB;
if (typeof module !== "undefined" && module.exports) module.exports = CX_DB;

})();
