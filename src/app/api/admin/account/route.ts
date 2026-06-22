import { NextResponse } from "next/server";
import { clearAdminSessionCookie, getSessionUserId } from "@/lib/auth";
import { deleteProAccountAndData } from "@/lib/pro/deleteAccount";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, proAccountId: true },
  });

  if (!user?.proAccountId) {
    return NextResponse.json(
      { error: "Aucun compte a supprimer." },
      { status: 400 },
    );
  }

  const proAccount = await prisma.proAccount.findUnique({
    where: { id: user.proAccountId },
    select: { id: true, paymentStatus: true },
  });

  if (!proAccount) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  // Garde-fou : un compte abonne ne se supprime pas par ce chemin (il sert au
  // blocage de fin d'essai). Un client payant doit passer par le support.
  if (proAccount.paymentStatus === "PAID") {
    return NextResponse.json(
      { error: "Un compte abonne ne peut pas etre supprime ici." },
      { status: 400 },
    );
  }

  try {
    await deleteProAccountAndData(proAccount.id);
  } catch (error) {
    console.error("Account deletion failed", error);
    return NextResponse.json(
      { error: "Suppression impossible pour le moment." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  return response;
}
