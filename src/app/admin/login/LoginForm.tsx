"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresCode, setRequiresCode] = useState(false);

  async function submitLogin(nextCode = code) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        code: nextCode || undefined,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Connexion impossible.");
      return;
    }

    if (payload.requiresCode) {
      setRequiresCode(true);
      setCode("");
      setMessage(payload.message ?? "Code envoye. Verifiez votre boite email.");
      return;
    }

    window.location.href = "/admin";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Email et mot de passe requis.");
      return;
    }

    if (requiresCode && code.replace(/\D/g, "").length !== 6) {
      setError("Code email requis.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitLogin();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Email et mot de passe requis.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitLogin("");
    } catch {
      setError("Envoi du code impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-2">
        <label htmlFor="admin-email" className="text-sm font-medium text-slate-800">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setRequiresCode(false);
            setCode("");
            setMessage("");
          }}
          className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        />
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="admin-password"
          className="text-sm font-medium text-slate-800"
        >
          Mot de passe
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setRequiresCode(false);
            setCode("");
            setMessage("");
          }}
          className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        />
      </div>

      {requiresCode ? (
        <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-4">
          <label
            htmlFor="admin-code"
            className="text-sm font-medium text-slate-800"
          >
            Code recu par email
          </label>
          <input
            id="admin-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="min-h-11 max-w-[220px] rounded-md border border-slate-300 px-3 py-2 text-sm tracking-[0.2em] outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
          <button
            type="button"
            onClick={resendCode}
            disabled={isSubmitting}
            className="w-fit text-sm font-semibold text-slate-950 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Renvoyer un code
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting
          ? requiresCode
            ? "Verification..."
            : "Envoi du code..."
          : requiresCode
            ? "Valider le code"
            : "Recevoir le code"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Pas encore de compte pro ?{" "}
        <Link
          href="/pro/inscription"
          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Creer un compte
        </Link>
      </p>
    </form>
  );
}
