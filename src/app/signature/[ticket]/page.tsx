import { QoravoLogo } from "@/components/QoravoLogo";
import { SignatureClient } from "./SignatureClient";

type SignaturePageProps = {
  params: Promise<{ ticket: string }>;
};

export default async function SignaturePage({ params }: SignaturePageProps) {
  const { ticket } = await params;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-6">
        <header className="grid gap-3">
          <QoravoLogo />
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Signature client
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Recuperation de l&apos;appareil
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Ticket : <strong>{ticket}</strong>. Cette page est reservee au
            client au moment de la recuperation.
          </p>
        </header>
        <SignatureClient ticket={ticket} />
      </div>
    </main>
  );
}
