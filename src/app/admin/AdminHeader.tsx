"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Calculator,
  LifeBuoy,
  LogOut,
  Mail,
  MapPinned,
  Package,
  PlusCircle,
  QrCode,
  Route,
  Settings,
  Wrench,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { FirstUseTour } from "./FirstUseTour";
import { SupportSubscribeButton } from "./SupportSubscribeButton";

type AdminHeaderProps = {
  email: string;
  supportIncluded?: boolean;
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
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/qr-code", label: "QR code", icon: QrCode, tone: "text-cyan-600" },
      { href: "/admin/email", label: "Email", icon: Mail, tone: "text-blue-600" },
      { href: "/admin/parametres", label: "Parametres", icon: Settings, tone: "text-slate-700" },
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

export function AdminHeader({ email, supportIncluded = false }: AdminHeaderProps) {
  function openTour() {
    window.dispatchEvent(new Event("Qoravo-admin-tour-open"));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    window.location.href = "/admin/login";
  }

  return (
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
          <span className="ml-auto hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            Tableau atelier
          </span>
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
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              <LifeBuoy aria-hidden="true" className="h-4 w-4" />
              Support
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
  );
}
