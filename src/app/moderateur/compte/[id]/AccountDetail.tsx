"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck, Clock, KeyRound, MessageSquare,
  ShieldOff, Sparkles, Trash2, Wrench, XCircle,
  Hand, LogIn, Ban, Loader2,
} from "lucide-react";

type Repair  = { id: string; ticketNumber: string | null; firstName: string; lastName: string; status: string; paymentStatus: string; estimatedPriceCents: number | null; paidAmountCents: number | null; brand: string; model: string; deviceType: string; phone: string; email: string; createdAt: string };
type Message = { id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: string };
type Account = {
  id: string; companyName: string; slug: string; ownerEmail: string;
  paymentStatus: string; trialEndsAt: string | null; supportIncluded: boolean;
  plan: string; storageAddonGb: number; createdAt: string;
  users: { id: string; email: string; role: string }[];
};

type DetailData = { account: Account; repairs: Repair[]; messages: Message[] };

const planOptions = ["basic","extra_storage_10gb","extra_storage_25gb","active_shop_pack","big_workshop_pack","multi_shop_pack","enterprise"];

export function AccountDetail({ accountId }: { accountId: string }) {
  const [data, setData]         = useState<DetailData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [working, setWorking]   = useState(false);
  const [newPwd, setNewPwd]     = useState("");
  const [newPlan, setNewPlan]   = useState("basic");
  const [extendH, setExtendH]   = useState("72");
  const [repairPage, setRepairPage] = useState(0);
  const PAGE_SIZE = 50;

  // --- Prise en main (support à distance) ---
  const [controlStatus, setControlStatus] = useState<string | null>(null);
  const [controlBusy, setControlBusy]     = useState(false);
  const [controlMsg, setControlMsg]       = useState("");

  async function controlAction(body: Record<string, unknown>) {
    const res = await fetch(`/api/moderateur/compte/${accountId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, payload: await res.json().catch(() => ({})) };
  }

  async function pollControl() {
    try {
      const { res, payload } = await controlAction({ action: "control_status" });
      if (res.ok) setControlStatus(payload.request?.status ?? null);
    } catch { /* on réessaiera */ }
  }

  // Sonde l'état de la demande tant qu'elle est en attente / acceptée.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void pollControl();
    const id = window.setInterval(pollControl, 4000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  async function requestControl() {
    setControlBusy(true); setControlMsg("");
    try {
      const { res, payload } = await controlAction({ action: "request_control" });
      if (res.ok) { setControlStatus("PENDING"); setControlMsg(payload.message ?? ""); }
      else setControlMsg(payload.error ?? "Erreur.");
    } catch { setControlMsg("Erreur réseau."); }
    finally { setControlBusy(false); }
  }

  async function cancelControl() {
    setControlBusy(true); setControlMsg("");
    try {
      await controlAction({ action: "cancel_control" });
      setControlStatus("CANCELED");
    } catch { /* ignore */ }
    finally { setControlBusy(false); }
  }

  async function enterControl() {
    setControlBusy(true); setControlMsg("");
    try {
      const { res, payload } = await controlAction({ action: "enter_control" });
      if (res.ok) { window.location.href = payload.redirect ?? "/admin"; return; }
      setControlMsg(payload.error ?? "Erreur.");
    } catch { setControlMsg("Erreur réseau."); }
    finally { setControlBusy(false); }
  }

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/moderateur/compte/${accountId}`);
      if (res.status === 401) { window.location.href = "/moderateur/login"; return; }
      const payload = await res.json();
      if (!res.ok) { setError(payload.error ?? "Erreur."); return; }
      setData(payload);
      setNewPlan(payload.account.plan ?? "basic");
    } catch { setError("Chargement impossible."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  async function action(body: Record<string, unknown>) {
    setWorking(true); setActionMsg(""); setActionErr("");
    try {
      const res = await fetch(`/api/moderateur/compte/${accountId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        setActionMsg(payload.message ?? "Action effectuée.");
        if (payload.deleted) { window.location.href = "/moderateur"; return; }
        await load();
      } else { setActionErr(payload.error ?? "Erreur."); }
    } catch { setActionErr("Erreur réseau."); }
    finally { setWorking(false); }
  }

  if (loading) return <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">Chargement...</div>;
  if (error || !data) return <div className="rounded-xl border border-red-400/20 bg-red-900/20 p-4 text-sm text-red-300">{error || "Erreur."}</div>;

  const { account, repairs, messages } = data;
  const payBadge: Record<string, string> = {
    PAID: "bg-emerald-900/40 text-emerald-300", TRIAL: "bg-amber-900/40 text-amber-300",
    PENDING: "bg-slate-700 text-slate-400", CANCELED: "bg-red-900/40 text-red-300",
  };

  return (
    <div className="grid gap-6">
      {/* Infos compte */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{account.companyName}</h1>
            <p className="text-sm text-slate-400">{account.ownerEmail} · slug : <span className="text-slate-300">{account.slug}</span></p>
            <p className="mt-1 text-xs text-slate-500">Créé le {new Date(account.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${payBadge[account.paymentStatus] ?? "bg-slate-700 text-slate-400"}`}>
              {account.paymentStatus}
            </span>
            {account.supportIncluded && (
              <span className="rounded-full bg-sky-900/40 px-3 py-1 text-xs font-bold text-sky-300">Support ✓</span>
            )}
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
              Plan : {account.plan}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-1 text-sm text-slate-400">
          {account.trialEndsAt && (
            <p><Clock className="mr-1 inline h-3.5 w-3.5" />Essai jusqu&apos;au {new Date(account.trialEndsAt).toLocaleString("fr-FR")}</p>
          )}
          <p><Wrench className="mr-1 inline h-3.5 w-3.5" />{repairs.length} réparations</p>
          <p><MessageSquare className="mr-1 inline h-3.5 w-3.5" />{messages.length} message(s) support</p>
        </div>
      </section>

      {/* Alertes action */}
      {actionMsg && <div className="rounded-xl border border-emerald-400/30 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">{actionMsg}</div>}
      {actionErr && <div className="rounded-xl border border-red-400/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">{actionErr}</div>}

      {/* Prise en main (support à distance avec consentement) */}
      <section className="rounded-2xl border border-sky-400/30 bg-sky-950/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Hand className="h-4 w-4 text-sky-400" />
              Prendre la main sur le logiciel
            </h2>
            <p className="mt-1 max-w-xl text-xs text-slate-400">
              Envoie une demande au commerçant. Une fenêtre s&apos;affiche au centre
              de son espace admin : il doit accepter avant que vous puissiez entrer
              dans son logiciel et tout modifier (réparations, stock, agenda, compta…).
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            controlStatus === "ACCEPTED" ? "bg-emerald-900/50 text-emerald-300"
            : controlStatus === "PENDING" ? "bg-amber-900/50 text-amber-300"
            : controlStatus === "REFUSED" ? "bg-red-900/50 text-red-300"
            : controlStatus === "EXPIRED" ? "bg-slate-700 text-slate-400"
            : "bg-slate-800 text-slate-500"}`}>
            {controlStatus === "ACCEPTED" ? "Accepté"
              : controlStatus === "PENDING" ? "En attente du commerçant…"
              : controlStatus === "REFUSED" ? "Refusé"
              : controlStatus === "EXPIRED" ? "Expiré"
              : controlStatus === "CANCELED" ? "Annulé"
              : controlStatus === "ENDED" ? "Session terminée"
              : "Aucune demande"}
          </span>
        </div>

        {controlMsg && <p className="mt-3 text-xs text-slate-300">{controlMsg}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {controlStatus === "ACCEPTED" ? (
            <button onClick={enterControl} disabled={controlBusy}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50">
              {controlBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Entrer dans le logiciel
            </button>
          ) : controlStatus === "PENDING" ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-900/20 px-4 py-2 text-xs font-semibold text-amber-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                En attente de l&apos;accord du commerçant…
              </span>
              <button onClick={cancelControl} disabled={controlBusy}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50">
                <Ban className="h-4 w-4" />
                Annuler la demande
              </button>
            </>
          ) : (
            <button onClick={requestControl} disabled={controlBusy}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-500 disabled:opacity-50">
              {controlBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hand className="h-4 w-4" />}
              Demander la prise en main
            </button>
          )}
        </div>
      </section>

      {/* Boutons d'action */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-4 text-base font-bold text-white">Actions modérateur</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {/* Prolonger essai */}
          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Clock className="h-4 w-4 text-amber-400" />Prolonger l&apos;essai</p>
            <div className="flex gap-2">
              <input type="number" value={extendH} onChange={e => setExtendH(e.target.value)} className="min-h-9 w-20 rounded-lg border border-white/10 bg-white/10 px-2 text-sm text-white" />
              <span className="flex items-center text-sm text-slate-400">heures</span>
            </div>
            <button onClick={() => action({ action: "extend_trial", hours: Number(extendH) })} disabled={working}
              className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-400 disabled:opacity-50">
              Appliquer
            </button>
          </div>

          {/* Marquer payé */}
          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-200"><BadgeCheck className="h-4 w-4 text-emerald-400" />Marquer comme payé</p>
            <p className="text-xs text-slate-500">Active le compte sans paiement Stripe.</p>
            <button onClick={() => action({ action: "set_paid" })} disabled={working}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50">
              Activer PAID
            </button>
          </div>

          {/* Changer plan */}
          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Sparkles className="h-4 w-4 text-fuchsia-400" />Changer le plan</p>
            <select value={newPlan} onChange={e => setNewPlan(e.target.value)}
              className="min-h-9 rounded-lg border border-white/10 bg-white/10 px-2 text-sm text-white">
              {planOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={() => action({ action: "set_plan", plan: newPlan })} disabled={working}
              className="rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-fuchsia-500 disabled:opacity-50">
              Appliquer
            </button>
          </div>

          {/* Toggle support */}
          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              {account.supportIncluded
                ? <><ShieldOff className="h-4 w-4 text-slate-400" />Désactiver support</>
                : <><BadgeCheck className="h-4 w-4 text-sky-400" />Activer support</>}
            </p>
            <p className="text-xs text-slate-500">Actuellement : {account.supportIncluded ? "activé" : "désactivé"}</p>
            <button onClick={() => action({ action: "toggle_support" })} disabled={working}
              className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-500 disabled:opacity-50">
              Basculer
            </button>
          </div>

          {/* Reset mot de passe */}
          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-200"><KeyRound className="h-4 w-4 text-blue-400" />Nouveau mot de passe</p>
            <input type="text" value={newPwd} onChange={e => setNewPwd(e.target.value)}
              placeholder="Min. 6 caractères"
              className="min-h-9 rounded-lg border border-white/10 bg-white/10 px-2 text-sm text-white placeholder:text-slate-600" />
            <button onClick={() => action({ action: "reset_password", newPassword: newPwd })} disabled={working || newPwd.length < 6}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50">
              Réinitialiser
            </button>
          </div>

          {/* Annuler compte */}
          <div className="grid gap-2 rounded-xl border border-red-400/20 bg-red-900/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-300"><XCircle className="h-4 w-4" />Annuler le compte</p>
            <p className="text-xs text-red-400/70">Passe le statut en CANCELED. Réversible.</p>
            <button onClick={() => { if (window.confirm("Annuler ce compte ?")) action({ action: "cancel_account" }); }}
              disabled={working}
              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-50">
              Annuler compte
            </button>
          </div>

          {/* Suppression définitive */}
          <div className="grid gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-4 sm:col-span-2 xl:col-span-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-400">
              <Trash2 className="h-4 w-4" />
              Supprimer définitivement le compte
            </p>
            <p className="text-xs text-red-400/70">
              Supprime le compte pro, tous ses utilisateurs, toutes ses réparations,
              son stock, sa compta et ses messages. <strong className="text-red-300">Action irréversible.</strong>
            </p>
            <button
              onClick={() => {
                if (window.confirm(`⚠️ SUPPRESSION DÉFINITIVE\n\nToutes les données de "${account.companyName}" seront supprimées.\n\nEcrivez "SUPPRIMER" pour confirmer.`) &&
                    window.prompt(`Tapez SUPPRIMER pour confirmer la suppression de "${account.companyName}" :`) === "SUPPRIMER") {
                  void action({ action: "delete_account" });
                }
              }}
              disabled={working}
              className="w-fit rounded-lg border border-red-500/50 bg-red-900/50 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-800 disabled:opacity-50"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </section>

      {/* Messages support */}
      {messages.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-base font-bold text-white">Messages support ({messages.length})</h2>
          <div className="grid gap-3">
            {messages.map(m => (
              <div key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{m.subject}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    m.status === "CLOSED" ? "bg-slate-700 text-slate-400" : "bg-sky-900/50 text-sky-300"}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{m.name} · {new Date(m.createdAt).toLocaleDateString("fr-FR")}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{m.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Toutes les réparations avec pagination */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">
            Réparations ({repairs.length} au total)
          </h2>
          <span className="text-xs text-slate-500">
            Page {repairPage + 1} / {Math.max(1, Math.ceil(repairs.length / PAGE_SIZE))}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Ticket</th>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Tél / Email</th>
                <th className="px-3 py-2 text-left">Appareil</th>
                <th className="px-3 py-2 text-left">Statut</th>
                <th className="px-3 py-2 text-left">Paiement</th>
                <th className="px-3 py-2 text-right">Montant</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {repairs.slice(repairPage * PAGE_SIZE, (repairPage + 1) * PAGE_SIZE).map(r => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-3 py-2 font-mono text-xs text-slate-400">{r.ticketNumber ?? r.id.slice(0,8)}</td>
                  <td className="px-3 py-2 text-slate-200">{r.firstName} {r.lastName}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    <div>{r.phone}</div>
                    <div className="text-slate-500">{r.email}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-400">{r.deviceType} {r.brand} {r.model}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">{r.status}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">{r.paymentStatus}</td>
                  <td className="px-3 py-2 text-right text-xs text-slate-300">
                    {r.estimatedPriceCents ? `${(r.estimatedPriceCents / 100).toFixed(2)} €` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {repairs.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Aucune réparation.</p>}
        </div>
        {repairs.length > PAGE_SIZE && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setRepairPage(p => Math.max(0, p - 1))}
              disabled={repairPage === 0}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white disabled:opacity-30"
            >
              ← Précédente
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-500">
              {repairPage * PAGE_SIZE + 1}–{Math.min((repairPage + 1) * PAGE_SIZE, repairs.length)} / {repairs.length}
            </span>
            <button
              onClick={() => setRepairPage(p => Math.min(Math.ceil(repairs.length / PAGE_SIZE) - 1, p + 1))}
              disabled={(repairPage + 1) * PAGE_SIZE >= repairs.length}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white disabled:opacity-30"
            >
              Suivante →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
