"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { projects, featuredSlugs, type Project } from "@/content/projects";
import { projectTypes, services, site } from "@/content/site";

export type DialogKind = "index" | "services" | "contact" | null;
export type ContactIntent = { mode: "projet" | "devis"; reference?: string };

function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-lenis-prevent
      className="sheet"
    >
      <div className="sheet-inner">
        <div className="flex items-center justify-between gap-6 pb-8">
          <h2 id={titleId} className="eyebrow">
            {label}
          </h2>
          <button type="button" onClick={onClose} className="link-ui">
            Fermer <span aria-hidden>✕</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function IndexDialog({
  open,
  onClose,
  onGoTo,
  onContact,
}: {
  open: boolean;
  onClose: () => void;
  onGoTo: (featuredIndex: number) => void;
  onContact: (p: Project) => void;
}) {
  const featuredSet = new Set<string>(featuredSlugs);
  return (
    <Sheet open={open} onClose={onClose} label="Réalisations">
      <p className="display mb-10 max-w-3xl text-[clamp(30px,4vw,56px)] leading-[1.02]">
        {projects.length} sites conçus par Lullin Web.
      </p>
      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const fi = featuredSlugs.indexOf(p.slug as (typeof featuredSlugs)[number]);
          return (
            <li key={p.slug} className="group">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-[6px] outline-offset-4"
                style={{ boxShadow: `0 0 0 1px ${p.accent}40` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/screens/wall-sm/${p.slug}.webp`}
                  alt={`Aperçu du site ${p.name}`}
                  loading="lazy"
                  decoding="async"
                  width={256}
                  height={160}
                  className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </a>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <h3 className="display text-[22px] leading-tight">{p.name}</h3>
                <span className="text-[11px] text-ivory/55">{p.kind}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-ivory/65">{p.sector}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="link-ui">
                  Voir le site <span aria-hidden>↗</span>
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                {featuredSet.has(p.slug) && fi >= 0 ? (
                  <button type="button" className="link-ui" onClick={() => onGoTo(fi)}>
                    Voir sur le mur
                  </button>
                ) : null}
                <button type="button" className="link-ui" onClick={() => onContact(p)}>
                  Un projet similaire
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

export function ServicesDialog({
  open,
  onClose,
  onContact,
}: {
  open: boolean;
  onClose: () => void;
  onContact: (intent: ContactIntent) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} label="Services">
      <p className="display mb-12 max-w-3xl text-[clamp(30px,4vw,56px)] leading-[1.02]">
        Tout ce qu’il faut pour exister en ligne, au même endroit.
      </p>
      <ol className="border-t border-ivory/15">
        {services.map((s) => (
          <li
            key={s.n}
            className="grid gap-3 border-b border-ivory/15 py-7 md:grid-cols-[80px_1fr_1.1fr] md:gap-8"
          >
            <span className="text-[12px] tabular-nums text-ivory/50">{s.n}</span>
            <h3 className="display text-[clamp(26px,2.6vw,38px)] leading-[1.05]">{s.title}</h3>
            <div>
              <p className="text-[14px] leading-relaxed text-ivory/75">{s.body}</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ivory/55">
                {s.points.map((pt) => (
                  <li key={pt}>— {pt}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
        <button type="button" className="link-ui" onClick={() => onContact({ mode: "devis" })}>
          Demander un devis <span aria-hidden>→</span>
        </button>
        <button type="button" className="link-ui" onClick={() => onContact({ mode: "projet" })}>
          Discuter d’un projet <span aria-hidden>→</span>
        </button>
      </div>
    </Sheet>
  );
}

export function ContactDialog({
  open,
  onClose,
  intent,
}: {
  open: boolean;
  onClose: () => void;
  intent: ContactIntent;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isQuote = intent.mode === "devis";

  const close = () => {
    setSent(false);
    setError(null);
    onClose();
  };

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const type = String(f.get("type") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    const company = String(f.get("company") ?? "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      setError("Merci d’indiquer votre nom, un e-mail valide et quelques mots sur votre projet.");
      return;
    }
    setError(null);
    const subject = `${isQuote ? "Demande de devis" : "Nouveau projet"} — ${type || "Site internet"}`;
    const body = [
      `Nom : ${name}`,
      company ? `Entreprise : ${company}` : null,
      `E-mail : ${email}`,
      `Type de projet : ${type}`,
      intent.reference ? `Référence : ${intent.reference}` : null,
      "",
      message,
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <Sheet open={open} onClose={close} label={isQuote ? "Demander un devis" : "Discuter d’un projet"}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="display text-[clamp(32px,4vw,58px)] leading-[1.02]">
            {isQuote ? "Un devis clair, gratuit et sans engagement." : "Parlons de votre prochain site."}
          </p>
          <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-ivory/70">
            Décrivez votre activité et ce que vous attendez de votre site. Lullin Web vous répond par
            e-mail pour fixer un premier échange, par téléphone ou en visio.
          </p>
          <p className="mt-8 text-[13px]">
            <a className="link-ui" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="mt-2 text-[12px] text-ivory/50">{site.area}</p>
        </div>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field">
              <span>Nom *</span>
              <input name="name" autoComplete="name" required />
            </label>
            <label className="field">
              <span>E-mail *</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field">
              <span>Entreprise</span>
              <input name="company" autoComplete="organization" />
            </label>
            <label className="field">
              <span>Type de projet</span>
              <select name="type" defaultValue={projectTypes[0]}>
                {projectTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Votre projet *</span>
            <textarea
              name="message"
              rows={5}
              required
              defaultValue={
                intent.reference ? `Bonjour, je souhaiterais un site dans l’esprit de ${intent.reference}.` : ""
              }
              key={intent.reference ?? intent.mode}
            />
          </label>
          {error ? (
            <p role="alert" className="text-[13px] text-[#ff8a7a]">
              {error}
            </p>
          ) : null}
          {sent ? (
            <p role="status" className="text-[13px] text-ivory/75">
              Votre messagerie s’ouvre avec la demande pré-remplie. Si rien ne s’ouvre, écrivez
              directement à {site.email}.
            </p>
          ) : null}
          <div>
            <button type="submit" className="btn-pill">
              {isQuote ? "Envoyer la demande de devis" : "Envoyer"} <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}
