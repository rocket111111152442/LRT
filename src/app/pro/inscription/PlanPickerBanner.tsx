"use client";

import { useState } from "react";
import { Building2, ChevronDown, ChevronUp, HardDrive, Smartphone, TrendingUp, Wrench } from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Essentiel",
    price: "Inclus",
    priceNote: "dans l'abonnement 89,99 €/an",
    highlight: false,
    storage: "5 Go",
    repairs: "300 réparations / mois",
    photos: "~3 photos par réparation",
    clients: "~3 600 fiches clients / an",
    technicians: "1 technicien",
    description: "Parfait pour démarrer. Couvre largement un atelier solo avec 10 réparations par jour.",
  },
  {
    id: "active_shop_pack",
    name: "Boutique Active",
    price: "+49,99 €/an",
    priceNote: "en supplément de l'abonnement",
    highlight: false,
    storage: "50 Go",
    repairs: "1 000 réparations / mois",
    photos: "~8 photos par réparation",
    clients: "~12 000 fiches clients / an",
    technicians: "2–3 techniciens",
    description: "Pour une boutique qui tourne : 30–40 réparations/jour, nombreuses photos HD, clientèle fidèle.",
  },
  {
    id: "big_workshop_pack",
    name: "Gros Atelier",
    price: "+149,99 €/an",
    priceNote: "en supplément de l'abonnement",
    highlight: true,
    storage: "100 Go",
    repairs: "3 000 réparations / mois",
    photos: "~15 photos par réparation",
    clients: "~36 000 fiches clients / an",
    technicians: "4–6 techniciens",
    description: "Multi-techniciens avec des appareils complexes. Support prioritaire inclus.",
  },
  {
    id: "multi_shop_pack",
    name: "Multi-Boutiques",
    price: "+299,99 €/an",
    priceNote: "en supplément de l'abonnement",
    highlight: false,
    storage: "250 Go",
    repairs: "10 000 réparations / mois",
    photos: "Illimitées en pratique",
    clients: "~120 000 fiches clients / an",
    technicians: "Plusieurs points de vente",
    description: "Plusieurs magasins, tableau de bord centralisé, statistiques par boutique.",
  },
];

export function PlanPickerBanner() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("basic");

  const current = plans.find((p) => p.id === selected) ?? plans[0];

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">
            Votre volume de départ
          </p>
          <p className="mt-1 text-base font-extrabold text-slate-950">
            {current.name} — {current.storage}, {current.repairs}
          </p>
          <p className="text-sm text-slate-600">{current.price}</p>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div className="mt-4 grid gap-3 border-t border-sky-100 pt-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                selected === plan.id
                  ? "border-brand-blue bg-white shadow-md shadow-sky-100 ring-2 ring-brand-blue"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-950">{plan.name}</span>
                {plan.highlight ? (
                  <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[11px] font-bold text-white">
                    Populaire
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-extrabold text-brand-blue">{plan.price}</span>
              <span className="text-xs text-slate-500">{plan.priceNote}</span>
              <ul className="mt-1 grid gap-1.5">
                <li className="flex items-center gap-1.5 text-xs text-slate-700">
                  <HardDrive className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                  {plan.storage} de stockage
                </li>
                <li className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Wrench className="h-3.5 w-3.5 shrink-0 text-brand-green" aria-hidden="true" />
                  {plan.repairs}
                </li>
                <li className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Smartphone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  {plan.photos}
                </li>
                <li className="flex items-center gap-1.5 text-xs text-slate-700">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  {plan.clients}
                </li>
                <li className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  {plan.technicians}
                </li>
              </ul>
              <p className="mt-1 text-xs leading-4 text-slate-500 italic">
                {plan.description}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {selected === "basic"
          ? "L'offre Essentiel est incluse dans l'abonnement. Vous pourrez passer à une offre supérieure à tout moment depuis votre panel admin, sans perdre aucune donnée."
          : "Vous pourrez activer cette option après votre inscription depuis la section « Offres » de votre panel admin. Commencez par l'essai gratuit 72h sans engagement."}
      </p>
    </div>
  );
}
