/* Illustrations du site — dessinées à la main en SVG, aux couleurs de la marque.
   Elles sont insérées dans les pages (pas de requête réseau supplémentaire) et
   restent nettes à toutes les tailles. Palette : rouge #b41f24 / #8b1418,
   argent #c9c9c9, encre #1a1c1f. */

const R = "#b41f24";
const RF = "#8b1418";
const RC = "#d94a4f";
const G = "#c9c9c9";
const GC = "#eceae7";
const E = "#1a1c1f";

const cadre = (contenu, fond = "#f6f5f3") =>
  `<svg viewBox="0 0 400 250" role="img" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="250" fill="${fond}"/>
  ${contenu}
</svg>`;

/* massif suisse, motif récurrent en arrière-plan */
const montagnes = (y = 250, o = 1) => `
  <g opacity="${o}">
    <path d="M0 ${y}V${y - 78}l62-52 46 39 58-70 54 66 46-38 74 62v71Z" fill="${GC}"/>
    <path d="M0 ${y}V${y - 44}l78-42 56 34 62-52 60 52 66-30 78 44v38Z" fill="${G}" opacity=".55"/>
  </g>`;

export const ILL = {
  /* famille : trois silhouettes sous un arc protecteur */
  famille: cadre(`
    ${montagnes(250, .5)}
    <path d="M200 44c48 0 86 34 86 78v52H114v-52c0-44 38-78 86-78Z" fill="${R}" opacity=".08"/>
    <g>
      <circle cx="156" cy="112" r="20" fill="${RF}"/>
      <path d="M124 186c0-19 14-34 32-34s32 15 32 34v18h-64Z" fill="${RF}"/>
      <circle cx="244" cy="112" r="20" fill="${R}"/>
      <path d="M212 186c0-19 14-34 32-34s32 15 32 34v18h-64Z" fill="${R}"/>
      <circle cx="200" cy="150" r="14" fill="${RC}"/>
      <path d="M178 204c0-13 10-23 22-23s22 10 22 23v0h-44Z" fill="${RC}"/>
    </g>
    <path d="M148 74c14-16 38-16 52 0" stroke="${R}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`),

  /* logement : maison + bouclier */
  maison: cadre(`
    ${montagnes(250, .45)}
    <path d="M110 128 200 62l90 66" stroke="${E}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M126 122v84h148v-84" fill="#fff" stroke="${E}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="180" y="158" width="40" height="48" fill="${R}"/>
    <rect x="142" y="140" width="26" height="26" fill="${GC}" stroke="${E}" stroke-width="3"/>
    <rect x="232" y="140" width="26" height="26" fill="${GC}" stroke="${E}" stroke-width="3"/>
    <path d="M200 52 296 88v26" stroke="${R}" stroke-width="6" stroke-linecap="round"/>
    <path d="M300 120c14 0 26 5 26 5v22c0 16-11 28-26 34-15-6-26-18-26-34v-22s12-5 26-5Z" fill="${R}"/>
    <path d="m291 145 6 6 13-13" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),

  /* mobilité : véhicule */
  voiture: cadre(`
    ${montagnes(250, .4)}
    <path d="M92 168v-22l22-40h172l24 40v22" stroke="${E}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M118 110h164l18 34H100Z" fill="${GC}"/>
    <rect x="84" y="160" width="232" height="34" rx="10" fill="${R}"/>
    <circle cx="132" cy="196" r="18" fill="${E}"/>
    <circle cx="132" cy="196" r="7" fill="#fff"/>
    <circle cx="268" cy="196" r="18" fill="${E}"/>
    <circle cx="268" cy="196" r="7" fill="#fff"/>
    <path d="M96 176h30M274 176h30" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`),

  /* santé : croix et tracé cardiaque */
  sante: cadre(`
    <rect x="70" y="70" width="260" height="118" rx="16" fill="#fff" stroke="${E}" stroke-width="5"/>
    <path d="M84 132h52l16-30 22 62 20-44 14 22h56" stroke="${R}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(268 46)">
      <rect width="62" height="62" rx="14" fill="${R}"/>
      <path d="M26 14h10v12h12v10H36v12H26V36H14V26h12Z" fill="#fff"/>
    </g>
    <path d="M96 208h208" stroke="${G}" stroke-width="5" stroke-linecap="round"/>`),

  /* épargne : capital qui monte */
  epargne: cadre(`
    ${montagnes(250, .35)}
    <rect x="96" y="150" width="44" height="56" rx="5" fill="${G}"/>
    <rect x="156" y="118" width="44" height="88" rx="5" fill="${RC}"/>
    <rect x="216" y="88" width="44" height="118" rx="5" fill="${R}"/>
    <rect x="276" y="58" width="44" height="148" rx="5" fill="${RF}"/>
    <path d="M92 128 130 96l44 26 44-38 46-30" stroke="${E}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 9"/>
    <circle cx="256" cy="54" r="9" fill="${E}"/>
    <path d="M96 220h224" stroke="${G}" stroke-width="4" stroke-linecap="round"/>`),

  /* entreprise : immeuble et collaborateurs */
  entreprise: cadre(`
    <rect x="92" y="62" width="118" height="146" fill="#fff" stroke="${E}" stroke-width="5"/>
    <rect x="222" y="112" width="86" height="96" fill="${GC}" stroke="${E}" stroke-width="5"/>
    <g fill="${R}">
      <rect x="110" y="82" width="22" height="22"/><rect x="146" y="82" width="22" height="22"/>
      <rect x="110" y="118" width="22" height="22"/><rect x="146" y="118" width="22" height="22"/>
      <rect x="110" y="154" width="22" height="22"/><rect x="146" y="154" width="22" height="22"/>
    </g>
    <g fill="${RF}">
      <rect x="240" y="132" width="20" height="20"/><rect x="272" y="132" width="20" height="20"/>
      <rect x="240" y="166" width="20" height="20"/><rect x="272" y="166" width="20" height="20"/>
    </g>
    <path d="M76 208h248" stroke="${E}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="200" cy="46" r="10" fill="${R}"/>`),

  /* frontalier : la route qui passe la frontière */
  frontiere: cadre(`
    ${montagnes(250, .55)}
    <path d="M116 226c0-58 18-96 84-96s84 38 84 96" stroke="${E}" stroke-width="26" stroke-linecap="round" opacity=".12"/>
    <path d="M116 226c0-58 18-96 84-96s84 38 84 96" stroke="${G}" stroke-width="18" stroke-linecap="round"/>
    <path d="M158 214c4-40 16-62 42-62s38 22 42 62" stroke="#fff" stroke-width="4" stroke-dasharray="10 12"/>
    <rect x="188" y="52" width="24" height="86" rx="5" fill="#fff" stroke="${E}" stroke-width="4"/>
    <g fill="${R}">
      <rect x="188" y="60" width="24" height="16"/>
      <rect x="188" y="92" width="24" height="16"/>
      <rect x="188" y="124" width="24" height="14"/>
    </g>
    <circle cx="120" cy="86" r="22" fill="${R}" opacity=".14"/>
    <circle cx="292" cy="72" r="16" fill="${R}" opacity=".2"/>`),

  /* comparatif : documents mis côte à côte */
  comparatif: cadre(`
    <rect x="70" y="56" width="120" height="152" rx="10" fill="#fff" stroke="${E}" stroke-width="5"/>
    <rect x="210" y="56" width="120" height="152" rx="10" fill="#fff" stroke="${E}" stroke-width="5"/>
    <g stroke="${G}" stroke-width="7" stroke-linecap="round">
      <path d="M90 88h64M90 110h80M90 132h54"/>
      <path d="M230 88h64M230 110h80M230 132h44"/>
    </g>
    <rect x="90" y="156" width="80" height="30" rx="8" fill="${GC}"/>
    <rect x="230" y="156" width="80" height="30" rx="8" fill="${R}"/>
    <path d="m246 171 8 8 16-16" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="200" cy="132" r="24" fill="${RF}"/>
    <path d="M190 132h20M200 122v20" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),

  /* conseil : le rendez-vous */
  conseil: cadre(`
    <rect x="76" y="74" width="248" height="118" rx="14" fill="#fff" stroke="${E}" stroke-width="5"/>
    <path d="M76 104h248" stroke="${E}" stroke-width="5"/>
    <circle cx="98" cy="89" r="5" fill="${R}"/><circle cx="116" cy="89" r="5" fill="${G}"/>
    <circle cx="134" cy="89" r="5" fill="${G}"/>
    <circle cx="140" cy="146" r="22" fill="${R}"/>
    <path d="M110 186c0-18 13-30 30-30s30 12 30 30" fill="${R}" opacity=".55"/>
    <g stroke="${G}" stroke-width="8" stroke-linecap="round">
      <path d="M198 134h96M198 158h72"/>
    </g>
    <rect x="198" y="176" width="70" height="16" rx="8" fill="${RF}"/>`),
};

export const ILL_KEYS = Object.keys(ILL);
