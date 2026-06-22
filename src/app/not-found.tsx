import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable — Qoravo" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="grid gap-5 max-w-md">
        <p className="text-8xl font-extrabold text-slate-200 select-none">404</p>
        <h1 className="text-2xl font-extrabold text-slate-950">Page introuvable</h1>
        <p className="text-sm leading-6 text-slate-600">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="q-btn q-btn-primary text-sm">
            Retour à l&apos;accueil
          </Link>
          <Link href="/admin" className="q-btn border border-slate-300 bg-white text-sm text-slate-800 hover:bg-slate-50">
            Panel admin
          </Link>
        </div>
      </div>
    </main>
  );
}
