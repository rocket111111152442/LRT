import { NextResponse } from "next/server";
import { getCurrentAdmin, getImpersonation } from "@/lib/auth";

// Indique au client admin s'il s'agit d'une prise en main par un modérateur,
// afin d'afficher le bandeau « Mode support ».
export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ impersonating: false }, { status: 401 });
  }

  const impersonation = await getImpersonation();
  if (!impersonation) return NextResponse.json({ impersonating: false });
  return NextResponse.json({
    impersonating: true,
    companyName: impersonation.companyName,
  });
}
