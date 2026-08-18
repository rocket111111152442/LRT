import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { ChangePasswordForm, ProfileForm } from "@/components/PasswordForms";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

export default async function ParametresPage() {
  const user = await requireUser("/compte/parametres");

  const profile = await safeQuery(
    () =>
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          acceptsMarketing: true,
          createdAt: true,
        },
      }),
    null,
    "profil",
  );

  return (
    <div className="space-y-16">
      <section>
        <h2 className="display-lg mb-8">Mes informations</h2>
        <div className="max-w-md">
          <ProfileForm
            firstName={profile?.firstName ?? ""}
            lastName={profile?.lastName ?? ""}
            phone={profile?.phone ?? ""}
            acceptsMarketing={profile?.acceptsMarketing ?? false}
          />
        </div>
      </section>

      <section className="hairline pt-12">
        <h2 className="display-lg mb-8">Mot de passe</h2>
        <div className="max-w-md">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="hairline pt-12">
        <h2 className="display-lg mb-6">Mes données</h2>
        <p className="mb-4 max-w-[58ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
          Conformément au RGPD, vous pouvez demander à tout moment une copie de
          vos données personnelles, leur rectification ou la suppression de votre
          compte. Nous traitons la demande sous 30 jours.
        </p>
        <a href={`mailto:${SHOP.email}?subject=Demande%20RGPD`} className="btn btn-outline btn-sm">
          Faire une demande
        </a>

        {profile?.createdAt && (
          <p className="label-sm mt-8 text-[color:var(--color-smoke)]">
            Compte créé le {profile.createdAt.toLocaleDateString("fr-FR")}
          </p>
        )}
      </section>
    </div>
  );
}
