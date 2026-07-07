/* =========================================================
   CAILLOUX — Application
   SPA vanilla JS, données 100 % locales (localStorage).
   ========================================================= */
"use strict";

/* ================= Helpers ================= */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return d + "/" + m + "/" + y; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; };

let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

let audioCtx = null;
function beep(freq, dur, when) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = freq || 880; o.type = "sine";
    const t0 = audioCtx.currentTime + (when || 0);
    g.gain.setValueAtTime(0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + (dur || 0.15));
    o.start(t0); o.stop(t0 + (dur || 0.15) + 0.05);
  } catch (e) { /* audio indisponible : tant pis */ }
}

/* seeded rng (WOD du jour) */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function dateSeed() { return parseInt(todayStr().replace(/-/g, ""), 10); }

/* ================= État ================= */
const DEFAULT_STATE = {
  settings: { name: "", unit: "kg", theme: "dark", objectif: "forme", sexe: "h", age: "", poids: "", taille: "", activite: "1.55" },
  favs: [],
  workouts: [],
  history: [],
  prs: {},
  weightLog: [],
  measures: [],
  waterLog: {},
  foodLog: {},
  sleepLog: {},
  challenges: {},
  badges: [],
  draft: null
};
let S;
try { S = Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem("cailloux_state") || "{}")); }
catch (e) { S = JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function save() { localStorage.setItem("cailloux_state", JSON.stringify(S)); }

const DB = window.CX_DB;
const EXOS = DB.EXOS, EQUIP = DB.EQUIP, MUSCLES = DB.MUSCLES, CATS = DB.CATS, BASES = DB.BASES;

const MUSCLE_ICO = {
  "Pectoraux": "🛡️", "Dos": "🧗", "Trapèzes": "⛰️", "Lombaires": "🌉", "Épaules": "🤸",
  "Biceps": "💪", "Triceps": "🦾", "Avant-bras": "✊", "Abdominaux": "🧱",
  "Quadriceps": "🦵", "Ischio-jambiers": "🦿", "Fessiers": "🍑", "Adducteurs": "🤼",
  "Mollets": "🐐", "Corps entier": "🌋", "Cardio": "❤️‍🔥", "Mobilité": "🧘"
};

/* ================= Données statiques ================= */
const QUOTES = [
  "Un caillou après l'autre, tu déplaces des montagnes.",
  "La séance la plus importante, c'est celle que tu ne voulais pas faire.",
  "Le muscle le plus fort du corps, c'est la régularité.",
  "Tu n'as pas besoin d'être extrême, juste constant.",
  "Personne n'a jamais regretté un entraînement terminé.",
  "Ta seule compétition, c'est toi hier.",
  "Les courbatures d'aujourd'hui sont les trophées de demain.",
  "Le sport ne demande pas d'être bon, il demande d'être là.",
  "Rome ne s'est pas faite en un jour, tes pectoraux non plus.",
  "Chaque répétition est un petit caillou posé sur ta montagne.",
  "L'échec d'une série n'est pas un échec, c'est une mesure.",
  "Ce n'est pas la montagne qu'on conquiert, c'est soi-même.",
  "Transpire maintenant, brille plus tard.",
  "Le meilleur moment pour commencer, c'était hier. Le deuxième meilleur, c'est maintenant.",
  "Un corps fort porte un esprit tranquille.",
  "La motivation te fait commencer, l'habitude te fait continuer.",
  "Sois plus têtu que tes excuses.",
  "Petit poids bien bougé vaut mieux que gros poids mal porté.",
  "L'eau use la pierre, la constance use les records.",
  "Ta salle t'attend, pas tes excuses.",
  "On ne compte pas les jours, on fait que les jours comptent.",
  "Le repos fait partie de l'entraînement : même les cailloux se polissent doucement."
];

const MEALS = [
  { n: "Poulet, riz complet & brocolis", kcal: 550, p: 45 },
  { n: "Omelette 3 œufs, épinards & pain complet", kcal: 420, p: 28 },
  { n: "Saumon, patate douce & haricots verts", kcal: 600, p: 38 },
  { n: "Bœuf 5 %, pâtes complètes & sauce tomate", kcal: 620, p: 46 },
  { n: "Skyr, flocons d'avoine, banane & miel", kcal: 430, p: 30 },
  { n: "Tofu sauté, quinoa & légumes croquants", kcal: 520, p: 28 },
  { n: "Thon, riz, maïs & œuf dur (salade complète)", kcal: 480, p: 40 },
  { n: "Wrap poulet crudités & fromage blanc", kcal: 450, p: 35 },
  { n: "Lentilles corail, riz & œuf poché", kcal: 500, p: 26 },
  { n: "Shake : whey, lait, avoine & beurre de cacahuète", kcal: 460, p: 42 },
  { n: "Dinde, semoule complète & ratatouille", kcal: 540, p: 42 },
  { n: "Cottage cheese, fruits rouges & amandes", kcal: 320, p: 26 },
  { n: "Crevettes, nouilles de riz & légumes wok", kcal: 490, p: 32 },
  { n: "Steak de pois chiches, boulgour & salade", kcal: 510, p: 22 },
  { n: "Sardines, pommes de terre vapeur & salade verte", kcal: 470, p: 34 },
  { n: "Porridge avoine, whey & poire", kcal: 400, p: 32 },
  { n: "Chili con carne allégé & riz basmati", kcal: 580, p: 40 },
  { n: "Toast avocat, œufs brouillés & graines", kcal: 440, p: 22 }
];

const BADGES = [
  { id: "b1", e: "🪨", n: "Premier caillou", d: "Termine ta première séance", c: (st) => st.seances >= 1 },
  { id: "b2", e: "🥌", n: "Galet poli", d: "5 séances terminées", c: (st) => st.seances >= 5 },
  { id: "b3", e: "🧱", n: "Pierre taillée", d: "20 séances terminées", c: (st) => st.seances >= 20 },
  { id: "b4", e: "🗿", n: "Monolithe", d: "50 séances terminées", c: (st) => st.seances >= 50 },
  { id: "b5", e: "⛰️", n: "Montagne", d: "100 séances terminées", c: (st) => st.seances >= 100 },
  { id: "b6", e: "🏔️", n: "Everest", d: "250 séances terminées", c: (st) => st.seances >= 250 },
  { id: "b7", e: "🔥", n: "Étincelle", d: "3 jours d'affilée", c: (st) => st.streak >= 3 },
  { id: "b8", e: "🌋", n: "Volcan", d: "7 jours d'affilée", c: (st) => st.streak >= 7 },
  { id: "b9", e: "⚡", n: "Inarrêtable", d: "14 jours d'affilée", c: (st) => st.streak >= 14 },
  { id: "b10", e: "👑", n: "Roi de la constance", d: "30 jours d'affilée", c: (st) => st.streak >= 30 },
  { id: "b11", e: "🏗️", n: "Déménageur", d: "10 000 kg de volume cumulé", c: (st) => st.vol >= 10000 },
  { id: "b12", e: "🚚", n: "Poids lourd", d: "100 000 kg de volume cumulé", c: (st) => st.vol >= 100000 },
  { id: "b13", e: "🌍", n: "Atlas", d: "1 000 000 kg de volume cumulé", c: (st) => st.vol >= 1000000 },
  { id: "b14", e: "📈", n: "Premier record", d: "Bats ton premier record perso", c: (st) => st.prs >= 1 },
  { id: "b15", e: "💪", n: "Collectionneur", d: "5 records personnels", c: (st) => st.prs >= 5 },
  { id: "b16", e: "🦍", n: "Machine", d: "20 records personnels", c: (st) => st.prs >= 20 },
  { id: "b17", e: "🎯", n: "Challenger", d: "Commence un défi 30 jours", c: (st) => st.defisStart >= 1 },
  { id: "b18", e: "🏆", n: "Finisher", d: "Termine un défi 30 jours", c: (st) => st.defisDone >= 1 },
  { id: "b19", e: "⚖️", n: "Suivi sérieux", d: "10 pesées enregistrées", c: (st) => st.pesees >= 10 },
  { id: "b20", e: "💧", n: "Hydraté", d: "7 jours à 8 verres d'eau", c: (st) => st.waterDays >= 7 },
  { id: "b21", e: "⭐", n: "Curateur", d: "10 exercices favoris", c: (st) => st.favs >= 10 },
  { id: "b22", e: "🛠️", n: "Architecte", d: "Crée ta première séance", c: (st) => st.myWorkouts >= 1 },
  { id: "b23", e: "🧰", n: "Bâtisseur", d: "5 séances personnalisées", c: (st) => st.myWorkouts >= 5 },
  { id: "b24", e: "🍎", n: "Nutritionniste", d: "7 jours de journal alimentaire", c: (st) => st.foodDays >= 7 }
];

const CHALLENGES = [
  { id: "pompes", e: "🙌", n: "30 jours de pompes", unit: "pompes", plan: Array.from({ length: 30 }, (_, i) => 5 + i * 2) },
  { id: "squats", e: "🦵", n: "30 jours de squats", unit: "squats", plan: Array.from({ length: 30 }, (_, i) => 15 + i * 3) },
  { id: "gainage", e: "🧱", n: "30 jours de gainage", unit: "secondes", plan: Array.from({ length: 30 }, (_, i) => 20 + i * 5) },
  { id: "burpees", e: "🌋", n: "30 jours de burpees", unit: "burpees", plan: Array.from({ length: 30 }, (_, i) => 5 + Math.ceil(i * 1.5)) },
  { id: "abdos", e: "🎯", n: "30 jours d'abdos", unit: "crunchs", plan: Array.from({ length: 30 }, (_, i) => 15 + i * 3) },
  { id: "fentes", e: "🚶", n: "30 jours de fentes", unit: "fentes/jambe", plan: Array.from({ length: 30 }, (_, i) => 10 + i * 2) }
];

const PROGRAMS = [
  {
    id: "fbdeb", e: "🌱", n: "Départ en douceur", lvl: "Débutant", freq: "3 j/sem",
    d: "Full body 3 jours par semaine pour construire des fondations solides sans se blesser.",
    rest: 90,
    days: [
      { n: "Jour 1 — Corps entier A", items: [["Goblet squat", 3, "12"], ["Pompes", 3, "10"], ["Rowing haltère un bras", 3, "12"], ["Pont fessier", 3, "15"], ["Planche", 3, "30 s"]] },
      { n: "Jour 2 — Corps entier B", items: [["Fentes", 3, "10"], ["Développé assis à la machine", 3, "12"], ["Tirage vertical poulie", 3, "12"], ["Crunch", 3, "15"], ["Superman", 3, "12"]] },
      { n: "Jour 3 — Corps entier C", items: [["Soulevé de terre roumain", 3, "10"], ["Développé couché", 3, "10"], ["Tirage horizontal assis", 3, "12"], ["Mountain climbers", 3, "30 s"], ["Posture de l'enfant", 1, "60 s"]] }
    ]
  },
  {
    id: "ppl", e: "🔺", n: "Push · Pull · Legs", lvl: "Intermédiaire", freq: "3 à 6 j/sem",
    d: "Le split le plus populaire du monde : pousser, tirer, jambes. À faire 1 ou 2 fois par semaine.",
    rest: 90,
    days: [
      { n: "Push — Pectoraux, épaules, triceps", items: [["Développé couché", 4, "8"], ["Développé militaire debout", 3, "10"], ["Développé incliné", 3, "10"], ["Élévations latérales", 3, "15"], ["Extension triceps à la poulie", 3, "12"], ["Pompes diamant", 2, "max"]] },
      { n: "Pull — Dos, biceps", items: [["Soulevé de terre", 3, "5"], ["Tractions pronation", 4, "max"], ["Rowing barre buste penché", 4, "8"], ["Face pull", 3, "15"], ["Curl biceps", 3, "12"], ["Curl marteau", 3, "12"]] },
      { n: "Legs — Jambes complètes", items: [["Squat", 4, "8"], ["Presse à cuisses", 3, "12"], ["Soulevé de terre roumain", 3, "10"], ["Leg curl allongé", 3, "12"], ["Extensions mollets debout", 4, "15"], ["Planche", 3, "45 s"]] }
    ]
  },
  {
    id: "half", e: "➗", n: "Half body haut / bas", lvl: "Intermédiaire", freq: "4 j/sem",
    d: "Deux jours haut du corps, deux jours bas du corps : le meilleur ratio fréquence/récupération.",
    rest: 90,
    days: [
      { n: "Haut A — Force", items: [["Développé couché", 4, "6"], ["Rowing barre buste penché", 4, "6"], ["Développé militaire debout", 3, "8"], ["Tractions pronation", 3, "max"], ["Curl biceps", 3, "10"]] },
      { n: "Bas A — Force", items: [["Squat", 4, "6"], ["Soulevé de terre roumain", 3, "8"], ["Presse à cuisses", 3, "10"], ["Extensions mollets debout", 4, "12"], ["Planche", 3, "45 s"]] },
      { n: "Haut B — Volume", items: [["Développé incliné", 3, "12"], ["Tirage vertical poulie", 3, "12"], ["Élévations latérales", 4, "15"], ["Face pull", 3, "15"], ["Extension triceps à la poulie", 3, "12"], ["Curl marteau", 3, "12"]] },
      { n: "Bas B — Volume", items: [["Fentes marchées", 3, "12"], ["Hip thrust", 4, "12"], ["Leg extension", 3, "15"], ["Leg curl allongé", 3, "15"], ["Extensions mollets assis", 4, "15"]] }
    ]
  },
  {
    id: "force55", e: "🏗️", n: "Force 5×5", lvl: "Tous niveaux", freq: "3 j/sem",
    d: "Le grand classique de la force : 5 séries de 5 sur les mouvements de base, on ajoute du poids chaque séance.",
    rest: 180,
    days: [
      { n: "Séance A", items: [["Squat", 5, "5"], ["Développé couché", 5, "5"], ["Rowing barre buste penché", 5, "5"]] },
      { n: "Séance B", items: [["Squat", 5, "5"], ["Développé militaire debout", 5, "5"], ["Soulevé de terre", 1, "5"]] }
    ]
  },
  {
    id: "maison", e: "🏠", n: "Maison sans matériel", lvl: "Tous niveaux", freq: "3-4 j/sem",
    d: "Zéro équipement, zéro excuse : un programme complet uniquement au poids du corps.",
    rest: 60,
    days: [
      { n: "Jour 1 — Haut du corps", items: [["Pompes", 4, "max"], ["Pompes piquées", 3, "8"], ["Rowing inversé", 3, "10"], ["Dips entre bancs", 3, "12"], ["Planche avec touches d'épaules", 3, "20"]] },
      { n: "Jour 2 — Bas du corps", items: [["Squat", 4, "20"], ["Fentes", 3, "12"], ["Squat bulgare", 3, "10"], ["Pont fessier", 3, "20"], ["Extensions mollets debout", 4, "20"], ["Chaise au mur", 3, "45 s"]] },
      { n: "Jour 3 — Cardio & core", items: [["Burpees", 4, "10"], ["Mountain climbers", 4, "30 s"], ["Jumping jacks", 4, "40 s"], ["Hollow hold", 3, "20 s"], ["Planche latérale", 3, "30 s"], ["V-up", 3, "10"]] }
    ]
  },
  {
    id: "hiit", e: "🔥", n: "HIIT brûle-graisse", lvl: "Intermédiaire", freq: "3 j/sem",
    d: "Des circuits courts et intenses pour un maximum de calories en un minimum de temps.",
    rest: 30,
    days: [
      { n: "Circuit 1 — Feu intégral (4 tours)", items: [["Burpees", 4, "30 s"], ["Squat", 4, "30 s"], ["Mountain climbers", 4, "30 s"], ["Jumping jacks", 4, "30 s"]] },
      { n: "Circuit 2 — Jambes en fusion (4 tours)", items: [["Fentes", 4, "30 s"], ["Montées de genoux", 4, "30 s"], ["Box jump", 4, "30 s"], ["Chaise au mur", 4, "30 s"]] },
      { n: "Circuit 3 — Core en lave (4 tours)", items: [["Sprint", 4, "20 s"], ["Planche avec touches d'épaules", 4, "30 s"], ["Russian twist", 4, "30 s"], ["Bear crawl", 4, "30 s"]] }
    ]
  },
  {
    id: "run5k", e: "🏃", n: "Objectif 5 km", lvl: "Débutant", freq: "3 j/sem · 8 semaines",
    d: "Du canapé aux 5 km : alterne marche et course, augmente la course chaque semaine.",
    rest: 0,
    days: [
      { n: "Semaines 1-2", items: [["Marche rapide", 1, "5 min"], ["Course à pied", 8, "1 min"], ["Marche rapide", 8, "2 min"], ["Étirement des mollets au mur", 1, "60 s"]] },
      { n: "Semaines 3-4", items: [["Marche rapide", 1, "5 min"], ["Course à pied", 6, "3 min"], ["Marche rapide", 6, "2 min"], ["Étirement des ischio-jambiers debout", 1, "60 s"]] },
      { n: "Semaines 5-6", items: [["Marche rapide", 1, "5 min"], ["Course à pied", 3, "8 min"], ["Marche rapide", 3, "2 min"], ["Fente basse du psoas", 1, "60 s"]] },
      { n: "Semaines 7-8", items: [["Marche rapide", 1, "5 min"], ["Course à pied", 1, "25-30 min"], ["Posture de l'enfant", 1, "60 s"]] }
    ]
  },
  {
    id: "abs15", e: "🎯", n: "Abdos d'acier 15 min", lvl: "Tous niveaux", freq: "4-5 j/sem",
    d: "Trois routines de 15 minutes pour un gainage en béton armé, à tourner dans la semaine.",
    rest: 45,
    days: [
      { n: "Routine 1 — Fondations", items: [["Crunch", 3, "15"], ["Dead bug", 3, "10"], ["Planche", 3, "30 s"], ["Bird dog", 3, "10"]] },
      { n: "Routine 2 — Obliques", items: [["Russian twist", 3, "20"], ["Planche latérale", 3, "30 s"], ["Crunch bicyclette", 3, "20"], ["Planche avec touches d'épaules", 3, "16"]] },
      { n: "Routine 3 — Avancée", items: [["V-up", 3, "10"], ["Hollow hold", 3, "20 s"], ["Relevé de genoux suspendu", 3, "10"], ["Roue abdominale", 3, "8"]] }
    ]
  },
  {
    id: "masse", e: "🍖", n: "Prise de masse 5 jours", lvl: "Avancé", freq: "5 j/sem",
    d: "Un split de 5 jours pour maximiser le volume par groupe musculaire. À coupler avec un surplus calorique.",
    rest: 90,
    days: [
      { n: "Jour 1 — Pectoraux", items: [["Développé couché", 4, "8"], ["Développé incliné", 4, "10"], ["Écarté couché", 3, "12"], ["Dips", 3, "max"], ["Pec deck", 3, "15"]] },
      { n: "Jour 2 — Dos", items: [["Soulevé de terre", 3, "5"], ["Tractions pronation", 4, "max"], ["Rowing T-bar", 4, "8"], ["Tirage horizontal assis", 3, "12"], ["Shrugs", 3, "15"]] },
      { n: "Jour 3 — Jambes", items: [["Squat", 4, "8"], ["Presse à cuisses", 4, "10"], ["Soulevé de terre roumain", 3, "10"], ["Leg extension", 3, "12"], ["Leg curl allongé", 3, "12"], ["Extensions mollets debout", 5, "15"]] },
      { n: "Jour 4 — Épaules", items: [["Développé militaire debout", 4, "8"], ["Développé Arnold", 3, "10"], ["Élévations latérales", 4, "15"], ["Oiseau buste penché", 3, "15"], ["Face pull", 3, "15"]] },
      { n: "Jour 5 — Bras", items: [["Curl biceps", 4, "10"], ["Développé couché prise serrée", 4, "8"], ["Curl incliné", 3, "12"], ["Barre au front", 3, "12"], ["Curl marteau", 3, "12"], ["Extension triceps à la poulie", 3, "12"]] }
    ]
  },
  {
    id: "seche", e: "✂️", n: "Sèche & définition", lvl: "Intermédiaire", freq: "4 j/sem",
    d: "Muscu + finisher cardio à chaque séance pour garder le muscle et brûler le gras.",
    rest: 60,
    days: [
      { n: "Jour 1 — Haut + HIIT", items: [["Développé couché", 4, "10"], ["Rowing barre buste penché", 4, "10"], ["Développé militaire debout", 3, "12"], ["Burpees", 5, "30 s"]] },
      { n: "Jour 2 — Bas + sprint", items: [["Squat", 4, "10"], ["Hip thrust", 4, "12"], ["Fentes marchées", 3, "12"], ["Sprint", 6, "20 s"]] },
      { n: "Jour 3 — Full + rameur", items: [["Soulevé de terre roumain", 4, "10"], ["Tractions pronation", 3, "max"], ["Pompes", 3, "max"], ["Rameur", 1, "10 min"]] },
      { n: "Jour 4 — Core + corde", items: [["Planche", 4, "45 s"], ["Russian twist", 4, "20"], ["Relevé de genoux suspendu", 3, "12"], ["Corde à sauter", 5, "1 min"]] }
    ]
  },
  {
    id: "mobil", e: "🧘", n: "Mobilité quotidienne", lvl: "Tous niveaux", freq: "7 j/sem · 10 min",
    d: "Dix minutes par jour pour bouger mieux, réduire les douleurs et vieillir souple.",
    rest: 10,
    days: [
      { n: "Matin — Réveil articulaire", items: [["Chat-vache", 2, "10"], ["Cercles de bras", 2, "10"], ["Cercles de hanches", 2, "10"], ["Chien tête en bas", 2, "30 s"]] },
      { n: "Spécial dos", items: [["Rotations thoraciques", 2, "8"], ["Cobra", 2, "30 s"], ["Posture de l'enfant", 2, "45 s"], ["Étirement des pectoraux au mur", 2, "30 s"]] },
      { n: "Spécial hanches", items: [["Fente basse du psoas", 2, "40 s"], ["Pigeon", 2, "40 s"], ["Papillon", 2, "40 s"], ["Squat profond maintenu", 2, "30 s"]] },
      { n: "Spécial jambes", items: [["Étirement des ischio-jambiers debout", 2, "40 s"], ["Étirement du quadriceps debout", 2, "40 s"], ["Étirement des mollets au mur", 2, "40 s"], ["Balancements de jambes", 2, "10"]] },
      { n: "Routine complète", items: [["World's greatest stretch", 2, "5"], ["Chien tête en bas", 2, "30 s"], ["Figure 4 allongé", 2, "40 s"], ["Posture de l'enfant", 1, "60 s"]] }
    ]
  },
  {
    id: "kb", e: "🔔", n: "Kettlebell intégral", lvl: "Intermédiaire", freq: "3 j/sem",
    d: "Une seule kettlebell suffit pour un corps complet : force, cardio et gainage réunis.",
    rest: 75,
    days: [
      { n: "Jour 1 — Balistique", items: [["Swing kettlebell", 5, "15"], ["Goblet squat", 4, "10"], ["Rowing haltère un bras", 4, "10"], ["Marche du fermier", 3, "30 m"]] },
      { n: "Jour 2 — Force", items: [["Clean & press", 4, "6"], ["Squat avant", 4, "8"], ["Soulevé de terre roumain", 4, "10"], ["Russian twist", 3, "20"]] },
      { n: "Jour 3 — Flow", items: [["Turkish get-up", 4, "2"], ["Snatch", 4, "6"], ["Swing kettlebell", 4, "20"], ["Planche", 3, "45 s"]] }
    ]
  }
];

const FEATURES = [
  "Plus de 5 000 exercices détaillés avec consignes", "Recherche instantanée dans toute la base", "Filtres par muscle, équipement, difficulté et catégorie",
  "Fiches d'exercices avec muscles secondaires", "Exercices favoris", "Exercice surprise aléatoire", "Variantes : tempo, drop set, rest-pause, myo-reps, 21s…",
  "Créateur de séances personnalisées", "Séries, répétitions et repos configurables", "Générateur automatique de séance par groupe musculaire",
  "Mode séance guidée avec validation série par série", "Minuteur de repos automatique avec bips", "Saisie du poids et des reps en direct",
  "Calcul automatique du volume de chaque séance", "Détection automatique des records personnels (1RM estimé)", "Résumé de fin de séance",
  "Duplication de séances", "Notes de séance", "Historique complet des entraînements", "Calendrier mensuel d'activité",
  "12 programmes complets prêts à l'emploi", "Programme débutant full body", "Push Pull Legs", "Half body 4 jours", "Force 5×5",
  "Programme maison sans matériel", "HIIT brûle-graisse", "Plan course Objectif 5 km", "Abdos d'acier 15 minutes", "Prise de masse 5 jours",
  "Sèche & définition", "Mobilité quotidienne", "Kettlebell intégral", "Lancement direct d'un jour de programme",
  "Copie d'un programme dans ses séances", "Suivi du poids corporel avec graphique", "Suivi des mensurations (bras, taille, cuisses…)",
  "Graphique de volume hebdomadaire", "Tableau des records personnels", "Série de jours consécutifs (streak)",
  "Journal de sommeil", "Calculateur de besoins caloriques (TDEE)", "Répartition automatique des macros selon l'objectif",
  "Journal alimentaire quotidien", "Total calories et protéines du jour", "Tracker d'hydratation (verres d'eau)",
  "18 idées de repas riches en protéines", "Calculateur de protéines quotidiennes", "Calculateur d'eau recommandée",
  "Calculateur de 1RM (Epley & Brzycki)", "Tableau des charges par pourcentage du 1RM", "Calculateur de chargement de barre (disques par côté)",
  "Calculateur d'IMC avec interprétation", "Zones de fréquence cardiaque (5 zones)", "Calculateur d'allure de course (min/km et km/h)",
  "Calculateur de calories brûlées par activité (MET)", "Convertisseur kg ↔ lb", "Minuteur Tabata configurable",
  "Minuteur EMOM", "Minuteur AMRAP", "Chronomètre", "Compte à rebours simple", "Bips sonores de changement de phase",
  "WOD du jour généré automatiquement", "Citation motivante quotidienne", "6 défis 30 jours (pompes, squats, gainage, burpees, abdos, fentes)",
  "Progression jour par jour dans les défis", "24 badges à débloquer", "Statistiques globales (séances, volume, records)",
  "Multi-thème sombre / clair", "Unités kg ou lb", "Profil avec objectif personnel", "Export complet des données en JSON",
  "Import de sauvegarde", "Fonctionne hors-ligne une fois chargée", "Aucune inscription, aucune pub, aucune donnée envoyée",
  "Installable sur l'écran d'accueil (PWA)", "Interface responsive mobile et ordinateur", "100 % gratuit, pour toujours"
];

/* ================= Navigation ================= */
const NAV = [
  ["home", "Accueil", "🏠"], ["exos", "Exercices", "💪"], ["seances", "Séances", "🏋️"],
  ["programmes", "Programmes", "📋"], ["suivi", "Suivi", "📈"], ["nutrition", "Nutrition", "🍎"],
  ["outils", "Outils", "🧰"], ["defis", "Défis", "🏆"], ["profil", "Profil", "⚙️"]
];
const NAV_MOBILE = ["home", "exos", "seances", "suivi"];

function navHTML(list, extra) {
  let h = list.map(([id, label, ico]) =>
    `<button class="nav-link" data-nav="${id}" onclick="A.go('${id}')"><span class="ico">${ico}</span>${label}</button>`).join("");
  if (extra) h += `<button class="nav-link" data-nav="plus" onclick="A.moreMenu()"><span class="ico">➕</span>Plus</button>`;
  return h;
}

function markNav(page) {
  document.querySelectorAll(".nav-link").forEach((b) => {
    b.classList.toggle("active", b.dataset.nav === page || (b.dataset.nav === "plus" && !NAV_MOBILE.includes(page) && b.closest("#bottomnav")));
  });
}

/* ================= Router ================= */
let PAGE = "home";
function render() {
  const view = $("#view");
  const pages = {
    home: pHome, exos: pExos, seances: pSeances, programmes: pProgrammes, suivi: pSuivi,
    nutrition: pNutrition, outils: pOutils, defis: pDefis, profil: pProfil, player: pPlayer
  };
  view.innerHTML = (pages[PAGE] || pHome)();
  markNav(PAGE);
  window.scrollTo(0, 0);
  if (PAGE === "suivi") setTimeout(drawSuiviCharts, 0);
  if (PAGE === "home") setTimeout(drawHomeChart, 0);
}

/* ================= Stats dérivées ================= */
function computeStreak() {
  const days = [...new Set(S.history.map((h) => h.d))].sort().reverse();
  if (!days.length) return 0;
  const one = 86400000;
  let cur = new Date(todayStr());
  if (days[0] !== todayStr()) {
    const yest = new Date(cur.getTime() - one);
    const ys = yest.toISOString().slice(0, 10);
    if (days[0] !== ys) return 0;
    cur = yest;
  }
  let streak = 0;
  for (const d of days) {
    const ds = cur.toISOString().slice(0, 10);
    if (d === ds) { streak++; cur = new Date(cur.getTime() - one); }
    else break;
  }
  return streak;
}
function totalVolume() { return S.history.reduce((a, h) => a + (h.vol || 0), 0); }

function checkBadges(silent) {
  const st = {
    seances: S.history.length,
    streak: computeStreak(),
    vol: totalVolume(),
    prs: Object.keys(S.prs).length,
    defisStart: Object.keys(S.challenges).length,
    defisDone: CHALLENGES.filter((c) => S.challenges[c.id] && S.challenges[c.id].done.length >= 30).length,
    pesees: S.weightLog.length,
    waterDays: Object.values(S.waterLog).filter((v) => v >= 8).length,
    favs: S.favs.length,
    myWorkouts: S.workouts.length,
    foodDays: Object.keys(S.foodLog).filter((d) => (S.foodLog[d] || []).length > 0).length
  };
  const news = [];
  for (const b of BADGES) {
    if (!S.badges.includes(b.id) && b.c(st)) { S.badges.push(b.id); news.push(b); }
  }
  if (news.length) {
    save();
    if (!silent) toast("🏅 Badge débloqué : " + news.map((b) => b.e + " " + b.n).join(", "));
  }
  return news;
}

/* ================= Modal ================= */
function openModal(html) {
  const r = $("#modal-root");
  r.innerHTML = `<div class="modal"><div style="position:relative"><button class="x" style="position:absolute;right:-8px;top:-8px" onclick="A.closeModal()">✕</button></div>${html}</div>`;
  r.classList.add("show");
  document.body.style.overflow = "hidden";
}

/* ================= PAGE : Accueil ================= */
function pHome() {
  const name = S.settings.name;
  const streak = computeStreak();
  const vol = totalVolume();
  const quote = QUOTES[dateSeed() % QUOTES.length];
  const water = S.waterLog[todayStr()] || 0;
  const todayFood = (S.foodLog[todayStr()] || []).reduce((a, f) => a + f.kcal, 0);
  const wod = generateWOD();
  const h = new Date().getHours();
  const hello = h < 5 ? "Encore debout" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  return `
  <div class="hero">
    <h1 class="page">${hello}${name ? " " + esc(name) : ""} 👋</h1>
    <p class="muted">Prêt à poser un caillou de plus sur ta montagne ?</p>
    <div class="quote">« ${quote} »</div>
    <div class="row mt">
      <button class="btn" onclick="A.go('seances')">🏋️ Démarrer une séance</button>
      <button class="btn sec" onclick="A.showWOD()">🎲 WOD du jour</button>
      <button class="btn sec" onclick="A.quickWeight()">⚖️ Ajouter mon poids</button>
    </div>
  </div>

  <div class="grid g4 mt">
    <div class="card stat"><span class="ico">🔥</span><div class="v">${streak}</div><div class="l">jour${streak > 1 ? "s" : ""} d'affilée</div></div>
    <div class="card stat"><span class="ico">🏋️</span><div class="v">${S.history.length}</div><div class="l">séances terminées</div></div>
    <div class="card stat"><span class="ico">🏗️</span><div class="v">${vol >= 1000 ? (vol / 1000).toFixed(1) + " t" : Math.round(vol) + " kg"}</div><div class="l">volume soulevé</div></div>
    <div class="card stat"><span class="ico">🏅</span><div class="v">${S.badges.length}/${BADGES.length}</div><div class="l">badges débloqués</div></div>
  </div>

  <h2 class="sec"><span class="ico">📅</span>Aujourd'hui</h2>
  <div class="grid g3">
    <div class="card">
      <div class="spread"><b>💧 Hydratation</b><span class="muted">${water}/8 verres</span></div>
      <div class="pbar mt"><div style="width:${Math.min(100, water / 8 * 100)}%"></div></div>
      <button class="btn sm sec mt" onclick="A.addWater(1);A.go('home')">+1 verre</button>
    </div>
    <div class="card">
      <div class="spread"><b>🍎 Calories du jour</b><span class="muted">${todayFood} kcal</span></div>
      <p class="muted small mt">Journal alimentaire dans l'onglet Nutrition.</p>
      <button class="btn sm sec mt" onclick="A.go('nutrition')">Ouvrir le journal</button>
    </div>
    <div class="card">
      <div class="spread"><b>🎲 WOD du jour</b><span class="pill or">${wod.format}</span></div>
      <p class="muted small mt">${wod.items.map((i) => i.reps + " " + i.n).join(" · ")}</p>
      <button class="btn sm sec mt" onclick="A.startWOD()">Lancer ce WOD</button>
    </div>
  </div>

  <h2 class="sec"><span class="ico">📈</span>Mon poids</h2>
  <div class="card">
    ${S.weightLog.length ? '<canvas class="chart" id="home-weight"></canvas>' : '<div class="empty"><span class="e">⚖️</span>Enregistre ton poids pour voir ta courbe apparaître ici.</div>'}
  </div>`;
}

function drawHomeChart() {
  const c = $("#home-weight");
  if (!c) return;
  const data = S.weightLog.slice(-30);
  lineChart(c, data.map((w) => fmtDate(w.d).slice(0, 5)), data.map((w) => w.kg));
}

/* ================= WOD ================= */
function generateWOD() {
  const rnd = mulberry32(dateSeed());
  const pool = ["Burpees", "Pompes", "Squat", "Fentes", "Mountain climbers", "Jumping jacks", "Sit-up", "Montées de genoux", "Planche avec touches d'épaules", "Swing kettlebell", "Wall ball", "Box jump", "Russian twist", "V-up", "Bear crawl"];
  const formats = [
    { format: "AMRAP 12 min", d: "Enchaîne un maximum de tours en 12 minutes." },
    { format: "3 tours chrono", d: "Termine 3 tours le plus vite possible, en gardant la technique." },
    { format: "EMOM 10 min", d: "Chaque minute, effectue le travail puis récupère le temps restant." }
  ];
  const f = formats[Math.floor(rnd() * formats.length)];
  const shuffled = pool.slice().sort(() => rnd() - 0.5);
  const items = shuffled.slice(0, 4).map((n) => ({ n, reps: [8, 10, 12, 15, 20][Math.floor(rnd() * 5)] }));
  return { format: f.format, d: f.d, items };
}

/* ================= PAGE : Exercices ================= */
const F = { q: "", m: "", eq: "", d: "", cat: "", fav: false, limit: 50 };

function filteredExos() {
  const q = F.q.trim().toLowerCase();
  return EXOS.filter((e) => {
    if (F.fav && !S.favs.includes(e.id)) return false;
    if (F.m && !e.m.includes(F.m) && !e.s.includes(F.m)) return false;
    if (F.eq && e.eq !== F.eq) return false;
    if (F.d && e.d !== parseInt(F.d, 10)) return false;
    if (F.cat && e.cat !== F.cat) return false;
    if (q && !e.n.toLowerCase().includes(q) && !e.m.join(" ").toLowerCase().includes(q)) return false;
    return true;
  });
}

function exoRow(e) {
  const fav = S.favs.includes(e.id);
  return `<div class="exo-row" onclick="A.exoDetail(${e.id})">
    <div class="mus-ico">${MUSCLE_ICO[e.m[0]] || "🏋️"}</div>
    <div>
      <div class="nm">${esc(e.n)}</div>
      <div class="meta"><span>${e.m.join(", ")}</span> · <span>${EQUIP[e.eq]}</span> · <span class="diff">${"🪨".repeat(e.d)}</span></div>
    </div>
    <button class="fav" onclick="event.stopPropagation();A.toggleFav(${e.id})">${fav ? "⭐" : "☆"}</button>
  </div>`;
}

function pExos() {
  const list = filteredExos();
  const shown = list.slice(0, F.limit);
  return `
  <h1 class="page">Bibliothèque d'exercices</h1>
  <p class="lead"><b>${EXOS.length.toLocaleString("fr-FR")}</b> exercices et variantes. Cherche, filtre, et trouve ton prochain caillou à soulever.</p>
  <div class="card">
    <input type="search" placeholder="🔍 Rechercher un exercice (ex : squat, pectoraux, kettlebell…)" value="${esc(F.q)}" oninput="A.fQ(this.value)">
    <div class="frow mt">
      <select onchange="A.fSet('m',this.value)">
        <option value="">Tous les muscles</option>
        ${MUSCLES.map((m) => `<option ${F.m === m ? "selected" : ""} value="${m}">${MUSCLE_ICO[m] || ""} ${m}</option>`).join("")}
      </select>
      <select onchange="A.fSet('eq',this.value)">
        <option value="">Tout équipement</option>
        ${Object.entries(EQUIP).map(([k, v]) => `<option ${F.eq === k ? "selected" : ""} value="${k}">${v}</option>`).join("")}
      </select>
      <select onchange="A.fSet('d',this.value)">
        <option value="">Toute difficulté</option>
        ${[1, 2, 3, 4, 5].map((d) => `<option ${F.d == d ? "selected" : ""} value="${d}">${"🪨".repeat(d)} Niveau ${d}</option>`).join("")}
      </select>
      <select onchange="A.fSet('cat',this.value)">
        <option value="">Toutes catégories</option>
        ${Object.entries(CATS).map(([k, v]) => `<option ${F.cat === k ? "selected" : ""} value="${k}">${v}</option>`).join("")}
      </select>
    </div>
    <div class="chips">
      <button class="chip ${F.fav ? "on" : ""}" onclick="A.fFav()">⭐ Mes favoris (${S.favs.length})</button>
      <button class="chip" onclick="A.randomExo()">🎲 Exercice surprise</button>
      <button class="chip" onclick="A.fReset()">♻️ Réinitialiser les filtres</button>
    </div>
  </div>
  <p class="muted mt mb">${list.length.toLocaleString("fr-FR")} résultat${list.length > 1 ? "s" : ""}</p>
  ${shown.map(exoRow).join("") || '<div class="empty"><span class="e">🕳️</span>Aucun exercice ne correspond. Élargis tes filtres !</div>'}
  ${list.length > F.limit ? `<button class="btn sec wide mt" onclick="A.more()">Afficher 50 de plus (${(list.length - F.limit).toLocaleString("fr-FR")} restants)</button>` : ""}`;
}

function exoDetailHTML(e) {
  const fav = S.favs.includes(e.id);
  const pr = S.prs[e.base];
  return `
  <div class="modal-head"><h3>${esc(e.n)}</h3></div>
  <div class="row mt">
    ${e.m.map((m) => `<span class="pill or">${MUSCLE_ICO[m] || ""} ${m}</span>`).join("")}
    ${e.s.map((m) => `<span class="pill gy">${m}</span>`).join("")}
    <span class="pill bl">${EQUIP[e.eq]}</span>
    <span class="pill gy">${CATS[e.cat]}</span>
    <span class="pill gr">${"🪨".repeat(e.d)} Niveau ${e.d}</span>
  </div>
  <h2 class="sec"><span class="ico">📖</span>Exécution</h2>
  <p class="muted">${esc(e.desc)}</p>
  ${e.note ? `<h2 class="sec"><span class="ico">🎛️</span>Variante</h2><p class="muted">${esc(e.note)}</p>` : ""}
  ${pr ? `<div class="result-box mt">🏆 Ton record : <b>${pr.w} kg × ${pr.r}</b> (1RM estimé ${Math.round(pr.e1rm)} kg) le ${fmtDate(pr.date)}</div>` : ""}
  <div class="row mt">
    <button class="btn ${fav ? "sec" : ""}" onclick="A.toggleFav(${e.id});A.exoDetail(${e.id})">${fav ? "⭐ Retirer des favoris" : "☆ Ajouter aux favoris"}</button>
    <button class="btn sec" onclick="A.addToWorkoutMenu(${e.id})">➕ Ajouter à une séance</button>
  </div>`;
}

/* ================= PAGE : Séances ================= */
function pSeances() {
  const d = S.draft;
  return `
  <h1 class="page">Mes séances</h1>
  <p class="lead">Crée tes séances, lance-les en mode guidé, et laisse Cailloux compter pour toi.</p>
  <div class="row mb">
    <button class="btn" onclick="A.newDraft()">➕ Nouvelle séance</button>
    <button class="btn sec" onclick="A.genMenu()">✨ Générer une séance</button>
    <button class="btn sec" onclick="A.startWOD()">🎲 WOD du jour</button>
  </div>
  ${d ? draftHTML(d) : ""}
  <h2 class="sec"><span class="ico">📚</span>Séances enregistrées (${S.workouts.length})</h2>
  ${S.workouts.length ? S.workouts.map((w, i) => `
    <details class="acc">
      <summary><span>🏋️ ${esc(w.name)} <span class="muted small">· ${w.items.length} exercices</span></span></summary>
      <div class="acc-body">
        ${w.items.map((it) => `<div class="muted small">• ${esc(it.ex)} — ${it.sets} × ${esc(String(it.reps))} (repos ${it.rest} s)</div>`).join("")}
        <div class="row mt">
          <button class="btn sm" onclick="A.startWorkout(${i})">▶ Lancer</button>
          <button class="btn sm sec" onclick="A.editWorkout(${i})">✏️ Modifier</button>
          <button class="btn sm sec" onclick="A.dupWorkout(${i})">📋 Dupliquer</button>
          <button class="btn sm red" onclick="A.delWorkout(${i})">🗑️</button>
        </div>
      </div>
    </details>`).join("") : '<div class="empty"><span class="e">🪨</span>Aucune séance pour l\'instant. Crée ta première ou pioche dans les Programmes !</div>'}`;
}

function draftHTML(d) {
  return `
  <div class="card mb" style="border-color:var(--accent)">
    <h2 class="sec" style="margin-top:0"><span class="ico">🛠️</span>Séance en construction</h2>
    <label class="f">Nom de la séance</label>
    <input value="${esc(d.name)}" oninput="A.draftName(this.value)" placeholder="Ex : Push lundi">
    ${d.items.map((it, i) => `
      <div class="set-row">
        <span class="set-num">${i + 1}</span>
        <div style="flex:1;min-width:110px"><b class="small">${esc(it.ex)}</b></div>
        <input type="number" value="${it.sets}" min="1" title="Séries" onchange="A.draftItem(${i},'sets',this.value)">
        <input value="${esc(String(it.reps))}" title="Répétitions" onchange="A.draftItem(${i},'reps',this.value)">
        <input type="number" value="${it.rest}" min="0" step="15" title="Repos (s)" onchange="A.draftItem(${i},'rest',this.value)">
        <button class="btn sm red" onclick="A.draftDel(${i})">✕</button>
      </div>`).join("")}
    <p class="small muted mt">Colonnes : séries · répétitions · repos (secondes)</p>
    <div class="row mt">
      <button class="btn sec" onclick="A.pickExo()">➕ Ajouter un exercice</button>
      <button class="btn green" onclick="A.saveDraft()">💾 Enregistrer</button>
      <button class="btn sec" onclick="A.draftStart()">▶ Lancer sans enregistrer</button>
      <button class="btn red" onclick="A.dropDraft()">Annuler</button>
    </div>
  </div>`;
}

/* ================= Player ================= */
let P = null;
function pPlayer() {
  if (!P) { PAGE = "seances"; return pSeances(); }
  const totalSets = P.items.reduce((a, it) => a + it.sets.length, 0);
  const doneSets = P.items.reduce((a, it) => a + it.sets.filter((s) => s.done).length, 0);
  const mins = Math.floor((Date.now() - P.start) / 60000);
  return `
  <div class="spread">
    <div><h1 class="page">▶ ${esc(P.name)}</h1><p class="muted">${doneSets}/${totalSets} séries · ${mins} min écoulées</p></div>
    <button class="btn red" onclick="A.abandonWorkout()">Abandonner</button>
  </div>
  <div class="pbar mb mt"><div style="width:${totalSets ? doneSets / totalSets * 100 : 0}%"></div></div>
  ${P.items.map((it, ii) => `
    <div class="card mb">
      <div class="spread"><b>${esc(it.ex)}</b><span class="muted small">repos ${it.rest} s</span></div>
      ${it.sets.map((st, si) => `
        <div class="set-row ${st.done ? "ok" : ""}">
          <span class="set-num">${si + 1}</span>
          <input type="number" placeholder="kg" value="${st.w}" onchange="A.pSet(${ii},${si},'w',this.value)">
          <span class="muted">×</span>
          <input placeholder="${esc(String(st.t))}" value="${st.r}" onchange="A.pSet(${ii},${si},'r',this.value)">
          <span class="muted small" style="flex:1">objectif : ${esc(String(st.t))}</span>
          <button class="done-btn" onclick="A.pDone(${ii},${si})">${st.done ? "✓" : ""}</button>
        </div>`).join("")}
    </div>`).join("")}
  <label class="f">Note de séance (optionnel)</label>
  <input id="p-note" value="${esc(P.note || "")}" placeholder="Sensations, remarques…" onchange="P.note=this.value">
  <button class="btn big wide green mt" onclick="A.finishWorkout()">🏁 Terminer la séance</button>`;
}

/* Rest timer */
let restInt = null;
function startRest(sec, nextLabel) {
  if (!sec || sec <= 0) return;
  const ov = $("#rest-overlay");
  let left = sec;
  $("#rest-time").textContent = left;
  $("#rest-next").textContent = nextLabel || "";
  ov.classList.add("show");
  clearInterval(restInt);
  restInt = setInterval(() => {
    left--;
    $("#rest-time").textContent = left;
    if (left <= 3 && left > 0) beep(660, 0.12);
    if (left <= 0) {
      clearInterval(restInt);
      beep(990, 0.4);
      ov.classList.remove("show");
    }
  }, 1000);
  window._restLeft = () => left;
  window._restSet = (v) => { left = v; $("#rest-time").textContent = left; };
}

/* ================= PAGE : Programmes ================= */
function pProgrammes() {
  return `
  <h1 class="page">Programmes</h1>
  <p class="lead">12 programmes complets, du grand débutant à l'athlète confirmé. Choisis, lance, progresse.</p>
  <div class="grid g3">
    ${PROGRAMS.map((p, i) => `
      <div class="card prog-card" onclick="A.progDetail(${i})">
        <div class="e">${p.e}</div>
        <h4>${esc(p.n)}</h4>
        <div class="d">${esc(p.d)}</div>
        <div class="row mt"><span class="pill or">${p.lvl}</span><span class="pill gy">${p.freq}</span><span class="pill bl">${p.days.length} séances</span></div>
      </div>`).join("")}
  </div>`;
}

function progDetailHTML(p, pi) {
  return `
  <div class="modal-head"><h3>${p.e} ${esc(p.n)}</h3></div>
  <div class="row mt"><span class="pill or">${p.lvl}</span><span class="pill gy">${p.freq}</span></div>
  <p class="muted mt">${esc(p.d)}</p>
  ${p.days.map((d, di) => `
    <details class="acc mt">
      <summary><span>${esc(d.n)}</span><button class="btn sm" onclick="event.preventDefault();A.startProgramDay(${pi},${di})">▶ Lancer</button></summary>
      <div class="acc-body">${d.items.map((it) => `<div class="muted small">• ${esc(it[0])} — ${it[1]} × ${esc(String(it[2]))}</div>`).join("")}</div>
    </details>`).join("")}
  <button class="btn sec wide mt" onclick="A.copyProgram(${pi})">📋 Copier toutes les séances dans « Mes séances »</button>`;
}

/* ================= PAGE : Suivi ================= */
let calOffset = 0;
function pSuivi() {
  const streak = computeStreak();
  const prs = Object.entries(S.prs).sort((a, b) => b[1].e1rm - a[1].e1rm);
  return `
  <h1 class="page">Suivi & progression</h1>
  <p class="lead">Ce qui se mesure s'améliore. Tout ton parcours, caillou par caillou.</p>

  <div class="grid g4 mb">
    <div class="card stat"><span class="ico">🔥</span><div class="v">${streak}</div><div class="l">streak actuel</div></div>
    <div class="card stat"><span class="ico">🏋️</span><div class="v">${S.history.length}</div><div class="l">séances</div></div>
    <div class="card stat"><span class="ico">🏆</span><div class="v">${prs.length}</div><div class="l">records persos</div></div>
    <div class="card stat"><span class="ico">⏱️</span><div class="v">${Math.round(S.history.reduce((a, h) => a + (h.dur || 0), 0) / 60)} h</div><div class="l">temps d'entraînement</div></div>
  </div>

  <div class="grid g2">
    <div class="card">
      <div class="spread"><h2 class="sec" style="margin:0"><span class="ico">📅</span>Calendrier</h2>
        <div class="row"><button class="btn sm sec" onclick="A.calMove(-1)">←</button><button class="btn sm sec" onclick="A.calMove(1)">→</button></div>
      </div>
      <div class="mt">${calendarHTML()}</div>
    </div>
    <div class="card">
      <h2 class="sec" style="margin-top:0"><span class="ico">📊</span>Volume hebdomadaire</h2>
      ${S.history.length ? '<canvas class="chart" id="chart-vol"></canvas>' : '<div class="empty"><span class="e">📊</span>Termine des séances pour voir ton volume.</div>'}
    </div>
  </div>

  <h2 class="sec"><span class="ico">⚖️</span>Poids corporel</h2>
  <div class="card">
    <div class="frow">
      <input type="number" step="0.1" id="w-in" placeholder="Poids (${S.settings.unit})">
      <button class="btn" onclick="A.addWeight()">Enregistrer aujourd'hui</button>
    </div>
    ${S.weightLog.length ? '<canvas class="chart mt" id="chart-weight"></canvas>' : ""}
    ${S.weightLog.length ? `<p class="muted small mt">Dernier : <b>${dispW(S.weightLog[S.weightLog.length - 1].kg)}</b> le ${fmtDate(S.weightLog[S.weightLog.length - 1].d)} ${weightTrend()}</p>` : ""}
  </div>

  <h2 class="sec"><span class="ico">📏</span>Mensurations</h2>
  <div class="card">
    <div class="frow">
      <input type="number" step="0.5" id="m-poitrine" placeholder="Poitrine (cm)">
      <input type="number" step="0.5" id="m-taille" placeholder="Tour de taille (cm)">
      <input type="number" step="0.5" id="m-bras" placeholder="Bras (cm)">
      <input type="number" step="0.5" id="m-cuisse" placeholder="Cuisse (cm)">
      <input type="number" step="0.5" id="m-hanches" placeholder="Hanches (cm)">
    </div>
    <button class="btn mt" onclick="A.addMeasure()">Enregistrer les mesures</button>
    ${S.measures.length ? `<div class="mt" style="overflow-x:auto"><table class="tb"><tr><th>Date</th><th>Poitrine</th><th>Taille</th><th>Bras</th><th>Cuisse</th><th>Hanches</th></tr>
      ${S.measures.slice(-6).reverse().map((m) => `<tr><td>${fmtDate(m.d)}</td><td>${m.poitrine || "—"}</td><td>${m.taille || "—"}</td><td>${m.bras || "—"}</td><td>${m.cuisse || "—"}</td><td>${m.hanches || "—"}</td></tr>`).join("")}</table></div>` : ""}
  </div>

  <h2 class="sec"><span class="ico">😴</span>Sommeil</h2>
  <div class="card">
    <div class="frow">
      <input type="number" step="0.5" min="0" max="24" id="sleep-in" placeholder="Heures dormies cette nuit" value="${S.sleepLog[todayStr()] || ""}">
      <button class="btn" onclick="A.addSleep()">Enregistrer</button>
    </div>
    ${sleepAvg() ? `<p class="muted small mt">Moyenne 7 derniers jours : <b>${sleepAvg()} h</b> ${sleepAvg() >= 7 ? "😴 parfait pour la récup" : "⚠️ vise 7 à 9 h pour progresser"}</p>` : ""}
  </div>

  <h2 class="sec"><span class="ico">🏆</span>Records personnels</h2>
  <div class="card">
    ${prs.length ? `<div style="overflow-x:auto"><table class="tb"><tr><th>Exercice</th><th>Charge</th><th>1RM estimé</th><th>Date</th></tr>
      ${prs.map(([n, p]) => `<tr><td><b>${esc(n)}</b></td><td>${p.w} kg × ${p.r}</td><td>${Math.round(p.e1rm)} kg</td><td>${fmtDate(p.date)}</td></tr>`).join("")}</table></div>`
      : '<div class="empty"><span class="e">🏆</span>Tes records apparaîtront automatiquement quand tu valideras des séries avec du poids.</div>'}
  </div>

  <h2 class="sec"><span class="ico">📜</span>Historique (${S.history.length})</h2>
  ${S.history.slice().reverse().map((h) => `
    <details class="acc">
      <summary><span>${fmtDate(h.d)} — <b>${esc(h.name)}</b> <span class="muted small">· ${Math.round(h.vol)} kg · ${h.dur} min</span></span></summary>
      <div class="acc-body">
        ${h.items.map((it) => `<div class="muted small">• <b>${esc(it.ex)}</b> : ${it.sets.filter((s) => s.done).map((s) => (s.w ? s.w + "kg×" : "×") + s.r).join(", ") || "—"}</div>`).join("")}
        ${h.note ? `<p class="small muted mt">📝 ${esc(h.note)}</p>` : ""}
        <button class="btn sm red mt" onclick="A.delHistory('${h.id}')">🗑️ Supprimer</button>
      </div>
    </details>`).join("") || '<div class="empty"><span class="e">📜</span>Aucune séance enregistrée pour l\'instant.</div>'}`;
}

function weightTrend() {
  if (S.weightLog.length < 2) return "";
  const diff = S.weightLog[S.weightLog.length - 1].kg - S.weightLog[S.weightLog.length - 2].kg;
  if (Math.abs(diff) < 0.05) return "→";
  return diff > 0 ? `(↗ +${diff.toFixed(1)} kg)` : `(↘ ${diff.toFixed(1)} kg)`;
}
function sleepAvg() {
  const days = Object.keys(S.sleepLog).sort().slice(-7);
  if (!days.length) return 0;
  return (days.reduce((a, d) => a + num(S.sleepLog[d]), 0) / days.length).toFixed(1);
}

function calendarHTML() {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + calOffset, 1);
  const y = base.getFullYear(), m = base.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const nDays = new Date(y, m + 1, 0).getDate();
  const trainedDays = new Set(S.history.map((h) => h.d));
  const monthName = base.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  let cells = "";
  for (let i = 0; i < first; i++) cells += '<div class="day out"></div>';
  for (let d = 1; d <= nDays; d++) {
    const ds = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const isToday = ds === todayStr();
    cells += `<div class="day ${isToday ? "today" : ""}" onclick="A.dayDetail('${ds}')">${d}${trainedDays.has(ds) ? '<span class="dot"></span>' : ""}</div>`;
  }
  return `<p class="center muted small" style="text-transform:capitalize">${monthName}</p>
  <div class="cal mt">${["L", "M", "M", "J", "V", "S", "D"].map((d) => `<div class="dow">${d}</div>`).join("")}${cells}</div>`;
}

function drawSuiviCharts() {
  const cw = $("#chart-weight");
  if (cw && S.weightLog.length) {
    const data = S.weightLog.slice(-30);
    lineChart(cw, data.map((w) => fmtDate(w.d).slice(0, 5)), data.map((w) => w.kg));
  }
  const cv = $("#chart-vol");
  if (cv && S.history.length) {
    const weeks = {};
    for (const h of S.history) {
      const dt = new Date(h.d);
      const onejan = new Date(dt.getFullYear(), 0, 1);
      const wk = Math.ceil((((dt - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      const key = dt.getFullYear() + "-S" + String(wk).padStart(2, "0");
      weeks[key] = (weeks[key] || 0) + (h.vol || 0);
    }
    const keys = Object.keys(weeks).sort().slice(-8);
    barChart(cv, keys.map((k) => k.split("-")[1]), keys.map((k) => Math.round(weeks[k])));
  }
}

/* ================= Charts (canvas) ================= */
function setupCanvas(c) {
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  c.width = rect.width * dpr; c.height = rect.height * dpr;
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}
function chartColors() {
  const cs = getComputedStyle(document.body);
  return { accent: cs.getPropertyValue("--accent").trim() || "#ff7a1a", grid: cs.getPropertyValue("--border").trim() || "#2c3542", txt: cs.getPropertyValue("--txt3").trim() || "#67748a" };
}
function lineChart(c, labels, values) {
  if (!values.length) return;
  const { ctx, w, h } = setupCanvas(c);
  const col = chartColors();
  const pad = { l: 38, r: 10, t: 12, b: 22 };
  const min = Math.min(...values), max = Math.max(...values);
  const range = (max - min) || 1;
  const X = (i) => pad.l + (values.length === 1 ? 0.5 : i / (values.length - 1)) * (w - pad.l - pad.r);
  const Y = (v) => pad.t + (1 - (v - min) / range) * (h - pad.t - pad.b);
  ctx.strokeStyle = col.grid; ctx.fillStyle = col.txt; ctx.font = "10px sans-serif"; ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const v = min + range * i / 3, y = Y(v);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillText(v.toFixed(1), 2, y + 3);
  }
  ctx.strokeStyle = col.accent; ctx.lineWidth = 2.5; ctx.beginPath();
  values.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); });
  ctx.stroke();
  ctx.fillStyle = col.accent;
  values.forEach((v, i) => { ctx.beginPath(); ctx.arc(X(i), Y(v), 3, 0, 7); ctx.fill(); });
  ctx.fillStyle = col.txt;
  const step = Math.ceil(labels.length / 6);
  labels.forEach((l, i) => { if (i % step === 0) ctx.fillText(l, X(i) - 12, h - 6); });
}
function barChart(c, labels, values) {
  if (!values.length) return;
  const { ctx, w, h } = setupCanvas(c);
  const col = chartColors();
  const pad = { l: 44, r: 8, t: 12, b: 22 };
  const max = Math.max(...values) || 1;
  const bw = (w - pad.l - pad.r) / values.length;
  ctx.fillStyle = col.txt; ctx.font = "10px sans-serif";
  ctx.strokeStyle = col.grid;
  for (let i = 0; i <= 3; i++) {
    const v = max * i / 3, y = pad.t + (1 - v / max) * (h - pad.t - pad.b);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillText(Math.round(v).toLocaleString("fr-FR"), 2, y + 3);
  }
  values.forEach((v, i) => {
    const bh = (v / max) * (h - pad.t - pad.b);
    ctx.fillStyle = col.accent;
    ctx.fillRect(pad.l + i * bw + bw * 0.15, h - pad.b - bh, bw * 0.7, bh);
    ctx.fillStyle = col.txt;
    ctx.fillText(labels[i], pad.l + i * bw + bw * 0.15, h - 6);
  });
}

/* ================= PAGE : Nutrition ================= */
function pNutrition() {
  const st = S.settings;
  const t = todayStr();
  const foods = S.foodLog[t] || [];
  const kcal = foods.reduce((a, f) => a + f.kcal, 0);
  const prot = foods.reduce((a, f) => a + f.p, 0);
  const tdee = computeTDEE();
  const water = S.waterLog[t] || 0;
  return `
  <h1 class="page">Nutrition</h1>
  <p class="lead">Les muscles se construisent à la salle et se nourrissent en cuisine.</p>

  <h2 class="sec"><span class="ico">🧮</span>Mes besoins caloriques</h2>
  <div class="card">
    <div class="frow">
      <div><label class="f">Sexe</label><select id="n-sexe"><option value="h" ${st.sexe === "h" ? "selected" : ""}>Homme</option><option value="f" ${st.sexe === "f" ? "selected" : ""}>Femme</option></select></div>
      <div><label class="f">Âge</label><input type="number" id="n-age" value="${esc(st.age)}" placeholder="30"></div>
      <div><label class="f">Poids (kg)</label><input type="number" id="n-poids" value="${esc(st.poids)}" placeholder="75"></div>
      <div><label class="f">Taille (cm)</label><input type="number" id="n-taille" value="${esc(st.taille)}" placeholder="178"></div>
    </div>
    <div class="frow">
      <div><label class="f">Activité</label><select id="n-act">
        <option value="1.2" ${st.activite === "1.2" ? "selected" : ""}>Sédentaire</option>
        <option value="1.375" ${st.activite === "1.375" ? "selected" : ""}>Légère (1-2 séances/sem)</option>
        <option value="1.55" ${st.activite === "1.55" ? "selected" : ""}>Modérée (3-4 séances/sem)</option>
        <option value="1.725" ${st.activite === "1.725" ? "selected" : ""}>Intense (5-6 séances/sem)</option>
        <option value="1.9" ${st.activite === "1.9" ? "selected" : ""}>Athlète (2×/jour)</option>
      </select></div>
      <div><label class="f">Objectif</label><select id="n-obj">
        <option value="seche" ${st.objectif === "seche" ? "selected" : ""}>Perdre du gras (-15 %)</option>
        <option value="forme" ${st.objectif === "forme" ? "selected" : ""}>Maintien / forme</option>
        <option value="masse" ${st.objectif === "masse" ? "selected" : ""}>Prendre du muscle (+12 %)</option>
      </select></div>
    </div>
    <button class="btn mt" onclick="A.calcTDEE()">Calculer mes besoins</button>
    ${tdee ? `
    <div class="result-box">
      Objectif quotidien : <b>${tdee.target} kcal</b> <span class="muted small">(maintenance ${tdee.tdee} kcal)</span>
      <div class="macro-bar">
        <div style="flex:${tdee.p * 4};background:#4cd97b" title="Protéines">P ${tdee.p} g</div>
        <div style="flex:${tdee.g * 9};background:#ffd166" title="Lipides">L ${tdee.g} g</div>
        <div style="flex:${tdee.c * 4};background:#58a6ff" title="Glucides">G ${tdee.c} g</div>
      </div>
    </div>` : ""}
  </div>

  <h2 class="sec"><span class="ico">💧</span>Hydratation du jour</h2>
  <div class="card">
    <div class="spread"><span class="muted">${water} / 8 verres (≈ ${(water * 0.25).toFixed(2)} L)</span>
    ${st.poids ? `<span class="muted small">Recommandé : ${(num(st.poids) * 0.035).toFixed(1)} L/jour</span>` : ""}</div>
    <div class="water-glasses">
      ${Array.from({ length: 8 }, (_, i) => `<button class="glass ${i < water ? "full" : ""}" onclick="A.setWater(${i + 1})">${i < water ? "💧" : ""}</button>`).join("")}
    </div>
    <button class="btn sm sec" onclick="A.setWater(0)">Réinitialiser</button>
  </div>

  <h2 class="sec"><span class="ico">📔</span>Journal alimentaire — aujourd'hui</h2>
  <div class="card">
    <div class="frow">
      <input id="f-name" placeholder="Aliment / repas" style="flex:2">
      <input id="f-kcal" type="number" placeholder="kcal">
      <input id="f-prot" type="number" placeholder="protéines (g)">
      <button class="btn" onclick="A.addFood()">Ajouter</button>
    </div>
    ${foods.length ? `<table class="tb mt"><tr><th>Repas</th><th>kcal</th><th>Prot.</th><th></th></tr>
      ${foods.map((f, i) => `<tr><td>${esc(f.n)}</td><td>${f.kcal}</td><td>${f.p} g</td><td><button class="btn sm red" onclick="A.delFood(${i})">✕</button></td></tr>`).join("")}
      <tr><td><b>Total</b></td><td><b>${kcal}</b>${tdee ? `<span class="muted small"> / ${tdee.target}</span>` : ""}</td><td><b>${prot} g</b>${tdee ? `<span class="muted small"> / ${tdee.p}</span>` : ""}</td><td></td></tr></table>` : '<p class="muted small mt">Rien d\'enregistré aujourd\'hui.</p>'}
    ${tdee ? `<div class="pbar mt"><div style="width:${Math.min(100, kcal / tdee.target * 100)}%"></div></div>` : ""}
  </div>

  <h2 class="sec"><span class="ico">🍱</span>Idées de repas riches en protéines</h2>
  <div class="grid g3">
    ${MEALS.map((m) => `<div class="card"><b class="small">${esc(m.n)}</b><div class="row mt"><span class="pill or">${m.kcal} kcal</span><span class="pill gr">${m.p} g prot.</span>
      <button class="btn sm sec" style="margin-left:auto" onclick="A.quickFood('${esc(m.n).replace(/'/g, "\\'")}',${m.kcal},${m.p})">+ Journal</button></div></div>`).join("")}
  </div>`;
}

function computeTDEE() {
  const st = S.settings;
  const p = num(st.poids), t = num(st.taille), a = num(st.age);
  if (!p || !t || !a) return null;
  const bmr = st.sexe === "f" ? 10 * p + 6.25 * t - 5 * a - 161 : 10 * p + 6.25 * t - 5 * a + 5;
  const tdee = Math.round(bmr * num(st.activite));
  const factor = st.objectif === "seche" ? 0.85 : st.objectif === "masse" ? 1.12 : 1;
  const target = Math.round(tdee * factor);
  const prot = Math.round(p * (st.objectif === "seche" ? 2.2 : 1.8));
  const fat = Math.round(p * 0.9);
  const carbs = Math.max(0, Math.round((target - prot * 4 - fat * 9) / 4));
  return { tdee, target, p: prot, g: fat, c: carbs };
}

/* ================= PAGE : Outils ================= */
const TOOLS = [
  { id: "rm", e: "🏋️", n: "Calculateur 1RM", d: "Ton max théorique + tableau de charges" },
  { id: "barre", e: "🥌", n: "Chargement de barre", d: "Quels disques mettre de chaque côté" },
  { id: "imc", e: "📐", n: "IMC", d: "Indice de masse corporelle" },
  { id: "fc", e: "❤️", n: "Zones cardiaques", d: "Tes 5 zones d'entraînement" },
  { id: "allure", e: "🏃", n: "Allure de course", d: "min/km, km/h et temps de passage" },
  { id: "kcal", e: "🔥", n: "Calories brûlées", d: "Estimation par activité (MET)" },
  { id: "conv", e: "🔁", n: "Convertisseur kg ↔ lb", d: "Pour les vidéos américaines" },
  { id: "prot", e: "🥩", n: "Protéines par jour", d: "Combien de grammes il te faut" },
  { id: "tabata", e: "⏱️", n: "Tabata", d: "Travail / repos personnalisables" },
  { id: "emom", e: "🕐", n: "EMOM", d: "Every Minute On the Minute" },
  { id: "amrap", e: "♾️", n: "AMRAP", d: "Un compte à rebours d'effort max" },
  { id: "chrono", e: "⏲️", n: "Chronomètre", d: "Simple et précis" }
];
function pOutils() {
  return `
  <h1 class="page">Boîte à outils</h1>
  <p class="lead">Calculatrices et minuteurs : tout ce qu'un sportif tape d'habitude dans Google.</p>
  <div class="grid g3">
    ${TOOLS.map((t) => `<div class="card tool-card" onclick="A.tool('${t.id}')"><div class="e">${t.e}</div><div class="n">${t.n}</div><div class="d">${t.d}</div></div>`).join("")}
  </div>`;
}

/* ================= Timers ================= */
let T = { int: null, mode: null, phase: "", left: 0, round: 0, rounds: 0, work: 0, rest: 0, elapsed: 0, running: false };
function stopTimer() { clearInterval(T.int); T.int = null; T.running = false; }
function timerDisplay() {
  const el = $("#t-disp"), ph = $("#t-phase");
  if (!el) return;
  const mm = Math.floor(Math.abs(T.left) / 60), ss = Math.abs(T.left) % 60;
  el.textContent = String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
  el.className = "timer-disp " + (T.phase === "TRAVAIL" ? "work" : T.phase === "REPOS" ? "rest" : "");
  if (ph) ph.textContent = T.phase + (T.rounds ? " · round " + T.round + "/" + T.rounds : "");
}

/* ================= PAGE : Défis ================= */
function pDefis() {
  return `
  <h1 class="page">Défis 30 jours</h1>
  <p class="lead">Un petit effort chaque jour. Au bout de 30 jours, la montagne est derrière toi.</p>
  <div class="grid g2">
    ${CHALLENGES.map((c) => {
      const ch = S.challenges[c.id];
      const done = ch ? ch.done.length : 0;
      return `
      <div class="card">
        <div class="spread"><b>${c.e} ${c.n}</b>${ch ? `<span class="pill ${done >= 30 ? "gr" : "or"}">${done}/30</span>` : ""}</div>
        <p class="muted small mt">Jour 1 : ${c.plan[0]} ${c.unit} → Jour 30 : ${c.plan[29]} ${c.unit}</p>
        ${ch ? `
          <div class="pbar mt"><div style="width:${done / 30 * 100}%"></div></div>
          <div class="defi-days">
            ${c.plan.map((q, i) => `<div class="defi-day ${ch.done.includes(i) ? "ok" : ""}" onclick="A.defiToggle('${c.id}',${i})"><span>J${i + 1}</span><span class="q">${q}</span></div>`).join("")}
          </div>
          ${done >= 30 ? '<p class="mt center">🏆 <b>Défi terminé, chapeau bas !</b></p>' : ""}
          <button class="btn sm red mt" onclick="A.defiReset('${c.id}')">Abandonner / recommencer</button>`
        : `<button class="btn mt" onclick="A.defiStart('${c.id}')">🚀 Commencer le défi</button>`}
      </div>`;
    }).join("")}
  </div>

  <h2 class="sec"><span class="ico">🏅</span>Badges (${S.badges.length}/${BADGES.length})</h2>
  <div class="grid g4">
    ${BADGES.map((b) => `<div class="card badge-card ${S.badges.includes(b.id) ? "" : "lock"}"><div class="e">${b.e}</div><div class="n">${b.n}</div><div class="d">${b.d}</div></div>`).join("")}
  </div>`;
}

/* ================= PAGE : Profil ================= */
function pProfil() {
  const st = S.settings;
  return `
  <h1 class="page">Profil & réglages</h1>
  <p class="lead">Ton espace. Tes données restent dans ton navigateur, rien n'est envoyé nulle part.</p>

  <div class="grid g2">
    <div class="card">
      <h2 class="sec" style="margin-top:0"><span class="ico">👤</span>Moi</h2>
      <label class="f">Prénom / pseudo</label>
      <input value="${esc(st.name)}" onchange="A.setSetting('name',this.value)" placeholder="Comment on t'appelle ?">
      <label class="f">Objectif principal</label>
      <select onchange="A.setSetting('objectif',this.value)">
        <option value="seche" ${st.objectif === "seche" ? "selected" : ""}>Perdre du gras</option>
        <option value="forme" ${st.objectif === "forme" ? "selected" : ""}>Rester en forme</option>
        <option value="masse" ${st.objectif === "masse" ? "selected" : ""}>Prendre du muscle</option>
      </select>
    </div>
    <div class="card">
      <h2 class="sec" style="margin-top:0"><span class="ico">🎛️</span>Préférences</h2>
      <label class="f">Unité de poids</label>
      <div class="chips" style="margin-top:4px">
        <button class="chip ${st.unit === "kg" ? "on" : ""}" onclick="A.setSetting('unit','kg')">Kilogrammes (kg)</button>
        <button class="chip ${st.unit === "lb" ? "on" : ""}" onclick="A.setSetting('unit','lb')">Livres (lb)</button>
      </div>
      <label class="f">Thème</label>
      <div class="chips" style="margin-top:4px">
        <button class="chip ${st.theme === "dark" ? "on" : ""}" onclick="A.setSetting('theme','dark')">🌑 Sombre</button>
        <button class="chip ${st.theme === "light" ? "on" : ""}" onclick="A.setSetting('theme','light')">☀️ Clair</button>
      </div>
    </div>
  </div>

  <h2 class="sec"><span class="ico">💾</span>Mes données</h2>
  <div class="card">
    <p class="muted small">Tout est stocké localement dans ce navigateur. Pense à exporter régulièrement une sauvegarde.</p>
    <div class="row mt">
      <button class="btn sec" onclick="A.exportData()">⬇️ Exporter (JSON)</button>
      <label class="btn sec" style="cursor:pointer">⬆️ Importer<input type="file" accept=".json" style="display:none" onchange="A.importData(this)"></label>
      <button class="btn red" onclick="A.resetData()">🗑️ Tout effacer</button>
    </div>
  </div>

  <h2 class="sec"><span class="ico">🪨</span>Tout ce que Cailloux sait faire (${FEATURES.length} fonctionnalités)</h2>
  <div class="card">
    <ul class="feat-list">${FEATURES.map((f) => `<li>${f}</li>`).join("")}</ul>
  </div>

  <p class="center muted small mt">Cailloux v1.0 — fait avec 🧡 et beaucoup de fonte. Un caillou après l'autre.</p>`;
}

/* ================= Poids : affichage unité ================= */
function dispW(kg) { return S.settings.unit === "lb" ? (kg * 2.20462).toFixed(1) + " lb" : kg + " kg"; }
function toKg(v) { return S.settings.unit === "lb" ? Math.round(v / 2.20462 * 10) / 10 : v; }

/* ================= Actions globales ================= */
const A = {
  /* --- nav --- */
  go(p) { PAGE = p; this.closeModal(); render(); },
  moreMenu() {
    openModal(`<h3>Plus</h3><div class="grid g2 mt">
      ${NAV.filter(([id]) => !NAV_MOBILE.includes(id)).map(([id, l, e]) => `<button class="btn sec" onclick="A.go('${id}')">${e} ${l}</button>`).join("")}
    </div>`);
  },
  closeModal() {
    $("#modal-root").classList.remove("show");
    $("#modal-root").innerHTML = "";
    document.body.style.overflow = "";
    stopTimer();
  },

  /* --- filtres exos --- */
  fQ(v) { F.q = v; F.limit = 50; this.rList(); },
  fSet(k, v) { F[k] = v; F.limit = 50; render(); },
  fFav() { F.fav = !F.fav; F.limit = 50; render(); },
  fReset() { F.q = ""; F.m = ""; F.eq = ""; F.d = ""; F.cat = ""; F.fav = false; F.limit = 50; render(); },
  more() { F.limit += 50; render(); },
  rList() {
    /* re-render sans perdre le focus de la recherche */
    const el = $("#view");
    const active = document.activeElement;
    const pos = active && active.type === "search" ? active.selectionStart : null;
    el.innerHTML = pExos();
    if (pos != null) { const inp = el.querySelector('input[type="search"]'); if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); } }
  },
  toggleFav(id) {
    const i = S.favs.indexOf(id);
    if (i >= 0) S.favs.splice(i, 1); else S.favs.push(id);
    save(); checkBadges();
    if (PAGE === "exos" && !$("#modal-root").classList.contains("show")) render();
  },
  exoDetail(id) {
    const e = EXOS.find((x) => x.id === id);
    if (e) openModal(exoDetailHTML(e));
  },
  randomExo() { this.exoDetail(EXOS[Math.floor(Math.random() * EXOS.length)].id); },
  addToWorkoutMenu(id) {
    const e = EXOS.find((x) => x.id === id);
    if (!e) return;
    if (!S.draft) S.draft = { name: "", items: [] };
    S.draft.items.push({ ex: e.n, sets: 3, reps: "10", rest: 90 });
    save();
    this.closeModal();
    toast("➕ Ajouté à la séance en construction");
    this.go("seances");
  },

  /* --- builder --- */
  newDraft() { S.draft = { name: "", items: [] }; save(); render(); },
  dropDraft() { S.draft = null; save(); render(); },
  draftName(v) { if (S.draft) { S.draft.name = v; save(); } },
  draftItem(i, k, v) { if (S.draft && S.draft.items[i]) { S.draft.items[i][k] = k === "reps" ? v : num(v); save(); } },
  draftDel(i) { S.draft.items.splice(i, 1); save(); render(); },
  pickExo(q) {
    const query = (q || "").toLowerCase();
    const list = BASES.filter((b) => !query || b.n.toLowerCase().includes(query) || b.m.join(" ").toLowerCase().includes(query)).slice(0, 30);
    openModal(`<h3>Ajouter un exercice</h3>
      <input class="mt" type="search" placeholder="🔍 Rechercher…" oninput="A.pickExo(this.value)" value="${esc(q || "")}" autofocus>
      <div class="mt" style="max-height:50vh;overflow-y:auto">
        ${list.map((b) => `<div class="exo-row" onclick="A.pickAdd('${esc(b.n).replace(/'/g, "\\'")}')">
          <div class="mus-ico">${MUSCLE_ICO[b.m[0]] || "🏋️"}</div>
          <div><div class="nm">${esc(b.n)}</div><div class="meta">${b.m.join(", ")}</div></div>
        </div>`).join("")}
      </div>`);
    const inp = $("#modal-root input");
    if (inp && q !== undefined) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  },
  pickAdd(name) {
    if (!S.draft) S.draft = { name: "", items: [] };
    S.draft.items.push({ ex: name, sets: 3, reps: "10", rest: 90 });
    save();
    this.closeModal();
    render();
  },
  saveDraft() {
    if (!S.draft || !S.draft.items.length) return toast("Ajoute au moins un exercice !");
    if (!S.draft.name) S.draft.name = "Séance du " + fmtDate(todayStr());
    S.workouts.push({ id: uid(), name: S.draft.name, items: S.draft.items });
    S.draft = null;
    save(); checkBadges(); render();
    toast("💾 Séance enregistrée !");
  },
  draftStart() {
    if (!S.draft || !S.draft.items.length) return toast("Ajoute au moins un exercice !");
    this.launchPlayer(S.draft.name || "Séance libre", S.draft.items);
    S.draft = null; save();
  },
  editWorkout(i) {
    const w = S.workouts[i];
    S.draft = { name: w.name, items: JSON.parse(JSON.stringify(w.items)) };
    S.workouts.splice(i, 1);
    save(); render();
  },
  dupWorkout(i) {
    const w = S.workouts[i];
    S.workouts.push({ id: uid(), name: w.name + " (copie)", items: JSON.parse(JSON.stringify(w.items)) });
    save(); render(); toast("📋 Séance dupliquée");
  },
  delWorkout(i) {
    if (!confirm("Supprimer cette séance ?")) return;
    S.workouts.splice(i, 1); save(); render();
  },

  /* --- générateur --- */
  genMenu() {
    openModal(`<h3>✨ Générer une séance</h3>
      <p class="muted small mt">Choisis les muscles à travailler, Cailloux compose la séance.</p>
      <div class="chips" id="gen-chips">
        ${["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Quadriceps", "Ischio-jambiers", "Fessiers", "Abdominaux", "Mollets", "Cardio", "Corps entier"].map((m) => `<button class="chip" data-m="${m}" onclick="this.classList.toggle('on')">${MUSCLE_ICO[m] || ""} ${m}</button>`).join("")}
      </div>
      <label class="f">Nombre d'exercices</label>
      <select id="gen-n"><option>4</option><option selected>6</option><option>8</option></select>
      <button class="btn wide mt" onclick="A.genGo()">🎲 Générer</button>`);
  },
  genGo() {
    const muscles = [...document.querySelectorAll("#gen-chips .chip.on")].map((c) => c.dataset.m);
    const n = parseInt($("#gen-n").value, 10);
    if (!muscles.length) return toast("Choisis au moins un muscle !");
    const pool = BASES.filter((b) => b.cat !== "mobilite" && b.m.some((m) => muscles.includes(m)));
    const picked = pool.sort(() => Math.random() - 0.5).slice(0, n);
    if (!picked.length) return toast("Rien trouvé, essaie d'autres muscles.");
    S.draft = {
      name: "Séance " + muscles.slice(0, 2).join(" & ").toLowerCase(),
      items: picked.map((b) => ({ ex: b.n, sets: b.cat === "cardio" ? 4 : 3, reps: b.cat === "cardio" ? "30 s" : "10", rest: b.cat === "cardio" ? 30 : 90 }))
    };
    save(); this.closeModal(); this.go("seances");
    toast("✨ Séance générée, à toi de jouer !");
  },

  /* --- WOD --- */
  showWOD() {
    const w = generateWOD();
    openModal(`<h3>🎲 WOD du jour — ${w.format}</h3>
      <p class="muted small mt">${w.d}</p>
      ${w.items.map((i) => `<div class="exo-row mt"><div class="mus-ico">🔥</div><div><div class="nm">${i.reps} × ${esc(i.n)}</div></div></div>`).join("")}
      <button class="btn wide mt" onclick="A.startWOD()">▶ Lancer ce WOD</button>`);
  },
  startWOD() {
    const w = generateWOD();
    this.launchPlayer("WOD du jour (" + w.format + ")", w.items.map((i) => ({ ex: i.n, sets: 3, reps: String(i.reps), rest: 45 })));
  },

  /* --- player --- */
  launchPlayer(name, items) {
    P = {
      name,
      start: Date.now(),
      note: "",
      items: items.map((it) => ({
        ex: it.ex, rest: it.rest != null ? it.rest : 90,
        sets: Array.from({ length: Math.max(1, parseInt(it.sets, 10) || 1) }, () => ({ w: "", r: "", t: it.reps, done: false }))
      }))
    };
    this.closeModal();
    PAGE = "player"; render();
  },
  startWorkout(i) { const w = S.workouts[i]; this.launchPlayer(w.name, w.items); },
  startProgramDay(pi, di) {
    const p = PROGRAMS[pi], d = p.days[di];
    this.launchPlayer(p.n + " — " + d.n, d.items.map((it) => ({ ex: it[0], sets: it[1], reps: it[2], rest: p.rest })));
  },
  copyProgram(pi) {
    const p = PROGRAMS[pi];
    for (const d of p.days) {
      S.workouts.push({ id: uid(), name: p.n + " — " + d.n, items: d.items.map((it) => ({ ex: it[0], sets: it[1], reps: it[2], rest: p.rest })) });
    }
    save(); checkBadges(); this.closeModal();
    toast("📋 " + p.days.length + " séances copiées dans « Mes séances »");
  },
  progDetail(i) { openModal(progDetailHTML(PROGRAMS[i], i)); },
  pSet(ii, si, k, v) { P.items[ii].sets[si][k] = v; },
  pDone(ii, si) {
    const st = P.items[ii].sets[si];
    st.done = !st.done;
    if (st.done) {
      if (!st.r) st.r = String(st.t).match(/^\d+$/) ? st.t : st.r;
      const remaining = P.items[ii].sets.some((s) => !s.done) || P.items.slice(ii + 1).some((it) => it.sets.some((s) => !s.done));
      if (remaining && P.items[ii].rest > 0) {
        const nextEx = P.items[ii].sets.some((s) => !s.done) ? P.items[ii].ex : (P.items[ii + 1] ? P.items[ii + 1].ex : "");
        startRest(P.items[ii].rest, nextEx ? "Ensuite : " + nextEx : "");
      }
    }
    render();
  },
  restSkip() { clearInterval(restInt); $("#rest-overlay").classList.remove("show"); },
  restAdd(s) { if (window._restSet && window._restLeft) window._restSet(window._restLeft() + s); },
  abandonWorkout() {
    if (!confirm("Abandonner cette séance ? Rien ne sera enregistré.")) return;
    P = null; this.go("seances");
  },
  finishWorkout() {
    if (!P) return;
    const doneItems = P.items.map((it) => ({ ex: it.ex, sets: it.sets.filter((s) => s.done).map((s) => ({ w: num(s.w), r: num(s.r) || (String(s.t).match(/^\d+$/) ? num(s.t) : 0), done: true })) })).filter((it) => it.sets.length);
    if (!doneItems.length && !confirm("Aucune série validée. Enregistrer quand même ?")) return;
    const vol = doneItems.reduce((a, it) => a + it.sets.reduce((b, s) => b + s.w * s.r, 0), 0);
    const dur = Math.max(1, Math.round((Date.now() - P.start) / 60000));
    /* détection PRs */
    const newPRs = [];
    for (const it of doneItems) {
      let best = null;
      for (const s of it.sets) {
        if (s.w > 0 && s.r > 0) {
          const e1 = s.w * (1 + s.r / 30);
          if (!best || e1 > best.e1rm) best = { w: s.w, r: s.r, e1rm: e1, date: todayStr() };
        }
      }
      const baseName = it.ex.split(" (")[0].split(" · ")[0];
      if (best && (!S.prs[baseName] || best.e1rm > S.prs[baseName].e1rm)) {
        S.prs[baseName] = best;
        newPRs.push(baseName + " " + best.w + " kg × " + best.r);
      }
    }
    S.history.push({ id: uid(), d: todayStr(), name: P.name, items: doneItems, vol, dur, note: P.note || "" });
    save();
    const badges = checkBadges(true);
    const nSets = doneItems.reduce((a, it) => a + it.sets.length, 0);
    P = null;
    PAGE = "suivi"; render();
    openModal(`<h3>🏁 Séance terminée, bravo !</h3>
      <div class="grid g3 mt">
        <div class="card stat"><div class="v">${nSets}</div><div class="l">séries validées</div></div>
        <div class="card stat"><div class="v">${Math.round(vol)}</div><div class="l">kg de volume</div></div>
        <div class="card stat"><div class="v">${dur}</div><div class="l">minutes</div></div>
      </div>
      ${newPRs.length ? `<div class="result-box mt">🏆 <b>Nouveau${newPRs.length > 1 ? "x" : ""} record${newPRs.length > 1 ? "s" : ""} !</b><br>${newPRs.map(esc).join("<br>")}</div>` : ""}
      ${badges.length ? `<div class="result-box mt">🏅 Badge${badges.length > 1 ? "s" : ""} débloqué${badges.length > 1 ? "s" : ""} : ${badges.map((b) => b.e + " " + b.n).join(", ")}</div>` : ""}
      <p class="quote mt">« ${QUOTES[Math.floor(Math.random() * QUOTES.length)]} »</p>
      <button class="btn wide mt" onclick="A.closeModal()">Continuer</button>`);
    beep(880, 0.2); beep(1100, 0.25, 0.2);
  },
  delHistory(id) {
    if (!confirm("Supprimer cette séance de l'historique ?")) return;
    S.history = S.history.filter((h) => h.id !== id);
    save(); render();
  },
  dayDetail(ds) {
    const list = S.history.filter((h) => h.d === ds);
    openModal(`<h3>📅 ${fmtDate(ds)}</h3>
      ${list.length ? list.map((h) => `<div class="card mt"><b>${esc(h.name)}</b><p class="muted small">${Math.round(h.vol)} kg · ${h.dur} min</p></div>`).join("") : '<p class="muted mt">Repos ce jour-là. Le repos aussi construit la montagne. 🪨</p>'}`);
  },
  calMove(dir) { calOffset += dir; render(); },

  /* --- suivi --- */
  quickWeight() {
    openModal(`<h3>⚖️ Poids du jour</h3>
      <div class="frow mt"><input type="number" step="0.1" id="qw-in" placeholder="Poids (${S.settings.unit})" autofocus>
      <button class="btn" onclick="A.addWeight('qw-in')">Enregistrer</button></div>`);
  },
  addWeight(inputId) {
    const inp = $("#" + (inputId || "w-in"));
    const v = num(inp && inp.value);
    if (!v || v < 20 || v > 400) return toast("Entre un poids valide !");
    const kg = toKg(v);
    S.weightLog = S.weightLog.filter((w) => w.d !== todayStr());
    S.weightLog.push({ d: todayStr(), kg });
    S.weightLog.sort((a, b) => a.d.localeCompare(b.d));
    if (!S.settings.poids) S.settings.poids = String(kg);
    save(); checkBadges(); this.closeModal();
    if (PAGE === "suivi" || PAGE === "home") render();
    toast("⚖️ " + dispW(kg) + " enregistré");
  },
  addMeasure() {
    const m = { d: todayStr() };
    let any = false;
    for (const k of ["poitrine", "taille", "bras", "cuisse", "hanches"]) {
      const v = num($("#m-" + k).value);
      if (v) { m[k] = v; any = true; }
    }
    if (!any) return toast("Remplis au moins une mesure !");
    S.measures = S.measures.filter((x) => x.d !== todayStr());
    S.measures.push(m);
    save(); render(); toast("📏 Mesures enregistrées");
  },
  addSleep() {
    const v = num($("#sleep-in").value);
    if (!v || v > 24) return toast("Entre un nombre d'heures valide !");
    S.sleepLog[todayStr()] = v;
    save(); render(); toast("😴 Sommeil enregistré");
  },

  /* --- nutrition --- */
  calcTDEE() {
    S.settings.sexe = $("#n-sexe").value;
    S.settings.age = $("#n-age").value;
    S.settings.poids = $("#n-poids").value;
    S.settings.taille = $("#n-taille").value;
    S.settings.activite = $("#n-act").value;
    S.settings.objectif = $("#n-obj").value;
    save();
    if (!computeTDEE()) return toast("Remplis âge, poids et taille !");
    render();
  },
  addFood() {
    const n = $("#f-name").value.trim();
    const kcal = Math.round(num($("#f-kcal").value));
    const p = Math.round(num($("#f-prot").value));
    if (!n || !kcal) return toast("Nom et calories obligatoires !");
    this.quickFood(n, kcal, p);
  },
  quickFood(n, kcal, p) {
    const t = todayStr();
    if (!S.foodLog[t]) S.foodLog[t] = [];
    S.foodLog[t].push({ n, kcal, p: p || 0 });
    save(); checkBadges();
    if (PAGE === "nutrition") render();
    toast("🍎 Ajouté au journal");
  },
  delFood(i) {
    (S.foodLog[todayStr()] || []).splice(i, 1);
    save(); render();
  },
  addWater(n) { this.setWater((S.waterLog[todayStr()] || 0) + n); },
  setWater(n) {
    S.waterLog[todayStr()] = clamp(n, 0, 20);
    save(); checkBadges();
    if (PAGE === "nutrition" || PAGE === "home") render();
  },

  /* --- défis --- */
  defiStart(id) {
    S.challenges[id] = { start: todayStr(), done: [] };
    save(); checkBadges(); render();
    toast("🚀 Défi lancé ! Jour 1, c'est maintenant.");
  },
  defiToggle(id, i) {
    const ch = S.challenges[id];
    if (!ch) return;
    const idx = ch.done.indexOf(i);
    if (idx >= 0) ch.done.splice(idx, 1);
    else {
      ch.done.push(i);
      beep(880, 0.12);
      if (ch.done.length >= 30) { beep(1100, 0.3, 0.15); toast("🏆 DÉFI TERMINÉ ! Tu es une montagne."); }
    }
    save(); checkBadges(); render();
  },
  defiReset(id) {
    if (!confirm("Réinitialiser ce défi ?")) return;
    delete S.challenges[id];
    save(); render();
  },

  /* --- outils --- */
  tool(id) {
    const t = TOOLS.find((x) => x.id === id);
    const bodies = {
      rm: `<div class="frow mt"><input type="number" id="rm-w" placeholder="Charge (kg)"><input type="number" id="rm-r" placeholder="Répétitions" min="1" max="15"></div>
        <button class="btn wide mt" onclick="A.calcRM()">Calculer</button><div id="rm-out"></div>`,
      barre: `<div class="frow mt"><input type="number" id="bar-target" placeholder="Charge cible (kg)"><select id="bar-bar"><option value="20">Barre 20 kg</option><option value="15">Barre 15 kg</option><option value="10">Barre 10 kg</option><option value="7">Barre 7 kg</option></select></div>
        <button class="btn wide mt" onclick="A.calcBar()">Calculer les disques</button><div id="bar-out"></div>`,
      imc: `<div class="frow mt"><input type="number" id="imc-p" placeholder="Poids (kg)" value="${esc(S.settings.poids)}"><input type="number" id="imc-t" placeholder="Taille (cm)" value="${esc(S.settings.taille)}"></div>
        <button class="btn wide mt" onclick="A.calcIMC()">Calculer</button><div id="imc-out"></div>`,
      fc: `<div class="frow mt"><input type="number" id="fc-age" placeholder="Âge" value="${esc(S.settings.age)}"><input type="number" id="fc-repos" placeholder="FC repos (optionnel)"></div>
        <button class="btn wide mt" onclick="A.calcFC()">Calculer mes zones</button><div id="fc-out"></div>`,
      allure: `<div class="frow mt"><input type="number" step="0.01" id="al-d" placeholder="Distance (km)"><input id="al-t" placeholder="Temps (hh:mm:ss ou mm:ss)"></div>
        <button class="btn wide mt" onclick="A.calcAllure()">Calculer</button><div id="al-out"></div>`,
      kcal: `<label class="f">Activité</label><select id="kc-met">
          <option value="8">Course à pied 8 km/h (MET 8)</option><option value="11.5">Course 11 km/h (MET 11.5)</option>
          <option value="6">Musculation intense (MET 6)</option><option value="3.5">Musculation modérée (MET 3.5)</option>
          <option value="8">Vélo 20 km/h (MET 8)</option><option value="7">Rameur soutenu (MET 7)</option>
          <option value="12.3">Corde à sauter (MET 12.3)</option><option value="5.3">Yoga dynamique (MET 5.3)</option>
          <option value="9.8">HIIT (MET 9.8)</option><option value="3.3">Marche rapide (MET 3.3)</option><option value="7">Natation (MET 7)</option>
        </select>
        <div class="frow mt"><input type="number" id="kc-p" placeholder="Poids (kg)" value="${esc(S.settings.poids)}"><input type="number" id="kc-min" placeholder="Durée (min)"></div>
        <button class="btn wide mt" onclick="A.calcKcal()">Estimer</button><div id="kc-out"></div>`,
      conv: `<div class="frow mt"><input type="number" id="cv-kg" placeholder="kg" oninput="document.getElementById('cv-lb').value=(this.value*2.20462).toFixed(1)"><input type="number" id="cv-lb" placeholder="lb" oninput="document.getElementById('cv-kg').value=(this.value/2.20462).toFixed(1)"></div>
        <p class="muted small mt">Tape d'un côté, l'autre se remplit tout seul. 1 kg = 2,205 lb.</p>`,
      prot: `<div class="frow mt"><input type="number" id="pr-p" placeholder="Poids (kg)" value="${esc(S.settings.poids)}"><select id="pr-obj">
          <option value="1.2">Sédentaire (1,2 g/kg)</option><option value="1.6">Actif (1,6 g/kg)</option>
          <option value="1.8" selected>Musculation (1,8 g/kg)</option><option value="2.2">Sèche musclée (2,2 g/kg)</option></select></div>
        <button class="btn wide mt" onclick="A.calcProt()">Calculer</button><div id="pr-out"></div>`,
      tabata: timerUI("tabata", `<div class="frow"><div><label class="f">Travail (s)</label><input type="number" id="tb-work" value="20"></div>
        <div><label class="f">Repos (s)</label><input type="number" id="tb-rest" value="10"></div>
        <div><label class="f">Rounds</label><input type="number" id="tb-rounds" value="8"></div></div>`),
      emom: timerUI("emom", `<div class="frow"><div><label class="f">Intervalle (s)</label><input type="number" id="em-int" value="60"></div>
        <div><label class="f">Total (min)</label><input type="number" id="em-total" value="10"></div></div>`),
      amrap: timerUI("amrap", `<div class="frow"><div><label class="f">Durée (min)</label><input type="number" id="am-total" value="12"></div></div>`),
      chrono: timerUI("chrono", "")
    };
    openModal(`<h3>${t.e} ${t.n}</h3><p class="muted small">${t.d}</p>${bodies[id]}`);
  },
  calcRM() {
    const w = num($("#rm-w").value), r = num($("#rm-r").value);
    if (!w || !r) return toast("Remplis charge et répétitions !");
    const epley = w * (1 + r / 30);
    const brzycki = w * 36 / (37 - Math.min(r, 36));
    const rm = (epley + brzycki) / 2;
    const pct = [95, 90, 85, 80, 75, 70, 65, 60];
    const reps = ["2", "3-4", "5-6", "7-8", "9-10", "11-12", "13-15", "16-20"];
    $("#rm-out").innerHTML = `<div class="result-box">1RM estimé : <b>${rm.toFixed(1)} kg</b> <span class="muted small">(Epley ${epley.toFixed(1)} · Brzycki ${brzycki.toFixed(1)})</span></div>
      <table class="tb mt"><tr><th>% 1RM</th><th>Charge</th><th>Reps possibles</th></tr>
      ${pct.map((p, i) => `<tr><td>${p} %</td><td><b>${(rm * p / 100).toFixed(1)} kg</b></td><td>${reps[i]}</td></tr>`).join("")}</table>`;
  },
  calcBar() {
    const target = num($("#bar-target").value), bar = num($("#bar-bar").value);
    if (!target) return toast("Entre une charge cible !");
    if (target < bar) { $("#bar-out").innerHTML = `<div class="result-box">La cible est plus légère que la barre… prends une barre plus légère ou des haltères 😉</div>`; return; }
    let side = (target - bar) / 2;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const used = [];
    for (const p of plates) { while (side >= p - 0.001) { used.push(p); side -= p; } }
    $("#bar-out").innerHTML = `<div class="result-box">De chaque côté : <b>${used.length ? used.join(" + ") + " kg" : "rien"}</b>
      ${side > 0.01 ? `<br><span class="muted small">Il manque ${(side * 2).toFixed(1)} kg au total (disques indisponibles)</span>` : ""}
      <br><span class="muted small">Total barre : ${(target - side * 2).toFixed(1)} kg</span></div>`;
  },
  calcIMC() {
    const p = num($("#imc-p").value), t = num($("#imc-t").value) / 100;
    if (!p || !t) return toast("Remplis poids et taille !");
    const imc = p / (t * t);
    const cat = imc < 18.5 ? "Maigreur — mange, l'ami(e) 🍽️" : imc < 25 ? "Corpulence normale ✅" : imc < 30 ? "Surpoids — rien d'irréversible 💪" : "Obésité — un caillou à la fois, tu peux le faire 🪨";
    $("#imc-out").innerHTML = `<div class="result-box">IMC : <b>${imc.toFixed(1)}</b><br><span class="muted">${cat}</span><br><span class="muted small">⚠️ L'IMC ne distingue pas muscle et gras : un bodybuilder est « obèse » sur le papier.</span></div>`;
  },
  calcFC() {
    const age = num($("#fc-age").value), repos = num($("#fc-repos").value);
    if (!age) return toast("Entre ton âge !");
    const max = 220 - age;
    const zones = [["Zone 1 — Récupération", 50, 60], ["Zone 2 — Endurance fondamentale", 60, 70], ["Zone 3 — Tempo", 70, 80], ["Zone 4 — Seuil", 80, 90], ["Zone 5 — VO2 max", 90, 100]];
    const calc = (pct) => repos ? Math.round(repos + (max - repos) * pct / 100) : Math.round(max * pct / 100);
    $("#fc-out").innerHTML = `<div class="result-box">FC max estimée : <b>${max} bpm</b>${repos ? ` <span class="muted small">(méthode Karvonen avec FC repos ${repos})</span>` : ""}</div>
      <table class="tb mt"><tr><th>Zone</th><th>Plage</th></tr>
      ${zones.map((z) => `<tr><td>${z[0]}</td><td><b>${calc(z[1])} – ${calc(z[2])} bpm</b></td></tr>`).join("")}</table>`;
  },
  calcAllure() {
    const d = num($("#al-d").value);
    const parts = String($("#al-t").value).split(":").map(Number);
    if (!d || parts.some(isNaN) || !parts.length) return toast("Remplis distance et temps !");
    let secs = 0;
    if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) secs = parts[0] * 60 + parts[1];
    else secs = parts[0] * 60;
    if (!secs) return toast("Temps invalide !");
    const paceSec = secs / d;
    const pm = Math.floor(paceSec / 60), ps = Math.round(paceSec % 60);
    const speed = d / (secs / 3600);
    const riegel = (dist) => { const t2 = secs * Math.pow(dist / d, 1.06); const h = Math.floor(t2 / 3600), m = Math.floor(t2 % 3600 / 60), s = Math.round(t2 % 60); return (h ? h + "h" : "") + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); };
    $("#al-out").innerHTML = `<div class="result-box">Allure : <b>${pm}:${String(ps).padStart(2, "0")} min/km</b> · Vitesse : <b>${speed.toFixed(1)} km/h</b></div>
      <table class="tb mt"><tr><th>Distance</th><th>Prédiction (Riegel)</th></tr>
      <tr><td>5 km</td><td>${riegel(5)}</td></tr><tr><td>10 km</td><td>${riegel(10)}</td></tr>
      <tr><td>Semi (21,1 km)</td><td>${riegel(21.0975)}</td></tr><tr><td>Marathon (42,2 km)</td><td>${riegel(42.195)}</td></tr></table>`;
  },
  calcKcal() {
    const met = num($("#kc-met").value), p = num($("#kc-p").value), min = num($("#kc-min").value);
    if (!p || !min) return toast("Remplis poids et durée !");
    const kcal = Math.round(met * 3.5 * p / 200 * min);
    $("#kc-out").innerHTML = `<div class="result-box">≈ <b>${kcal} kcal</b> brûlées <span class="muted small">(estimation MET, ±20 %)</span></div>`;
  },
  calcProt() {
    const p = num($("#pr-p").value), r = num($("#pr-obj").value);
    if (!p) return toast("Entre ton poids !");
    $("#pr-out").innerHTML = `<div class="result-box">Objectif : <b>${Math.round(p * r)} g de protéines par jour</b><br><span class="muted small">Soit environ ${Math.ceil(p * r / 30)} portions de 30 g réparties sur la journée.</span></div>`;
  },

  /* --- timers --- */
  timerStart(mode) {
    stopTimer();
    T = { int: null, mode, phase: "", left: 0, round: 1, rounds: 0, work: 0, rest: 0, elapsed: 0, running: true };
    if (mode === "tabata") {
      T.work = num($("#tb-work").value) || 20;
      T.rest = num($("#tb-rest").value) || 10;
      T.rounds = num($("#tb-rounds").value) || 8;
      T.phase = "TRAVAIL"; T.left = T.work;
    } else if (mode === "emom") {
      T.work = num($("#em-int").value) || 60;
      T.rounds = Math.ceil((num($("#em-total").value) || 10) * 60 / T.work);
      T.phase = "TRAVAIL"; T.left = T.work;
    } else if (mode === "amrap") {
      T.phase = "TRAVAIL"; T.left = (num($("#am-total").value) || 12) * 60;
    } else { T.phase = "CHRONO"; T.left = 0; }
    beep(990, 0.3);
    timerDisplay();
    T.int = setInterval(() => {
      if (T.mode === "chrono") { T.left++; timerDisplay(); return; }
      T.left--;
      if (T.left <= 3 && T.left > 0) beep(660, 0.1);
      if (T.left <= 0) {
        if (T.mode === "amrap") { stopTimer(); T.phase = "TERMINÉ 🎉"; beep(990, 0.5); timerDisplay(); return; }
        if (T.mode === "emom") {
          T.round++;
          if (T.round > T.rounds) { stopTimer(); T.phase = "TERMINÉ 🎉"; beep(990, 0.5); timerDisplay(); return; }
          T.left = T.work; beep(990, 0.3);
        } else if (T.mode === "tabata") {
          if (T.phase === "TRAVAIL") {
            T.phase = "REPOS"; T.left = T.rest; beep(440, 0.3);
          } else {
            T.round++;
            if (T.round > T.rounds) { stopTimer(); T.phase = "TERMINÉ 🎉"; beep(990, 0.5); timerDisplay(); return; }
            T.phase = "TRAVAIL"; T.left = T.work; beep(990, 0.3);
          }
        }
      }
      timerDisplay();
    }, 1000);
  },
  timerStop() { stopTimer(); T.phase = "PAUSE"; timerDisplay(); },

  /* --- profil --- */
  setSetting(k, v) {
    S.settings[k] = v;
    save();
    if (k === "theme") document.body.dataset.theme = v;
    render();
  },
  exportData() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cailloux-sauvegarde-" + todayStr() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("⬇️ Sauvegarde téléchargée");
  },
  importData(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.settings) throw new Error("format");
        S = Object.assign({}, DEFAULT_STATE, data);
        save();
        document.body.dataset.theme = S.settings.theme;
        render();
        toast("⬆️ Données importées avec succès !");
      } catch (e) { toast("❌ Fichier invalide"); }
    };
    reader.readAsText(file);
  },
  resetData() {
    if (!confirm("Tout effacer ? Séances, historique, records… TOUT. Cette action est définitive.")) return;
    if (!confirm("Vraiment sûr ? Pense à exporter avant !")) return;
    localStorage.removeItem("cailloux_state");
    location.reload();
  }
};

function timerUI(mode, cfg) {
  return `${cfg}
  <div class="timer-phase mt" id="t-phase">Prêt ?</div>
  <div class="timer-disp" id="t-disp">00:00</div>
  <div class="row mt" style="justify-content:center">
    <button class="btn big" onclick="A.timerStart('${mode}')">▶ Démarrer</button>
    <button class="btn sec" onclick="A.timerStop()">⏸ Stop</button>
  </div>`;
}

window.A = A;

/* ================= Init ================= */
document.body.dataset.theme = S.settings.theme || "dark";
$("#nav-side").innerHTML = navHTML(NAV, false);
$("#bottomnav").innerHTML = navHTML(NAV.filter(([id]) => NAV_MOBILE.includes(id)), true);
$("#side-count").textContent = EXOS.length.toLocaleString("fr-FR") + " exercices chargés";
checkBadges(true);
render();
