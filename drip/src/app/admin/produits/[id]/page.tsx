import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import {
  ProductAdminForm,
  ProductImageForm,
} from "@/components/admin/AdminForms";
import {
  deleteProductImageAction,
  toggleProductFlagAction,
  updateVariantAction,
} from "@/app/actions/admin";

type Params = Promise<{ id: string }>;

export default async function AdminProduitPage({ params }: { params: Params }) {
  const { id } = await params;

  const data = await safeQuery(
    async () => {
      const [product, categories] = await Promise.all([
        prisma.product.findUnique({
          where: { id },
          include: {
            images: { orderBy: { position: "asc" } },
            variants: { orderBy: { position: "asc" } },
          },
        }),
        prisma.category.findMany({ orderBy: { position: "asc" } }),
      ]);

      return { product, categories };
    },
    { product: null, categories: [] },
    "fiche produit admin",
  );

  if (!data.product) notFound();

  const { product, categories } = data;

  return (
    <div className="space-y-14">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <Link href="/admin/produits" className="label link-sweep">
            ← Tous les produits
          </Link>
          <h1 className="display-xl mt-5 max-w-[18ch]">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`tag ${product.active ? "tag-solid" : ""}`}>
              {product.active ? "En ligne" : "Hors ligne"}
            </span>
            {product.printfulProductId && (
              <span className="tag">Printful #{product.printfulProductId}</span>
            )}
            {product.active && (
              <Link href={`/produit/${product.slug}`} className="label-sm link-sweep">
                Voir sur la boutique →
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <form action={toggleProductFlagAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="flag" value="featured" />
            <button type="submit" className="btn btn-outline btn-sm">
              {product.featured ? "Retirer de l'accueil" : "Mettre en avant"}
            </button>
          </form>

          <form action={toggleProductFlagAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="flag" value="active" />
            <button type="submit" className="btn btn-sm">
              {product.active ? "Retirer de la vente" : "Publier"}
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <section>
          <h2 className="label mb-7 text-[color:var(--color-smoke)]">Fiche produit</h2>
          <ProductAdminForm
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              subtitle: product.subtitle,
              description: product.description,
              composition: product.composition,
              badge: product.badge,
              basePrice: product.basePrice,
              compareAtPrice: product.compareAtPrice,
              categoryId: product.categoryId,
              position: product.position,
              seoTitle: product.seoTitle,
              seoDescription: product.seoDescription,
            }}
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
          />
        </section>

        <div className="space-y-14">
          <section>
            <h2 className="label mb-5 text-[color:var(--color-smoke)]">
              Visuels ({product.images.length})
            </h2>

            {product.images.length > 0 && (
              <div className="mb-7 grid grid-cols-3 gap-3">
                {product.images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--color-paper-pure)]">
                      <Image
                        src={image.url}
                        alt={image.alt ?? ""}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>

                    <form action={deleteProductImageAction}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <button
                        type="submit"
                        className="label-sm mt-2 w-full text-center text-[color:var(--color-smoke)] link-sweep"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            <ProductImageForm productId={product.id} />
          </section>

          <section className="hairline pt-10">
            <h2 className="label mb-5 text-[color:var(--color-smoke)]">
              Variantes ({product.variants.length})
            </h2>

            {product.variants.length === 0 ? (
              <p className="text-sm text-[color:var(--color-smoke)]">
                Aucune variante. Elles sont créées automatiquement par la
                synchronisation Printful.
              </p>
            ) : (
              <div className="space-y-px">
                {product.variants.map((variant) => (
                  <form
                    key={variant.id}
                    action={updateVariantAction}
                    className="flex flex-wrap items-center gap-3 border-t border-[color:var(--color-hairline)] py-3"
                  >
                    <input type="hidden" name="variantId" value={variant.id} />

                    <div className="min-w-[120px] flex-1">
                      <p className="text-sm">{variant.name}</p>
                      <p className="label-sm mt-1 text-[color:var(--color-smoke)]">
                        {variant.sku ?? "sans SKU"}
                      </p>
                    </div>

                    <label className="flex items-center gap-2">
                      <span className="sr-only">Prix de {variant.name}</span>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={(variant.price / 100).toFixed(2)}
                        className="field !w-24 !py-2 text-sm"
                      />
                      <span className="label-sm">€</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        name="available"
                        type="checkbox"
                        defaultChecked={variant.available}
                        className="h-4 w-4 appearance-none border border-[color:var(--color-hairline)] checked:border-[color:var(--color-ink)] checked:bg-[color:var(--color-ink)]"
                      />
                      <span className="label-sm">En vente</span>
                    </label>

                    <button type="submit" className="label-sm link-sweep">
                      OK
                    </button>
                  </form>
                ))}
              </div>
            )}

            <p className="label-sm mt-6 text-[color:var(--color-smoke)]">
              Prix d&apos;appel affiché en boutique : {formatPrice(product.basePrice)}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
