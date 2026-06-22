import Link from "next/link";
import { requireModPage } from "@/lib/modAuth";
import { AccountDetail } from "./AccountDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ModAccountPage({ params }: Props) {
  await requireModPage();
  const { id } = await params;
  return (
    <main className="min-h-screen bg-brand-ink text-slate-100">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/10 bg-brand-ink/95 px-6 py-3 backdrop-blur">
        <Link href="/moderateur" className="text-sm font-semibold text-slate-400 hover:text-white">
          ← Dashboard
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-semibold text-white">Détail du compte</span>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <AccountDetail accountId={id} />
      </div>
    </main>
  );
}
