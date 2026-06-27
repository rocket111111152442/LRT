"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

type FaqItem = { q: string; a: string; tags: string[] };

const FAQ: FaqItem[] = [
  {
    q: "Je ne reçois pas le code de connexion par email",
    a: "Vérifiez vos spams et que l'adresse est correcte. Le code expire après 10 minutes : redemandez-en un. Si votre boîte bloque les emails, ajoutez l'expéditeur Qoravo à vos contacts. Si rien n'arrive après 2 essais, envoyez une demande ci-dessous (catégorie Connexion).",
    tags: ["connexion", "code", "email"],
  },
  {
    q: "Comment configurer les emails automatiques (PRÊT, devis, avis) ?",
    a: "Allez dans Admin → Email. Renseignez votre adresse SMTP et le mot de passe d'application, puis personnalisez les modèles. Les variables comme {{prenom}} ou {{ticket}} sont remplacées automatiquement à l'envoi.",
    tags: ["email", "smtp", "configuration"],
  },
  {
    q: "À quoi sert le QR code de mon atelier ?",
    a: "Le QR code de dépôt, affiché au comptoir, permet à vos clients d'enregistrer eux-mêmes leur appareil et de suivre leur réparation. Vous le trouvez dans Admin → QR code.",
    tags: ["qr", "suivi", "depot"],
  },
  {
    q: "Comment masquer ma boutique de la recherche publique ?",
    a: "Dans Admin → Paramètres, désactivez « Afficher ma boutique aux clients ». Votre boutique disparaît de la recherche publique, mais votre lien direct continue de fonctionner.",
    tags: ["boutique", "visibilité", "public"],
  },
  {
    q: "Comment gérer mon stock et mon catalogue ?",
    a: "Admin → Stock : ajoutez vos pièces, quantités, seuils d'alerte et prix. Le stock se décrémente automatiquement quand vous l'utilisez sur une réparation.",
    tags: ["stock", "catalogue", "pièces"],
  },
  {
    q: "Comment fonctionne la comptabilité ?",
    a: "Admin → Compta : enregistrez ventes et dépenses, suivez la TVA, les charges et la paie. Les totaux se calculent automatiquement. Vous pouvez exporter vos données.",
    tags: ["compta", "tva", "comptabilité"],
  },
  {
    q: "Comment prolonger ou gérer mon essai gratuit ?",
    a: "L'essai gratuit dure 72h. Pour continuer, abonnez-vous depuis le bandeau ou la page Paiement. Une question sur votre essai ? Envoyez une demande au service client.",
    tags: ["essai", "abonnement", "paiement"],
  },
  {
    q: "Comment signaler un bug ou une erreur sur une fiche ?",
    a: "Envoyez une demande ci-dessous en catégorie « Bug / erreur technique », en précisant la page, le numéro de ticket concerné et ce que vous faisiez. Plus c'est précis, plus vite on corrige.",
    tags: ["bug", "erreur", "technique"],
  },
  {
    q: "Comment prendre rendez-vous / gérer mon agenda ?",
    a: "Admin → Agenda affiche vos créneaux. Réglez la durée des créneaux et le nombre de rendez-vous par créneau dans Admin → Paramètres.",
    tags: ["agenda", "rendez-vous", "créneau"],
  },
];

// Centre d'aide en libre-service : recherche + questions/réponses dépliables.
export function SupportFaq() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? FAQ.filter(
        (item) =>
          item.q.toLowerCase().includes(needle) ||
          item.a.toLowerCase().includes(needle) ||
          item.tags.some((t) => t.includes(needle)),
      )
    : FAQ;

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Centre d&apos;aide</h2>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une réponse…"
          className="min-h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        />
      </div>
      <div className="grid gap-2">
        {filtered.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.q} className="overflow-hidden rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                aria-expanded={isOpen}
              >
                {item.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen ? (
                <p className="border-t border-slate-200 px-4 py-3 text-sm leading-6 text-slate-600">{item.a}</p>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="px-1 py-3 text-sm text-slate-500">
            Aucune réponse trouvée. Envoyez une demande au service client ci-dessous.
          </p>
        ) : null}
      </div>
    </div>
  );
}
