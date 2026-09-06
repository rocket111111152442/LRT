import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/profil", label: "Tableau de bord" },
  { href: "/profil/matieres", label: "Matières" },
  { href: "/profil/agenda", label: "Agenda" },
  { href: "/profil/notes-evaluations", label: "Notes" },
  { href: "/profil/documents", label: "Documents" },
  { href: "/profil/parametres", label: "Paramètres" },
];

export default async function ProfilLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-brand-border bg-brand-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/profil" className="font-bold text-brand-ink">
            Mes cours de Première
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-brand-ink transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user.firstName ?? user.email}
            </span>
            <form action="/deconnexion" method="post">
              <button
                type="submit"
                className="rounded-md border border-brand-border px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
