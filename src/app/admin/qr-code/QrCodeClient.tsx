"use client";

import { QRCodeSVG } from "qrcode.react";

type QrCodeClientProps = {
  newRepairUrl: string;
  depositUrl: string;
};

export function QrCodeClient({ newRepairUrl, depositUrl }: QrCodeClientProps) {
  return (
    <section className="print-page grid gap-6">
      <header className="no-print grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          QR codes atelier
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          Formulaire client et depot au comptoir
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Imprimez le QR de demande pour recevoir de nouveaux devis. Imprimez le
          QR de depot au comptoir pour que le client confirme physiquement le
          depot de son appareil avec son ticket.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <QrCard
          title="Nouvelle demande"
          description="Le client remplit le formulaire, ajoute ses informations, photos et signature."
          url={newRepairUrl}
        />
        <QrCard
          title="Depot appareil au magasin"
          description="Le client scanne ce QR au comptoir, entre son ticket, et la fiche passe en pas encore en reparation."
          url={depositUrl}
        />
      </div>

      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Imprimer
        </button>
      </div>
    </section>
  );
}

function QrCard({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return (
    <article className="print-card grid justify-items-center gap-5 rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <QRCodeSVG value={url} size={280} level="H" includeMargin />
      </div>
      <p className="max-w-xl break-all text-sm font-medium text-slate-800">
        {url}
      </p>
    </article>
  );
}
