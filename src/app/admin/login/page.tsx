import type { Metadata } from "next";
export const metadata: Metadata = { title: "Connexion — Qoravo Admin" };
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "./LoginForm";
import { QoravoLogo } from "@/components/QoravoLogo";
import { TrialStartedNotice } from "./TrialStartedNotice";

type AdminLoginPageProps = {
  searchParams: Promise<{ trial?: string; compte?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const admin = await getCurrentAdmin();
  const { trial, compte } = await searchParams;

  if (admin) {
    redirect("/admin");
  }

  const trialAccount =
    trial === "1" && compte
      ? await prisma.proAccount
          .findUnique({
            where: { slug: compte },
            select: {
              slug: true,
              companyName: true,
              paymentStatus: true,
              trialEndsAt: true,
            },
          })
          .catch(() => null)
      : null;
  const trialEndsAt = trialAccount?.trialEndsAt
    ? new Date(trialAccount.trialEndsAt)
    : null;
  const showTrialNotice =
    trialAccount?.paymentStatus === "TRIAL" &&
    trialEndsAt !== null &&
    !Number.isNaN(trialEndsAt.getTime()) &&
    trialEndsAt > new Date();

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* Fond dégradé animé coloré (bleu → vert, couleurs du logo) */}
      <div
        aria-hidden="true"
        className="q-animate-gradient absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #e0f2fe 0%, #dcfce7 35%, #bae6fd 70%, #d1fae5 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.18),transparent_28rem),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.22),transparent_30rem)]"
      />
      <div className="mx-auto grid max-w-2xl gap-6">
        {showTrialNotice ? (
          <TrialStartedNotice
            companyName={trialAccount.companyName}
            slug={trialAccount.slug}
            trialEndsAt={trialEndsAt.toISOString()}
          />
        ) : null}
        <header className="grid gap-2">
          <QoravoLogo />
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Administration
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">Connexion</h1>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
