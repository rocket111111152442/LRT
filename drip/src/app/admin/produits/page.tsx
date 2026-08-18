import Link from "next/link";
import Image from "next/image";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { toggleProductFlagAction } from "@/app/actions/admin";
import { PrintifySyncButton, CategoryForm } from "@/components/admin/AdminForms";
import { listPrintifyShops, printifyEnabled } from "@/lib/printify";
import { PrintifyShopPicker, type ShopChoice } from "@/components/admin/PrintifyShopPicker";
import { PRINTIFY_SHOP_KEY, readSetting } from "@/lib/settings";
import { countEncodedProducts } from "@/lib/repair";
import { RepairTextsButton } from "@/components/admin/RepairTextsButton";

export default async function AdminProduitsPage() {
  const data = await safeQuery(
    async () => {
      const [products, categories] = await Promise.all([
        prisma.product.findMany({
          orderBy: [{ active: "desc" }, { position: "asc" }, { createdAt: "desc" }],
          include: {
            images: { orderBy: { position: "asc" }, take: 1 },
            category: { select: { name: true } },
            _count: { select: { variants: true, reviews: true } },
          },
        }),
        prisma.category.findMany({ orderBy: { position: "asc" } }),
      ]);

      return { products, categories };
    },
    { products: [], categories: [] },
    "catalogue admin",
  );

  // La liste des boutiques n'a de sens que si Printify répond ; une panne de
  // leur côté ne doit pas empêcher d'administrer le catalogue.
  let shops: ShopChoice[] = [];

  if (printifyEnabled()) {
    try {
      shops = (await listPrintifyShops()).map((shop) => ({
        id: String(shop.id),
        title: shop.title,
        salesChannel: shop.sales_channel,
      }));
    } catch (error) {
      console.error("[admin] boutiques Printify injoignables :", error);
    }
  }

  const textesAReparer = await countEncodedProducts();
  const reglage = await readSetting(PRINTIFY_SHOP_KEY);
  const baseAJour = reglage !== undefined;
  const selectionnee = process.env.PRINTIFY_SHOP_ID ?? reglage ?? null;

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 text-[color:var(--color-smoke)]">(Catalogue)</p>
          <h1 className="display-xl">Produits</h1>
          <p className="mt-3 text-sm text-[color:var(--color-smoke)]">
            {data.products.length} pièce{data.products.length > 1 ? "s" : ""} —{" "}
            {data.products.filter((product) => product.active).length} en ligne
          </p>
        </div>

        <PrintifySyncButton />
      </header>

      {!printifyEnabled() && (
        <p className="border border-[color:var(--color-hairline)] p-5 text-sm leading-relaxed">
          Printify n&apos;est pas connecté. Ajoutez{" "}
          <code className="font-mono text-xs">PRINTIFY_API_KEY</code> dans les
          variables d&apos;environnement pour importer automatiquement votre
          catalogue, ses variantes et ses mockups.
        </p>
      )}

      <RepairTextsButton nombre={textesAReparer} />

      {printifyEnabled() && shops.length > 0 && (
        <PrintifyShopPicker
          shops={shops}
          selectionnee={selectionnee}
          fixeeParEnvironnement={Boolean(process.env.PRINTIFY_SHOP_ID)}
          baseAJour={baseAJour}
        />
      )}

      {data.products.length === 0 ? (
        <div className="hairline hairline-b py-16">
          <p className="display-lg mb-4">Catalogue vide</p>
          <p className="max-w-[56ch] text-sm text-[color:var(--color-smoke)]">
            Lancez la synchronisation Printify pour importer vos produits. Ils
            arrivent hors ligne : vous rédigez la fiche, puis vous publiez.
          </p>
        </div>
      ) : (
        <div className="hairline">
          {data.products.map((product) => (
            <article
              key={product.id}
              className="hairline-b flex flex-wrap items-center gap-5 py-4"
            >
              <div className="relative aspect-4/5 w-[54px] shrink-0 overflow-hidden bg-[color:var(--color-paper-pure)]">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt=""
                    fill
                    sizes="54px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
                    <span className="display text-sm opacity-30">NB</span>
                  </span>
                )}
              </div>

              <div className="min-w-[200px] flex-1">
                <Link
                  href={`/admin/produits/${product.id}`}
                  className="text-sm font-medium link-underline"
                >
                  {product.name}
                </Link>
                <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                  {product.category?.name ?? "Sans rayon"} — {product._count.variants} variante(s)
                  {product._count.reviews > 0 && ` — ${product._count.reviews} avis`}
                  {product.podProductId && " — Printify"}
                </p>
              </div>

              <span className="font-mono text-sm">{formatPrice(product.basePrice)}</span>

              <div className="flex items-center gap-3">
                <form action={toggleProductFlagAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="flag" value="featured" />
                  <button
                    type="submit"
                    className={`tag ${product.featured ? "tag-solid" : ""}`}
                    title="Mettre en avant sur l'accueil"
                  >
                    Mise en avant
                  </button>
                </form>

                <form action={toggleProductFlagAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="flag" value="active" />
                  <button type="submit" className={`tag ${product.active ? "tag-solid" : ""}`}>
                    {product.active ? "En ligne" : "Hors ligne"}
                  </button>
                </form>

                <Link href={`/admin/produits/${product.id}`} className="label-sm link-sweep">
                  Éditer →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="hairline pt-10">
        <h2 className="display-lg mb-3">Rayons</h2>
        <p className="mb-8 max-w-[56ch] text-sm text-[color:var(--color-smoke)]">
          Les rayons servent à filtrer la boutique et apparaissent sur la page
          d&apos;accueil.
        </p>

        {data.categories.length > 0 && (
          <ul className="mb-10 flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <li key={category.id} className="tag">
                {category.name}
              </li>
            ))}
          </ul>
        )}

        <div className="max-w-xl">
          <CategoryForm />
        </div>
      </section>
    </div>
  );
}
