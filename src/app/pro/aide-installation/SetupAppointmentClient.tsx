"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type SetupAppointmentClientProps = {
  sessionId: string;
  accountSlug: string | null;
  companyName: string;
  ownerEmail: string;
};

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

export function SetupAppointmentClient({
  sessionId,
  accountSlug,
  companyName,
  ownerEmail,
}: SetupAppointmentClientProps) {
  const minDate = useMemo(() => todayDateInput(), []);
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState("10:00");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/pro/setup-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          requestedAt: new Date(`${date}T${time}:00`).toISOString(),
          contactPhone,
          notes,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? "Rendez-vous impossible a enregistrer.");
        return;
      }

      setMessage(
        payload.message ??
          "Rendez-vous enregistre. Vous serez contacte au creneau choisi.",
      );
    } catch {
      setError("Rendez-vous impossible a enregistrer.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-md bg-slate-950 p-4 text-white">
        <p className="text-sm text-slate-300">Compte active</p>
        <p className="mt-1 text-lg font-semibold">{companyName}</p>
        <p className="mt-1 text-sm text-slate-300">{ownerEmail}</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <div className="grid gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p>{message}</p>
          <Link
            href="/admin/login"
            className="w-fit font-semibold text-emerald-950 underline-offset-4 hover:underline"
          >
            Aller a la connexion admin
          </Link>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Jour
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Heure
            <select
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              required
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Telephone de contact
          <input
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="Exemple : 0753305452"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Ce que vous voulez parametrer
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Exemple : email, QR code, compte admin, premier formulaire..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="min-h-12 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Enregistrement..." : "Valider le rendez-vous"}
        </button>
      </form>

      {accountSlug ? (
        <p className="text-xs leading-5 text-slate-500">
          Identifiant du compte : {accountSlug}
        </p>
      ) : null}
    </div>
  );
}
