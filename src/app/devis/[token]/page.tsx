import { QuoteDecisionClient } from "./QuoteDecisionClient";

type QuotePageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ decision?: string }>;
};

export default async function QuotePage({ params, searchParams }: QuotePageProps) {
  const { token } = await params;
  const { decision } = await searchParams;
  const initialDecision =
    decision === "ACCEPTED" || decision === "REFUSED" ? decision : undefined;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Devis LRT
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Validation du devis
          </h1>
        </header>
        <QuoteDecisionClient token={token} initialDecision={initialDecision} />
      </div>
    </main>
  );
}
