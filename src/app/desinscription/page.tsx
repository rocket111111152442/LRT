import type { Metadata } from "next";
import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const metadata: Metadata = { title: "Désinscription — Qoravo" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string; t?: string }> };

async function unsubscribe(email: string): Promise<boolean> {
  try {
    const contacts = await prisma.emailContact.findMany({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (contacts.length === 0) {
      // Aucun contact (deja supprime) : on considere la demande satisfaite.
      return true;
    }

    for (const contact of contacts) {
      await prisma.emailContact.update({
        where: { id: contact.id },
        data: { status: "UNSUBSCRIBED" },
      });
    }
    return true;
  } catch {
    return false;
  }
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { e, t } = await searchParams;
  const email = (e ?? "").toLowerCase();
  const valid = Boolean(email && t && verifyUnsubscribeToken(email, t));
  const done = valid ? await unsubscribe(email) : false;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <QoravoLogo />
        </div>
        {valid && done ? (
          <>
            <h1 className="mt-6 text-2xl font-extrabold text-slate-950">
              Vous êtes désinscrit
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              L&apos;adresse <strong>{email}</strong> ne recevra plus nos emails.
              Si c&apos;était une erreur, contactez-nous.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-extrabold text-slate-950">
              Lien invalide
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ce lien de désinscription n&apos;est pas valide ou a expiré.
            </p>
          </>
        )}
        <Link href="/" className="q-btn q-btn-primary mt-6 w-full">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
