"use client";

import { QRCodeSVG } from "qrcode.react";

export function RepairLabel({
  ticketNumber,
  customerName,
  device,
  shopName,
  trackingUrl,
}: {
  ticketNumber: string;
  customerName: string;
  device: string;
  shopName: string;
  trackingUrl: string;
}) {
  return (
    <div className="mx-auto grid max-w-md gap-4">
      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="q-btn q-btn-primary text-sm"
        >
          Imprimer l&apos;étiquette
        </button>
      </div>

      <div className="print-label rounded-xl border-2 border-slate-900 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">
              {shopName}
            </p>
            <p className="mt-1 text-3xl font-extrabold leading-none text-slate-950">
              {ticketNumber}
            </p>
          </div>
          <QRCodeSVG value={trackingUrl} size={110} level="M" />
        </div>
        <div className="mt-4 grid gap-1 border-t border-dashed border-slate-300 pt-3 text-sm">
          <p className="font-semibold text-slate-900">{customerName || "Client"}</p>
          <p className="text-slate-600">{device || "Appareil"}</p>
          <p className="text-xs text-slate-500">Scannez pour suivre la réparation</p>
        </div>
      </div>

      <p className="no-print text-center text-xs text-slate-500">
        Astuce : imprimez et collez cette étiquette sur l&apos;appareil. Le client
        scanne le QR pour suivre l&apos;avancement.
      </p>
    </div>
  );
}
