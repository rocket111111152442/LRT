"use client";

import { useState } from "react";
import { Link2, Mail, Share2 } from "lucide-react";

export function ShareButtons({ title, label }: { title: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // annulé par l'utilisateur ou API indisponible : on retombe sur la copie du lien
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      <button type="button" onClick={share} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-ink-700 hover:border-ivy-500" aria-label={label}>
        <Share2 size={15} aria-hidden="true" />
      </button>
      <button type="button" onClick={share} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-ink-700 hover:border-ivy-500" aria-label="Copier le lien">
        <Link2 size={15} aria-hidden="true" />
      </button>
      <a href={mailHref} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-ink-700 hover:border-ivy-500" aria-label="Partager par e-mail">
        <Mail size={15} aria-hidden="true" />
      </a>
      {copied ? <span className="text-xs text-ivy-600">✓</span> : null}
    </div>
  );
}
