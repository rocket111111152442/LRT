"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function AlertModal({ open, onClose, dict }: { open: boolean; onClose: () => void; dict: Dictionary }) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const renderedAt = useRef(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      renderedAt.current = Date.now();
      setStatus("idle");
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const t = dict.properties.alert;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/search-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: "", renderedAt: renderedAt.current }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-full max-w-md rounded-2xl border border-stone-200 bg-cream-50 p-0 backdrop:bg-ink-900/50"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-900">{t.title}</h2>
          <button type="button" onClick={onClose} aria-label={dict.nav.closeMenu} className="rounded-full p-1.5 text-ink-500 hover:bg-stone-200">
            <X size={18} />
          </button>
        </div>
        {status === "success" ? (
          <p className="text-sm text-ivy-700">{t.success}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-sm text-ink-500">{t.description}</p>
            <label htmlFor={emailId} className="input-label">
              {t.email}
            </label>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            {status === "error" ? <p className="mt-2 text-xs text-error-600">{dict.common.errorGeneric}</p> : null}
            <Button type="submit" className="mt-5 w-full" disabled={status === "submitting"}>
              {t.submit}
            </Button>
          </form>
        )}
      </div>
    </dialog>
  );
}
