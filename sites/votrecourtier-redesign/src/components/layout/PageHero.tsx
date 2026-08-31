import { Container } from "@/components/ui/Container";
import { ArchitecturalScene, type SceneVariant } from "@/components/illustrations/ArchitecturalScene";

export function PageHero({
  eyebrow,
  title,
  intro,
  scene = "hero",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  scene?: SceneVariant;
}) {
  return (
    <section className="relative overflow-hidden bg-pine pb-16 pt-40 text-paper sm:pb-20 sm:pt-48">
      <div className="absolute inset-0 opacity-30">
        <ArchitecturalScene variant={scene} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,33,27,0.35)_0%,rgba(22,33,27,0.85)_100%)]" />
      <Container className="relative">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-clay-soft">{eyebrow}</p>
        <h1 className="mt-5 max-w-2xl text-balance font-serif text-[2.3rem] leading-[1.1] sm:text-[3rem]">{title}</h1>
        {intro ? <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-paper/75">{intro}</p> : null}
      </Container>
    </section>
  );
}
