import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionState } from "@/lib/auth";
import { TrialEndedClient } from "./TrialEndedClient";

export const metadata: Metadata = { title: "Essai terminé — Qoravo Admin" };
export const dynamic = "force-dynamic";

export default async function TrialEndedPage() {
  const state = await getAdminSessionState();

  if (state.status === "active") {
    redirect("/admin");
  }

  if (state.status === "none") {
    redirect("/admin/login");
  }

  return <TrialEndedClient slug={state.proAccountSlug} />;
}
