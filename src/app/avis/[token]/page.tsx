import { ReviewClient } from "./ReviewClient";

type ReviewPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Avis LRT
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Donnez votre avis
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Votre retour aide l&apos;atelier a suivre la qualite du service.
          </p>
        </header>
        <ReviewClient token={token} />
      </div>
    </main>
  );
}
