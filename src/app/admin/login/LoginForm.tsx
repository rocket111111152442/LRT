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
  const [loginVerificationId, setLoginVerificationId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetRequiresCode, setResetRequiresCode] = useState(false);
  const [resetVerificationId, setResetVerificationId] = useState("");

  function cleanCode(value: string) {
    return value.replace(/\D/g, "").slice(0, 6);
  }

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
        verificationId: nextCode ? loginVerificationId : undefined,
        rememberMe,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Connexion impossible.");
      return;
    }

    if (payload.requiresCode) {
      if (typeof payload.verificationId === "string") {
        setLoginVerificationId(payload.verificationId);
      }
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

  function openResetMode() {
    setIsResetMode(true);
    setResetEmail(email);
    setResetCode("");
    setNewPassword("");
    setResetRequiresCode(false);
    setResetVerificationId("");
    setError("");
    setMessage("");
  }

  function backToLogin() {
    setIsResetMode(false);
    setResetCode("");
    setNewPassword("");
    setResetRequiresCode(false);
    setResetVerificationId("");
    setError("");
    setMessage("");
  }

  async function submitPasswordReset(sendOnlyCode = false) {
    const response = await fetch("/api/admin/password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: resetEmail,
        code: !sendOnlyCode && resetRequiresCode ? resetCode : undefined,
        password: !sendOnlyCode && resetRequiresCode ? newPassword : undefined,
        verificationId:
          !sendOnlyCode && resetRequiresCode ? resetVerificationId : undefined,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Recuperation impossible.");
      return;
    }

    if (payload.requiresCode) {
      if (typeof payload.verificationId === "string") {
        setResetVerificationId(payload.verificationId);
      }
      setResetRequiresCode(true);
      setResetCode("");
      setMessage(
        payload.message ?? "Code de recuperation envoye. Verifiez votre boite email.",
      );
      return;
    }

    setEmail(resetEmail);
    setPassword("");
    setCode("");
    setRequiresCode(false);
    setLoginVerificationId("");
    setIsResetMode(false);
    setResetRequiresCode(false);
    setResetVerificationId("");
    setMessage(payload.message ?? "Mot de passe modifie. Vous pouvez vous connecter.");
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!resetEmail.trim()) {
      setError("Email requis.");
      return;
    }

    if (resetRequiresCode && resetCode.replace(/\D/g, "").length !== 6) {
      setError("Code de recuperation requis.");
      return;
    }

    if (resetRequiresCode && newPassword.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPasswordReset();
    } catch {
      setError("Recuperation impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendResetCode() {
    setError("");
    setMessage("");
    setResetCode("");
    setNewPassword("");
    setResetRequiresCode(false);
    setResetVerificationId("");
    setIsSubmitting(true);

    try {
      await submitPasswordReset(true);
    } catch {
      setError("Envoi du code impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isResetMode) {
    return (
      <form
        onSubmit={handleResetSubmit}
        className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-2">
          <h2 className="text-xl font-semibold text-slate-950">
            Mot de passe oublie
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Entrez l email admin du compte. Qoravo envoie un code de recuperation
            pour choisir un nouveau mot de passe.
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="reset-email"
            className="text-sm font-medium text-slate-800"
          >
            Email admin
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={resetEmail}
            onChange={(event) => {
              setResetEmail(event.target.value);
              setResetRequiresCode(false);
              setResetVerificationId("");
              setResetCode("");
              setNewPassword("");
              setMessage("");
            }}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </div>

        {resetRequiresCode ? (
          <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <label
              htmlFor="reset-code"
              className="grid gap-2 text-sm font-medium text-slate-800"
            >
              Code recu par email
              <input
                id="reset-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={resetCode}
                onChange={(event) => setResetCode(cleanCode(event.target.value))}
                className="min-h-11 max-w-[220px] rounded-md border border-slate-300 px-3 py-2 text-sm tracking-[0.2em] outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              />
            </label>

            <label
              htmlFor="reset-password"
              className="grid gap-2 text-sm font-medium text-slate-800"
            >
              Nouveau mot de passe
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              />
            </label>

            <button
              type="button"
              onClick={resendResetCode}
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
            ? resetRequiresCode
              ? "Modification..."
              : "Envoi du code..."
            : resetRequiresCode
              ? "Changer le mot de passe"
              : "Envoyer le code"}
        </button>

        <button
          type="button"
          onClick={backToLogin}
          className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Retour a la connexion
        </button>
      </form>
    );
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
            setLoginVerificationId("");
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
            setLoginVerificationId("");
            setCode("");
            setMessage("");
          }}
          className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        />
        <button
          type="button"
          onClick={openResetMode}
          className="w-fit text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Mot de passe oublie ?
        </button>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950"
        />
        <span className="grid gap-1">
          <span className="font-semibold text-slate-950">Se souvenir de moi</span>
          <span>
            Garde la connexion ouverte 90 jours sur cet appareil. Les prochaines
            connexions ne demanderont plus le code recu par email (seul le mot de
            passe suffira).
          </span>
        </span>
      </label>

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
            onChange={(event) => setCode(cleanCode(event.target.value))}
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
