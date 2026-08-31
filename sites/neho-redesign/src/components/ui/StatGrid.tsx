import { Counter } from "@/components/animation/Counter";
import { DemoBadge } from "@/components/ui/Badge";

export function StatGrid({
  items,
  demoLabel,
  tone = "light",
}: {
  items: { value: string; label: string; verified: boolean }[];
  demoLabel: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="text-center sm:text-left">
          <p className={`font-display text-3xl sm:text-4xl ${tone === "dark" ? "text-cream-50" : "text-ink-900"}`}>
            <Counter value={item.value} />
          </p>
          <p className={`mt-1 text-sm ${tone === "dark" ? "text-cream-50/65" : "text-ink-500"}`}>{item.label}</p>
          {!item.verified ? <DemoBadge label={demoLabel} className="mt-2" /> : null}
        </div>
      ))}
    </div>
  );
}
