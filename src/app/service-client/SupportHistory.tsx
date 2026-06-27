"use client";

import { useEffect, useState } from "react";

type SupportRequest = {
  id: string;
  subject: string;
  message: string;
  category: string | null;
  priority: string;
  ticketRef: string | null;
  status: string;
  replyText: string | null;
  repliedAt: string | null;
  createdAt: string;
};

const statusLabel: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Reçue", className: "bg-sky-100 text-sky-800" },
  PENDING: { label: "En cours", className: "bg-amber-100 text-amber-800" },
  ANSWERED: { label: "Répondue", className: "bg-emerald-100 text-emerald-800" },
  CLOSED: { label: "Clôturée", className: "bg-slate-200 text-slate-700" },
};

// Historique des demandes du commerçant connecté, avec le statut et la réponse
// éventuelle du service client (affichée aussi en plus de l'email).
export function SupportHistory({ reloadKey = 0 }: { reloadKey?: number }) {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/support", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => {
        if (active) setRequests(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Chargement de vos demandes…
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Vous n&apos;avez encore envoyé aucune demande.
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Mes demandes ({requests.length})</h2>
      <div className="grid gap-3">
        {requests.map((req) => {
          const badge = statusLabel[req.status] ?? { label: req.status, className: "bg-slate-100 text-slate-700" };
          return (
            <div key={req.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{req.subject}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {req.priority === "URGENT" ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">Urgent</span>
                ) : null}
                {req.category ? (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-700">{req.category}</span>
                ) : null}
                {req.ticketRef ? (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-slate-600">#{req.ticketRef}</span>
                ) : null}
                <span className="text-slate-500">{new Date(req.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{req.message}</p>
              {req.replyText ? (
                <div className="rounded-md border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2 text-sm text-slate-700">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Réponse du service client
                    {req.repliedAt ? ` · ${new Date(req.repliedAt).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                  <p className="whitespace-pre-wrap">{req.replyText}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
