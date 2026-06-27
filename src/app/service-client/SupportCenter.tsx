"use client";

import { useState } from "react";
import { SupportForm } from "./SupportForm";
import { SupportHistory } from "./SupportHistory";

// Coordonne le formulaire d'envoi et l'historique : après chaque envoi réussi,
// l'historique se recharge automatiquement.
export function SupportCenter({ categories }: { categories?: string[] }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="grid gap-6">
      <SupportForm categories={categories} onSent={() => setReloadKey((v) => v + 1)} />
      <SupportHistory reloadKey={reloadKey} />
    </div>
  );
}
