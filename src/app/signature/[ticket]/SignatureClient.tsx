"use client";

import { FormEvent, useState } from "react";
import { SignaturePad } from "@/components/SignaturePad";

export function SignatureClient({
  ticket,
  accessToken,
}: {
  ticket: string;
  accessToken: string;
}) {
  const [signature, setSignature] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!signature) {
      setError("Signez dans le cadre avant de valider.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/repair-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: ticket,
          signature,
          accessToken,
          email,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Signature impossible.");
        return;
      }

      setMessage("Signature enregistree. Merci.");
    } catch {
      setError("Signature impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <SignaturePad
        title="Signature client a la recuperation"
        value={signature}
        onChange={setSignature}
      />
      {!accessToken ? (
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Email du dossier
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSaving || Boolean(message)}
        className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSaving ? "Enregistrement..." : "Valider la signature"}
      </button>
    </form>
  );
}
