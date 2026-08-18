import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AccountNav } from "@/components/AccountNav";

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 text-[color:var(--color-smoke)]">(Mon compte)</p>
          <h1 className="display-xl">
            {user.firstName ? `Salut ${user.firstName}` : "Mon compte"}
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-smoke)]">{user.email}</p>
        </div>

        <div className="flex items-center gap-5">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="label link-sweep">
              Administration
            </Link>
          )}

          <form action={logoutAction}>
            <button type="submit" className="label link-sweep text-[color:var(--color-smoke)]">
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-20">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
