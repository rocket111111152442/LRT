"use client";

import { useMemo, useState } from "react";
import { Building2, Check, SendHorizonal, ThumbsDown } from "lucide-react";
import {
  MONTHLY_OPTIONS,
  ONE_TIME_OPTIONS,
  VOLUME_TIERS,
  computeEnterpriseQuote,
  normalizeSelection,
  summarizeSelection,
  type EnterpriseSelection,
} from "@/lib/enterpriseQuote";

type Props = { adminEmail: string; companyName: string };

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function EnterpriseQuoteClient({ adminEmail, companyName }: Props) {
  const [shops, setShops] = useState(1);
  const [seats, setSeats] = useState(2);
  const [storageGb, setStorageGb] = useState(10);
  const [volume, setVolume] = useState("v0");
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [monthly, setMonthly] = useState<Record<string, boolean>>({});
  const [oneTime, setOneTime] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [sentErr, setSentErr] = useState("");

  const selection = useMemo<EnterpriseSelection>(
    () =>
      normalizeSelection({
        shops,
        seats,
        storageGb,
        volume,
        billing,
        monthlyOptions: Object.keys(monthly).filter((k) => monthly[k]),
        oneTimeOptions: Object.keys(oneTime).filter((k) => oneTime[k]),
      }),
    [shops, seats, storageGb, volume, billing, monthly, oneTime],
  );
  const quote = useMemo(() => computeEnterpriseQuote(selection), [selection]);

  function buildSupportMessage() {
    return [
      "Demande d'offre entreprise SUR MESURE (l'estimation automatique ne convient pas) :",
      "",
      `Boutique : ${companyName}`,
      `Email admin : ${adminEmail}`,
      "",
      summarizeSelection(selection),
      "",
      `Estimation mensuelle : ${eur(quote.monthlyAfter)}`,
      `Estimation annuelle : ${eur(quote.annualTotal)}`,
      quote.oneTimeTotal > 0 ? `Frais de mise en place : ${eur(quote.oneTimeTotal)}` : "",
      "",
      notes ? `Précisions du client :\n${notes}` : "",
    ].filter(Boolean).join("\n");
  }

  // « Cette offre me convient » → redirection vers le paiement Stripe.
  async function pay() {
    setSending(true); setSentMsg(""); setSentErr("");
    try {
      const res = await fetch("/api/admin/enterprise-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selection),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }
      setSentErr(payload.error ?? "Paiement impossible pour le moment.");
    } catch {
      setSentErr("Erreur réseau.");
    } finally {
      setSending(false);
    }
  }

  // « Ça ne me convient pas » → message au service client pour un devis humain.
  async function contactSupport() {
    setSending(true); setSentMsg(""); setSentErr("");
    try {
      const res = await fetch("/api/contact-offre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName || adminEmail,
          email: adminEmail,
          offre: "enterprise",
          message: buildSupportMessage(),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        setSentMsg("Demande envoyée au service client. Un conseiller vous proposera une offre vraiment adaptée sous 24h.");
      } else {
        setSentErr(payload.error ?? "Envoi impossible.");
      }
    } catch {
      setSentErr("Erreur réseau.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      {/* Questionnaire */}
      <div className="grid gap-5">
        <Card title="Votre activité">
          <NumberField label="Nombre de boutiques" value={shops} min={1} max={50} onChange={setShops} />
          <NumberField label="Nombre de postes employés" value={seats} min={1} max={200} onChange={setSeats} />
          <NumberField label="Stockage souhaité (Go)" value={storageGb} min={10} max={1000} step={10} onChange={setStorageGb} />
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800">Volume de réparations</label>
            <select
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              {VOLUME_TIERS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800">Facturation</label>
            <div className="flex gap-2">
              {(["annual", "monthly"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBilling(b)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    billing === b
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {b === "annual" ? "Annuelle (-15%)" : "Mensuelle"}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Options incluses chaque mois">
          <div className="grid gap-2 sm:grid-cols-2">
            {MONTHLY_OPTIONS.map((opt) => (
              <OptionToggle
                key={opt.id}
                checked={Boolean(monthly[opt.id])}
                onChange={(v) => setMonthly((m) => ({ ...m, [opt.id]: v }))}
                label={opt.label}
                price={`${eur(opt.price)}/mois`}
                help={opt.help}
              />
            ))}
          </div>
        </Card>

        <Card title="Services ponctuels (une seule fois)">
          <div className="grid gap-2 sm:grid-cols-2">
            {ONE_TIME_OPTIONS.map((opt) => (
              <OptionToggle
                key={opt.id}
                checked={Boolean(oneTime[opt.id])}
                onChange={(v) => setOneTime((m) => ({ ...m, [opt.id]: v }))}
                label={opt.label}
                price={eur(opt.price)}
              />
            ))}
          </div>
        </Card>

        <Card title="Précisions (optionnel)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Besoins particuliers, contraintes, questions…"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </Card>
      </div>

      {/* Récapitulatif prix */}
      <aside className="grid content-start gap-4">
        <div className="sticky top-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-fuchsia-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-950">Votre estimation</h2>
          </div>

          <div className="grid gap-1.5 text-sm">
            {quote.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-3 text-slate-600">
                <span>{l.label}</span>
                <span className="font-medium text-slate-900">{eur(l.amount)}</span>
              </div>
            ))}
            {quote.annualDiscount > 0 ? (
              <div className="flex justify-between gap-3 text-emerald-700">
                <span>Remise annuelle (-15%)</span>
                <span className="font-medium">-{eur(quote.annualDiscount)}</span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-1 border-t border-slate-200 pt-3">
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold text-slate-700">Total mensuel</span>
              <span className="text-2xl font-extrabold text-slate-950">{eur(quote.monthlyAfter)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Soit par an</span>
              <span className="font-semibold">{eur(quote.annualTotal)}</span>
            </div>
            {quote.oneTimeTotal > 0 ? (
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Mise en place (une fois)</span>
                <span className="font-semibold">{eur(quote.oneTimeTotal)}</span>
              </div>
            ) : null}
          </div>

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
            Estimation indicative, non contractuelle. Un conseiller confirme le prix final selon vos besoins réels.
          </p>

          {sentMsg ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{sentMsg}</p>
          ) : null}
          {sentErr ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{sentErr}</p>
          ) : null}

          <button
            type="button"
            onClick={pay}
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-fuchsia-500 disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {sending ? "Redirection…" : "Cette offre me convient — payer"}
          </button>
          <button
            type="button"
            onClick={contactSupport}
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            Ça ne me convient pas — parler à un conseiller
          </button>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <SendHorizonal className="h-3.5 w-3.5" aria-hidden="true" />
            Paiement sécurisé par Stripe. Tout est activé automatiquement après paiement.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function NumberField({
  label, value, onChange, min, max, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-slate-800">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </div>
  );
}

function OptionToggle({
  checked, onChange, label, price, help,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; price: string; help?: string;
}) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
      checked ? "border-fuchsia-300 bg-fuchsia-50" : "border-slate-200 bg-white hover:bg-slate-50"
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-fuchsia-600"
      />
      <span className="grid gap-0.5">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <span className="text-xs font-bold text-fuchsia-700">{price}</span>
        {help ? <span className="text-xs leading-4 text-slate-500">{help}</span> : null}
      </span>
    </label>
  );
}
