import { LrtLogo } from "@/components/LrtLogo";
import { RepairForm } from "./RepairForm";

type NewRepairPageProps = {
  searchParams: Promise<{ compte?: string }>;
};

export default async function NewRepairPage({
  searchParams,
}: NewRepairPageProps) {
  const { compte } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="grid gap-3">
          <LrtLogo />
          <div className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Atelier
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Nouvelle reparation
            </h1>
          </div>
        </header>
        <RepairForm proAccountSlug={compte ?? ""} />
      </div>
    </main>
  );
}
