import { QoravoLogo } from "@/components/QoravoLogo";
import { prisma } from "@/lib/prisma";
import { RepairForm } from "./RepairForm";

type NewRepairPageProps = {
  searchParams: Promise<{ compte?: string }>;
};

type RepairerRating = {
  companyName: string;
  average: number;
  count: number;
};

async function getRepairerRating(slug?: string): Promise<RepairerRating | null> {
  if (!slug) {
    return null;
  }

  try {
    const account = await prisma.proAccount.findUnique({
      where: { slug },
      select: {
        id: true,
        companyName: true,
      },
    });

    if (!account) {
      return null;
    }

    const repairs = await prisma.repair.findMany({
      where: { proAccountId: account.id },
      select: { satisfactionRating: true },
    });
    const ratings = repairs
      .map((repair) => repair.satisfactionRating)
      .filter((rating): rating is number => typeof rating === "number" && rating > 0);
    const total = ratings.reduce((sum, rating) => sum + rating, 0);

    return {
      companyName: account.companyName,
      average: ratings.length > 0 ? total / ratings.length : 0,
      count: ratings.length,
    };
  } catch (error) {
    console.error("Repairer rating lookup failed", error);
    return null;
  }
}

export default async function NewRepairPage({
  searchParams,
}: NewRepairPageProps) {
  const { compte } = await searchParams;
  const repairerRating = await getRepairerRating(compte);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="grid gap-3">
          <QoravoLogo />
          <div className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Atelier
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Nouvelle reparation
            </h1>
          </div>
        </header>
        <RepairForm proAccountSlug={compte ?? ""} repairerRating={repairerRating} />
      </div>
    </main>
  );
}
