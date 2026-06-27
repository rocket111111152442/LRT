"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Calculator,
  Clock,
  CreditCard,
  LifeBuoy,
  LogOut,
  Mail,
  MapPinned,
  Package,
  PlusCircle,
  QrCode,
  Rocket,
  Route,
  Settings,
  UsersRound,
  Wrench,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { FirstUseTour } from "./FirstUseTour";
import { AdminTrialBanner } from "./AdminTrialBanner";
import { SupportSubscribeButton } from "./SupportSubscribeButton";
import { ControlConsent } from "./ControlConsent";
import { ImpersonationBanner } from "./ImpersonationBanner";

type AdminHeaderProps = {
  email: string;
  supportIncluded?: boolean;
  paymentStatus?: string | null;
  trialEndsAt?: string | null;
  proAccountSlug?: string | null;
};

const navGroups = [
  {
    label: "Travail",
    items: [
      { href: "/admin", label: "Reparations", icon: Wrench, tone: "text-sky-600" },
      { href: "/admin/repairs/new", label: "Nouvelle", icon: PlusCircle, tone: "text-emerald-600" },
      { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, tone: "text-amber-600" },
      { href: "/admin/compta", label: "Compta", icon: Calculator, tone: "text-violet-600" },
      { href: "/admin/stock", label: "Stock", icon: Package, tone: "text-lime-600" },
      { href: "/admin/clients", label: "Clients", icon: UsersRound, tone: "text-rose-600" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/qr-code", label: "QR code", icon: QrCode, tone: "text-cyan-600" },
      { href: "/admin/email", label: "Email", icon: Mail, tone: "text-blue-600" },
      { href: "/admin/parametres", label: "Parametres", icon: Settings, tone: "text-slate-700" },
      { href: "/admin/offres", label: "Offres", icon: Rocket, tone: "text-fuchsia-600" },
      { href: "/admin/offre-entreprise", label: "Offre entreprise", icon: Building2, tone: "text-fuchsia-700" },
      { href: "/admin/paiements", label: "Paiements", icon: CreditCard, tone: "text-emerald-600" },
      { href: "/", label: "Site public", icon: MapPinned, tone: "text-emerald-600" },
    ],
  },
  {
    label: "Aide",
    items: [
      { href: "/admin/guide", label: "Guide", icon: BookOpen, tone: "text-violet-600" },
    ],
  },
];

const navLinkClassName =
  "inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900";

function useTrialCountdown(trialEndsAt?: string | null) {
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (!trialEndsAt) return 0;
    return Math.max(0, new Date(trialEndsAt).getTime() - Date.now());
  });

  useEffect(() => {
    if (!trialEndsAt) return;
    const endTime = new Date(trialEndsAt).getTime();

    function tick() {
      const ms = Math.max(0, endTime - Date.now());
      setRemainingMs(ms);
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [trialEndsAt]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    display: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    expired: remainingMs === 0,
    urgent: remainingMs < 6 * 60 * 60 * 1000,
    active: remainingMs > 0,
  };
}

export function AdminHeader({
  email,
  supportIncluded = false,
  paymentStatus,
  trialEndsAt,
  proAccountSlug,
}: AdminHeaderProps) {
  const trial = useTrialCountdown(
    paymentStatus === "TRIAL" ? trialEndsAt : null,
  );

  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!supportIncluded) return;
    fetch("/api/admin/unread-messages")
      .then((r) => r.json())
      .then((d) => { if (typeof d?.count === "number") setUnreadCount(d.count); })
      .catch(() => {});
  }, [supportIncluded]);

  const paymentHref = proAccountSlug
    ? `/pro/paiement?compte=${encodeURIComponent(proAccountSlug)}`
    : "/pro/paiement";

  function openTour() {
    window.dispatchEvent(new Event("Qoravo-admin-tour-open"));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <>
      <ImpersonationBanner />
      <ControlConsent />
      <AdminTrialBanner
        paymentStatus={paymentStatus}
        trialEndsAt={trialEndsAt}
        proAccountSlug={proAccountSlug}
      />
      <header className="no-print border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <QoravoLogo showText={false} markClassName="h-12 w-12" />
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Administration Qoravo
            </p>
            <p className="text-sm text-slate-700">{email}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Timer essai gratuit — visible uniquement pour les comptes TRIAL */}
            {paymentStatus === "TRIAL" && trial.active ? (
              <Link
                href={paymentHref}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 ${
                  trial.urgent
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
                title="Temps restant sur votre essai gratuit — cliquez pour vous abonner"
              >
                <Clock
                  className={`h-3.5 w-3.5 ${trial.urgent ? "text-red-500" : "text-amber-500"}`}
                  aria-hidden="true"
                />
                <span className="font-mono tracking-wider">{trial.display}</span>
                <span className="hidden sm:inline">restant</span>
              </Link>
            ) : paymentStatus === "TRIAL" && !trial.active ? (
              <Link
                href={`/admin/essai-termine${proAccountSlug ? `?compte=${encodeURIComponent(proAccountSlug)}` : ""}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800"
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Essai terminé
              </Link>
            ) : (
              <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                Tableau atelier
              </span>
            )}
          </div>
        </div>
        <nav className="grid gap-3">
          <div className="flex flex-wrap items-start gap-3">
            {navGroups.map((group) => (
              <div
                key={group.label}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2"
              >
                <span className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </span>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href} className={navLinkClassName}>
                      <Icon aria-hidden="true" className={`h-4 w-4 ${item.tone}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {supportIncluded ? (
              <Link
                href="/service-client"
                className="relative inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <LifeBuoy aria-hidden="true" className="h-4 w-4" />
                Support
                {unreadCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            ) : (
              <SupportSubscribeButton />
            )}
            <button
              type="button"
              onClick={openTour}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
            >
              <Route aria-hidden="true" className="h-4 w-4 text-amber-600" />
              Tour
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Deconnexion
            </button>
          </div>
        </nav>
        </div>
        <ClientErrorBoundary name="First use tour" fallback={null}>
          <FirstUseTour email={email} />
        </ClientErrorBoundary>
      </header>
    </>
  );
}
