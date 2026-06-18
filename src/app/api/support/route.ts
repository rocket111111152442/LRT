import { NextResponse } from "next/server";
import { sendSupportMessageEmail } from "@/lib/mail";

type SupportErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const data = {
    name: readText(body, "name"),
    email: readText(body, "email").toLowerCase(),
    subject: readText(body, "subject"),
    message: readText(body, "message"),
  };
  const errors: SupportErrors = {};

  if (data.name.length < 2) {
    errors.name = "Nom requis.";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Email invalide.";
  }

  if (data.subject.length < 3) {
    errors.subject = "Sujet requis.";
  }

  if (data.message.length < 10) {
    errors.message = "Message trop court.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const result = await sendSupportMessageEmail(data);

  if (result.skipped) {
    return NextResponse.json(
      { error: "Service client indisponible : SMTP non configure." },
      { status: 503 },
    );
  }

  if (!result.sent) {
    return NextResponse.json(
      { error: "Message impossible a envoyer pour le moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message:
      "Message envoye. Le service client peut recevoir votre demande 24h/24.",
  });
}
