"use client";

import { QRCodeSVG } from "qrcode.react";

type QrCodeClientProps = {
  url: string;
};

export function QrCodeClient({ url }: QrCodeClientProps) {
  return (
    <section className="print-page grid gap-6">
      <div className="print-card grid justify-items-center gap-5 rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">
          Nouvelle reparation
        </h1>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <QRCodeSVG value={url} size={280} level="H" includeMargin />
        </div>
        <p className="max-w-xl break-all text-sm font-medium text-slate-800">
          {url}
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Imprimer
        </button>
      </div>
    </section>
  );
}
