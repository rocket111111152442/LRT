"use client";

import { FormEvent, useMemo, useState } from "react";
import { BadgeCheck, Mail, Send, Users, UserX } from "lucide-react";

type BroadcastAccount = {
  companyName: string;
  ownerEmail: string;
  paymentStatus: string;
};

type Audience = "ALL" | "PAID" | "UNPAID";

type BroadcastEmailTabProps = {
  accounts: BroadcastAccount[];
};

const audienceOptions: Array<{
  value: Audience;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    value: "ALL",
    label: "Tous les comptes",
    description: "Payants, essais et comptes inactifs",
    icon: Users,
  },
  {
    value: "PAID",
    label: "Comptes payants",
    description: "Uniquement les abonnements actifs",
    icon: BadgeCheck,
  },
  {
    value: "UNPAID",
    label: "Comptes non payants",
    description: "Essais, en attente et annulés",
    icon: UserX,
  },
];

function accountMatchesAudience(account: BroadcastAccount, audience: Audience) {
  if (audience === "PAID") {
    return account.paymentStatus === "PAID";
  }

  if (audience === "UNPAID") {
    return account.paymentStatus !== "PAID";
  }

  return true;
}

function personalizePreview(value: string, account?: BroadcastAccount) {
  return value
    .replaceAll("{{nom_magasin}}", account?.companyName || "Nom du magasin")
    .replaceAll("{{email_admin}}", account?.ownerEmail || "admin@exemple.com")
    .replaceAll("{{statut_compte}}", account?.paymentStatus || "PAID");
}

export function BroadcastEmailTab({
  accounts,
}: BroadcastEmailTabProps) {
  const [audience, setAudience] = useState<Audience>("ALL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [error, setError] = useState("");

  const recipients = useMemo(() => {
    const unique = new Map<string, BroadcastAccount>();

    for (const account of accounts) {
      if (!accountMatchesAudience(account, audience)) {
        continue;
      }

      const email = account.ownerEmail.trim().toLowerCase();

      if (email && !unique.has(email)) {
        unique.set(email, account);
      }
    }

    return [...unique.values()];
  }, [accounts, audience]);
  const previewAccount = recipients[0];
  const canSend =
    recipients.length > 0 &&
    subject.trim().length >= 3 &&
    message.trim().length >= 10 &&
    confirmed &&
    !sending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    setSending(true);
    setError("");
    setResultMessage("");

    try {
      const response = await fetch("/api/moderateur/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          subject,
          message,
          confirm: "ENVOYER",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? "Envoi impossible.");
        return;
      }

      setResultMessage(payload.message ?? "Emails envoyés.");
      setConfirmed(false);
    } catch {
      setError("Connexion impossible pendant l envoi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="grid content-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-300">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">
              Message aux comptes administrateurs
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Chaque destinataire reçoit son propre email. Les autres adresses
              ne sont jamais visibles.
            </p>
          </div>
        </div>

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
            Destinataires
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {audienceOptions.map((option) => {
              const Icon = option.icon;
              const active = audience === option.value;

              return (
                <label
                  key={option.value}
                  className={`grid cursor-pointer gap-2 rounded-xl border p-3 transition ${
                    active
                      ? "border-sky-400 bg-sky-500/15"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="broadcast-audience"
                    value={option.value}
                    checked={active}
                    onChange={() => {
                      setAudience(option.value);
                      setConfirmed(false);
                      setError("");
                      setResultMessage("");
                    }}
                    className="sr-only"
                  />
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "text-sky-300" : "text-slate-500"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold text-white">
                    {option.label}
                  </span>
                  <span className="text-xs leading-5 text-slate-400">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="text-sm font-semibold text-sky-300">
            {recipients.length} adresse{recipients.length > 1 ? "s" : ""} unique
            {recipients.length > 1 ? "s" : ""} sélectionnée
            {recipients.length > 1 ? "s" : ""}
          </p>
        </fieldset>

        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Objet de l&apos;email
          <input
            type="text"
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setConfirmed(false);
            }}
            minLength={3}
            maxLength={160}
            required
            placeholder="Exemple : Une nouveauté importante sur Qoravo"
            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none placeholder:text-slate-600 focus:border-sky-400"
          />
          <span className="text-right text-xs font-normal text-slate-500">
            {subject.length}/160
          </span>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Message
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setConfirmed(false);
            }}
            minLength={10}
            maxLength={10_000}
            required
            rows={12}
            placeholder={"Bonjour {{nom_magasin}},\n\nÉcrivez votre message ici…"}
            className="resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-400"
          />
          <span className="text-right text-xs font-normal text-slate-500">
            {message.length}/10 000
          </span>
        </label>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">
            Personnalisation disponible
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {[
              "{{nom_magasin}}",
              "{{email_admin}}",
              "{{statut_compte}}",
            ].map((variable) => (
              <code
                key={variable}
                className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-cyan-200"
              >
                {variable}
              </code>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-950/20 p-4 text-sm text-amber-100">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-amber-300/40 bg-transparent text-amber-400"
          />
          <span>
            J&apos;ai vérifié le contenu et je confirme l&apos;envoi à{" "}
            <strong>{recipients.length} compte(s)</strong>.
          </span>
        </label>

        {resultMessage ? (
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm font-semibold text-emerald-300">
            {resultMessage}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {sending
            ? "Envoi en cours…"
            : `Envoyer à ${recipients.length} compte(s)`}
        </button>
      </section>

      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-5 lg:sticky lg:top-20">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Aperçu pour un destinataire
        </p>
        <div className="mt-4 overflow-hidden rounded-xl bg-white text-slate-950">
          <div className="border-b-4 border-sky-500 px-5 py-4 text-xl font-extrabold">
            Qoravo
          </div>
          <div className="grid gap-3 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Objet
            </p>
            <p className="break-words font-bold">
              {personalizePreview(subject, previewAccount) ||
                "Votre objet apparaîtra ici"}
            </p>
            <div className="my-1 h-px bg-slate-200" />
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {personalizePreview(message, previewAccount) ||
                "Votre message apparaîtra ici."}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Utilisez cet outil pour les informations liées au service Qoravo.
          Les limites quotidiennes de votre fournisseur SMTP restent
          applicables.
        </p>
      </aside>
    </form>
  );
}
