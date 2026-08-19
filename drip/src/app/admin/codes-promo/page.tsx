import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { toggleCouponAction } from "@/app/actions/admin";
import { CouponForm } from "@/components/admin/AdminForms";
import { ProgrammeForm } from "@/components/admin/ProgrammeForm";
import { lireProgramme } from "@/lib/programme";

export default async function AdminCodesPromoPage() {
  const coupons = await safeQuery(
    () => prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    [],
    "codes promo",
  );

  const programme = await lireProgramme();

  return (
    <div className="space-y-14">
      <header>
        <p className="label mb-4 text-[color:var(--color-smoke)]">(Promotions)</p>
        <h1 className="display-xl">Codes promo</h1>
      </header>

      <section className="border border-[color:var(--color-hairline)] p-5">
        <p className="label mb-3">Programme « portez-le, publiez-le »</p>
        <p className="mb-6 max-w-[62ch] text-sm leading-relaxed">
          Un client publie une photo de sa pièce en vous mentionnant, vous lui
          envoyez un code. La page publique est à l&apos;adresse{" "}
          <code className="font-mono text-xs">/programme-createurs</code> ; ce
          bloc en règle le contenu. Créez ensuite le code correspondant
          ci-dessous — « livraison offerte » y est disponible.
        </p>

        <ProgrammeForm
          actif={programme.actif}
          recompense={programme.recompense}
          delai={programme.delai}
        />
      </section>

      {coupons.length > 0 && (
        <section className="hairline">
          {coupons.map((coupon) => {
            const expired = coupon.expiresAt ? coupon.expiresAt < new Date() : false;
            const exhausted =
              coupon.maxUses !== null && coupon.uses >= coupon.maxUses;

            return (
              <article
                key={coupon.id}
                className="hairline-b flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-[140px]">
                  <p className="font-mono text-sm">{coupon.code}</p>
                  <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                    {coupon.type === "FREE_SHIPPING"
                      ? "Livraison offerte"
                      : coupon.type === "PERCENT"
                        ? `−${coupon.value} %`
                        : `−${formatPrice(coupon.value)}`}
                    {coupon.minSubtotal > 0 && ` dès ${formatPrice(coupon.minSubtotal)}`}
                  </p>
                </div>

                <span className="label-sm text-[color:var(--color-smoke)]">
                  {coupon.uses} utilisation(s)
                  {coupon.maxUses !== null && ` / ${coupon.maxUses}`}
                </span>

                <span className="label-sm text-[color:var(--color-smoke)]">
                  {coupon.expiresAt
                    ? `Expire le ${coupon.expiresAt.toLocaleDateString("fr-FR")}`
                    : "Sans expiration"}
                </span>

                {(expired || exhausted) && (
                  <span className="tag">{expired ? "Expiré" : "Épuisé"}</span>
                )}

                <form action={toggleCouponAction}>
                  <input type="hidden" name="couponId" value={coupon.id} />
                  <button type="submit" className={`tag ${coupon.active ? "tag-solid" : ""}`}>
                    {coupon.active ? "Actif" : "Inactif"}
                  </button>
                </form>
              </article>
            );
          })}
        </section>
      )}

      <section className="hairline pt-10">
        <h2 className="display-lg mb-3">Nouveau code</h2>
        <p className="mb-8 max-w-[56ch] text-sm text-[color:var(--color-smoke)]">
          La remise est appliquée sur le sous-total, avant les frais de port, et
          transmise telle quelle à Stripe au moment du paiement.
        </p>

        <div className="max-w-2xl">
          <CouponForm />
        </div>
      </section>
    </div>
  );
}
