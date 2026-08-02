import {
  PDFDocument,
  PDFFont,
  rgb,
  StandardFonts,
} from "pdf-lib";

export type InvoicePdfData = {
  ticket: string;
  invoiceDate: string;
  shopName: string;
  shopLines: string[];
  clientName: string;
  clientContact: string;
  clientAddress: string;
  device: string;
  imei: string;
  serialNumber: string;
  issueDescription: string;
  total: string;
  partsCost: string;
  deposit: string;
  paid: string;
  remaining: string;
  paymentStatus: string;
  warrantyUntil: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function safeText(value: string, font: PDFFont) {
  return Array.from(value).map((character) => {
    if (character === "\n" || character === "\r" || character === "\t") {
      return character;
    }

    try {
      font.encodeText(character);
      return character;
    } catch {
      return "?";
    }
  }).join("");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const paragraphs = safeText(text || "-", font).split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let line = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${line} ${word}`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }

  return lines;
}

export async function createInvoicePdf(data: InvoicePdfData) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ink = rgb(0.06, 0.09, 0.16);
  const muted = rgb(0.35, 0.42, 0.52);
  const blue = rgb(0.02, 0.58, 0.82);
  const lineColor = rgb(0.86, 0.89, 0.93);

  function ensureSpace(height: number) {
    if (y - height >= MARGIN) return;
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function drawLines(
    text: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      maxWidth?: number;
      lineHeight?: number;
      gapAfter?: number;
    } = {},
  ) {
    const font = options.font ?? regular;
    const size = options.size ?? 10;
    const color = options.color ?? ink;
    const maxWidth = options.maxWidth ?? CONTENT_WIDTH;
    const lineHeight = options.lineHeight ?? size * 1.35;
    const lines = wrapText(text, font, size, maxWidth);
    ensureSpace(lines.length * lineHeight + (options.gapAfter ?? 0));

    for (const line of lines) {
      page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= lineHeight;
    }
    y -= options.gapAfter ?? 0;
  }

  function divider(gap = 16) {
    ensureSpace(gap * 2);
    y -= gap;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: lineColor,
    });
    y -= gap;
  }

  function field(label: string, value: string) {
    drawLines(label.toUpperCase(), {
      font: bold,
      size: 8,
      color: muted,
      lineHeight: 10,
      gapAfter: 2,
    });
    drawLines(value || "-", { size: 10.5, lineHeight: 14, gapAfter: 10 });
  }

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 12,
    width: PAGE_WIDTH,
    height: 12,
    color: blue,
  });

  drawLines(data.shopName || "Atelier", {
    font: bold,
    size: 16,
    lineHeight: 20,
    gapAfter: 2,
  });
  for (const line of data.shopLines.filter(Boolean)) {
    drawLines(line, { size: 9.5, color: muted, lineHeight: 12 });
  }

  y -= 20;
  drawLines("FACTURE", { font: bold, size: 10, color: blue, gapAfter: 8 });
  drawLines(data.ticket, { font: bold, size: 26, lineHeight: 30, gapAfter: 2 });
  drawLines(`Date : ${data.invoiceDate}`, { size: 10, color: muted });
  divider();

  field("Client", data.clientName);
  field("Contact", data.clientContact);
  field("Adresse client", data.clientAddress);
  divider(10);

  field("Appareil", data.device);
  field("IMEI", data.imei);
  field("Numero de serie", data.serialNumber);
  field("Intervention", data.issueDescription);
  divider(10);

  const rows = [
    ["Reparation", data.total],
    ["Cout pieces interne", data.partsCost],
    ["Acompte", data.deposit],
    ["Deja paye", data.paid],
    ["Reste a payer", data.remaining],
  ];

  ensureSpace(rows.length * 28 + 30);
  page.drawRectangle({
    x: MARGIN,
    y: y - 22,
    width: CONTENT_WIDTH,
    height: 26,
    color: rgb(0.94, 0.96, 0.98),
  });
  page.drawText("DETAIL", { x: MARGIN + 10, y: y - 13, size: 9, font: bold, color: muted });
  page.drawText("MONTANT", {
    x: PAGE_WIDTH - MARGIN - 70,
    y: y - 13,
    size: 9,
    font: bold,
    color: muted,
  });
  y -= 30;

  rows.forEach(([label, amount], index) => {
    const isTotal = index === rows.length - 1;
    if (isTotal) {
      page.drawRectangle({
        x: MARGIN,
        y: y - 17,
        width: CONTENT_WIDTH,
        height: 25,
        color: rgb(0.94, 0.98, 1),
      });
    }
    page.drawText(safeText(label, regular), {
      x: MARGIN + 10,
      y: y - 9,
      size: 10,
      font: isTotal ? bold : regular,
      color: ink,
    });
    const safeAmount = safeText(amount, isTotal ? bold : regular);
    const amountFont = isTotal ? bold : regular;
    page.drawText(safeAmount, {
      x: PAGE_WIDTH - MARGIN - 10 - amountFont.widthOfTextAtSize(safeAmount, 10),
      y: y - 9,
      size: 10,
      font: amountFont,
      color: ink,
    });
    y -= 27;
  });

  y -= 12;
  field("Statut du paiement", data.paymentStatus);
  field("Fin de garantie", data.warrantyUntil);

  const pages = document.getPages();
  pages.forEach((currentPage, index) => {
    const footer = `Qoravo - Facture ${data.ticket} - Page ${index + 1}/${pages.length}`;
    currentPage.drawText(safeText(footer, regular), {
      x: MARGIN,
      y: 24,
      size: 7.5,
      font: regular,
      color: muted,
    });
  });

  document.setTitle(`Facture ${data.ticket}`);
  document.setCreator("Qoravo");
  document.setProducer("Qoravo");
  return document.save();
}
