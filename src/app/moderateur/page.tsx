import type { Metadata } from "next";
import { requireModPage } from "@/lib/modAuth";
import { ModDashboard } from "./ModDashboard";

export const metadata: Metadata = {
  title: "Modération",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function ModPage() {
  await requireModPage();
  return <ModDashboard />;
}
