/* Réception des demandes du site — fonction sans serveur (Vercel).
   ---------------------------------------------------------------------------
   Le formulaire envoie ici ; la demande part ensuite par courriel vers
   l'adresse du cabinet. Deux fournisseurs sont reconnus, au choix, via les
   variables d'environnement du projet Vercel :

     RESEND_API_KEY     → https://resend.com   (offre gratuite : 100 mails/jour)
     BREVO_API_KEY      → https://brevo.com    (offre gratuite : 300 mails/jour)

   Autres variables :
     LEAD_TO            destinataire        (défaut : contacts@suisse-conseilsm.ch)
     LEAD_FROM          expéditeur vérifié   (défaut : onboarding@resend.dev)

   Si aucune clé n'est configurée, la fonction répond 501 et le site bascule
   automatiquement sur l'ouverture de la messagerie du visiteur : aucune
   demande n'est perdue en attendant la configuration.

   Extension .mjs : le site n'a pas de package.json, un fichier .js serait donc
   lu comme du CommonJS et le `export default` ne passerait pas.
*/

const DESTINATAIRE = process.env.LEAD_TO || "contacts@suisse-conseilsm.ch";
const EXPEDITEUR = process.env.LEAD_FROM || "onboarding@resend.dev";

/* garde-fou simple contre les envois en rafale depuis une même adresse */
const recents = new Map();
const TROP_FREQUENT = (ip) => {
  const maintenant = Date.now();
  for (const [cle, t] of recents) if (maintenant - t > 60_000) recents.delete(cle);
  if (recents.has(ip)) return true;
  recents.set(ip, maintenant);
  return false;
};

const echapper = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ erreur: "Méthode non autorisée" });
  }

  let corps = req.body;
  if (typeof corps === "string") {
    try { corps = JSON.parse(corps); } catch { corps = null; }
  }
  if (!corps || typeof corps !== "object") {
    return res.status(400).json({ erreur: "Requête illisible" });
  }

  /* champ piège : rempli uniquement par les robots */
  if (corps.site_web) return res.status(200).json({ ok: true });

  const nom = String(corps.nom || "").trim();
  const email = String(corps.email || "").trim();
  const telephone = String(corps.telephone || "").trim();

  if (!nom || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ erreur: "Nom ou adresse e-mail manquants" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "inconnue";
  if (TROP_FREQUENT(ip)) {
    return res.status(429).json({ erreur: "Merci de patienter avant un nouvel envoi" });
  }

  /* on reprend toutes les réponses transmises, dans l'ordre reçu ; si la
     demande arrive sans détail, on garde au moins les coordonnées */
  let reponses = Array.isArray(corps.reponses) ? corps.reponses : [];
  reponses = reponses.filter((r) => r && r.question && r.reponse);
  if (!reponses.length) {
    reponses = [
      { question: "Nom", reponse: nom },
      { question: "Adresse e-mail", reponse: email },
      { question: "Téléphone", reponse: telephone || "non communiqué" },
    ];
  }
  const assurance = String(corps.assurance || "Demande").trim();

  const texte = [
    `Nouvelle demande depuis le site — ${assurance}`,
    "",
    ...reponses.map((r) => `${r.question} : ${r.reponse}`),
    "",
    `Reçue le ${new Date().toLocaleString("fr-CH", { timeZone: "Europe/Zurich" })}`,
  ].join("\n");

  const html = `
    <h2 style="font:600 18px system-ui;margin:0 0 4px">Nouvelle demande — ${echapper(assurance)}</h2>
    <p style="font:14px system-ui;color:#555;margin:0 0 16px">Reçue le ${echapper(
      new Date().toLocaleString("fr-CH", { timeZone: "Europe/Zurich" })
    )}</p>
    <table style="font:14px system-ui;border-collapse:collapse">
      ${reponses
        .map(
          (r) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${echapper(
              r.question
            )}</td><td style="padding:6px 0;font-weight:600">${echapper(r.reponse)}</td></tr>`
        )
        .join("")}
    </table>`;

  const sujet = `Demande site — ${assurance} — ${nom}`;

  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Site Suisse-Conseils <${EXPEDITEUR}>`,
          to: [DESTINATAIRE],
          reply_to: email,
          subject: sujet,
          text: texte,
          html,
        }),
      });
      if (!r.ok) throw new Error("Resend : " + (await r.text()));
      return res.status(200).json({ ok: true });
    }

    if (process.env.BREVO_API_KEY) {
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: EXPEDITEUR, name: "Site Suisse-Conseils" },
          to: [{ email: DESTINATAIRE }],
          replyTo: { email, name: nom },
          subject: sujet,
          textContent: texte,
          htmlContent: html,
        }),
      });
      if (!r.ok) throw new Error("Brevo : " + (await r.text()));
      return res.status(200).json({ ok: true });
    }

    /* aucun fournisseur configuré : le site bascule sur la messagerie du visiteur */
    return res.status(501).json({ erreur: "Envoi non configuré" });
  } catch (e) {
    console.error("Échec de l'envoi du lead :", e && e.message);
    return res.status(502).json({ erreur: "Envoi impossible" });
  }
}
