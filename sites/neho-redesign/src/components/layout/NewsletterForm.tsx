"use client";

import { useId, useState } from "react";

export function NewsletterForm({ placeholder, cta }: { placeholder: string; cta: string }) {
  const id = useId();
  const [state, setState] = useState<"idle" | "submitted">("idle");

  return (
    <form
      className="flex w-full max-w-sm gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setState("submitted");
      }}
    >
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type="email"
        required
        placeholder={placeholder}
        disabled={state === "submitted"}
        className="h-11 flex-1 rounded-full border border-cream-50/25 bg-transparent px-4 text-sm text-cream-50 placeholder:text-cream-50/45 focus-visible:border-ivy-400 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={state === "submitted"}
        className="h-11 shrink-0 rounded-full bg-ivy-500 px-5 text-sm font-medium text-night-950 hover:bg-ivy-400 disabled:opacity-70"
      >
        {state === "submitted" ? "✓" : cta}
      </button>
    </form>
  );
}
