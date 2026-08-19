"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { CartLine, CartView } from "@/lib/cart";
import { MAX_PAR_LIGNE, shippingFor } from "@/lib/shop";

/** Ce qu'il faut pour dessiner une ligne avant la réponse du serveur. */
export type ApercuLigne = {
  variantName: string;
  color: string | null;
  size: string | null;
  unitPrice: number;
  product: { id: string; slug: string; name: string; imageUrl: string | null };
};

type CartContextValue = {
  cart: CartView;
  isOpen: boolean;
  isBusy: boolean;
  lastAdded: string | null;
  open: () => void;
  close: () => void;
  add: (
    variantId: string,
    quantity?: number,
    productName?: string,
    options?: { openDrawer?: boolean; apercu?: ApercuLigne },
  ) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartAction =
  | { action: "add"; variantId: string; quantity: number }
  | { action: "set"; itemId: string; quantity: number }
  | { action: "remove"; itemId: string };

/**
 * Recalcule les totaux d'un panier modifié côté navigateur.
 *
 * Les mises à jour optimistes ne touchaient que le sous-total : le port et le
 * total restaient sur leur ancienne valeur jusqu'à la réponse du serveur, et
 * le récapitulatif se contredisait pendant une seconde.
 */
function recalculer(cart: CartView, lines: CartLine[]): CartView {
  const subtotal = lines
    .filter((line) => line.available)
    .reduce((somme, line) => somme + line.lineTotal, 0);
  const shipping = shippingFor(subtotal);

  return {
    ...cart,
    lines,
    count: lines.reduce((somme, line) => somme + line.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartView;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartView>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [inFlight, setInFlight] = useState(0);

  const send = useCallback(async (payload: CartAction) => {
    setInFlight((count) => count + 1);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Une action refusée doit défaire l'affichage optimiste, sinon le
        // panier montre durablement quelque chose que le serveur ignore.
        const frais = await fetch("/api/cart", { cache: "no-store" });
        if (frais.ok) {
          const data = (await frais.json()) as { cart: CartView };
          setCart(data.cart);
        }
        return;
      }

      const data = (await response.json()) as { cart: CartView };
      setCart(data.cart);
    } catch {
      // Réseau indisponible : on garde l'état précédent plutôt que de vider le
      // panier à l'écran.
    } finally {
      setInFlight((count) => Math.max(0, count - 1));
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { cart: CartView };
      setCart(data.cart);
    } catch {
      /* silencieux */
    }
  }, []);

  const add = useCallback(
    async (
      variantId: string,
      quantity = 1,
      productName?: string,
      options?: { openDrawer?: boolean; apercu?: ApercuLigne },
    ) => {
      // Ouverture immédiate du tiroir : le retour visuel ne doit pas attendre
      // l'aller-retour réseau. « Acheter maintenant » la désactive : le client
      // part vers le panier, lui montrer le tiroir au passage n'a pas de sens.
      const openDrawer = options?.openDrawer ?? true;
      const apercu = options?.apercu;

      if (openDrawer) {
        setIsOpen(true);
        if (productName) setLastAdded(productName);
      }

      // La pièce apparaît tout de suite dans le tiroir. Sans cela, le panier
      // s'ouvrait sur « Panier vide » puis se remplissait une seconde plus
      // tard — on croyait l'ajout raté.
      if (apercu) {
        setCart((current) => {
          const existante = current.lines.find((line) => line.variantId === variantId);

          const lines = existante
            ? current.lines.map((line) => {
                if (line.variantId !== variantId) return line;

                const quantite = Math.min(MAX_PAR_LIGNE, line.quantity + quantity);
                return { ...line, quantity: quantite, lineTotal: line.unitPrice * quantite };
              })
            : [
                ...current.lines,
                {
                  // Provisoire : le serveur renvoie le véritable identifiant.
                  id: `provisoire-${variantId}`,
                  quantity,
                  variantId,
                  variantName: apercu.variantName,
                  size: apercu.size,
                  color: apercu.color,
                  unitPrice: apercu.unitPrice,
                  lineTotal: apercu.unitPrice * quantity,
                  available: true,
                  product: apercu.product,
                },
              ];

          return recalculer(current, lines);
        });
      }

      await send({ action: "add", variantId, quantity });

      if (openDrawer) {
        startTransition(() => setLastAdded(productName ?? null));
      }
    },
    [send],
  );

  const setQuantity = useCallback(
    async (itemId: string, demande: number) => {
      // Le serveur plafonne de toute façon : sans ce même plafond ici,
      // l'affichage montrerait brièvement une quantité qu'il refuse, puis
      // reviendrait en arrière tout seul. Un « + » qui recule, c'est le genre
      // de détail qui fait douter de tout le panier.
      const quantity = Math.min(MAX_PAR_LIGNE, demande);

      setCart((current) =>
        recalculer(
          current,
          current.lines
            .map((line) =>
              line.id === itemId
                ? { ...line, quantity, lineTotal: line.unitPrice * quantity }
                : line,
            )
            .filter((line) => line.quantity > 0),
        ),
      );

      await send({ action: "set", itemId, quantity });
    },
    [send],
  );

  const remove = useCallback(
    async (itemId: string) => {
      setCart((current) =>
        recalculer(
          current,
          current.lines.filter((line) => line.id !== itemId),
        ),
      );

      await send({ action: "remove", itemId });
    },
    [send],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      isBusy: inFlight > 0 || isPending,
      lastAdded,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
      refresh,
    }),
    [cart, isOpen, inFlight, isPending, lastAdded, add, setQuantity, remove, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>.");
  }

  return context;
}
