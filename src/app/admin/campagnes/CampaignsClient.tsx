"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Mail, Send, Trash2, Upload, Users } from "lucide-react";

type Contact = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  status: string;
};

export function CampaignsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [counts, setCounts] = useState({ total: 0, subscribed: 0, unsubscribed: 0 });
  const [raw, setRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns/contacts");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (res.ok) {
        setContacts(data.contacts ?? []);
        setCounts({ total: data.total ?? 0, subscribed: data.subscribed ?? 0, unsubscribed: data.unsubscribed ?? 0 });
      }
    } catch {
      setError("Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleImport(event: FormEvent) {
    event.preventDefault();
    setImporting(true); setInfo(""); setError("");
    try {
      const res = await fetch("/api/admin/campaigns/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Import impossible."); return; }
      setInfo(`${data.added} contact(s) ajouté(s)${data.duplicates ? `, ${data.duplicates} doublon(s) ignoré(s)` : ""}.`);
      setRaw("");
      await load();
    } catch {
      setError("Import impossible.");
    } finally {
      setImporting(false);
    }
  }

  async function deleteContact(id: string) {
    try {
      const res = await fetch(`/api/admin/campaigns/contacts?id=${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch { /* ignore */ }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!window.confirm(`Envoyer cette campagne à ${counts.subscribed} contact(s) abonné(s) ?`)) return;

    setSending(true); setInfo(""); setError(""); setProgress("Envoi en cours...");
    try {
      let offset = 0;
      let total = 0;
      let totalSent = 0;
      let totalFailed = 0;

      // Envoi par lots : on rappelle l'API jusqu'à done.
      for (;;) {
        const res = await fetch("/api/admin/campaigns/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, message, offset }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Envoi impossible."); setProgress(""); return; }

        total = data.total;
        totalSent += data.sentThisBatch ?? 0;
        totalFailed += data.failedThisBatch ?? 0;
        offset = data.nextOffset;
        setProgress(`Envoyé ${Math.min(offset, total)} / ${total}...`);

        if (data.done) break;
      }

      setProgress("");
      setInfo(`Campagne envoyée : ${totalSent} envoyé(s)${totalFailed ? `, ${totalFailed} échec(s)` : ""}.`);
      setSubject(""); setMessage("");
    } catch {
      setError("Envoi impossible.");
      setProgress("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="grid gap-6">
      {info ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{info}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Users} label="Contacts" value={counts.total} tone="text-brand-blue" />
        <Stat icon={Mail} label="Abonnés" value={counts.subscribed} tone="text-brand-green" />
        <Stat icon={Trash2} label="Désinscrits" value={counts.unsubscribed} tone="text-slate-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import */}
        <form onSubmit={handleImport} className="q-card grid content-start gap-3 p-5">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-brand-blue" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-950">Importer des contacts</h2>
          </div>
          <p className="text-sm text-slate-600">
            Collez une adresse par ligne. Formats acceptés :
            <br /><code className="text-xs">email</code> ·{" "}
            <code className="text-xs">email,nom</code> ·{" "}
            <code className="text-xs">email,nom,société</code>
          </p>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            placeholder={"contact@atelier-paris.fr,Atelier Paris\ninfo@phonefix.fr"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
          <button type="submit" disabled={importing || !raw.trim()} className="q-btn q-btn-primary text-sm disabled:opacity-60">
            {importing ? "Import..." : "Importer les contacts"}
          </button>
        </form>

        {/* Compose */}
        <form onSubmit={handleSend} className="q-card grid content-start gap-3 p-5">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-brand-green" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-950">Envoyer une campagne</h2>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet de l'email"
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Bonjour, je vous présente Qoravo, le logiciel tout-en-un pour gérer votre atelier de réparation..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
          {progress ? <p className="text-sm font-semibold text-brand-blue">{progress}</p> : null}
          <button
            type="submit"
            disabled={sending || counts.subscribed === 0 || !subject.trim() || !message.trim()}
            className="q-btn q-btn-primary text-sm disabled:opacity-60"
          >
            {sending ? "Envoi..." : `Envoyer à ${counts.subscribed} contact(s)`}
          </button>
          <p className="text-xs text-slate-500">
            Un lien de désinscription est ajouté automatiquement en bas de chaque email.
          </p>
        </form>
      </div>

      {/* Liste */}
      <div className="q-card overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Contacts ({contacts.length})</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Nom / Société</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-slate-800">{c.email}</td>
                  <td className="px-4 py-2 text-slate-500">{[c.name, c.company].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === "SUBSCRIBED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.status === "SUBSCRIBED" ? "Abonné" : "Désinscrit"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button type="button" onClick={() => deleteContact(c.id)} className="text-red-600 hover:text-red-700" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && contacts.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Aucun contact. Importez-en ci-dessus.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: string }) {
  return (
    <div className="q-card p-4">
      <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
