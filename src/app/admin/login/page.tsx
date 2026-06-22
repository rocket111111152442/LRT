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
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
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
