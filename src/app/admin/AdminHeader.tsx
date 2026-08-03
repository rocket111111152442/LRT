"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Calculator,
  Clock,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  Package,
  PlusCircle,
  QrCode,
  Rocket,
  Settings,
  ShoppingCart,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { FirstUseTour } from "./FirstUseTour";
import { AdminTrialBanner } from "./AdminTrialBanner";
import { SupportSubscribeButton } from "./SupportSubscribeButton";
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
      {
        href: "/admin",
        label: "Reparations",
        icon: Wrench,
        tone: "text-sky-600",
      },
      {
        href: "/admin/repairs/new",
        label: "Nouvelle",
        icon: PlusCircle,
        tone: "text-emerald-600",
      },
      {
        href: "/admin/agenda",
        label: "Agenda",
        icon: CalendarDays,
        tone: "text-amber-600",
      },
      {
        href: "/admin/compta",
        label: "Compta",
        icon: Calculator,
        tone: "text-violet-600",
      },
      {
        href: "/admin/ventes",
        label: "Ventes",
        icon: ShoppingCart,
        tone: "text-emerald-600",
      },
      {
        href: "/admin/stock",
        label: "Stock",
        icon: Package,
        tone: "text-lime-600",
      },
      {
        href: "/admin/clients",
        label: "Clients",
        icon: UsersRound,
        tone: "text-rose-600",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        href: "/admin/qr-code",
        label: "QR code",
        icon: QrCode,
        tone: "text-cyan-600",
      },
      {
        href: "/admin/email",
        label: "Email",
        icon: Mail,
        tone: "text-blue-600",
      },
      {
        href: "/admin/parametres",
        label: "Parametres",
        icon: Settings,
        tone: "text-slate-700",
      },
      {
        href: "/admin/offres",
        label: "Offres",
        icon: Rocket,
        tone: "text-fuchsia-600",
      },
      {
        href: "/admin/offre-entreprise",
        label: "Offre entreprise",
        icon: Building2,
        tone: "text-fuchsia-700",
      },
    ],
  },
  {
    label: "Aide",
    items: [
      {
        href: "/admin/guide",
        label: "Guide d'utilisation",
        icon: BookOpen,
        tone: "text-violet-600",
      },
    ],
  },
];

const navLinkClassName =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition";

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
  const hours = Math.floor(totalSeconds / 3600);
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const trial = useTrialCountdown(
    paymentStatus === "TRIAL" ? trialEndsAt : null,
  );

  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!supportIncluded) return;
    fetch("/api/admin/unread-messages")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.count === "number") setUnreadCount(d.count);
      })
      .catch(() => {});
  }, [supportIncluded]);

  const paymentHref = proAccountSlug
    ? `/pro/paiement?compte=${encodeURIComponent(proAccountSlug)}`
    : "/pro/paiement";

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <>
      <ImpersonationBanner />
      <AdminTrialBanner
        paymentStatus={paymentStatus}
        trialEndsAt={trialEndsAt}
        proAccountSlug={proAccountSlug}
      />
      <header className="no-print border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu d'administration"
            aria-expanded={menuOpen}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Menu aria-hidden="true" className="h-5 w-5 text-sky-700" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <QoravoLogo showText={false} markClassName="h-12 w-12" />
          <div className="hidden gap-1 sm:grid">
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
                <span className="font-mono tracking-wider">
                  {trial.display}
                </span>
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
      </header>

      {menuOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
          className="no-print fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[2px]"
        />
      ) : null}

      <aside
        aria-hidden={!menuOpen}
        className={`no-print fixed inset-y-0 left-0 z-[80] flex w-[min(88vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
          <QoravoLogo href="/admin" showText markClassName="h-10 w-10" />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-4 py-3">
          <p className="truncate text-sm font-medium text-slate-600">{email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="grid gap-5">
            {navGroups.map((group) => (
              <div key={group.label} className="grid gap-1">
                <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/admin"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`${navLinkClassName} ${
                        active
                          ? "bg-sky-100 text-sky-950"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ${item.tone}`}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <div className="grid gap-2 border-t border-slate-200 bg-slate-50 p-3">
          {supportIncluded ? (
            <Link
              href="/service-client"
              onClick={() => setMenuOpen(false)}
              className="relative flex min-h-11 w-full items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              <LifeBuoy aria-hidden="true" className="h-5 w-5" />
              Support
              {unreadCount > 0 ? (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
          ) : (
            <SupportSubscribeButton className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60" />
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LogOut aria-hidden="true" className="h-5 w-5" />
            Deconnexion
          </button>
        </div>
      </aside>
      <ClientErrorBoundary name="First use tour" fallback={null}>
        <FirstUseTour accountKey={proAccountSlug ?? email} />
      </ClientErrorBoundary>
    </>
  );
}
