import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireCurrentUser();
  const { id } = await params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || document.userId !== user.id) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(document.data), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.filename)}"`,
      "Content-Length": String(document.size),
    },
  });
}
