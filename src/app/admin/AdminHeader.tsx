"use client";

import Link from "next/link";
import { LrtLogo } from "@/components/LrtLogo";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { FirstUseTour } from "./FirstUseTour";

type AdminHeaderProps = {
  email: string;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  function openTour() {
    window.dispatchEvent(new Event("lrt-admin-tour-open"));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    window.location.href = "/admin/login";
  }

  return (
    <header className="no-print border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <LrtLogo showText={false} markClassName="h-11 w-11" />
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Administration LRT
            </p>
            <p className="text-sm text-slate-700">{email}</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Reparations
          </Link>
          <Link
            href="/admin/repairs/new"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Nouvelle
          </Link>
          <Link
            href="/admin/agenda"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Agenda
          </Link>
          <Link
            href="/admin/qr-code"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            QR code
          </Link>
          <Link
            href="/admin/email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Email
          </Link>
          <Link
            href="/admin/stock"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Stock
          </Link>
          <Link
            href="/admin/guide"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Guide
          </Link>
          <Link
            href="/service-client"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Support
          </Link>
          <button
            type="button"
            onClick={openTour}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Tour
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Deconnexion
          </button>
        </nav>
      </div>
      <ClientErrorBoundary name="First use tour" fallback={null}>
        <FirstUseTour email={email} />
      </ClientErrorBoundary>
    </header>
  );
}
