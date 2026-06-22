import { requireModPage } from "@/lib/modAuth";
import { ModDashboard } from "./ModDashboard";

export const dynamic = "force-dynamic";

export default async function ModPage() {
  await requireModPage();
  return <ModDashboard />;
}
