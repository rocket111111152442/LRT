"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Clock,
  HardDrive,
  LogOut,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { PageViews } from "@/components/PageViews";
import { BroadcastEmailTab } from "./BroadcastEmailTab";
import { ModeratorStoragePanel } from "./ModeratorStoragePanel";

type Message = {
  id: string; proAccountId: string | null; name: string; email: string;
  subject: string; message: string; offre: string | null;
  status: string; moderatorNote: string | null; createdAt: string;
  category: string | null; priority: string | null; ticketRef: string | null;
  replyText: string | null; repliedAt: string | null;
};

type Account = {
  id: string; companyName: string; slug: string; ownerEmail: string;
  paymentStatus: string; trialEndsAt: string | null; supportIncluded: boolean;
  plan: string; storageAddonGb: number; createdAt: string;
  _count: { repairs: number };
};

type DashData = { messages: Message[]; accounts: Account[]; totalRepairs: number };

const statusBadge: Record<string, string> = {
  PAID:     "bg-emerald-50 text-emerald-700 ring-emerald-200",
  TRIAL:    "bg-amber-50 text-amber-700 ring-amber-200",
  PENDING:  "bg-slate-100 text-slate-600 ring-slate-200",
  CANCELED: "bg-red-50 text-red-700 ring-red-200",
};

export function ModDashboard() {
  const [data, setData]       = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [tab, setTab]         = useState<"messages" | "comptes" | "stockage" | "diffusion">("messages");
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/moderateur/dashboard");
      if (res.status === 401) { window.location.href = "/moderateur/login"; return; }
      const payload = await res.json();
      if (!res.ok) { setError(payload.error ?? "Chargement impossible."); return; }
      setData(payload);
    } catch { setError("Chargement impossible."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function logout() {
    await fetch("/api/moderateur/logout", { method: "POST" });
    window.location.href = "/moderateur/login";
  }

  async function resetDb() {
    const code = window.prompt(
      "RESET BASE DE DONNEES\n\nTous les comptes sauf le compte protege seront supprimes definitivement.\n\nTapez exactement : SUPPRIMER TOUS LES COMPTES"
    );
    if (code !== "SUPPRIMER TOUS LES COMPTES") return;
    const moderatorPassword = window.prompt(
      "Confirmez avec le mot de passe moderateur :",
    );
    if (!moderatorPassword) return;
    setResetting(true); setResetMsg("");
    try {
      const res = await fetch("/api/moderateur/reset-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: "SUPPRIMER TOUS LES COMPTES",
          moderatorPassword,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      setResetMsg(payload.message ?? (res.ok ? "Reset effectué." : payload.error ?? "Erreur."));
      if (res.ok) await load();
    } catch { setResetMsg("Erreur réseau."); }
    finally { setResetting(false); }
  }

  const openMessages = data?.messages.filter(m => m.status !== "CLOSED") ?? [];
  const accounts     = data?.accounts ?? [];
  const paid  = accounts.filter(a => a.paymentStatus === "PAID").length;
  const trial = accounts.filter(a => a.paymentStatus === "TRIAL").length;
  // Comptes inactifs à relancer : ni payants, ni en essai actif.
  const isActiveTrial = (a: Account) =>
    a.paymentStatus === "TRIAL" && a.trialEndsAt != null && new Date(a.trialEndsAt) > new Date();
  const inactive = accounts.filter(
    (a) => a.paymentStatus !== "PAID" && !isActiveTrial(a),
  ).length;

  return (
    <main className="min-h-screen bg-brand-ink text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-white/10 bg-brand-ink/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue/20 text-brand-blue">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">Qoravo</p>
            <p className="text-sm font-semibold text-white">Panel Modérateur</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageViews className="mr-1 hidden rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:inline-flex" />
          <button onClick={load} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={logout}
            className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-lg bg-white/5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 sm:w-auto sm:px-3"
            aria-label="Déconnexion"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-xl border border-red-400/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</div>
        ) : null}

        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Messages ouverts", value: openMessages.length, icon: MessageSquare, tone: "text-sky-400" },
            { label: "Comptes total",    value: accounts.length,     icon: Building2,     tone: "text-slate-400" },
            { label: "Comptes payants",  value: paid,                icon: BadgeCheck,    tone: "text-emerald-400" },
            { label: "En essai",         value: trial,               icon: Clock,         tone: "text-amber-400" },
            { label: "Inactifs à relancer", value: inactive,         icon: Trash2,        tone: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <s.icon className={`h-5 w-5 ${s.tone}`} aria-hidden="true" />
              <p className="mt-3 text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Zone reset */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3">
          <Trash2 className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-red-300">Zone dangereuse — Reset base de données</p>
            <p className="text-xs text-red-400/70">Supprime tous les comptes sauf <span className="text-red-300 font-mono">lullinismael0@gmail.com</span></p>
          </div>
          {resetMsg ? <p className="text-xs font-semibold text-emerald-400">{resetMsg}</p> : null}
          <button
            onClick={resetDb}
            disabled={resetting}
            className="rounded-lg border border-red-500/40 bg-red-900/40 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-800/60 disabled:opacity-50"
          >
            {resetting ? "Suppression en cours..." : "Tout supprimer (sauf compte protégé)"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["messages", "comptes", "stockage", "diffusion"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-brand-blue text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t === "messages"
                ? `Messages (${openMessages.length})`
                : t === "comptes"
                  ? `Comptes (${accounts.length})`
                  : t === "stockage"
                    ? (
                      <span className="inline-flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Stockage serveur
                      </span>
                    )
                  : "Envoyer un email"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">Chargement...</div>
        ) : tab === "messages" ? (
          <MessagesTab messages={data?.messages ?? []} onRefresh={load} />
        ) : tab === "comptes" ? (
          <ComptesTab accounts={data?.accounts ?? []} statusBadge={statusBadge} />
        ) : tab === "stockage" ? (
          <ModeratorStoragePanel />
        ) : (
          <BroadcastEmailTab accounts={data?.accounts ?? []} />
        )}
      </div>
    </main>
  );
}

function MessagesTab({ messages, onRefresh }: { messages: Message[]; onRefresh: () => void }) {
  const [selected, setSelected] = useState<Message | null>(null);
  const [note, setNote]         = useState("");
  const [status, setStatus]     = useState("OPEN");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [reply, setReply]       = useState("");
  const [replying, setReplying] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");

  function open(m: Message) {
    setSelected(m); setNote(m.moderatorNote ?? ""); setStatus(m.status);
    setMsg(""); setReply(""); setReplyMsg("");
  }

  async function saveNote() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/moderateur/compte/${selected.proAccountId ?? "none"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message_note", messageId: selected.id, note, status }),
      });
      const payload = await res.json().catch(() => ({}));
      setMsg(payload.message ?? (res.ok ? "Enregistré." : payload.error ?? "Erreur."));
      if (res.ok) { onRefresh(); }
    } finally { setSaving(false); }
  }

  async function sendReply() {
    if (!selected || reply.trim().length < 2) return;
    setReplying(true); setReplyMsg("");
    try {
      const res = await fetch(`/api/moderateur/compte/${selected.proAccountId ?? "none"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply_message", messageId: selected.id, replyText: reply }),
      });
      const payload = await res.json().catch(() => ({}));
      setReplyMsg(payload.message ?? (res.ok ? "Réponse envoyée." : payload.error ?? "Erreur."));
      if (res.ok) { setReply(""); onRefresh(); }
    } catch { setReplyMsg("Erreur réseau."); }
    finally { setReplying(false); }
  }

  if (messages.length === 0) return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
      Aucun message reçu.
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="grid content-start gap-2 overflow-y-auto" style={{ maxHeight: "75vh" }}>
        {messages.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => open(m)}
            className={`rounded-xl border p-4 text-left transition hover:border-brand-blue/50 ${
              selected?.id === m.id
                ? "border-brand-blue bg-brand-blue/10"
                : "border-white/10 bg-white/5 hover:bg-white/8"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-white">{m.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                m.status === "CLOSED" ? "bg-slate-700 text-slate-400" :
                m.status === "PENDING" ? "bg-amber-900/50 text-amber-300" :
                "bg-sky-900/50 text-sky-300"}`}>
                {m.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{m.email} · {new Date(m.createdAt).toLocaleDateString("fr-FR")}</p>
            <p className="mt-1 truncate text-sm text-slate-300">{m.subject}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {m.priority === "URGENT" ? <span className="rounded-full bg-red-900/50 px-2 py-0.5 text-[10px] font-bold text-red-300">URGENT</span> : null}
              {m.category ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">{m.category}</span> : null}
              {m.ticketRef ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-400">#{m.ticketRef}</span> : null}
              {m.repliedAt ? <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Répondu</span> : null}
              {m.offre ? <span className="rounded-full bg-brand-blue/20 px-2 py-0.5 text-[10px] font-semibold text-brand-blue">Offre : {m.offre}</span> : null}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <aside className="grid content-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">Message</p>
            <h3 className="mt-1 text-lg font-bold text-white">{selected.subject}</h3>
            <p className="text-xs text-slate-400">{selected.name} &lt;{selected.email}&gt;</p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {selected.category ? <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-slate-300">Catégorie : {selected.category}</span> : null}
            <span className={`rounded-full px-2 py-0.5 font-bold ${selected.priority === "URGENT" ? "bg-red-900/50 text-red-300" : "bg-white/10 text-slate-400"}`}>
              Priorité : {selected.priority ?? "NORMAL"}
            </span>
            {selected.ticketRef ? <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-slate-400">Réf : {selected.ticketRef}</span> : null}
          </div>
          <p className="whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm leading-6 text-slate-200">
            {selected.message}
          </p>
          {selected.proAccountId ? (
            <Link
              href={`/moderateur/compte/${selected.proAccountId}`}
              className="q-btn q-btn-primary text-sm"
            >
              <Building2 className="h-4 w-4" /> Voir le compte associé
            </Link>
          ) : null}

          {/* Réponse par email au client */}
          <div className="grid gap-2 rounded-xl border border-sky-400/30 bg-sky-950/30 p-3">
            <label className="text-xs font-bold uppercase tracking-wide text-sky-300">
              Répondre par email à {selected.email}
            </label>
            {selected.replyText ? (
              <div className="rounded-lg bg-white/5 p-2 text-xs text-slate-300">
                <p className="mb-1 font-semibold text-emerald-300">
                  Dernière réponse {selected.repliedAt ? `· ${new Date(selected.repliedAt).toLocaleString("fr-FR")}` : ""}
                </p>
                <p className="whitespace-pre-wrap">{selected.replyText}</p>
              </div>
            ) : null}
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={4}
              placeholder="Votre réponse, envoyée par email au client…"
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
            {replyMsg ? <p className="text-xs text-emerald-400">{replyMsg}</p> : null}
            <button onClick={sendReply} disabled={replying || reply.trim().length < 2}
              className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-500 disabled:opacity-50">
              {replying ? "Envoi…" : "Envoyer la réponse par email"}
            </button>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-400">Statut</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white">
              <option value="OPEN">OPEN</option>
              <option value="PENDING">PENDING</option>
              <option value="ANSWERED">ANSWERED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-400">Note interne</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white" />
          </div>
          {msg ? <p className="text-xs text-emerald-400">{msg}</p> : null}
          <button onClick={saveNote} disabled={saving}
            className="q-btn q-btn-primary text-sm disabled:opacity-60">
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </aside>
      ) : (
        <aside className="hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-slate-500 lg:grid lg:place-items-center">
          Sélectionnez un message
        </aside>
      )}
    </div>
  );
}

function ComptesTab({ accounts, statusBadge }: { accounts: Account[]; statusBadge: Record<string, string> }) {
  const [search, setSearch] = useState("");
  const filtered = accounts.filter(a =>
    !search || [a.companyName, a.ownerEmail, a.slug].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="grid gap-4">
      <input
        type="search" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher (nom, email, slug)..."
        className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-blue"
      />
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Boutique</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Réparations</th>
              <th className="px-4 py-3">Créé</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{a.companyName}</td>
                <td className="px-4 py-3 text-slate-400">{a.ownerEmail}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${statusBadge[a.paymentStatus] ?? "bg-slate-700 text-slate-400"}`}>
                    {a.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{a.plan}</td>
                <td className="px-4 py-3 text-slate-400">{a._count.repairs}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <Link href={`/moderateur/compte/${a.id}`}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-brand-blue hover:text-brand-blue">
                    Gérer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-500">Aucun compte trouvé.</p>
        )}
      </div>
    </div>
  );
}
