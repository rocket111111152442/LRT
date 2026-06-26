"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, LogOut } from "lucide-react";

// Visible uniquement quand un modérateur a pris la main sur le compte. Permet de
// quitter le mode support et de revenir au panneau modérateur.
export function ImpersonationBanner() {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/impersonation", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.impersonating) setCompanyName(d.companyName ?? "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function exit() {
    setLeaving(true);
    try {
      await fetch("/api/admin/control-exit", { method: "POST" });
    } catch {
      /* on redirige quand même */
    }
    window.location.href = "/moderateur";
  }

  if (companyName === null) return null;

  return (
    <div className="no-print sticky top-0 z-[90] flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-center text-sm font-bold text-amber-950 shadow">
      <span className="inline-flex items-center gap-2">
        <LifeBuoy className="h-4 w-4" aria-hidden="true" />
        Mode support — vous contrôlez le compte{" "}
        {companyName ? `« ${companyName} »` : ""}
      </span>
      <button
        type="button"
        onClick={exit}
        disabled={leaving}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-950 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-900 disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Quitter le mode support
      </button>
    </div>
  );
}
