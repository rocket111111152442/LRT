import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createInvoicePdf } from "@/lib/invoicePdf";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

function toCents(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatPrice(value: unknown) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(toCents(value) / 100);
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function filenamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "facture";
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const repair = await prisma.repair.findUnique({
    where: { id },
    select: {
      id: true,
      proAccountId: true,
      ticketNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      streetAddress: true,
      postalCode: true,
      city: true,
      deviceType: true,
      brand: true,
      model: true,
      imei: true,
      serialNumber: true,
      issueDescription: true,
      estimatedPriceCents: true,
      partsCostCents: true,
      paidAmountCents: true,
      depositCents: true,
      paymentStatus: true,
      warrantyUntil: true,
      createdAt: true,
    },
  });

  if (!repair || repair.proAccountId !== admin.user.proAccountId) {
    return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
  }

  const [account, settings] = await Promise.all([
    prisma.proAccount.findUnique({
      where: { id: admin.user.proAccountId },
      select: {
        companyName: true,
        publicAddress: true,
        shopAddress: true,
        shopPostalCode: true,
        shopCity: true,
        shopPhone: true,
        publicPhone: true,
        shopEmail: true,
        ownerEmail: true,
      },
    }),
    prisma.emailSettings.findUnique({
      where: { id: admin.user.proAccountId },
    }),
  ]);

  const totalCents = toCents(repair.estimatedPriceCents);
  const paidCents = toCents(repair.paidAmountCents);
  const ticket = repair.ticketNumber || repair.id;
  const shopCity = [account?.shopPostalCode, account?.shopCity]
    .filter(Boolean)
    .join(" ");

  const bytes = await createInvoicePdf({
    ticket,
    invoiceDate: formatDate(repair.createdAt),
    shopName: settings?.shopName || account?.companyName || "Atelier",
    shopLines: [
      settings?.shopAddress || account?.shopAddress || account?.publicAddress || "",
      shopCity,
      [
        settings?.shopPhone || account?.shopPhone || account?.publicPhone,
        account?.shopEmail || account?.ownerEmail,
      ].filter(Boolean).join(" - "),
      settings?.shopOpeningHours || "",
    ],
    clientName: `${repair.firstName || ""} ${repair.lastName || ""}`.trim() || "-",
    clientContact: [repair.phone, repair.email].filter(Boolean).join(" - ") || "-",
    clientAddress: [
      repair.streetAddress,
      [repair.postalCode, repair.city].filter(Boolean).join(" "),
    ].filter(Boolean).join("\n") || "-",
    device: [repair.deviceType, repair.brand, repair.model].filter(Boolean).join(" ") || "-",
    imei: repair.imei || "-",
    serialNumber: repair.serialNumber || "-",
    issueDescription: repair.issueDescription || "-",
    total: formatPrice(totalCents),
    partsCost: formatPrice(repair.partsCostCents),
    deposit: formatPrice(repair.depositCents),
    paid: formatPrice(paidCents),
    remaining: formatPrice(Math.max(totalCents - paidCents, 0)),
    paymentStatus: repair.paymentStatus || "NON_PAYE",
    warrantyUntil: formatDate(repair.warrantyUntil),
  });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${filenamePart(ticket)}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
