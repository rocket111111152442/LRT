"use client";

import { ArrowDown, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function useGuideTask(step: number) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("guideTask") === String(step);

  function complete() {
    router.push(`/admin?guideResume=${step + 1}`);
  }

  return { active, complete };
}

export function GuideTaskHint({
  active,
  children,
}: {
  active: boolean;
  children: string;
}) {
  if (!active) return null;

  return (
    <div className="relative mb-3 max-w-sm rounded-xl border border-sky-300 bg-sky-950 px-4 py-3 text-left text-sm text-white shadow-xl shadow-sky-950/20">
      <div className="flex items-start gap-3">
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-emerald-400"
        />
        <div>
          <p className="font-semibold text-sky-200">Guide de prise en main</p>
          <p className="mt-1 leading-5 text-white">{children}</p>
        </div>
      </div>
      <span className="absolute -bottom-5 right-8 grid size-7 place-items-center rounded-full bg-sky-500 text-slate-950 shadow-md">
        <ArrowDown aria-hidden="true" className="size-4" />
      </span>
    </div>
  );
}

