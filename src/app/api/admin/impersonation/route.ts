import { NextResponse } from "next/server";
import { getImpersonation } from "@/lib/auth";

// Indique au client admin s'il s'agit d'une prise en main par un modérateur,
// afin d'afficher le bandeau « Mode support ».
export async function GET() {
  const impersonation = await getImpersonation();
  if (!impersonation) return NextResponse.json({ impersonating: false });
  return NextResponse.json({
    impersonating: true,
    companyName: impersonation.companyName,
  });
}
