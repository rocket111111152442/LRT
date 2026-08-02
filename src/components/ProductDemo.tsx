"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  Package,
  Search,
  Smartphone,
  Wrench,
} from "lucide-react";

type DemoView = "dashboard" | "repair" | "stock" | "agenda" | "tracking";

const views: Array<{ id: DemoView; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "repair", label: "Fiche réparation", icon: Wrench },
  { id: "stock", label: "Stock", icon: Package },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "tracking", label: "Suivi client", icon: Smartphone },
];

const repairs = [
  { ticket: "QOR-104281", client: "Camille Martin", device: "iPhone 13", status: "En réparation", tone: "bg-sky-100 text-sky-800" },
  { ticket: "QOR-104277", client: "Nora Petit", device: "Galaxy S22", status: "En attente pièce", tone: "bg-amber-100 text-amber-800" },
  { ticket: "QOR-104269", client: "Alex Robert", device: "MacBook Air", status: "Prêt", tone: "bg-emerald-100 text-emerald-800" },
];

export function ProductDemo({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<DemoView>("dashboard");

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-col border-b border-slate-200 bg-slate-950 text-white lg:flex-row">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4 lg:w-56 lg:border-b-0 lg:border-r">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-sky-500 font-extrabold text-slate-950">Q</span>
          <div>
            <p className="font-bold">Atelier Démo</p>
            <p className="text-xs text-slate-400">Données de démonstration</p>
          </div>
        </div>
        <div className="flex flex-1 gap-1 overflow-x-auto p-2">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => {
                  setActive(view.id);
                  track("demo_view_changed", { view: view.id });
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${active === view.id ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={compact ? "min-h-[370px] p-4 sm:p-6" : "min-h-[520px] p-4 sm:p-7"}>
        {active === "dashboard" ? <DashboardView compact={compact} /> : null}
        {active === "repair" ? <RepairView /> : null}
        {active === "stock" ? <StockView /> : null}
        {active === "agenda" ? <AgendaView /> : null}
        {active === "tracking" ? <TrackingView /> : null}
      </div>
    </section>
  );
}

function DashboardView({ compact }: { compact: boolean }) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Aujourd&apos;hui</p>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Vue de l&apos;atelier</h3>
        </div>
        <div className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 sm:w-72">
          <Search className="h-4 w-4" /> Rechercher un ticket ou un client
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["12", "Nouvelles fiches", "bg-sky-50 text-sky-700"],
          ["8", "En cours", "bg-emerald-50 text-emerald-700"],
          ["3", "En attente pièce", "bg-amber-50 text-amber-700"],
          ["5", "Prêtes", "bg-violet-50 text-violet-700"],
        ].map(([value, label, tone]) => (
          <div key={label} className={`rounded-md border border-slate-200 p-4 ${tone}`}>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="mt-1 text-xs font-semibold">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-bold text-slate-950">Réparations récentes</h4>
          <span className="text-xs font-semibold text-sky-700">Mise à jour immédiate</span>
        </div>
        <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {repairs.slice(0, compact ? 2 : 3).map((repair) => (
            <div key={repair.ticket} className="grid gap-2 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-bold text-slate-950">{repair.ticket}</p>
                <p className="text-xs text-slate-500">{repair.client}</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{repair.device}</p>
              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${repair.tone}`}>{repair.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RepairView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Ticket QOR-104281</p>
        <h3 className="mt-1 text-2xl font-extrabold text-slate-950">iPhone 13 · écran cassé</h3>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Client", "Camille Martin"], ["Téléphone", "06 12 34 56 78"],
            ["Appareil", "Apple iPhone 13"], ["IMEI", "••••••••••••512"],
            ["Devis", "129,00 € accepté"], ["Récupération prévue", "Mercredi à 17:30"],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-slate-100 pb-3">
              <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 rounded-md bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Note interne</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">Écran commandé. Vérifier Face ID et la charge avant restitution.</p>
        </div>
      </div>
      <div className="rounded-md border border-sky-200 bg-sky-50 p-5">
        <p className="text-sm font-bold text-slate-950">Avancement</p>
        <ol className="mt-4 grid gap-4">
          {["Appareil déposé", "Devis accepté", "En réparation"].map((label) => (
            <li key={label} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {label}
            </li>
          ))}
          <li className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Clock3 className="h-5 w-5 text-sky-600" /> Prêt à récupérer
          </li>
        </ol>
      </div>
    </div>
  );
}

function StockView() {
  const items = [
    ["Écran iPhone 13 OLED", "4", "54,90 €", "Stock correct"],
    ["Batterie Galaxy S22", "1", "28,40 €", "Stock bas"],
    ["Connecteur USB-C universel", "12", "4,20 €", "Stock correct"],
  ];
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Pièces détachées</p>
      <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Stock et coûts d&apos;achat</h3>
      <div className="mt-6 overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Pièce</th><th className="p-3">Quantité</th><th className="p-3">Coût unitaire</th><th className="p-3">Alerte</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {items.map(([name, quantity, cost, alert]) => <tr key={name}><td className="p-3 font-semibold text-slate-900">{name}</td><td className="p-3">{quantity}</td><td className="p-3">{cost}</td><td className={`p-3 font-semibold ${alert === "Stock bas" ? "text-amber-700" : "text-emerald-700"}`}>{alert}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgendaView() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Planning atelier</p>
      <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Agenda du mercredi 5 août</h3>
      <div className="mt-6 grid gap-2">
        {[
          ["09:00", "Diagnostic · Galaxy S22", "Nora Petit", "border-sky-400 bg-sky-50"],
          ["11:30", "Dépôt · Nintendo Switch", "Louis Bernard", "border-emerald-400 bg-emerald-50"],
          ["15:00", "Récupération · MacBook Air", "Alex Robert", "border-violet-400 bg-violet-50"],
        ].map(([time, title, client, tone]) => (
          <div key={time} className={`grid gap-1 rounded-md border-l-4 p-4 sm:grid-cols-[80px_1fr_auto] sm:items-center ${tone}`}>
            <p className="font-extrabold text-slate-950">{time}</p><p className="font-semibold text-slate-800">{title}</p><p className="text-sm text-slate-500">{client}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackingView() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Smartphone className="h-7 w-7" /></span>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Suivi QOR-104281</p>
      <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Votre appareil est en réparation</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Le technicien travaille actuellement sur votre iPhone 13. Vous recevrez un email dès qu&apos;il sera prêt.</p>
      <div className="mt-8 grid grid-cols-4 gap-2">
        {["Reçu", "Devis", "Réparation", "Prêt"].map((step, index) => <div key={step}><div className={`mx-auto h-3 w-3 rounded-full ${index < 3 ? "bg-emerald-500" : "bg-slate-200"}`} /><p className="mt-2 text-xs font-semibold text-slate-600">{step}</p></div>)}
      </div>
      <div className="mt-8 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"><FileText className="h-4 w-4" /> Devis et reçu disponibles depuis le ticket</div>
    </div>
  );
}
