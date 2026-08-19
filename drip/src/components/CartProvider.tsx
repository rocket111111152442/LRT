"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { CartView } from "@/lib/cart";

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
    options?: { openDrawer?: boolean },
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

      if (!response.ok) return;

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
      options?: { openDrawer?: boolean },
    ) => {
      // Ouverture immédiate du tiroir : le retour visuel ne doit pas attendre
      // l'aller-retour réseau. « Acheter maintenant » la désactive : le client
      // part vers la caisse, lui montrer le panier au passage n'a pas de sens.
      const openDrawer = options?.openDrawer ?? true;

      if (openDrawer) {
        setIsOpen(true);
        if (productName) setLastAdded(productName);
      }

      await send({ action: "add", variantId, quantity });

      if (openDrawer) {
        startTransition(() => setLastAdded(productName ?? null));
      }
    },
    [send],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      // Mise à jour optimiste des quantités pour un panier réactif.
      setCart((current) => {
        const lines = current.lines
          .map((line) =>
            line.id === itemId
              ? { ...line, quantity, lineTotal: line.unitPrice * quantity }
              : line,
          )
          .filter((line) => line.quantity > 0);

        const subtotal = lines
          .filter((line) => line.available)
          .reduce((sum, line) => sum + line.lineTotal, 0);

        return {
          ...current,
          lines,
          count: lines.reduce((sum, line) => sum + line.quantity, 0),
          subtotal,
        };
      });

      await send({ action: "set", itemId, quantity });
    },
    [send],
  );

  const remove = useCallback(
    async (itemId: string) => {
      setCart((current) => {
        const lines = current.lines.filter((line) => line.id !== itemId);
        return {
          ...current,
          lines,
          count: lines.reduce((sum, line) => sum + line.quantity, 0),
          subtotal: lines
            .filter((line) => line.available)
            .reduce((sum, line) => sum + line.lineTotal, 0),
        };
      });

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
