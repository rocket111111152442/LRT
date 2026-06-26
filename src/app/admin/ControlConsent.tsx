"use client";

import { useEffect, useState } from "react";
import { ShieldQuestion, Check, X } from "lucide-react";

type Pending = { requestId: string; reason: string | null };

// Affiché sur toutes les pages admin : interroge le serveur toutes les 5 s pour
// savoir si un modérateur demande la prise en main, et présente une modale
// centrée pour accepter ou refuser.
export function ControlConsent() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState<"accept" | "refuse" | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch("/api/admin/control-request", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        if (data?.pending) {
          setPending({ requestId: data.requestId, reason: data.reason ?? null });
          setDone(null);
        } else if (!working) {
          setPending(null);
        }
      } catch {
        /* réseau indisponible : on réessaiera au prochain tick */
      }
    }

    void poll();
    const id = window.setInterval(poll, 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function respond(decision: "accept" | "refuse") {
    if (!pending) return;
    setWorking(true);
    try {
      await fetch("/api/admin/control-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: pending.requestId, decision }),
      });
      setDone(decision);
      setPending(null);
    } catch {
      /* on laisse la modale ouverte pour réessayer */
    } finally {
      setWorking(false);
    }
  }

  // Confirmation brève après acceptation.
  if (done === "accept") {
    return (
      <div className="fixed inset-x-0 top-4 z-[100] mx-auto w-fit rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-lg">
        Prise en main autorisée — le support peut intervenir.
      </div>
    );
  }

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
          <ShieldQuestion className="h-7 w-7 text-sky-600" aria-hidden="true" />
        </div>
        <h2 className="text-center text-lg font-extrabold text-slate-900">
          Le support souhaite prendre la main
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-600">
          Un membre du support Qoravo demande l&apos;autorisation d&apos;intervenir
          à distance sur votre logiciel (réparations, stock, agenda, comptabilité…).
          Vous gardez le contrôle : vous pouvez refuser.
        </p>
        {pending.reason ? (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
            Motif : {pending.reason}
          </p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => respond("refuse")}
            disabled={working}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Refuser
          </button>
          <button
            type="button"
            onClick={() => respond("accept")}
            disabled={working}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Autoriser
          </button>
        </div>
      </div>
    </div>
  );
}
