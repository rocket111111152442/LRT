import Stripe from "stripe";

const PREMIUM_FULL_PRICE_CENTS = 4999;

export async function restoreFullPremiumPriceForRenewals(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  if (session.metadata?.premiumDiscountFirstYearOnly !== "1") {
    return;
  }

  try {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });
    const premiumItem = subscription.items.data.find((item) => {
      const product = item.price.product;
      const productName =
        typeof product === "string" || !("name" in product)
          ? ""
          : product.name.toLowerCase();

      return (
        item.price.unit_amount !== PREMIUM_FULL_PRICE_CENTS &&
        productName.includes("compte pro") &&
        productName.includes("qoravo")
      );
    });

    if (!premiumItem) {
      return;
    }

    const product = premiumItem.price.product;
    const productId = typeof product === "string" ? product : product.id;
    const fullPrice = await stripe.prices.create({
      currency: "eur",
      product: productId,
      recurring: { interval: "year" },
      unit_amount: PREMIUM_FULL_PRICE_CENTS,
    });

    await stripe.subscriptionItems.update(premiumItem.id, {
      price: fullPrice.id,
      proration_behavior: "none",
    });
  } catch (error) {
    console.error("Premium renewal price restore failed", error);
  }
}
